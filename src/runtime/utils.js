import { resolveEase } from "./easings.js";

function cos(x) {
  return Math.cos((x * Math.PI) / 180);
}

function sin(x) {
  return Math.sin((x * Math.PI) / 180);
}

function random(x) {
  return Math.random() * x;
}

function c3easing(time, name, magnitude = 1, duration = 1, pingpong = false) {
  time = ((time % (duration * 2)) + duration * 2) % (duration * 2);
  const ease = resolveEase(name);
  if (!ease) return 0;
  const progress =
    pingpong && time % (duration * 2) > duration
      ? duration - (time % duration)
      : time % duration;
  return ease(progress, 0, magnitude, duration);
}

export function hslToRgb(hue, saturation, lightness) {
  // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
  if (hue == undefined) {
    return [0, 0, 0];
  }

  var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  var huePrime = hue / 60;
  var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  huePrime = Math.floor(huePrime);
  var red;
  var green;
  var blue;

  if (huePrime === 0) {
    red = chroma;
    green = secondComponent;
    blue = 0;
  } else if (huePrime === 1) {
    red = secondComponent;
    green = chroma;
    blue = 0;
  } else if (huePrime === 2) {
    red = 0;
    green = chroma;
    blue = secondComponent;
  } else if (huePrime === 3) {
    red = 0;
    green = secondComponent;
    blue = chroma;
  } else if (huePrime === 4) {
    red = secondComponent;
    green = 0;
    blue = chroma;
  } else if (huePrime === 5) {
    red = chroma;
    green = 0;
    blue = secondComponent;
  }

  var lightnessAdjustment = lightness - chroma / 2;
  red += lightnessAdjustment;
  green += lightnessAdjustment;
  blue += lightnessAdjustment;

  return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}

// Browsers stopped accepting unitless values in the comma form of hsl(), so the
// same colour turns up as hsl(0,100%,50%), hsl(0 100% 50%) or, in older content,
// hsl(0,100,50). All three have to work.
function splitColorComponents(color) {
  return color
    .slice(color.indexOf("(") + 1, color.lastIndexOf(")"))
    .replace(/\//g, " ")
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parsePercentComponent(value) {
  return parseFloat(value) / 100;
}

function parseChannelComponent(value) {
  if (String(value).endsWith("%")) return Math.round((parseFloat(value) * 255) / 100);
  return parseInt(value, 10);
}

export function rgb255ToHex(rgb) {
  return (
    "#" +
    rgb
      .map((c) => {
        const n = Math.max(0, Math.min(255, Math.round(c)));
        return n.toString(16).padStart(2, "0");
      })
      .join("")
  );
}

export function colorToHex(color) {
  if (typeof color !== "string") return color;
  color = color.trim();
  if (color.startsWith("#")) {
    return color;
  }
  const lower = color.toLowerCase();
  if (lower.startsWith("hsl")) {
    const [h, s, l] = splitColorComponents(color);
    return rgb255ToHex(
      hslToRgb(parseFloat(h), parsePercentComponent(s), parsePercentComponent(l))
    );
  }
  if (lower.startsWith("rgb")) {
    const [r, g, b] = splitColorComponents(color);
    return rgb255ToHex([
      parseChannelComponent(r),
      parseChannelComponent(g),
      parseChannelComponent(b),
    ]);
  }
  return color;
}

export function lerpHexColor(a, b, amount) {
  var ah = parseInt(a.replace(/#/g, ""), 16),
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ""), 16),
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);

  return (
    "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
  );
}

export function lerpColor(a, b, x) {
  return lerpHexColor(colorToHex(a), colorToHex(b), x);
}

export function lerpUnlerp(minOutput, maxOutput, minInput, maxInput, x, clamp = false) {
  if (clamp) {
    if (x > maxInput) x = maxInput;
    if (x < minInput) x = minInput;
  }
  return (
    minOutput +
    ((x - minInput) / (maxInput - minInput)) * (maxOutput - minOutput)
  );
}

export function unlerp(min, max, x, clamp = false) {
  if (clamp) {
    if (x > max) x = max;
    if (x < min) x = min;
  }
  if (min === max && x >= max) return 1;
  return (x - min) / (max - min);
}

export function lerp(min, max, x) {
  let a = typeof min;
  let b = typeof max;
  if (a === b) {
    if (a === "number") {
      return x * (max - min) + min;
    } else {
      return lerpColor(min, max, x);
    }
  } else {
    if (a === "number") {
      max = parseFloat(max);
    } else {
      min = parseFloat(min);
    }
    return x * (max - min) + min;
  }
}

function array(...args) {
  return args;
}

// Same global name as v1: alias bodies are compiled with these names in scope.
export const SFDXUtilsFunctions = (globalThis.SFDXUtilsFunctions =
  globalThis.SFDXUtilsFunctions || {
    cos,
    sin,
    random,
    hslToRgb,
    hsltorgb: hslToRgb,
    colorToHex,
    colortohex: colorToHex,
    lerpColor,
    lerpcolor: lerpColor,
    lerpHexColor,
    lerphexcolor: lerpHexColor,
    lerpUnlerp,
    lerpunlerp: lerpUnlerp,
    unlerp,
    lerp,
    c3easing,
    array,
  });
