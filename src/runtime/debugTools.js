// TEMPORARY. Delete this file and the one import of it in instance.js to remove.
//
// Installs globalThis.animateTextDebug for poking at line break counting from the
// browser console. It compares the current internal approach (read the renderer's
// wrapped lines) against a tag based one (mark a character with [tag=...] and read
// back its y position) across a corpus of awkward strings.
//
//   animateTextDebug.help()
//   animateTextDebug.runAll()        compare both approaches over the whole corpus
//   animateTextDebug.run(0)          one corpus entry, with a per character table
//   animateTextDebug.run("my text")  same, for your own string
//   animateTextDebug.lines()         the wrapped lines the renderer reports
//   animateTextDebug.bench()         time both approaches

import * as internals from "./engineInternals.js";

const PROBE = "atprobe";
const ROWS = "atrows";

// Rebuilds the shape the typewriter actually produces: every character in its own
// nested tags, which is what stops fragments merging and gives one fragment per
// character instead of one per line.
//   vary false  every character carries identical tag values, as after a fade ends
//   vary true   values differ per character, as mid fade
function perCharTags(plain, { vary = true } = {}) {
  let out = "";
  let i = 0;
  for (const ch of plain) {
    const offsety = vary ? (Math.sin(i * 0.7) * 6).toFixed(3) : "0";
    const opacity = vary ? (50 + 50 * Math.sin(i * 0.3)).toFixed(2) : "100";
    out +=
      `[color=#ffcc00][offsety=${offsety}][opacity=${opacity}]` +
      ch +
      "[/opacity][/offsety][/color]";
    i++;
  }
  return out;
}

const SENTENCE =
  "The quick brown fox jumps over the lazy dog and then keeps going for a while";

// Strings chosen to stress wrapping and the visible-character counting that the
// typewriter's reveal index depends on.
const CORPUS = [
  // The cases that match what the addon really feeds GetCharsEatenByWrap.
  ["typewriter mid fade", perCharTags(SENTENCE)],
  ["typewriter settled", perCharTags(SENTENCE, { vary: false })],
  ["typewriter with newline", perCharTags("first line here\nsecond line here and more text that wraps")],
  ["typewriter with icon", perCharTags("before ") + "[icon=0]" + perCharTags(" after and more words to push this over a line")],
  ["typewriter half tagged", perCharTags("tagged start here ") + "then plain text for the rest of this line and beyond"],
  ["typewriter double spaces", perCharTags("two  spaces  between  every  word  here  to  see  the  wrap")],
  ["typewriter trailing space at wrap", perCharTags("a line that ends with a space right at the wrap point      and then more")],
  ["typewriter one long word", perCharTags("short Supercalifragilisticexpialidociousandthensomemore tail")],
  ["typewriter cjk", perCharTags("これは日本語のテキストです。改行を確認します。これは日本語です。")],
  ["typewriter emoji", perCharTags("emoji 👍🏽 and é combining marks mixed into a longer wrapping line")],

  ["plain wrap", "The quick brown fox jumps over the lazy dog and keeps running for quite a while longer"],
  ["short, no wrap", "no wrapping here"],
  ["single char", "x"],
  ["empty", ""],
  ["one long word", "Supercalifragilisticexpialidociousandthensomemoreletters"],
  ["long word mid text", "before Supercalifragilisticexpialidociousandthensomemore after"],
  ["explicit newlines", "line one\nline two\nline three"],
  ["consecutive newlines", "top\n\n\nbottom"],
  ["newline at end", "trailing newline\n"],
  ["newline at start", "\nleading newline"],
  ["double spaces", "double  spaces  between  every  word  here  to  see  what  wrap  does"],
  ["trailing spaces", "words with trailing space at the wrap point           and more after"],
  ["leading spaces", "     indented start of the line then a lot more text to force a wrap"],
  ["per char tags, no wrap", "[offsety=2]a[/offsety][offsety=4]b[/offsety][offsety=6]c[/offsety] [offsety=2]d[/offsety][offsety=4]e[/offsety]"],
  ["tag spanning wrap", "[color=#ff0000]a long red run of text that should certainly wrap somewhere in the middle[/color]"],
  ["icon in text", "before [icon=0] after and then a lot more words to push this onto another line"],
  ["icon at wrap point", "aaaa bbbb cccc dddd eeee ffff gggg [icon=0] hhhh iiii jjjj kkkk"],
  ["cjk", "これは日本語のテキストです。改行を確認します。".repeat(3)],
  ["mixed tags and newline", "[b]bold[/b] text\n[i]italic[/i] and more words to wrap this line properly"],
  ["only spaces", "          "],
  ["unicode graphemes", "éá combining marks and 👍🏽 emoji with modifiers repeated a few times over"],
];

const registered = new Set();

export function registerForDebug(inst) {
  registered.add(inst);
}

function firstInstance() {
  for (const inst of registered) {
    try {
      if (inst.instance) return inst;
    } catch (e) {
      registered.delete(inst);
    }
  }
  console.warn("[animateTextDebug] no Animate Text instance found");
  return null;
}

// Insert [tag=PROBE]x[/tag] around the nth visible character of a BBCode string.
// Visible means what getTextWithNoTags would keep, so tag markup is skipped.
function markCharacter(text, n) {
  let visible = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close !== -1) {
        i = close + 1;
        continue;
      }
    }
    if (visible === n) {
      return (
        text.slice(0, i) +
        "[tag=" + PROBE + "]" + text[i] + "[/tag]" +
        text.slice(i + 1)
      );
    }
    visible++;
    i++;
  }
  return null;
}

function visibleLength(text) {
  let visible = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close !== -1) {
        i = close + 1;
        continue;
      }
    }
    visible++;
    i++;
  }
  return visible;
}

const ROW_TOLERANCE = 0.5;

function distinctSorted(values) {
  const out = [];
  for (const v of values.slice().sort((a, b) => a - b)) {
    if (!out.length || Math.abs(out[out.length - 1] - v) > ROW_TOLERANCE) out.push(v);
  }
  return out;
}

// Every row the renderer laid the text out on, found by tagging the whole string
// and reading back the y of each fragment it produced. Public API only.
function collectRows(host, text) {
  const previous = host.text;
  host.text = "[tag=" + ROWS + "]" + text + "[/tag]";

  const ys = [];
  const count = host.getTagCount(ROWS);
  for (let i = 0; i < count; i++) {
    const p = host.getTagPositionAndSize(ROWS, i);
    if (p) ys.push(p.y);
  }

  host.text = previous;
  return { rows: distinctSorted(ys), fragments: count };
}

// The y of one character, by marking just that character.
function probeCharY(host, text, n) {
  const marked = markCharacter(text, n);
  if (marked === null) return null;

  const previous = host.text;
  host.text = marked;

  let y = null;
  let fragments = host.getTagCount(PROBE);
  if (fragments) {
    const p = host.getTagPositionAndSize(PROBE, 0);
    if (p) y = p.y;
  }

  host.text = previous;
  return { y, fragments };
}

// characters the wrap ate before n, per the internal read
function internalBreaks(inst, text, n) {
  return inst.GetCharsEatenByWrap(n + 1, text);
}

// Line index of character n, as the tag based approach would compute it.
function tagBreaks(inst, text, n, rows) {
  const probe = probeCharY(inst.instance, text, n);
  if (!probe || probe.y === null) return null;
  const line = rows.findIndex((y) => Math.abs(y - probe.y) < ROW_TOLERANCE);
  return line < 0 ? null : line;
}

function measure(inst, text, opts = {}) {
  const host = inst.instance;
  const previous = host.text;
  host.text = text;

  const lines = internals.getWrappedLineTexts(host);
  const len = visibleLength(text);
  const { rows: rowYs, fragments } = collectRows(host, text);

  const rows = [];
  let mismatches = 0;
  for (let n = 0; n < len; n++) {
    const a = internalBreaks(inst, text, n);
    const b = tagBreaks(inst, text, n, rowYs);
    const agree = a === b;
    if (!agree) mismatches++;
    if (opts.verbose || !agree) rows.push({ n, internal: a, tagBased: b, agree });
  }

  host.text = previous;
  return {
    text,
    visibleChars: len,
    lines,
    rowsFound: rowYs.length,
    tagFragments: fragments,
    mismatches,
    rows,
  };
}

function report(label, result) {
  const tag = result.mismatches ? "MISMATCH" : "ok";
  console.log(
    `%c${tag}%c ${label}  chars=${result.visibleChars} internalLines=${result.lines.length} tagRows=${result.rowsFound} tagFragments=${result.tagFragments} mismatches=${result.mismatches}`,
    result.mismatches ? "color:#c00;font-weight:bold" : "color:#080;font-weight:bold",
    ""
  );
  if (result.lines.length) {
    console.log(
      "   wrapped lines:",
      result.lines.map((l, i) => `${i}:${JSON.stringify(l)}`).join(" ")
    );
  }
  if (result.rows.length) console.table(result.rows);
}

const api = {
  help() {
    console.log(
      [
        "animateTextDebug",
        "  runAll()          compare both line counting approaches over the corpus",
        "  run(i | string)   one corpus entry by index, or your own string",
        "  corpus()          list the corpus",
        "  lines()           wrapped lines the renderer reports for the current text",
        "  bench(i)          time both approaches",
        "  instance()        the Animate Text instance being used",
      ].join("\n")
    );
  },

  corpus() {
    console.table(CORPUS.map(([name, text], i) => ({ i, name, text: text.slice(0, 60) })));
  },

  instance: firstInstance,

  // Put a corpus entry on screen so the wrapping can be eyeballed next to the
  // numbers. Leaves it there, unlike the measuring calls which restore the text.
  show(which = 0) {
    const inst = firstInstance();
    if (!inst) return;
    const entry = CORPUS[which];
    if (!entry) return console.warn("[animateTextDebug] no corpus entry " + which);
    inst.animated = false;
    inst.instance.text = entry[1];
    console.log(`[animateTextDebug] showing ${which}: ${entry[0]}`);
    return entry[1];
  },

  lines() {
    const inst = firstInstance();
    if (!inst) return;
    const lines = internals.getWrappedLineTexts(inst.instance);
    console.log("current text:", JSON.stringify(inst.instance.text).slice(0, 200));
    console.table(lines.map((l, i) => ({ line: i, length: l.length, text: l })));
    return lines;
  },

  run(which, opts) {
    const inst = firstInstance();
    if (!inst) return;
    let label, text;
    if (typeof which === "string") {
      label = "custom";
      text = which;
    } else {
      const entry = CORPUS[which || 0];
      if (!entry) return console.warn("[animateTextDebug] no corpus entry " + which);
      [label, text] = entry;
    }
    const result = measure(inst, text, { verbose: true, ...opts });
    report(label, result);
    return result;
  },

  runAll() {
    const inst = firstInstance();
    if (!inst) return;
    console.log("[animateTextDebug] comparing internal vs tag based over " + CORPUS.length + " strings");
    const summary = [];
    for (const [label, text] of CORPUS) {
      const result = measure(inst, text);
      report(label, result);
      summary.push({
        case: label,
        chars: result.visibleChars,
        internalLines: result.lines.length,
        tagRows: result.rowsFound,
        tagFragments: result.tagFragments,
        mismatches: result.mismatches,
      });
    }
    console.log("summary");
    console.table(summary);
    const bad = summary.filter((s) => s.mismatches);
    console.log(
      bad.length
        ? `${bad.length} of ${summary.length} cases disagree: ` + bad.map((b) => b.case).join(", ")
        : "every case agrees"
    );
    return summary;
  },

  bench(which = 0, iterations = 200) {
    const inst = firstInstance();
    if (!inst) return;
    const [label, text] = CORPUS[which];
    const host = inst.instance;
    const previous = host.text;
    host.text = text;
    const len = visibleLength(text);
    const mid = Math.floor(len / 2);

    let t0 = performance.now();
    for (let i = 0; i < iterations; i++) internalBreaks(inst, text, mid);
    const internalMs = performance.now() - t0;

    const { rows: rowYs } = collectRows(host, text);
    t0 = performance.now();
    for (let i = 0; i < iterations; i++) tagBreaks(inst, text, mid, rowYs);
    const tagMs = performance.now() - t0;

    host.text = previous;
    console.log(
      `[animateTextDebug] "${label}" ${len} chars, ${iterations} iterations\n` +
        `  internal  ${internalMs.toFixed(1)} ms  (${(internalMs / iterations).toFixed(3)} ms each)\n` +
        `  tag based ${tagMs.toFixed(1)} ms  (${(tagMs / iterations).toFixed(3)} ms each)`
    );
    return { internalMs, tagMs };
  },
};

globalThis.animateTextDebug = api;
console.log("[animateTextDebug] installed. animateTextDebug.help()");
