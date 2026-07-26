export const config = {
  id: "is-typing",
  highlight: false,
  isDeprecated: false,
  isTrigger: false,
  isInvertible: true,
  listName: "Is Typing",
  displayText: "{my}: Is typing",
  description: "Check if the typewriter is typing",
  params: [],
};

export const expose = true;

export default function () {
  return this.typewriterActive && !this.typewriterPaused;
}
