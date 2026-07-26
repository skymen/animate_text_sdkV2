export const config = {
  id: "typewrite",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Typewrite",
  displayText: "{my}: Typewrite [b]{0}[/b]",
  description: "Typewrite the text",
  params: [
    {
      id: "text",
      name: "Text",
      desc: "The text to typewrite",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = true;

export default function (text) {
  this.StartTypewriter(text);
}
