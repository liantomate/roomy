import { useEffect, useState } from "react";
import { formatTimeMMSS } from "../core/utils/timerUtil";
import timerApp from "../apps/timerApp";
import type { HookResponse } from "../types/responseTypes";

function useTimer(updateTime: number = 1000) {
	const [error, setError] = useState<HookResponse<null>>();
	const [, triggerRerender] = useState(0);

	useEffect(() => {
		const initTimer = async (): Promise<HookResponse<null>> => {
			const initResponse = await timerApp.init();
			if (initResponse.error) {
				console.error(initResponse.error);
				setError(initResponse);
			}

			return initResponse;
		};
		initTimer();

		// Setup interval
		const interval = setInterval(() => {
			triggerRerender((x) => x + 1);
		}, updateTime);

		return () => clearInterval(interval);
	}, []);

	return {
		startTimer: (duration: number) => {
			console.log(duration);
		},
		startCounter: () => {
			console.log("counter");
		},
		reset: () => {},
		setPause: (shouldPause: boolean) => {
			// shouldPause ? timerApp.pause() : timerApp.resume;
			console.log(shouldPause);
		},

		status: "idle",
		elapsed: formatTimeMMSS(1500),
		error: error,
	};
}

export default useTimer;
