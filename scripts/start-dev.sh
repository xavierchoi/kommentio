#!/bin/bash

# Kommentio 개발 서버 시작 스크립트 - 안정성 및 자동 복구 기능
# 사용법: ./scripts/start-dev.sh

set -e

PROJECT_DIR="/Users/internetbasedboy/kommentio"
LOG_FILE="$PROJECT_DIR/dev-server.log"
PID_FILE="$PROJECT_DIR/dev-server.pid"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 기존 서버 프로세스 정리
cleanup_existing_servers() {
    log "${YELLOW}기존 서버 프로세스 정리 중...${NC}"
    
    # Vite 서버 프로세스 종료
    pkill -f "node.*vite" 2>/dev/null || true
    
    # 포트 사용 중인 프로세스 확인 및 정리
    for port in 3000 3001 5173 24678; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log "${YELLOW}포트 $port 사용 중인 프로세스 종료${NC}"
            lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
        fi
    done
    
    # PID 파일 정리
    rm -f "$PID_FILE"
    
    sleep 2
}

# 시스템 리소스 체크
check_system_resources() {
    log "${BLUE}시스템 리소스 확인 중...${NC}"
    
    # 메모리 사용량 확인 (macOS)
    memory_pressure=$(memory_pressure | grep "System-wide memory free percentage:" | awk '{print $5}' | sed 's/%//')
    if [ "$memory_pressure" -lt 20 ]; then
        log "${RED}경고: 메모리 부족 (여유 메모리: ${memory_pressure}%)${NC}"
    fi
    
    # 디스크 공간 확인
    disk_usage=$(df -h "$PROJECT_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log "${RED}경고: 디스크 공간 부족 (사용률: ${disk_usage}%)${NC}"
    fi
}

# 캐시 정리
clean_cache() {
    log "${YELLOW}캐시 정리 중...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Vite 캐시 정리
    rm -rf node_modules/.vite
    rm -rf .vite
    
    # Node.js 캐시 정리 (오류 무시)
    npm cache clean --force 2>/dev/null || true
    
    # Temporary 파일 정리
    rm -rf /tmp/vite*
    rm -rf /var/folders/*/T/vite*
}

# 서버 상태 체크
check_server_health() {
    local port=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    return 1
}

# 서버 시작
start_server() {
    log "${GREEN}개발 서버 시작 중...${NC}"
    
    cd "$PROJECT_DIR"
    
    # Node.js 메모리 제한 증가 및 서버 시작
    NODE_OPTIONS="--max-old-space-size=8192" npm run dev > "$LOG_FILE" 2>&1 &
    
    local server_pid=$!
    echo $server_pid > "$PID_FILE"
    
    log "서버 PID: $server_pid"
    
    # 서버 시작 대기
    sleep 5
    
    # 실제 사용 중인 포트 확인
    local actual_port
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        actual_port=3000
    elif lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        actual_port=3001
    elif lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        actual_port=5173
    else
        log "${RED}서버 포트를 찾을 수 없습니다${NC}"
        return 1
    fi
    
    log "${GREEN}서버가 포트 $actual_port 에서 실행 중${NC}"
    
    # 서버 상태 확인
    if check_server_health $actual_port; then
        log "${GREEN}✅ 서버 상태 정상 - http://localhost:$actual_port${NC}"
        echo "http://localhost:$actual_port"
    else
        log "${RED}❌ 서버 상태 확인 실패${NC}"
        return 1
    fi
}

# 서버 모니터링
monitor_server() {
    log "${BLUE}서버 모니터링 시작...${NC}"
    
    if [ ! -f "$PID_FILE" ]; then
        log "${RED}PID 파일을 찾을 수 없습니다${NC}"
        return 1
    fi
    
    local server_pid=$(cat "$PID_FILE")
    local check_interval=30
    local failure_count=0
    local max_failures=3
    
    while true; do
        # 프로세스 생존 확인
        if ! kill -0 $server_pid 2>/dev/null; then
            log "${RED}서버 프로세스가 종료되었습니다 (PID: $server_pid)${NC}"
            break
        fi
        
        # 포트 확인
        local port_found=false
        for port in 3000 3001 5173; do
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                # HTTP 응답 확인
                if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
                    port_found=true
                    failure_count=0
                    break
                fi
            fi
        done
        
        if [ "$port_found" = false ]; then
            failure_count=$((failure_count + 1))
            log "${YELLOW}서버 응답 실패 ($failure_count/$max_failures)${NC}"
            
            if [ $failure_count -ge $max_failures ]; then
                log "${RED}서버가 응답하지 않습니다. 재시작 시도...${NC}"
                kill $server_pid 2>/dev/null || true
                break
            fi
        fi
        
        sleep $check_interval
    done
    
    # 자동 재시작
    log "${YELLOW}서버 재시작 중...${NC}"
    start_dev_server
}

# 메인 함수
start_dev_server() {
    log "${GREEN}🚀 Kommentio 개발 서버 시작${NC}"
    
    cleanup_existing_servers
    check_system_resources
    clean_cache
    
    if start_server; then
        echo "${GREEN}✅ 개발 서버가 성공적으로 시작되었습니다!${NC}"
        echo "${BLUE}로그 파일: $LOG_FILE${NC}"
        echo "${BLUE}모니터링을 위해 터미널을 열어두세요${NC}"
        
        # 백그라운드에서 모니터링 시작
        monitor_server &
    else
        log "${RED}❌ 서버 시작 실패${NC}"
        exit 1
    fi
}

# 스크립트 시작점
if [ "$1" = "monitor" ]; then
    monitor_server
else
    start_dev_server
fi