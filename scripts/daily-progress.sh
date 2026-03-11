#!/bin/bash

# OpenClaw Evolution Plugin - 每日推进脚本
# 用途：自动执行每日质量检查和进度追踪

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  OpenClaw Evolution Plugin 每日推进${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 日期
TODAY=$(date +"%Y-%m-%d")
DAY_OF_WEEK=$(date +"%A")

echo -e "${YELLOW}日期: ${TODAY} (${DAY_OF_WEEK})${NC}"
echo ""

# =============================================================================
# 1. 环境检查
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. 环境检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js 未安装${NC}"
    exit 1
fi

# 检查 pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm: ${PNPM_VERSION}${NC}"
else
    echo -e "${RED}✗ pnpm 未安装${NC}"
    exit 1
fi

# 检查 git
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Git 仓库${NC}"
else
    echo -e "${RED}✗ 不是 Git 仓库${NC}"
    exit 1
fi

echo ""

# =============================================================================
# 2. 依赖检查
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. 依赖检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠  node_modules 不存在，正在安装依赖...${NC}"
    pnpm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi

echo ""

# =============================================================================
# 3. 类型检查
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. 类型检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if pnpm typecheck 2>&1 | tee /tmp/typecheck.log; then
    echo -e "${GREEN}✓ 类型检查通过${NC}"
    TYPECHECK_STATUS="✅ 通过"
else
    echo -e "${RED}✗ 类型检查失败${NC}"
    TYPECHECK_STATUS="❌ 失败"
fi

echo ""

# =============================================================================
# 4. 测试
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. 测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TEST_OUTPUT=$(pnpm test 2>&1)
TEST_EXIT_CODE=$?

if echo "$TEST_OUTPUT" | tee /tmp/test.log | grep -q "Test Files.*passed"; then
    PASSED=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)')
    FAILED=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failed)' || echo "0")
    TOTAL=$((PASSED + FAILED))

    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}✓ 所有测试通过 (${PASSED}/${TOTAL})${NC}"
        TEST_STATUS="✅ ${PASSED}/${TOTAL}"
    else
        echo -e "${YELLOW}⚠  部分测试失败 (${PASSED}/${TOTAL} 通过, ${FAILED} 失败)${NC}"
        TEST_STATUS="⚠️ ${PASSED}/${TOTAL}"
    fi
else
    echo -e "${RED}✗ 测试执行失败${NC}"
    TEST_STATUS="❌ 失败"
fi

echo ""

# =============================================================================
# 5. Lint
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Lint${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Lint 通过${NC}"
    LINT_STATUS="✅ 通过"
else
    ERRORS=$(echo "$LINT_OUTPUT" | grep -oP '\d+(?= problems)' || echo "0")
    WARNINGS=$(echo "$LINT_OUTPUT" | grep -oP '\d+(?= warnings)' || echo "0")

    if echo "$LINT_OUTPUT" | grep -q "error"; then
        echo -e "${RED}✗ Lint 失败: ${ERRORS} 问题 (${WARNINGS} 警告)${NC}"
        LINT_STATUS="❌ ${ERRORS} 问题"
    else
        echo -e "${YELLOW}⚠  Lint 有警告: ${WARNINGS} 警告${NC}"
        LINT_STATUS="⚠️ ${WARNINGS} 警告"
    fi
fi

echo ""

# =============================================================================
# 6. Git 状态
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Git 状态${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠  有未提交的更改${NC}"
    git status --short
    GIT_STATUS="⚠️ 有更改"
else
    echo -e "${GREEN}✓ 工作目录干净${NC}"
    GIT_STATUS="✅ 干净"
fi

# 当前分支
BRANCH=$(git branch --show-current)
echo -e "当前分支: ${BLUE}${BRANCH}${NC}"

echo ""

# =============================================================================
# 7. 每日总结
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. 每日总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "日期: ${TODAY}"
echo -e "类型检查: ${TYPECHECK_STATUS}"
echo -e "测试: ${TEST_STATUS}"
echo -e "Lint: ${LINT_STATUS}"
echo -e "Git: ${GIT_STATUS}"

# 保存到日志文件
LOG_DIR="$PROJECT_ROOT/logs/daily-progress"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${TODAY}.log"

cat > "$LOG_FILE" << EOF
# OpenClaw Evolution Plugin - 每日进度报告

日期: ${TODAY} (${DAY_OF_WEEK})
时间: $(date +"%H:%M:%S")

## 检查结果

- 类型检查: ${TYPECHECK_STATUS}
- 测试: ${TEST_STATUS}
- Lint: ${LINT_STATUS}
- Git: ${GIT_STATUS}

## 详细输出

### 类型检查
\`\`\`
$(cat /tmp/typecheck.log)
\`\`\`

### 测试
\`\`\`
$(cat /tmp/test.log)
\`\`\`

### Lint
\`\`\`
${LINT_OUTPUT}
\`\`\`

## 下一步

[根据今日结果填写的行动项]

EOF

echo ""
echo -e "${BLUE}日志已保存到: ${LOG_FILE}${NC}"

# =============================================================================
# 8. 建议行动
# =============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. 建议行动${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ $TYPECHECK_STATUS == *"❌"* ]]; then
    echo -e "${RED}→ 修复类型检查错误${NC}"
    echo -e "  运行: ${YELLOW}pnpm typecheck${NC}"
fi

if [[ $TEST_STATUS == *"❌"* ]] || [[ $TEST_STATUS == *"⚠️"* ]]; then
    echo -e "${RED}→ 修复失败的测试${NC}"
    echo -e "  运行: ${YELLOW}pnpm test${NC}"
fi

if [[ $LINT_STATUS == *"❌"* ]] || [[ $LINT_STATUS == *"⚠️"* ]]; then
    echo -e "${YELLOW}→ 清理 Lint 警告${NC}"
    echo -e "  运行: ${YELLOW}pnpm lint${NC}"
    echo -e "  或使用: ${YELLOW}/autofix${NC}"
fi

if [[ $GIT_STATUS == *"⚠️"* ]]; then
    echo -e "${BLUE}→ 提交更改到 Git${NC}"
    echo -e "  运行: ${YELLOW}git add . && git commit -m \"progress: daily update ${TODAY}\"${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}每日检查完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
