import c2StrToC3Str from "../../runtime/c2Convert.js";

export const config = {
  id: "c2-str-to-c3-str",
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "EXPERIMENTAL: Tries to rewrite a SFDX C2 text string into a C3 one",
  params: [
    {
      id: "text",
      name: "Text",
      desc: "The text to convert",
      type: "string",
    },
  ],
};

export const expose = true;

export default function (text) {
  return c2StrToC3Str(text);
}
