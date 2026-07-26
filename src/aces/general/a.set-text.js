export const config = {
  id: "set-text",
  highlight: true,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Text",
  displayText: "{my}: Set text to [b]{0}[/b]",
  description: "Set the text, after parsing it",
  params: [
    {
      id: "text",
      name: "Text",
      desc: "The text to set",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = true;

export default function (text) {
  this.ApplyText(text);
}
