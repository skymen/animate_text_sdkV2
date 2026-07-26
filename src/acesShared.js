// Shared between the "tw-easing" property and the "set-tw-easing" action.
//
// Every curve is Construct's, so they match the timeline and the tween behavior.
// The keys keep the 1.x spelling, because a project stores the key of the item
// you picked and Construct matches it with case: renaming easeInQuad to
// easeinquad would leave every project pointing at an item that no longer exists,
// with no warning until preview.
//
// Append only. Never rename or remove.
const EASINGS = [
  ["linear", "Linear"],

  ["easeInQuad", "Ease in quad"],
  ["easeOutQuad", "Ease out quad"],
  ["easeInOutQuad", "Ease in out quad"],

  ["easeInCubic", "Ease in cubic"],
  ["easeOutCubic", "Ease out cubic"],
  ["easeInOutCubic", "Ease in out cubic"],

  ["easeInQuart", "Ease in quart"],
  ["easeOutQuart", "Ease out quart"],
  ["easeInOutQuart", "Ease in out quart"],

  ["easeInQuint", "Ease in quint"],
  ["easeOutQuint", "Ease out quint"],
  ["easeInOutQuint", "Ease in out quint"],

  ["easeInSine", "Ease in sine"],
  ["easeOutSine", "Ease out sine"],
  ["easeInOutSine", "Ease in out sine"],

  ["easeInExpo", "Ease in expo"],
  ["easeOutExpo", "Ease out expo"],
  ["easeInOutExpo", "Ease in out expo"],

  ["easeInCirc", "Ease in circ"],
  ["easeOutCirc", "Ease out circ"],
  ["easeInOutCirc", "Ease in out circ"],

  ["easeInElastic", "Ease in elastic"],
  ["easeOutElastic", "Ease out elastic"],
  ["easeInOutElastic", "Ease in out elastic"],

  ["easeInBack", "Ease in back"],
  ["easeOutBack", "Ease out back"],
  ["easeInOutBack", "Ease in out back"],

  ["easeInBounce", "Ease in bounce"],
  ["easeOutBounce", "Ease out bounce"],
  ["easeInOutBounce", "Ease in out bounce"],

  // Kept only so projects that picked them still load. Each is either a second
  // name for a curve already listed above, or the nearest match to one that no
  // longer exists.
  ["swingFrom", "Ease in back (old name: swingFrom)"],
  ["swingTo", "Ease out back (old name: swingTo)"],
  ["swingFromTo", "Ease in out back (old name: swingFromTo)"],
  ["bounce", "Ease out bounce (old name: bounce)"],
  ["easeFrom", "Ease in quart (old name: easeFrom)"],
  ["easeFromTo", "Ease in out quart (old name: easeFromTo)"],
  ["elastic", "Ease out elastic (old name: elastic)"],
  ["bouncePast", "Ease out back (old name: bouncePast)"],
  ["easeTo", "Ease out circ (old name: easeTo)"],
];

export const easingNames = EASINGS.map(([name]) => name);

export const easingItems = EASINGS.map(([name, label]) => ({ [name]: label }));
