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

/**
 * Pure logic module representing a timer
 */
export class TimerEngine {
	private timerData: TimerData;

	/**
	 * @param data data to be used by the timer
	 */
	private constructor(data: TimerData) {
		this.timerData = data;
	}

	/**
	 * Creates a new {@linkcode TimerEngine} instance with default values
	 *
	 * @returns timer engine / {@linkcode TimerEngine}
	 */
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

	/**
	 * Creates a new {@linkcode TimerEngine} instance from a predefined data
	 *
	 * @param data data to be used by the timer
	 * @returns timer engine / {@linkcode TimerEngine}
	 */
	public static createFrom(data: TimerData): TimerEngine {
		return new TimerEngine(data);
	}

	/**
	 * Starts a timer session
	 *
	 * @param mode timer mode {@linkcode TimerMode}
	 * @param source source of time {@linkcode TimeSource}
	 */
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

	/**
	 * Resets a timer session by setting all of its data back to their default values
	 */
	public reset(): void {
		this.timerData.status = "idle";
		this.timerData.mode = null;
		this.timerData.lastTick = 0;
		this.timerData.timeStart = 0;
		this.timerData.timeElapsed = 0;
		this.timerData.timeSource = null;
	}

	/**
	 * Pauses a timer and updates its data accordingly
	 */
	public pause(): void {
		if (this.timerData.status !== "running") return;
		if (!this.timerData.timeSource || !this.timerData.mode) return;
		this.timerData.status = "paused";

		const currentTime = this.timerData.timeSource.getTime();
		this.timerData.timeElapsed += currentTime - this.timerData.lastTick;
		this.timerData.lastTick = currentTime;
	}

	/**
	 * Resumes a timer and updates its data accordingly
	 */
	public resume(): void {
		if (this.timerData.status !== "paused") return;
		if (!this.timerData || !this.timerData.timeSource) return;
		this.timerData.status = "running";

		this.timerData.lastTick = this.timerData.timeSource.getTime();
	}

	/**
	 * @returns status of the timer {@linkcode TimerStatus}
	 */
	public getStatus(): TimerStatus {
		return this.timerData.status;
	}

	/**
	 * @returns elapsed time since timer started (in seconds)
	 */
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

	/**
	 * Sets the timer status to a new value, ignored if new status is the same as current
	 *
	 * @param newStatus new status for the timer {@linkcode TimerStatus}
	 */
	public setStatus(newStatus: TimerStatus) {
		if (this.timerData.status === newStatus) return;

		if (newStatus === "paused") this.pause();
		else if (newStatus === "running") this.resume();
		else if (newStatus === "idle") this.reset();
	}

	/**
	 * @returns elapsed time since the timer started (in seconds) with respect to the timer mode
	 */
	public getDisplayTimeSec(): number {
		if (!this.timerData.mode) return 0;
		return this.timerData.mode.getTimeValueCapped(this.getTimeSec());
	}

	/**
	 * @returns read only timer container for this timer engine {@linkcode ReadOnlyTimer}
	 */
	public getReadOnlyTimer(): ReadOnlyTimer {
		return new ReadOnlyTimer(this);
	}
}
