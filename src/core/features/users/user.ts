import sessionService from "../../../api/services/sessionService";
import statsService from "../../../api/services/statsService";
import userService from "../../../api/services/userService";
import type {
	AccountStats,
	ActiveSession,
	Session,
} from "../../../types/database.types";
import {
	errorResponse,
	successResponse,
	type HookResponse,
} from "../../../types/responseTypes";

class User {
	public readonly id: string;
	public readonly name: string;
	public readonly joinDate: Date;

	private constructor(id: string, name: string, joinDate: Date) {
		this.id = id;
		this.name = name;
		this.joinDate = joinDate;
	}

	public static async create(id: string): Promise<HookResponse<User>> {
		const response = await userService.getUserById(id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(
			new User(
				id,
				response.additional.name,
				response.additional.joinDate,
			),
		);
	}

	public async getActiveSession(): Promise<HookResponse<ActiveSession>> {
		const response = await sessionService.getActiveSessionById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	public async getHistory(): Promise<HookResponse<Session[]>> {
		const response = await sessionService.getUserHistoryById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}

	public async getStats(): Promise<HookResponse<AccountStats>> {
		const response = await statsService.getStatsById(this.id);
		if (!response.isSuccessful)
			return errorResponse("GENERAL_QUERY_ERROR", response.error);

		return successResponse(response.additional);
	}
}

export default User;
