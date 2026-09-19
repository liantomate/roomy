export interface TimeSource {
	getTime(): number;
}

export class SystemSecTimeSource implements TimeSource {
	getTime(): number {
		return Date.now() / 1000;
	}
}

export class DummySecTimeSource implements TimeSource {
	public timeValue: number = 0;

	getTime(): number {
		return this.timeValue;
	}

	advance(time: number): void {
		this.timeValue += time;
	}
}
