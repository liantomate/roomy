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
	| "LOGOUT_AUTH_FATAL_ERROR";

export type HookResponse<T> = {
	data?: T | null;
	error?: { code: ResponseErrorCode; message: string } | null;
};

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
