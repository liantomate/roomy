import sessionService from "../../../api/services/sessionService";
import userService from "../../../api/services/userService";
import type { ActiveSession, Session } from "../../../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";

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
}

export default SessionManager;
