import type { APIResponse } from "../../types/api.types";
import supabase from "../transport/client";

const authService = {
	async signUp(
		name: string,
		email: string,
		password: string,
		token: string,
	): Promise<APIResponse<string[]>> {
		const { data, error } = await supabase.functions.invoke("signup", {
			method: "POST",
			body: {
				name: name,
				email: email,
				password: password,
				token: token,
			},
		});

		if (error) {
			return {
				isSuccessful: false,
				code: "NETWORK_ERROR",
				error:
					error ||
					"Something went wrong while reaching the sign-up service",
				additional: [],
			};
		}

		if (!data?.is_successful) {
			return {
				isSuccessful: false,
				code: "SIGNUP_ERROR",
				error: data?.status.message || "Signup failed",
				additional: data?.status.additional || [],
			};
		}

		return {
			isSuccessful: true,
			code:
				data.status.code === "SIGNUP_SUCCESS"
					? "SUCCESS"
					: "SUCCESS WITH ERROR",
			message: data.status.message,
			additional: data.status.additional,
		};
	},

	async logIn(
		email: string,
		password: string,
	): Promise<APIResponse<{ userId: string }>> {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error || !data.user) {
			return {
				isSuccessful: false,
				code: "INVALID_CREDS",
				error: error?.message || "Invalid email or password",
			};
		}

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully logged in",
			additional: { userId: data.user.id },
		};
	},

	async logOut(): Promise<APIResponse<null>> {
		const { error } = await supabase.auth.signOut();

		if (error)
			return {
				isSuccessful: false,
				code: "LOGOUT_ERROR",
				error: error.message,
			};

		return {
			isSuccessful: true,
			code: "SUCCESS",
			message: "Successfully logged out",
			additional: null,
		};
	},
};

export default authService;
