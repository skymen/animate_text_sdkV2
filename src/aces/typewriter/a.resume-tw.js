export const config = {
  id: "resume-tw",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Resume Typewriter",
  displayText: "{my}: Resume typewriter",
  description: "Resume the typewriter",
  params: [],
};

export const expose = true;

export default function () {
  this.typewriterPaused = false;
  this._trigger("onTwResume");
}
