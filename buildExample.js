import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { map, toPairs } from 'lodash/fp';
import path from 'path';
import * as icons from './dist';

writeFileSync(path.resolve(__dirname, 'example', 'index.html'), getHtml(renderToStaticMarkup(<IconList />)));

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
            {children}
            {name}
        </div>
    );
}

function getHtml(content) {
    return `<!doctype html>
<html lang=en>
<head>
<meta charset=utf-8>
<title>Featherico</title>
</head>
<body>
    ${content}
</body>
</html>`;
}
