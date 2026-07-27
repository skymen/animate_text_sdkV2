// The only module allowed to touch Construct internals. Each function stands in
// for a public SDK v2 API that does not exist yet, so when one lands only that
// body changes and the rest of the addon is untouched. Two things are missing as
// of r494, both on the text renderer.
//
// 1. Reveal a given number of characters.
//    The typewriter has to show the first N characters of a string that is being
//    rebuilt every tick, because the animation tags around each character change
//    every frame. SetDrawMaxCharacterCount does exactly that: it clips the draw
//    without touching the layout, so the text does not reflow as it types.
//    The public alternative is ITextInstance.typewriterText(str, duration), which
//    the engine drives itself by interpolating a character count from a start time
//    to an end time. That is a linear reveal of a fixed string over a fixed
//    duration, and it cancels as soon as the text is set again. This addon needs
//    per-character timing instead: a [tw=wait] before a character, a [tw=pause]
//    that stops until an action resumes it, a per-character fade whose length and
//    easing come from the typewriter parameters, and a [tw=fn] that calls into the
//    event sheet mid-string. None of that can be expressed as one duration, and
//    setting the text each tick would cancel it anyway.
//    Public equivalent would be: a drawMaxCharacterCount accessor.
//
// 2. Read where word wrap broke the text.
//    The character count above counts what the renderer draws, and word wrap
//    consumes the space it breaks on, so the count drifts from the character index
//    the addon is tracking by one per wrapped line. Without correcting for that,
//    a wrapped paragraph reveals ahead of or behind the intended character. The
//    only way to correct it is to ask the renderer where the lines actually broke,
//    which means reading its wrapped text.
//    The public surface exposes text size and per-tag positions, but nothing that
//    says where a line ends. getTagPositionAndSize() comes closest, and it only
//    covers fragments that carry a [tag=] marker, so it cannot see the breaks.
//    Public equivalent would be: a way to read the wrapped lines, even just their
//    lengths.
//
// Everything else this addon needs is public. UpdateRender was in here until
// runtime.sdk.updateRender() covered it.

const HOST_PLUGIN_IDS = ["Text", "Spritefont2"];

let internalRuntime = null;

// HACK: a behavior's host arrives as ITextInstance / ISpriteFontInstance, and
// neither can reach the text renderer. Subclass-patch the two host plugins so the
// first instance constructed leaks the internal runtime, which maps any public
// interface back to its internal instance. Must run before any instance exists.
// The C3 check is because the build imports this module in Node.
if (globalThis.C3 && globalThis.C3.Plugins) {
  let patchedAny = false;
  for (const pluginId of HOST_PLUGIN_IDS) {
    const plugin = globalThis.C3.Plugins[pluginId];
    if (!plugin || !plugin.Instance) continue;
    const BaseInstance = plugin.Instance;
    plugin.Instance = class extends BaseInstance {
      constructor(...args) {
        super(...args);
        if (!internalRuntime) internalRuntime = this._runtime;
      }
    };
    patchedAny = true;
  }
  if (!patchedAny) {
    console.warn(
      "[Animate Text] Neither the Text nor the Sprite Font plugin is in this " +
        "project. The behavior only works on those two objects."
    );
  }
}

function getHostSdkInstance(iInst) {
  if (!internalRuntime) return null;
  const internalInst = internalRuntime._UnwrapScriptInterface(iInst);
  return internalInst ? internalInst.GetSdkInstance() : null;
}

// Text uses _rendererText, Sprite Font uses _spriteFontText. Both expose the
// same SetDrawMaxCharacterCount / GetDrawMaxCharacterCount / _wrappedText API.
function getRendererText(iInst) {
  const sdkInst = getHostSdkInstance(iInst);
  if (!sdkInst) return null;
  return sdkInst._rendererText || sdkInst._spriteFontText || null;
}

export function isReady(iInst) {
  return !!getRendererText(iInst);
}

export function setDrawMaxCharacterCount(iInst, count) {
  const renderer = getRendererText(iInst);
  if (!renderer) return;
  renderer.SetDrawMaxCharacterCount(count);
}

export function getDrawMaxCharacterCount(iInst) {
  const renderer = getRendererText(iInst);
  if (!renderer) return -1;
  return renderer.GetDrawMaxCharacterCount();
}

export function getWrappedLineTexts(iInst) {
  const renderer = getRendererText(iInst);
  if (!renderer) return [];

  // The Text plugin stores the string on itself and only hands it to the
  // renderer inside _UpdateTextSize, so reading the lines straight after setting
  // .text would describe the previous string. Reading textWidth runs that update
  // through public API. Sprite Font pushes on set, so this costs it nothing.
  void iInst.textWidth;

  const previousCount = renderer.GetDrawMaxCharacterCount();
  renderer.SetDrawMaxCharacterCount(-1);
  renderer._UpdateTextMeasurements();

  const lines = [];
  for (const line of renderer._wrappedText.GetLines()) {
    let text = "";
    for (const fragment of line.fragments()) {
      // Icon fragments carry no characters, matching what v1 counted.
      if (fragment.IsText()) text += fragment.GetCharacterArray().join("");
    }
    lines.push(text);
  }

  renderer.SetDrawMaxCharacterCount(previousCount);
  return lines;
}

