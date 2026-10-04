import {
	createAPIErrorResponse,
	createAPISuccessResponse,
	type APIResponse,
} from "../../types/api.types";
import supabase from "../transport/client";

/**
 * Handles auth-related async functions, such as signup, login, logout, and isAuthenticated call
 */
const authService = {
	/**
	 * Signs up or creates a new user
	 *
	 * @param name name of the user
	 * @param email email of the user
	 * @param password password of the account
	 * @param token creation token
	 * @returns api response {@linkcode APIResponse}
	 * @error NETWORK_ERROR for error during signup invocation (failed creation)
	 * @error SIGNUP_ERROR for invalid signup request (invalid credentials)
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async signUp(
		name: string,
		email: string,
		password: string,
		token: string,
	): Promise<APIResponse<null>> {
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

			return createAPISuccessResponse("Successfully created user", null);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An unknown signup error occured",
			);
		}
	},

	/**
	 * Log in an existing user
	 *
	 * @param email email of the user
	 * @param password password of the account
	 * @returns api response {@linkcode APIResponse}
	 * @error INVALID_CREDS for invalid login credentials
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async logIn(email: string, password: string): Promise<APIResponse<null>> {
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

			return createAPISuccessResponse("Successfully logged in", null);
		} catch (err: unknown) {
			return createAPIErrorResponse(
				err,
				"An unknown login error occured",
			);
		}
	},

	/**
	 * Log out authenticated user
	 *
	 * @returns api response {@linkcode APIResponse}
	 * @error LOGOUT_ERROR for unexpected signout-related error
	 * @error GENERAL_ERROR for other unexpected errors
	 */
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

	/**
	 * Checks if there's a user currently authenticated (logged in)
	 *
	 * @returns api response {@linkcode APIResponse} with boolean data equal to true if an account
	 * is authenticated in the device, otherwise false (or there's an error)
	 * @error AUTH_ERROR when no user is found
	 * @error GENERAL_ERROR for unexpected errors
	 */
	async isAuthenticated(): Promise<APIResponse<{ userId: string }>> {
		try {
			const { data, error } = await supabase.auth.getUser();

			if (error || !data)
				return createAPIErrorResponse(
					error,
					"No authenticated user found",
					"AUTH_ERROR",
				);

			return createAPISuccessResponse("Authenticated user found", {
				userId: data.user.id,
			});
		} catch (err: unknown) {
			return createAPIErrorResponse(err, "An unknown auth error occured");
		}
	},
};

export default authService;
