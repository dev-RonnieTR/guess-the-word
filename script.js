const output = document.getElementById("output");
const randomButton = document.getElementById("random-button");
const resetButton = document.getElementById("reset-button");
const randomsLeftSpan = document.getElementById("randoms-left");
const currentTry = document.getElementById("current-try");
const circles = [...document.getElementsByClassName("circle")];

let tries;
let resetGame; //Becomes true if user clicks resetButton
let resetWord; //Becomes true if user clicks randomButton
let shortcircuit;
let randomsLeft = 3;

startGame();

async function startGame() {
	resetFlagsAndMarkers();
	await startRounds();
	endGame();
}

async function startRounds() {
	for (let i = 1; i <= 10; i++) {
		//Round 1 to 10
		do {
			await startCurrentRound();
			if (tries > 5 || resetGame) {
				return;
				//If all tries were used, or if resetGame was clicked, startRounds() exits
			}
			if (resetWord) {
				randomsLeft--; //Player loses one randomizer
				randomsLeftSpan.textContent = randomsLeft;
				if (randomsLeft === 0) {
					//If player random count reaches 0, randomButton is disabled
					randomButton.classList.remove("button");
					randomButton.classList.add("button--disabled");
				}
			}
		} while (resetWord); //If randomButton was clicked, the do-while loop starts over
	}
}

function resetFlagsAndMarkers() {
	resetGame = false;
	resetWord = false;
	tries = 1;
	currentTry.textContent = tries;
	randomsLeft = 3;
	randomsLeftSpan.textContent = randomsLeft;
	randomButton.classList.add("button");
	randomButton.classList.remove("button--disabled");
	circles.forEach((circle) => circle.classList.remove("circle--active"));
}

function endGame() {
	if (resetGame) {
		setTimeout(startGame, 1000); //Allows current startGame() iteration to finish before running startGame() again
		return;
	}
	if (tries > 5) {
		alert("You lose");
	} else {
		alert("🎉 Success!!!");
	}
	setTimeout(startGame, 1000); //Allows startGame() to fully finish before starting again, avoiding recursion
	return;
}

async function startCurrentRound() {
	resetWord = false; //Sets to false in case player had used the randomButton in previous round
	word = await fetchWord();
	output.textContent = scrambleWord(word); //Displays scrambled word
	const boxes = createInputBoxes(word.length);

	await gameLogic(word, boxes);
	return;
}

async function gameLogic(word, boxes) {
	const mistakes = document.getElementById("mistakes");
	mistakes.textContent = "";
	let inputs = [];
	shortcircuit = false;
	do {
		circles[tries - 1].classList.add("circle--active");
		mistakes.textContent += `${inputs.join("")}\n`;
		boxes.forEach((box) => (box.textContent = "")); //Clear box content when trying again
		inputs = []; //Clears inputs when trying again
		currentTry.textContent = tries;

		await (async () => {
			for (let i = 0; i < boxes.length; i++) {
				boxes[i].classList.add("input-box--active");
				const userInput = await detectUserInput();
				boxes[i].classList.remove("input-box--active");
				if (userInput === "Backspace") {
					inputs.pop();
					i--; //Decreases one so next iteration of loop is the same index as the current
					if (i >= 0) {
						boxes[i].textContent = ""; //Deletes input of the previous iteration
						i--; //Decrease once more so now the next iteration of loop will go one index backwards
					}
				} else if (userInput === "reset") {
					resetGame = true;
					shortcircuit = true;
					return;
				} else if (userInput === "randomize") {
					resetWord = true;
					shortcircuit = true;
					return;
				} else {
					boxes[i].textContent = userInput;
					inputs.push(userInput);
				}
			}
		})();
		if (shortcircuit) {
			break;
		}
		retry = inputs.join("") !== word;
		tries = retry ? tries + 1 : tries;
	} while (retry && tries <= 5);

	return;
}

function createInputBoxes(length) {
	const inputBoxes = document.getElementById("input-boxes");
	inputBoxes.innerHTML = ""; //Clears HTML before next boxes
	for (let i = 1; i <= length; i++) {
		inputBoxes.innerHTML += `<div class="input-box"></div>`; //Displays input boxes
	}
	return [...document.getElementsByClassName("input-box")];
}

async function detectUserInput() {
	return new Promise((resolve) => {
		//Function won't exit until user has performed a valid input
		document.onkeydown = (event) => {
			if (/^[a-zA-Z]$/.test(event.key)) {
				document.onkeydown = null; // Remove the event listener after the first valid key press
				resolve(event.key.toLowerCase()); // Resolve the promise with the key
			} else if (event.key === "Backspace") {
				document.onkeydown = null;
				resolve(event.key);
			}
		};
		resetButton.onclick = () => {
			resolve("reset");
		};
		if (randomsLeft > 0) {
			//Random button is only enabled if player hasn't used all randomizers
			randomButton.onclick = () => {
				resolve("randomize");
			};
		}
	});
}

function scrambleWord(word) {
	const array = word.split("");

	//Fisher-Yates Shuffle Method
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	const scrambledWord = array.join("");
	return scrambledWord;
}

async function fetchWord() {
	try {
		let word;
		do {
			const res = await fetch("https://random-word-api.vercel.app/api?words=1");
			const data = await res.json();
			word = data[0]; // Extract the word from the array
		} while (word.length > 6); // Ensures the word is at most 6 letters long
		return word;
	} catch (error) {
		console.error("Error fetching word:", error);
		return;
	}
}
