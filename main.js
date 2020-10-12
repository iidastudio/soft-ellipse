const { selection, Ellipse } = require("scenegraph");
const { editDocument, appLanguage } = require("application");
const commands = require("commands");
const strings = require("./strings.json");
const supportedLanguages = require("./manifest.json").languages;
const uiLang = supportedLanguages.includes(appLanguage)
    ? appLanguage
    : supportedLanguages[0];

let panel;
let numInput;
let slider;

const create = () => {
  const html = `
  <style>
  .numInput {
    display: inline-block;
    width: 5em;
  }
  .text {
    margin: 0;
  }
  input[type="range"] {
    width: 100%;
  }
  .numINput::after {
    content: "%";
    display: block;
    
  }
  label {
    width: 100%;
  }
  .numInputUnit {
    display: flex;
    align-items: center;
  }
  .textUnit {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  hr {
    margin-top: 10px;
    margin-bottom: 20px;
  }
</style>
<div class="container">
  <label>
    <div class="textUnit">
      <h2>${strings[uiLang].transformValue}</h2>
      <div class="numInputUnit">
        <input id="numInput" class="numInput" type="number" name="numInput" min="0" max="100" step="1" value="0">
        <span class="text">%</span>
      </div>
    </div>
    <input id="slider" class="slider" type="range" min="0" max="100" value="0" />
  </label>
</div>
<hr />
<p>${strings[uiLang].notice}</p>
<button id="reEllipse">${strings[uiLang].returnToEllipse}</button>
  `;

  panel = document.createElement("div");
  panel.innerHTML = html;

  // グローバル変数に要素を指定
  numInput = panel.querySelector("#numInput");
  slider = panel.querySelector("#slider");

  // slider から numInput へ数値の反映
  slider.addEventListener("input", () => {
    let result = Math.round(slider.value);
    numInput.value = result;
  });
  // numInput から slider へ数値の反映
  numInput.addEventListener("input", () => {
    if (numInput.value > 100) {
      numInput.value = 100;
    } else if (numInput.value < 0) {
      numInput.value = 0;
    } else {
      numInput.value = Math.round(numInput.value);
    }
    let result = Math.round(numInput.value);
    slider.value = result;
  });

  // 数値入力で実行(少数分の移動を間引き)
  let nowInput = Math.round(numInput.value);
  numInput.addEventListener("input", () => {
    if (nowInput !== Math.round(numInput.value)) {
      softFn();
      nowInput = Math.round(numInput.value);
    }
  });
  // スライダーバー実行(少数分の移動を間引き)
  let nowSlider = Math.round(slider.value);
  slider.addEventListener("input", () => {
    if (nowSlider !== Math.round(slider.value)) {
      softFn();
      nowSlider = Math.round(slider.value);
    }
  });

  // 楕円に戻すを実行
  panel.querySelector("#reEllipse").addEventListener("click", reEllipse);

  return panel;
};

// 逆算関数
const backCulcFn = () => {
  selection.items.forEach((item) => {

    // 選択されたアイテムが楕円かそれに準ずるパスかどうか判定
    if ( item.constructor.name === "Ellipse" || item.constructor.name === "Path" ) {
      const splitData = item.pathData.split(" ");
      if (
        splitData[3] == "C" &&
        splitData[10] == "C" &&
        splitData[17] == "C" &&
        splitData[24] == "C" &&
        splitData[31] == "Z"
      ) {
        // splitDataの値の型をNumberに変換
        for (let i = 0; i < splitData.length; i++) {
          if (!splitData[i].match(/[A-Z]/)) {
            splitData[i] = Number(splitData[i]);
          }
        }

        const bezierCurve = (4 / 3) * (Math.sqrt(2) - 1);
        const widthPointLength =
          item.localBounds.width / 2 + (bezierCurve * item.localBounds.width) / 2;
        const widthPointRemainder =
          item.localBounds.width / 2 - (bezierCurve * item.localBounds.width) / 2;

        const result = Math.round(
          ((splitData[4] - widthPointLength) / widthPointRemainder) * 100
        );
        numInput.value = result;
        slider.value = result;
      }
    }
  });
};

// 楕円に戻す（プロパティを引き継いだ楕円を作成してもとの図形を削除）
const reEllipse = () => {
  editDocument((selection) => {
    selection.items.forEach((item) => {
      if ( item.constructor.name === "Ellipse" || item.constructor.name === "Path" ) {
        const splitData = item.pathData.split(" ");
        if (
          splitData[3] == "C" &&
          splitData[10] == "C" &&
          splitData[17] == "C" &&
          splitData[24] == "C" &&
          splitData[31] == "Z"
        ) {
          const ellipse = new Ellipse();
          ellipse.name = item.name;
          ellipse.radiusX = item.localBounds.width / 2;
          ellipse.radiusY = item.localBounds.height / 2;
          ellipse.fillEnabled = item.fillEnabled;
          ellipse.fill = item.fill;
          ellipse.strokeEnabled = item.strokeEnabled;
          ellipse.stroke = item.stroke;
          ellipse.strokeWidth = item.strokeWidth;
          ellipse.strokePosition = item.strokePosition;
          ellipse.strokeJoins = item.strokeJoins;
          ellipse.strokeDashArray = item.strokeDashArray;
          ellipse.strokeDashOffset = item.strokeDashOffset;
          ellipse.shadow = item.shadow;
          ellipse.blur = item.blur;
          ellipse.translation = {
            x: item.boundsInParent.x,
            y: item.boundsInParent.y,
          };
          selection.insertionParent.addChild(ellipse);
          item.removeFromParent();
        }
      }
    });
  });
};

// 楕円のパスデータを変更する処理
const softFn = () => {
  editDocument((selection) => {

    const reSelection = selection.items.filter((item) => {
      if ( item.constructor.name === "Ellipse" || item.constructor.name === "Path" ) {
        const splitData = item.pathData.split(" ");
        if (
          splitData[3] == "C" &&
          splitData[10] == "C" &&
          splitData[17] == "C" &&
          splitData[24] == "C" &&
          splitData[31] == "Z"
        ) {
        return item;
        }
      }
    });
    selection.items = reSelection;
    commands.convertToPath();

    selection.items.forEach((item) => {
      //   [0] "m",  "mx",   "my",
      //   [3] "c1", "c1x1", "c1y1", "c1x2", "c1y2", "c1x", "c1y",
      //   [10]"c2", "c2x1", "c2y1", "c2x2", "c2y2", "c2x", "c2y",
      //   [17]"c3", "c3x1", "c3y1", "c3x2", "c3y2", "c3x", "c3y",
      //   [24]"c4", "c4x1", "c4y1", "c4x2", "c4y2", "c4x", "c4y",
      //   [31]"z"

      // パスデータを配列に格納
      const splitData = item.pathData.split(" ");
        // splitDataの値の型をNumberに変換
        for (let i = 0; i < splitData.length; i++) {
          if (!splitData[i].match(/[A-Z]/)) {
            splitData[i] = Number(splitData[i]);
          }
        }

        // 計算式
        const rateOfChange = Math.round(slider.value) * 0.01;
        const bezierCurve = (4 / 3) * (Math.sqrt(2) - 1);
        const widthPointLength = item.localBounds.width / 2 + (bezierCurve * item.localBounds.width) / 2;
        const widthPointRemainder = item.localBounds.width / 2 - (bezierCurve * item.localBounds.width) / 2;
        const heightPointLength = item.localBounds.height / 2 + (bezierCurve * item.localBounds.height) / 2;
        const heightPointRemainder = item.localBounds.height / 2 - (bezierCurve * item.localBounds.height) / 2;

        splitData[27] =
          item.localBounds.width -
          (widthPointLength + widthPointRemainder * rateOfChange);
        splitData[4] = widthPointLength + widthPointRemainder * rateOfChange;
        splitData[13] = widthPointLength + widthPointRemainder * rateOfChange;
        splitData[18] =
          item.localBounds.width -
          (widthPointLength + widthPointRemainder * rateOfChange);
        splitData[7] =
          item.localBounds.height -
          (heightPointLength + heightPointRemainder * rateOfChange);
        splitData[12] = heightPointLength + heightPointRemainder * rateOfChange;
        splitData[21] = heightPointLength + heightPointRemainder * rateOfChange;
        splitData[26] =
          item.localBounds.height -
          (heightPointLength + heightPointRemainder * rateOfChange);

        // 計算して変化させた配列を１つのパスデータにする
        const chengedData = splitData.join(" ");

        // 変化させたパスデータを代入
        item.pathData = chengedData;
    });
  });
};

const show = (event) => {
  if (!panel) event.node.appendChild(create());
};

const update = () => {
  backCulcFn();
};

module.exports = {
  panels: {
    softellipse: {
      show,
      update,
    },
  },
};
