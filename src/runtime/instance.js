import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";
import { easingNames } from "../acesShared.js";
import { getEasingFunction } from "./easings.js";
import { lerp, unlerp, rgb255ToHex, SFDXUtilsFunctions } from "./utils.js";
import * as internals from "./engineInternals.js";

const DEFAULT_ALIASES = [
  {
    name: "wave",
    params: "magnitude, frequency, length",
    body: "magnitude * sin(t * frequency + i * length)",
  },
  {
    name: "swing",
    params: "magnitude, frequency, length",
    body: "magnitude * cos(t * frequency + i * length)",
  },
  {
    name: "shake",
    params: "magnitude",
    body: "random(magnitude)",
  },
  {
    name: "animatedicon",
    params: "icons, speed",
    body: "icons[Math.floor(t*speed)%icons.length]",
  },
];

const CONDITIONAL_TAGS = ["hide", "b", "i", "u", "s", "stroke"];
const SOLO_TAGS = ["icon"];
const FRAGMENT_WORTH = { icon: 1 };
const SFDX_TAG_ALIASES = [
  "sfdx",
  "anim",
  "typejuice",
  "juice",
  "animate",
  "animtext",
];

// Construct hands out colours as 0-1 components; the tags want hex.
function rgbToHex(rgb) {
  if (!rgb) return "#000000";
  return rgb255ToHex([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]);
}

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const properties = this._getInitProperties();

      this.TWData = {};
      this.TWTime = 0;
      this.TWParams = "";
      this.TWParamsOBJ = this.parseTypewriterParams("");
      this.TWEasing = "linear";

      if (properties) {
        this.TWParams = properties[0];
        this.TWParamsOBJ = this.parseTypewriterParams(this.TWParams);
        this.TWEasing =
          properties[2].trim() !== ""
            ? properties[2]
            : easingNames[properties[1]];
      }

      this.curTypedWidth = "";
      this.curTypedHeight = "";
      this.text = "";
      this.lastKnown = "";
      this.typewriterPaused = false;
      this.typewriterActive = false;
      this.LastLetterID = 0;
      this.LastLetter = "";
      this.animated = false;
      this.SetTextCall = false;
      this.scheduleMaxCharacterCount = null;
      this.additionalFragments = [];

      this.linkedDictionnaryUID = -1;
      this.linkedDictionnary = undefined;
      this.parsedText = [];
      this.typewriterTagData = [];
      this.AnimFunctions = {};

      // What the user last handed us, kept so savegames can rebuild the parsed
      // state instead of serialising live functions.
      this.sourceText = "";
      this.sourceMode = null;
      this.pendingRestore = null;

      if (!this.behaviorType._sfdxAliasFunctions) {
        this.behaviorType._sfdxAliasFunctions = {};
      }
      if (properties && properties[3]) {
        DEFAULT_ALIASES.forEach(({ name, params, body }) => {
          this.DefineAlias(name, params, body);
        });
      }

      this._setTicking2(true);
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    get aliasFunctions() {
      return this.behaviorType._sfdxAliasFunctions;
    }

    isTextHost() {
      return (
        !!self.ITextInstance && this.instance instanceof self.ITextInstance
      );
    }

    isSpriteFontHost() {
      return (
        !!self.ISpriteFontInstance &&
        this.instance instanceof self.ISpriteFontInstance
      );
    }

    isSupportedHost() {
      return this.isTextHost() || this.isSpriteFontHost();
    }

    parseTypewriterParams(params) {
      var paramsA = params.trim().split(";");
      var defaultParams = {
        value: {},
        duration: {
          type: 5,
          fade: 10,
        },
      };

      paramsA.forEach((param) => {
        if (param.trim() === "") return;
        var paramA = param.trim().split(" ");
        let mode = paramA.shift().toLowerCase();
        if (mode.trim() === "" || paramA.length === 0) return;
        let tag = paramA.shift().toLowerCase();
        if (tag.trim() === "" || paramA.length === 0) return;
        let value = paramA.join();

        if (this.isANumber(value)) value = parseFloat(value);

        switch (mode) {
          case "value":
            defaultParams["value"][tag] = value;
            break;
          case "duration":
            switch (tag) {
              case "type":
                defaultParams["duration"]["type"] = value;
                break;
              case "fade":
                defaultParams["duration"]["fade"] = value;
                break;

              default:
                console.warn(
                  tag +
                    " is not a recognised typewriter parameter for " +
                    mode +
                    "."
                );
                break;
            }
            break;
          default:
            console.warn(mode + " is not a recognised typewriter parameter.");
            break;
        }
      });

      return defaultParams;
    }

    getDefault(tag) {
      switch (tag) {
        case "offsetx":
        case "offsety":
        case "iconoffsetx":
        case "iconoffsety":
          return 0;
        case "opacity":
          return 100;
        case "scale":
        case "scalex":
        case "scaley":
        case "iconscale":
        case "iconscalex":
        case "iconscaley":
          return 1;
        case "color":
          return rgbToHex(
            this.isTextHost() ? this.instance.fontColor : this.instance.colorRgb
          );
        case "background":
          return "#FFFFFF";
        case "size":
          if (this.isTextHost()) {
            return this.instance.sizePt;
          }
          return 0;
        default:
          return 0;
      }
    }

    IsConditionalTag(tag) {
      return CONDITIONAL_TAGS.includes(tag);
    }

    IsSoloTag(tag) {
      return SOLO_TAGS.includes(tag);
    }

    TagIsWorthNbFragments(tag) {
      return Object.prototype.hasOwnProperty.call(FRAGMENT_WORTH, tag)
        ? FRAGMENT_WORTH[tag]
        : 0;
    }

    GetTwEasingFunction() {
      return getEasingFunction(this.TWEasing);
    }

    callProjectFunction(name, params = []) {
      return this.runtime.callFunction(name, ...params);
    }

    _tick2() {
      if (!this.isSupportedHost()) {
        console.warn(
          "[Animate Text] This behavior only works on Text and Sprite Font " +
            'objects. It is doing nothing on "' +
            this.instance.objectType.name +
            '".'
        );
        this._setTicking2(false);
        return;
      }

      if (this.pendingRestore) {
        this.applyPendingRestore();
      }

      // Resolve the linked dictionary after a savegame load, once UIDs exist.
      if (this.linkedDictionnaryUID != -1 && !this.linkedDictionnary) {
        const dictInst = this.runtime.getInstanceByUid(
          this.linkedDictionnaryUID
        );
        if (dictInst) this.linkedDictionnary = dictInst.getDataMap();
      }

      // If the host's own Set Text action was called, stop animating.
      if (!this.SetTextCall && this.animated && this.instance.text != this.lastKnown) {
        this.animated = false;
      }

      if (this.SetTextCall) this.SetTextCall = false;

      if (!this.animated) return;

      const time = this.runtime.gameTime;
      var str = "";
      var word = false;

      if (this.typewriterActive) {
        let id = 0;
        this.parsedText.forEach((el) => {
          for (let i = 0; i < el[1].length; i++) {
            let tags = {};

            el[0].forEach((tag) => {
              if (typeof tag[1] === "function") tags[tag[0]] = tag[1](time, i);
              else tags[tag[0]] = tag[1];
            });

            if (
              this.TWTime >= this.TWData.start[id][0] &&
              Object.prototype.hasOwnProperty.call(this.TWData.data[id], "pause")
            ) {
              this.typewriterPaused = true;
              delete this.TWData.data[id].pause;
              this._trigger("onTwPause");
            }
            if (
              this.TWTime >= this.TWData.start[id][0] &&
              Object.prototype.hasOwnProperty.call(this.TWData.data[id], "fn")
            ) {
              let fnData = this.TWData.data[id].fn.split(" ");
              let fnName = fnData.shift();
              let fnParams = JSON.parse("[" + fnData.join(" ") + "]") || [];
              this.callProjectFunction(fnName, fnParams);
              delete this.TWData.data[id].fn;
            }

            Object.keys(this.TWData.data[id]).forEach((tag) => {
              if (!Object.prototype.hasOwnProperty.call(tags, tag)) {
                tags[tag] = this.getDefault(tag);
              }
              tags[tag] = lerp(
                this.TWData.data[id][tag],
                tags[tag],
                this.GetTwEasingFunction()(
                  unlerp(
                    this.TWData.start[id][0],
                    this.TWData.start[id][1],
                    this.TWTime,
                    true
                  )
                )
              );
            });

            let end = "";
            let tagKeys = Object.keys(tags);
            // Tags worth extra fragments must come last in the list.
            tagKeys.sort((a, b) => {
              return (
                this.TagIsWorthNbFragments(a) - this.TagIsWorthNbFragments(b)
              );
            });
            tagKeys.forEach((tag) => {
              if (!["wait", "fade", "type", "pause"].includes(tag)) {
                if (!this.IsConditionalTag(tag) || tags[tag]) {
                  str += "[" + tag + "=" + tags[tag] + "]";
                  end = "[/" + tag + "]" + end;
                }
              }
            });

            let innerText = "";
            let tmp = el[1][i];
            if (typeof tmp != "string") {
              innerText += tmp();
            } else {
              innerText = tmp;
            }

            str += innerText + end;

            if (
              !this.typewriterPaused &&
              this.TWTime >= this.TWData.start[id][0] &&
              this.LastLetterID < id
            ) {
              this.LastLetterID = id;
              this.LastLetter = this.getTextWithNoTags(str)[id];
              this._trigger("onLetterTyped");
              word = true;
              this.curTypedWidth = str;
            }

            if (word) {
              this.curTypedHeight = str;
              if (el[1][i] === " ") word = false;
            }

            id++;
          }
        });

        let offset = 0;
        this.additionalFragments.forEach((frag) => {
          if (frag.rawId > this.LastLetterID) {
            return;
          }
          offset = frag.offset;
        });

        this.SetDrawMaxCharacterCount(this.LastLetterID + offset, str);

        if (this.TWTime >= this.TWData.start[this.TWData.start.length - 1][1]) {
          this.SetDrawMaxCharacterCount(-1);
          this._trigger("onTwStop");
          this.typewriterActive = false;
        }

        if (!this.typewriterPaused) this.TWTime += this.instance.dt;
      } else {
        this.parsedText.forEach((el) => {
          if (el[0].length == 0) {
            let innerText = "";
            let tmp = el[1];
            if (typeof tmp != "string") {
              tmp.forEach((f) => {
                innerText += f();
              });
            } else {
              innerText = tmp;
            }
            str += innerText;
          } else {
            if (el[1].length == 0) {
              let end = "";
              el[0].forEach((tag) => {
                let val;
                if (typeof tag[1] === "function") val = tag[1](time, -1);
                else val = tag[1];
                if (
                  !this.IsSoloTag(tag[0]) &&
                  (!this.IsConditionalTag(tag[0]) || val)
                ) {
                  str += "[" + tag[0] + "=" + val + "]";
                  end = "[/" + tag[0] + "]" + end;
                }
              });
              str += end;
            } else {
              for (let i = 0; i < el[1].length; i++) {
                let end = "";
                el[0].forEach((tag) => {
                  let val;
                  if (typeof tag[1] === "function") val = tag[1](time, i);
                  else val = tag[1];
                  if (!this.IsConditionalTag(tag[0]) || val) {
                    str += "[" + tag[0] + "=" + val + "]";
                    end = "[/" + tag[0] + "]" + end;
                  }
                });
                let innerText = "";
                let tmp = el[1][i];
                if (typeof tmp != "string") {
                  innerText += tmp();
                } else {
                  innerText = tmp;
                }
                str += innerText + end;
              }
            }
          }
        });
      }

      this.lastKnown = str;
      this.SetTextInst(str);
    }

    GetNbNewlines(nb, text) {
      const previousText = this.instance.text;
      this.SetTextInst(text);

      let pureText = this.getTextWithNoTags(text).slice(0, nb + 1);
      const lines = internals.getWrappedLineTexts(this.instance);

      let nbLines = 0;
      if (lines.length > 1) {
        while (pureText.length > 0 && lines.length > 0) {
          const start = lines[0];
          if (!(pureText.startsWith(start) || start.startsWith(pureText))) break;
          nbLines++;
          lines.shift();
          pureText = pureText.slice(start.length).trimStart();
        }
      }

      nbLines -= pureText === "";

      this.SetTextInst(previousText);
      return nbLines;
    }

    SetDrawMaxCharacterCount(nb, text = null) {
      this.scheduleMaxCharacterCount = null;
      if (text) {
        nb += 1;
        nb -= this.GetNbNewlines(nb, text);
      }
      this.scheduleMaxCharacterCount = nb;
    }

    SetTextInst(str) {
      this.instance.text = str;
      if (
        this.scheduleMaxCharacterCount != null &&
        this.scheduleMaxCharacterCount !==
          internals.getDrawMaxCharacterCount(this.instance)
      ) {
        internals.setDrawMaxCharacterCount(
          this.instance,
          this.scheduleMaxCharacterCount
        );
        internals.updateRender();
        this.scheduleMaxCharacterCount = null;
      }
    }

    StartTypewriter(text, silent = false) {
      this.sourceMode = "typewriter";
      this.sourceText = text;

      if (text === "") {
        this.SetTextInst("");
        this.lastKnown = "";
        this.animated = false;
        this.typewriterActive = false;
        return;
      }

      this.SetTextCall = true;
      this.text = this.getTextWithNoTW(text);
      this.parseText();
      this.SetDrawMaxCharacterCount(0);
      this.LastLetterID = -1;
      this.typewriterActive = true;
      this.animated = true;
      this.typewriterPaused = false;
      this.TWTime = 0;
      this.curTypedWidth = "";
      this.curTypedHeight = "";
      let pureText = this.getTextWithNoTags(this.text);

      // Records where a tag adds fragments beyond its own characters, so the
      // draw character count can be offset by the right amount.
      this.additionalFragments = [];
      let curFragmentOffset = 0;
      let curFragmentId = 0;
      this.parsedText.forEach((el) => {
        if (el[1].length === 0) {
          return;
        }
        let curWorth = 0;

        el[0].forEach((tag) => {
          curWorth += this.TagIsWorthNbFragments(tag[0]);
        });

        if (curWorth > 0) {
          this.additionalFragments.push({
            rawId: curFragmentId,
            id: curFragmentId - curFragmentOffset,
            offset: curFragmentOffset + curWorth,
            worth: curWorth,
          });
          curFragmentOffset += curWorth;
        }

        curFragmentId += el[1].length;
      });

      let start = 0;
      this.TWData = {
        start: [],
        data: [],
      };
      for (let i = 0; i < pureText.length; i++) {
        var curData = {};
        Object.assign(curData, this.TWParamsOBJ.value);
        Object.assign(curData, this.TWParamsOBJ.duration);
        for (let j = 0; j < this.typewriterTagData.length; j++) {
          let el = this.typewriterTagData[j];
          if (el.id > i) break;
          let data = el.data.split(" ");
          let tag = data[0].toLowerCase();
          if ((tag === "wait" || tag === "pause" || tag === "fn") && el.id != i)
            continue;

          if (tag === "fn") {
            data.shift();
            curData[tag] = data.join(" ");
          } else {
            data.shift();
            let tagFn = data.join(" ");
            try {
              curData[tag] = this.getAnimFunction(tagFn)();
            } catch (e) {
              if (this.isANumber(data[0])) curData[tag] = parseFloat(data[0]);
              else curData[tag] = tagFn;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(curData, "wait")) {
          start += curData.wait;
        }
        if (Object.prototype.hasOwnProperty.call(curData, "pause")) {
          start += curData.fade;
        }
        this.TWData.start.push([start, start + curData.fade]);

        start += curData.type;
        this.TWData.data.push(curData);
      }

      if (!silent) this._trigger("onTwStart");
    }

    ApplyText(text) {
      this.sourceMode = "text";
      this.sourceText = text;
      this.text = text;
      this.SetTextCall = true;
      // Setting text cancels a typewriter in progress. Without this the tick
      // walks the new text against the old typewriter timings and runs off the
      // end of TWData as soon as the new text is longer.
      this.typewriterActive = false;
      this.typewriterPaused = false;
      this.TWData = {};
      this.parseText();
      this.animated = true;
    }

    isAString(text) {
      var regex = /(["'])(\\?.)*?\1/g;
      var match = regex.exec(text);
      return match != null && match[0] === text;
    }

    isANumber(text) {
      return parseFloat(text).toString() === text;
    }

    GetBody(body) {
      let utils =
        "let { " +
        Object.keys(SFDXUtilsFunctions).join(",") +
        " } = globalThis.SFDXUtilsFunctions;";
      body = utils + "return " + body + ";";
      return body;
    }

    DefineAlias(name, params, body) {
      body = this.GetBody(body);
      var arr = [];
      if (params.trim() != "") {
        params = params.split(",").map(function (s) {
          return s.trim();
        });
        arr = arr.concat([Function], params, ["t", "i"], [body]);
      } else {
        arr = arr.concat([Function], ["t", "i"], [body]);
      }
      var fn = new (Function.bind.apply(Function, arr))();
      this.aliasFunctions[name.toLowerCase().trim()] = fn;
    }

    SkipTypewriterToNextPause(toEnd) {
      if (!this.typewriterActive) return;

      let i = 0;
      while (
        i < this.TWData.start.length &&
        this.TWTime > this.TWData.start[i][0]
      ) {
        i++;
      }

      while (
        i < this.TWData.data.length &&
        (toEnd ||
          !Object.prototype.hasOwnProperty.call(this.TWData.data[i], "pause"))
      ) {
        if (Object.prototype.hasOwnProperty.call(this.TWData.data[i], "fn")) {
          let fnData = this.TWData.data[i].fn.split(" ");
          let fnName = fnData.shift();
          let fnParams = JSON.parse("[" + fnData.join(" ") + "]") || [];
          this.callProjectFunction(fnName, fnParams);
        }
        i++;
      }

      if (i === this.TWData.data.length) {
        this.SetDrawMaxCharacterCount(-1);
        this._trigger("onTwStop");
        this.typewriterActive = false;
      } else {
        this.TWTime = this.TWData.start[i][0];
      }
    }

    getTextWithNoTags(text) {
      let regex = /\[\/?((?!\/?tw|fn|text)[^\]]*)(=[^\]]*)?\]/gi;
      text = text.replace(regex, "");
      regex = /\[\/?((?!\/?tw)[^\]]*)(=[^\]]*)?\]/gi;
      var match;
      while ((match = regex.exec(text)) !== null) {
        let a = match[1].split("=");
        let b = a[1] || "";
        let c = b.split(" ");
        let len = parseInt(c[1]) || 0;
        let str2 = "";
        for (let i = 0; i < len; i++) {
          str2 += "0";
        }
        text = text.replace(match[0], str2);
        regex.lastIndex = 0;
      }
      return text;
    }

    getTextWithNoTW(text) {
      let regex = /\[tw=([^\]]*)?\]/gi;

      var match;
      var offset = 0;
      this.typewriterTagData = [];
      text = this.getVars(text);

      var noTag = this.getTextWithNoTags(text);

      while ((match = regex.exec(noTag)) !== null) {
        this.typewriterTagData.push({
          data: match[1].trim(),
          id: match.index - offset,
        });
        offset += match[0].length;
      }
      return text.replace(regex, "");
    }

    getAnimFunction(tag) {
      if (!Object.prototype.hasOwnProperty.call(this.AnimFunctions, tag)) {
        let regex = /^[\d\w]+(\(.*\))?$/g;
        tag = tag.trim();
        let found = regex.test(tag);
        if (found) {
          var arr = tag.split("(");
          var name = arr[0].trim().toLowerCase();
          found = Object.prototype.hasOwnProperty.call(
            this.aliasFunctions,
            name
          );
        }
        if (found) {
          var arr = tag.split("(");
          var name = arr[0].trim().toLowerCase();
          var fn = this.aliasFunctions[name];

          if (arr.length > 1) {
            var params = [];
            var str = arr.slice(1).join("(").slice(0, -1);

            let curParam = "";
            let stack = 0;
            for (let i = 0; i < str.length; i++) {
              if (str[i] === "(") {
                stack++;
              } else if (str[i] === ")") {
                stack--;
              } else if (str[i] === "," && stack === 0) {
                params.push(curParam.trim());
                curParam = "";
                continue;
              }
              curParam += str[i];
            }
            params.push(curParam.trim());
            for (let i = 0; i < params.length; i++) {
              if (!isNaN(Number(params[i]))) {
                params[i] = Number(params[i]);
              }
            }
            params = params.map((x) => {
              if (typeof x !== "string") return x;
              let x2 = x.trim().toLowerCase();
              if (x2 === "true") return true;
              if (x2 === "false") return false;
              if (x2 === "null") return null;
              if (x2 === "undefined") return undefined;
              if (x2.startsWith("array")) {
                let arr = x.split("(");
                let arr2 = arr[1].split(")");
                let arr3 = arr2[0].split(",");
                return arr3;
              }
              return x;
            });
            params.unshift(null);
            this.AnimFunctions[tag] = fn.bind.apply(fn, params);
          } else {
            this.AnimFunctions[tag] = fn;
          }
        } else {
          var arr = [];
          arr = arr.concat(
            [Function],
            ["t", "i"],
            [this.GetBody(tag.toLowerCase())]
          );
          this.AnimFunctions[tag] = new (Function.bind.apply(Function, arr))();
        }
      }
      return this.AnimFunctions[tag];
    }

    parseText() {
      var res = [];
      var stack = 0;
      var currentTag = [];
      var currentText = "";
      var tagParam = false;
      var self2 = this;

      if (typeof this.linkedDictionnary !== "undefined") {
        this.replaceVars();
      }
      this.SetDrawMaxCharacterCount(-1);

      var text = this.text;

      // Matches tags that are neither sfdx nor text
      var regex = /\[\/?((?!\/?sfdx|text|fn)[^\]]*)\]/gi;
      var match;
      while ((match = regex.exec(text)) !== null) {
        if (!match[0].startsWith("[/")) {
          let a = match[1].split("=");
          if (SFDX_TAG_ALIASES.includes(a[0].toLowerCase())) {
            text = text.replace(match[0], "[sfdx=" + a[1] + "]");
          } else {
            if (this.IsSoloTag(a[0])) {
              text = text.replace(
                match[0],
                "[sfdx=" + a[0] + ' "' + a[1] + '"][sfdx=scale 0] [/sfdx][/sfdx]'
              );
            } else {
              text = text.replace(match[0], "[sfdx=" + a[0] + ' "' + a[1] + '"]');
            }
          }
        } else {
          if (!this.IsSoloTag(match[1])) {
            text = text.replace(match[0], "[/sfdx]");
          } else {
            text = text.replace(match[0], "");
          }
        }
        regex.lastIndex = 0;
      }

      // A solo tag with no body renders nothing, because the tag is only
      // emitted alongside a character. Give it the same zero width placeholder
      // the literal [icon=x] form above expands to, so both spellings behave
      // the same and the typewriter has a character to reveal it with.
      text = text.replace(
        new RegExp(
          "\\[sfdx=(" + SOLO_TAGS.join("|") + ")(\\s[^\\]]*)?\\]\\[/sfdx\\]",
          "gi"
        ),
        "[sfdx=$1$2][sfdx=scale 0] [/sfdx][/sfdx]"
      );

      this.text = text;

      for (let i = 0; i < text.length; i++) {
        if (tagParam) {
          if (text[i] === "]") {
            tagParam = false;
            currentText = "";
          } else {
            currentTag[stack - 1] += text[i];
          }
        } else {
          if (text.substring(i).toLowerCase().startsWith("[sfdx=")) {
            push(JSON.parse(JSON.stringify(currentTag)), currentText);
            stack++;
            currentTag.push("");
            tagParam = true;
            i += 5;
          } else if (text.substring(i).toLowerCase().startsWith("[/sfdx]")) {
            // Guards against closing sfdx tags that were never opened
            if (stack > 0) {
              stack--;
              push(JSON.parse(JSON.stringify(currentTag)), currentText);
              currentTag.pop();
              currentText = "";
            }
            i += 6;
          } else if (text.substring(i).toLowerCase().startsWith("[text=")) {
            push(JSON.parse(JSON.stringify(currentTag)), currentText);
            currentText = "";
            i += 6;
            while (text[i] !== "]") {
              currentText += text[i];
              i++;
            }
            let textParam = currentText.split(" ");
            let obj = [];
            let textName = textParam[0];
            let length = parseInt(textParam[1]) || 0;
            for (let k = 0; k < length; k++) {
              obj.push(() => this.getChar(textName, k, false));
            }
            push(JSON.parse(JSON.stringify(currentTag)), obj);
            currentText = "";
          } else if (text.substring(i).toLowerCase().startsWith("[fn=")) {
            push(JSON.parse(JSON.stringify(currentTag)), currentText);
            currentText = "";
            i += 4;
            while (text[i] !== "]") {
              currentText += text[i];
              i++;
            }
            let textParam = currentText.split(" ");
            let obj = [];
            let textName = textParam[0];
            let length = parseInt(textParam[1]) || 0;
            for (let k = 0; k < length; k++) {
              obj.push(() => this.getChar(textName, k, true));
            }
            push(JSON.parse(JSON.stringify(currentTag)), obj);
            currentText = "";
          } else {
            currentText += text[i];
          }
        }
      }

      push(JSON.parse(JSON.stringify(currentTag)), currentText);

      function push(tag, text) {
        let tagNames = tag.map((x) => x.split(" ")[0]);
        if (text == "" && !tagNames.some((x) => self2.IsSoloTag(x))) return;

        var tagArray = [];

        tag.forEach((t) => {
          var arr = t.split(" ");
          var firstTag = arr.shift();
          var tagfn = arr.join(" ");
          var fn;
          if (self2.isAString(tagfn)) {
            fn = tagfn.substring(1, tagfn.length - 1);
          } else {
            fn = self2.getAnimFunction(tagfn);
          }

          tagArray.push([firstTag, fn]);
        });

        res.push([tagArray, text]);
      }

      this.parsedText = res;
    }

    getChar(name, i, fn) {
      name = name.toLowerCase();
      if (fn) {
        let str = this.callProjectFunction(name) || "";
        return i < str.length ? str[i] : " ";
      }
      if (this.linkedDictionnary && this.linkedDictionnary.has(name)) {
        let val = this.linkedDictionnary.get(name);
        return i < val.length ? val[i] : " ";
      }
      return " ";
    }

    replaceVars() {
      this.text = this.getVars(this.text);
    }

    getVars(text) {
      var regex = /\[(var|varfn)=([\d\w]+)\]/gi;
      var match;
      while ((match = regex.exec(text)) !== null) {
        let isVar = match[1].trim().toLowerCase() === "var";
        let varName = match[2].toLowerCase();
        if (isVar) {
          if (this.linkedDictionnary && this.linkedDictionnary.has(varName)) {
            text = text.replace(match[0], this.linkedDictionnary.get(varName));
            regex.lastIndex = 0;
          }
        } else {
          let str = this.callProjectFunction(varName) || "";
          text = text.replace(match[0], str);
          regex.lastIndex = 0;
        }
      }
      return text;
    }

    _getDebuggerProperties() {
      return [
        {
          title: "Animate Text",
          properties: [
            { name: "Typewriter active", value: this.typewriterActive },
            { name: "Typewriter paused", value: this.typewriterPaused },
            { name: "Typewriter time", value: this.TWTime },
            { name: "Last letter ID", value: this.LastLetterID },
            { name: "Last letter", value: this.LastLetter },
            { name: "Typewriter params", value: this.TWParams },
            { name: "Typewriter easing", value: this.TWEasing },
            { name: "Animating", value: this.animated },
          ],
        },
      ];
    }

    _saveToJson() {
      return {
        sourceMode: this.sourceMode,
        sourceText: this.sourceText,
        text: this.text,
        lastKnown: this.lastKnown,
        curTypedWidth: this.curTypedWidth,
        curTypedHeight: this.curTypedHeight,
        typewriterPaused: this.typewriterPaused,
        typewriterActive: this.typewriterActive,
        animated: this.animated,
        LastLetterID: this.LastLetterID,
        LastLetter: this.LastLetter,
        TWTime: this.TWTime,
        TWEasing: this.TWEasing,
        TWParams: this.TWParams,
        linkedDictionnaryUID: this.linkedDictionnaryUID,
      };
    }

    _loadFromJson(o) {
      this.TWParams = o.TWParams;
      this.TWParamsOBJ = this.parseTypewriterParams(this.TWParams);
      this.TWEasing = o.TWEasing;
      this.linkedDictionnaryUID = o.linkedDictionnaryUID;
      this.linkedDictionnary = undefined;
      // The parsed text and its animation functions are rebuilt rather than
      // restored. Deferred to the next tick so the linked dictionary's UID can
      // be resolved first.
      this.pendingRestore = o;
    }

    applyPendingRestore() {
      const o = this.pendingRestore;
      this.pendingRestore = null;

      if (this.linkedDictionnaryUID != -1 && !this.linkedDictionnary) {
        const dictInst = this.runtime.getInstanceByUid(
          this.linkedDictionnaryUID
        );
        if (dictInst) this.linkedDictionnary = dictInst.getDataMap();
      }

      if (o.sourceMode === "typewriter") {
        this.StartTypewriter(o.sourceText, true);
      } else if (o.sourceMode === "text") {
        this.ApplyText(o.sourceText);
      }

      this.text = o.text;
      this.lastKnown = o.lastKnown;
      this.curTypedWidth = o.curTypedWidth;
      this.curTypedHeight = o.curTypedHeight;
      this.typewriterPaused = o.typewriterPaused;
      this.typewriterActive = o.typewriterActive;
      this.animated = o.animated;
      this.LastLetterID = o.LastLetterID;
      this.LastLetter = o.LastLetter;
      this.TWTime = o.TWTime;

      // Pauses and function calls already passed must not fire again.
      if (this.TWData && this.TWData.start) {
        for (let i = 0; i < this.TWData.start.length; i++) {
          if (this.TWTime >= this.TWData.start[i][0]) {
            delete this.TWData.data[i].pause;
            delete this.TWData.data[i].fn;
          }
        }
      }
    }
  };
}
