import {
	zeroFormatsAsDoubleZeroTest,
	singleDigitSecondPaddedTest,
	tenSecondsTest,
	singleDigitMinutePaddedTest,
	exactMinuteTest,
	multipleMinutesTest,
	justBeforeMinuteRolloverTest,
	justAfterMinuteRolloverTest,
	fiftyNineMinutesFiftyNineSecondsTest,
	sixtyMinutesTest,
	largeValueTest,
	noFloatingPointLeakTest,
	noDecimalInOutputTest,
	negativeInputTest,
} from "./timerUtilTests.ts";

const tests = [
	zeroFormatsAsDoubleZeroTest,
	singleDigitSecondPaddedTest,
	tenSecondsTest,
	singleDigitMinutePaddedTest,
	exactMinuteTest,
	multipleMinutesTest,
	justBeforeMinuteRolloverTest,
	justAfterMinuteRolloverTest,
	fiftyNineMinutesFiftyNineSecondsTest,
	sixtyMinutesTest,
	largeValueTest,
	noFloatingPointLeakTest,
	noDecimalInOutputTest,
	negativeInputTest,
];

for (const [index, test] of tests.entries()) {
	console.log("TEST #", index + 1);
	test();
}
