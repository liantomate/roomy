import { useEffect, useState, useSyncExternalStore } from "react";
import {
	createHookOperation,
	type HookResponseError,
} from "../types/responseTypes";
import AuthManager from "../core/features/auth/authManager";

type AuthSnapshot = {
	isAuthenticated: boolean;
	initialized: boolean;
	initError: HookResponseError | undefined;
};

/**
 * Handles authentication snapshot {@linkcode AuthSnapshot} management, allowing multi-instance
 * communication among useAuth usages
 */
class AuthStore {
	private snapshot: AuthSnapshot = {
		isAuthenticated: false,
		initialized: false,
		initError: undefined,
	};

	private listeners = new Set<() => void>();

	/**
	 * Sets snapshot data and updates listeners
	 *
	 * @param isAuthenticated true if user has been authenticated, false otherwise
	 * @param error returned error from auth operation
	 */
	public setInitialized(isAuthenticated: boolean, error?: HookResponseError) {
		this.snapshot = {
			...this.snapshot,
			isAuthenticated,
			initialized: error == null,
			initError: error,
		};
		this.listeners.forEach((callback) => callback());
	}

	/**
	 * Sets whether or not user is authenticated and updates listeners. This is a more
	 * specific version of {@linkcode AuthStore.setInitialized}
	 *
	 * @param isAuthenticated true if user has been authenticated, false otherwise
	 */
	public setAuthenticated(isAuthenticated: boolean) {
		this.setInitialized(isAuthenticated, undefined);
	}

	/**
	 * @returns authentication data {@linkcode AuthSnapshot} at the instance
	 */
	public getSnapshot = (): AuthSnapshot => {
		return this.snapshot;
	};

	/**
	 * Adds subscribers for auth data changes
	 *
	 * @param callback change listeners
	 * @returns unsubscription function
	 */
	public subscribe = (callback: () => void): (() => void) => {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	};
}

const authStore = new AuthStore();
let initialization: Promise<void> | undefined;

/**
 * Initializes auth by checking if a user is authenticated and only does so once by design
 *
 * @returns void promise
 */
async function initializeAuth(): Promise<void | undefined> {
	if (initialization) return initialization;

	async function init() {
		try {
			const response = await AuthManager.isAuthenticated();
			authStore.setInitialized(
				response.data != null,
				response.error ?? undefined,
			);
		} catch (err: unknown) {
			authStore.setInitialized(false, {
				code: "GENERAL_INIT_ERROR",
				message: "An unknown auth error occured",
			});
		}
	}

	initialization = init();
	return initialization;
}

/**
 * Returns authentication-related actions and data
 *
 * @returns hooks operations {@linkcode HookOperation} for: init, signup, login, logout
 */
export function useAuth() {
	const authSnapshot = useSyncExternalStore(
		authStore.subscribe,
		authStore.getSnapshot,
	);

	const [signupError, setSignupError] = useState<HookResponseError>();
	const [loginError, setLoginError] = useState<HookResponseError>();
	const [logoutError, setLogoutError] = useState<HookResponseError>();

	const [isSigningUp, setSigningUp] = useState(false);
	const [isLoggingIn, setLoggingIn] = useState(false);
	const [isLoggingOut, setLoggingOut] = useState(false);

	useEffect(() => {
		initializeAuth();
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
			else authStore.setAuthenticated(true);
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
			else authStore.setAuthenticated(true);
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
			else authStore.setAuthenticated(false);
		} finally {
			setLoggingOut(false);
		}
	}

	return {
		init: createHookOperation<boolean, []>(
			async () => {},
			false,
			authSnapshot.initError,
			authSnapshot.isAuthenticated,
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
