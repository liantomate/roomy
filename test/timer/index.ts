import TimerEngine from "../../src/core/features/timer/timerEngine.ts";
import {
	startTimerTest,
	elapsedTimeTest,
	pausedTimerTest,
	resumeTimerTest,
	countdownTest,
	completeTimerTest,
	completeCounterTest,
	invalidTimerOpsTest,
} from "./timerTests.ts";

const tests = [
	startTimerTest,
	elapsedTimeTest,
	pausedTimerTest,
	resumeTimerTest,
	countdownTest,
	completeTimerTest,
	completeCounterTest,
	invalidTimerOpsTest,
];

for (const [index, test] of tests.entries()) {
	TimerEngine.reset();
	console.log("TEST #", index + 1);
	test();
}
