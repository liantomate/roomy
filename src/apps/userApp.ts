import { ReadOnlyUser, type User } from "../core/features/users/user";
import UserManager from "../core/features/users/userManager";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../types/responseTypes";

/**
 * Handles user-related fetching. For the meantime, this class only forwards {@linkcode UserManager}
 * functions to the hook layer
 */
class UserApp {
	private static instance: UserApp | null = null;

	private constructor() {}

	public static getInstance(): UserApp {
		return (UserApp.instance ??= new UserApp());
	}

	/**
	 * Fetches the authenticated user
	 *
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode User}
	 * @error errors returnable by {@linkcode UserManager.getCurrentUser}
	 */
	public async getCurrentUser(): Promise<HookResponse<User>> {
		const response = await UserManager.getCurrentUser();
		if (response.error) return response;
		return successResponse(response.data);
	}

	/**
	 * Fetches user with the given id
	 *
	 * @param id id of the target user
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode User}
	 * @error errors returnable by {@linkcode UserManager.getUserById}
	 */
	public async getUserById(id: string): Promise<HookResponse<User>> {
		const response = await UserManager.getUserById(id);
		if (response.error) return response;
		return successResponse(response.data);
	}

	/**
	 * Fetches user with the given id as {@linkcode ReadOnlyUser}
	 *
	 * @param id id of the target user
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode ReadOnlyUser}
	 * @error GENERAL_FATAL_ERROR if no user data is returned from fetch
	 * @error errors returnable by {@linkcode UserManager.getUserById}
	 */
	public async getReadOnlyUserById(
		id: string,
	): Promise<HookResponse<ReadOnlyUser>> {
		const response = await this.getUserById(id);
		if (response.error) return response;
		if (!response.data)
			return errorResponse(
				"GENERAL_FATAL_ERROR",
				"Fetched user returned no data",
			);
		return successResponse(response.data.getReadOnlyUser());
	}

	/**
	 * Fetches all users
	 *
	 * @returns hook response {@linkcode HookResponse} with array data of {@linkcode User}
	 * @error errors returnable by {@linkcode UserManager.getAllUsers}
	 */
	public async getAllUsers(): Promise<HookResponse<User[]>> {
		const response = await UserManager.getAllUsers();
		if (response.error) return response;
		return successResponse(response.data);
	}

	/**
	 * Fetches all users as an array of {@linkcode ReadOnlyUser}
	 *
	 * @returns hook response {@linkcode HookResponse} with array data of {@linkcode ReadOnlyUser}
	 * @error GENERAL_FATAL_ERROR if no user data is returned from fetch
	 * @error errors returnable by {@linkcode UserManager.getAllUsers}
	 */
	public async getAllReadOnlyUsers(): Promise<HookResponse<ReadOnlyUser[]>> {
		const response = await this.getAllUsers();
		if (response.error) return response;
		if (!response.data)
			return errorResponse(
				"GENERAL_FATAL_ERROR",
				"Fetched user returned no data",
			);
		return successResponse(
			response.data.map((user) => user.getReadOnlyUser()),
		);
	}
}

export default UserApp.getInstance();
