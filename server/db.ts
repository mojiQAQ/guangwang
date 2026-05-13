// SQLite 数据库初始化与 schema 管理
// 数据库文件存在 server/db/gmonkey.sqlite,不会被打包到前端 bundle.

import Database from "better-sqlite3";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 容器化部署时把 DB_DIR 指向挂载的 volume (例如 /app/data),
// 保证 sqlite 文件不会随容器重建丢失.
const DB_DIR = process.env.DB_DIR
  ? process.env.DB_DIR
  : join(__dirname, "db");
const DB_PATH = join(DB_DIR, "gmonkey.sqlite");

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

export const db = new Database(DB_PATH);

// WAL 模式 — 读写并发更友好,适合本地服务
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ============ Schema ============
// 用迁移风格:每次新建 / 调整 schema 都在这里加 CREATE TABLE IF NOT EXISTS
// 不需要复杂迁移框架,因为是本地单文件 DB.

db.exec(`
CREATE TABLE IF NOT EXISTS diagnoses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),

  -- 用户答案
  industry        TEXT    NOT NULL,
  size            TEXT,
  role            TEXT,
  data_maturity   TEXT,
  it_capability   TEXT,
  ai_adoption     TEXT,
  goal            TEXT,
  pains           TEXT,   -- JSON 数组,如 ["ops","knowledge"]
  timeline        TEXT,

  -- 算出来的结论(快照,方便后台不用重跑算法就能看)
  readiness       INTEGER NOT NULL,
  score_data      INTEGER NOT NULL,
  score_it        INTEGER NOT NULL,
  score_ai        INTEGER NOT NULL,
  recommended_layer TEXT  NOT NULL,
  scenario_codes  TEXT,   -- JSON 数组,推荐场景 code

  -- 弱标识(同会话内可去重,但不识别身份)
  session_id      TEXT,
  user_agent      TEXT,
  ip_hash         TEXT    -- IP 的 SHA-256 前 16 位,只用于粗去重,不能反查
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_created ON diagnoses(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnoses_industry ON diagnoses(industry);

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  type        TEXT,   -- 需求类型
  company     TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  role        TEXT,
  contact     TEXT    NOT NULL,
  note        TEXT,

  -- 关联键: 与 diagnoses.session_id 同源,用于把"做过诊断"+"留了联系"的用户串起来
  session_id  TEXT,

  user_agent  TEXT,
  ip_hash     TEXT,
  status      TEXT    NOT NULL DEFAULT 'new'  -- new / contacted / closed
);

CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_session ON diagnoses(session_id);
`);

// 迁移: 早期版本的 contacts 表没有 session_id 列,补上.
// SQLite 不支持 ALTER ... IF NOT EXISTS,所以用 PRAGMA 检查后再 ALTER.
const contactCols = db
  .prepare(`PRAGMA table_info(contacts)`)
  .all() as Array<{ name: string }>;
if (!contactCols.some((c) => c.name === "session_id")) {
  db.exec(`ALTER TABLE contacts ADD COLUMN session_id TEXT`);
  console.log("[db] migrated: contacts.session_id added");
}

// session_id 的索引必须在列确认存在之后再建(既覆盖新建表,也覆盖迁移后)
db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_session ON contacts(session_id)`);

// ============ 预备语句 ============
// better-sqlite3 是同步 API,prepare 一次后续 .run / .get / .all 都很快

export const insertDiagnosis = db.prepare(`
  INSERT INTO diagnoses (
    industry, size, role,
    data_maturity, it_capability, ai_adoption,
    goal, pains, timeline,
    readiness, score_data, score_it, score_ai,
    recommended_layer, scenario_codes,
    session_id, user_agent, ip_hash
  ) VALUES (
    @industry, @size, @role,
    @data_maturity, @it_capability, @ai_adoption,
    @goal, @pains, @timeline,
    @readiness, @score_data, @score_it, @score_ai,
    @recommended_layer, @scenario_codes,
    @session_id, @user_agent, @ip_hash
  )
`);

export const insertContact = db.prepare(`
  INSERT INTO contacts (
    type, company, name, role, contact, note,
    session_id, user_agent, ip_hash
  ) VALUES (
    @type, @company, @name, @role, @contact, @note,
    @session_id, @user_agent, @ip_hash
  )
`);

export const countDiagnoses = db.prepare(`SELECT COUNT(*) AS c FROM diagnoses`);
export const countContacts   = db.prepare(`SELECT COUNT(*) AS c FROM contacts`);

console.log(`[db] SQLite ready at ${DB_PATH}`);
