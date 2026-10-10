import { useEffect, useState } from "react";
import type { ReadOnlyUser } from "../core/features/users/user";
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

	const [fetchedUsers, setFetchedUsers] = useState<ReadOnlyUser[]>();
	const [fetchedUserSession, setFetchedUserSession] =
		useState<ActiveSession>();
	const [fetchedUserHistory, setFetchedUserHistory] = useState<Session[]>();

	useEffect(() => {
		const initUser = async () => {
			setUserInit(true);
			setFetchedUsers(undefined);
			setInitError(undefined);

			let users: ReadOnlyUser[] = [];
			try {
				const response = await userApp.getCurrentUser();
				if (response.error) {
					setInitError(response.error);
					return;
				}

				users.push(response.data!.getReadOnlyUser());

				const fetchAllResponse = await userApp.getAllUsers();
				if (fetchAllResponse.error) {
					setInitError(fetchAllResponse.error);
					return;
				}

				fetchAllResponse.data!.map((user) =>
					users.push(user.getReadOnlyUser()),
				);
			} finally {
				setUserInit(false);
			}
		};

		initUser();
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
			const user = await userApp.getUserById(id);
			if (user.error) {
				setSessionError(user.error);
				return;
			}

			const response = await user.data!.getActiveSession();
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
			const user = await userApp.getUserById(id);
			if (user.error) {
				setHistoryError(user.error);
				return;
			}

			const response = await user.data!.getHistory();
			if (response.error) {
				setHistoryError(response.error);
				return;
			}

			setFetchedUserHistory(response.data ?? undefined);
		} finally {
			setFetchingHistory(false);
		}
	}

	const hasFetchedUsers = fetchedUsers && fetchedUsers.length > 0;
	const currentUser = hasFetchedUsers ? fetchedUsers[0] : undefined;
	const userData: UserData = {
		currentUser: currentUser,
		users: hasFetchedUsers ? fetchedUsers.slice(1) : undefined,
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
				await fetchUserSessionById(
					currentUser?.id ?? "unauthenticated_user",
				);
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
				await fetchUserHistoryById(
					currentUser?.id ?? "unauthenticated_user",
				);
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
