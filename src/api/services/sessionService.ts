import type { APIResponse } from "../../types/api.types";
import type { ActiveSession, Session } from "../../types/database.types";
import type { TimerStatus } from "../../types/timerTypes";
import { mapActiveSession, mapSession } from "../mapper/typeMapper";
import supabase from "../transport/client";

const sessionService = {
	async createSession(): Promise<APIResponse<ActiveSession>> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user)
			return {
				isSuccessful: false,
				code: "AUTH_ERROR",
				error: "No active user found",
			};

		const { data, error } = await supabase
			.from("active_sessions")
			.insert({
				session_owner: user.id,
				status: "running",
			})
			.select()
			.single();

		if (error)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error.message,
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: `Successfully created a session`,
			additional: data,
		};
	},

	async getActiveSessionById(
		userId: string,
	): Promise<APIResponse<ActiveSession | null>> {
		const { data, error } = await supabase
			.from("active_sessions")
			.select("*")
			.eq("session_owner", userId)
			.single();

		if (error)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error?.message || "Failed to get active session",
			};

		if (!data)
			return {
				isSuccessful: true,
				code: "SUCCESS WITH ERROR",
				message: "Successful query, no active session found",
				additional: null,
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully taken active session of target user",
			additional: mapActiveSession(data),
		};
	},

	async updateSession(status: TimerStatus): Promise<APIResponse<null>> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user)
			return {
				isSuccessful: false,
				code: "AUTH_ERROR",
				error: "No active user found",
			};

		const { data, error } = await supabase
			.rpc("update_active_session", {
				passed_user_id: user.id,
				passed_status: status,
			})
			.select()
			.single();

		if (error)
			return {
				isSuccessful: false,
				code: "NETWORK_ERROR",
				error:
					error.message ||
					"Something went wrong reaching update_active_session service",
			};

		if (!data)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: "Failed to update session",
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully updated active session",
			additional: null,
		};
	},

	async deleteSession(sessionId: string): Promise<APIResponse<null>> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user)
			return {
				isSuccessful: false,
				code: "AUTH_ERROR",
				error: "No active user found",
			};

		const { data, error } = await supabase
			.from("session_history")
			.delete()
			.eq("session_id", sessionId)
			.eq("session_owner", user.id);

		if (error)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error.message,
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: `Successfully deleted sessions, ${data}`,
			additional: null,
		};
	},

	async getUserHistoryById(userId: string): Promise<APIResponse<Session[]>> {
		const { data, error } = await supabase
			.from("session_history")
			.select("*")
			.eq("session_owner", userId)
			.order("session_date", { ascending: false });

		if (error)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error.message,
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully taken all of target user's history",
			additional: data.map(mapSession),
		};
	},

	async getUserHistory(): Promise<APIResponse<Session[]>> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user)
			return {
				isSuccessful: false,
				code: "AUTH_ERROR",
				error: "No active user found",
			};

		return this.getUserHistoryById(user.id);
	},
};

export default sessionService;
