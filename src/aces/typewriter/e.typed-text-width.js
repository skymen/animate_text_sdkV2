export const config = {
  id: "typed-text-width",
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Get the width of the typed text",
  params: [],
};

export const expose = true;

export default function () {
  const inst = this.instance;
  if (!this.isSupportedHost()) return 0;
  if (!this.typewriterActive) return inst.textWidth;

  const previous = inst.text;
  inst.text = this.curTypedWidth;
  const width = inst.textWidth;
  inst.text = previous;
  return width;
}
