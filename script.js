startGame();

async function startGame() {
	const wordArray = await getAllWords(); //Contains array filled with word objects.
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
	const wordPromises = Array.from({ length: 20 }, () => fetchWord()); //Creates array of 20 elements, where each elements fetches a word
	const wordsFetched = await Promise.all(wordPromises); //Waits for all words to be fetched before continuing

	const words = wordsFetched.map((wordFetched) => ({
		word: wordFetched,
		length: wordFetched.length,
	}));

	return words;
}
