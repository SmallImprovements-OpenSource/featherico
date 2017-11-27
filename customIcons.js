const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const fs = require('fs');
const { concat, curry, map, forEach, keys, fromPairs, camelCase, includes, toArray } = require('lodash/fp');
const cheerio = require('cheerio');
const SVGO = require('svgo');
const svgo = new SVGO({ plugins: [{ convertPathData: false }] });
const readFile = promisify(fs.readFile);

const defaultAttrs = {
    width: '24',
    height: '24',
    'view-box': '0 0 24 24',
    fill: 'none',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
};

const cleanAttributes = curry(($, node) => {
    const { attribs } = node;

    forEach(attr => {
        const defaultValue = defaultAttrs[attr];

        if (attr === 'fill') {
            return $(node).attr(attr, 'currentColor');
        }

        if ((defaultValue && defaultValue === attribs[attr]) || (attr === 'stroke' && attribs[attr] !== 'none')) {
            return $(node).removeAttr(attr);
        }

        if (includes('-', attr)) {
            return $(node)
                .attr(camelCase(attr), attribs[attr])
                .removeAttr(attr);
        }
    }, keys(attribs));
});

const cleanSvg = svg => {
    const $ = cheerio.load(svg, { xmlMode: true });
    const svgInner = $('svg').children();
    forEach(attr => {
        if (defaultAttrs[attr]) {
            svgInner.removeAttr(attr);
        }
    }, keys(svgInner.attr()));
    forEach(cleanAttributes($), [...toArray(svgInner), ...toArray(svgInner.find('*'))]);
    return svgInner.toString();
};

module.exports = async function getIcons() {
    const files = await glob('custom/*.svg');
    const icons = await Promise.all(map(mapIcon)(files));
    return fromPairs(icons);
};

async function mapIcon(iconPath) {
    const name = path.basename(iconPath, '.svg');
    const svg = await readFile(iconPath, 'utf8');
    const { data: optimized } = await svgo.optimize(svg);
    return [name, cleanSvg(optimized)];
}
