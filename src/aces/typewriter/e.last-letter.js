export const config = {
  id: "last-letter",
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Get the last letter typed",
  params: [],
};

export const expose = true;

export default function () {
  return this.LastLetter;
}
