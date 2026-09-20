import { DummySecTimeSource } from "../../src/core/features/timer/timerSource.ts";
import {
	ModeCounter,
	ModeTimer,
} from "../../src/core/features/timer/timerMode.ts";
import TimerEngine from "../../src/core/features/timer/timerEngine.ts";

export function startTimerTest() {
	const source = new DummySecTimeSource();
	TimerEngine.start(new ModeCounter(60), source);

	console.assert(
		TimerEngine.getStatus() === "running",
		`Timer expected a status of running, returned ${TimerEngine.getStatus()}`,
	);

	const currentTime = TimerEngine.getTimeSec();
	console.assert(
		currentTime === 0,
		`Timer expected to start at 0, returned ${currentTime}`,
	);
}

export function elapsedTimeTest() {
	const source = new DummySecTimeSource();

	TimerEngine.reset();
	TimerEngine.start(new ModeCounter(60), source);

	source.advance(5);

	const currentTime = TimerEngine.getTimeSec();
	console.assert(
		currentTime === 5,
		`Counter expected 5 seconds, returned: ${currentTime}`,
	);
}

export function pausedTimerTest() {
	const source = new DummySecTimeSource();

	TimerEngine.start(new ModeCounter(60), source);

	source.advance(7);

	TimerEngine.pause();

	source.advance(10);

	const currentTime = TimerEngine.getTimeSec();
	console.assert(
		currentTime === 7,
		`Pausing shouldn't count, expected 7, returned ${currentTime}`,
	);
}

export function resumeTimerTest() {
	const source = new DummySecTimeSource();

	TimerEngine.start(new ModeCounter(60), source);

	source.advance(8);
	TimerEngine.pause();

	source.advance(14);

	TimerEngine.resume();

	source.advance(3);

	const currentTime = TimerEngine.getTimeSec();
	console.assert(
		currentTime === 11,
		`Timer should count again after resuming, expected 11, returned ${currentTime}`,
	);
}

export function countdownTest() {
	const source = new DummySecTimeSource();

	TimerEngine.start(new ModeTimer(60), source);

	source.advance(5);

	const currentTime = TimerEngine.getDisplayTimeSec();
	console.assert(
		currentTime === 55,
		`Countdown expected 55 seconds, returned ${currentTime}`,
	);
}

export function completeTimerTest() {
	const source = new DummySecTimeSource();

	const mode = new ModeTimer(60);

	TimerEngine.start(mode, source);

	source.advance(59);

	console.assert(
		!mode.isCompleted(1),
		"Timer should not be complete before reaching its cap",
	);

	source.advance(1);

	console.assert(mode.isCompleted(0), "Timer should be complete at its cap");
}

export function completeCounterTest() {
	const source = new DummySecTimeSource();

	const mode = new ModeCounter(60);

	TimerEngine.start(mode, source);

	source.advance(59);

	console.assert(
		!mode.isCompleted(59),
		"Timer should not be complete before reaching its cap",
	);

	source.advance(1);

	console.assert(mode.isCompleted(60), "Timer should be complete at its cap");
}

export function invalidTimerOpsTest() {
	const source = new DummySecTimeSource();

	TimerEngine.pause();

	console.assert(
		TimerEngine.getStatus() === "idle",
		"Pausing an idle timer should do nothing",
	);

	TimerEngine.resume();

	console.assert(
		TimerEngine.getStatus() === "idle",
		"Resuming an idle timer should do nothing",
	);

	TimerEngine.reset();
	TimerEngine.start(new ModeCounter(60_000), source);

	TimerEngine.start(new ModeCounter(120_000), source);

	console.assert(
		TimerEngine.getStatus() === "running",
		"Starting an already running timer should do nothing",
	);
}
