export const config = {
  id: "tw-easing",
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Get the easing used by the typewriter",
  params: [],
};

export const expose = true;

export default function () {
  return this.TWEasing;
}
