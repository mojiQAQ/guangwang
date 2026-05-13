# syntax=docker/dockerfile:1.7

# ============================================================
# Stage 1 — 安装全部依赖并构建前端 + 编译 server
# 镜像源都走国内, 否则海外拉包要 5+ 分钟
# ============================================================
FROM m.daocloud.io/docker.io/library/node:22-bookworm-slim AS builder

WORKDIR /app

# apt 换清华源
RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g; s|security.debian.org|mirrors.tuna.tsinghua.edu.cn|g' \
        /etc/apt/sources.list.d/debian.sources \
 && apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# npm 换淘宝镜像
# better-sqlite3 的 prebuild binary 走它自己的 mirror 环境变量
RUN npm config set registry https://registry.npmmirror.com
ENV BETTER_SQLITE3_BINARY_HOST_MIRROR=https://registry.npmmirror.com/-/binary/better-sqlite3

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================
# Stage 2 — 运行时镜像
# ============================================================
FROM m.daocloud.io/docker.io/library/node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=8787 \
    HOST=0.0.0.0 \
    DB_DIR=/app/data

WORKDIR /app

RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g; s|security.debian.org|mirrors.tuna.tsinghua.edu.cn|g' \
        /etc/apt/sources.list.d/debian.sources \
 && apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ tini \
 && rm -rf /var/lib/apt/lists/*

RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
 && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 8787

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npx", "tsx", "server/index.ts"]
