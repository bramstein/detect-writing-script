# Writing script detection

This library detects the writing script given an array of Unicode codepoints. You can use this, for example, to detect writing script support for fonts.

Usage:

```
import detect from 'detect-writing-script';

const scripts = detect([65, 67, 68, 86, 89, ...], 0.25);

// {
//   'Latin': {
//     count: 182,
//     total: 1293
//   },
//   ...
// }
```

The first value given to the `detect` function is an array with numerical codepoints and the second parameter is a threshold (0.0 - 1.0) that can be used to exclude scripts with very low counts.

