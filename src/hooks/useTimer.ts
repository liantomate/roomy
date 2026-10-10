import { useEffect, useState } from "react";
import timerApp from "../apps/timerApp";
import {
	createHookOperation,
	type HookResponseError,
} from "../types/responseTypes";
import type { TimerModes, TimerStatus } from "../types/timerTypes";

type TimerData = {
	status: TimerStatus;
	elapsedTime: string;
};

/**
 * Returns timer-related actions and data
 *
 * @param updateTime rough per millisecond update for rerenders
 * @returns hooks operations {@linkcode HookOperation} for: init, startTimer, startCounter, reset, setPause
 */
function useTimer(updateTime: number = 1000) {
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
		let cancelled = false;
		let unsubscribe: () => Promise<any> | undefined;

		const initTimer = async () => {
			setTimerInit(true);
			setInitError(undefined);
			try {
				const initResponse = await timerApp.loadTimers();

				if (initResponse.error) {
					setInitError(initResponse.error);
					return;
				}

				const subResponse = timerApp.subscribeToSessions();
				if (subResponse.error) {
					setInitError(subResponse.error);
					return;
				}

				if (cancelled) await timerApp.unsubscribeToSessions();
				else unsubscribe = () => timerApp.unsubscribeToSessions();
			} finally {
				if (!cancelled) setTimerInit(false);
			}
		};
		initTimer();

		// Setup interval
		const interval = setInterval(() => {
			triggerRerender((x) => x + 1);
		}, updateTime);

		return () => {
			cancelled = true;
			clearInterval(interval);
			if (unsubscribe) void unsubscribe();
		};
	}, []);

	async function start(
		mode: TimerModes,
		duration: number = 86400,
		sesisonDetail: string = "New Session...",
	) {
		if (isTimerStarting) return;
		setTimerStarting(true);
		setStartError(undefined);

		try {
			const response = await timerApp.start(
				mode,
				sesisonDetail,
				duration,
			);
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

	const timer = timerApp.getUserTimer();
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
