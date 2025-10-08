const pug = require('pug');
const fs = require('fs');
const path = require('path');
const {swagList} = require('./scripts/get-data');

// Read the compiled CSS
const cssPath = path.join(__dirname, 'dist/assets/css/index.css');
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

// Create a Map for inlined assets (as expected by the template)
const inlinedAssets = new Map();
inlinedAssets.set('css/index.css', css);

// Add images property with jpeg/webp paths for each swag item
// In dev mode without image optimization, use jpeg for both formats
swagList.forEach(swag => {
	if (!swag.images) {
		// Use .jpeg for both webp and jpeg to avoid 404 errors
		// Browser will still get the image, just in jpeg format
		swag.images = {
			jpeg: swag.image,
			webp: swag.image // Point to jpeg instead of non-existent webp
		};
	}
});

// Compile the Pug template
const html = pug.renderFile('src/pug/index.pug', {
	swagList,
	inlinedAssets,
	assetsBasePath: '/assets/',
	bustedAssets: {
		js: '/assets/js/index.js'
	}
});

// Write to dist/index.html
const outputPath = path.join(__dirname, 'dist/index.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✓ Successfully compiled index.html');
