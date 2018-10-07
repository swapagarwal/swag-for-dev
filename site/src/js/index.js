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
            case 'Alphabetical':            return a.name.toLowerCase() > b.name.toLowerCase();
            case 'Alphabetical, reversed':  return a.name.toLowerCase() < b.name.toLowerCase();
            case 'Difficulty':              return difficultyIndex(a.difficulty) > difficultyIndex(b.difficulty);
            case 'Difficulty, reversed':    return difficultyIndex(a.difficulty) < difficultyIndex(b.difficulty);
            }
        })
        .map(item => {
            contentEl.innerHTML += `
                <div class='item'>
                    <div class='title flex'>
                        <h1>${item.name}</h1>
                        <div class='difficulty ${item.difficulty}' title='${item.difficulty} difficulty'></div>
                    </div>
                    <p class='swag'>
                        ${item.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </p>
                    <div class='flex img-container'>
                        <img src='${item.image}'></img>
                    </div>
                    <p class='desciption'>${item.description}</p>
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
