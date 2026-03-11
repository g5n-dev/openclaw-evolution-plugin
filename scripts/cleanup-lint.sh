#!/bin/bash

# 自动清理 ESLint 警告
# 优先级：未使用导入 > 非空断言 > any 类型

set -e

echo "🧹 开始清理 ESLint 警告..."

# 检查是否有工具
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未找到"
    exit 1
fi

# 保存当前状态
git diff > /tmp/before-cleanup.patch || true

echo ""
echo "📊 清理前统计："
pnpm lint 2>&1 | grep -E "(warning|error)" | wc -l | xargs echo "  总问题数:"

echo ""
echo "🔧 清理中..."

# 第一步：清理未使用的导入
echo "1. 清理未使用的导入..."

# 清理 tests/ 目录
find tests -name "*.ts" -type f | while read file; do
    echo "  处理: $file"
    # 移除未使用的导入（简化版本）
    # 实际项目中应该使用 eslint --fix 或类似工具
done

# 第二步：清理测试文件中的未使用导入
echo ""
echo "2. 清理测试文件..."

# tests/integration/api.test.ts
if [ -f "tests/integration/api.test.ts" ]; then
    sed -i.bak "/import { EvolutionServer } from/d" tests/integration/api.test.ts
    rm -f tests/integration/api.test.ts.bak
fi

# tests/integration/evolution-service.test.ts
if [ -f "tests/integration/evolution-service.test.ts" ]; then
    sed -i.bak "/import { EvolutionDatabase } from/d" tests/integration/evolution-service.test.ts
    rm -f tests/integration/evolution-service.test.ts.bak
fi

# tests/unit/database.test.ts
if [ -f "tests/unit/database.test.ts" ]; then
    sed -i.bak "/import { getDatabase } from/d" tests/unit/database.test.ts
    rm -f tests/unit/database.test.ts.bak
fi

# tests/unit/evolution-engine.test.ts
if [ -f "tests/unit/evolution-engine.test.ts" ]; then
    sed -i.bak "/import { DEFAULT_AVATAR_CONFIG } from/d" tests/unit/evolution-engine.test.ts
    sed -i.bak "/import { AvatarStage } from/d" tests/unit/evolution-engine.test.ts
    rm -f tests/unit/evolution-engine.test.ts.bak
fi

# tests/unit/trigger-engine.test.ts
if [ -f "tests/unit/trigger-engine.test.ts" ]; then
    sed -i.bak "/import { Event } from/d" tests/unit/trigger-engine.test.ts
    sed -i.bak "/import { EventType } from/d" tests/unit/trigger-engine.test.ts
    rm -f tests/unit/trigger-engine.test.ts.bak
fi

# tests/business-flow.test.ts
if [ -f "tests/business-flow.test.ts" ]; then
    sed -i.bak "/import { EvolutionServer } from/d" tests/business-flow.test.ts
    rm -f tests/business-flow.test.ts.bak
fi

echo ""
echo "📊 清理后统计："
pnpm lint 2>&1 | grep -E "(warning|error)" | wc -l | xargs echo "  总问题数:"

echo ""
echo "✅ 清理完成！"
echo ""
echo "建议："
echo "  1. 运行 pnpm lint 查看剩余问题"
echo "  2. 运行 pnpm test 确保没有破坏测试"
echo "  3. 提交更改"
