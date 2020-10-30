#! /usr/bin/env node
const opportunities = require('../data.json');

let totalChanges = 0;

for (const opportunity of opportunities) {
	if (opportunity.tags.includes('hacktoberfest') && !opportunity.tags.includes('expired')) {
		totalChanges++;
		opportunity.tags.push('expired');
	}
}

if (totalChanges > 0) {
	const dataFilePath = require('path').resolve(__dirname, '../data.json');

	const dataAsString = JSON.stringify(
		opportunities,
		// JSON.stringify will add spaces around an array, which is not how we store arrays in JSON, so
		// we manually stringify the array. Since we're returning a string, the double quotes (") would
		// be escaped, so we use a replacer (`!;!`) (see next comment)
		(key, value) => key === 'tags' ? `[!;!${value.join('!;!, !;!')}!;!]` : value,
		2
	// Which is replaced after stringification. The final thing we have to do is "convert" the string
	// to an array, which we do by removing the start and end quotes from the value
	// (e.g. "[]" gets transformed to [])
	).replace(/!;!/g, '"').replace(/(\s+"tags": )"(.*)"/gm, '$1$2');

	require('fs').writeFileSync(dataFilePath, dataAsString + '\n');
	console.log('Expired %d hacktoberfest opportunities. See you next year!', totalChanges);
}
