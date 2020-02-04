# Wikitext Serializer for Prosemirror

[![Build Status](https://travis-ci.org/iFixit/prosemirror-wikitext.svg?branch=master)](https://travis-ci.org/iFixit/prosemirror-wikitext)

This project supports taking a Prosemirror document and serializing it into
iFixit's custom wiki text syntax.

## Build

```
npm run build
```

This will run `tsc` to transform all TypeScript source files in `src/` to ES5 in a
directory called `dist/`

## Test

```
npm run test
```

This runs all test cases with jest, using the default file match pattern, which runs all files under a `__tests__` directory or any `file.spec.ts` or `file.test.ts` files.

## License

This is released under the MIT License.
