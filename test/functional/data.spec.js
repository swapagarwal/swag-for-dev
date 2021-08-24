const got = require('got');
const {expect} = require('chai');
const parallel = require('mocha.parallel');
const sharp = require('sharp');
const Ajv = require('ajv');

const data = require('../../data.json');
const schema = require('../../schema.json');
const LIMIT_PARALLEL_TESTS = 10;

const requestOptions = {
	throwHttpErrors: false,
	insecureHTTPParser: true
};

function checkURL(url, head = false) {
	const method = head ? 'head' : 'get';
	return got[method](url, requestOptions).then(({statusCode}) => {
		if (!head && statusCode === 403) {
			return checkURL(url, true);
		}

		expect(statusCode).to.equal(200);
	});
}

describe('swag-for-dev', function () {
	it('data.json has valid schema', function () {
		const ajv = new Ajv(); 
		const valid = ajv.validate(schema, data);
		expect(valid).to.be.true;
	});

	it('data.json is valid', function () {
		expect(data).to.be.an('Array');
		data.forEach(datum => {
			expect(datum.name).to.be.a('string');
			expect(datum.difficulty).to.be.oneOf(['easy', 'medium', 'hard']);
			expect(datum.reference).to.be.a('string');
			expect(datum.image).to.be.a('string');
			expect(datum.dateAdded).to.match(/20\d\d-[01]\d-[0-3]\dT\d\d:\d\d:\d\d\.000Z/);
			expect(datum.tags).to.be.an('Array').with.length.greaterThan(0);
		});
	});

	it('valid alphabetical order', function () {
		const left = data.map(({name}) => name.toLowerCase());
		const right = [...left].sort();
		expect(left).to.deep.equal(right);
	});

	const dataSlices = [];
	for (let i = 0, {length} = data; i < length; i += LIMIT_PARALLEL_TESTS) {
		dataSlices.push(data.slice(i, i + LIMIT_PARALLEL_TESTS));
	}

	dataSlices.forEach((data, i) => {
		const testName = `validate images and references ${(i * LIMIT_PARALLEL_TESTS) + 1} - ` +
			`${(i * LIMIT_PARALLEL_TESTS) + data.length}`;
		parallel(testName, function () {
			data.forEach(opportunity => {
				/* eslint-disable max-nested-callbacks */
				describe(opportunity.name, function () {
					if (!opportunity.tags.includes('expired')) {
						it(opportunity.name + ' has a valid reference', function () {
							this.timeout(10000);
							this.slow(1500);
							return checkURL(opportunity.reference);
						});
					}

					it(opportunity.name + ' has a valid image', async function () {
						this.timeout(10000);
						this.slow(1500);
						const {rawBody} = await got(opportunity.image);
						const buffer = await sharp(rawBody, {limitInputPixels: false}).toBuffer();
						expect(buffer).to.exist.and.to.be.an.instanceof(Buffer);
					});
				});
				/* eslint-enable max-nested-callbacks */
			});
		});
	});
});
