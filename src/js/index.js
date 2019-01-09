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

const contentEl = document.getElementById('content');
const filterInput = document.getElementById('filter');
const sortingInput = document.getElementById('sorting');
const showExpired = document.getElementById('expired');
const tagsSelect = document.getElementById('tags');

const activateElements = els => Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
const allowDifficultySelect = shouldAllow => sortingInput.querySelectorAll('.difficulty')
	.forEach(node => {
		node.disabled = !shouldAllow;
	});

let search;
let selectr;

function handleDifficulty(difficultyChanged) {
	const {value} = filterInput;
	Array.from(contentEl.getElementsByClassName(ACTIVE_CLASS))
		.forEach(swag => swag.classList.remove(ACTIVE_CLASS));

	if (value === 'alldifficulties') {
		activateElements(contentEl.querySelectorAll('.item'));
		allowDifficultySelect(true);
	} else {
		activateElements(contentEl.getElementsByClassName(value));
		allowDifficultySelect(false);
	}

	if (difficultyChanged && sortingInput.selectedIndex > 1) {
		sortingInput.selectedIndex = 0;
		return true;
	}

	return false;
}

function updateUrl() {
	const newRelativePathQuery = `${window.location.pathname}?${search.toString()}`;

	if (search.toString() === '') {
		history.pushState(null, '', window.location.pathname);
	} else {
		history.pushState(null, '', newRelativePathQuery);
	}
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

	if (!search) {
		return;
	}

	if (tags.length === 0) {
		search.delete('tags');
	} else {
		search.set('tags', tags.join(' '));
	}

	updateUrl();
}

function handleSort() {
	Array.from(contentEl.children)
		.map(child => contentEl.removeChild(child))
		.sort(sort[sortingInput.value])
		.forEach(sortedChild => contentEl.appendChild(sortedChild));
}

// The cascade is the function which handles calling filtering and sorting swag
function cascade(force = false) {
	force |= handleDifficulty(this === filterInput);
	force |= handleTags(Boolean(this.el));
	if (force || this === sortingInput) {
		handleSort(this === sortingInput);
	}

	if (this === showExpired) {
		if (!search) {
			search = new URLSearchParams(window.location.search);
		}

		if (this.checked) {
			search.set('expired', 'y');
		} else {
			search.delete('expired');
		}

		updateUrl();
	}
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

		showExpired.checked = search.has('expired');
	}

	selectr.on('selectr.change', cascade);
	filterInput.addEventListener('input', cascade);
	sortingInput.addEventListener('input', cascade);
	showExpired.addEventListener('change', cascade);

	cascade.call(window, true);
});
