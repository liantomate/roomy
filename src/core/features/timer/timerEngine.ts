import type { TimerStatus } from "../../../types/timerTypes";
import type { TimerMode } from "./timerMode";
import { SystemSecTimeSource, type TimeSource } from "./timeSource";

type TimerEngineProps = {
	timeStart: number;
	timeElapsed: number;
	lastTick: number;
};

class TimerEngine {
	private static instance: TimerEngine | null;

	private status: TimerStatus = "idle";
	private mode: TimerMode | null = null;
	private timeSource: TimeSource | null = null;
	private timerEngineProps: TimerEngineProps | null = null;

	private constructor() {}

	public start(
		mode: TimerMode,
		source: TimeSource = new SystemSecTimeSource(),
	): void {
		if (this.status !== "idle") return;
		this.status = "running";

		this.mode = mode;
		this.timeSource = source;

		const currentTime = source.getTime();
		this.timerEngineProps = {
			timeStart: currentTime,
			timeElapsed: 0,
			lastTick: currentTime,
		};
	}

	public reset(): void {
		this.status = "idle";
		this.mode = null;
		this.timerEngineProps = null;
		this.timeSource = null;
		// TODO: implement event-based transmission
	}

	public pause(): void {
		if (this.status !== "running") return;
		if (!this.timerEngineProps || !this.timeSource || !this.mode) return;
		this.status = "paused";

		const currentTime = this.timeSource.getTime();
		this.timerEngineProps.timeElapsed +=
			currentTime - this.timerEngineProps.lastTick;
		this.timerEngineProps.lastTick = currentTime;
	}

	public resume(): void {
		if (this.status !== "paused") return;
		if (!this.timerEngineProps || !this.timeSource) return;
		this.status = "running";

		this.timerEngineProps.lastTick = this.timeSource.getTime();
	}

	public getStatus(): TimerStatus {
		return this.status;
	}

	public getTimeSec(): number {
		if (
			this.status !== "running" ||
			!this.timerEngineProps ||
			!this.timeSource
		)
			return this.timerEngineProps?.timeElapsed ?? 0;

		const currentTime = this.timeSource.getTime();

		return (
			this.timerEngineProps.timeElapsed +
			(currentTime - this.timerEngineProps.lastTick)
		);
	}

	public getDisplayTimeSec(): number {
		if (!this.mode) return 0;
		return this.mode.getTimeValueCapped(this.getTimeSec());
	}

	public static getInstance(): TimerEngine {
		return (TimerEngine.instance ??= new TimerEngine());
	}
}

export default TimerEngine.getInstance();
