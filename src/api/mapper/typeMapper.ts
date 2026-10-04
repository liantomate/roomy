/**
 * This module handles mapping of raw JSON data returned from the backend to organized data in the frontend,
 * handling case and data conversion
 */

import type {
	AccountStats,
	ActiveSession,
	PublicAccount,
	Session,
} from "../../types/database.types";
import type { TimerStatus } from "../../types/timerTypes";

// ===== Response Types ===== //

export type PublicAccountResponse = {
	user_id: string;
	name: string;
	join_date: string;
};

export type AccountStatsResponse = {
	user_id: string;
	total_session_period: string;
	total_session_count: string;
	last_session_date: string;
};

export type ActiveSessionResponse = {
	session_owner: string;
	session_date: string;
	status: string;
	duration: string;
	last_tick: string;
	last_time: string;
};

export type SessionResponse = {
	session_id: string;
	session_owner: string;
	session_date: string;
	session_details: string;
	duration: string;
};

// ===== UTIL FUNCTIONS ===== //

/**
 * Converts a string to a TimerStatus, returning a fallback value if none matches
 *
 * @param status string to convert
 * @param fallback TimerStatus value if status does not match any existing TimerStatus value
 * @returns equivalent TimerStatus / {@linkcode TimerStatus}
 */
function mapStringToTimerStatus(
	status: string,
	fallback: TimerStatus = "idle",
): TimerStatus {
	const loweredStatus = status.toLowerCase();
	if (loweredStatus === "idle") return "idle";
	if (loweredStatus === "running") return "running";
	if (loweredStatus === "paused") return "paused";
	return fallback;
}

// ===== MAPPER FUNCTIONS ===== //

/**
 * Maps raw JSON return to a PublicAccount object
 *
 * @param rawData valid public account response / {@linkcode PublicAccountResponse}
 * @returns mapped data {@linkcode PublicAccount}
 */
export const mapPublicAccount = (
	rawData: PublicAccountResponse,
): PublicAccount => {
	return {
		userId: rawData.user_id,
		name: rawData.name,
		joinDate: new Date(rawData.join_date),
	};
};

/**
 * Maps raw JSON return to an AccountStats object
 *
 * @param rawData valid account stats response / {@linkcode AccountStatsResponse}
 * @returns mapped data {@linkcode AccountStats}
 */
export const mapAccountStats = (
	rawData: AccountStatsResponse,
): AccountStats => {
	return {
		userId: rawData.user_id,
		totalSessionPeriod: Number(rawData.total_session_period),
		totalSessionCount: Number(rawData.total_session_count),
		lastSessionDate: new Date(rawData.last_session_date),
	};
};

/**
 * Maps raw JSON return to an ActiveSession object
 *
 * @param rawData valid active session response / {@linkcode ActiveSessionResponse}
 * @returns mapped data {@linkcode ActiveSession}
 */
export const mapActiveSession = (
	rawData: ActiveSessionResponse,
): ActiveSession => {
	return {
		sessionOwner: rawData.session_owner,
		sessionDate: new Date(rawData.session_date),
		status: mapStringToTimerStatus(rawData.status),
		duration: Number(rawData.duration),
		lastTick: new Date(rawData.last_tick),
		lastTime: Number(rawData.last_time),
	};
};

/**
 * Maps raw JSON return to an Session object
 *
 * @param rawData valid session response / {@linkcode SessionResponse}
 * @returns mapped data {@linkcode Session}
 */
export const mapSession = (rawData: SessionResponse): Session => {
	return {
		sessionId: rawData.session_id,
		sessionOwner: rawData.session_owner,
		sessionDate: new Date(rawData.session_date),
		sessionDetails: rawData.session_details,
		duration: Number(rawData.duration),
	};
};
