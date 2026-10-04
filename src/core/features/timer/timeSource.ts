/**
 * Acts as the source of time for the TimerEngine
 */
export interface TimeSource {
	/**
	 * Returns the current time with respect to the source implementation
	 * @returns current time (in seconds)
	 */
	getTime(): number;
}

/**
 * TimeSource using the System Time (Unix) for its time source
 */
export class SystemSecTimeSource implements TimeSource {
	getTime(): number {
		return Date.now() / 1000;
	}
}

/**
 * TimeSource with adjustable time value for testing purposes
 */
export class DummySecTimeSource implements TimeSource {
	public timeValue: number = 0;

	getTime(): number {
		return this.timeValue;
	}

	/**
	 * Increments current time by the given time value
	 *
	 * @param time time skip (in seconds)
	 */
	advance(time: number): void {
		this.timeValue += time;
	}
}
