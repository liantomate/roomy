import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import supabase from "../transport/client";

const authService = {
	async signUp(
		name: string,
		email: string,
		password: string,
		token: string,
	): Promise<APIResponse<void>> {
		try {
			const { data, error } = await supabase.functions.invoke("signup", {
				method: "POST",
				body: {
					name: name,
					email: email,
					password: password,
					token: token,
				},
			});

			if (error)
				return createAPIErrorResponse(
					error,
					"Something went wrong while reaching the sign-up service",
					"NETWORK_ERROR",
				);

			if (!data?.is_successful)
				return createAPIErrorResponse(
					data?.status.message,
					"Signup unsuccessful",
					"SIGNUP_ERROR",
				);

			return createAPISuccessResponse("Successfully created user", data);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An unknown signup error occured",
			);
		}
	},

	async logIn(
		email: string,
		password: string,
	): Promise<APIResponse<{ userId: string }>> {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});
			if (error || !data.user)
				return createAPIErrorResponse(
					error,
					"Invalid email or password",
					"INVALID_CREDS",
				);

			return createAPISuccessResponse("Successfully logged in", {
				userId: data.user.id,
			});
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An unknown login error occured",
			);
		}
	},

	async logOut(): Promise<APIResponse<null>> {
		try {
			const { error } = await supabase.auth.signOut();

			if (error)
				return createAPIErrorResponse(
					error,
					"An unknown logout error occured",
					"LOGOUT_ERROR",
				);

			return createAPISuccessResponse("Successfully logged out", null);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An unknown logout error occured",
			);
		}
	},

	async isAuthenticated(): Promise<APIResponse<boolean>> {
		try {
			const { data, error } = await supabase.auth.getUser();

			if (error || !data)
				return createAPIErrorResponse(
					error,
					"No authenticated user found",
					"AUTH_ERROR",
				);

			return createAPISuccessResponse("Authenticated user found", true);
		} catch (err: unknown) {
			return createAPIErrorResponse(err, "An unknown auth error occured");
		}
	},
};

export default authService;
