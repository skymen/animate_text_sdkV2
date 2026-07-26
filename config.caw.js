import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
import { easingItems } from "./src/acesShared.js";

export const addonType = ADDON_TYPE.BEHAVIOR;
export const type = PLUGIN_TYPE.OBJECT;
// Same id as the v1 addon so this is a drop-in replacement. Do not change.
export const id = "skymen_Skymen_SpritefontDX";
export const name = "Animate Text";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "skymen";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description =
  "A behavior that extends the animation capabilities of Spritefont and text";
export const category = ADDON_CATEGORY.GENERAL;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false,
    watch: false,
    targets: ["x86", "x64"],
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

export const aceCategories = {
  general: "General",
  typewriter: "Typewriter",
};

export const info = {
  Set: {
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,

    IsOnlyOneAllowed: true,

    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,

    IsSingleGlobal: false,
  },
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

// Order is frozen: the runtime reads these positionally and existing projects
// store them by index. Append only.
export const properties = [
  {
    type: PROPERTY_TYPE.LONGTEXT,
    id: "tw-params",
    options: {
      initialValue: "value offsety -10; duration type 0.1; duration fade 0.1",
      interpolatable: false,
    },
    name: "Typewriter Params",
    desc: "Separated by ';'. 'value [a/x/y/o] <number>' or 'duration [type/fade] <number>'",
  },
  {
    type: PROPERTY_TYPE.COMBO,
    id: "tw-easing",
    options: {
      initialValue: "linear",
      interpolatable: false,
      items: easingItems,
    },
    name: "Typewriter Easing",
    desc: "The interpolation method used to ease the fading",
  },
  {
    type: PROPERTY_TYPE.TEXT,
    id: "tw-custom-easing",
    options: {
      initialValue: "",
      interpolatable: false,
    },
    name: "Custom Easing",
    desc: "Set an easing by name, or use Easings created using C3's easings editor",
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "enable-default-functions",
    options: {
      initialValue: true,
      interpolatable: false,
    },
    name: "Default Aliases",
    desc: "If checked, the behavior will automatically add default alias functions (wave, shake, swing)",
  },
];
