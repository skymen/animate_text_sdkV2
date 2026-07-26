export const config = {
  id: "link-dictionary",
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Link Dictionary",
  displayText: "{my}: Link dictionary {0}",
  description: "Link a dictionary for holding the vars",
  params: [
    {
      id: "dictionary",
      name: "Dictionary",
      desc: "The dictionary to link for holding the vars",
      type: "object",
      allowedPluginIds: ["Dictionary"],
    },
  ],
};

export const expose = true;

export default function (dictionary) {
  const inst = dictionary.getFirstInstance
    ? dictionary.getFirstInstance()
    : dictionary;
  if (!inst) return;
  this.linkedDictionnary = inst.getDataMap();
  this.linkedDictionnaryUID = inst.uid;
}
