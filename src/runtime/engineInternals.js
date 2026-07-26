// The only module allowed to touch Construct internals. Each function stands in
// for a public SDK v2 API that does not exist yet, so when one lands only that
// body changes. Missing as of r494:
//   1. drawMaxCharacterCount on ITextInstance / ISpriteFontInstance. The public
//      typewriterText() is a linear reveal over a fixed duration, so it cannot
//      express per-character pauses, fades or easing.
//   2. Read access to the wrapped lines, to find where word wrap broke the text.

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

export function updateRender() {
  if (!internalRuntime) return;
  internalRuntime.UpdateRender();
}
