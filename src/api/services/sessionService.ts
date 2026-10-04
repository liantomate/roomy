import type { RealtimeChannel } from "@supabase/supabase-js";
import type { APIResponse } from "../../types/api.types";
import type { ActiveSession, Session } from "../../types/database.types";
import type { TimerStatus } from "../../types/timerTypes";
import { mapActiveSession, mapSession } from "../mapper/typeMapper";
import supabase from "../transport/client";

class SessionChannel {
	private channel?: RealtimeChannel;

	private isSuccessful: boolean = true;
	private status: string = "";

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
				(payload) => {
					onInsert(mapActiveSession(payload));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "active_session",
				},
				(payload) => {
					onUpdate(mapActiveSession(payload));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "active_session",
				},
				(payload) => {
					onDelete(mapActiveSession(payload));
				},
			);

		this.channel.subscribe((status, error) => {
			switch (status) {
				case "SUBSCRIBED":
					this.isSuccessful = true;
					this.status =
						"Successfully subscribed to active_session channel";
					break;
				case "CHANNEL_ERROR":
					this.isSuccessful = false;
					this.status =
						error?.message ??
						"A channel error occured while setting up realtime";
					break;
				case "TIMED_OUT":
					this.isSuccessful = false;
					this.status =
						error?.message ??
						"Connection timed out while setting up realtime";
					break;
				default:
					this.isSuccessful = false;
					this.status = error?.message ?? "An unknown error occured";
					break;
			}
		});
	}

	public async stop() {
		if (!this.channel) return;

		await supabase.removeChannel(this.channel);
		this.channel = undefined;
	}

	public getStatus(): { isSuccessful: boolean; status: string } {
		return { isSuccessful: this.isSuccessful, status: this.status };
	}
}

const sessionChannel: SessionChannel = new SessionChannel();
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
			.maybeSingle();

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
			.maybeSingle();

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
			.maybeSingle();

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

	async subscribeToSessions(
		onInsert: (session: ActiveSession) => void,
		onUpdate: (session: ActiveSession) => void,
		onDelete: (session: ActiveSession) => void,
	): Promise<APIResponse<null>> {
		try {
			sessionChannel.start(onInsert, onUpdate, onDelete);

			return {
				isSuccessful: true,
				code: "SUCCESS",
				message: "Successfully subscribed to active session updates",
				additional: null,
			};
		} catch (err: unknown) {
			const errMessage =
				err instanceof Error ? err.message : "An unknown error occured";
			return {
				isSuccessful: false,
				code: "NETWORK_ERROR",
				error: errMessage,
				additional: null,
			};
		}
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
