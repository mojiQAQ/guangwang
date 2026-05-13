# syntax=docker/dockerfile:1.7

# ============================================================
# Stage 1 — 安装全部依赖并构建前端 + 编译 server
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# 安装 better-sqlite3 编译需要的系统依赖 (prebuild 偶尔会 miss)
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# 先拷 lockfile 利用层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 拷余下源码并构建 (vite build → dist/, tsc -b 校验类型)
COPY . .
RUN npm run build

# ============================================================
# Stage 2 — 运行时镜像: 只装生产依赖, 跑 tsx 直接执行 TS server
# ============================================================
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=8787 \
    HOST=0.0.0.0 \
    DB_DIR=/app/data

WORKDIR /app

# 运行时也要编译工具,因为 better-sqlite3 可能在 npm ci --omit=dev 阶段重新链 native
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ tini \
 && rm -rf /var/lib/apt/lists/*

# 只装运行需要的依赖
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
 && npm cache clean --force

# 拷贝构建产物和 server 源码 (server 走 tsx 直接执行 .ts)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 数据持久化目录,会被 docker volume 挂载覆盖
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 8787

# 用 tini 接管 PID 1, 避免僵尸进程
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npx", "tsx", "server/index.ts"]
