import { useEffect, useState } from "react";
import timerApp from "../apps/timerApp";
import {
	createHookOperation,
	type HookResponseError,
} from "../types/responseTypes";
import type { TimerModes, TimerStatus } from "../types/timerTypes";
import userApp from "../apps/userApp";
import { type User } from "../core/features/users/user";

type TimerData = {
	status: TimerStatus;
	elapsedTime: string;
};

function useTimer(updateTime: number = 1000) {
	const [user, setUser] = useState<User>();

	const [initError, setInitError] = useState<HookResponseError>();
	const [startError, setStartError] = useState<HookResponseError>();
	const [resetError, setResetError] = useState<HookResponseError>();
	const [pauseError, setPauseError] = useState<HookResponseError>();

	const [isTimerInit, setTimerInit] = useState(false);
	const [isTimerStarting, setTimerStarting] = useState(false);
	const [isTimerResetting, setTimerResetting] = useState(false);
	const [isTimerPausing, setTimerPausing] = useState(false);

	const [, triggerRerender] = useState(0);

	useEffect(() => {
		const initTimer = async () => {
			setTimerInit(true);
			setInitError(undefined);
			try {
				const initResponse = await timerApp.init();
				const user = userApp.getCurrentUser();

				if (initResponse.error) {
					setInitError(initResponse.error);
					return;
				}

				if (!user) {
					setInitError({
						code: "GENERAL_INIT_ERROR",
						message: "No active user found",
					});
					return;
				}

				setUser(user);
			} finally {
				setTimerInit(false);
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
		setStartError(undefined);

		try {
			const response = await timerApp.start(mode, duration);
			if (response.error) setStartError(response.error);
		} finally {
			setTimerStarting(false);
		}
	}

	async function reset() {
		if (isTimerResetting) return;
		setTimerResetting(true);
		setResetError(undefined);

		try {
			const response = await timerApp.reset();
			if (response.error) setResetError(response.error);
		} finally {
			setTimerResetting(false);
		}
	}

	async function setPause(shouldPause: boolean) {
		if (isTimerPausing) return;
		setTimerPausing(true);
		setPauseError(undefined);

		try {
			const response = shouldPause
				? await timerApp.pause()
				: await timerApp.resume();
			if (response.error) setPauseError(response.error);
		} finally {
			setTimerPausing(false);
		}
	}

	const timer = timerApp.getTimerByID(user?.id ?? "");
	const timerData: TimerData = {
		status: timer?.getStatus() ?? "idle",
		elapsedTime: timer?.getTime() ?? "00:00",
	};

	return {
		init: createHookOperation<TimerData, []>(
			async () => {},
			isTimerInit,
			initError,
			timerData,
		),

		startTimer: createHookOperation<null, [duration: number]>(
			async (duration: number) => {
				await start("timer", duration);
			},
			isTimerStarting,
			startError,
			null,
		),

		startCounter: createHookOperation<null, []>(
			async () => {
				await start("counter");
			},
			isTimerStarting,
			startError,
			null,
		),

		reset: createHookOperation<null, []>(
			async () => {
				await reset();
			},
			isTimerResetting,
			resetError,
			null,
		),

		setPause: createHookOperation<null, [shouldPause: boolean]>(
			async (shouldPause: boolean) => {
				await setPause(shouldPause);
			},
			isTimerPausing,
			pauseError,
			null,
		),
	};
}

export default useTimer;
