const got = require('got');
const {expect} = require('chai');

let data;

function checkURL(url, head = false) {
	const method = head ? 'head' : 'get';
	return got[method](url, {throwHttpErrors: false}).then(({statusCode}) => {
		if (statusCode === 403) {
			return checkURL(url, true);
		}
		expect(statusCode).to.equal(200);
	});
}

describe('swag-for-dev', function () {
	it('data.json is valid', function () {
		data = require('../../data.json');
		expect(data).to.be.an('Array');
	});

	describe('valid images and references', function () {
		data = require('../../data.json');
		delete require.cache[require.resolve('../../data.json')];
		data.forEach(opportunity => {
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
		});
	});
});
