import scripts from '../data/scripts.js';

// To make this code as fast as possible we create some
// auxillary data structures.
const names = Object.keys(scripts);
const ranges = Object.values(scripts);
const totals = new Array(names.length).fill(0);
const counts = new Array(names.length);

// Calculate the total number of codepoints for each script. We
// can easily do this by summing the number of codepoints in
// each range and script.
for (let i = 0; i < ranges.length; i++) {
  for (let j = 0; j < ranges[i].length; j++) {
    totals[i] += ranges[i][j][1] - ranges[i][j][0];
  }
}

/**
 * @param {Array.<Number>} codepoints
 * @param {Number} threshold
 **/
function detect(codepoints, threshold) {
  // Reset the counts array
  counts.fill(0);

  for (let j = 0; j < codepoints.length; j++) {
    all:
    for (let i = 0; i < ranges.length; i++) {
      for (let k = 0; k < ranges[i].length; k++) {
        // Exit the outer loop (script) if the codepoint has been found.
        // The ranges don't repeat so we won't find the codepoint again.
        if (codepoints[j] >= ranges[i][k][0] && codepoints[j] <= ranges[i][k][1]) {
          counts[i]++;
          break all; // NOTE: This uses a label to jump out of both loops at once.
        }

        // Also exit the inner loop (ranges) early if the codepoint is smaller,
        // as we won't find the codepoint in subsequent ranges.
        if (ranges[i][k][0] > codepoints[j]) {
          break;
        }
      }
    }
  }

  const result = {};

  for (let i = 0; i < names.length; i++) {
    if (counts[i] / totals[i] > threshold || (names[i] === 'PUA' && counts[i] > 0)) {
      result[names[i]] = {
        count: counts[i],
        total: totals[i]
      };
    }
  }

  return result;
}

export default detect;
