import AuthManager from "../core/features/auth/authManager";
import type User from "../core/features/users/user";
import UserManager from "../core/features/users/userManager";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../types/responseTypes";

class UserApp {
	private static instance: UserApp | null = null;

	private hasInit: boolean = false;

	private constructor() {}

	public static getInstance(): UserApp {
		return (UserApp.instance ??= new UserApp());
	}

	public async init(): Promise<HookResponse<null>> {
		// Check auth first
		const authResponse = await AuthManager.isAuthenticated();
		if (authResponse.error)
			return errorResponse(
				authResponse.error.code,
				authResponse.error.message,
			);

		// Set proper ID
		UserManager.checkAndSetUserId(authResponse.data!);

		// Check if users can be fetched
		const fetchResponse = await UserManager.fetchUsers();
		if (fetchResponse.error)
			if (fetchResponse.error.code === "GENERAL_INIT_ERROR")
				console.error(fetchResponse.error);
			else return fetchResponse;

		this.hasInit = true;
		return successResponse(null);
	}

	public reset() {
		this.hasInit = false;
		UserManager.resetUserManager();
	}

	public isInitialized(): boolean {
		return this.hasInit;
	}

	public getCurrentUser(): User | undefined | null {
		if (!this.hasInit) return null;
		return UserManager.getCurrentUser();
	}

	public getAllUsers(): User[] | undefined {
		if (!this.hasInit) return undefined;
		return UserManager.getAllUsers();
	}
}

export default UserApp.getInstance();
