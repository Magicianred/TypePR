const textToType = document.querySelector("text_to_type");
const textIn = document.querySelector("input");
const timeEl = document.querySelector("time");
let mistakes = 0;
let wordsTyped = 0;
let timerStarted = false;
let timerPrecision = 0;   // 0 - 0   1 - 0.0  2 - 0.00 .... 

//Default settings
let mistakesAllowed = true;
let wordListLevel = 0;    //0-easy 1-hard
let wordCount = 10;
let fontSize = getComputedStyle(document.documentElement).getPropertyValue("--font-size").replace(/px/g, '');

eval(document.cookie.split('set_').join('')) // this sets all the settings from a existing cookies
document.documentElement.style.setProperty('--font-size', fontSize + "px");

wordListsList = [wordListEasy, wordListHard]

function generateWords() {
	newText = "";
	textIn.value = ''
	wordsArray = [];
	currentWordNum = 0;
	currentWordLetterNum = 0;
	wordList = wordListsList[wordListLevel];
	for (let i = 0; i < wordCount; i++) {
		randomWordNum = Math.round(Math.random() * (wordList.length - 1));
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
}

function prepareNextWord() {
	textIn.value = ""; // Clear the input
	currentWordLetterNum = 0; // Reset the letter number to the first index (0)
	wordsTyped++;

	//Check if there is next word \/
	currentWordNum + 1 != wordsArray.length && (document.querySelector("word" + wordsTyped).scrollIntoView({ block: "start", inline: "nearest" }));
	document.querySelector("wpm").innerHTML = Math.round((60 / (timer.timerElapsed / 1000)) * wordsTyped, 2); // Calc wpm
	textIn.style.backgroundColor = "";
}

function addListeners() {
	textIn.addEventListener("input", (event) => {
		let textInVal = textIn.value
		let letterInVal = textInVal.slice(-1);
		let currentWordLetterNum = textInVal.length - 1;
		let currentLetterElement = getWordLetter(currentWordNum, currentWordLetterNum);

		//If the input is empty and backspace is pressed -> do nothing
		if (textInVal.trim() == "" && event.inputType != "deleteContentBackward") {
			event.stopPropagation()
			event.preventDefault()
			textIn.value = '';
			return false
		}//if space is press at the beginning of a word just ignore it

		// Redid the input handling
		timerStarted == false && (timerStarted = true) && timer.resume();

		let checkIfMistakeOccurred =
			event.inputType != "deleteContentBackward" &&
			letterInVal != wordsArray[currentWordNum][currentWordLetterNum] &&
			(textInVal.length <= wordsArray[currentWordNum].length ||
				(textInVal.length > wordsArray[currentWordNum].length && !mistakesAllowed))
		//(If backspace is not pressed &&
		//the letter typed was a mistake &&
		//we're still typing inside the bounds of the word or
		//if were not and mistakes are strictly prohibited) only then count as error.
		if (checkIfMistakeOccurred) {
			//UpdateMistakes
			mistakes++;
			document.querySelector("mistakes").innerHTML = mistakes;
		}
		if (checkWordMatch(textInVal, wordsArray[currentWordNum]) && wordsArray.length <= currentWordNum + 1) {
			// If the end is reached
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			timer.stop();
			timerStarted = false;
			generateWords();
		} else if ((letterInVal == " "  /*if space */) && checkWordMatch(textInVal, wordsArray[currentWordNum])) {
			//If a word end is reached and space is pressed
			event.stopPropagation();
			event.preventDefault();
			prepareNextWord();
			//Increments the currentWordNum and sets the nextWordLetter to the next words letter.
			wordsArray[++currentWordNum] != undefined && (nextWordLetter = wordsArray[currentWordNum][0])
		} else {
			let mistakeEncountered = false
			//Check if the input letters match the onscreen letters and highligh them.
			for (let i = 0; i < wordsArray[currentWordNum].length; i++) {
				currentLetterElement = getWordLetter(currentWordNum, i);
				if (i < textInVal.length) {
					//color the letters based on their correctness.
					if (textInVal[i] == wordsArray[currentWordNum][i]) currentLetterElement.style.color = "var(--correct-color)";
					else {
						currentLetterElement.style.color = "var(--mistake-color)";
						mistakeEncountered = true;
					}
				} else currentLetterElement.style.color = ""; //If we exhausted all the letters inputted and the word is not yet finished 
			}
			(mistakeEncountered && (textIn.style.background = "var(--mistake-color)")) || (textIn.style.background = "");
			//If a mistake was encountered than color some things red.. 
		}
	});


	settings_button = document.querySelector('settings_button');
	settingsEl = document.querySelector('settings');
	mainContainerEl = document.querySelector('main_container');
	settingsEl.addEventListener('keyup', (event) => { event.keyCode == 13 && toggleSettings() })
	settings_button.addEventListener('click', toggleSettings = () => {

		if (settingsEl.style.display != 'block') {
			//Grab all the settings from variables and display them. inside the element.
			settingsEl.style.display = 'block';
			mainContainerEl.style.display = 'none'

			valueSettings = ['wordCount', 'fontSize',]

			document.querySelector("#mistakesAllowed").checked = mistakesAllowed;
			document.querySelector("#wordListLevel" + wordListLevel).checked = true;
			valueSettings.forEach(x => {
				document.querySelector("#" + x).value = Number(eval(x));
			});

		} else {
			wordCountLimit = 500;
			settingsEl.style.display = '';
			mainContainerEl.style.display = ''


			//Write all the settings to variables and cookies.
			document.querySelectorAll("setting > * > input").forEach(element => {
				let val;
				elementName = element.name || element.id;
				if (element.type == "checkbox") {
					val = element.checked == false || true ? element.checked : false;
				} else if (element.type == "radio" && element.checked) {
					val = element.value
				} else if (element.type == "number") {
					val = element.value;
					val = val >= element.min ? val : element.min;
					val = val <= element.max ? val : element.max;
					val = Math.round(val);
				}
				console.log(elementName, val);
				val != undefined && eval(elementName + "=" + val)
				cookie.set('set_' + elementName, val)
			})
			document.documentElement.style.setProperty('--font-size', fontSize + "px");


			cookie.set('set_wordListLevel', wordListLevel)
			cookie.set('set_wordCount', wordCount)
			cookie.set('set_fontSize', fontSize)

			generateWords()
		}

	});

}

function getWordLetter(wordIndex, letterIndex) {//returns the a words letter element -> (word4)(letter2)
	return document.querySelector(`word${wordIndex}`).querySelector(`letter${letterIndex}`);
}

function elementExists(el) {
	if (typeof el != "undefined" && el != null) return true;
	else return false;
}

function checkWordMatch(a, b) {
	if (mistakesAllowed) {
		return a.trim().length >= b.length;
	} else {
		return a.trim() == b.trim();
	}
}


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
			timeEl.innerHTML = (timer.timerElapsed / 1000).toFixed(timerPrecision);
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

//Main calls
generateWords();
addListeners();
textIn.focus()