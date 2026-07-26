// Everything Construct already provides is resolved through its ease registry,
// so the curves match the timeline and the tween behavior. Only these two have no
// Construct equivalent and are kept as formulas.
const LOCAL_EASINGS = {
  linear: function (pos) {
    return pos;
  },

  // Bounces past the end value, up to about 1.23, before settling.
  bouncePast: function (pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 2 - (7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75);
    } else if (pos < 2.5 / 2.75) {
      return 2 - (7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375);
    } else {
      return 2 - (7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375);
    }
  },

  // Sharper than any of Construct's out curves.
  easeTo: function (pos) {
    return Math.pow(pos, 0.25);
  },
};

const localByLowerName = new Map(
  Object.entries(LOCAL_EASINGS).map(([name, fn]) => [name.toLowerCase(), fn])
);

// Names this addon used before 2.0.0.0, pointed at the Construct curve they were
// identical to. elastic is the exception: v1's never left 1, so it did nothing.
const LEGACY_NAMES = new Map([
  ["swingfrom", "easeinback"],
  ["swingto", "easeoutback"],
  ["swingfromto", "easeinoutback"],
  ["bounce", "easeoutbounce"],
  ["easefrom", "easeinquart"],
  ["easefromto", "easeinoutquart"],
  ["elastic", "easeoutelastic"],
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

// A curve the user made wins, then this addon's own, then Construct's. Names are
// matched without case, so the camelCase spellings from 1.x still resolve.
export function getEasingFunction(name) {
  const custom = getCustomEase(name);
  if (custom) return (pos) => custom(pos, 0, 1, 1);

  const lower = name.toLowerCase();

  const local = localByLowerName.get(lower);
  if (local) return local;

  const builtIn = globalThis.Ease.GetRuntimeEase(
    LEGACY_NAMES.get(lower) || lower
  );
  if (builtIn) return (pos) => builtIn(pos, 0, 1, 1);

  return LOCAL_EASINGS.linear;
}

// Exposed to alias bodies as EasingFunctions. Resolved on access so every
// Construct ease is reachable by name, not just the few defined above.
export const EasingFunctions = new Proxy(LOCAL_EASINGS, {
  get(target, prop) {
    if (prop in target || typeof prop !== "string") return target[prop];
    return getEasingFunction(prop);
  },
});
