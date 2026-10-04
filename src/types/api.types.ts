export type APIErrorCode =
	| "NETWORK_ERROR"
	| "SIGNUP_ERROR"
	| "INVALID_CREDS"
	| "LOGOUT_ERROR"
	| "AUTH_ERROR"
	| "QUERY_ERROR"
	| "GENERAL_ERROR"
	| "MAPPER_ERROR";

export type StatusResponse = {
	isSuccessful: boolean;
	status: {
		code: string;
		message: string;
		additional: string[];
	};
};

/**
 * A basic object that's either a success or an error response. This is used from the API layer to logic or
 * application layer
 */
export type APIResponse<T> =
	| {
			isSuccessful: true;
			code: "SUCCESS";
			message: string;
			additional: T;
	  }
	| {
			isSuccessful: false;
			code: APIErrorCode;
			error: string;
			additional?: T;
	  };

/**
 * Creates an Error APIResponse object
 *
 * @param error error object passed from a catch block
 * @param errorCode type of error identified, GENERAL_ERROR by default
 * @param fallbackMessage error message if the error provided is invalid, "An unknown error occured" by default
 * @returns api response {@linkcode APIResponse}
 */
export function createAPIErrorResponse<T>(
	error: string | unknown,
	fallbackMessage: string = "An unknown error occured",
	errorCode: APIErrorCode = "GENERAL_ERROR",
): APIResponse<T> {
	let errorMessage: string;
	if (error instanceof Error) errorMessage = error.message;
	else if (error instanceof Object) errorMessage = fallbackMessage;
	else errorMessage = fallbackMessage;

	return {
		isSuccessful: false,
		code: errorCode,
		error: errorMessage,
	};
}

/**
 * Creates a Success APIResponse object
 *
 * @param message success message to be returned
 * @param data data to pass from a successful operation, undefined by default
 * @returns api response {@linkcode APIResponse}
 */
export function createAPISuccessResponse<T>(
	message: string,
	data: T,
): APIResponse<T> {
	return {
		isSuccessful: true,
		code: "SUCCESS",
		message: message,
		additional: data,
	};
}
