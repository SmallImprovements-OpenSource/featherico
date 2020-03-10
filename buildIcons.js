const feather = require('feather-icons');
const { compose, toPairs, fromPairs, map, camelCase, upperFirst, filter, includes, sortBy } = require('lodash/fp');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { transform } = require('@babel/core');
const writeFile = promisify(fs.writeFile);
const { getBadgeIcons, getCustomIcons } = require('./customIcons');
const whitelist = require('./whitelist');
const aliased = require('./aliased');

const pascalCase = compose(upperFirst, camelCase);
const filterWhitelisted = compose(
    fromPairs,
    filter(([name]) => includes(name, whitelist)),
    toPairs
);
const outputPath = path.resolve(__dirname, 'dist');
const outputPathEs5 = path.resolve(__dirname, 'dist-es5');
const outputPathTypings = path.resolve(__dirname, 'typings');

getIcons()
    .then(write)
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

async function getIcons() {
    const [customIcons, badgeIcons] = await Promise.all([getCustomIcons(), getBadgeIcons()]);
    const makePascalCase = map(([name, icon]) => [pascalCase('icon-' + name), icon]);
    const mapTemplate = templateFn => map(([name, icon]) => [name, templateFn(name, icon)]);

    return compose(sortBy(([name]) => name))([
        ...compose(
            mapTemplate(template),
            makePascalCase,
            toPairs
        )({
            ...filterWhitelisted(feather.icons),
            ...getAliased(),
            ...customIcons,
        }),
        ...compose(
            map(([name, icon]) => [name, icon, true]),
            mapTemplate(badgeTemplate),
            makePascalCase,
            toPairs
        )(badgeIcons),
    ]);
}

function template(name, icon) {
    return `import React from 'react';
import style from '../style';

export default React.memo(function ${name}(props) {
    return (
        <svg style={props.customStyle || style} className={props.className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMaxYMid slice" focusable="false" data-featherico>
            ${icon}
        </svg>
    );
});
`;
}

function badgeTemplate(name, icon) {
    return `import React from 'react';

var style = { verticalAlign: 'middle' };

export default React.memo(function ${name}(props) {
    if (props.small) {
        return (
            <svg width="14" height="14" className={props.className} style={style}>
                ${icon.small}
            </svg>
        );
    } else {
        return (
            <svg width="20" height="20" className={props.className} style={style}>
                ${icon.large}
            </svg>
        );
    }
});
`;
}

function getAliased() {
    return compose(
        fromPairs,
        map(([originalName, newName]) => [newName, feather.icons[originalName]]),
        toPairs
    )(aliased);
}

function write(icons) {
    return Promise.all([writeTypings(icons), writeIndex(icons), ...map(writeIcon, icons)]);
}

function writeIndex(icons) {
    const fileName = 'index.js';
    const imports = map(([name]) => `export ${name} from './${name}';`)(icons);
    const { code } = transform([...imports, '\n'].join('\n'), {
        plugins: ['@babel/plugin-proposal-export-default-from'],
    });
    const { code: codeEs5 } = transform(code, { plugins: ['@babel/plugin-transform-modules-commonjs'] });
    return Promise.all([
        writeFile(path.resolve(outputPath, fileName), code),
        writeFile(path.resolve(outputPathEs5, fileName), codeEs5),
    ]);
}

function writeIcon([name, icon]) {
    const fileName = name + '.js';
    const { code } = transform(icon, { presets: ['@babel/preset-react'] });
    const { code: codeEs5 } = transform(code, { plugins: ['@babel/plugin-transform-modules-commonjs'] });
    return Promise.all([
        writeFile(path.resolve(outputPath, fileName), code),
        writeFile(path.resolve(outputPathEs5, fileName), codeEs5),
    ]);
}

function writeTypings(icons) {
    const exports = map(
        ([name, icon, badge]) => `export var ${name}: React.ComponentType<${badge ? 'FeathericoBadge' : 'Featherico'}>`,
        icons
    ).join('\n');
    const typings = `import * as React from 'react'

export type Featherico = {
    className?: string,
    customStyle?: React.CSSProperties
}

export type FeathericoBadge = {
    className?: string,
    small?: boolean,
}

${exports}
 `;

    return writeFile(path.resolve(outputPathTypings, 'index.d.ts'), typings);
}
