import type { TimerStatus } from "../../../types/timerTypes";
import { formatTimeMMSS } from "../../utils/timerUtil";
import type { TimerEngine } from "./timerEngine";

/**
 * A container for {@linkcode TimerEngine} that only contains getters, not allowing mutation of the timer
 */
export class ReadOnlyTimer {
	private timer: TimerEngine;

	public constructor(timer: TimerEngine) {
		this.timer = timer;
	}

	/**
	 * @returns elapsed time since the timer started in string format (MM:SS) with respect to the timer mode
	 */
	public getTime(): string {
		return formatTimeMMSS(this.timer.getDisplayTimeSec());
	}

	/**
	 * @returns status of the timer {@linkcode TimerStatus}
	 */
	public getStatus(): TimerStatus {
		return this.timer.getStatus();
	}
}
