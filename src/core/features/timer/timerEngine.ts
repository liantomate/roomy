import type { TimerStatus } from "../../../types/timerTypes";
import { ReadOnlyTimer } from "./timerInstances";
import type { TimerMode } from "./timerMode";
import { SystemSecTimeSource, type TimeSource } from "./timeSource";

export type TimerData = {
	status: TimerStatus;
	mode: TimerMode | null;
	timeSource: TimeSource | null;

	timeStart: number;
	timeElapsed: number;
	lastTick: number;
};

export class TimerEngine {
	private timerData: TimerData;

	private constructor(data: TimerData) {
		this.timerData = data;
	}

	public static createNew(): TimerEngine {
		return new TimerEngine({
			status: "idle",
			mode: null,
			timeSource: null,
			timeStart: 0,
			timeElapsed: 0,
			lastTick: 0,
		});
	}

	public static createFrom(data: TimerData): TimerEngine {
		return new TimerEngine(data);
	}

	public start(
		mode: TimerMode,
		source: TimeSource = new SystemSecTimeSource(),
	): void {
		if (this.timerData.status !== "idle") return;
		this.timerData.status = "running";

		this.timerData.mode = mode;
		this.timerData.timeSource = source;

		const currentTime = source.getTime();
		this.timerData.timeStart = currentTime;
		this.timerData.timeElapsed = 0;
		this.timerData.lastTick = currentTime;
	}

	public reset(): void {
		this.timerData.status = "idle";
		this.timerData.mode = null;
		this.timerData.timeSource = null;
		this.timerData.timeSource = null;
	}

	public pause(): void {
		if (this.timerData.status !== "running") return;
		if (!this.timerData.timeSource || !this.timerData.mode) return;
		this.timerData.status = "paused";

		const currentTime = this.timerData.timeSource.getTime();
		this.timerData.timeElapsed += currentTime - this.timerData.lastTick;
		this.timerData.lastTick = currentTime;
	}

	public resume(): void {
		if (this.timerData.status !== "paused") return;
		if (!this.timerData || !this.timerData.timeSource) return;
		this.timerData.status = "running";

		this.timerData.lastTick = this.timerData.timeSource.getTime();
	}

	public getStatus(): TimerStatus {
		return this.timerData.status;
	}

	public getTimeSec(): number {
		if (
			this.timerData.status !== "running" ||
			!this.timerData ||
			!this.timerData.timeSource
		)
			return this.timerData?.timeElapsed ?? 0;

		const currentTime = this.timerData.timeSource.getTime();

		return (
			this.timerData.timeElapsed + (currentTime - this.timerData.lastTick)
		);
	}

	public getDisplayTimeSec(): number {
		if (!this.timerData.mode) return 0;
		return this.timerData.mode.getTimeValueCapped(this.getTimeSec());
	}

	public getReadOnlyTimer(): ReadOnlyTimer {
		return new ReadOnlyTimer(this);
	}
}
