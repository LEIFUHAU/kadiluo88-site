#!/usr/bin/env bash
# 卡蒂洛香水站一键发布脚本
# 用法: ./deploy.sh 这次改动的简短说明（说明可省略）
set -e
cd "$(dirname "$0")"

git add -A

if git diff --cached --quiet; then
  echo "✅ 本地没有新改动，无需提交。"
  exit 0
fi

MSG="${1:-更新站点内容 $(date '+%Y-%m-%d %H:%M')}"
git commit -m "$MSG"
git push

echo ""
echo "✅ 已推送到 GitHub。最后在 Workbench 服务器执行一条命令上线："
echo "   cd /var/www/html && git pull"
