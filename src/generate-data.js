import historical from "./historical.js";
import { writeFile } from "fs/promises";

// Update this and the version in package.json to upgrade to a new
// release of the Unicode standard.
const UNICODE_VERSION = "17.0.0";

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
      `@unicode/unicode-${UNICODE_VERSION}/Script/${script}/ranges.js`
    );

    result[script] = ranges.map((r) => [r.begin, r.end]);
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
      `@unicode/unicode-${UNICODE_VERSION}/Binary_Property/${emoji}/ranges.js`
    );

    result[emoji] = ranges.map((r) => [r.begin, r.end]);
  }

  // Add the Private Use Area as a "script".
  result["PUA"] = [
    [0xe000, 0xf8ff],
    [0xf0000, 0xffffd],
    [0x100000, 0x10fffd],
  ];

  await writeFile(
    "data/scripts.js",
    `export default ${JSON.stringify(result, null, 2)};`
  );
}

generate();
