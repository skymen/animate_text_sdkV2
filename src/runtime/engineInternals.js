// The only module in this addon allowed to touch Construct internals.
// Every function here stands in for a public SDK v2 API that does not exist yet.
// When one lands, replace that function body and nothing else in the addon changes.
//
// Missing public APIs, as of r494:
//   1. ITextInstance / ISpriteFontInstance drawMaxCharacterCount (get + set).
//      This is how the typewriter advances characters without re-laying out the
//      text. ITextInstance.typewriterText() only does a linear reveal over a
//      fixed duration, so it cannot express per-character pauses, fades or easing.
//   2. Read access to the wrapped lines, to find where word wrap broke the text.

const HOST_PLUGIN_IDS = ["Text", "Spritefont2"];

let internalRuntime = null;

// HACK: SDK v2 gives a behavior its host as ITextInstance / ISpriteFontInstance,
// and neither can reach the text renderer. Subclass-patch the two host plugins so
// the first instance constructed leaks the internal runtime, which can then map
// any public interface back to its internal instance.
// Runs at module load, before any instance exists.
// The build imports this module in Node to analyse the class, where there is no
// C3 namespace. Only patch when running inside the engine.
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

// Returns the text of each line after word wrap, so the caller can work out how
// many wrap breaks fall before a given character index.
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
