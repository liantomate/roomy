import sessionService from "../api/services/sessionService";
import timerEngine from "../core/features/timer/timerEngine";
import { ModeCounter, ModeTimer } from "../core/features/timer/timerMode";
import {
	errorResponse,
	successResponse,
	type HookResponse,
	type ResponseErrorCode,
} from "../types/responseTypes";
import { type TimerStatus, type TimerModes } from "../types/timerTypes";

const DEFAULT_COUNTER_CAP = 86400;
class TimerApp {
	constructor() {}

	public static async start(
		timerMode: TimerModes,
		duration: number = DEFAULT_COUNTER_CAP,
	): Promise<HookResponse<null>> {
		if (timerEngine.getStatus() !== "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be idle, not ${timerEngine.getStatus()}`,
			);

		// LOCAL
		if (timerMode === "timer") timerEngine.start(new ModeTimer(duration));
		else if (timerMode === "counter")
			timerEngine.start(new ModeCounter(DEFAULT_COUNTER_CAP));

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

		return successResponse(null);
	}

	public static async reset(): Promise<HookResponse<null>> {
		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// LOCAL
		timerEngine.reset();

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

		return successResponse(null);
	}

	public static async pause(): Promise<HookResponse<null>> {
		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// LOCAL
		timerEngine.pause();

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

		return successResponse(null);
	}

	public static async resume(): Promise<HookResponse<null>> {
		if (timerEngine.getStatus() === "idle")
			return errorResponse(
				"TIMER_INVALID_STATE",
				`Timer status must be running or paused, not ${timerEngine.getStatus()}`,
			);

		// LOCAL
		timerEngine.resume();

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

		return successResponse(null);
	}

	public static getStatus(): TimerStatus {
		return timerEngine.getStatus();
	}

	public static getTimeSec(): number {
		return timerEngine.getTimeSec();
	}

	public static getDisplayTimeSec(): number {
		return timerEngine.getDisplayTimeSec();
	}
}

export default TimerApp;
