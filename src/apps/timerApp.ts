import sessionService from "../api/services/sessionService";
import {
	TimerEngine,
	type TimerData,
} from "../core/features/timer/timerEngine";
import type { ReadOnlyTimer } from "../core/features/timer/timerInstances";
import { ModeCounter, ModeTimer } from "../core/features/timer/timerMode";
import { SystemSecTimeSource } from "../core/features/timer/timeSource";
import type { ActiveSession } from "../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
	type ResponseErrorCode,
} from "../types/responseTypes";
import { type TimerModes } from "../types/timerTypes";
import UserApp from "./userApp";

class TimerList {
	private timerInstances: Record<string, TimerEngine>;

	public constructor() {
		this.timerInstances = {};
	}

	public insert(userId: string, timerData: TimerData) {
		this.timerInstances[userId] = TimerEngine.createFrom(timerData);
	}

	public remove(userId: string) {
		delete this.timerInstances[userId];
	}

	public getById(userId: string): TimerEngine | undefined {
		return this.timerInstances[userId] ?? undefined;
	}

	public getPeerById(userId: string): ReadOnlyTimer | undefined {
		return this.getById(userId)?.getReadOnlyTimer() ?? undefined;
	}

	public getTimers(): Record<string, TimerEngine> {
		return structuredClone(this.timerInstances);
	}
}

const DEFAULT_COUNTER_CAP = 86400;
class TimerApp {
	private static instance: TimerApp | null = null;

	private timers: TimerList | null = null;

	private constructor() {}

	public static getInstance(): TimerApp {
		return (this.instance ??= new TimerApp());
	}

	public async init(): Promise<HookResponse<null>> {
		const userAppInit = await UserApp.ready();
		const currentUser = UserApp.getCurrentUser();
		if (userAppInit.error)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"UserApp failed to initialized, which TimerApp depends on",
			);
		if (!currentUser)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Failed to get current user data despite successful initialization",
			);

		this.timers = new TimerList();

		const response = await sessionService.subscribeToSessions(
			this.handlePeerTimerInsert.bind(this),
			this.handlePeerTimerUpdate.bind(this),
			this.handlePeerTimerDelete.bind(this),
		);

		if (!response.isSuccessful)
			console.error(
				"Error subscribing to realtime active_sessions: ",
				response.error,
			);

		// Fill list
		const userList = UserApp.getAllUsers()!;
		for (const user of userList) {
			const activeSess = await user.getActiveSession();
			// TODO: Give reliable way to handle unfetched users
			if (activeSess.error) {
				console.error(
					`Unable to register user: ${user.name} with ID ${user.id}`,
				);
				continue;
			}

			if (!activeSess.data) continue;

			this.timers.insert(activeSess.data.sessionOwner, {
				mode: new ModeCounter(DEFAULT_COUNTER_CAP),
				status: activeSess.data!.status,
				timeStart: activeSess.data!.sessionDate.getTime() / 1000,
				lastTick: activeSess.data!.lastTick.getTime() / 1000,
				timeSource: new SystemSecTimeSource(),
				timeElapsed: activeSess.data!.duration,
			});
		}

		if (!this.timers.getById(currentUser.id))
			this.timers.insert(currentUser.id, {
				mode: new ModeCounter(DEFAULT_COUNTER_CAP),
				status: "idle",
				timeStart: 0,
				lastTick: 0,
				timeElapsed: 0,
				timeSource: new SystemSecTimeSource(),
			});

		return successResponse(null);
	}

	private getUserTimer(): HookResponse<TimerEngine> {
		const user = UserApp.getCurrentUser();
		if (!user)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"UserApp has not yet been initialized, which TimerApp depends on",
			);
		if (!this.timers)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"TimerApp has not yet been properly initialized",
			);

		const timerEngine = this.timers.getById(user.id);
		return successResponse(timerEngine);
	}

	private handlePeerTimerInsert(sessionData: ActiveSession) {
		this.timers!.insert(sessionData.sessionOwner, {
			mode: new ModeCounter(DEFAULT_COUNTER_CAP),
			status: sessionData.status,
			timeStart: sessionData.sessionDate.getTime() / 1000,
			lastTick: sessionData.lastTick.getTime() / 1000,
			timeSource: new SystemSecTimeSource(),
			timeElapsed: sessionData.duration,
		});
	}

	private handlePeerTimerUpdate(sessionData: ActiveSession) {
		const timer = this.timers!.getById(sessionData.sessionOwner);
		if (!timer) return;

		timer.setStatus(sessionData.status);
	}

	private handlePeerTimerDelete(sessionData: ActiveSession) {
		this.timers!.remove(sessionData.sessionOwner);
	}

	public async start(
		timerMode: TimerModes,
		duration: number = DEFAULT_COUNTER_CAP,
	): Promise<HookResponse<null>> {
		const getTimer = await this.getUserTimer();
		if (getTimer.error)
			return errorResponse(getTimer.error.code, getTimer.error.message);
		if (!getTimer.data)
			return errorResponse(
				"GENERAL_QUERY_ERROR",
				"Failed to get user timer",
			);

		const timerEngine = getTimer.data;

		if (timerEngine.getStatus() !== "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be idle, not ${timerEngine.getStatus()}`,
			);

		// REMOTE
		const response = await sessionService.createSession();
		if (!response.isSuccessful) {
			let errorCode: ResponseErrorCode | null = null;
			if (response.code === "AUTH_ERROR")
				errorCode = "GENERAL_AUTH_NO_USER_FOUND";
			else if (response.code === "QUERY_ERROR")
				errorCode = "GENERAL_QUERY_ERROR";
			else errorCode = "GENERAL_FATAL_ERROR";

			return errorResponse(errorCode, response.error);
		}

		// LOCAL
		if (timerMode === "timer") timerEngine.start(new ModeTimer(duration));
		else if (timerMode === "counter")
			timerEngine.start(new ModeCounter(DEFAULT_COUNTER_CAP));

		return successResponse(null);
	}

	public async reset(): Promise<HookResponse<null>> {
		const getTimer = await this.getUserTimer();
		if (getTimer.error)
			return errorResponse(getTimer.error.code, getTimer.error.message);
		const timerEngine = getTimer.data!;

		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// REMOTE
		const response = await sessionService.updateSession("idle");
		if (!response.isSuccessful) {
			let errorCode: ResponseErrorCode | null = null;
			if (response.code === "AUTH_ERROR")
				errorCode = "GENERAL_AUTH_NO_USER_FOUND";
			else if (response.code === "NETWORK_ERROR")
				errorCode = "GENERAL_NETWORK_ERROR";
			else if (response.code === "QUERY_ERROR")
				errorCode = "GENERAL_QUERY_ERROR";
			else errorCode = "GENERAL_FATAL_ERROR";

			return errorResponse(errorCode, response.error);
		}

		// LOCAL
		timerEngine.reset();

		return successResponse(null);
	}

	public async pause(): Promise<HookResponse<null>> {
		const getTimer = this.getUserTimer();
		if (getTimer.error)
			return errorResponse(getTimer.error.code, getTimer.error.message);
		const timerEngine = getTimer.data!;

		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// REMOTE
		const response = await sessionService.updateSession("paused");
		if (!response.isSuccessful) {
			let errorCode: ResponseErrorCode | null = null;
			if (response.code === "AUTH_ERROR")
				errorCode = "GENERAL_AUTH_NO_USER_FOUND";
			else if (response.code === "NETWORK_ERROR")
				errorCode = "GENERAL_NETWORK_ERROR";
			else if (response.code === "QUERY_ERROR")
				errorCode = "GENERAL_QUERY_ERROR";
			else errorCode = "GENERAL_FATAL_ERROR";

			return errorResponse(errorCode, response.error);
		}

		// LOCAL
		timerEngine.pause();

		return successResponse(null);
	}

	public async resume(): Promise<HookResponse<null>> {
		const getTimer = await this.getUserTimer();
		if (getTimer.error)
			return errorResponse(getTimer.error.code, getTimer.error.message);
		const timerEngine = getTimer.data!;

		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// REMOTE
		const response = await sessionService.updateSession("running");
		if (!response.isSuccessful) {
			let errorCode: ResponseErrorCode | null = null;
			if (response.code === "AUTH_ERROR")
				errorCode = "GENERAL_AUTH_NO_USER_FOUND";
			else if (response.code === "NETWORK_ERROR")
				errorCode = "GENERAL_NETWORK_ERROR";
			else if (response.code === "QUERY_ERROR")
				errorCode = "GENERAL_QUERY_ERROR";
			else errorCode = "GENERAL_FATAL_ERROR";

			return errorResponse(errorCode, response.error);
		}

		// LOCAL
		timerEngine.resume();

		return successResponse(null);
	}

	public getTimerByID(userId: string): ReadOnlyTimer | undefined {
		return this.timers?.getPeerById(userId) ?? undefined;
	}
}

export default TimerApp.getInstance();
