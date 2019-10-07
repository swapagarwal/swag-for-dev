const got = require('got');
const {expect} = require('chai');

const data = require('../../data.json');

function checkURL(url, head = false) {
	const method = head ? 'head' : 'got';
	return got[method](url, {throwHttpErrors: false}).then(({statusCode}) => {
		if (!head && statusCode === 403) {
			return checkURL(url, true);
		}

		expect(statusCode).to.equal(200);
	});
}

describe('swag-for-dev', function () {
	it('data.json is valid', function () {
		data.forEach(datum => {
			expect(datum.name).to.be.a('string');
			expect(datum.difficulty).to.be.oneOf(['easy', 'medium', 'hard']);
			expect(datum.reference).to.be.a('string');
			expect(datum.image).to.be.a('string');
			expect(datum.dateAdded).to.match(/20\d\d-[0-1][\d]-[0-3][\d]T\d\d:\d\d:\d\d\.000Z/);
			expect(datum.tags).to.be.an('Array').with.length.greaterThan(0);
		});
	});

	describe('valid images and references', function () {
		expect(data).to.be.an('Array');
		data.forEach(opportunity => {
			/* eslint-disable max-nested-callbacks */
			describe(opportunity.name, function () {
				it('valid reference', function () {
					this.timeout(6500);
					this.slow(1500);
					return checkURL(opportunity.reference);
				});

				it('valid image', function () {
					this.timeout(6500);
					this.slow(1500);
					return checkURL(opportunity.image);
				});
			});
			/* eslint-enable max-nested-callbacks */
		});
	});
});
