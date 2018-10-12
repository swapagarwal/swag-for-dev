/* global Selectr */

/**
 * Initialising global variables
 */
const ACTIVE_CLASS = 'visible';
const sort = {
    ASC_A: (a,b) => a.dataset.name > b.dataset.name ? 1 : -1,
    DSC_A: (a,b) => a.dataset.name < b.dataset.name ? 1 : -1,
    ASC_D: (a,b) => a.dataset.difficulty > b.dataset.difficulty ? 1 : -1,
    DSC_D: (a,b) => a.dataset.difficulty < b.dataset.difficulty ? 1 : -1
};

const contentEl = document.getElementById('content'),
    filterInput = document.getElementById('filter'),
    tagsInput = document.getElementById('tags'),
    sortingInput = document.getElementById('sorting');

function allowDifficultySelect(shouldAllow) {
    sortingInput.querySelectorAll('.difficulty')
        .forEach(node => node.disabled = !shouldAllow);
}

function activateElements(els) {
    Array.from(els).forEach(node => node.classList.add(ACTIVE_CLASS));
}

function handleDifficulty(el) {
    if (el !== filterInput) {
        return;
    }

    Array.from(contentEl.getElementsByClassName(ACTIVE_CLASS))
        .forEach(swag => swag.classList.remove(ACTIVE_CLASS));

    if (filterInput.value === 'alldifficulties') {
        activateElements(contentEl.querySelectorAll('.item'));
        allowDifficultySelect(true);
    } else {
        activateElements(contentEl.getElementsByClassName(filterInput.value));
        allowDifficultySelect(false);
    }
}

function handleSort(el) {
    if (el !== sortingInput) {
        return;
    }

    Array.from(contentEl.children)
        .map(child => contentEl.removeChild(child))
        .sort(sort[sortingInput.value])
        .forEach(sortedChild => contentEl.appendChild(sortedChild));
}

function initTags() {
    if (!('URLSearchParams' in window)) {
        return;
    }

    window.swagSearch = new URLSearchParams(window.location.search);
    if (window.swagSearch.has('tags')) {
        window.selector.setValue(window.swagSearch.get('tags').split(' '));
    }
}

function handleTags(el) {
    if (el !== tagsInput) {
        return;
    }

    const tags = window.selector.getValue();

    if (tags.length) {
        Array.from(contentEl.querySelectorAll('.visible')).forEach(el => {
            let show = false;
            tags.forEach(tag => {
                if (el.classList.contains(`tag-${tag}`)) {
                    show = true;
                }
            });
            if (!show) {
                el.classList.remove('visible');
            }
        });

        if (!window.swagSearch) {
            return;
        }
        window.swagSearch.set('tags', tags.join(' '));
        const newRelativePathQuery = `${window.location.pathname}?${window.swagSearch.toString()}`;
        history.pushState(null, '', newRelativePathQuery);
    } else {
        activateElements(contentEl.querySelectorAll('.item'));
        history.pushState(null, '', window.location.pathname);
    }
}

// The cascade is the function which handles calling filtering and sorting swag
function cascade() {
    const el = this.el || this;

    // Order matters. First, filter by difficulty, then by tag, and finally sort
    handleDifficulty(el);
    handleTags(el);
    handleSort(el);
}

window.addEventListener('load', () => {
    window.selector = new Selectr('#tags', {
        multiple: true,
        placeholder: 'Choose tags...',
        data: window.swagTags.map(tag => ({ value: tag, text: tag }))
    });

    initTags();
    window.selector.on('selectr.change', cascade);
    filterInput.addEventListener('input', cascade);
    sortingInput.addEventListener('input', cascade);
});
