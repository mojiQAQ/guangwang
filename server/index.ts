// GMonkey API server
// 开发: 监听 8787, Vite dev server 通过 proxy 转发 /api/* 过来.
// 生产: 同一进程同时托管前端 dist/ 静态文件 + /api/*, 默认监听 PORT (8787).

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import {
  db,
  insertDiagnosis,
  insertContact,
  countDiagnoses,
  countContacts,
} from "./db.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// 把 IP 哈希成 16 位摘要,只用于粗略去重 / 统计.
// 加盐保证从 hash 反推不到 IP.
const SALT = process.env.IP_SALT || "gmonkey-default-salt-change-in-prod";
function ipHash(req: Request): string {
  const raw = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
  return createHash("sha256").update(raw + SALT).digest("hex").slice(0, 16);
}

// ----------- 健康检查 -----------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ----------- 提交诊断 -----------
app.post("/api/diagnoses", (req: Request, res: Response) => {
  const b = req.body ?? {};

  // 校验关键字段
  if (!b.industry || typeof b.industry !== "string") {
    return res.status(400).json({ error: "industry is required" });
  }
  if (typeof b.readiness !== "number" || !b.recommended_layer) {
    return res.status(400).json({ error: "missing computed fields" });
  }

  try {
    const info = insertDiagnosis.run({
      industry: b.industry,
      size: b.size ?? null,
      role: b.role ?? null,
      data_maturity: b.data ?? null,
      it_capability: b.it ?? null,
      ai_adoption: b.ai ?? null,
      goal: b.goal ?? null,
      pains: JSON.stringify(b.pains ?? []),
      timeline: b.timeline ?? null,
      readiness: b.readiness,
      score_data: b.score_data ?? 0,
      score_it: b.score_it ?? 0,
      score_ai: b.score_ai ?? 0,
      recommended_layer: b.recommended_layer,
      scenario_codes: JSON.stringify(b.scenario_codes ?? []),
      session_id: typeof b.session_id === "string" ? b.session_id : null,
      user_agent: req.headers["user-agent"]?.toString().slice(0, 300) ?? null,
      ip_hash: ipHash(req),
    });
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    console.error("[diagnoses] insert failed:", e);
    res.status(500).json({ error: "insert failed" });
  }
});

// ----------- 提交联系表单 -----------
app.post("/api/contacts", (req: Request, res: Response) => {
  const b = req.body ?? {};
  if (!b.company || !b.name || !b.contact) {
    return res.status(400).json({ error: "company / name / contact are required" });
  }
  // 限制字段长度,防止滥用
  const trim = (v: unknown, n: number) =>
    typeof v === "string" ? v.slice(0, n) : null;

  try {
    const info = insertContact.run({
      type: trim(b.type, 60),
      company: trim(b.company, 120),
      name: trim(b.name, 60),
      role: trim(b.role, 60),
      contact: trim(b.contact, 120),
      note: trim(b.note, 2000),
      session_id: trim(b.session_id, 64),
      user_agent: req.headers["user-agent"]?.toString().slice(0, 300) ?? null,
      ip_hash: ipHash(req),
    });
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    console.error("[contacts] insert failed:", e);
    res.status(500).json({ error: "insert failed" });
  }
});

// ----------- 已服务企业数 -----------
// 规则: 从 SERVED_ANCHOR_TIME 这一刻起,以"每小时 +1"的速率自然增长.
// 同时叠加 contacts 的真实数(每条真实联系 +1),让真实业务量也反映进来.
// 锚点 = 部署起跑时的"99 家",随时间线性爬升,不依赖访问触发.
const SERVED_ANCHOR_TIME = new Date("2026-05-12T18:30:00+08:00").getTime();
const SERVED_ANCHOR_VALUE = 99;
const MS_PER_HOUR = 3_600_000;

function computeServed(now: number, realContacts: number): number {
  const hoursSince = Math.max(0, Math.floor((now - SERVED_ANCHOR_TIME) / MS_PER_HOUR));
  return SERVED_ANCHOR_VALUE + hoursSince + realContacts;
}

app.get("/api/stats/served", (_req, res) => {
  const c = (countContacts.get() as { c: number }).c;
  const d = (countDiagnoses.get() as { c: number }).c;
  res.json({
    served: computeServed(Date.now(), c),
    contacts: c,
    diagnoses: d,
  });
});

// ----------- 简单后台 (open admin, no auth) -----------
// 仅本地开发用,看看入库情况
app.get("/api/admin/diagnoses", (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM diagnoses ORDER BY id DESC LIMIT 50`)
    .all();
  res.json(rows);
});
app.get("/api/admin/contacts", (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM contacts ORDER BY id DESC LIMIT 50`)
    .all();
  res.json(rows);
});

// 关联视图: 联系表单 + 同一 session 下的诊断,把"做过诊断的 lead"标出来
// 每行 = 一条 contacts,可能带上 0 / 1 / N 条 diagnoses (取最近的一条)
app.get("/api/admin/leads", (_req, res) => {
  const rows = db.prepare(`
    SELECT
      c.id              AS contact_id,
      c.created_at      AS contact_at,
      c.type,
      c.company,
      c.name,
      c.role,
      c.contact,
      c.note,
      c.status,
      c.session_id,
      d.id              AS diagnosis_id,
      d.created_at      AS diagnosis_at,
      d.industry,
      d.size,
      d.role            AS diagnosis_role,
      d.data_maturity,
      d.it_capability,
      d.ai_adoption,
      d.goal,
      d.pains,
      d.timeline,
      d.readiness,
      d.recommended_layer,
      d.scenario_codes
    FROM contacts c
    LEFT JOIN diagnoses d
      ON d.session_id = c.session_id
      AND d.session_id IS NOT NULL
      AND d.session_id != ''
      AND d.id = (
        SELECT id FROM diagnoses d2
        WHERE d2.session_id = c.session_id
        ORDER BY d2.id DESC LIMIT 1
      )
    ORDER BY c.id DESC
    LIMIT 100
  `).all();
  res.json(rows);
});

// 给定 session_id, 拿到该会话所有诊断 + 联系记录(给运营/销售跟进用)
app.get("/api/admin/session/:sid", (req, res) => {
  const sid = req.params.sid;
  if (!sid) return res.status(400).json({ error: "session id required" });
  const diagnoses = db
    .prepare(`SELECT * FROM diagnoses WHERE session_id = ? ORDER BY id DESC`)
    .all(sid);
  const contacts = db
    .prepare(`SELECT * FROM contacts WHERE session_id = ? ORDER BY id DESC`)
    .all(sid);
  res.json({ session_id: sid, diagnoses, contacts });
});

// ----------- 生产环境静态文件托管 -----------
// 镜像里 /app/dist 是 vite build 产物. 容器启动时只跑这一个进程,
// 让 Express 同时提供 SPA 静态文件 + /api/*, 不再依赖 vite dev server.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATIC_DIR = process.env.STATIC_DIR
  ? resolve(process.env.STATIC_DIR)
  : resolve(__dirname, "../dist");

if (existsSync(STATIC_DIR)) {
  console.log(`[static] serving SPA from ${STATIC_DIR}`);
  // index.html 不走强缓存,其余资源(带 hash 文件名)可以长缓存
  app.use(
    express.static(STATIC_DIR, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // SPA fallback: 非 /api/* 的请求一律回退到 index.html, 交给 React Router.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/")) return next();
    if (req.method !== "GET") return next();
    res.sendFile(join(STATIC_DIR, "index.html"));
  });
} else {
  console.log(`[static] no dist/ found at ${STATIC_DIR}, running API-only`);
}

app.listen(PORT, HOST, () => {
  console.log(`[api] listening on http://${HOST}:${PORT}`);
});
