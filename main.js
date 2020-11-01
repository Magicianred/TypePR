const textToType = document.querySelector("text_to_type");
const textIn = document.querySelector("input");
const timeEl = document.querySelector("time");

const settings_button = document.querySelector('settings_button');
const settingsEl = document.querySelector('settings');
const mainContainerEl = document.querySelector('main_container');

let mistakes = 0;
let wordsTyped = 0;
let timerStarted = false;
const wordListsList = [wordListEasy, wordListHard];

//Default settings
let mistakesAllowed = true;
let wordListLevel = 0;    //0-easy 1-hard
let wordCount = 10;
let timerPrecision = 0;   // 0 - 0   1 - 0.0  2 - 0.00 .... 
let fontSize
let fontFamily

eval(document.cookie.split('set_').join('')) //Neatly set all the browser cookies to a variable.

function createSettingsObject(pipeVars = false) {

	settingsObject = {
		mistakesAllowed: { type: 'checkbox', value: mistakesAllowed, css: null },
		wordListLevel: { type: 'radio', values: [0, 1], value: wordListLevel, css: null },
		wordCount: { type: 'number', value: wordCount, min: 5, max: 500, css: null },
		fontSize: { type: 'number', value: fontSize, min: 15, max: 35, css: { cssVariableName: "font-size", cssValueSuffix: 'px' } },
		fontFamily: { type: 'text', value: fontFamily, min: 15, max: 35, css: { cssVariableName: "main-font", cssValueSuffix: '' } },
		timerPrecision: { type: 'number', value: timerPrecision, min: 0, max: 2, css: null },
	}
	//Get the css variables and pipe them over to js. Should be only called once on page load
	if (pipeVars) {
		Object.entries(settingsObject).forEach(x => {
			let [entryName, entryProperties] = [x[0], x[1]]
			if (entryProperties.css != null) { // find the entry's that have a variable defined in css
				let regexExclude = "/" + entryProperties.css.cssValueSuffix + "/g";
				val = getComputedStyle(document.documentElement).getPropertyValue("--" + entryProperties.css.cssVariableName).replace(eval(regexExclude), '').trim();
				val = entryProperties.type == "number" ? Number(val) || 0 : `"${val}"`;
				console.log(val);
				eval('settingsObject.' + entryName + '.value = ' + val) // set the value in the object
				eval(entryName + "=" + val);// set the variable
			}
		});
	}
}
function generateWords() {
	let wordList = wordListsList[wordListLevel];// set the wordlist based on the wordlist level
	let newText = "";
	wordsArray = [];
	currentWordNum = 0;
	currentWordLetterNum = 0;
	textIn.value = '';
	//Randomize words and chop them into pieces
	for (let i = 0; i < wordCount; i++) {
		randomWordNum = Math.round(Math.random() * (wordList.length - 1));
		wordsArray.push(wordList[randomWordNum]);
		let wordToAdd = wordList[randomWordNum];
		newText += `<word${i}>`;
		for (let j = 0; j < wordToAdd.length; j++) {//Chop them into letter elements marked with an index(j),
			newText += `<letter${j}>${wordToAdd[j]}</letter${j}>`;
		}
		newText += `</word${i}> `;
	}
	textToType.innerHTML = newText;
	textIn.style.backgroundColor = "";
}

function prepareNextWord() {
	textIn.value = ""; // Clear the input
	currentWordLetterNum = 0; // Reset the letter number to the first index (0)
	wordsTyped++;
	//Check if there is next word \/
	currentWordNum + 1 != wordsArray.length && (document.querySelector("word" + (currentWordNum + 1)).scrollIntoView({ block: "start", inline: "nearest" }));
	document.querySelector("wpm").innerHTML = Math.round((60 / (timer.timerElapsed / 1000)) * wordsTyped, 2); // Calc wpm
	textIn.style.backgroundColor = "";
}

function addListeners() {

	// Typing listener || Input listener
	textIn.addEventListener("input", (event) => {
		let textInVal = textIn.value
		let letterInVal = textInVal.slice(-1);
		let currentWordLetterNum = textInVal.length - 1;

		//If space is press at the beginning of a word -> do nothing
		if (textInVal.trim() == "" && event.inputType != "deleteContentBackward") {
			event.stopPropagation()
			event.preventDefault()
			textIn.value = '';
			textIn.focus
			return false
		}

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
				currentLetterElement = document.querySelector(`word${currentWordNum}`).querySelector(`letter${i}`);
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

	// Settings (open || close) listeners
	settingsEl.addEventListener('keyup', (event) => { event.keyCode == 13 && toggleSettings() })
	settings_button.addEventListener('click', toggleSettings = () => {
		timer.stop();
		if (settingsEl.style.display != 'block') {
			settingsEl.style.display = 'block';
			mainContainerEl.style.display = 'none'

			//Make sure all the number fields are updated without any invalid numbers in them.
			Object.entries(settingsObject).forEach(x => {
				let [entryName, entryProperties] = [x[0], x[1]]
				if (entryProperties.type == "number") document.querySelector(`#${entryName}`).value = entryProperties.value
			})
		} else {
			settingsEl.style.display = '';
			mainContainerEl.style.display = ''

			//Write all the settings to variables and cookies.
			document.querySelectorAll("setting > * > input").forEach(element => {
				let val;
				elementName = element.name || element.id;
				if (element.type == "checkbox") val = element.checked == true ? true : false;
				else if (element.type == "radio" && element.checked) val = Number(element.value) || 0;
				else if (element.type == "text") val = '"' + element.value.toString().trim() + '"'
				else if (element.type == "number") {
					val = Number(element.value);
					val = val >= element.min ? val : element.min;
					val = val <= element.max ? val : element.max;
					val = Math.round(val);
				}
				val != undefined && eval(elementName + "=" + val) != undefined && cookie.set('set_' + elementName, val);
			})
			createSettingsObject(); //Update the settings object. Basically recreated with the updated variables.
			Object.entries(settingsObject).forEach(x => {
				let [entryName, entryProperties] = [x[0], x[1]]
				entryProperties.css != null && document.documentElement.style.setProperty(`--${entryProperties.css.cssVariableName}`, entryProperties.value + entryProperties.css.cssValueSuffix);
			});
			generateWords()  // Re-generate words
		}
	});
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
		typeof (timerInterval) != "undefined" && clearInterval(timerInterval);
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


createSettingsObject(true);
//Generate the settings HTML
let settingsHTML = '';
Object.entries(settingsObject).forEach(x => {
	let [entryName, entryProperties] = [x[0], x[1]]
	settingsHTML += `<setting><span>${entryName}</span><span>`
	if (entryProperties.type == "checkbox") settingsHTML += `<input name="${entryName}" id="${entryName}" checked=${entryProperties.value} type="checkbox" /><label class='checkboxLabel' for="${entryName}"><filler /></label>`
	else if (entryProperties.type == "number") settingsHTML += `<input value='${entryProperties.value}' min='${entryProperties.min}'  max='${entryProperties.max}' name='${entryName}' id='${entryName}' type="number" />`
	else if (entryProperties.type == "text") settingsHTML += `<input value='${entryProperties.value}' max-length='${entryProperties.max}' name='${entryName}' id='${entryName}' type="text" />`;
	else if (entryProperties.type == "radio") {
		entryProperties.values.forEach(val => {
			settingsHTML += `<input value='${val}' ${val == entryProperties.value ? 'checked' : ''} name='${entryName}' id='${entryName}${val}' type="radio" /><label class='radioLabel' for="${entryName}${val}">${val}</label>`;
		});
	}
	settingsHTML += `</span></setting>`

});
settingsHTML += "<button onclick='toggleSettings()'>Save</button>"
settingsEl.innerHTML = settingsHTML


//Main calls
generateWords();
addListeners();
textIn.focus();