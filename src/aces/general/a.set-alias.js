export const config = {
  id: "set-alias",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Function Animation alias",
  displayText: "{my}: function [b]{0}[/b] ([i]{1}[/i]) { return {2} }",
  description: "Set a function animation alias",
  params: [
    {
      id: "name",
      name: "Name",
      desc: "The name of the alias",
      type: "string",
      initialValue: '""',
      autocompleteId: "animate_text_alias",
    },
    {
      id: "params",
      name: "Params",
      desc: "The params of the function (not accounting for t and i)",
      type: "string",
      initialValue: '""',
    },
    {
      id: "body",
      name: "Body",
      desc: "The body of the function",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = true;

export default function (name, params, body) {
  this.DefineAlias(name, params, body);
}
