/* global Selectr */

/**
 * Initialising global variables
 */
const ACTIVE_CLASS = 'visible';
const sort = {
	ALPHABETICAL_ASCENDING: (a, b) => a.dataset.name > b.dataset.name ? 1 : -1,
	ALPHABETICAL_DESCENDING: (a, b) => a.dataset.name < b.dataset.name ? 1 : -1,
	DIFFICULTY_ASCENDING: (a, b) => a.dataset.difficulty > b.dataset.difficulty ? 1 : -1,
	DIFFICULTY_DESCENDING: (a, b) => a.dataset.difficulty < b.dataset.difficulty ? 1 : -1
};

const contentEl = document.querySelector('#content');
const filterInput = document.querySelector('#filter');
const sortingInput = document.querySelector('#sorting');
const tagsSelect = document.querySelector('#tags');
const showExpired = document.querySelector('#expired');

const activateElements = els => Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
const allowDifficultySelect = shouldAllow => sortingInput.querySelectorAll('.difficulty')
	.forEach(node => {
		node.disabled = !shouldAllow;
	});

let search;
let selectr;

function handleDifficulty(difficultyChanged) {
	const {value} = filterInput;
	Array.from(contentEl.querySelectorAll(`.${ACTIVE_CLASS}`))
		.forEach(swag => swag.classList.remove(ACTIVE_CLASS));

	if (value === 'alldifficulties') {
		activateElements(contentEl.querySelectorAll('.item'));
		allowDifficultySelect(true);
	} else {
		activateElements(contentEl.querySelectorAll(`.${value}`));
		allowDifficultySelect(false);
	}

	if (difficultyChanged && sortingInput.selectedIndex > 1) {
		sortingInput.selectedIndex = 0;
		return true;
	}

	return false;
}

function handleSort() {
	Array.from(contentEl.children)
		.map(child => contentEl.removeChild(child))
		.sort(sort[sortingInput.value])
		.forEach(sortedChild => contentEl.append(sortedChild));
}

function handleTags() {
	const tags = selectr.getValue();

	Array.from(contentEl.querySelectorAll('.item')).forEach(el => {
		const show = (showExpired.checked || !el.classList.contains('tag-expired')) &&
			tags.reduce((sho, tag) => sho || el.classList.contains(`tag-${tag}`), tags.length === 0);
		if (!show) {
			el.classList.remove('visible');
		}
	});

	search.set('tags', tags.join(' '));

	search.set('expired', showExpired.checked || '');
}

function updateUrl() {
	let nextPath = window.location.pathname;

	const emptyParams = [];
	for (const [key, value] of search) {
		if (!value.trim()) {
			emptyParams.push(key);
		}
	}

	emptyParams.forEach(param => search.delete(param));

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
	}

	selectr.on('selectr.change', cascade);
	filterInput.addEventListener('input', cascade);
	sortingInput.addEventListener('input', cascade);
	showExpired.addEventListener('change', cascade);

	cascade.call(window, true);
});
