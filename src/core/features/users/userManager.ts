import userService from "../../../api/services/userService";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";
import User from "./user";

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

		for (const account of response.additional!) {
			const user = await User.createFromAccount(account);
			this.users[user.data!.id] = user.data!;
		}

		this.size = Object.keys(this.users).length;

		return successResponse(null);
	}

	public getSize(): number {
		return this.size;
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	public getUserById(userId: string): User | null {
		if (this.isEmpty()) return null;

		return this.users[userId] || null;
	}

	public checkAndSetUserId(userId: string): boolean {
		if (!this.users[userId]) return false;
		this.currentUserId = userId;
		return true;
	}

	public getCurrentUser(): User | null {
		return this.getUserById(this.currentUserId);
	}

	public getAllUsers(): User[] {
		return Object.values(this.users);
	}
}

export default UserManager.getInstance();
