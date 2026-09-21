// Very friendly responses for presentation layer pals

// RESPONSE ERROR SYNTAX
// CATEGORY-FIELD-ERROR_SOURCE
export type ResponseErrorCode =
	| "SIGNUP_NAME_TOO_SHORT"
	| "SIGNUP_NAME_TOO_LONG"
	| "SIGNUP_NAME_HAS_INVALID_CHARS"
	| "SIGNUP_EMAIL_INVALID_FORMAT"
	| "SIGNUP_PASSWORD_TOO_SHORT"
	| "SIGNUP_AUTH_NETWORK_ERROR"
	| "SIGNUP_AUTH_FATAL_ERROR"
	| "LOGIN_AUTH_INVALID_CREDS"
	| "LOGOUT_AUTH_FATAL_ERROR"
	| "AUTH_NO_USER_FOUND";

export type HookResponse<T> = {
	data?: T | null;
	error?: { code: ResponseErrorCode; message: string } | null;
};

export type TernaryHookState = "idle" | "loading" | "done";

export function errorResponse<T>(
	code: ResponseErrorCode,
	message: string,
): HookResponse<T> {
	return {
		data: undefined,
		error: {
			code: code,
			message: message,
		},
	};
}

export function successResponse<T>(data: T) {
	return {
		data: data,
		error: null,
	};
}

export function generalResponse<T>(
	data: T | null = null,
	code: ResponseErrorCode | null = null,
	message: string | null = null,
): HookResponse<T> {
	return {
		data: data,
		error:
			!code || !message
				? null
				: {
						code: code!,
						message: message!,
					},
	};
}

export function generalResponseFromArr<T>(
	data: T | null = null,
	error: [ResponseErrorCode, string] | null = null,
): HookResponse<T> {
	return generalResponse(
		data,
		error ? error[0] : null,
		error ? error[1] : null,
	);
}
