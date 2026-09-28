import type { TimerStatus } from "../../../types/timerTypes";
import { formatTimeMMSS } from "../../utils/timerUtil";
import type { TimerEngine } from "./timerEngine";

export class ReadOnlyTimer {
	private timer: TimerEngine;

	public constructor(timer: TimerEngine) {
		this.timer = timer;
	}

	public getTime(): string {
		return formatTimeMMSS(this.timer.getTimeSec());
	}

	public getStatus(): TimerStatus {
		return this.timer.getStatus();
	}
}
