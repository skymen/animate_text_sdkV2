const C2_TAG_REGEX =
  /<([XYAO]) (-?\w+ ?-?\d* ?-?\d* ?-?\d*)>|<(C) (#?\w*)>|<(C) (\w+\(-?\d+\.?\d*%?, ?-?\d+\.?\d*%?, ?-?\d+\.?\d*%?,? ?-?\d*\.?\d*%?\))>/g;

const COLOUR_NAMES = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgrey: "#d3d3d3",
  lightgreen: "#90ee90",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370d8",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#d87093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
};

function getParsed(text) {
  return text.replace(new RegExp(C2_TAG_REGEX.source, "g"), "");
}

function parse(text) {
  var regex = new RegExp(C2_TAG_REGEX.source, "g");
  var str = text;
  var m;
  var offset = 0;
  var data = [];
  while ((m = regex.exec(str)) !== null) {
    var tempA = [];
    tempA.push(m.index + offset);
    var length = regex.lastIndex - m.index;
    offset -= length;

    m.forEach(function (match, groupIndex) {
      if (groupIndex != 0) {
        tempA.push(match);
      }
    });
    data.push(tempA);
  }

  var parsedText = getParsed(text);
  var curX = "None";
  var curY = "None";
  var curA = "None";
  var curO = "None";
  var curC = "None";
  var data2 = [];

  for (var i = 0; i < data.length; i++) {
    var cur = data[i];
    while (data2.length < cur[0]) {
      data2.push([curX, curY, curA, curO, curC]);
    }
    switch (cur[1]) {
      case "X":
        curX = cur[2];
        break;
      case "Y":
        curY = cur[2];
        break;
      case "A":
        curA = cur[2];
        break;
      case "O":
        curO = cur[2];
        break;
      default:
        if (cur[3] === "C") {
          curC = cur[4];
        } else if (cur[5] === "C") {
          curC = cur[6];
        }
    }
    data2[cur[0]] = [curX, curY, curA, curO, curC];
  }
  while (data2.length < parsedText.length) {
    data2.push([curX, curY, curA, curO, curC]);
  }
  var counter = 0;
  for (var i = 0; i < parsedText.length; i++) {
    var letter = parsedText[i];
    if (letter == "\n") {
      data2.splice(counter, 1);
      counter--;
    }
    counter++;
  }

  return data2;
}

function colourNameToHex(color) {
  if (Object.prototype.hasOwnProperty.call(COLOUR_NAMES, color.toLowerCase()))
    return COLOUR_NAMES[color.toLowerCase()];
  return color;
}

function arrEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((el, i) => el === arr2[i]);
}

function parseState(state, tag) {
  let stateA = state.split(" ");
  let stateValue = stateA.shift();
  if (stateA[0] === undefined) stateA.push(4);
  if (stateA[1] === undefined) stateA.push(300);
  if (stateA[2] === undefined) stateA.push(90);
  switch (stateValue.toLowerCase()) {
    case "wave":
    case "angle":
      return "wave(" + stateA.join(",") + ")";
    case "swing":
    case "angle2":
      return "swing(" + stateA.join(",") + ")";
    case "shake":
      return "shake(" + stateA[0] + ")";
  }
  if (tag.toLowerCase() === "color") {
    let colorAsName = colourNameToHex(state);
    return "colorToHex('" + colorAsName + "')";
  }
  return state;
}

export default function c2StrToC3Str(text) {
  let data = parse(text);
  let parsedText = getParsed(text);
  let tagEquivalents = ["offsetx", "offsety", "angle", "opacity", "color"];
  let str = "";
  let currentState = ["None", "None", "None", "None", "None"];
  data.forEach((curData, i) => {
    if (!arrEqual(curData, currentState)) {
      currentState.forEach((state) => {
        if (state.toLowerCase() !== "none") str += "[/sfdx]";
      });
      curData.forEach((state, i) => {
        if (state.toLowerCase() !== "none")
          str +=
            "[sfdx=" +
            tagEquivalents[i] +
            " " +
            parseState(state, tagEquivalents[i]) +
            "]";
      });
      currentState = curData;
    }
    str += parsedText[i];
  });
  currentState.forEach((state) => {
    if (state.toLowerCase() !== "none") str += "[/sfdx]";
  });
  return str;
}
