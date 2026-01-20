import React from 'react';
import * as icons from './dist';
import { renderToStaticMarkup } from 'react-dom/server';
import { toPairs } from 'lodash/fp';
import { writeFileSync } from 'fs';
import path from 'path';

const strokeWidths = [
    ['1.5', 400],
    ['2', 500],
    ['2.2', 600],
];

toPairs(icons).forEach(([iconName, Icon]) => {
    const svg = renderToStaticMarkup(<Icon />);
    const fileName = iconName.replaceAll('Icon', 'Icon:');
    strokeWidths.forEach(([strokeWidth, weight]) => {
        writeFileSync(
            path.resolve(__dirname, 'svg-export/', fileName + ':' + weight + '.svg'),
            '<?xml version="1.0" standalone="yes"?>' +
                svg
                    .replaceAll('var(--fi-stroke, 2px)', strokeWidth + 'px')
                    .replaceAll('stroke-width="2"', `stroke-width="${strokeWidth}"`)
        );
    });
});
