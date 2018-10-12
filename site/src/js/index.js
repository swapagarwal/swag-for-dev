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

let contentEl = document.getElementById('content'),
    filterInput = document.getElementById('filter'),
    sortingInput = document.getElementById('sorting'),
    firstLoad = true,
    selector = new Selectr('#tags', {
        multiple: true,
        placeholder: 'Choose tags...',
        data: window.swagTags.map(tag => ({value: tag, text: tag}))
    });

function allowDifficultySelect(shouldAllow) {
    sortingInput.querySelectorAll('.difficulty')
        .forEach(node => node.disabled = !shouldAllow);
}

function handleFilter() {
    let nodes;
    if (this.value === 'alldifficulties') {
        nodes = contentEl.querySelectorAll('.item');
        allowDifficultySelect(true);
    } else {
        nodes = contentEl.getElementsByClassName(this.value);
        Array.from(contentEl.getElementsByClassName(ACTIVE_CLASS))
            .forEach(swag => swag.classList.remove(ACTIVE_CLASS));

        allowDifficultySelect(false);
    }

    Array.from(nodes).forEach(node => node.classList.add(ACTIVE_CLASS));
}

function handleSort() {
    Array.from(contentEl.children)
        .map(child => contentEl.removeChild(child))
        .sort(sort[this.value])
        .forEach(sortedChild => contentEl.appendChild(sortedChild));
}

const renderSwag = () => {
    UrlHandler();

    contentEl.innerHTML = '';

    const filter = getFilter();
    const sorting = getSorting();
    const tagSort = getTagValue();

    window.swag
        .filter(v => filter === 'All difficulties' ? true : v.difficulty === filter.toLowerCase())
        .filter(v => tagSort.length ? tagSort.every(val => v.tags.includes(val)) : true)
        .map(item => {
            const {difficulty} = item;
            contentEl.innerHTML += `
                <div class='item'>
                    <div class='title flex'>
                        <h1>${item.name}</h1>
                        <div class='difficulty ${difficulty}' title='${difficulty} difficulty'>
                            <span class="sr-only">Difficulty: ${difficulty}</span>
                        </div>
                    </div>
                    <p class='swag'>
                        ${item.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </p>
                    <div class='flex img-container'>
                        <img src='${item.image}' alt="${item.name} swag you can get"></img>
                    </div>
                    <p class='description'>${item.description}</p>
                    <a href='${item.reference}'>Check it out</a>
                </div>
            `;
        });
};

const difficultyIndex = diff => ['easy', 'medium', 'hard'].indexOf(diff);

const getFilter = () => filterInput.value;
const getSorting = () => sortingInput.value;
const getTagValue = () => selector.getValue();

const UrlHandler = () => {
    if ('URLSearchParams' in window) {
        let searchParams = new URLSearchParams(window.location.search);
        if (firstLoad) {
            firstLoad = false;
            if (searchParams.has('tags')) {
                selector.setValue(searchParams.get('tags').split(' '));
                renderSwag();
            }
            selector.on('selectr.change', renderSwag);
        } else {
            if (getTagValue().length) {
                searchParams.set('tags', getTagValue().join(' '));
                const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
                history.pushState(null, '', newRelativePathQuery);
            } else {
                history.pushState(null, '', window.location.pathname);
            }
        }
    }
};

window.addEventListener('load', () => {
    UrlHandler();

    filterInput.addEventListener('input', handleFilter);
    sortingInput.addEventListener('input', handleSort);
});
