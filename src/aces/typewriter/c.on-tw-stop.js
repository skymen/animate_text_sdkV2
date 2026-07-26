export const config = {
  id: "on-tw-stop",
  highlight: false,
  isDeprecated: false,
  isTrigger: true,
  listName: "On typewriter stop",
  displayText: "{my}: On typewriter stop",
  description: "Triggered when the typewriter stops",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
