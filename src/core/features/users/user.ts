import sessionService from "../../../api/services/sessionService";
import statsService from "../../../api/services/statsService";
import userService from "../../../api/services/userService";
import type {
	AccountStats,
	ActiveSession,
	PublicAccount,
	Session,
} from "../../../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";

/**
 * Represents public user data, unlike {@linkcode PublicAccount}, it contains
 * methods to connect the user to its corresponding stats, active session, and
 * session history
 */
export class User {
	public readonly id: string;
	public readonly name: string;
	public readonly joinDate: Date;

	/**
	 * @param id identifier of the account
	 * @param name name of the account
	 * @param joinDate account creation date
	 */
	private constructor(id: string, name: string, joinDate: Date) {
		this.id = id;
		this.name = name;
		this.joinDate = joinDate;
	}

	/**
	 * Creates a User object from a {@linkcode PublicAccount} object
	 *
	 * @param pubAccount public account data {@linkcode PublicAccount}
	 * @returns user object with the passed data {@linkcode User}
	 */
	public static createFromAccount(pubAccount: PublicAccount): User {
		return new User(
			pubAccount.userId,
			pubAccount.name,
			pubAccount.joinDate,
		);
	}

	/**
	 * Creates a User object from an existing ID
	 *
	 * @param id id of the user to fetch
	 * @returns hook response {@linkcode HookResponse} with user data {@linkcode User}
	 * @error GENERAL_QUERY_ERROR if the user with the given ID cannot be found
	 */
	public static async createFromId(id: string): Promise<HookResponse<User>> {
		const response = await userService.getUserById(id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		const user = this.createFromAccount(response.additional);
		return successResponse(user);
	}

	/**
	 * Fetches the active session of the user, if any
	 *
	 * @returns hook response {@linkcode HookResponse} with active session {@linkcode ActiveSession}
	 * @error GENERAL_QUERY_ERROR if an active session of the user cannot be found
	 */
	public async getActiveSession(): Promise<HookResponse<ActiveSession>> {
		const response = await sessionService.getActiveSessionById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	/**
	 * Fetches the history of the user
	 *
	 * @returns hook response {@linkcode HookResponse} with session array {@linkcode Session}
	 * @error GENERAL_QUERY_ERROR if the sessions of the user cannot be found
	 */
	public async getHistory(): Promise<HookResponse<Session[]>> {
		const response = await sessionService.getUserHistoryById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	/**
	 * Fetches the stats of the user
	 *
	 * @returns hook response {@linkcode HookResponse} with account stats {@linkcode AccountStats}
	 * @error GENERAL_QUERY_ERROR if the stats of the user cannot be found
	 */
	public async getStats(): Promise<HookResponse<AccountStats>> {
		const response = await statsService.getStatsById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	/**
	 * @returns read only user {@linkcode ReadOnlyUser} container of this object
	 */
	public getReadOnlyUser(): ReadOnlyUser {
		return new ReadOnlyUser(this.id, this.name, this.joinDate);
	}
}

/**
 * Container class for {@linkcode User} that only contains public readonly
 * attributes of a user, not providing fetching methods like the user class
 */
export class ReadOnlyUser {
	public readonly id: string;
	public readonly name: string;
	public readonly joinDate: Date;

	/**
	 * @param id identifier of the account
	 * @param name name of the account
	 * @param joinDate account creation date
	 */
	public constructor(id: string, name: string, joinDate: Date) {
		this.id = id;
		this.name = name;
		this.joinDate = joinDate;
	}
}
