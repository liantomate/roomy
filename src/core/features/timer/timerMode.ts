export interface TimerMode {
	readonly timeCap: number;

	getTimeValue(elapsedTime: number): number;
	isCompleted(deltaTime: number): boolean;
	getTimeValueCapped(elapsedTime: number): number;
}

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
