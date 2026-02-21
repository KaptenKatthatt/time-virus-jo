export interface PlayerCardReturn {
	element: HTMLDivElement;
	updateReactionTime: (reactionTime: number) => void;
	updateName: (name: string) => void;
}
