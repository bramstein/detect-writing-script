import assert from "node:assert/strict";
import { test } from "node:test";

import scripts from "../data/scripts.js";
import detect from "../src/index.js";

const names = Object.keys(scripts);

const exclusive = names.filter((name) => scripts[name].code !== null);

function attribute(codepoint) {
  return Object.keys(detect([codepoint], 0));
}

test("attributes a codepoint to the script containing it", () => {
  assert.deepEqual(attribute(0x0041), ["Latin"]);
  assert.deepEqual(attribute(0x0400), ["Cyrillic"]);
  assert.deepEqual(attribute(0x064b), ["Inherited"]);
  assert.deepEqual(attribute(0x0700), ["Syriac"]);
  assert.deepEqual(attribute(0x0900), ["Devanagari"]);
  assert.deepEqual(attribute(0x1100), ["Hangul"]);
  assert.deepEqual(attribute(0xf900), ["Han"]);
  assert.deepEqual(attribute(0xfb50), ["Arabic"]);
});

test("attributes no script to a codepoint belonging to none", () => {
  assert.deepEqual(attribute(0x0020), []);
  assert.deepEqual(attribute(0x003b), []);
  assert.deepEqual(attribute(0x005b), []);
});

test("excludes the upper bound of each range", () => {
  for (const name of names) {
    const codepoints = scripts[name].ranges.map(([, end]) => end);
    assert.equal(detect(codepoints, 0)[name], undefined, name);
  }
});

test("includes both ends of each range", () => {
  for (const name of exclusive) {
    const { ranges } = scripts[name];
    const codepoints = ranges.flatMap(([begin, end]) => [begin, end - 1]);
    assert.equal(detect(codepoints, 0)[name].count, codepoints.length, name);
  }
});

test("counts every codepoint of a script toward its total", () => {
  for (const name of ["Adlam", "Greek", "Hebrew", "Latin", "Thai"]) {
    const codepoints = [];
    for (const [begin, end] of scripts[name].ranges) {
      for (let codepoint = begin; codepoint < end; codepoint++) {
        codepoints.push(codepoint);
      }
    }
    const script = detect(codepoints, 0)[name];
    assert.equal(script.count, script.total, name);
  }
});

test("applies the threshold to the ratio of the counts", () => {
  const { ranges } = scripts.Thai;
  const codepoints = [];
  for (const [begin, end] of ranges) {
    for (let codepoint = begin; codepoint < end; codepoint++) {
      codepoints.push(codepoint);
    }
  }
  assert.ok("Thai" in detect(codepoints, 0.99));
  assert.ok(!("Thai" in detect(codepoints, 1)));
  assert.ok(!("Latin" in detect([0x0041], 0.25)));
});

test("describes every entry with a code and ranges", () => {
  for (const name of names) {
    const { code, ranges } = scripts[name];
    assert.ok(code === null || /^[A-Z][a-z]{3}$/.test(code), name);
    assert.ok(ranges.length > 0, name);
  }
  const codes = exclusive.map((name) => scripts[name].code);
  assert.equal(new Set(codes).size, codes.length);
});

test("orders the ranges of a script without overlaps", () => {
  for (const name of names) {
    let previous = -1;
    for (const [begin, end] of scripts[name].ranges) {
      assert.ok(begin > previous, `${name} at ${begin}`);
      assert.ok(end > begin, `${name} at ${begin}`);
      previous = end;
    }
  }
});

test("covers the Private Use Area", () => {
  const total = scripts.PUA.ranges.reduce((sum, [begin, end]) => sum + end - begin, 0);
  assert.equal(total, 6400 + 65534 + 65534);
});
