/**
 * Handles how the elapsed time of a TimerEngine will be displayed (direction-wise)
 */
export interface TimerMode {
	readonly timeCap: number;

	/**
	 * Returns elapsed time with respect to the format of this mode
	 * @param elapsedTime time since the timer started (in seconds)
	 * @returns mode-modified elapsed time (number)
	 */
	getTimeValue(elapsedTime: number): number;

	/**
	 * @param deltaTime time since the timer started (in seconds)
	 * @returns true if the timer exceeds the cap boundary (depending on mode implementation), false otherwise
	 */
	isCompleted(deltaTime: number): boolean;

	/**
	 * Returns clamped version of {@linkcode getTimeValue}
	 *
	 * @param elapsedTime time since the timer started (in seconds)
	 * @returns clamped mode-modified elapsed time
	 */
	getTimeValueCapped(elapsedTime: number): number;
}

/**
 * Mode for the timer counting down
 */
export class ModeTimer implements TimerMode {
	readonly timeCap: number;
	public constructor(timeCap: number) {
		this.timeCap = timeCap;
	}

	getTimeValue(elapsedTime: number): number {
		return this.timeCap - elapsedTime;
	}

	getTimeValueCapped(elapsedTime: number): number {
		const timeValue = this.getTimeValue(elapsedTime);
		return timeValue <= 0 ? 0 : timeValue;
	}

	isCompleted(deltaTime: number): boolean {
		return deltaTime <= 0;
	}
}

/**
 * Mode for the timer counting up
 */
export class ModeCounter implements TimerMode {
	readonly timeCap: number;
	public constructor(timeCap: number) {
		this.timeCap = timeCap;
	}

	getTimeValue(elapsedTime: number): number {
		return elapsedTime;
	}

	getTimeValueCapped(elapsedTime: number): number {
		const timeValue = this.getTimeValue(elapsedTime);
		return timeValue >= this.timeCap ? this.timeCap : timeValue;
	}

	isCompleted(deltaTime: number): boolean {
		return deltaTime >= this.timeCap;
	}
}
