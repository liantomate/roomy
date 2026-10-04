import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import type { PublicAccount } from "../../types/database.types";
import { mapPublicAccount } from "../mapper/typeMapper";
import supabase from "../transport/client";

/**
 * Handles all user-related functions
 */
const userService = {
	/**
	 * Returns the account of the currently authenticated user
	 *
	 * @returns api response {@linkcode APIResponse} with data {@linkcode PublicAccount}
	 * @error AUTH_ERROR if no authenticated user is found
	 * @error QUERY_ERROR if unable to get the current user's account
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getCurrentUser(): Promise<APIResponse<PublicAccount>> {
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
				.from("users")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle();

			if (error)
				return createAPIErrorResponse(
					error,
					"Unable to get active user",
					"QUERY_ERROR",
				);

			if (!data)
				return createAPIErrorResponse(
					null,
					"No account data found for active user",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully taken active user",
				mapPublicAccount(data),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting current user",
			);
		}
	},

	/**
	 * Returns a user's public account based on the provided user id
	 *
	 * @param userId id of the user to get
	 * @returns api response {@linkcode APIResponse} with data {@linkcode PublicAccount}
	 * @error QUERY_ERROR if unable to get the requested user
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getUserById(userId: string): Promise<APIResponse<PublicAccount>> {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("user_id", userId)
				.single();

			if (error)
				return createAPIErrorResponse(
					error,
					"Unable to get selected user",
					"QUERY_ERROR",
				);

			if (!data)
				return createAPIErrorResponse(
					null,
					"No account data found for selected user",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully taken matching user",
				mapPublicAccount(data),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting selected user",
			);
		}
	},

	/**
	 * Returns all public user accounts
	 *
	 * @returns api response {@linkcode APIResponse} with data {@linkcode PublicAccount[]}
	 * @error QUERY_ERROR if unable to get all users
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async getAllUsers(): Promise<APIResponse<PublicAccount[]>> {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.order("created_at", { ascending: false });

			if (error)
				return createAPIErrorResponse(
					error,
					"Unable to get all users",
					"QUERY_ERROR",
				);

			if (!data)
				return createAPIErrorResponse(
					null,
					"No user data returned",
					"QUERY_ERROR",
				);

			return createAPISuccessResponse(
				"Successfully taken all users",
				data.map(mapPublicAccount),
			);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An error occured while getting all users",
			);
		}
	},
};

export default userService;
