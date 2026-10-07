import AuthManager from "../core/features/auth/authManager";
import { ReadOnlyUser, type User } from "../core/features/users/user";
import userManager from "../core/features/users/userManager";
import UserManager from "../core/features/users/userManager";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../types/responseTypes";

class UserApp {
	private static instance: UserApp | null = null;

	private isReady: Promise<HookResponse<null>>;

	private constructor() {
		this.isReady = this.init();
	}

	public static getInstance(): UserApp {
		return (UserApp.instance ??= new UserApp());
	}

	public async ready(): Promise<HookResponse<null>> {
		return this.isReady;
	}

	public async init(): Promise<HookResponse<null>> {
		// Check auth first
		const authResponse = await AuthManager.isAuthenticated();
		if (authResponse.error)
			return errorResponse(
				authResponse.error.code,
				authResponse.error.message,
			);

		// Check if users can be fetched
		const fetchResponse = await UserManager.fetchUsers();
		if (fetchResponse.error)
			if (fetchResponse.error.code === "GENERAL_INIT_ERROR")
				console.error(fetchResponse.error);
			else return fetchResponse;

		// Set proper ID
		UserManager.checkAndSetUserId(authResponse.data!);

		return successResponse(null);
	}

	public getCurrentUser(): User | null {
		return null; // TODO: temporary fix
	}

	public getUserById(id: string): User | null {
		const users = UserManager.getAllUsers();
		if (!users) return null;

		for (const user of users) if (user.id === id) return user;
		return null;
	}

	public getReadOnlyUserById(id: string): ReadOnlyUser | undefined {
		const user = this.getUserById(id);
		return user ?? undefined;
	}

	public getAllUsers(): User[] | undefined {
		return userManager.getAllUsers();
	}

	public getAllReadOnlyUsers(): ReadOnlyUser[] | undefined {
		const readOnlyUsers: ReadOnlyUser[] = [];
		const users = UserManager.getAllUsers();
		if (!users) return undefined;

		for (const user of users) readOnlyUsers.push(user.getReadOnlyUser());
		return readOnlyUsers;
	}
}

export default UserApp.getInstance();
