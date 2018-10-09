/**
 * Initialising global variables
 */
let contentEl = document.querySelector('#content'),
    filterInput = document.querySelector('#filter'),
    sortingInput = document.querySelector('#sorting'),
    firstLoad = true,
    selector = new Selectr('#tags', {
        multiple: true,
        placeholder: 'Choose tags...',
        data: window.swagTags.map(tag => ({value: tag, text: tag}))
    });

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
            }
        })
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

    filterInput.addEventListener('input', renderSwag);
    sortingInput.addEventListener('input', renderSwag);
});
