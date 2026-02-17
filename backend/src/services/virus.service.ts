// Calculate virus position and delay until outbreak
export const summonVirus = () => {
	const randX = Math.floor(Math.random() * 10);
	const randY = Math.floor(Math.random() * 10);
	const delay = Math.floor(Math.random() * 3000);
	return { x: randX, y: randY, delay: delay };
};
