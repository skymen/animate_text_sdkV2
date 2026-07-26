export const config = {
  id: "on-tw-pause",
  highlight: false,
  isDeprecated: false,
  isTrigger: true,
  listName: "On typewriter pause",
  displayText: "{my}: On typewriter pause",
  description: "Triggered when the typewriter pauses",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
