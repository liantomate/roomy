export function formatTimeMMSS(timeValue: number): string {
	const divided = timeValue / 60;
	const minute = Math.floor(divided);
	const seconds = Math.round((divided - minute) * 60);

	return (
		minute.toString().padStart(2, "0") +
		":" +
		seconds.toString().padStart(2, "0")
	);
}
