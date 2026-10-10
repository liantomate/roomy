import type { TimerModes, TimerStatus } from "./timerTypes";

export type TableNames =
	| "users"
	| "user_stats"
	| "active_sessions"
	| "session_history";

export type PublicAccount = {
	userId: string;
	name: string;
	joinDate: Date;
};

export type AccountStats = {
	userId: string;
	totalSessionPeriod: number;
	totalSessionCount: number;
	lastSessionDate: Date;
};

export type ActiveSession = {
	sessionOwner: string;
	sessionDate: Date;
	status: TimerStatus;
	duration: number;
	lastTick: Date;
	lastTime: number;
	timerMode: TimerModes;
	sessionDetails: string;
	timeCap: number;
};

export type Session = {
	sessionId: string;
	sessionOwner: string;
	sessionDate: Date;
	sessionDetails: string;
	duration: number;
};
