# Featherico

Featherico is the icon library used in the [Small Improvements](https://www.small-improvements.com) web application. It takes most icons from the excellent [Feather](https://github.com/feathericons/feather), adds some custom icons and exports them all as React components. The generation of React components is inspired by [react-feather](https://github.com/carmelopullara/react-feather).

## Usage

```
npm install featherico
```

```js
import { IconModulePraise } from 'featherico';

<IconModulePraise />
```

## Contribute

- To add or edit [feather icons](https://feathericons.com/), adjust the `whitelist.json` file.
- To add custom icons, add them to the `/custom` directory (use svg files).
- Open a pull request for your changes, and ask for a review.

### Releases

Releases are automatically generated based on [semantic-release](https://www.npmjs.com/package/semantic-release) conventions. Make sure to write commit messages accordingly – examples: `feat: add "hamburger"` or `fix(workflow): bump node version`
