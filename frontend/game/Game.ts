function Game(){ const render = () =>{

<div class="game-container container d-flex flex-column justify-content-around">
	<div class="row score-row justify-content-between">
		// Player 1 info
		<div class="col-auto player-info d-flex flex-column align-items-center">
			<span class="player-1-name display-6">Player 1</span>
			<span class="player-1-score display-2">8</span>

			<span class="player-1-best-time-heading"> Best time </span>
			<span class="player-1-best-time"> 1.37s </span>
		</div>

		// Timer and score
		<div class="col-auto time-rounds d-flex flex-column align-items-center">
			<span class="time display-1">00:00</span>

			<span class="rounds-heading">Round</span>

			<span class="rounds display-3"
				>3
				<span class="round-slash fs-4">/</span>
				<span class="rounds-total display-6">10</span>
			</span>
		</div>

		// Player 2 info
		<div class="col-auto player-info d-flex flex-column align-items-center">
			<span class="player-2-name display-6">Player 2</span>
			<span class="player-2-score display-2">3</span>
			<span class="player-2-best-time-heading"> Best time </span>
			<span class="player-2-best-time"> 1.37s </span>
		</div>
	</div>

	<div class="game-board"></div>
</div>

GameBoard() } }
