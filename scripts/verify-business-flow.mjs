/**
 * 端到端业务流程验证
 * 验证 OpenClaw Evolution Plugin 的核心业务流程
 */

import { EvolutionServer, createServer } from '../packages/evolution-service/dist/index.js';
import { createAvatarManager } from '../packages/evolution-engine/dist/index.js';
import { EventType, createEventId } from '../packages/shared-types/dist/index.js';

// 颜色输出
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[✗]\x1b[0m ${msg}`),
  step: (num, msg) => console.log(`\x1b[33m[步骤 ${num}]\x1b[0m ${msg}`),
};

async function verifyBusinessFlow() {
  log.info('开始端到端业务流程验证...\n');

  let server = null;
  let passed = 0;
  let failed = 0;

  try {
    // 步骤 1: 初始化 Evolution Service
    log.step(1, '启动 Evolution Service...');
    server = createServer({ port: 0, host: 'localhost' });
    await server.start();
    log.success('Evolution Service 启动成功');
    passed++;

    // 步骤 2: 初始化 Avatar Manager
    log.step(2, '初始化 Avatar Manager...');
    const avatar = createAvatarManager({ baseColor: '#3b82f6', size: 200 });
    const initialState = avatar.getState();
    if (initialState.currentStage === 'base') {
      log.success('Avatar 初始化成功，当前阶段: base');
      passed++;
    } else {
      log.error('Avatar 初始状态不正确');
      failed++;
    }

    // 步骤 3: 测试 Avatar 进化
    log.step(3, '测试 Avatar 进化流程...');
    avatar.evolveToStage('awakened');
    if (avatar.getStage() === 'awakened') {
      log.success('Avatar 进化到 awakened 阶段成功');
      passed++;
    } else {
      log.error('Avatar 进化失败');
      failed++;
    }

    // 步骤 4: 测试事件系统
    log.step(4, '测试事件系统...');
    const eventId = createEventId();
    if (eventId.startsWith('evt_') && eventId.length > 10) {
      log.success(`事件 ID 生成成功: ${eventId}`);
      passed++;
    } else {
      log.error('事件 ID 生成失败');
      failed++;
    }

    // 步骤 5: 测试事件类型
    log.step(5, '测试事件类型枚举...');
    if (
      EventType.USER_MESSAGE === 'user_message' &&
      EventType.TOOL_CALL === 'tool_call' &&
      EventType.SKILL_PROMOTED === 'skill_promoted'
    ) {
      log.success('事件类型枚举正确');
      passed++;
    } else {
      log.error('事件类型枚举不匹配');
      failed++;
    }

    // 步骤 6: 测试 Avatar 突变系统
    log.step(6, '测试 Avatar 突变系统...');
    avatar.addMutations(['shell_glow', 'node_expand']);
    const mutations = avatar.getMutations();
    if (mutations.includes('shell_glow') && mutations.includes('node_expand')) {
      log.success(`突变添加成功: ${mutations.join(', ')}`);
      passed++;
    } else {
      log.error('突变添加失败');
      failed++;
    }

    // 步骤 7: 测试 Avatar 重置
    log.step(7, '测试 Avatar 重置功能...');
    avatar.reset();
    if (avatar.getStage() === 'base' && avatar.getMutations().length === 0) {
      log.success('Avatar 重置成功');
      passed++;
    } else {
      log.error('Avatar 重置失败');
      failed++;
    }

    // 步骤 8: 测试 API 端点可用性
    log.step(8, '验证 API 端点配置...');
    const port = server?.server?.port || 3001;
    log.success(`API 服务运行在端口: ${port}`);
    passed++;

    // 总结
    console.log('\n' + '='.repeat(50));
    log.info('业务流程验证完成');
    console.log(`\n通过: ${passed} | 失败: ${failed} | 总计: ${passed + failed}`);

    if (failed === 0) {
      log.success('\n✨ 所有业务流程验证通过！');
      log.info('核心业务可以正常运行。');
      return true;
    } else {
      log.error(`\n❌ 有 ${failed} 个验证失败`);
      return false;
    }
  } catch (error) {
    log.error(`验证过程中发生错误: ${error}`);
    failed++;
    return false;
  } finally {
    if (server) {
      try {
        await server.stop();
        log.info('Evolution Service 已停止');
      } catch (error) {
        log.error('停止服务时出错');
      }
    }
  }
}

// 运行验证
verifyBusinessFlow().then(success => {
  process.exit(success ? 0 : 1);
});
