import timerEngine from "../core/features/timer/timerEngine";
import { ModeTimer } from "../core/features/timer/timerMode";
import { type TimerStatus, type TimerModes } from "../types/TimerTypes";

class TimerApp {
	constructor() {}

	public start(timerMode: TimerModes, duration: number = 86400) {}
	public reset() {}
	public pause() {}
	public resume() {}

	public getStatus(): TimerStatus {
		return timerEngine.getStatus();
	}

	public getTimeSec(): number {
		return timerEngine.getTimeSec();
	}

	public getDisplayTimeSec(): number {
		return timerEngine.getDisplayTimeSec();
	}
}

export default TimerApp;
