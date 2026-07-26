export const config = {
  id: "skip-tw",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Skip Typewriter",
  displayText: "{my}: Skip typewriter [b]{0}[/b]",
  description: "Skip the typewriter",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "The skip mode to use",
      type: "combo",
      initialValue: "to-end",
      items: [{ "to-end": "to end" }, { "to-next": "to next pause" }],
    },
  ],
};

export const expose = true;

export default function (mode) {
  this.SkipTypewriterToNextPause(mode === 0);
}
