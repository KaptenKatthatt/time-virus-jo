const padZero = (num: number) => {
	return num.toString().padStart(2, "0");
};
export const timeFormatter = (time: number) => {
	const seconds = Math.floor(time / 1000);
	const hundredths = Math.floor((time % 1000) / 10);
	return `${padZero(seconds)}:${padZero(hundredths)}`;
};
