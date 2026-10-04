import authService from "../../../api/services/authService";
import {
	errorResponse,
	successResponse,
	type HookResponse,
	type ResponseErrorCode,
} from "../../../types/responseTypes";

/**
 * Handles user authentication, connecting the hook layer with the API
 */
class AuthManager {
	static readonly MIN_NAME_LEN = 3;
	static readonly MAX_NAME_LEN = 20;
	static readonly VALID_NAME_CHARS =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_";
	static readonly MAX_EMAIL_LEN = 50;
	static readonly MIN_PASSWORD_LEN = 8;

	/**
	 * Signs up or creates a new user. This checks the passed credentials first
	 * for invalidity before calling {@linkcode authService}
	 *
	 * @param name name of the user
	 * @param email email of the user
	 * @param password password of the account
	 * @param token creation token
	 * @returns hook response {@linkcode HookResponse}
	 * @error SIGNUP_NAME_TOO_SHORT if the given name is shorter than {@linkcode MIN_NAME_LEN}
	 * @error SIGNUP_NAME_TOO_LONG if the given name is longer than {@linkcode MAX_NAME_LEN}
	 * @error SIGNUP_NAME_HAS_INVALID_CHARS if the given name contains chars not in {@linkcode VALID_NAME_CHARS}
	 * @error SIGNUP_EMAIL_EMPTY if the given email is empty
	 * @error SIGNUP_EMAIL_INVALID_FORMAT if the given email is not in a valid email format
	 * @error SIGNUP_PASSWORD_TOO_SHORT if the given password is shorter than {@linkcode MIN_PASSWORD_LEN}
	 * @error SIGNUP_TOKEN_EMPTY if the token provided is empty
	 * @error SIGNUP_TOKEN_INVALID_FORMAT if the token provided is not in a valid UUID format
	 * @error SIGNUP_AUTH_NETWORK_ERROR for signup action errors
	 * @error GENERAL_FATAL_ERROR for unexpected errors
	 */
	public static async signup(
		name: string,
		email: string,
		password: string,
		token: string,
	): Promise<HookResponse<null>> {
		if (name.length < AuthManager.MIN_NAME_LEN) {
			let errorMessage = `Name must have at least ${AuthManager.MIN_NAME_LEN} characters`;

			if (name.length === 0) errorMessage = "Name cannot be empty";

			return errorResponse("SIGNUP_NAME_TOO_SHORT", errorMessage);
		}

		if (name.length > AuthManager.MAX_NAME_LEN)
			return errorResponse(
				"SIGNUP_NAME_TOO_LONG",
				`Name can't be longer than ${AuthManager.MAX_NAME_LEN} characters`,
			);

		const nameHasInvalidChars = [...name].some(
			(c) => !AuthManager.VALID_NAME_CHARS.includes(c),
		);

		if (nameHasInvalidChars)
			return errorResponse(
				"SIGNUP_NAME_HAS_INVALID_CHARS",
				`Name can only have the following characters: ${AuthManager.VALID_NAME_CHARS}`,
			);

		if (email.length === 0)
			return errorResponse("SIGNUP_EMAIL_EMPTY", "Email cannot be empty");

		const isValidEmail =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
				email,
			);

		if (!isValidEmail)
			return errorResponse(
				"SIGNUP_EMAIL_INVALID_FORMAT",
				"Email format is invalid",
			);

		if (password.length < AuthManager.MIN_PASSWORD_LEN)
			return errorResponse(
				"SIGNUP_PASSWORD_TOO_SHORT",
				`Password must have at least ${AuthManager.MIN_PASSWORD_LEN} characters`,
			);

		if (token.length === 0)
			return errorResponse("SIGNUP_TOKEN_EMPTY", "Token cannot be empty");

		const isTokenInUUIDFormat =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
				token,
			);

		if (!isTokenInUUIDFormat)
			return errorResponse(
				"SIGNUP_TOKEN_INVALID_FORMAT",
				"Token is not in a valid UUID format",
			);

		try {
			const response = await authService.signUp(
				name,
				email,
				password,
				token,
			);

			if (!response.isSuccessful) {
				const responseCode: ResponseErrorCode =
					response.code === "AUTH_ERROR"
						? "SIGNUP_AUTH_NETWORK_ERROR"
						: "GENERAL_FATAL_ERROR";

				return errorResponse(responseCode, response.error);
			}

			return successResponse(null);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unexpected error occured while signing up";

			return errorResponse("SIGNUP_AUTH_FATAL_ERROR", errorMessage);
		}
	}

	/**
	 * Signs in a user using the provided credentials
	 *
	 * @param email email of the account
	 * @param password password of the account
	 * @returns hook response {@linkcode HookResponse} with the authenticated user's id
	 * @error LOGIN_EMAIL_EMPTY if the given email is empty
	 * @error LOGIN_PASSWORD_EMPTY if the given password is empty
	 * @error LOGIN_AUTH_INVALID_CREDS if authentication fails
	 * @error GENERAL_FATAL_ERROR for unexpected errors
	 */
	public static async login(
		email: string,
		password: string,
	): Promise<HookResponse<string>> {
		if (email.length === 0)
			return errorResponse("LOGIN_EMAIL_EMPTY", "Email cannot be empty");

		if (password.length === 0)
			return errorResponse(
				"LOGIN_PASSWORD_EMPTY",
				"Password cannot be empty",
			);

		try {
			const response = await authService.logIn(email, password);

			if (!response.isSuccessful)
				return errorResponse(
					"LOGIN_AUTH_INVALID_CREDS",
					response.error,
				);

			return successResponse(response.additional);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unexpected error occured while logging in";

			return errorResponse("GENERAL_FATAL_ERROR", errorMessage);
		}
	}

	/**
	 * Signs out the currently authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse}
	 * @error LOGOUT_AUTH_FATAL_ERROR if logout fails or an unexpected error occurs
	 * @error GENERAL_FATAL_ERROR for other unexpected errors
	 */
	public static async logout(): Promise<HookResponse<null>> {
		try {
			const response = await authService.logOut();

			if (!response.isSuccessful)
				return errorResponse("LOGOUT_AUTH_FATAL_ERROR", response.error);

			return successResponse(null);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unexpected error occured while logging out";

			return errorResponse("GENERAL_FATAL_ERROR", errorMessage);
		}
	}

	/**
	 * Checks whether a user is currently authenticated
	 *
	 * @returns hook response {@linkcode HookResponse} with the authenticated user's id
	 * @error GENERAL_AUTH_NO_USER_FOUND if no user is currently authenticated
	 * @error GENERAL_FATAL_ERROR for unexpected errors
	 */
	public static async isAuthenticated(): Promise<HookResponse<string>> {
		try {
			const response = await authService.isAuthenticated();

			if (!response.isSuccessful)
				return errorResponse(
					"GENERAL_AUTH_NO_USER_FOUND",
					"No user signed in",
				);

			return successResponse(response.additional.userId);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unexpected error occured while checking authentication";

			return errorResponse("GENERAL_FATAL_ERROR", errorMessage);
		}
	}
}

export default AuthManager;
