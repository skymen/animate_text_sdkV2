export const config = {
  id: "last-letter-id",
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Get the id of the last letter typed",
  params: [],
};

export const expose = true;

export default function () {
  return this.LastLetterID;
}
