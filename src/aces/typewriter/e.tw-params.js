export const config = {
  id: "tw-params",
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Get the parameters used by the typewriter",
  params: [],
};

export const expose = true;

export default function () {
  return this.TWParams;
}
