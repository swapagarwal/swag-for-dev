const swagImages = [];
const fileNames = [];
const swagList = require('./data.json').map(swag => {
	// Generate unique filename
	const extension = 'jpeg';
	const fileBase = swag.name
		.replace(/[^a-z\d]/gi, '_')
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
}).sort(({dateAdded: left}, {dateAdded: right}) => new Date(right) - new Date(left));

module.exports = {swagList, swagImages};
