import type {
	AccountStats,
	ActiveSession,
	PublicAccount,
	Session,
} from "../../types/database.types";

export const mapPublicAccount = (rawData: any): PublicAccount => {
	return {
		userId: rawData.user_id,
		name: rawData.name,
		joinDate: new Date(rawData.join_date),
	};
};

export const mapAccountStats = (rawData: any): AccountStats => {
	return {
		userId: rawData.user_id,
		totalSessionPeriod: Number(rawData.total_session_period),
		totalSessionCount: Number(rawData.total_session_count),
		lastSessionDate: new Date(rawData.last_session_date),
	};
};

export const mapActiveSession = (rawData: any): ActiveSession => {
	return {
		sessionOwner: rawData.session_owner,
		sessionDate: new Date(rawData.session_date),
		status: rawData.status,
		duration: Number(rawData.duration),
		lastTick: new Date(rawData.last_tick),
		lastTime: Number(rawData.last_time),
	};
};

export const mapSession = (rawData: any): Session => {
	return {
		sessionId: rawData.session_id,
		sessionOwner: rawData.session_owner,
		sessionDate: new Date(rawData.session_date),
		sessionDetails: rawData.session_details,
		duration: Number(rawData.duration),
	};
};
