import { useEffect, useState } from "react";
import type { ReadOnlyUser, User } from "../core/features/users/user";
import type { ActiveSession, Session } from "../types/database.types";
import userApp from "../apps/userApp";
import {
	createHookOperation,
	type HookResponseError,
} from "../types/responseTypes";

type UserData = {
	currentUser: ReadOnlyUser | undefined;
	users: ReadOnlyUser[] | undefined;
};

function useUsers() {
	const [initError, setInitError] = useState<HookResponseError>();
	const [sessionError, setSessionError] = useState<HookResponseError>();
	const [historyError, setHistoryError] = useState<HookResponseError>();

	const [isUserInit, setUserInit] = useState(false);
	const [isFetchingSession, setFetchingSession] = useState(false);
	const [isFetchingHistory, setFetchingHistory] = useState(false);

	const [fetchedUserSession, setFetchedUserSession] =
		useState<ActiveSession>();
	const [fetchedUserHistory, setFetchedUserHistory] = useState<Session[]>();

	useEffect(() => {
		const initUserApp = async () => {
			setUserInit(true);
			setInitError(undefined);

			try {
				const response = await userApp.init();
				if (response.error) {
					setInitError(response.error);
					return;
				}
			} finally {
				setUserInit(false);
			}
		};
		initUserApp();
	}, []);

	async function fetchUserSessionById(id: string) {
		if (isFetchingSession) {
			setSessionError({
				code: "GENERAL_FATAL_ERROR",
				message: "Another session is currently being fetched",
			});
			return;
		}
		setFetchingSession(true);
		setSessionError(undefined);

		try {
			const user = userApp.getUserById(id);
			if (!user) {
				setSessionError({
					code: "GENERAL_QUERY_ERROR",
					message: `User of ID: ${id} not found`,
				});
				return;
			}

			const response = await user.getActiveSession();
			if (response.error) {
				setSessionError(response.error);
				return;
			}

			setFetchedUserSession(response.data ?? undefined);
		} finally {
			setFetchingHistory(false);
		}
	}

	async function fetchUserHistoryById(id: string) {
		if (isFetchingHistory) {
			setHistoryError({
				code: "GENERAL_FATAL_ERROR",
				message: "Another session history is currently being fetched",
			});
			return;
		}
		setFetchingHistory(true);
		setHistoryError(undefined);

		try {
			const user = userApp.getUserById(id);
			if (!user) {
				setHistoryError({
					code: "GENERAL_QUERY_ERROR",
					message: `User of ID: ${id} not found`,
				});
				return;
			}

			const response = await user.getHistory();
			if (response.error) {
				setHistoryError(response.error);
				return;
			}

			setFetchedUserHistory(response.data ?? undefined);
		} finally {
			setFetchingHistory(false);
		}
	}

	const user: User | null | undefined = userApp.getCurrentUser();
	const userData: UserData = {
		currentUser: user?.getReadOnlyUser() ?? undefined,
		users: userApp.getAllReadOnlyUsers() ?? undefined,
	};

	return {
		init: createHookOperation<UserData, []>(
			async () => {},
			isUserInit,
			initError,
			userData,
		),

		fetchCurrentUserSession: createHookOperation<
			ActiveSession | undefined,
			[]
		>(
			async () => {
				await fetchUserSessionById(user?.id ?? "unauthenticated_user");
			},
			isFetchingSession,
			sessionError,
			fetchedUserSession,
		),

		fetchUserSessionById: createHookOperation<
			ActiveSession | undefined,
			[id: string]
		>(
			async (id: string) => {
				await fetchUserSessionById(id);
			},
			isFetchingSession,
			sessionError,
			fetchedUserSession,
		),

		fetchCurrentUserHistory: createHookOperation<Session[] | undefined, []>(
			async () => {
				await fetchUserHistoryById(user?.id ?? "unauthenticated_user");
			},
			isFetchingHistory,
			historyError,
			fetchedUserHistory,
		),

		fetchUserHistoryById: createHookOperation<
			Session[] | undefined,
			[id: string]
		>(
			async (id: string) => {
				await fetchUserHistoryById(id);
			},
			isFetchingHistory,
			historyError,
			fetchedUserHistory,
		),
	};
}

export default useUsers;
