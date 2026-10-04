import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import type { PublicAccount } from "../../types/database.types";
import { mapPublicAccount } from "../mapper/typeMapper";
import supabase from "../transport/client";

const userService = {
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

			if (error || !data)
				return createAPIErrorResponse(
					error,
					"No data returned active user query",
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

	async getUserById(userId: string): Promise<APIResponse<PublicAccount>> {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("user_id", userId)
				.single();

			if (error || !data)
				return createAPIErrorResponse(
					error,
					"No data returned on user query",
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

	async getAllUsers(): Promise<APIResponse<PublicAccount[]>> {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.order("created_at", { ascending: false });

			if (error || !data)
				return createAPIErrorResponse(
					error,
					"No data returned on users query",
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
