export const config = {
  id: "link-dictionary",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Link Dictionary / JSON",
  displayText: "{my}: Link {0} for vars",
  description:
    "Link a Dictionary or JSON object for holding the vars used by [var=] and [text=] tags. With a JSON, use a dot path like player.skills.0.name",
  params: [
    {
      id: "dictionary",
      name: "Object",
      desc: "The Dictionary or JSON object to link for holding the vars",
      type: "object",
      allowedPluginIds: ["Dictionary", "JSON"],
    },
  ],
};

export const expose = true;

export default function (dictionary) {
  const inst = dictionary.getFirstInstance
    ? dictionary.getFirstInstance()
    : dictionary;
  this.LinkDataInstance(inst);
}
