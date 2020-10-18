textToType = document.querySelector("text_to_type");
textIn = document.querySelector("input");
wordCount = 2;
mistakes = 0;
wordsTyped = 0;
timerStarted = false;
function generateWords() {
	newText = "";
	wordsArray = [];
	currentWordNum = 0;
	currentWordLetterNum = 0;
	for (let i = 0; i < wordCount; i++) {
		randomWordNum = Math.round(Math.random() * wordList.length);
		wordsArray.push(wordList[randomWordNum]);
		// newText += `<word${i}>${wordList[randomWordNum]}</word${i}> `;
		wordToAdd = wordList[randomWordNum];
		newText += `<word${i}>`;
		for (let j = 0; j < wordToAdd.length; j++) {
			newText += `<letter${j}>${wordToAdd[j]}</letter${j}>`;
		}
		newText += `</word${i}> `;
	}
	textToType.innerHTML = newText;
	document.querySelector(`word${currentWordNum}`).style.color = "black";
	getWordLetter(currentWordNum, currentWordLetterNum).style.borderLeft = "";
	// setTimeout(() => {
	// }, 1);
}

function addListeners() {
	textIn.addEventListener("keydown", (event) => {
		if (event.keyCode == 8) {
			textInVal = textIn.value;
			console.log(event);
			letterInVal = textInVal.slice(textInVal.length - 2, textInVal.length - 1); // Get the second last key when backspace is pressed
			if (currentWordLetterNum != 0) {
				elementExists(getWordLetter(currentWordNum, currentWordLetterNum)) && (getWordLetter(currentWordNum, currentWordLetterNum).style.borderLeft = "");
				document.querySelector(`word${currentWordNum}`).style.borderRight = "";
				currentWordLetterNum = textInVal.length - 1;

				if (!event.ctrlKey) {
					currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);
					currentLetterElement.style.borderLeft = "1px solid black";
					currentLetterElement.style.color = "black";
				} else {
					wordLettersElements = document.querySelector(`word${currentWordNum}`).children;
					for (let i = 0; i < wordLettersElements.length; i++) {
						wordLettersElements[i].style.color = "black";
						currentWordLetterNum = 0;
						textIn.value = "";
					}
				}
			}
		}
	});

	textIn.addEventListener("keypress", (event) => {
		// textIn.style.opacity = 0;
		currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);
		letterInVal = event.key;
		textInVal = textIn.value + letterInVal;
		currentWordLetterNum = textInVal.length - 1;
		console.log(event.key, event.keyCode);

		timerStarted == false && (timerStarted = true) && timer.resume();

		console.log(textInVal, wordsArray[currentWordNum], wordsArray.length, currentWordNum + 1);

		if (textInVal == wordsArray[currentWordNum] && wordsArray.length <= currentWordNum + 1) {
			// if the end is reached
			textIn.value = ""; // Clear the input
			currentWordLetterNum = 0; // Reset the letter number to the first index (0)
			wordsTyped++;
			timer.stop();
			timerStarted = false;
			generateWords();
			event.stopPropagation();
			event.preventDefault();
		} else if ((event.keyCode == 13 || event.keyCode == 32) && textInVal.trim() == wordsArray[currentWordNum]) {
			event.stopPropagation();
			event.preventDefault();

			textIn.value = ""; // Clear the input
			currentWordLetterNum = 0; // Reset the letter number to the first index (0)
			wordsTyped++;
			document.querySelector("wpm").innerHTML = Math.round((60 / (timer.timerElapsed / 1000)) * wordsTyped, 2); // Calc wpm

			document.querySelector(`word${currentWordNum}`).style.borderRight = "";
			if (elementExists(getWordLetter(++currentWordNum, 0))) {
				nextWordLetter = getWordLetter(currentWordNum, 0);
				nextWordLetter.style.borderLeft = "1px solid black";
			}
			document.querySelector(`word${currentWordNum}`).style.color = "black";
		} else {
			if (event.key == wordsArray[currentWordNum][currentWordLetterNum]) {
				currentLetterElement.style.color = "green";
				textIn.style.borderBottomColor = "green";
			} else {
				currentLetterElement.style.color = "red";
				textIn.style.borderBottomColor = "indianred";
				mistakes++;
				updateMistakes();
			}

			currentLetterElement.style.borderLeft = "";
			if (elementExists(getWordLetter(currentWordNum, currentWordLetterNum + 1))) {
				nextWordLetter = getWordLetter(currentWordNum, currentWordLetterNum + 1);
				nextWordLetter.style.borderLeft = "1px solid black";
			} else {
				document.querySelector(`word${currentWordNum}`).style.borderRight = "1px solid black";
				document.querySelector(`word${currentWordNum}`).style.color = "black";
			}
			currentWordLetterNum++;
			currentLetterElement.style.borderLeft = "";
		}
	});
}

function updateMistakes() {
	document.querySelector("mistakes").innerHTML = mistakes;
}

function getWordLetter(wordIndex, letterIndex) {
	return document.querySelector(`word${wordIndex}`).querySelector(`letter${letterIndex}`);
}

function elementExists(el) {
	if (typeof el != "undefined" && el != null) return true;
	else return false;
}

generateWords();
addListeners();

timeEl = document.querySelector("time");

timer = {
	timerElapsed: 0, //ms
	updateInterval: 1000,
	start: () => {
		timer.timerElapsed = 0;
		timerInterval = setInterval(() => {
			timer.timerElapsed += timer.updateInterval;
			timeEl.innerHTML = timer.timerElapsed / 1000;
		}, timer.updateInterval);
	},
	stop: () => {
		clearInterval(timerInterval);
	},
	resume: () => {
		timerInterval = setInterval(() => {
			timer.timerElapsed += timer.updateInterval;
			timeEl.innerHTML = timer.timerElapsed / 1000;
		}, timer.updateInterval);
	},
};
