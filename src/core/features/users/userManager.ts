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
	/**
	 * Fetches user based on the given id
	 *
	 * @param userId id of the target user
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode User}
	 * @error GENERAL_QUERY_ERROR if the user can't be fetched
	 * @error GENERAL_FATAL_ERROR if an unexpected error occured during fetching
	 */
	public static async getUserById(
		userId: string,
	): Promise<HookResponse<User>> {
		const response = await userService.getUserById(userId);
		if (!response.isSuccessful) {
			if (response.code === "QUERY_ERROR")
				return errorResponse("GENERAL_QUERY_ERROR", response.error);
			return errorResponse("GENERAL_FATAL_ERROR", response.error);
		}
		return successResponse(User.createFromAccount(response.additional));
	}

	/**
	 * Fetches authenticated user and returns a user instance
	 *
	 * @returns hook response {@linkcode HookResponse} with data {@linkcode User}
	 * @error GENERAL_AUTH_NO_USER_FOUND if no authenticated user is found
	 * @error GENERAL_QUERY_ERROR if error occurs while getting the user
	 * @error GENERAL_FATAL_ERROR if an unexpected error occurs
	 */
	public static async getCurrentUser(): Promise<HookResponse<User>> {
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

	/**
	 * Fetches all stored users
	 *
	 * @returns hook response {@linkcode HookResponse} with array data of {@linkcode User}
	 * @error GENERAL_QUERY_ERROR if users can't be fetched
	 * @error GENERAL_FATAL_ERROR if an unexpected error occured during fetching
	 */
	public static async getAllUsers(): Promise<HookResponse<User[]>> {
		const response = await userService.getAllUsers();
		if (!response.isSuccessful) {
			if (response.code === "QUERY_ERROR")
				return errorResponse("GENERAL_QUERY_ERROR", response.error);
			return errorResponse("GENERAL_FATAL_ERROR", response.error);
		}
		return successResponse(
			response.additional.map((user) => User.createFromAccount(user)),
		);
	}
}

export default UserManager;
