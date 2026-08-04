# Text rendering gaps in the SDK, and Experimental Text Fix (checked against r494)

## What Animate Text needs internals for: nothing

It used to need two things, both on the text renderer, both wrapped in
`src/runtime/engineInternals.js`. The `[hide]` BBCode tag replaces both, so that
file and the `debugTools.js` harness built around it are gone, and the addon is
now pure public SDK v2. The history is kept here because the reasoning is what
justifies not going back.

**Reveal a given number of characters.** The typewriter shows the first N
characters of a string it rebuilds every tick, because the animation tags around
each character change every frame. `SetDrawMaxCharacterCount` clipped the draw
without touching the layout, so the text did not reflow while it typed.

`[hide]` does the same thing from the public side: hidden text is laid out and
advances the pen, it is simply not painted. Verified on r494 for both Text and
Sprite Font, including that a partly hidden word does not rewrap, that a fully
hidden word does not shift the words after it, and that icons, backgrounds,
outlines and underlines are all suppressed along with the glyphs.

The other public alternative, `ITextInstance.typewriterText(str, duration)`, is
still no use: the engine drives it itself, interpolating a character count from a
start time to an end time, and it cancels the moment the text is set again. That is
one linear reveal of a fixed string. This addon needs per-character timing instead,
a `[tw=wait]` before a character, a `[tw=pause]` that holds until an action resumes
it, a per-character fade whose length and easing come from the typewriter
parameters, and a `[tw=fn]` that calls into the event sheet partway through. None of
that fits in a single duration, and rebuilding the string each tick would cancel it
anyway.

**Read where word wrap broke the text.** This one does not need replacing, it
stops existing. `SetDrawMaxCharacterCount` counted what the renderer *draws*, and
word wrap consumes the space it breaks on, so the count drifted from the character
index the addon tracks by one per wrapped line and a wrapped paragraph revealed
ahead of or behind the intended character. `GetCharsEatenByWrap` corrected for that
by reading the renderer's wrapped lines.

`[hide]` is placed in the source string, which is the index space the addon already
works in, so there is no conversion to correct. Where the lines break stops
mattering.

Recorded because it cost a day to establish: the public `getTagPositionAndSize()`
is *not* a way to recover the wrapped lines. Insert your own `[tag=]` marker, read
back the y of the character you marked, group characters by y. That was measured
against the internal read, character by character, over 31 strings. It fails for two
reasons that cannot be tuned away.

*The y it returns is the rendered position, not the line.* Same sentence, same
wrapping, the only difference being whether the per-character `offsety` tags are
animating:

```
typewriter settled    chars=76  internalLines=3  tagRows=3
typewriter mid fade   chars=76  internalLines=3  tagRows=25
```

Vertical offsetting is what this addon exists to do, so the signal the approach
depends on is the one it destroys.

*Blank lines and wrap-point spaces produce no fragment.* There is nothing to tag,
so they cannot be probed. With `"top\n\n\nbottom"` the renderer reports four lines
and tagging finds two, and every probe of a space that word wrap trimmed comes back
empty.

So if `[hide]` ever stops reserving layout space, the fallback is
`SetDrawMaxCharacterCount` plus `_wrappedText` again, not tag probing.

`UpdateRender` was the third internal, until `runtime.sdk.updateRender()` replaced
it. Nothing calls that now either: setting `.text` marks its own redraw, and the
only reason the addon called it was that the internal character-count setter did
not.

Feature request [#833](https://github.com/Scirra/Construct-feature-requests/issues/833)
asked for a `drawMaxCharacterCount` accessor and a wrapped-lines getter. Neither is
needed any more.

## Does Experimental Text Fix still help?

The rest of this file is about `skymen/experimental-text-fix`, which monkey patches the Construct text renderer. It was
written against an engine from roughly two to three years ago. This is a review of
its three patches against r494, to decide which are still worth having.

All three live in `src/plugin.js` of that repo. `instance.js` and `domSide.js` are
empty scaffold, and the addon has no ACEs at all: loading it applies the patches
and nothing else.

Short version:

| Patch | Still needed? | Still works? |
|---|---|---|
| Angle tag | Yes | Yes, applies cleanly |
| Kerning between fragments | Yes | **No, it would crash** |
| Grapheme splitter cache | No | Would make things slightly worse |

## 1. Angle tag — keep it

Adds an `[angle=...]` BBCode tag by overriding `RendererText._DrawFragment` and
rotating the canvas around the fragment's pen position.

Still needed. Neither `lib/gfx/text.js` nor `plugins/general/spritefont/spriteFontText.js`
has an `angle` style tag in r494. The tags the Text object understands are `b`, `i`,
`u`, `s`, `background`, `color`, `font`, `hide`, `iconoffsety`, `linethickness`,
`offsetx`, `offsety`, `opacity`, `outline`, `outlineback`, `size`, `stroke` and `tag`.
No angle.

Still works. `_DrawFragment` still takes three parameters, and the patch's copied
body still matches r494's implementation: same `EXTRA_LINE_HEIGHT` of 4, same
draw-max-character-count slicing, same background, outline, underline and
strikethrough maths, same icon draw. Nothing has been added to `_DrawFragment` in
the meantime that the copy would silently revert. `iconoffsety` is applied in
`_LayoutFragment`, not `_DrawFragment`, so it is untouched.

Worth knowing: Animate Text's own C2 converter maps C2's `<A ...>` to `[angle=...]`
(`src/runtime/c2Convert.js`, `tagEquivalents`). So this patch is what makes angles
in converted C2 text render at all. Without it that output is silently ignored.

## 2. Kerning between fragments — real problem, broken patch

BBCode splits a string into fragments, and each fragment is measured on its own, so
the kerning pair that would form across a fragment boundary is lost. The patch
measures those pairs, caches the offsets by font and character pair, and applies
them in both measurement and layout.

The problem is still real in r494. `WordWrap._MeasureLine` just sums `GetWidth()`
per fragment, `RendererText._LayoutTextLine` advances the pen by fragment width
alone, and the string "kern" does not appear anywhere in `wordWrap.js`, `text.js`
or `line.js`.

But the patch can no longer run, because the wrap algorithm was rewritten
underneath it:

- `_AddWordToLine`, which the patch calls, **no longer exists anywhere in the engine**.
  That alone is a TypeError on the first wrap.
- `_AddLine` went from six arguments to one, and now takes a `CurrentLineState`
  rather than a line array plus five measurements.
- `_WrapText` went from four parameters to five, and became a chunked state machine
  (`_WrapText_Chunk`, `_WrapText_RetryChunk`, `_lastFitLineState`, `_tryLineState`).

The patch overrides `_WrapText` wholesale, so even if it did not throw it would
replace the current wrapping with a years-old algorithm, losing whatever the
chunk and retry logic was added to fix.

Reviving it means a rewrite against the new design. The cheap version would hook
only `_MeasureLine` and `_LayoutTextLine` and leave `_WrapText` alone, since those
two are where the width is summed and the pen is advanced, and both still have
their original signatures. That is a much smaller surface than the current patch
and would not fight the new chunked wrapper.

## 3. Grapheme splitter cache — drop it

The patch replaces `C3.SplitGraphemes` with a version that memoises results in a
`Map`. Its own comment says "I don't remember why I cached the result and if it
actually helps".

It should go. r494's implementation is now:

```js
const intlSegmenter = new self["Intl"]["Segmenter"];
C3.SplitGraphemes = function (t) {
  if (1 === t.length) return [t];
  ...
};
```

Two things changed. There is now a single character fast path, which the patch
would remove and replace with a map lookup. And `Intl.Segmenter` is used
unconditionally, so the patch's `GraphemeSplitter` fallback is dead code against a
global that may no longer exist.

The cache is also unbounded. Every distinct string ever split is retained for the
life of the page. Animate Text rebuilds its host string every frame, so that is
exactly the workload that would grow the map without limit.

## Method

Checked against the r494-2 source: `lib/gfx/text.js`, `lib/str/textLayout/wordWrap.js`,
`lib/str/textLayout/line.js`, `lib/str/textLayout/fragmentBase.js`,
`lib/str/str.js` and `plugins/general/spritefont/spriteFontText.js`. Signatures were
compared by extracting each method's parameter list from the minified source and
diffing it against what the patch overrides.
