export const config = {
  id: "typed-text-height",
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Get the height of the typed text",
  params: [],
};

export const expose = true;

export default function () {
  const inst = this.instance;
  if (!this.isSupportedHost()) return 0;
  if (!this.typewriterActive) return inst.textHeight;

  const previous = inst.text;
  inst.text = this.curTypedHeight;
  const height = inst.textHeight;
  inst.text = previous;
  return height;
}
