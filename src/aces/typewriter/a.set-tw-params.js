export const config = {
  id: "set-tw-params",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Set Typewriter Params",
  displayText: "{my}: Set typewriter params to [b]{0}[/b]",
  description:
    "Set the typewriter params: the starting values letters fade in from, the delay between letters and how long each fade takes",
  params: [
    {
      id: "params",
      name: "Params",
      desc: "Separated by ';'. 'value <tag> <value>' (e.g. value offsety -10; value opacity 0) or 'duration [type/fade] <seconds>'",
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
