import { useEffect, useState } from "react";
import {
	createHookOperation,
	type HookResponseError,
} from "../types/responseTypes";
import AuthManager from "../core/features/auth/authManager";

export function useAuth() {
	const [isAuthenticated, setAuthenticated] = useState(false);

	const [authError, setAuthError] = useState<HookResponseError>();
	const [signupError, setSignupError] = useState<HookResponseError>();
	const [loginError, setLoginError] = useState<HookResponseError>();
	const [logoutError, setLogoutError] = useState<HookResponseError>();

	const [isInitializing, setInitializing] = useState(false);
	const [isSigningUp, setSigningUp] = useState(false);
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isLoggingOut, setLoggingOut] = useState(false);

	useEffect(() => {
		async function initialize() {
			setInitializing(true);
			setAuthError(undefined);

			try {
				const response = await AuthManager.isAuthenticated();
				setAuthenticated(response.data != null);
				if (response.error) setAuthError(response.error);
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
		setSignupError(undefined);

		try {
			const response = await AuthManager.signup(
				name,
				email,
				password,
				token,
			);
			if (response.error) setSignupError(response.error);
			else setAuthenticated(true);
		} finally {
			setSigningUp(false);
		}
	}

	async function login(email: string, password: string) {
		setLoggingIn(true);
		setLoginError(undefined);

		try {
			const response = await AuthManager.login(email, password);
			if (response.error) setLoginError(response.error);
			else setAuthenticated(true);
		} finally {
			setLoggingIn(false);
		}
	}

	async function logout() {
		setLoggingOut(true);
		setLogoutError(undefined);

		try {
			const response = await AuthManager.logout();
			if (response.error) setLogoutError(response.error);
			else setAuthenticated(false);
		} finally {
			setLoggingOut(false);
		}
	}

	return {
		init: createHookOperation<boolean, []>(
			async () => {},
			isInitializing,
			authError,
			isAuthenticated,
		),

		signup: createHookOperation<
			null,
			[name: string, email: string, password: string, token: string]
		>(
			async (
				name: string,
				email: string,
				password: string,
				token: string,
			) => {
				await signup(name, email, password, token);
			},
			isSigningUp,
			signupError,
			null,
		),

		login: createHookOperation<null, [email: string, password: string]>(
			async (email: string, password: string) => {
				await login(email, password);
			},
			isLoggingIn,
			loginError,
			null,
		),

		logout: createHookOperation<null, []>(
			async () => {
				await logout();
			},
			isLoggingOut,
			logoutError,
			null,
		),
	};
}
