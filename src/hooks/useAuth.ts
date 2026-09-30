import { useEffect, useState } from "react";
import { type HookResponseError } from "../types/responseTypes";
import AuthManager from "../core/features/auth/authManager";

type AuthOperations = {
	signup: (
		name: string,
		email: string,
		password: string,
		token: string,
	) => void;
	login: (email: string, password: string) => void;
	logout: () => void;
};

export function useAuth() {
	const [isAuthenticated, setAuthenticated] = useState(false);
	const [error, setError] = useState<HookResponseError>();

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
			if (response.error) setError(response.error);
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
			if (response.error) setError(response.error);
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
			if (response.error) setError(response.error);
			else setAuthenticated(false);
		} finally {
			setLoggingOut(false);
		}
	}

	const authOperations: AuthOperations = {
		signup: signup,
		login: login,
		logout: logout,
	};

	return {
		error: error,

		isInitializing: isInitializing,
		isSigningUp: isSigningUp,
		isLoggingIn: isLoggingIn,
		isLoggingOut: isLoggingOut,

		isAuthenticated: isAuthenticated,
		authOperations: authOperations,
	};
}
