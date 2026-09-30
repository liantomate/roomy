import { useEffect, useState } from "react";
import timerApp from "../apps/timerApp";
import type { HookResponseError } from "../types/responseTypes";
import type { TimerModes, TimerStatus } from "../types/timerTypes";
import userApp from "../apps/userApp";
import type User from "../core/features/users/user";

type TimerOperations = {
	startTimer: (duration: number) => void;
	startCounter: () => void;
	reset: () => void;
	setPause: (shouldPause: boolean) => void;
};

type TimerData = {
	status: TimerStatus;
	elapsedTime: string;
};

function useTimer(updateTime: number = 1000) {
	const [error, setError] = useState<HookResponseError>();
	const [user, setUser] = useState<User>();

	const [isTimerInit, setTimerInit] = useState(false);
	const [isTimerStarting, setTimerStarting] = useState(false);
	const [isTimerResetting, setTimerResetting] = useState(false);
	const [isTimerPausing, setTimerPausing] = useState(false);

	const [, triggerRerender] = useState(0);

	useEffect(() => {
		const initTimer = async () => {
			setTimerInit(false);
			try {
				const initResponse = await timerApp.init();
				const user = userApp.getCurrentUser();

				if (initResponse.error) {
					setError(initResponse.error);
					return;
				}

				if (!user) return;
				setUser(user);
			} finally {
				setTimerInit(true);
			}
		};
		initTimer();

		// Setup interval
		const interval = setInterval(() => {
			triggerRerender((x) => x + 1);
		}, updateTime);

		return () => clearInterval(interval);
	}, []);

	async function start(mode: TimerModes, duration: number = 86400) {
		if (isTimerStarting) return;
		setTimerStarting(true);

		try {
			const response = await timerApp.start(mode, duration);
			if (response.error) setError(response.error);
		} finally {
			setTimerStarting(false);
		}
	}

	async function reset() {
		if (isTimerResetting) return;
		setTimerResetting(true);

		try {
			const response = await timerApp.reset();
			if (response.error) setError(response.error);
		} finally {
			setTimerResetting(false);
		}
	}

	async function setPause(shouldPause: boolean) {
		if (isTimerPausing) return;
		setTimerPausing(true);

		try {
			const pauseFunction = shouldPause
				? timerApp.pause
				: timerApp.resume;
			const response = await pauseFunction();
			if (response.error) setError(response.error);
		} finally {
			setTimerPausing(false);
		}
	}

	const timerOperations: TimerOperations = {
		startTimer: (duration: number) => {
			start("timer", duration);
		},
		startCounter: () => {
			start("counter");
		},

		reset: () => reset(),
		setPause: (shouldPause: boolean) => setPause(shouldPause),
	};

	const timer = timerApp.getTimerByID(user?.id ?? "");
	const timerData: TimerData = {
		status: timer?.getStatus() ?? "idle",
		elapsedTime: timer?.getTime() ?? "00:00",
	};

	return {
		error: error,

		isTimerInit: isTimerInit,
		isTimerStarting: isTimerStarting,
		isTimerResetting: isTimerResetting,
		isTimerPausing: isTimerPausing,

		timerOperations: timerOperations,
		timerData: timerData,
	};
}

export default useTimer;
