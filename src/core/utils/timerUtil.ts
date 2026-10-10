/**
 * This module contains timer-related utility functions that help with formatting
 * timer behavior for timer-related pure logic modules
 */

/**
 * Formats the given time to MM:SS format (values padded to 2 digits)
 *
 * @param timeValue time value (in seconds)
 * @returns time formatted to MM:SS (string)
 */
export function formatTimeMMSS(timeValue: number): string {
	const divided = timeValue / 60;
	let minute = Math.floor(divided);
	minute = minute < 0 ? 0 : minute;
	let seconds = Math.round((divided - minute) * 60);
	seconds = seconds < 0 ? 0 : seconds;

	return (
		minute.toString().padStart(2, "0") +
		":" +
		seconds.toString().padStart(2, "0")
	);
}
