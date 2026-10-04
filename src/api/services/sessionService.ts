import type { RealtimeChannel } from "@supabase/supabase-js";
import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import type { ActiveSession, Session } from "../../types/database.types";
import type { TimerStatus } from "../../types/timerTypes";
import {
	mapActiveSession,
	mapSession,
	type ActiveSessionResponse,
} from "../mapper/typeMapper";
import supabase from "../transport/client";

/**
 * Handles realtime channel on active sessions of users
 */
class SessionChannel {
	private channel?: RealtimeChannel;

	/**
	 * Subscribes the provided functions to a realtime active_session channel
	 *
	 * @param onInsert called when an active_session row is inserted
	 * @param onUpdate called when an active_session row is updated
	 * @param onDelete called when an active_session row is deleted
	 */
	public start(
		onInsert: (session: ActiveSession) => void,
		onUpdate: (session: ActiveSession) => void,
		onDelete: (session: ActiveSession) => void,
	) {
		if (this.channel) return;

		this.channel = supabase
			.channel("active_session")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "active_session",
				},
				(payload: unknown) => {
					onInsert(
						mapActiveSession(payload as ActiveSessionResponse),
					);
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "active_session",
				},
				(payload: unknown) => {
					onUpdate(
						mapActiveSession(payload as ActiveSessionResponse),
					);
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "active_session",
				},
				(payload: unknown) => {
					onDelete(
						mapActiveSession(payload as ActiveSessionResponse),
					);
				},
			);

		this.channel.subscribe((status, error) => {
			switch (status) {
				case "SUBSCRIBED":
					console.log(
						"Successfully subscribed to active_session channel",
					);
					break;
				case "CHANNEL_ERROR":
					console.error(
						error?.message ??
							"A channel error occured while setting up realtime",
					);
					break;
				case "TIMED_OUT":
					console.error(
						error?.message ??
							"Connection timed out while setting up realtime",
					);
					break;
				default:
					console.error(error?.message ?? "An unknown error occured");
					break;
			}
		});
	}

	/**
	 * Stops realtime connection to the active_session channel
	 */
	public async stop() {
		if (!this.channel) return;

		await supabase.removeChannel(this.channel);
		this.channel = undefined;
	}
}

/**
 * Single instance of {@linkcode SessionChannel} for all {@linkcode sessionService} calls
 */
const sessionChannel: SessionChannel = new SessionChannel();

/**
 * Handles all session-related (active sessions and session history) functions
 */
const sessionService = {
	/**
	 * Creates a new active session for the currently authenticated user
	 *
	 * @returns api response {@linkcode APIResponse}
	 * @error AUTH_ERROR if there's no authenticated user is found
	 * @error QUERY_ERROR if an error occurs while creating the session
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async createSession(): Promise<APIResponse<null>> {
		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user)
				return createAPIErrorResponse(
					authError,
					"No active user found",
					"AUTH_ERROR",
				);

			const { error } = await supabase
				.from("active_sessions")
				.insert({
					session_owner: user.id,
					status: "running",
				})
				.select()
				.maybeSingle();

			if (error)
				return createAPIErrorResponse(
					error,
					"An error occured while creating an active session",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully created a session",
				null,
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting active session",
			);
		}
	},

	/**
	 * Returns an active session based on the provided user id
	 *
	 * @param userId id of the user to get the active session of
	 * @returns api response {@linkcode APIResponse} with data {@linkcode ActiveSession} if a
	 * user with matching id and has an active session is found, null otherwise
	 * @error QUERY_ERROR if unable to get active session
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getActiveSessionById(
		userId: string,
	): Promise<APIResponse<ActiveSession | null>> {
		try {
			const { data, error } = await supabase
				.from("active_sessions")
				.select("*")
				.eq("session_owner", userId)
				.maybeSingle();

			if (error)
				return createAPIErrorResponse(
					error,
					"Failed to get active session",
					"QUERY_ERROR",
				);

			if (!data)
				return createAPISuccessResponse(
					"Successful query, no active session found",
					null,
				);

			return createAPISuccessResponse(
				"Successfully taken active session of target user",
				mapActiveSession(data),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting active session",
			);
		}
	},

	/**
	 * Updates the status of the active session of authenticated user to the given status
	 *
	 * @param status timer status / {@linkcode TimerStatus}
	 * @returns api response {@linkcode APIResponse}
	 * @error AUTH_ERROR if no authenticated user is found
	 * @error NETWORK_ERROR if an error occured while calling the RPC to update active session
	 * @error QUERY_ERROR if an error occured while updating the active session
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async updateSession(status: TimerStatus): Promise<APIResponse<null>> {
		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user)
				return createAPIErrorResponse(
					authError,
					"No active user found",
					"AUTH_ERROR",
				);

			const { data, error } = await supabase
				.rpc("update_active_session", {
					passed_user_id: user.id,
					passed_status: status,
				})
				.select()
				.maybeSingle();

			if (error)
				return createAPIErrorResponse(
					error,
					"Something went wrong reaching update_active_session service",
					"NETWORK_ERROR",
				);

			if (!data)
				return createAPIErrorResponse(
					null,
					"Failed to update session",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully updated active session",
				null,
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while updating active session",
			);
		}
	},

	/**
	 * Deletes a session from history belonging to the currently authenticated user
	 *
	 * @param sessionId id of the session to delete
	 * @returns api response {@linkcode APIResponse}
	 * @error AUTH_ERROR if no authenticated user is found
	 * @error QUERY_ERROR if an error occurs while deleting the session
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async deleteSession(sessionId: string): Promise<APIResponse<null>> {
		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user)
				return createAPIErrorResponse(
					authError,
					"No active user found",
					"AUTH_ERROR",
				);

			const { error } = await supabase
				.from("session_history")
				.delete()
				.eq("session_id", sessionId)
				.eq("session_owner", user.id);

			if (error)
				return createAPIErrorResponse(
					error,
					"Failed to delete session",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully deleted session",
				null,
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while deleting session",
			);
		}
	},

	/**
	 * Subscribes to realtime updates on active sessions
	 *
	 * @param onInsert called when an active_session row is inserted
	 * @param onUpdate called when an active_session row is updated
	 * @param onDelete called when an active_session row is deleted
	 * @returns api response {@linkcode APIResponse}
	 * @error NETWORK_ERROR if an error occurs while subscribing to realtime updates
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async subscribeToSessions(
		onInsert: (session: ActiveSession) => void,
		onUpdate: (session: ActiveSession) => void,
		onDelete: (session: ActiveSession) => void,
	): Promise<APIResponse<null>> {
		try {
			sessionChannel.start(onInsert, onUpdate, onDelete);

			return createAPISuccessResponse(
				"Successfully subscribed to active session updates",
				null,
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while subscribing to active session updates",
				"NETWORK_ERROR",
			);
		}
	},

	/**
	 * Returns all session history belonging to the provided user id
	 *
	 * @param userId id of the user to get session history of
	 * @returns api response {@linkcode APIResponse} with data {@linkcode Session[]}
	 * @error QUERY_ERROR if unable to get user session history
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getUserHistoryById(userId: string): Promise<APIResponse<Session[]>> {
		try {
			const { data, error } = await supabase
				.from("session_history")
				.select("*")
				.eq("session_owner", userId)
				.order("session_date", { ascending: false });

			if (error)
				return createAPIErrorResponse(
					error,
					"Failed to get user's session history",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully taken all of target user's history",
				data.map(mapSession),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting user session history",
			);
		}
	},

	/**
	 * Returns all session history belonging to the currently authenticated user
	 *
	 * @returns api response {@linkcode APIResponse} with data {@linkcode Session[]}
	 * @error AUTH_ERROR if no authenticated user is found
	 * @error QUERY_ERROR if unable to get user session history
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getUserHistory(): Promise<APIResponse<Session[]>> {
		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError || !user)
				return createAPIErrorResponse(
					authError,
					"No active user found",
					"AUTH_ERROR",
				);

			return this.getUserHistoryById(user.id);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting user session history",
			);
		}
	},
};

export default sessionService;
