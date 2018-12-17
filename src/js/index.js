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
const mode = document.getElementsByClassName("fas");	//change

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

function handleTags() {
	const tags = selectr.getValue();

	if (tags.length === 0) {
		history.pushState(null, '', window.location.pathname);
		return;
	}

	Array.from(contentEl.querySelectorAll('.item')).forEach(el => {
		const show = tags.reduce((sho, tag) => sho || el.classList.contains(`tag-${tag}`), false);
		if (!show) {
			el.classList.remove('visible');
		}
	});

	if (!search) {
		return;
	}
	search.set('tags', tags.join(' '));
	const newRelativePathQuery = `${window.location.pathname}?${search.toString()}`;
	history.pushState(null, '', newRelativePathQuery);
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
}

window.addEventListener('load', () => {
	selectr = new Selectr('#tags', {
		multiple: true,
		placeholder: 'Choose tags...',
		data: window.swagTags.map(tag => ({value: tag, text: tag}))
	});

	if ('URLSearchParams' in window) {
		search = new URLSearchParams(window.location.search);
		if (search.has('tags')) {
			selectr.setValue(search.get('tags').split(' '));
		}
	}

	selectr.on('selectr.change', cascade);
	filterInput.addEventListener('input', cascade);
	sortingInput.addEventListener('input', cascade);

	cascade.call(window, true);
});

//if (window.matchMedia("(min-width: 400px)").matches)	then load different css

mode[0].addEventListener("click",function(){  
	const body = document.querySelector('body');
	body.classList.toggle("dark_container");
	const heading_h1 = document.querySelector("section.main .heading h1");
	heading_h1.classList.toggle("dark");
	const heading_p = document.querySelectorAll("section.main .heading p");
	heading_p[0].classList.toggle("dark");
	heading_p[1].classList.toggle("dark");
	const descriptions = document.querySelectorAll("section.main .content .item p.description");
	for (var i =0; i<descriptions.length; i++) {
		descriptions[i].classList.toggle("dark");
	}
	const refs = document.querySelectorAll("section.main .content .item a");
	for (var i =0; i<refs.length; i++) {
		refs[i].classList.toggle("dark_refs");
	}
});