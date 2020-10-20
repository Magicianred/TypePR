textToType = document.querySelector("text_to_type");
textIn = document.querySelector("input");
wordCount = 10;
mistakes = 0;
wordsTyped = 0;
timerStarted = false;

incorrectLetterColor = "indianred";
correctLetterColor = "lightgreen";

eval(document.cookie.split('set_').join('')) // this sets all the settings from a existing cookies

// mistakesAllowed = true;
// wordListLevel = 0;    //0-easy 1-hard
wordListsList = [wordListEasy, wordListHard]



function generateWords() {
	newText = "";
	textIn.value = ''
	wordsArray = [];
	currentWordNum = 0;
	currentWordLetterNum = 0;
	wordList = wordListsList[wordListLevel];
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
	textIn.style.backgroundColor = "";
	// setTimeout(() => {
	// }, 1);
}

function addListeners() {
	textIn.addEventListener("input", (event) => {
		currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);
		textInVal = textIn.value //+ letterInVal;
		letterInVal = textInVal.slice(-1);
		currentWordLetterNum = textInVal.length - 1;

		if (textInVal.trim() == "") {
			event.stopPropagation()
			event.preventDefault()
			textIn.value = '';
			return false
		}//if space is press at the beginning of a word just ignore it

		// Redid the input handling
		timerStarted == false && (timerStarted = true) && timer.resume();

		checkIfMistakeOccurred =
			event.inputType != "deleteContentBackward" &&
			letterInVal != wordsArray[currentWordNum][currentWordLetterNum] &&
			(textInVal.length <= wordsArray[currentWordNum].length ||
				(textInVal.length > wordsArray[currentWordNum].length && !mistakesAllowed))
		//(If backspace is not pressed &&
		//the letter typed was a mistake &&
		//we're still typing inside the bounds of the word or
		//if were not and mistakes are strictly prohibited) only then count as error.
		if (checkIfMistakeOccurred) {
			mistakes++;
			updateMistakes();
		}

		// If the  end is reached
		if (checkWordMatch(textInVal, wordsArray[currentWordNum]) && wordsArray.length <= currentWordNum + 1) {
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			timer.stop();
			timerStarted = false;
			generateWords();
		} else if ((letterInVal == " "  /*if space */ || event.keyCode == 13) && checkWordMatch(textInVal, wordsArray[currentWordNum])) {
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			document.querySelector(`word${currentWordNum}`).style.borderRightWidth = "0px";
			if (elementExists(getWordLetter(++currentWordNum, 0))) {
				nextWordLetter = getWordLetter(currentWordNum, 0);
			}
			document.querySelector(`word${currentWordNum}`).style.color = "inherit";
		} else {
			for (let i = 0; i < wordsArray[currentWordNum].length; i++) {
				currentLetterElement = getWordLetter(currentWordNum, i);
				if (i < textInVal.length) {
					if (textInVal[i] == wordsArray[currentWordNum][i]) {
						currentLetterElement.style.color = correctLetterColor;
					}
					else {
						currentLetterElement.style.color = incorrectLetterColor;
						var mistakeEncountered = true;
					}
				} else {
					currentLetterElement.style.color = "";
				}
			}
			(mistakeEncountered && (textIn.style.background = incorrectLetterColor)) || (textIn.style.background = "");
		}
	});


	settings_button = document.querySelector('settings_button');
	settings_button.addEventListener('click', toggleSettings = (event) => {
		settingsEl = document.querySelector('settings');
		mainContainerEl = document.querySelector('main_container');
		var checkId;
		if (settingsEl.style.display != 'block') {
			settingsEl.style.display = 'block';
			mainContainerEl.style.display = 'none'

			document.querySelector("#mistakesAllowed").checked = mistakesAllowed;
			document.querySelector("#wordListLevel" + wordListLevel).checked = true;


		} else {
			settingsEl.style.display = '';
			mainContainerEl.style.display = ''


			mistakesAllowed = document.querySelector("#mistakesAllowed").checked;
			wordListLevel = document.querySelector("#wordListLevel0").checked ? 0 : 1;

			cookie.set('set_mistakesAllowed', mistakesAllowed)
			cookie.set('set_wordListLevel', wordListLevel)

			generateWords()
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
	textIn.style.backgroundColor = "";
}

function checkWordMatch(a, b) {
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



cookie = {

	set: (name, val) => {

		document.cookie = ` ${name}=${val};path=/`;
	},
	get: (name) => {
		if (document.cookie.trim() == "") return false;
		return document.cookie.split(name + '=')[1].split(';')[0]
	},
	remove: () => {
		document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
	},

}
