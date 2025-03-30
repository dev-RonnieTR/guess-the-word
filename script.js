const output = document.getElementById("output");
const randomButton = document.getElementById("randomButton");
const resetButton = document.getElementById("reset-button");

let tries;
let resetGame = false; //Becomes true if user clicks resetButton
startGame();

async function startGame() {
	resetGame = false;
	tries = 1;
	await (async () => {
		for (let i = 1; i <= 10; i++) {
			await setCurrentWord();
			if (tries > 5 || resetGame) {
				break; 
			//If all tries were used, or if resetGame was clicked, the loop stops and the game won't generate more words
			}
		}
	})();

	if (resetGame) {
		setTimeout(startGame, 1000); //Allows current startGame() iteration to finish before running startGame() again
		return;
	}

	if (tries > 5) {
		alert("You lose");
	} else {
		alert("You win!");
	}
	setTimeout(startGame, 1000); //Allows startGame() to fully finish before starting again, avoiding recursion
	return;
}

async function setCurrentWord() {
	word = await fetchWord();
	output.textContent = scrambleWord(word); //Displays scrambled word
	const boxes = createInputBoxes(word.length);

	await gameLogic(word, boxes);
	return;
}

async function gameLogic(word, boxes) {
	let inputs = [];
	currentTry = document.getElementById("current-try");

	do {
		boxes.forEach((box) => {
			box.textContent = "";
		}); //Clear box content when trying again
		inputs = []; //Clears inputs when trying again
		currentTry.textContent = tries;

		await (async () => {
			for (let i = 0; i < boxes.length; i++) {
				boxes[i].classList.add("input-box--active");
				const userInput = await detectUserInput();
				boxes[i].classList.remove("input-box--active");
				if (userInput === "Backspace") {
					i--; //Decreases one so next iteration of loop is the same index as the current
					if (i >= 0) {
						boxes[i].textContent = ""; //Deletes input of the previous iteration
						i--; //Decrease once more so now the next iteration of loop will go one index backwards
					}
				} else if (userInput === "reset") {
					resetGame = true;
					return;
					//Shortcircuits the parent function and the while loop
				} else {
					boxes[i].textContent = userInput;
					inputs.push(userInput);
				}
			}
		})();
		if (!resetGame) {
			retry = inputs.join("") !== word;
			tries = retry ? tries + 1 : tries;
		}
	} while (inputs.join("") !== word && tries <= 5 && !resetGame);

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
