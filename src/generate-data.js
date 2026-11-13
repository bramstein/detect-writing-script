import historical from "./historical.js";
import aliases from "unicode-property-value-aliases";
import { writeFile } from "fs/promises";

// Update this and the version in package.json to upgrade to a new
// release of the Unicode standard.
const UNICODE_VERSION = "18.0.0";

// Map the long script names used throughout the Unicode data onto their
// ISO 15924 codes. The first alias of a name is its code; the remaining
// ones, if any, are deprecated spellings.
const codes = new Map();

for (const [alias, name] of aliases.get("Script")) {
  if (!codes.has(name)) {
    codes.set(name, alias);
  }
}

async function generate() {
  const result = {};
  const {
    default: { Script },
  } = await import(`@unicode/unicode-${UNICODE_VERSION}`);

  // Filter out historical/ancient scripts and the 'Common' script
  const scripts = Script.filter(
    (script) => !historical.includes(script) && script !== "Common"
  );

  for (const script of scripts) {
    const { default: ranges } = await import(
      `@unicode/unicode-${UNICODE_VERSION}/Script/${script}/ranges.mjs`
    );

    if (!codes.has(script)) {
      throw new Error(`found no ISO 15924 code for ${script}`);
    }

    result[script] = {
      code: codes.get(script),
      ranges: ranges.map((r) => [r.begin, r.end]),
    };
  }

  // Also include Emoji though technically not a writing script.
  const emojis = [
    "Emoji",
    "Emoji_Component",
    "Emoji_Modifier",
    "Emoji_Modifier_Base",
    "Emoji_Presentation",
  ];

  for (const emoji of emojis) {
    const { default: ranges } = await import(
      `@unicode/unicode-${UNICODE_VERSION}/Binary_Property/${emoji}/ranges.mjs`
    );

    result[emoji] = {
      code: null,
      ranges: ranges.map((r) => [r.begin, r.end]),
    };
  }

  // Add the Private Use Area as a "script".
  result["PUA"] = {
    code: null,
    ranges: [
      [0xe000, 0xf8ff],
      [0xf0000, 0xffffd],
      [0x100000, 0x10fffd],
    ],
  };

  await writeFile(
    "data/scripts.js",
    `export default ${JSON.stringify(result, null, 2)};`
  );
}

generate();
