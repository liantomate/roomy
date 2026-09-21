import type { APIResponse } from "../../types/api.types";
import type { PublicAccount } from "../../types/database.types";
import { mapPublicAccount } from "../mapper/typeMapper";
import supabase from "../transport/client";

const userService = {
	async getCurrentUser(): Promise<APIResponse<PublicAccount>> {
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
			.from("users")
			.select("*")
			.eq("user_id", user.id)
			.single();

		if (error || !data)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error?.message || "No data returned active user query",
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully taken active user",
			additional: mapPublicAccount(data),
		};
	},

	async getUserById(userId: string): Promise<APIResponse<PublicAccount>> {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("user_id", userId)
			.single();

		if (error || !data)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error?.message || "No data returned on user query",
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully taken matching user",
			additional: mapPublicAccount(data),
		};
	},

	async getAllUsers(): Promise<APIResponse<PublicAccount[]>> {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.order("created_at", { ascending: false });

		if (error || !data)
			return {
				isSuccessful: false,
				code: "QUERY_ERROR",
				error: error?.message || "No data returned on users query",
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully taken all users",
			additional: data.map(mapPublicAccount),
		};
	},
};

export default userService;
