# Architecture of devSwag.io

## Overview

[devSwag.io](https://devswag.io/) uses [`Gulp`](https://gulpjs.com/) to build the website. The website is composed of [`Pug`](https://github.com/pugjs/pug) to template the front end of the website, [`Stylus`](https://github.com/stylus/stylus) to add styling, and the backend is a simple JSON file called `data.json` that stores each swag item in a JSON format.

## Frontend

[`Pug`](https://github.com/pugjs/pug) is a template engine implemented using JavaScript for use in Node.js and the browser. More information can be found in their repository. `.pug` files are written using pug syntax which compiles to HTML.

The devSwag frontend is composed of several `.pug` files stored in `src/pug`. These are later compiled to form static HTML files.

## Backend

Each event displayed at devSwag.io is a JSON object like this:

```js
{
    "name": "npm", // Name of the event
    "difficulty": "hard", // Difficult rating
    "description": "Fix a <a href='https://npm.community/c/bugs'>bug</a>, get a fashionable pair of socks!", // Brief description
    "reference": "http://blog.npmjs.org/post/129827785565/npm-weekly-30-package-scripts-for-tooling-a", // Link to the source
    "image": "https://partners.npmjs.com/weekly/weekly30/socks-1100x.jpg", // Image URL
    "dateAdded": "2018-02-18T06:03:12.000Z", // Date Added
    "tags": ["clothing"] // Tags to filter the event
}
```
Accompanying this is a script stored in `get-data.js` which extracts the image url of the event and generates unique filenames for each image file that will be downloaded later.

## Build Process

The entire website is built using gulp - an easy way to code your build instructions. These instructions are stored in `gulpfile.js`.

In gulp each step is a task, represented as JavaScript function. [devSwag.io](https://devswag.io/)'s website is built by executing several gulp tasks sequentially. Dig into the [gulp documentation](https://gulpjs.com/docs/en/getting-started/quick-start) and `gulpfile.js` to get a better understanding of what is happening behind the hood. In summary however, two main tasks take place when `gulpfile.js` is invoked.

1. Downloading assets and compiling source code into a static website.
2. Starting a web server, to serve the compiled website.

## Infrastructure

`devSwag.io` is hosted using [Netlify](https://www.netlify.com/). Netlify is a service commonly used to build and deploy static websites. Netlify will run a build command and deploy the result whenever new code is pushed to selected branches to a remote Git repository. This process is customised using `netlify.toml`. More information can be found in the [documentation](https://www.netlify.com/docs/continuous-deployment/).
