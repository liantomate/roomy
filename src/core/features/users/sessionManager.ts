import RealTimeService from "../../../api/services/realtimeService";
import sessionService from "../../../api/services/sessionService";
import userService from "../../../api/services/userService";
import type { ActiveSession, Session } from "../../../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";
import type { TimerStatus } from "../../../types/timerTypes";

type ActiveSessionListener = (payload: ActiveSession) => void;

/**
 * Handles session fetching with sessionService. As of the moment, it mostly serves as an {@linkcode APIResponse} to
 * {@linkcode HookResponse} mapper.
 */
class SessionManager {
	/**
	 * Fetches an active session based on the provided user id
	 *
	 * @param userId id of the user to get the active session of
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode ActiveSession}
	 * @error GENERAL_QUERY_ERROR if the active session with matching ID cannot be fetched
	 */
	public static async getActiveSessionById(
		userId: string,
	): Promise<HookResponse<ActiveSession>> {
		const response = await sessionService.getActiveSessionById(userId);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	/**
	 * Fetches the active session of the authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode ActiveSession}
	 * @error GENERAL_AUTH_NO_USER_FOUND if the authenticated user cannot be fetched
	 */
	public static async getCurrentUserActiveSession(): Promise<
		HookResponse<ActiveSession>
	> {
		const userResponse = await userService.getCurrentUser();
		if (!userResponse.isSuccessful)
			return errorResponse(
				"GENERAL_AUTH_NO_USER_FOUND",
				userResponse.error,
			);

		return this.getActiveSessionById(userResponse.additional.userId);
	}

	/**
	 * Fetches a session history based on the provided user id
	 *
	 * @param userId id of the user to get the session history of
	 * @returns hook response {@linkcode HookResponse} with array data of {@linkcode Session}
	 * @error GENERAL_QUERY_ERROR if the session history with matching ID cannot be fetched
	 */
	public static async getSessionHistoryById(
		userId: string,
	): Promise<HookResponse<Session[]>> {
		const response = await sessionService.getUserHistoryById(userId);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	/**
	 * Fetches the session history of the authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse} with array data of {@linkcode Session}
	 * @error GENERAL_AUTH_NO_USER_FOUND if the authenticated user cannot be fetched
	 */
	public static async getCurrentUserSessionHistory(): Promise<
		HookResponse<Session[]>
	> {
		const userResponse = await userService.getCurrentUser();
		if (!userResponse.isSuccessful)
			return errorResponse(
				"GENERAL_AUTH_NO_USER_FOUND",
				userResponse.error,
			);

		return this.getSessionHistoryById(userResponse.additional.userId);
	}

	/**
	 * Registers and subscribes to the ActiveSession channel, calling the provided functions
	 * on change updates
	 *
	 * @param onCreate called when INSERT updates occur
	 * @param onUpdate called when UPDATE updates occur
	 * @param onDelete called when DELETE updates occur
	 * @returns hook response {@linkcode HookResponse}
	 * @error REALTIME_SUBSCRIPTION_ERROR if an error occured during subscription
	 */
	public static subscribeToActiveSessionRealtime(
		onCreate: ActiveSessionListener,
		onUpdate: ActiveSessionListener,
		onDelete: ActiveSessionListener,
	): HookResponse<null> {
		const registerResponse = RealTimeService.registerChannel(
			"ActiveSession",
			onCreate,
			onUpdate,
			onDelete,
		);
		if (!registerResponse) return successResponse(null);

		const subResponse = RealTimeService.startChannel("ActiveSession");
		if (!subResponse.isSuccessful)
			return errorResponse(
				"REALTIME_SUBSCRIPTION_ERROR",
				subResponse.error,
			);

		return successResponse(null);
	}

	/**
	 * Unsubscribes from the ActiveSession table
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error REALTIME_SUBSCRIPTION_ERROR if an error occured during unsubscription
	 */
	public static async unsubscribeToActiveSessionRealtime(): Promise<
		HookResponse<null>
	> {
		const response = await RealTimeService.stopChannel("ActiveSession");
		if (!response.isSuccessful)
			return errorResponse(
				"REALTIME_UNSUBSCRIPTION_ERROR",
				response.error,
			);

		return successResponse(null);
	}

	/**
	 * Creates a new active session for the authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user is found
	 * @error GENERAL_QUERY_ERROR if an error occurs while inserting new session
	 * @error GENERAL_FATAL_ERROR if an unexpected error occured
	 */
	public static async createSession(): Promise<HookResponse<null>> {
		const response = await sessionService.createSession();
		if (!response.isSuccessful) {
			if (response.code === "AUTH_ERROR")
				return errorResponse(
					"GENERAL_AUTH_NO_USER_FOUND",
					response.error,
				);
			if (response.code === "QUERY_ERROR")
				return errorResponse("GENERAL_QUERY_ERROR", response.error);
			if (response.code === "GENERAL_ERROR")
				return errorResponse("GENERAL_FATAL_ERROR", response.error);
		}

		return successResponse(null);
	}

	/**
	 * Updates the active session of the authenticated user
	 *
	 * @param status new status for the session {@linkcode TimerStatus}
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user is found
	 * @error GENERAL_NETWORK_ERROR if an error occured while processing the update
	 * @error GENERAL_QUERY_ERROR if an error occurs while updating session
	 * @error GENERAL_FATAL_ERROR if an unexpected error occured
	 */
	public static async updateSession(
		status: TimerStatus,
	): Promise<HookResponse<null>> {
		const response = await sessionService.updateSession(status);
		if (!response.isSuccessful) {
			if (response.code === "AUTH_ERROR")
				return errorResponse(
					"GENERAL_AUTH_NO_USER_FOUND",
					response.error,
				);
			if (response.code === "NETWORK_ERROR")
				return errorResponse("GENERAL_NETWORK_ERROR", response.error);
			if (response.code === "QUERY_ERROR")
				return errorResponse("GENERAL_QUERY_ERROR", response.error);
			if (response.code === "GENERAL_ERROR")
				return errorResponse("GENERAL_FATAL_ERROR", response.error);
		}

		return successResponse(null);
	}

	/**
	 * Deletes the active session of the authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user is found
	 * @error GENERAL_NETWORK_ERROR if an error occured while processing the deletion
	 * @error GENERAL_QUERY_ERROR if an error occurs while deleting session
	 * @error GENERAL_FATAL_ERROR if an unexpected error occured
	 */
	public static async deleteSession(): Promise<HookResponse<null>> {
		return SessionManager.updateSession("idle");
	}
}

export default SessionManager;
