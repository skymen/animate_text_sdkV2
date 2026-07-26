export const config = {
  id: "pause-tw",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Pause Typewriter",
  displayText: "{my}: Pause typewriter",
  description: "Pause the typewriter",
  params: [],
};

export const expose = true;

export default function () {
  this.typewriterPaused = true;
  this._trigger("onTwPause");
}
