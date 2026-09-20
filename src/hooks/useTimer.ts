import { useEffect, useState } from "react";
import TimerApp from "../apps/timerApp";
import { formatTimeMMSS } from "../core/utils/timerUtil";
import type { TimerModes } from "../types/TimerTypes";

function useTimer(updateTime: number = 1000) {
	const timerApp = new TimerApp();

	const [, triggerRerender] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			triggerRerender((x) => x + 1);
		}, updateTime);
		return () => clearInterval(interval);
	}, []);

	return {
		start: (timerMode: TimerModes) => timerApp.start(timerMode),
		reset: () => timerApp.reset(),
		setPause: (shouldPause: boolean) => {
			shouldPause ? timerApp.pause() : timerApp.resume;
		},

		status: timerApp.getStatus(),
		elapsed: formatTimeMMSS(timerApp.getDisplayTimeSec()),
	};
}

export default useTimer;
