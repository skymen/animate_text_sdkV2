// Shared between the "tw-easing" property and the "set-tw-easing" action.
//
// These are Construct's own ease names, so the curves match what the timeline
// and tween behaviors produce. Only the last two are this addon's, because
// Construct has nothing close to them.
//
// Changing this list remaps existing projects: Construct stores a combo value as
// an index, not a name. It was replaced once, in 2.0.0.0. Append only from here.
const EASINGS = [
  ["linear", "Linear"],

  ["easeinquad", "Ease in quad"],
  ["easeoutquad", "Ease out quad"],
  ["easeinoutquad", "Ease in out quad"],

  ["easeincubic", "Ease in cubic"],
  ["easeoutcubic", "Ease out cubic"],
  ["easeinoutcubic", "Ease in out cubic"],

  ["easeinquart", "Ease in quart"],
  ["easeoutquart", "Ease out quart"],
  ["easeinoutquart", "Ease in out quart"],

  ["easeinquint", "Ease in quint"],
  ["easeoutquint", "Ease out quint"],
  ["easeinoutquint", "Ease in out quint"],

  ["easeinsine", "Ease in sine"],
  ["easeoutsine", "Ease out sine"],
  ["easeinoutsine", "Ease in out sine"],

  ["easeinexpo", "Ease in expo"],
  ["easeoutexpo", "Ease out expo"],
  ["easeinoutexpo", "Ease in out expo"],

  ["easeincirc", "Ease in circ"],
  ["easeoutcirc", "Ease out circ"],
  ["easeinoutcirc", "Ease in out circ"],

  ["easeinelastic", "Ease in elastic"],
  ["easeoutelastic", "Ease out elastic"],
  ["easeinoutelastic", "Ease in out elastic"],

  ["easeinback", "Ease in back"],
  ["easeoutback", "Ease out back"],
  ["easeinoutback", "Ease in out back"],

  ["easeinbounce", "Ease in bounce"],
  ["easeoutbounce", "Ease out bounce"],
  ["easeinoutbounce", "Ease in out bounce"],

  ["bouncePast", "Bounce past (Animate Text)"],
  ["easeTo", "Ease to (Animate Text)"],
];

export const easingNames = EASINGS.map(([name]) => name);

export const easingItems = EASINGS.map(([name, label]) => ({ [name]: label }));
