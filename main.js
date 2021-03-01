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




settings = {
	//Default settings
	setDefaultSettings: function () {
		this.highlightCursor = true
		this.mistakesAllowed = true;
		this.wordListLevel = 0;    //0-easy 1-hard
		this.wordCount = 25;
		this.timerPrecision = 0;   // 0 - 0   1 - 0.0  2 - 0.00 .... 
		this.fontSize = undefined;
		this.fontFamily = undefined;
		this.backgroundColor = undefined;
		this.mainColor = undefined;
		this.textColor = undefined;
		this.mistakeColor = undefined;
		this.correctColor = undefined;
		this.highlightColor = undefined;

	},

	createSettingsObject: function (pipeVars = false) {

		this.settingsObject = {
			mistakesAllowed: { type: 'checkbox', value: settings.mistakesAllowed, css: null },
			highlightCursor: { type: 'checkbox', value: settings.highlightCursor, css: null },
			wordListLevel: { type: 'radio', values: [0, 1], value: settings.wordListLevel, css: null },
			wordCount: { type: 'number', value: settings.wordCount, min: 5, max: 500, css: null },
			fontSize: { type: 'number', value: settings.fontSize, min: 15, max: 35, css: { cssVariableName: "font-size", cssValueSuffix: 'px' } },
			fontFamily: { type: 'text', value: settings.fontFamily, min: 15, max: 35, css: { cssVariableName: "main-font", cssValueSuffix: '' } },
			timerPrecision: { type: 'number', value: settings.timerPrecision, min: 0, max: 2, css: null },
			backgroundColor: { type: 'color', value: settings.backgroundColor, css: { cssVariableName: "background-color", cssValueSuffix: '' } },
			mainColor: { type: 'color', value: settings.mainColor, css: { cssVariableName: "main-color", cssValueSuffix: '' } },
			textColor: { type: 'color', value: settings.textColor, css: { cssVariableName: "text-color", cssValueSuffix: '' } },
			mistakeColor: { type: 'color', value: settings.mistakeColor, css: { cssVariableName: "mistake-color", cssValueSuffix: '' } },
			correctColor: { type: 'color', value: settings.correctColor, css: { cssVariableName: "correct-color", cssValueSuffix: '' } },
			highlightColor: { type: 'color', value: settings.highlightColor, css: { cssVariableName: "highlight-color", cssValueSuffix: '' } },
		}


		//Get the css variables and pipe them over to js ir if the js variable is defined than pipe it to css. Should be only called once on page load
		if (pipeVars) {
			Object.entries(this.settingsObject).forEach(x => {
				let [entryName, entryProperties] = [x[0], x[1]]
				if (entryProperties.css != null && settings[entryName] == undefined) { // find the entry's that have a variable defined in css
					let regexExclude = "/" + entryProperties.css.cssValueSuffix + "/g";
					val = getComputedStyle(document.documentElement).getPropertyValue("--" + entryProperties.css.cssVariableName).replace(eval(regexExclude), '').trim();
					val = entryProperties.type == "number" ? Number(val) || 0 : val;
					this.settingsObject[entryName].value = val // set the value in the object
					window[settings.entryName] = val; // set the variable
				} else if (entryProperties.css != null && settings[entryName] != undefined) {
					entryProperties.css != null && document.documentElement.style.setProperty(`--${entryProperties.css.cssVariableName}`, entryProperties.value + entryProperties.css.cssValueSuffix);
				}
			});
		}
	},
	liveColorUpdate: function (el) {
		el.parentElement.children[0].innerHTML = el.value
		document.documentElement.style.setProperty(`--${settings.settingsObject[el.id].css.cssVariableName}`, el.value);
	},

	toggleSettings: function () {

		timer.stop();
		timer.reset();
		if (settingsEl.style.display != 'block') {
			settingsEl.style.display = 'block';
			mainContainerEl.style.display = 'none'

			//Make sure all the number fields are updated without any invalid numbers in them.
			Object.entries(this.settingsObject).forEach(x => {
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
				else if (element.type == "text" || element.type == "color") val = element.value.toString().trim()
				else if (element.type == "number") {
					val = Number(element.value);
					val = val >= element.min ? val : element.min;
					val = val <= element.max ? val : element.max;
					val = Math.round(val);
				}
				if (element.type == "text" || element.type == "color") cookieVal = `'${val}'`; else cookieVal = val
				val != undefined && (this[elementName] = val) != undefined && cookie.set('set_' + elementName, cookieVal);
			})

			this.createSettingsObject(); //Update the settings object. Basically recreated with the updated variables.
			Object.entries(this.settingsObject).forEach(x => {
				let [entryName, entryProperties] = [x[0], x[1]];
				entryProperties.css != null && entryProperties.value != undefined && document.documentElement.style.setProperty(`--${entryProperties.css.cssVariableName}`, entryProperties.value + entryProperties.css.cssValueSuffix);
			});
			main.generateWords()  // Re-generate words
		}


	}

}

main = {
	generateWords: function () {
		this.wordList = wordListsList[settings.wordListLevel];// set the wordlist based on the wordlist level
		this.currentWordIndex = 0;
		this.wordsArray = [...Array(settings.wordCount)].map(x => { return this.wordList[Math.round(Math.random() * (this.wordList.length - 1))] })
		this.furthestCharacterColored = 0
		this.currentCharacterIndex = 0;
		this.charactersTypedAmount = 0;
		this.charactersArray = this.wordsArray.join(' ').split('');
		this.newSectionText = this.charactersArray.map(x => `<char>${x}</char>`).join('');
		textToType.innerHTML = this.newSectionText;
		textIn.value = '';
		textIn.style.backgroundColor = "";
		if (settings.highlightCursor) {
			previousHighlighCharacterElement = textToType.children[0]
			// previousHighlighCharacterElement.style.backgroundColor = 'var(--highlight-color)';

		}
	},
	prepareNextWord: function () {

		textIn.value = ""; // Clear the input
		this.charactersTypedAmount += this.wordsArray[this.currentWordIndex].length + 1;
		wordsTyped++;
		//Check if there is next word \/
		this.currentWordIndex + 1 != this.wordsArray.length && textToType.children[this.currentWordIndex + 1].scrollIntoView({ block: "start", inline: "nearest" });
		textIn.style.backgroundColor = "";
	},
	textInputHandler: function (event) {
		let inputText = textIn.value
		let characterIn = inputText.slice(-1);
		let currentWord = this.wordsArray[this.currentWordIndex];
		this.currentCharacterIndex = this.charactersTypedAmount + inputText.length - 1;

		if (characterIn == '`') {
			event.preventDefault()
			event.stopPropagation();
			reset();
			return false;
		}
		//If space is press at the beginning of a word -> do nothing
		if (inputText.trim() == "" && !event.inputType.includes('delete')) {
			event.stopPropagation();
			event.preventDefault();
			textIn.value = '';
			textIn.focus();
			return false;
		}
		timer.timerStarted == false && timer.resume();
		let checkIfMistakeOccurred =
			!event.inputType.includes('delete') &&
			characterIn != this.charactersArray[this.currentCharacterIndex] &&
			(inputText.length <= this.wordsArray[this.currentWordIndex].length ||
				(inputText.length > this.wordsArray[this.currentWordIndex].length && !settings.mistakesAllowed))
		//(If backspace is not pressed &&
		//the Character typed was a mistake &&
		//we're still typing inside the bounds of the word or
		//if were not and mistakes are strictly prohibited) only then count as error.
		if (checkIfMistakeOccurred) {
			//UpdateMistakes
			mistakes++;
			document.querySelector("mistakes").innerHTML = mistakes;
		}
		if (this.checkWordMatch(inputText, this.wordsArray[this.currentWordIndex]) && this.wordsArray.length <= this.currentWordIndex + 1) {
			// If the end is reached
			event.stopPropagation();
			event.preventDefault();
			this.prepareNextWord();
			timer.reset();
			timer.stop();
			timerStarted = false;
			this.generateWords();
		} else if ((characterIn == " "  /*if space */) && this.checkWordMatch(inputText, this.wordsArray[this.currentWordIndex])) {
			//If a word end is reached and space is pressed
			event.stopPropagation();
			event.preventDefault();
			this.prepareNextWord();
			//Increments the this.currentWordIndex and sets the nextWordCharacter to the next words Character.
			this.wordsArray[++this.currentWordIndex] != undefined && (nextWordCharacter = this.wordsArray[this.currentWordIndex][0])
		} else {
			this.furthestCharacterColored <= this.currentCharacterIndex && (this.furthestCharacterColored = this.currentCharacterIndex)
			let mistakeEncountered = false
			//Check if the input characters match the onscreen characters and highligh them.
			for (let i = 0; i <= this.furthestCharacterColored - this.charactersTypedAmount; i++) {
				let currentCharacterElement = textToType.children[this.charactersTypedAmount + i];
				if (currentCharacterElement.innerHTML.trim() == "_") currentCharacterElement.innerHTML = ' '
				if (i < inputText.length) {
					//color the characters based on their correctness.
					if (inputText[i] == currentCharacterElement.innerHTML && i <= currentWord.length)
						currentCharacterElement.style.color = "var(--correct-color)";
					else {
						currentCharacterElement.style.color = "var(--mistake-color)"; (mistakeEncountered = true);
						if (currentCharacterElement.innerHTML.trim() == "") currentCharacterElement.innerHTML = '_'
					}
				} else currentCharacterElement.style.color = ""; //If we exhausted all the characters inputted and the word is not yet finished 
			}
			(mistakeEncountered && (textIn.style.background = "var(--mistake-color)")) || (textIn.style.background = "");
			//If a mistake was encountered than color some things red.. 
		}
	},
	highlightCursorHandler: function () {
		//Highlights the cursor position on the text Element
		if (settings.highlightCursor) {
			setTimeout(() => {
				previousHighlighCharacterElement.style.backgroundColor = '';
				highlighCharacterElement = textToType.children[this.charactersTypedAmount + textIn.selectionEnd];
				highlighCharacterElement.style.backgroundColor = 'var(--highlight-color)';
				previousHighlighCharacterElement = highlighCharacterElement;
			}, -1);
		}
	},
	checkWordMatch: function (a, b) {
		if (settings.mistakesAllowed) {
			return a.trim().length >= b.length;
		} else {
			return a.trim() == b.trim();
		}
	}
}

timer = {
	timerStarted: false,
	timerElapsed: 0, //ms
	updateInterval: 10,
	timerStartedDate: 0,
	timerPausedDate: 0,

	getElapsedTime: function () {
		return this.timerElapsed = new Date() - this.timerStartedDate
	},

	start: function () {
		this.reset()
		this.resume()
	},
	stop: function () {
		typeof timerInterval != "undefined" && clearInterval(timerInterval);
		typeof updateWPM != "undefined" && clearInterval(updateWPM);
		this.timerStarted = false;
		this.timerPauseDate = new Date();
	},
	reset: function () {
		this.timerStartedDate = 0
		this.timerElapsed = 0;
		this.timerPausedDate = 0;
		timeEl.innerHTML = ''
		this.elSet(0);
	},
	resume: function () {
		this.timerStartedDate = this.timerStartedDate + (new Date() - this.timerPausedDate);
		if (!this.timerStarted) {
			timerInterval = setInterval(() => {
				timeEl.innerHTML = (timer.getElapsedTime() / 1000).toFixed(settings.timerPrecision);
			}, this.updateInterval);

			updateWPM = setInterval(() => {
				console.log(main.charactersTypedAmount, main.charactersArray.length, main.wordsArray.length);
				let wordsTyped = (main.charactersTypedAmount / main.charactersArray.length) * main.wordsArray.length
				console.log(wordsTyped);
				document.querySelector("wpm").innerHTML = Math.round((60 / (timer.getElapsedTime() / 1000)) * wordsTyped, 2); // Calc wpm
			}, 1000);
			this.timerStarted = true;
		}
	},
	elSet: (x = 0) => {
		timeEl.innerHTML = x;
	}
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
	clearAll: () => {
		document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
	},
}

function settingDefaults() {

	cookie.clearAll();
	location.reload()

}

textIn.addEventListener("input", event => main.textInputHandler(event)); // Typing listener || Input listener
textIn.addEventListener('keydown', event => main.highlightCursorHandler()); //cursor position highlighter
settingsEl.addEventListener('keyup', event => { event.keyCode == 13 && settings.toggleSettings() }); // Settings (open || close) listeners
settings_button.addEventListener('click', e => settings.toggleSettings())
document.querySelector('.reset').addEventListener('click', reset = () => {

	timer.stop();
	timer.reset();
	textIn.value = '';
	main.generateWords();
	document.querySelector("mistakes").innerHTML = 0;
	document.querySelector("wpm").innerHTML = 0;
	textIn.focus();

})


settings.setDefaultSettings()
eval(document.cookie.split('set_').join('settings.')) //Neatly set all the browser cookies to a variable.
settings.createSettingsObject(true);
//Generate the settings HTML
let settingsHTML = `<span onclick='settingDefaults()' class='default'>Default</span>`;
Object.entries(settings.settingsObject).forEach(x => {
	let [entryName, entryProperties] = [x[0], x[1]]
	settingsHTML += `<setting><span>${entryName}</span><span>`
	if (entryProperties.type == "checkbox") settingsHTML += `<input name="${entryName}" id="${entryName}" checked=${entryProperties.value} type="checkbox" /><label class='checkboxLabel' for="${entryName}"><filler /></label>`
	else if (entryProperties.type == "number") settingsHTML += `<input value='${entryProperties.value}' min='${entryProperties.min}'  max='${entryProperties.max}' name='${entryName}' id='${entryName}' type="number" />`
	else if (entryProperties.type == "text") settingsHTML += `<input value='${entryProperties.value}' max-length='${entryProperties.max}' name='${entryName}' id='${entryName}' type="text" />`;
	else if (entryProperties.type == "color") settingsHTML += `<span class='colorText'>${entryProperties.value}</span><input type='color' name='${entryName}' id='${entryName}' oninput="settings.liveColorUpdate(this)" value='${entryProperties.value}'`;
	else if (entryProperties.type == "radio") {
		entryProperties.values.forEach(val => {
			settingsHTML += `<input value='${val}' ${val == entryProperties.value ? 'checked' : ''} name='${entryName}' id='${entryName}${val}' type="radio" /><label class='radioLabel' for="${entryName}${val}">${val}</label>`;
		});
	}
	settingsHTML += `</span></setting>`

});
settingsHTML += "<button onclick='settings.toggleSettings()'>Save</button>"
settingsEl.innerHTML = settingsHTML;


//Main calls
main.generateWords();
textIn.focus();