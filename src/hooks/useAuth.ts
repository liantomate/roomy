import { useEffect, useState } from "react";
import {
	type ResponseErrorCode,
	generalResponseFromArr,
} from "../types/responseTypes";
import AuthManager from "../core/features/auth/authManager";

export function useAuth() {
	const [isAuthenticated, setAuthenticated] = useState(false);
	const [error, setError] = useState<[ResponseErrorCode, string]>();

	const [isInitializing, setInitializing] = useState(false);
	const [isSigningUp, setSigningUp] = useState(false);
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isLoggingOut, setLoggingOut] = useState(false);

	useEffect(() => {
		async function initialize() {
			setInitializing(true);
			setError(undefined);

			try {
				const response = await AuthManager.isAuthenticated();
				setAuthenticated(response.data != null);
			} finally {
				setInitializing(false);
			}
		}

		initialize();
	}, []);

	async function signup(
		name: string,
		email: string,
		password: string,
		token: string,
	) {
		setSigningUp(true);
		setError(undefined);

		try {
			const response = await AuthManager.signup(
				name,
				email,
				password,
				token,
			);
			if (response.error)
				setError([response.error.code, response.error.message]);
			else setAuthenticated(true);
		} finally {
			setSigningUp(false);
		}
	}

	async function login(email: string, password: string) {
		setLoggingIn(true);
		setError(undefined);

		try {
			const response = await AuthManager.login(email, password);
			if (response.error)
				setError([response.error.code, response.error.message]);
			else setAuthenticated(true);
		} finally {
			setLoggingIn(false);
		}
	}

	async function logout() {
		setLoggingOut(true);
		setError(undefined);

		try {
			const response = await AuthManager.logout();
			if (response.error)
				setError([response.error.code, response.error.message]);
			else setAuthenticated(false);
		} finally {
			setLoggingOut(false);
		}
	}

	return {
		isAuthenticated: isAuthenticated,
		isInitializing: isInitializing,

		signup: signup,
		isSigningUp: isSigningUp,

		login: login,
		isLoggingIn: isLoggingIn,

		logout: logout,
		isLoggingOut: isLoggingOut,

		authData: generalResponseFromArr(null, error),
	};
}
