const swagImages = [];
const fileNames = [];
const swagList = require('../data.json').map(swag => {
    // @todo: remove once `active: Boolean` is added to data.json
    if (swag.tags.includes('hacktoberfest')) {
        return false;
    }
    // Generate unique filename
    // @todo: do we want to force jpeg as the image format?
    // const extension = swag.image.split('.').pop();
    const extension = 'jpg';
    const fileBase = swag.name
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
    let index = 0;

    let fileName = `${fileBase}.${extension}`;
    while (fileNames.includes(fileName)) {
        fileName = `${fileBase}-${++index}.${extension}`;
    }
    // End generate unique filename

    swagImages.push({
        url: swag.image,
        file: fileName
    });
    swag.image = `/assets/swag-img/${fileName}`;
    fileNames.push(fileName);

    return swag;
// @todo: remove (if needed) once `active: Boolean` is added to data.json
}).filter(Boolean);

module.exports = { swagList, swagImages };
