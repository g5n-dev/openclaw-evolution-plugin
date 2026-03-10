/**
 * OpenClaw Evolution Engine - Replay Player
 *
 * Replays evolution events from a logged session.
 */

import type { ReplaySession, ReplayEvent } from './logger';

export interface ReplayOptions {
  speed: number; // 0.5x to 2x
  autoPlay: boolean;
  showMetadata: boolean;
}

export interface ReplayState {
  isPlaying: boolean;
  currentTime: number;
  currentEventIndex: number;
  progress: number; // 0-1
}

export class ReplayPlayer {
  private session: ReplaySession;
  private options: ReplayOptions;
  private state: ReplayState;
  private onEventCallback?: (event: ReplayEvent) => void;
  private onStateChangeCallback?: (state: ReplayState) => void;
  private timer?: ReturnType<typeof setInterval>;

  constructor(session: ReplaySession, options: Partial<ReplayOptions> = {}) {
    this.session = session;
    this.options = {
      speed: 1,
      autoPlay: false,
      showMetadata: false,
      ...options,
    };

    this.state = {
      isPlaying: false,
      currentTime: session.startTime,
      currentEventIndex: 0,
      progress: 0,
    };
  }

  /**
   * Get current replay state
   */
  getState(): ReplayState {
    return { ...this.state };
  }

  /**
   * Get current event
   */
  getCurrentEvent(): ReplayEvent | null {
    if (this.state.currentEventIndex >= this.session.events.length) {
      return null;
    }
    return this.session.events[this.state.currentEventIndex];
  }

  /**
   * Play replay
   */
  play(): void {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.notifyStateChange();

    const eventInterval = 1000 / this.options.speed; // ms between events

    this.timer = setInterval(() => {
      const currentEvent = this.getCurrentEvent();

      if (currentEvent) {
        if (this.onEventCallback) {
          this.onEventCallback(currentEvent);
        }

        this.state.currentEventIndex++;
        this.state.currentTime = currentEvent.timestamp;

        // Update progress
        const totalEvents = this.session.events.length;
        this.state.progress = this.state.currentEventIndex / totalEvents;

        this.notifyStateChange();
      } else {
        // End of replay
        this.pause();
        this.state.progress = 1;
        this.notifyStateChange();
      }
    }, eventInterval);
  }

  /**
   * Pause replay
   */
  pause(): void {
    if (!this.state.isPlaying) return;

    this.state.isPlaying = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    this.notifyStateChange();
  }

  /**
   * Stop replay and reset
   */
  stop(): void {
    this.pause();
    this.state.currentEventIndex = 0;
    this.state.currentTime = this.session.startTime;
    this.state.progress = 0;
    this.notifyStateChange();
  }

  /**
   * Jump to specific event
   */
  jumpToEvent(eventIndex: number): void {
    if (eventIndex < 0 || eventIndex >= this.session.events.length) {
      return;
    }

    this.pause();
    this.state.currentEventIndex = eventIndex;
    this.state.currentTime = this.session.events[eventIndex].timestamp;
    this.state.progress = eventIndex / this.session.events.length;
    this.notifyStateChange();

    if (this.onEventCallback) {
      this.onEventCallback(this.getCurrentEvent()!);
    }
  }

  /**
   * Jump to specific progress (0-1)
   */
  jumpToProgress(progress: number): void {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const eventIndex = Math.floor(clampedProgress * this.session.events.length);
    this.jumpToEvent(eventIndex);
  }

  /**
   * Set replay speed
   */
  setSpeed(speed: number): void {
    this.options.speed = Math.max(0.5, Math.min(2, speed));

    // Restart if playing to apply new speed
    if (this.state.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Set event callback
   */
  onEvent(callback: (event: ReplayEvent) => void): void {
    this.onEventCallback = callback;
  }

  /**
   * Set state change callback
   */
  onStateChange(callback: (state: ReplayState) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    sessionId: string;
    eventCount: number;
    duration: number;
    startTime: number;
    endTime?: number;
  } {
    return {
      sessionId: this.session.sessionId,
      eventCount: this.session.events.length,
      duration: (this.session.endTime || Date.now()) - this.session.startTime,
      startTime: this.session.startTime,
      endTime: this.session.endTime,
    };
  }
}

export function createReplayPlayer(
  session: ReplaySession,
  options?: Partial<ReplayOptions>
): ReplayPlayer {
  return new ReplayPlayer(session, options);
}
