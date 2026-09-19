import { formatTimeMMSS } from "../../src/core/utils/TimerUtil.ts";

export function zeroFormatsAsDoubleZeroTest() {
	console.assert(
		formatTimeMMSS(0) === "00:00",
		`Expected 00:00, returned ${formatTimeMMSS(0)}`,
	);
}

export function singleDigitSecondPaddedTest() {
	console.assert(
		formatTimeMMSS(5) === "00:05",
		`Expected 00:05, returned ${formatTimeMMSS(5)}`,
	);
}

export function tenSecondsTest() {
	console.assert(
		formatTimeMMSS(10) === "00:10",
		`Expected 00:10, returned ${formatTimeMMSS(10)}`,
	);
}

export function singleDigitMinutePaddedTest() {
	console.assert(
		formatTimeMMSS(65) === "01:05",
		`Expected 01:05, returned ${formatTimeMMSS(65)}`,
	);
}

export function exactMinuteTest() {
	console.assert(
		formatTimeMMSS(60) === "01:00",
		`Expected 01:00, returned ${formatTimeMMSS(60)}`,
	);
}

export function multipleMinutesTest() {
	console.assert(
		formatTimeMMSS(125) === "02:05",
		`Expected 02:05, returned ${formatTimeMMSS(125)}`,
	);
}

export function justBeforeMinuteRolloverTest() {
	console.assert(
		formatTimeMMSS(59) === "00:59",
		`Expected 00:59, returned ${formatTimeMMSS(59)}`,
	);
}

export function justAfterMinuteRolloverTest() {
	console.assert(
		formatTimeMMSS(61) === "01:01",
		`Expected 01:01, returned ${formatTimeMMSS(61)}`,
	);
}

export function fiftyNineMinutesFiftyNineSecondsTest() {
	console.assert(
		formatTimeMMSS(3599) === "59:59",
		`Expected 59:59, returned ${formatTimeMMSS(3599)}`,
	);
}

export function sixtyMinutesTest() {
	console.assert(
		formatTimeMMSS(3600) === "60:00",
		`Expected 60:00, returned ${formatTimeMMSS(3600)}`,
	);
}

export function largeValueTest() {
	console.assert(
		formatTimeMMSS(6000) === "100:00",
		`Expected 100:00, returned ${formatTimeMMSS(6000)}`,
	);
}

export function noFloatingPointLeakTest() {
	console.assert(
		formatTimeMMSS(125) === "02:05",
		`Float drift on 125, returned ${formatTimeMMSS(125)}`,
	);
	console.assert(
		formatTimeMMSS(245) === "04:05",
		`Float drift on 245, returned ${formatTimeMMSS(245)}`,
	);
	console.assert(
		formatTimeMMSS(3661) === "61:01",
		`Float drift on 3661, returned ${formatTimeMMSS(3661)}`,
	);
}

export function noDecimalInOutputTest() {
	const result = formatTimeMMSS(125);
	console.assert(
		!result.includes("."),
		`Expected no decimal in output, returned ${result}`,
	);
}

export function negativeInputTest() {
	console.assert(
		typeof formatTimeMMSS(-5) === "string",
		`Negative input should not throw, returned ${formatTimeMMSS(-5)}`,
	);
}
