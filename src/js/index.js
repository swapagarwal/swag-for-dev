/* global Selectr */

/**
 * Initialising global variables
 */
const ACTIVE_CLASS = 'visible';
const sort = {
	ALPHABETICAL_ASC: (a, b) => a.dataset.name > b.dataset.name ? 1 : -1,
	ALPHABETICAL_DESC: (a, b) => a.dataset.name < b.dataset.name ? 1 : -1,
	DIFFICULTY_ASC: (a, b) => a.dataset.difficulty > b.dataset.difficulty ? 1 : -1,
	DIFFICULTY_DESC: (a, b) => a.dataset.difficulty < b.dataset.difficulty ? 1 : -1
};

const contentEl = document.getElementById('content');
const filterInput = document.getElementById('filter');
const sortingInput = document.getElementById('sorting');
const tagsSelect = document.getElementById('tags');

const activateElements = els => Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
const allowDifficultySelect = shouldAllow => sortingInput.querySelectorAll('.difficulty')
	.forEach(node => {
		node.disabled = !shouldAllow;
	});

const parameters = {
	tags: {
		default: '',
		getValue: () => selectr.getValue().join(' '),
		setValue: value => selectr.setValue(value.split(' '))
	},
	difficulty: {
		default: 'all',
		getValue: () => filterInput.value,
		setValue: value => {
			filterInput.value = ['easy', 'medium', 'hard'].includes(value) ?
				value :
				'all';
		}
	},
	sort: {
		default: 'alphabetical',
		getValue: () => sortParams.sort.toLowerCase(),
		setValue: value => {
			sortParams.sort = ['alphabetical', 'difficulty'].includes(value) ?
				value.toUpperCase() :
				'ALPHABETICAL';
		}
	},
	order: {
		default: 'asc',
		getValue: () => sortParams.order.toLowerCase(),
		setValue: value => {
			sortParams.order = ['asc', 'desc'].includes(value) ?
				value.toUpperCase() :
				'ASC';
		}
	}
};

const sortParams = {
	sort: null,
	order: null
};

let search;
let selectr;

function updateUrl() {
	const newSearch = new URLSearchParams(window.location.search);
	for (const [paramName, paramObj] of Object.entries(parameters)) {
		const paramValue = paramObj.getValue();
		if (['', paramObj.default].includes(paramValue)) {
			newSearch.delete(paramName);
			continue;
		}
		newSearch.set(paramName, paramValue);
	}
	const newSearchString = newSearch.toString();
	let newRelativePathQuery = window.location.pathname;
	if (newSearchString) {
		newRelativePathQuery += `?${newSearchString}`;
	}
	history.pushState(null, '', newRelativePathQuery);
}

function handleDifficulty(difficultyChanged) {
	const {value} = filterInput;
	Array.from(contentEl.getElementsByClassName(ACTIVE_CLASS))
		.forEach(swag => swag.classList.remove(ACTIVE_CLASS));

	if (value === parameters.difficulty.default) {
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

function handleTags() {
	const tags = selectr.getValue();

	if (tags.length === 0) {
		return;
	}

	Array.from(contentEl.querySelectorAll('.item')).forEach(el => {
		const show = tags.reduce((sho, tag) => sho || el.classList.contains(`tag-${tag}`), false);
		if (!show) {
			el.classList.remove('visible');
		}
	});
}

function handleSort() {
	if (!sortParams.sort || !sortParams.order) {
		if (!sortParams.sort) {
			sortParams.sort = sortingInput.value.split('_')[0];
		}
		if (!sortParams.order) {
			sortParams.order = sortingInput.value.split('_')[1];
		}
		sortingInput.value = [sortParams.sort, sortParams.order].join('_');
	}
	[sortParams.sort, sortParams.order] = sortingInput.value.split('_');
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
		handleSort();
	}
	if (!force) {
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
		for (const [paramName, paramObj] of Object.entries(parameters)) {
			if (search.has(paramName)) {
				paramObj.setValue(search.get(paramName));
			}
		}
	}

	selectr.on('selectr.change', cascade);
	filterInput.addEventListener('input', cascade);
	sortingInput.addEventListener('input', cascade);

	cascade.call(window, true);
});
