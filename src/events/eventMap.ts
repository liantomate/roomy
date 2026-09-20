export interface EventArgs {}

export interface TimerEvents extends EventArgs {
	tick: {
		time: number;
	};
}
