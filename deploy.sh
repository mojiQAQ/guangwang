#!/usr/bin/env bash
# 在生产服务器上跑这个脚本完成首次部署或后续更新.
# 用法:
#   cd /data/guangwang
#   git pull
#   ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

# 没有 .env 就基于 .env.example 起一个, 提醒用户改 IP_SALT
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[deploy] 已生成 .env, 请按需修改 HOST_PORT / IP_SALT 后重新运行"
  exit 0
fi

# 拉取最新代码 (如果本地有 commit 会保留, 冲突需要手工解决)
if [[ -d .git ]]; then
  git fetch --all --prune
  git pull --ff-only
fi

mkdir -p ./data

# build + 后台启动, 重建只动 guangwang 这一个服务
docker compose up -d --build --remove-orphans

echo
docker compose ps
echo
echo "[deploy] done. tail logs:"
echo "  docker compose logs -f guangwang"
