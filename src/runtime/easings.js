// Every easing comes from Construct, either one of its own curves or one made in
// the project's easings editor. This addon defines none of its own.

// Names from 1.x that Construct has no name for. The first six were exact
// duplicates of the curve they now point at. The rest are the nearest match:
// elastic never left 1.0 so it faded nothing, easeTo rose sharper than anything
// Construct has, and bouncePast overshot the end value, which out back is the
// only Construct curve to do.
const LEGACY_NAMES = new Map([
  ["swingfrom", "easeinback"],
  ["swingto", "easeoutback"],
  ["swingfromto", "easeinoutback"],
  ["bounce", "easeoutbounce"],
  ["easefrom", "easeinquart"],
  ["easefromto", "easeinoutquart"],
  ["elastic", "easeoutelastic"],
  ["bouncepast", "easeoutback"],
  ["easeto", "easeoutcirc"],
]);

// Custom eases are registered while the project loads and never change after, so
// the index is built once. Keyed by lowercase name because v1 matched that way
// and the registry is keyed by exact case.
let customEaseNames = null;

export function getCustomEase(name) {
  if (!customEaseNames) {
    customEaseNames = new Map(
      globalThis.Ease.GetCustomRuntimeEaseNames().map((easeName) => [
        easeName.toLowerCase(),
        easeName,
      ])
    );
  }

  const match = customEaseNames.get(name.toLowerCase());
  return match ? globalThis.Ease.GetRuntimeEase(match) : null;
}

// A curve the user made wins over Construct's. Lowercasing the name is what
// makes the camelCase spellings from 1.x resolve. Null if nothing matches.
export function resolveEase(name) {
  const lower = name.toLowerCase();
  return (
    getCustomEase(name) ||
    globalThis.Ease.GetRuntimeEase(LEGACY_NAMES.get(lower) || lower) ||
    null
  );
}

export function getEasingFunction(name) {
  const ease = resolveEase(name) || globalThis.Ease.GetRuntimeEase("noease");
  return (pos) => ease(pos, 0, 1, 1);
}
