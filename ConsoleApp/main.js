const consoleHistory = document.querySelector('.consoleHistory');
const consoleInput = document.querySelector('.consoleInput');
const previewDiv = document.querySelector('.preview');
const history = JSON.parse(localStorage.getItem('consoleHistory')) || [];

const originalLog = console.log;
console.log = function (...args) {
	return args.map((arg) => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
};

let index = history.length;
let output = '', input = '';

originalLog("index:", index);

function addHistory() {
	history.forEach((entry) => {
		const inputDiv = document.createElement('div');
		inputDiv.className = 'historyInput';
		inputDiv.textContent = `$> ${entry}`;
		consoleHistory.appendChild(inputDiv);

		let output;
		try {
			output = (0, eval)(entry);
		} catch (err) {
			output = err;
		}

		const outputDiv = document.createElement('div');
		outputDiv.className = 'historyOutput';
		outputDiv.textContent = `${output}`;
		consoleHistory.appendChild(outputDiv);
	});
	consoleHistory.scrollTop = consoleHistory.scrollHeight;
}

function addToHistory(input, output) {
	const inputDiv = document.createElement('div');
	inputDiv.className = 'historyInput';
	inputDiv.textContent = `$> ${input}`;
	consoleHistory.appendChild(inputDiv);

	const outputDiv = document.createElement('div');
	outputDiv.className = 'historyOutput';
	outputDiv.textContent = `${output}`;
	consoleHistory.appendChild(outputDiv);

	history.push(input);
	index = history.length;
	consoleHistory.scrollTop = consoleHistory.scrollHeight;
	localStorage.setItem('consoleHistory', JSON.stringify(history));
}

function updatePreview() {
	if (previewDiv) {
		const trimmedInput = consoleInput.value.trim();
		const hasSideEffects = /^(const|let|var|function|class|delete|import|export)\s/.test(trimmedInput) ||
			/[^=!<>]=(?!=)/.test(trimmedInput) ||
			/\+\+|--/.test(trimmedInput) ||
			/\.(push|pop|shift|unshift|splice|sort|reverse|fill|clear|delete|set|add|setItem|removeItem|append|remove)\s*\(/.test(trimmedInput) ||
			/(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.|window\.|alert|confirm|prompt|open|close)\b/.test(trimmedInput);

		if (trimmedInput.length === 0 || hasSideEffects) {
			previewDiv.textContent = '';
		} else {
			try {
				let previewOutput = (0, eval)(consoleInput.value);
				previewOutput = typeof previewOutput === 'string' ? `"${previewOutput}"` : String(previewOutput);
				previewDiv.textContent = previewOutput;
			} catch (err) {
				previewDiv.textContent = '';
			}
		}
	}
}

function handleInput(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		input = consoleInput.value.trim();
		if (input.length === 0) return;

		try {
			output = (0, eval)(input);
		} catch (err) {
			output = err;
		}

		addToHistory(input, output);
		input = consoleInput.value = '';
	} else if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
		event.preventDefault();
		consoleHistory.innerHTML = '';
	} else if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
		event.preventDefault();
		input = consoleInput.value = '';
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		if (index > 0) {
			index--;
			consoleInput.value = history[index] || '';
		}
	} else if (event.key === 'ArrowDown') {
		event.preventDefault();
		if (index < history.length - 1) {
			index++;
			consoleInput.value = history[index] || '';
		}
		else {
			index = history.length;
			consoleInput.value = input;
		}
	} else {
		index = history.length;
		input = consoleInput.value;
	}

	updatePreview();
	originalLog("index:", index);
}

consoleInput.addEventListener('keyup', handleInput);
