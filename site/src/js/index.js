/**
 * Initialising global variables
 */
let contentEl = document.querySelector('#content'),
    filterInput = document.querySelector('#filter'),
    sortingInput = document.querySelector('#sorting'),
    claps = {},
    firstLoad = true,
    selector = new Selectr('#tags', {
        multiple: true,
        placeholder: 'Choose tags...',
        data: window.swagTags.map(tag => ({value: tag, text: tag}))
    });

const API = 'https://api.applause-button.com';
const URL = 'devswag.io/';

const requestClaps = (urls) => {
    return new Promise((resolve) => {
        fetch(`${API}/get-multiple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(urls),
        }).then(response => {
            response.json().then((claps) => {
                let clapsObject = {};

                claps.forEach(item => {
                    clapsObject[item.url] = item.claps;
                });

                resolve(clapsObject);
            });
        });
    });
};

const getItemUrl = (item) => URL + item.reference ? item.reference : item.name;

const renderSwag = () => {
    UrlHandler();

    contentEl.innerHTML = '';

    const filter = getFilter();
    const sorting = getSorting();
    const tagSort = getTagValue();

    window.swag
        .filter(v => filter === 'All difficulties' ? true : v.difficulty === filter.toLowerCase())
        .filter(v => tagSort.length ? tagSort.every(val => v.tags.includes(val)) : true)
        .sort((a, b) => {
            switch (sorting) {
            case 'Alphabetical':           return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
            case 'Alphabetical, reversed': return a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1;
            case 'Difficulty':             return difficultyIndex(a.difficulty) > difficultyIndex(b.difficulty) ? 1 : -1;
            case 'Difficulty, reversed':   return difficultyIndex(a.difficulty) < difficultyIndex(b.difficulty) ? 1 : -1;
            case 'Popularity':             return claps[getItemUrl(a)] < claps[getItemUrl(b)] ? 1 : -1;
            case 'Popularity, reversed':   return claps[getItemUrl(a)] > claps[getItemUrl(b)] ? 1 : -1;
            }
        })
        .map(item => {
            const {difficulty} = item;
            contentEl.innerHTML += `
                <div class='item'>
                    <div class='title flex'>
                        <h1>${item.name}</h1>
                        <applause-button class='applause' url='${`${getItemUrl(item)}`}' multiclap='true'></applause-button>
                        <div class='difficulty ${difficulty}' title='${difficulty} difficulty'>
                            <span class='sr-only'>Difficulty: ${difficulty}</span>
                        </div>
                    </div>
                    <p class='swag'>
                        ${item.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </p>
                    <div class='flex img-container'>
                        <img src='${item.image}' alt='${item.name} swag you can get'></img>
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

    const urls = window.swag.map(getItemUrl);

    requestClaps(urls).then(resp => {
        claps = resp;

        const selectInput = document.getElementById('sorting');

        const popularNode = document.createElement('option');
        node.value = 'Popularity';

        const reversePopularNode = document.createElement('option');
        node.value = 'Popularity, reversed';

        selectInput.appendChild(popularNode);
        selectInput.appendChild(reversePopularNode);
    });

    filterInput.addEventListener('input', renderSwag);
    sortingInput.addEventListener('input', renderSwag);
});
