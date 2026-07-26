export const config = {
  id: "set-tw-easing-string",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Typewriter Easing (by name)",
  displayText: "{my}: Set typewriter easing (by name) to [b]{0}[/b]",
  description: "Set the typewriter easing (by name)",
  params: [
    {
      id: "easing",
      name: "Easing",
      desc: "The easing to use",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = true;

export default function (easing) {
  this.TWEasing = easing;
}
