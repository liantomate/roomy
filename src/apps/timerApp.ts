import timerEngine from "../core/features/timer/timerEngine";
import { type TimerStatus } from "../types/TimerTypes";

class TimerApp {
	constructor() {}

	public start() {}
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
