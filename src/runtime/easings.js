export const EasingFunctions = {
  linear: function (t) {
    return t;
  },
  easeInQuad: function (t) {
    return t * t;
  },
  easeOutQuad: function (t) {
    return t * (2 - t);
  },
  easeInOutQuad: function (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInCubic: function (t) {
    return t * t * t;
  },
  easeOutCubic: function (t) {
    return --t * t * t + 1;
  },
  easeInOutCubic: function (t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeInQuart: function (t) {
    return t * t * t * t;
  },
  easeOutQuart: function (t) {
    return 1 - --t * t * t * t;
  },
  easeInOutQuart: function (t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  easeInQuint: function (t) {
    return t * t * t * t * t;
  },
  easeOutQuint: function (t) {
    return 1 + --t * t * t * t * t;
  },
  easeInOutQuint: function (t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },

  easeInSine: function (pos) {
    return -Math.cos(pos * (Math.PI / 2)) + 1;
  },

  easeOutSine: function (pos) {
    return Math.sin(pos * (Math.PI / 2));
  },

  easeInOutSine: function (pos) {
    return -0.5 * (Math.cos(Math.PI * pos) - 1);
  },

  easeInExpo: function (pos) {
    return pos === 0 ? 0 : Math.pow(2, 10 * (pos - 1));
  },

  easeOutExpo: function (pos) {
    return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
  },

  easeInOutExpo: function (pos) {
    if (pos === 0) return 0;
    if (pos === 1) return 1;
    if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  },

  easeInCirc: function (pos) {
    return -(Math.sqrt(1 - pos * pos) - 1);
  },

  easeOutCirc: function (pos) {
    return Math.sqrt(1 - Math.pow(pos - 1, 2));
  },

  easeInOutCirc: function (pos) {
    if ((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
    return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
  },

  easeOutBounce: function (pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  },

  easeInBack: function (pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },

  easeOutBack: function (pos) {
    var s = 1.70158;
    return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
  },

  easeInOutBack: function (pos) {
    var s = 1.70158;
    if ((pos /= 0.5) < 1)
      return 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s));
    return 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },

  elastic: function (pos) {
    return (
      -1 * Math.pow(4, -8 * pos) * Math.sin(((pos * 6 - 1) * (2 * Math.PI)) / 2) +
      1
    );
  },

  swingFromTo: function (pos) {
    var s = 1.70158;
    return (pos /= 0.5) < 1
      ? 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s))
      : 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },

  swingFrom: function (pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },

  swingTo: function (pos) {
    var s = 1.70158;
    return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
  },

  bounce: function (pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  },

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

  easeFromTo: function (pos) {
    if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
    return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
  },

  easeFrom: function (pos) {
    return Math.pow(pos, 4);
  },

  easeTo: function (pos) {
    return Math.pow(pos, 0.25);
  },
};

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

// A curve the user made wins over this addon's table, and anything neither knows
// falls through to Construct's own eases, which are named in lowercase.
export function getEasingFunction(name) {
  const custom = getCustomEase(name);
  if (custom) return (pos) => custom(pos, 0, 1, 1.01);

  if (EasingFunctions[name]) return EasingFunctions[name];

  const builtIn = globalThis.Ease.GetRuntimeEase(name);
  if (builtIn) return (pos) => builtIn(pos, 0, 1, 1.01);

  return EasingFunctions.linear;
}
