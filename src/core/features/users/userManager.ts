import userService from "../../../api/services/userService";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";
import { User } from "./user";

/**
 * Handles user-related fetching
 */
class UserManager {
	private static instance: UserManager | null = null;

	private size = 0;

	private users: Record<string, User> = {};
	private currentUserId: string = "";

	private constructor() {}

	public static getInstance() {
		return (this.instance ??= new UserManager());
	}

	// MUST BE CALLED FIRST
	public async fetchUsers(): Promise<HookResponse<null>> {
		const response = await userService.getAllUsers();
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		// Disallow multifetches for now, refresh page for another fetch
		// TODO: allow automated fetching soon after MVP
		if (this.size > 0)
			return errorResponse(
				"GENERAL_INIT_ERROR",
				"Users already fetched, refresh page to fetch new users",
			);

		for (const account of response.additional!) {
			const user = User.createFromAccount(account);
			this.users[user.id] = user;
		}

		this.size = Object.keys(this.users).length;

		return successResponse(null);
	}

	public resetUserManager() {
		this.size = 0;
		this.users = {};
		this.currentUserId = "";
	}

	public getSize(): number {
		return this.size;
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	public getUserById(userId: string): User | null {
		if (this.isEmpty()) return null;

		return this.users[userId] ?? null;
	}

	public checkAndSetUserId(userId: string): boolean {
		if (!this.users[userId]) return false;
		this.currentUserId = userId;
		return true;
	}

	/**
	 * Fetches authenticated user and returns a user instance
	 *
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode User}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user is found
	 * @error GENERAL_QUERY_ERROR if error occurs while getting the user
	 * @error GENERAL_FATAL_ERROR if an unexpected error occurs
	 */
	public async getCurrentUser(): Promise<HookResponse<User>> {
		const response = await userService.getCurrentUser();
		if (!response.isSuccessful) {
			if (response.code === "AUTH_ERROR")
				return errorResponse(
					"GENERAL_AUTH_NO_USER_FOUND",
					response.error,
				);
			if (response.code === "QUERY_ERROR")
				return errorResponse("GENERAL_QUERY_ERROR", response.error);
			return errorResponse("GENERAL_FATAL_ERROR", response.error);
		}

		return successResponse(User.createFromAccount(response.additional));
	}

	public getAllUsers(): User[] {
		return Object.values(this.users);
	}
}

export default UserManager.getInstance();
