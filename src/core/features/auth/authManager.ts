import authService from "../../../api/services/authService";
import {
	errorResponse,
	successResponse,
	type HookResponse,
	type ResponseErrorCode,
} from "../../../types/responseTypes";

class AuthManager {
	static readonly MIN_NAME_LEN = 3;
	static readonly MAX_NAME_LEN = 20;
	static readonly VALID_NAME_CHARS =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_";
	static readonly MAX_EMAIL_LEN = 50;
	static readonly MIN_PASSWORD_LEN = 8;

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

		const nameHasInvalidChars = name
			.split(" ")
			.some((c) => !AuthManager.VALID_NAME_CHARS.includes(c));
		if (nameHasInvalidChars)
			return errorResponse(
				"SIGNUP_NAME_HAS_INVALID_CHARS",
				`Name can only have the following characters: ${AuthManager.VALID_NAME_CHARS}`,
			);

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

		const response = await authService.signUp(name, email, password, token);

		if (!response.isSuccessful) {
			let responseCode: ResponseErrorCode | null = null;
			if (response.code === "AUTH_ERROR")
				responseCode = "SIGNUP_AUTH_NETWORK_ERROR";
			else responseCode = "SIGNUP_AUTH_FATAL_ERROR";

			return errorResponse(responseCode!, response.error);
		}

		return successResponse(null);
	}

	public static async login(
		email: string,
		password: string,
	): Promise<HookResponse<string>> {
		const response = await authService.logIn(email, password);
		if (!response.isSuccessful)
			return errorResponse("LOGIN_AUTH_INVALID_CREDS", response.error);
		return successResponse(response.additional.userId);
	}

	public static async logout(): Promise<HookResponse<null>> {
		const response = await authService.logOut();
		if (!response.isSuccessful)
			return errorResponse("LOGOUT_AUTH_FATAL_ERROR", response.error);
		return successResponse(null);
	}

	public static async isAuthenticated(): Promise<HookResponse<string>> {
		const response = await authService.isAuthenticated();
		if (!response.isSuccessful)
			return errorResponse("AUTH_NO_USER_FOUND", "No user signed in");
		return successResponse(response.additional.userId);
	}
}

export default AuthManager;
