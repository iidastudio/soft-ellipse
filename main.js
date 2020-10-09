const { Ellipse, Rectangle } = require("scenegraph");
const { editDocument, appLanguage } = require("application");
const commands = require("commands");
// const strings = require("./strings.json");
// const supportedLanguages = require("./manifest.json").languages;
// const uiLang = supportedLanguages.includes(appLanguage)
//     ? appLanguage
//     : supportedLanguages[0];

let panel;

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
  </style>
  <div class="container">
    <h2>Transform Value</h2>
    <label>
      <input id="numInput" class="numInput" type="number" name="numInput" min="0" max="100" step="1" value="20">
      <span class="text">%</span>
      <input id="slider" class="slider" type="range" min="0" max="100" value="20" />
    </label>
  </div>
  <button id="run">RUN</button>
  <button id="reEllipse">楕円に戻す</button>
  `;

  panel = document.createElement("div");
  panel.innerHTML = html;
  
  // slider から numInput へ数値の反映
  panel.querySelector('#slider').addEventListener("input", () => {
    const target = panel.querySelector('#numInput');
    let result = Math.round(panel.querySelector('#slider').value);
    target.value = result;
  });

  // numInput から slider へ数値の反映
  panel.querySelector('#numInput').addEventListener("input", () => {
    const thisInput = panel.querySelector('#numInput');
    const target = panel.querySelector('#slider');
    if (thisInput.value > 100) {
      thisInput.value = 100;
    } else if( thisInput.value < 0) {
      thisInput.value = 0;
    } else {
      thisInput.value = Math.round(thisInput.value);
    }
    let result = Math.round(panel.querySelector('#numInput').value);
    target.value = result;
  });

  // 実行
  panel.querySelector("#run").addEventListener("click", softFn);
  panel.querySelector("#reEllipse").addEventListener("click", reEllipse);
  // スライダーバーと数値入力で実行
  panel.querySelector("#slider").addEventListener("input", softFn);
  panel.querySelector("#numInput").addEventListener("input", softFn);
  return panel;
};

const reEllipse = () => {
  editDocument((selection) => {
    selection.items.forEach((item) => {
      const ellipse = new Ellipse();
      ellipse.name = item.name;
      ellipse.radiusX = item.localBounds.width/2;
      ellipse.radiusY = item.localBounds.height/2;
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
      ellipse.translation = { x:item.boundsInParent.x, y:item.boundsInParent.y}
      selection.insertionParent.addChild(ellipse);
      item.removeFromParent();
    });
  });
}

const softFn = () => {
  editDocument((selection) => {

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
        // splitDataの値の型をNumberに変換
        for (let i = 0; i < splitData.length; i++) {
          if (!splitData[i].match(/[A-Z]/)) {
            splitData[i] = Number(splitData[i]);
          }
        }

        
        // console.log(4/3*Math.tan(Math.PI/2/4)*item.localBounds.width/2);
        // type2 もとのパスデータの数値をmin,図形の幅をmaxとして計算
        // const rateOfChange = Math.round(panel.querySelector('#slider').value) * 0.01;
        // splitData[27] = splitData[27] - splitData[27] * rateOfChange;
        // splitData[4] =
        //   splitData[4] + (item.localBounds.width - splitData[4]) * rateOfChange;
        // splitData[13] =
        //   splitData[13] +
        //   (item.localBounds.width - splitData[13]) * rateOfChange;
        // splitData[18] = splitData[18] - splitData[18] * rateOfChange;
        // splitData[7] = splitData[7] - splitData[7] * rateOfChange;
        // splitData[12] =
        //   splitData[12] +
        //   (item.localBounds.height - splitData[12]) * rateOfChange;
        // splitData[21] =
        //   splitData[21] +
        //   (item.localBounds.height - splitData[21]) * rateOfChange;
        // splitData[26] = splitData[26] - splitData[26] * rateOfChange;

        // type1 widthを基準に計算0はハンドルが反転して変な形、0.5で菱形0.8がちょうどいいくらい
        // const rateOfChange = Math.round(panel.querySelector('#slider').value) * 0.01;
        // const leftHorizontal = item.localBounds.width - item.localBounds.width * rateOfChange;
        // const rightHorizontal = item.localBounds.width * rateOfChange;
        // const topVertical = item.localBounds.height - item.localBounds.height * rateOfChange;
        // const bottomVertical = item.localBounds.height * rateOfChange;
        // splitData[27] = leftHorizontal;
        // splitData[4] = rightHorizontal;
        // splitData[13] = rightHorizontal;
        // splitData[18] = leftHorizontal;
        // splitData[7] = topVertical;
        // splitData[12] = bottomVertical;
        // splitData[21] = bottomVertical;
        // splitData[26] = topVertical;

        
        // type3
        const rateOfChange = Math.round(panel.querySelector('#slider').value) * 0.01;
        const bezierCurve = 4/3*(Math.sqrt(2)-1);
        const widthPointLength =  item.localBounds.width/2 + bezierCurve * item.localBounds.width/2;
        const widthPointRemainder = item.localBounds.width/2 - bezierCurve * item.localBounds.width/2;
        const heightPointLength =  item.localBounds.height/2 + bezierCurve * item.localBounds.height/2;
        const heightPointRemainder = item.localBounds.height/2 - bezierCurve * item.localBounds.height/2;

        // console.log(item.localBounds.width + 4/3*(Math.sqrt(2)-1)*item.localBounds.width/2 * rateOfChange);
        splitData[27] = item.localBounds.width - (widthPointLength + widthPointRemainder * rateOfChange);
        splitData[4] =  widthPointLength + widthPointRemainder * rateOfChange;
        splitData[13] = widthPointLength + widthPointRemainder * rateOfChange;
        splitData[18] = item.localBounds.width - (widthPointLength + widthPointRemainder * rateOfChange);
        splitData[7] =  item.localBounds.height - (heightPointLength + heightPointRemainder * rateOfChange);
        splitData[12] = heightPointLength + heightPointRemainder * rateOfChange;
        splitData[21] = heightPointLength + heightPointRemainder * rateOfChange;
        splitData[26] = item.localBounds.height - (heightPointLength + heightPointRemainder * rateOfChange);

        const chengedData = splitData.join(" ");

        item.pathData = chengedData;
      }
    });
  });
};

const show = (event) => {
  if (!panel) event.node.appendChild(create());
};

module.exports = {
  panels: {
    softellipse: {
      show,
    },
  },
};
