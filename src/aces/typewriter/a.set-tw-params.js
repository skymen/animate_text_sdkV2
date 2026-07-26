export const config = {
  id: "set-tw-params",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Typewriter Params",
  displayText: "{my}: Set typewriter params to [b]{0}[/b]",
  description: "Set the typewriter params",
  params: [
    {
      id: "params",
      name: "Params",
      desc: "Separated by ';'. 'value [a/x/y/o] <number>' or 'duration [type/fade] <number>'",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = true;

export default function (params) {
  this.TWParams = params;
  this.TWParamsOBJ = this.parseTypewriterParams(this.TWParams);
}
