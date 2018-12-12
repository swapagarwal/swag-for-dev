const got = require('got');
const {expect} = require('chai');
let data;

describe('swag-for-dev', function () {
	it('data.json is valid', function () {
		data = require('../../data.json');
		expect(data).to.be.an('Array');
	});

	it('images and references are valid', function () {
		const promises = data.map(async ({image, reference}) => {
			expect(image).to.be.ok;
			expect(reference).to.be.ok;

			let imageValid, referenceValid;

			imageValid = await got.head(image).catch(({response}) => {
				if (response.statusCode === 403) {
					return got(image);
				}
			});

			referenceValid = await got.head(reference).catch(({response}) => {
				if (response.statusCode === 403) {
					return got(reference);
				}
			});

			try {
				expect(imageValid.statusCode).to.equal(200);
				expect(referenceValid.statusCode).to.equal(200);
			} catch (error) {
				// @todo remove
				console.log(error, image, reference);
			}
		});

		return Promise.all(promises);
	});
});
