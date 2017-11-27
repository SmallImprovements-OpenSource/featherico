const feather = require('feather-icons');
const { compose, toPairs, map, forEach, camelCase, upperFirst, filter, includes } = require('lodash/fp');
const path = require('path');
const fs = require('fs');
const { transform } = require('babel-core');
const getCustomIcons = require('./customIcons');

const pascalCase = compose(upperFirst, camelCase);
const outputPath = path.resolve(__dirname, 'dist');

getIcons()
    .then(write)
    .catch(error => console.error(error));

async function getIcons() {
    const customIcons = await getCustomIcons();
    return compose(
        map(([name, icon]) => [name, template(name, icon)]),
        map(([name, icon]) => [pascalCase('icon-' + name), icon]),
        toPairs
    )({ ...feather.icons, ...customIcons });
}

function template(name, icon) {
    return `import React from 'react';

export default function ${name}() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            ${icon}
        </svg>
    );
}
`;
}

function write(icons) {
    writeIndex(icons);
    forEach(writeFile)(icons);
}

function writeIndex(icons) {
    const imports = map(([name]) => `export ${name} from './${name}';`)(icons);
    const { code } = transform([...imports, '\n'].join('\n'), { plugins: ['transform-export-extensions'] });
    fs.writeFileSync(path.resolve(outputPath, 'index.js'), code);
}

function writeFile([name, icon]) {
    const { code } = transform(icon, { presets: ['react'] });
    fs.writeFileSync(path.resolve(outputPath, name + '.js'), code);
}
