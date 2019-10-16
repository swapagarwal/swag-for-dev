/* global Selectr */

/**
 * Initialising global variables
 */
const ACTIVE_CLASS = 'visible';
const sort = {
	ALPHABETICAL_ASCENDING: (a, b) => a.dataset.name > b.dataset.name ? 1 : -1,
	ALPHABETICAL_DESCENDING: (a, b) => a.dataset.name < b.dataset.name ? 1 : -1,
	/* eslint-disable unicorn/no-nested-ternary */
	DIFFICULTY_ASCENDING: (a, b) => a.dataset.difficulty === b.dataset.difficulty ? (a.dataset.name > b.dataset.name ? 1 : -1) : a.dataset.difficulty > b.dataset.difficulty ? 1 : -1,
	DIFFICULTY_DESCENDING: (a, b) => a.dataset.difficulty === b.dataset.difficulty ? (a.dataset.name > b.dataset.name ? 1 : -1) : a.dataset.difficulty < b.dataset.difficulty ? 1 : -1,
	DATEADDED_ASCENDING: (a, b) => a.dataset.dateadded > b.dataset.dateadded ? 1 : -1,
	DATEADDED_DESCENDING: (a, b) => a.dataset.dateadded < b.dataset.dateadded ? 1 : -1
	/* eslint-enable unicorn/no-nested-ternary */
};

const contentElement = document.querySelector('#content');
const filterInput = document.querySelector('#filter');
const sortingInput = document.querySelector('#sorting');
const tagsSelect = document.querySelector('#tags');
const showExpired = document.querySelector('#expired');
const hideCompleted = document.querySelector('#completed');

const activateElements = els => Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
const allowDifficultySelect = shouldAllow => sortingInput.querySelectorAll('.difficulty')
	.forEach(node => {
		node.disabled = !shouldAllow;
	});
const getCompletedItems = () => JSON.parse(localStorage.getItem('devswag:completed')) || [];

let search;
let selectr;

function setCompleteAttr(el) {
	Array.from(document.querySelectorAll('.item'))
		.find(item => item.contains(el)).dataset.completed = el.checked;
}

function handleCompleteStatus(e) {
	const stored = getCompletedItems();

	let completed;

	if (e.target.checked) {
		completed = [...stored, e.target.dataset.task];
	} else {
		completed = [...stored].filter(x => x !== e.target.dataset.task);
	}

	localStorage.setItem('devswag:completed', JSON.stringify(completed));

	setCompleteAttr(e.target);
}

function handleDifficulty(difficultyChanged) {
	const {value} = filterInput;
	Array.from(contentElement.querySelectorAll(`.${ACTIVE_CLASS}`))
		.forEach(swag => swag.classList.remove(ACTIVE_CLASS));

	if (value === 'alldifficulties') {
		activateElements(contentElement.querySelectorAll('.item'));
		allowDifficultySelect(true);
	} else {
		activateElements(contentElement.querySelectorAll(`.${value}`));
		allowDifficultySelect(false);
	}

	if (difficultyChanged && sortingInput.selectedIndex > 1) {
		sortingInput.selectedIndex = 0;
		return true;
	}

	return false;
}

function handleSort() {
	Array.from(contentElement.children)
		.map(child => contentElement.removeChild(child)) // eslint-disable-line unicorn/prefer-node-remove
		.sort(sort[sortingInput.value])
		.forEach(sortedChild => contentElement.append(sortedChild));
}

function handleTags() {
	const tags = selectr.getValue();

	Array.from(contentEl.querySelectorAll('.item')).forEach(el => {
		const show = (showExpired.checked || !el.classList.contains('tag-expired')) &&
			tags.reduce((sho, tag) => sho || el.classList.contains(`tag-${tag}`), tags.length === 0);

		const hide = hideCompleted.checked && el.querySelector('.complete-notice').checked;

		if (!show || hide) {
			el.classList.remove('visible');
		}
	});

	search.set('tags', tags.join(' '));

	search.set('expired', showExpired.checked || '');

	search.set('hide-completed', hideCompleted.checked || '');
}

function updateUrl() {
	let nextPath = window.location.pathname;

	const emptyParameters = [];
	for (const [key, value] of search) {
		if (!value.trim()) {
			emptyParameters.push(key);
		}
	}

	emptyParameters.forEach(parameter => search.delete(parameter));

	const queryString = search.toString();
	if (queryString) {
		nextPath += `?${queryString}`;
	}

	history.pushState(null, '', nextPath);
}

// The cascade is the function which handles calling filtering and sorting swag
function cascade(force = false) {
	force |= handleDifficulty(this === filterInput);
	if (force || this === sortingInput) {
		handleSort();
	}

	handleTags();
	updateUrl();
}

window.addEventListener('load', () => {
	selectr = new Selectr('#tags', {
		multiple: true,
		searchable: false,
		placeholder: 'Choose tags...',
		data: window.swagTags.map(tag => ({value: tag, text: tag}))
	});
	selectr.on('selectr.init', () => tagsSelect.classList.remove('hidden'));

	if ('URLSearchParams' in window) {
		search = new URLSearchParams(window.location.search);

		if (search.has('tags')) {
			selectr.setValue(search.get('tags').split(' '));
		}

		showExpired.checked = search.get('expired') === 'true';
		hideCompleted.checked = search.get('hide-completed') === 'true';
	}

	selectr.on('selectr.change', cascade);
	filterInput.addEventListener('input', cascade);
	sortingInput.addEventListener('input', cascade);
	showExpired.addEventListener('change', cascade);
	hideCompleted.addEventListener('change', cascade);

	const completedItems = getCompletedItems();

	document.querySelectorAll('.complete-notice').forEach(el => {
		if (completedItems.find(c => c === el.dataset.task)) {
			el.checked = true;
			setCompleteAttr(el);
		}

		el.addEventListener('change', handleCompleteStatus);
	});

	cascade.call(window, true);
});
