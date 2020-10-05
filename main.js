const { Path, Color } = require("scenegraph");
const { appLanguage } = require("application");
const commands = require("commands");
// const strings = require("./strings.json");
// const supportedLanguages = require("./manifest.json").languages;
// const uiLang = supportedLanguages.includes(appLanguage)
//     ? appLanguage
//     : supportedLanguages[0];


const softFn = (selection) => {
  
  commands.convertToPath();

  selection.items.forEach((item) => {
    //   [0] "m",  "mx",   "my",
    //   [3] "c1", "c1x1", "c1y1", "c1x2", "c1y2", "c1x", "c1y",
    //   [10]"c2", "c2x1", "c2y1", "c2x2", "c2y2", "c2x", "c2y",
    //   [17]"c3", "c3x1", "c3y1", "c3x2", "c3y2", "c3x", "c3y",
    //   [24]"c4", "c4x1", "c4y1", "c4x2", "c4y2", "c4x", "c4y",
    //   [31]"z"

    const splitData = item.pathData.split(" ");
    if (
      splitData[3] == "C" &&
      splitData[10] == "C" &&
      splitData[17] == "C" &&
      splitData[24] == "C" &&
      splitData[31] == "Z"
    ) {
      const rateOfChange = 0.8;
      const leftHorizontal =
        item.localBounds.width - item.localBounds.height * rateOfChange;
      const rightHorizontal = item.localBounds.width * rateOfChange;
      const topVertical =
        item.localBounds.width - item.localBounds.height * rateOfChange;
      const bottomVertical = item.localBounds.width * rateOfChange;

      splitData[27] = leftHorizontal;
      splitData[4] = rightHorizontal;
      splitData[13] = rightHorizontal;
      splitData[18] = leftHorizontal;
      splitData[7] = topVertical;
      splitData[12] = bottomVertical;
      splitData[21] = bottomVertical;
      splitData[26] = topVertical;

      const chengedData = splitData.join(" ");

      item.pathData = chengedData;

      // const path = new Path();
      // path.pathData = chengedData;
      // path.name = item.name;
      // path.fill = item.fill;
      // path.stroke = item.stroke;
      // selection.insertionParent.addChild(path);
    }
  });
};

// [6]
module.exports = {
  commands: {
    softellipse: softFn,
  },
};
