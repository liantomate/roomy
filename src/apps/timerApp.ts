import { TimerEngine } from "../core/features/timer/timerEngine";
import type { ReadOnlyTimer } from "../core/features/timer/timerInstances";
import { ModeCounter, ModeTimer } from "../core/features/timer/timerMode";
import { SystemSecTimeSource } from "../core/features/timer/timeSource";
import SessionManager from "../core/features/users/sessionManager";
import userManager from "../core/features/users/userManager";
import type { ActiveSession } from "../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../types/responseTypes";
import { type TimerModes } from "../types/timerTypes";

/**
 * Creates a {@linkcode TimerEngine} from loaded {@linkcode ActiveSession}
 *
 * @param sessionData data {@linkcode SessionData} for timer engine
 * @returns created {@linkcode TimerEngine}
 */
function createTimerFromSession(sessionData: ActiveSession): TimerEngine {
	const timerMode =
		sessionData.timerMode === "timer"
			? new ModeTimer(sessionData.timeCap)
			: new ModeCounter(sessionData.timeCap);

	return TimerEngine.createFrom({
		mode: timerMode,
		timeSource: new SystemSecTimeSource(),
		status: sessionData.status,

		timeStart: new Date(sessionData.lastTick).getTime() / 1000,
		lastTick: new Date(sessionData.lastTick).getTime() / 1000,
		timeElapsed: sessionData.duration,
	});
}

/**
 * Handles logic and hook layer connection in terms of Timer-handling, managing user and peer timers
 */
class TimerApp {
	private static instance: TimerApp | null = null;

	/**
	 * Default max cap of timers in ModeCounter equal to 24 hours in seconds
	 */
	private readonly DEFAULT_COUNTER_CAP = 86400;

	private userId: string | null = "";
	private timer: TimerEngine | null = null;

	private timers: Record<string, TimerEngine> = {};

	private constructor() {}

	public static getInstance(): TimerApp {
		return (this.instance ??= new TimerApp());
	}

	/**
	 * Loads authenticated user's timer if any, else a default one is loaded
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user found
	 * @error GENERAL_QUERY_ERROR if sessions cannot be fetched
	 */
	public async loadTimers(): Promise<HookResponse<null>> {
		const response = await SessionManager.getCurrentUserActiveSession();
		const userResponse = await userManager.getCurrentUser();
		const userId = userResponse.data;
		if (response.error || userResponse.error || !userId)
			return errorResponse(
				"GENERAL_AUTH_NO_USER_FOUND",
				response.error?.message ??
					userResponse.error?.message ??
					"Unable to access authenticated user",
			);

		const fetchAllResponse = await SessionManager.getAllActiveSessions();
		if (fetchAllResponse.error)
			return errorResponse(
				"GENERAL_QUERY_ERROR",
				fetchAllResponse.error.message,
			);

		this.userId = userId.id;
		if (!response.data) this.timer = TimerEngine.createNew();
		else this.timer = createTimerFromSession(response.data);

		for (const sessionData of fetchAllResponse.data ?? []) {
			if (
				response.data &&
				sessionData.sessionOwner === response.data.sessionOwner
			)
				continue;
			this.timers[sessionData.sessionOwner] =
				createTimerFromSession(sessionData);
		}

		return successResponse(null);
	}

	/**
	 * Registers and subscribes to the ActiveSession channel, calling the provided functions on change updates
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error REALTIME_SUBSCRIPTION_ERROR if an error occured during subscription
	 */
	public subscribeToSessions(): HookResponse<null> {
		const response = SessionManager.subscribeToActiveSessionRealtime(
			this.handlePeerTimerInsert.bind(this),
			this.handlePeerTimerUpdate.bind(this),
			this.handlePeerTimerDelete.bind(this),
		);

		if (response.error) return response;
		return successResponse(null);
	}

	/**
	 * Unsubscribes from the ActiveSession channel
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error REALTIME_UNSUBSCRIPTION_ERROR if an error occured during unsubscription
	 */
	public async unsubscribeToSessions(): Promise<HookResponse<null>> {
		const response =
			await SessionManager.unsubscribeToActiveSessionRealtime();

		if (response.error) return response;
		return successResponse(null);
	}

	/**
	 * Handles new active session insertion from other users
	 *
	 * @param sessionData realtime payload
	 */
	private handlePeerTimerInsert(sessionData: ActiveSession) {
		if (sessionData.sessionOwner === this.userId) return;

		this.timers[sessionData.sessionOwner] =
			createTimerFromSession(sessionData);
	}

	/**
	 * Handles new active session update from other users
	 *
	 * @param sessionData realtime payload
	 */
	private handlePeerTimerUpdate(sessionData: ActiveSession) {
		if (sessionData.sessionOwner === this.userId) return;

		this.timers[sessionData.sessionOwner] =
			createTimerFromSession(sessionData);
	}

	/**
	 * Handles active session deletion by other users
	 *
	 * @param sessionData realtime payload
	 */
	private handlePeerTimerDelete(sessionData: ActiveSession) {
		if (sessionData.sessionOwner === this.userId) return;
		if (!(sessionData.sessionOwner in this.timers)) return;

		delete this.timers[sessionData.sessionOwner];
	}

	/**
	 * Starts user timer with the given mode
	 *
	 * @param timerMode mode of the timer {@linkcode TimerModes}
	 * @param duration time cap
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_INIT_ERROR if the timer hasn't yet been loaded
	 * @error TIMER_INVALID_STATE if the timer is not in a valid starting state
	 * @error other errors returned by {@linkcode SessionManager.createSession}
	 */
	public async start(
		timerMode: TimerModes,
		sessionDetails: string,
		duration: number = this.DEFAULT_COUNTER_CAP,
	): Promise<HookResponse<null>> {
		if (!this.timer)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Timer hasn't yet been loaded",
			);

		if (this.timer.getStatus() !== "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be idle, not ${this.timer.getStatus()}`,
			);

		const modeToUse =
			timerMode === "timer"
				? new ModeTimer(duration)
				: new ModeCounter(this.DEFAULT_COUNTER_CAP);

		// REMOTE
		const response = await SessionManager.createSession(
			modeToUse,
			sessionDetails,
		);
		if (response.error) return response;

		// LOCAL
		this.timer.start(modeToUse);

		return successResponse(null);
	}

	/**
	 * Resets user timer
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_INIT_ERROR if the timer hasn't yet been loaded
	 * @error TIMER_INVALID_STATE if the timer is not in a valid resetting state
	 * @error other errors returned by {@linkcode SessionManager.updateSession}
	 */
	public async reset(): Promise<HookResponse<null>> {
		if (!this.timer)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Timer hasn't yet been loaded",
			);

		if (this.timer.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${this.timer.getStatus()}`,
			);

		// REMOTE
		const response = await SessionManager.updateSession("idle");
		if (response.error) return response;

		// LOCAL
		this.timer.reset();

		return successResponse(null);
	}

	/**
	 * Pauses the user timer
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_INIT_ERROR if the timer hasn't yet been loaded
	 * @error TIMER_INVALID_STATE if the timer is not in a valid pausing state
	 * @error other errors returned by {@linkcode SessionManager.updateSession}
	 */
	public async pause(): Promise<HookResponse<null>> {
		if (!this.timer)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Timer hasn't yet been loaded",
			);

		if (this.timer.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${this.timer.getStatus()}`,
			);

		// REMOTE
		const response = await SessionManager.updateSession("paused");
		if (response.error) return response;

		// LOCAL
		this.timer.pause();

		return successResponse(null);
	}

	/**
	 * Resumes the user timer
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_INIT_ERROR if the timer hasn't yet been loaded
	 * @error TIMER_INVALID_STATE if the timer is not in a valid resuming state
	 * @error other errors returned by {@linkcode SessionManager.updateSession}
	 */
	public async resume(): Promise<HookResponse<null>> {
		if (!this.timer)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Timer hasn't yet been loaded",
			);

		if (this.timer.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${this.timer.getStatus()}`,
			);

		// REMOTE
		const response = await SessionManager.updateSession("running");
		if (response.error) return response;

		// LOCAL
		this.timer.resume();

		return successResponse(null);
	}

	/**
	 * @param userId id of the user to return the timer of
	 * @returns read only timer {@linkcode ReadOnlyTimer}
	 * @error TIMER_NO_TIMER_FOUND if no active session is found for target user
	 * @error errors returned by {@linkcode SessionManager.getActiveSessionById}
	 */
	public async getTimerByID(
		userId: string,
	): Promise<HookResponse<ReadOnlyTimer>> {
		const response = await SessionManager.getActiveSessionById(userId);
		if (response.error)
			return errorResponse(response.error.code, response.error.message);
		if (!response.data)
			return errorResponse(
				"TIMER_NO_TIMER_FOUND",
				"User with the given id doesn't have an active session",
			);

		const sessionData = response.data;
		const timer = TimerEngine.createFrom({
			mode: new ModeCounter(this.DEFAULT_COUNTER_CAP),
			timeSource: new SystemSecTimeSource(),
			timeStart: sessionData.lastTime,
			status: sessionData.status,
			lastTick: new Date(sessionData.lastTick).getTime() / 1000,
			timeElapsed: sessionData.duration,
		});

		return successResponse(timer.getReadOnlyTimer());
	}

	/**
	 * @returns read-only timer of authenticated user {@linkcode ReadOnlyTimer} if any, undefined otherwise
	 */
	public getUserTimer(): ReadOnlyTimer | undefined {
		return this.timer?.getReadOnlyTimer();
	}
}

export default TimerApp.getInstance();
