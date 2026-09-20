import timerEngine from "../core/features/timer/timerEngine";
import { ModeCounter, ModeTimer } from "../core/features/timer/timerMode";
import { type TimerStatus, type TimerModes } from "../types/timerTypes";

const DEFAULT_COUNTER_CAP = 86400;
class TimerApp {
	constructor() {}

	public start(
		timerMode: TimerModes,
		duration: number = DEFAULT_COUNTER_CAP,
	) {
		// LOCAL
		if (timerMode === "timer") timerEngine.start(new ModeTimer(duration));
		else if (timerMode === "counter")
			timerEngine.start(new ModeCounter(DEFAULT_COUNTER_CAP));

		// REMOTE
	}

	public reset() {
		// LOCAL
		timerEngine.reset();

		// REMOTE
	}

	public pause() {
		// LOCAL
		timerEngine.pause();

		// REMOTE
	}

	public resume() {
		// LOCAL
		timerEngine.resume();

		// REMOTE
	}

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
