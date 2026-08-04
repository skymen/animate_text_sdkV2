<img src="./examples/cover.png" width="150" /><br>
# Animate Text
<i>A behavior that extends the animation capabilities of Spritefont and text</i> <br>
### Version 2.0.2.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/skymen/animate_text_sdkV2/releases/download/skymen_Skymen_SpritefontDX-2.0.2.0.c3addon/skymen_Skymen_SpritefontDX-2.0.2.0.c3addon)
<br>
<sub> [See all releases](https://github.com/skymen/animate_text_sdkV2/releases) </sub> <br>

#### What's New in 2.0.2.0
- **Fixed:** Fixed a bug with the typewriter when multiple characters are eaten by the newline

<sub>[View full changelog](#changelog)</sub>

---
<b><u>Author:</u></b> skymen <br>
<b>[Construct Addon Page](https://www.construct.net/en/make-games/addons/324/animate-text)</b>  <br>
<b>[Addon Website](https://www.construct.net/en/make-games/addons/324/animate-text)</b>  <br>
<b>[Documentation](https://www.construct.net/en/make-games/addons/324/animate-text/documentation)</b>  <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files
| Description | Download |
| --- | --- |
| line-break-tests | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/skymen/animate_text_sdkV2/raw/refs/heads/main/examples/line-break-tests.c3p) |
| spritefontdeluxetemplate | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/skymen/animate_text_sdkV2/raw/refs/heads/main/examples/spritefontdeluxetemplate.c3p) |
| test-animated-icon | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/skymen/animate_text_sdkV2/raw/refs/heads/main/examples/test-animated-icon.c3p) |

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Typewriter Params | Separated by ';'. 'value [a/x/y/o] <number>' or 'duration [type/fade] <number>' | longtext |
| Typewriter Easing | The interpolation method used to ease the fading | combo |
| Custom Easing | Set an easing by name, or use Easings created using C3's easings editor | text |
| Default Aliases | If checked, the behavior will automatically add default alias functions (wave, shake, swing) | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Link Dictionary | Link a dictionary for holding the vars | Dictionary             *(object)* <br> |
| Set Function Animation alias | Set a function animation alias | Name             *(string)* <br>Params             *(string)* <br>Body             *(string)* <br> |
| Set Text | Set the text, after parsing it | Text             *(string)* <br> |
| Pause Typewriter | Pause the typewriter |  |
| Resume Typewriter | Resume the typewriter |  |
| Set Typewriter Easing (by name) | Set the typewriter easing (by name) | Easing             *(string)* <br> |
| Set Typewriter Easing | Set the typewriter easing | Easing             *(combo)* <br> |
| Set Typewriter Params | Set the typewriter params | Params             *(string)* <br> |
| Skip Typewriter | Skip the typewriter | Mode             *(combo)* <br> |
| Typewrite | Typewrite the text | Text             *(string)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is Typing | Check if the typewriter is typing |  |
| On letter typed | Triggered when a letter is typed |  |
| On typewriter pause | Triggered when the typewriter pauses |  |
| On typewriter resume | Triggered when the typewriter resumes |  |
| On typewriter start | Triggered when the typewriter starts |  |
| On typewriter stop | Triggered when the typewriter stops |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| c2StrToC3Str | EXPERIMENTAL: Tries to rewrite a SFDX C2 text string into a C3 one | string | Text *(string)* <br> | 
| lastLetterId | Get the id of the last letter typed | number |  | 
| lastLetter | Get the last letter typed | string |  | 
| twEasing | Get the easing used by the typewriter | string |  | 
| twParams | Get the parameters used by the typewriter | string |  | 
| typedTextHeight | Get the height of the typed text | number |  | 
| typedTextWidth | Get the width of the typed text | number |  | 


---
## Changelog

**2.0.2.0**
- **Fixed:** Fixed a bug with the typewriter when multiple characters are eaten by the newline

**2.0.1.0**
- **Fixed:** The last character before a word wrap now fades in instead of popping in. The count of characters the wrap ate was taken one character past the reveal, so it saw the eaten whitespace early and held that character back until the reveal had crossed the whole run: one step for a single space, eleven for a run of eleven, by which time its fade had already finished.
- **Fixed:** Line breaks with multiple eaten white texts now get properly counted

**2.0.0.0**
- **Added:** Rebuilt on the Construct addon SDK v2. Same addon id, same actions, conditions, expressions and properties, so it drops into existing projects.
- **Added:** Typewriter easing now accepts any easing made in the project's easings editor, looked up by name. Use the Custom Easing property or the "Set Typewriter Easing (by name)" action.
- **Added:** Typewriter state now shows up in the debugger.
- **Added:** The alias name in "Set Function Animation alias" now autocompletes across actions.
- **Changed:** Easings are now Construct's own, so the curves match the timeline and the tween behavior instead of being this addon's copies of them. Projects do not need changing: every 1.x easing name still selects and still works. Five easings Construct has and this addon did not are now available too, ease in elastic, ease out elastic, ease in out elastic, ease in bounce and ease in out bounce.
- **Changed:** Six 1.x names were the same curve under a second name and now point at it directly: swingFrom is ease in back, swingTo is ease out back, swingFromTo is ease in out back, bounce is ease out bounce, easeFrom is ease in quart, easeFromTo is ease in out quart. They stay in the dropdown, marked with their old name, so existing projects keep loading. Three had no Construct equivalent and use the nearest: elastic becomes ease out elastic, and since 1.x's elastic never left 1.0 and so faded nothing, this is the first time it does anything. easeTo becomes ease out circ. bouncePast becomes ease out back, the only Construct curve that overshoots, though it peaks at 1.10 rather than 1.25.
- **Changed:** The curves themselves differ slightly from 1.x, by up to 0.03, because Construct's are splines where this addon used formulas.
- **Changed:** The EasingFunctions and easingfunctions helpers are gone from the tag expression scope. c3easing now resolves Construct's own curves as well as the project's, so it covers what they were for.
- **Changed:** Save states now store the text you passed in and rebuild the parsed animation when loading, instead of serialising live functions. Save states made with 1.x will not load into 2.0.0.0.
- **Changed:** Script interface methods are now generated from the actions. setTwEasing(name) is now setTwEasingString(name), and skipTwToNextPause(toEnd) is now skipTw(mode) where mode 0 skips to the end and 1 skips to the next pause.
- **Fixed:** The typewriter no longer drifts by a character on every wrap that breaks on more than one space. Word wrap deletes the whitespace it breaks on, so those characters are in the string but never drawn, and the reveal index has to skip them. It counted one skipped character per wrapped line, but a break on two spaces eats two.
- **Fixed:** Easing curves now reach their end value. They were evaluated over a duration of 1.01 instead of 1, so a curve stopped just short: ease in circ reached 0.874 rather than 1.
- **Fixed:** Set Text no longer crashes when a typewriter is still running. It kept the old typewriter timings while swapping in the new text, so the next tick ran off the end of them as soon as the new text was longer. Set Text now cancels the typewriter.
- **Fixed:** Animated icons work again. A solo tag written as [sfdx=icon ...][/sfdx] rendered nothing, because a solo tag is only drawn next to a character and that spelling has no characters. It now expands the same way the [icon=...] spelling always did.
- **Fixed:** Colour helpers accept the current CSS syntax. Browsers stopped accepting unitless values in the comma form of hsl(), so hsl(0,100,50) has to be written hsl(0,100%,50%) or hsl(0 100% 50%). colorToHex and lerpColor now read all three forms, so old content keeps working.
- **Fixed:** Linking a dictionary and then loading a save state left the link broken, because the instance was restored instead of its data map. [var=...] tags stopped resolving after a load.
- **Fixed:** TypedTextWidth and TypedTextHeight returned an invalid value when the behavior was on an object that is not Text or Sprite Font. They now return 0.
- **Fixed:** The LastLetter expression returned an invalid value before the first letter was typed. It now returns an empty string.
- **Fixed:** Removed four pieces of internal state that were saved but never read.
