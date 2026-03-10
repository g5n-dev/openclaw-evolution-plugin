/**
 * 端到端业务流程验证测试
 * 验证 OpenClaw Evolution Plugin 的核心业务流程
 */

import { describe, it, expect } from 'vitest';
import { EvolutionServer, createServer } from '@openclaw-evolution/evolution-service';
import { createAvatarManager } from '@openclaw-evolution/evolution-engine';
import { EventType, createEventId } from '@openclaw-evolution/shared-types';

describe('业务流程端到端验证', () => {
  it('应该成功初始化并运行核心业务流程', async () => {
    // 1. 启动 Evolution Service
    const server = createServer({ port: 0, host: 'localhost' });
    await server.start();
    expect(server).toBeDefined();

    // 2. 初始化 Avatar Manager
    const avatar = createAvatarManager({ baseColor: '#3b82f6', size: 200 });
    const initialState = avatar.getState();
    expect(initialState.currentStage).toBe('base');

    // 3. 测试 Avatar 进化
    avatar.evolveToStage('awakened' as any);
    expect(avatar.getStage()).toBe('awakened');

    // 4. 继续进化到 learned 阶段
    avatar.evolveToStage('learned' as any);
    expect(avatar.getStage()).toBe('learned');

    // 5. 进化到 evolved 阶段
    avatar.evolveToStage('evolved' as any);
    expect(avatar.getStage()).toBe('evolved');

    // 6. 测试事件系统
    const eventId = createEventId();
    expect(eventId).toMatch(/^evt_\d+_[a-z0-9]+$/);

    // 7. 测试事件类型
    expect(EventType.USER_MESSAGE).toBe('user_message');
    expect(EventType.TOOL_CALL).toBe('tool_call');
    expect(EventType.SKILL_PROMOTED).toBe('skill_promoted');

    // 8. 测试 Avatar 突变系统
    avatar.addMutations(['shell_glow', 'node_expand', 'badge_attach']);
    const mutations = avatar.getMutations();
    expect(mutations).toContain('shell_glow');
    expect(mutations).toContain('node_expand');
    expect(mutations).toContain('badge_attach');

    // 9. 测试 Avatar 重置
    avatar.reset();
    expect(avatar.getStage()).toBe('base');
    expect(avatar.getMutations().length).toBe(0);

    // 10. 停止服务
    await server.stop();
    expect(true).toBe(true); // 如果没有抛出异常，说明停止成功
  });

  it('应该能够创建完整的进化链路', async () => {
    const avatar = createAvatarManager();

    // base -> awakened
    avatar.evolveToStage('awakened' as any);
    expect(avatar.getStage()).toBe('awakened');
    expect(avatar.getMutations()).toContain('shell_glow');

    // awakened -> learned
    avatar.evolveToStage('learned' as any);
    expect(avatar.getStage()).toBe('learned');
    expect(avatar.getMutations()).toContain('node_expand');

    // learned -> evolved
    avatar.evolveToStage('evolved' as any);
    expect(avatar.getStage()).toBe('evolved');

    // 验证所有突变都已添加
    const mutations = avatar.getMutations();
    expect(mutations.length).toBeGreaterThanOrEqual(2);
  });

  it('应该能够追踪进化历史', async () => {
    const avatar = createAvatarManager();

    avatar.evolveToStage('awakened' as any);
    avatar.evolveToStage('learned' as any);

    const history = avatar.getStageHistory();
    expect(history.length).toBe(2);
    expect(history[0].stage).toBe('awakened');
    expect(history[1].stage).toBe('learned');
  });

  it('应该能够序列化和反序列化 Avatar 状态', async () => {
    const avatar = createAvatarManager();

    avatar.evolveToStage('awakened' as any);
    avatar.addMutations(['test_mutation']);

    const json = avatar.toJSON();
    expect(json).toHaveProperty('avatarId');
    expect(json).toHaveProperty('currentStage');
    expect(json).toHaveProperty('mutations');
    expect(json.currentStage).toBe('awakened');
    expect(json.mutations).toContain('test_mutation');
  });

  it('应该验证事件 ID 唯一性', async () => {
    const ids = new Set();

    for (let i = 0; i < 100; i++) {
      const id = createEventId();
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }

    expect(ids.size).toBe(100);
  });

  it('应该支持所有事件类型', async () => {
    // 验证关键事件类型存在
    expect(EventType.USER_MESSAGE).toBeDefined();
    expect(EventType.ASSISTANT_RESPONSE).toBeDefined();
    expect(EventType.TOOL_CALL).toBeDefined();
    expect(EventType.TOOL_RESULT).toBeDefined();
    expect(EventType.CANDIDATE_DETECTED).toBeDefined();
    expect(EventType.EVALUATION_PASSED).toBeDefined();
    expect(EventType.SKILL_PROMOTED).toBeDefined();
    expect(EventType.AVATAR_STAGE_CHANGED).toBeDefined();
  });
});
