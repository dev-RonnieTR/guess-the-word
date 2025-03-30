let tries;
startGame();

async function startGame() {
	tries = 1;
	const wordArray = await getAllWords(); //Contains array filled with word objects.
	await (async () => {
		for (const word of wordArray) {
			await setCurrentWord(word);
			if (tries > 5) {
				break;
			}
		}
	})();

	if (tries > 5) {
		alert("You lose");
	} else {
		alert("You win!");
	}
	startGame();
	return;
}

async function setCurrentWord(word) {
	const output = document.getElementById("output");
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
			for (const box of boxes) {
				box.classList.add("input-box--active");
				const userInput = await detectUserInput();
				box.textContent = userInput;
				inputs.push(userInput);
				box.classList.remove("input-box--active");
			}
		})();
		retry = inputs.join("") !== word;
		tries = retry ? tries + 1 : tries;
	} while (inputs.join("") !== word && tries <= 5);

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
			}
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

async function getAllWords() {
	const wordPromises = Array.from({ length: 10 }, () => fetchWord()); //Creates array of 10 elements, where each elements fetches a word
	const wordsFetched = await Promise.all(wordPromises); //Waits for all words to be fetched before continuing

	return wordsFetched;
}
