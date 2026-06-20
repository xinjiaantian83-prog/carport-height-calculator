const tools = {
  flatCarportHeight: {
    id: "flatCarportHeight",
    label: "フラットタイプカーポート 高さ計算機",
    calculate({ spanMm, slopeDeg }) {
      if (spanMm <= 0 || slopeDeg < 0) {
        return {
          dropMm: null,
          rawDropMm: null
        };
      }

      const radians = slopeDeg * Math.PI / 180;
      const rawDropMm = Math.tan(radians) * spanMm;
      return {
        dropMm: Math.round(rawDropMm),
        rawDropMm
      };
    }
  }
};

const els = {
  spanMm: document.getElementById("spanMm"),
  slopeDeg: document.getElementById("slopeDeg"),
  dropMm: document.getElementById("dropMm"),
  resultPanel: document.querySelector(".result-panel"),
  summarySlope: document.getElementById("summarySlope"),
  summarySpan: document.getElementById("summarySpan"),
  spanLabel: document.getElementById("spanLabel"),
  dropLabel: document.getElementById("dropLabel"),
  highPost: document.getElementById("highPost"),
  lowPost: document.getElementById("lowPost"),
  roofLine: document.getElementById("roofLine"),
  spanLine: document.getElementById("spanLine"),
  spanLeftTick: document.getElementById("spanLeftTick"),
  spanRightTick: document.getElementById("spanRightTick"),
  dropTopGuide: document.getElementById("dropTopGuide"),
  dropBottomGuide: document.getElementById("dropBottomGuide"),
  dropLine: document.getElementById("dropLine"),
  dropTopTick: document.getElementById("dropTopTick"),
  dropBottomTick: document.getElementById("dropBottomTick")
};

function readNumber(input) {
  const value = Number.parseFloat(input.value);
  return Number.isFinite(value) ? value : 0;
}

function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  });
}

function formatSlope(value) {
  return `${formatNumber(value, value % 1 === 0 ? 0 : 1)}°`;
}

function formatMm(value) {
  return `${formatNumber(value)}mm`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function svgNumber(value) {
  return Number(value.toFixed(2)).toString();
}

function setSvgLine(line, x1, y1, x2, y2) {
  line.setAttribute("x1", svgNumber(x1));
  line.setAttribute("y1", svgNumber(y1));
  line.setAttribute("x2", svgNumber(x2));
  line.setAttribute("y2", svgNumber(y2));
}

function setSvgText(text, x, y) {
  text.setAttribute("x", svgNumber(x));
  text.setAttribute("y", svgNumber(y));
}

function setDropLabel(x, y, dropMm) {
  els.dropLabel.setAttribute("x", svgNumber(x));
  els.dropLabel.setAttribute("y", svgNumber(y));
  els.dropLabel.textContent = "";

  const title = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
  title.setAttribute("x", svgNumber(x));
  title.textContent = "柱間高低差";

  const value = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
  value.setAttribute("x", svgNumber(x));
  value.setAttribute("dy", "13");
  value.textContent = dropMm === null ? "--mm" : formatMm(dropMm);

  els.dropLabel.append(title, value);
}

function updateDiagram(spanMm, slopeDeg, dropMm) {
  const drawingSpan = spanMm > 0 ? spanMm : 2900;
  const drawingDrop = dropMm === null ? 203 : dropMm;
  const spanRatio = clamp((drawingSpan - 2500) / 3500, 0, 1);
  const postDistance = 154 + spanRatio * 64;
  const lowX = 195 - postDistance / 2;
  const highX = 195 + postDistance / 2;
  const roofOverhang = postDistance * (1100 / 2900);
  const roofLowX = Math.max(4, lowX - roofOverhang);
  const roofHighX = Math.min(386, highX + roofOverhang);
  const groundY = 156;
  const postBottomY = groundY + 24;
  const spanY = postBottomY + 12;
  const highY = 44;
  const visualDrop = clamp(drawingDrop / 8, 14, 78);
  const lowRoofY = highY + visualDrop;
  const roofYAt = (x) => lowRoofY + ((highY - lowRoofY) * (x - roofLowX)) / (roofHighX - roofLowX);
  const lowPostTop = roofYAt(lowX);
  const highPostTop = roofYAt(highX);
  const dimX = Math.min(362, highX + 38);
  const tickLeftX = dimX - 12;
  const tickRightX = Math.min(372, dimX + 12);
  const guideStartTopX = Math.min(roofHighX, highX + 6);
  const guideStartBottomX = Math.max(roofLowX, lowX - 6);

  setSvgLine(els.roofLine, roofLowX, lowRoofY, roofHighX, highY);
  setSvgLine(els.lowPost, lowX, lowPostTop, lowX, postBottomY);
  setSvgLine(els.highPost, highX, highPostTop, highX, postBottomY);

  setSvgLine(els.spanLine, lowX, spanY, highX, spanY);
  setSvgLine(els.spanLeftTick, lowX, spanY - 7, lowX, spanY + 7);
  setSvgLine(els.spanRightTick, highX, spanY - 7, highX, spanY + 7);
  setSvgText(els.spanLabel, 195, spanY + 17);

  setSvgLine(els.dropTopGuide, guideStartTopX, highY, dimX, highY);
  setSvgLine(els.dropBottomGuide, guideStartBottomX, lowRoofY, dimX, lowRoofY);
  setSvgLine(els.dropLine, dimX, highY, dimX, lowRoofY);
  setSvgLine(els.dropTopTick, tickLeftX, highY, tickRightX, highY);
  setSvgLine(els.dropBottomTick, tickLeftX, lowRoofY, tickRightX, lowRoofY);

  const dropLabelY = highY + ((lowRoofY - highY) / 2) - 6;
  setDropLabel(Math.min(dimX + 8, 370), dropLabelY, dropMm);
  els.spanLabel.textContent = spanMm > 0 ? `柱間寸法 ${formatMm(spanMm)}` : "柱間寸法 --mm";
}

function update() {
  const spanMm = readNumber(els.spanMm);
  const slopeDeg = readNumber(els.slopeDeg);
  const result = tools.flatCarportHeight.calculate({ spanMm, slopeDeg });
  const hasResult = result.dropMm !== null;

  els.resultPanel.classList.toggle("is-empty", !hasResult);
  els.dropMm.textContent = hasResult ? formatNumber(result.dropMm) : "--";
  els.summarySlope.textContent = formatSlope(slopeDeg);
  els.summarySpan.textContent = spanMm > 0 ? formatMm(spanMm) : "--mm";

  updateDiagram(spanMm, slopeDeg, result.dropMm);
}

[els.spanMm, els.slopeDeg].forEach((input) => {
  input.addEventListener("input", update);
});

update();
