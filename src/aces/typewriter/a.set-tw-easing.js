import { easingNames, easingItems } from "../../acesShared.js";

export const config = {
  id: "set-tw-easing",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Typewriter Easing",
  displayText: "{my}: Set typewriter easing to [b]{0}[/b]",
  description: "Set the typewriter easing",
  params: [
    {
      id: "easing",
      name: "Easing",
      desc: "The easing to use",
      type: "combo",
      initialValue: "linear",
      items: easingItems,
    },
  ],
};

// Not exposed: the parameter is a combo index. Script users get setTwEasingString.
export const expose = false;

export default function (easing) {
  this.TWEasing = easingNames[easing];
}
