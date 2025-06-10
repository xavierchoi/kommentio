#!/bin/bash

# 정적 파일 서버 백업 솔루션
# Vite 개발 서버가 문제가 있을 때 사용하는 대안

PROJECT_DIR="/Users/internetbasedboy/kommentio"
PORT=${1:-8080}

echo "🔧 정적 파일 서버 시작 (백업 솔루션)"
echo "📁 경로: $PROJECT_DIR"
echo "🌐 포트: $PORT"

cd "$PROJECT_DIR"

# Python 3가 있는지 확인
if command -v python3 &> /dev/null; then
    echo "✅ Python 3으로 서버 시작..."
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✅ Python 2로 서버 시작..."
    python -m SimpleHTTPServer $PORT
elif command -v node &> /dev/null; then
    echo "✅ Node.js로 서버 시작..."
    npx serve . -p $PORT
else
    echo "❌ Python 또는 Node.js를 찾을 수 없습니다"
    exit 1
fi