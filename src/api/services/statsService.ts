import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import type { AccountStats } from "../../types/database.types";
import { mapAccountStats } from "../mapper/typeMapper";
import supabase from "../transport/client";

/**
 * Handles all user statistics-related functions
 */
const statsService = {
	/**
	 * Returns account statistics based on the provided user id
	 *
	 * @param userId id of the user to get account statistics of
	 * @returns api response {@linkcode APIResponse} with data {@linkcode AccountStats}
	 * @error QUERY_ERROR if unable to get user statistics
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getStatsById(userId: string): Promise<APIResponse<AccountStats>> {
		try {
			const { data, error } = await supabase
				.from("user_stats")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle();

			if (error)
				return createAPIErrorResponse(
					error,
					"Unable to get user stats",
					"QUERY_ERROR",
				);

			if (!data)
				return createAPIErrorResponse(
					null,
					"No stats found for target user",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully taken target user's stats",
				mapAccountStats(data),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting selected user stats",
			);
		}
	},

	/**
	 * Returns account statistics belonging to the currently authenticated user
	 *
	 * @returns api response {@linkcode APIResponse} with data {@linkcode AccountStats}
	 * @error AUTH_ERROR if no authenticated user is found
	 * @error QUERY_ERROR if unable to get user statistics
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getUserStats(): Promise<APIResponse<AccountStats>> {
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

			return this.getStatsById(user.id);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting user stats",
			);
		}
	},
};

export default statsService;
