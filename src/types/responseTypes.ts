// Very friendly responses for presentation layer pals

// RESPONSE ERROR SYNTAX
// CATEGORY-FIELD-ERROR_SOURCE
export type ResponseErrorCode =
	// ====== useAuth Errors ======= //
	| "SIGNUP_NAME_TOO_SHORT"
	| "SIGNUP_NAME_TOO_LONG"
	| "SIGNUP_NAME_HAS_INVALID_CHARS"
	| "SIGNUP_EMAIL_EMPTY"
	| "SIGNUP_EMAIL_INVALID_FORMAT"
	| "SIGNUP_PASSWORD_TOO_SHORT"
	| "SIGNUP_TOKEN_EMPTY"
	| "SIGNUP_TOKEN_INVALID_FORMAT"
	| "SIGNUP_AUTH_NETWORK_ERROR"
	| "SIGNUP_AUTH_FATAL_ERROR"
	| "LOGIN_EMAIL_EMPTY"
	| "LOGIN_PASSWORD_EMPTY"
	| "LOGIN_AUTH_INVALID_CREDS"
	| "LOGOUT_AUTH_FATAL_ERROR"
	// ===== useTimer Errors ===== //
	| "TIMER_INVALID_STATE"
	| "TIMER_START_FAILED"
	// ===== Realtime Errors ====== //
	| "REALTIME_SUBSCRIPTION_ERROR"
	| "REALTIME_UNSUBSCRIPTION_ERROR"
	// ===== General Errors ====== //
	| "GENERAL_AUTH_NO_USER_FOUND"
	| "GENERAL_QUERY_ERROR"
	| "GENERAL_NETWORK_ERROR"
	| "GENERAL_FATAL_ERROR"
	| "GENERAL_INIT_ERROR";

// Used by Hook <-> App <-> Logic
export type HookResponseError = { code: ResponseErrorCode; message: string };
export type HookResponse<T> = {
	data?: T | null;
	error?: HookResponseError | null;
};

// Used by Presentation <-> Hook
export type HookOperationStatus = "idle" | "loading";
export type HookOperationState<T> = {
	status: HookOperationStatus;
	error: HookResponseError | null;
	data?: T;
};
export type HookOperation<T, Args extends unknown[] = []> = {
	execute: (...args: Args) => Promise<void>;
	state: HookOperationState<T>;
};

// ====== FOR HOOK RESPONSES =========== //
export function errorResponse<T>(
	code: ResponseErrorCode,
	message: string,
): HookResponse<T> {
	return {
		data: undefined,
		error: {
			code: code,
			message: message.toLocaleUpperCase(),
		},
	};
}

export function successResponse<T>(data: T) {
	return {
		data: data,
		error: null,
	};
}

// ======= FOR HOOK OPS ============ //
export function createHookOperation<T, Args extends unknown[] = []>(
	func: (...args: Args) => Promise<void>,
	isLoading: boolean,
	error: HookResponseError | null | undefined,
	data: T | undefined | null,
): HookOperation<T, Args> {
	return {
		execute: func,
		state: {
			status: isLoading ? "loading" : "idle",
			error: error ?? null,
			data: data ?? undefined,
		},
	};
}
