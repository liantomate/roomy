export type APIErrorCode =
	| "NETWORK_ERROR"
	| "SIGNUP_ERROR"
	| "INVALID_CREDS"
	| "LOGOUT_ERROR";
export type APISuccessCode = "SUCCESS" | "SUCCESS WITH ERROR";

export type StatusResponse = {
	isSuccessful: boolean;
	status: {
		code: string;
		message: string;
		additional: string[];
	};
};

export type APIResponse =
	| {
			isSuccessful: true;
			code: APISuccessCode;
			message: string;
			additional: string[];
	  }
	| {
			isSuccessful: false;
			code: APIErrorCode;
			error: string;
			additional: string[];
	  };
