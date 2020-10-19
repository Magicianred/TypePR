textToType = document.querySelector("text_to_type");
textIn = document.querySelector("input");
wordCount = 10;
mistakes = 0;
wordsTyped = 0;
timerStarted = false;

incorrectLetterColor = "indianred";
correctLetterColor = "lightgreen";

mistakesAllowed = true;
wordsListLevel=0;    //0-easy 1-hard
wordListsList=[wordListEasy,wordListHard]

function generateWords() {
	newText = "";
	wordsArray = [];
	currentWordNum = 0;
	currentWordLetterNum = 0;
	wordList=wordListsList[wordsListLevel];
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
	document.querySelector(`word${currentWordNum}`).style.color = "inherit";
	textIn.style.backgroundColor="";
	// setTimeout(() => {
	// }, 1);
}

function addListeners() {
	textIn.addEventListener("keydown", (event) => {
		if (event.keyCode == 8) {
			textInVal = textIn.value.slice(0, -1);
			letterInVal = textInVal.slice(-1); // Get the last letter of the typed word after backspace has been accounted for.
			
			if (currentWordLetterNum != 0) {
				document.querySelector(`word${currentWordNum}`).style.borderRightWidth = "0px";
				currentWordLetterNum = textInVal.length;

				if (!event.ctrlKey) {
					currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);
					currentLetterElement.style.color = "inherit";
				} else {
					wordLettersElements = document.querySelector(`word${currentWordNum}`).children;
					for (let i = 0; i < wordLettersElements.length; i++) {
						wordLettersElements[i].style.color = "inherit";
						currentWordLetterNum = 0;
						textIn.value = "";
					}
					textIn.style.backgroundColor="";
				}
				console.log(textInVal,wordsArray[currentWordNum]);
				if (textInVal==wordsArray[currentWordNum].slice(0,textInVal.length)) {
					textIn.style.backgroundColor="";
				}
			}
		}
	});

	textIn.addEventListener("keypress", (event) => {
		if (event.keyCode == 13) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
		currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);
		letterInVal = event.key;
		textInVal = textIn.value + letterInVal;
		currentWordLetterNum = textInVal.length - 1;

		timerStarted == false && (timerStarted = true) && timer.resume();


		// If the  end is reached
		if (checkWordMatch(textInVal, wordsArray[currentWordNum]) && wordsArray.length <= currentWordNum + 1) {
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			timer.stop();
			timerStarted = false;
			generateWords();
		} else if ((event.keyCode == 13 || event.keyCode == 32) && checkWordMatch(textInVal, wordsArray[currentWordNum])) {
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			document.querySelector(`word${currentWordNum}`).style.borderRightWidth = "0px";
			if (elementExists(getWordLetter(++currentWordNum, 0))) {
				nextWordLetter = getWordLetter(currentWordNum, 0);
			}
			document.querySelector(`word${currentWordNum}`).style.color = "inherit";
		} else {
			if (event.key == wordsArray[currentWordNum][currentWordLetterNum]) {
				currentLetterElement.style.color = correctLetterColor;
			} else {
				if (textInVal.length<=wordsArray[currentWordNum].length) {
					currentLetterElement.style.color = incorrectLetterColor;
				}
				if (textInVal.length<=wordsArray[currentWordNum].length ||(textInVal.length>wordsArray[currentWordNum].length && !mistakesAllowed)) {
					
					textIn.style.background = incorrectLetterColor;
					mistakes++;
					updateMistakes();

			}
		}

			if (elementExists(getWordLetter(currentWordNum, currentWordLetterNum + 1))) {
				nextWordLetter = getWordLetter(currentWordNum, currentWordLetterNum + 1);
			} else {
				document.querySelector(`word${currentWordNum}`).style.borderRightWidth = "1px";
				document.querySelector(`word${currentWordNum}`).style.color = "inherit";
			}
			currentWordLetterNum++;
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

function prepareNextWord(params) {
	textIn.value = ""; // Clear the input
	currentWordLetterNum = 0; // Reset the letter number to the first index (0)
	wordsTyped++;
	document.querySelector("wpm").innerHTML = Math.round((60 / (timer.timerElapsed / 1000)) * wordsTyped, 2); // Calc wpm
	textIn.style.backgroundColor="";
}

function checkWordMatch(a, b) {
// console.log(a.trim(),b);
	if (mistakesAllowed) {
		return a.trim().length >= b.length;
	} else {
		return a.trim() == b.trim();
	}
}

generateWords();
addListeners();

timeEl = document.querySelector("time");

timer = {
	timerElapsed: 0, //ms
	updateInterval: 10,
	start: () => {
		timer.timerElapsed = 0;
		timer.resume()
	},
	stop: () => {
		clearInterval(timerInterval);
	},
	resume: () => {
		timerInterval = setInterval(() => {
			timer.timerElapsed += timer.updateInterval;
			timeEl.innerHTML = (timer.timerElapsed / 1000).toFixed(2);
		}, timer.updateInterval);
	},
};
