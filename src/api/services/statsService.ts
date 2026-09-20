import type { APIResponse } from "../../types/api.types";
import type { AccountStats } from "../../types/database.types";
import { mapAccountStats } from "../mapper/typeMapper";
import supabase from "../transport/client";

const statsService = {
	async getStatsById(userId: string): Promise<APIResponse<AccountStats>> {
		const { data, error } = await supabase
			.from("user_stats")
			.select("*")
			.eq("user_id", userId)
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
			message: "Successfully taken target user's stats",
			additional: mapAccountStats(data),
		};
	},

	async getUserStats(): Promise<APIResponse<AccountStats>> {
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

		return this.getStatsById(user.id);
	},
};

export default statsService;
