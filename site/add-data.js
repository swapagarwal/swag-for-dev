// TODO: add extra tags

const fs = require('fs').promises;
const enquirer = require('enquirer');
const isURL = require('validator/lib/isURL');
const insertIndex = require('insertion-index');

const targetDataPath = '../data.json';
const data = require(targetDataPath);

const validateURL = val => (val && isURL(val) || 'Please enter a valid URL');
const validateNonEmptyString = val => (val && !!val.trim() || 'Value cannot be empty');
const validateNonEmptyChoices = val => (val.length > 0 || 'Please select at least 1 choice');

// gather existing tags
const allTags = Array.from(data.reduce(
    (tagList, {
        tags
    }) => {
        tags.forEach(tag => tagList.add(tag));
        return tagList;
    },
    new Set()
)).sort();

enquirer
    .prompt([{
        type: 'input',
        name: 'name',
        message: 'What is the name?',
        validate: validateNonEmptyString,
    },
    {
        type: 'select',
        name: 'difficulty',
        message: 'How difficult is this?',
        choices: [{
            name: 'easy',
            message: 'Easy',
            value: '#00ff00'
        },
        {
            name: 'medium',
            message: 'Medium',
            value: '#ffa500'
        },
        {
            name: 'hard',
            message: 'Hard',
            value: '#ff0000'
        }
        ],
    },
    {
        type: 'input',
        name: 'description',
        message: 'Add a complete description:',
        validate: validateNonEmptyString,
    },
    {
        type: 'input',
        name: 'reference',
        message: 'What URL as reference (website, blog post)?',
        validate: validateURL,
    },
    {
        type: 'input',
        name: 'image',
        message: 'Image URL of the swag:',
        validate: validateURL,
    },
    {
        type: 'multiselect',
        name: 'tags',
        message: 'Select associated tags:',
        choices: allTags,
        validate: validateNonEmptyChoices,
    }
    ])
    .then(answers => {
        const item = {
            name: answers.name,
            difficulty: answers.difficulty,
            description: answers.description,
            reference: answers.reference,
            image: answers.image,
            date: new Date().toISOString(),
            tags: answers.tags,
        };

        // if all values are not given exit with a gentle message
        // user probably triggered SIGINT
        if (Object.values(item).some(i => !i)) {
            console.info(
                '\nYou have to answer all questions to add an item.' +
                '\nData you entered hasn\'t been saved. Byebye.\n'
            );
            process.exit(1);
        }

        console.info(
            '\nThanks for contributing to `swag-for-dev`.\n' +
            'We\'ve added your new shiny swag (' + item.name + ') to "data.json",\n' +
            'please commit, push and open a PR.\n'
        );

        // insert item as a correct position given it's name
        const targetIndex = insertIndex(
            data.map(i => i.name),
            item.name,
            (i, j) => i.toLowerCase().localeCompare(j.toLowerCase()),
        );
        data.splice(targetIndex, 0, item);

        // write updated data file
        const payload = JSON.stringify(data, null, 2) + '\n';
        return fs.writeFile(targetDataPath, payload);
    });
