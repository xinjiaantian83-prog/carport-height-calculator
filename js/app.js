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
  lowPost: document.getElementById("lowPost"),
  roofLine: document.getElementById("roofLine"),
  roofUnderLine: document.getElementById("roofUnderLine"),
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

function setSvgLine(line, x1, y1, x2, y2) {
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
}

function updateDiagram(spanMm, slopeDeg, dropMm) {
  const highY = 72;
  const minLowY = 92;
  const maxLowY = 142;
  const visualDrop = dropMm === null ? 38 : Math.min(Math.max(dropMm / 5, 20), maxLowY - highY);
  const lowRoofY = Math.min(highY + visualDrop, maxLowY);
  const lowPostTop = lowRoofY + 10;

  setSvgLine(els.roofLine, 70, highY, 320, lowRoofY);
  setSvgLine(els.roofUnderLine, 76, highY + 16, 314, lowRoofY + 14);
  setSvgLine(els.lowPost, 298, Math.max(lowPostTop, minLowY), 298, 216);
  setSvgLine(els.dropLine, 340, highY + 10, 340, lowRoofY + 8);
  setSvgLine(els.dropTopTick, 326, highY + 10, 354, highY + 10);
  setSvgLine(els.dropBottomTick, 326, lowRoofY + 8, 354, lowRoofY + 8);

  const dropLabelY = highY + ((lowRoofY - highY) / 2) + 14;
  els.dropLabel.setAttribute("y", Math.round(dropLabelY));
  els.dropLabel.textContent = dropMm === null ? "柱間高低差 --mm" : `柱間高低差 ${formatMm(dropMm)}`;
  els.spanLabel.textContent = spanMm > 0 ? `柱間寸法 ${formatMm(spanMm)}` : "柱間寸法 --mm";

  if (slopeDeg > 8) {
    els.dropLabel.setAttribute("x", "334");
  } else {
    els.dropLabel.setAttribute("x", "338");
  }
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
