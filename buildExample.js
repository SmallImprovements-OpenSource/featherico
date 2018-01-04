import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, readFileSync } from 'fs';
import { map, toPairs } from 'lodash/fp';
import path from 'path';
import * as icons from './dist';

writeFileSync(
    path.resolve(__dirname, 'example', (process.env.TRAVIS_COMMIT || 'index') + '.html'),
    getHtml(renderToStaticMarkup(<IconList />))
);

function IconList() {
    return (
        <div className="iconList">
            {map(
                ([iconName, Icon]) => (
                    <IconWrapper key={iconName} name={iconName}>
                        <Icon className="icon" />
                    </IconWrapper>
                ),
                toPairs(icons)
            )}
        </div>
    );
}

function IconWrapper({ children, name }) {
    return (
        <div className="iconWrapper">
            {children} {name}
        </div>
    );
}

function getHtml(content) {
    return readFileSync(path.resolve(__dirname, 'exampleTemplate.html'))
        .toString()
        .replace('{{CONTENT}}', content);
}
