const HOVER_DELAY_MS = 450;
const MAX_WORD_LEN = 40;
const MAX_SELECTION_LEN = 120;

let tooltip = null;
let hoverTimer = null;
let lastWord = "";
let lastSelection = "";
let enabled = true;
const cache = new Map();

chrome.storage.sync.get({ hoverTranslateEnabled: true }, ({ hoverTranslateEnabled }) => {
  enabled = hoverTranslateEnabled;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.hoverTranslateEnabled) {
    enabled = !!changes.hoverTranslateEnabled.newValue;
    if (!enabled) hideTooltip();
  }
});

function createTooltip() {
  const el = document.createElement("div");
  el.id = "hover-translate-tooltip";
  Object.assign(el.style, {
    position: "fixed",
    zIndex: "2147483647",
    background: "rgba(17, 24, 39, 0.96)",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.4",
    maxWidth: "260px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    pointerEvents: "none",
    display: "none"
  });
  document.documentElement.appendChild(el);
  return el;
}

function showTooltip(text, x, y) {
  if (!tooltip) tooltip = createTooltip();
  tooltip.textContent = text;
  tooltip.style.left = `${x + 14}px`;
  tooltip.style.top = `${y + 18}px`;
  tooltip.style.display = "block";
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = "none";
}

function getSelectionText() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return "";

  const text = selection.toString().replace(/\s+/g, " ").trim();
  if (!text || text.length > MAX_SELECTION_LEN) return "";
  return text;
}

function getSelectionPoint() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let rect = range.getBoundingClientRect();

  if (!rect.width && !rect.height) {
    const rects = range.getClientRects();
    if (!rects.length) return null;
    rect = rects[0];
  }

  return {
    x: rect.right,
    y: rect.top
  };
}

async function handleSelectionTranslation() {
  if (!enabled) return;

  const selectedText = getSelectionText();
  if (!selectedText) {
    lastSelection = "";
    return;
  }

  const point = getSelectionPoint();
  if (!point) return;

  if (selectedText === lastSelection && tooltip?.style.display === "block") {
    return;
  }

  lastSelection = selectedText;
  showTooltip(`Translating \"${selectedText}\"...`, point.x, point.y);

  try {
    const translated = await translateText(selectedText);
    showTooltip(`${selectedText} → ${translated}`, point.x, point.y);
  } catch {
    showTooltip(`Failed to translate: ${selectedText}`, point.x, point.y);
  }
}

function extractWordAtPoint(x, y) {
  const range = document.caretRangeFromPoint?.(x, y);
  if (!range || !range.startContainer || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  const text = range.startContainer.textContent || "";
  const offset = range.startOffset;
  if (!text || offset >= text.length) return "";

  const isLetter = (ch) => /[A-Za-z'-]/.test(ch);
  if (!isLetter(text[offset])) return "";

  let start = offset;
  let end = offset;

  while (start > 0 && isLetter(text[start - 1])) start -= 1;
  while (end < text.length && isLetter(text[end])) end += 1;

  const word = text.slice(start, end).trim();
  if (!word) return "";
  if (word.length > MAX_WORD_LEN) return "";
  if (!/[A-Za-z]/.test(word)) return "";

  return word;
}

async function translateText(word) {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const translated = data?.responseData?.translatedText?.trim();
  const output = translated || "(No translation found)";
  cache.set(key, output);
  return output;
}

document.addEventListener("mousemove", (e) => {
  if (!enabled) return;
  if (getSelectionText()) return;

  if (hoverTimer) clearTimeout(hoverTimer);

  hoverTimer = setTimeout(async () => {
    const word = extractWordAtPoint(e.clientX, e.clientY);
    if (!word) {
      lastWord = "";
      hideTooltip();
      return;
    }

    if (word === lastWord && tooltip?.style.display === "block") {
      return;
    }

    lastWord = word;
    showTooltip(`Translating "${word}"...`, e.clientX, e.clientY);

    try {
      const translated = await translateText(word);
      showTooltip(`${word} → ${translated}`, e.clientX, e.clientY);
    } catch {
      showTooltip(`Failed to translate: ${word}`, e.clientX, e.clientY);
    }
  }, HOVER_DELAY_MS);
});

document.addEventListener("mouseup", () => {
  setTimeout(handleSelectionTranslation, 0);
});

document.addEventListener("keyup", () => {
  setTimeout(handleSelectionTranslation, 0);
});

document.addEventListener("selectionchange", () => {
  if (!getSelectionText()) {
    lastSelection = "";
  }
});

document.addEventListener("scroll", hideTooltip, true);
window.addEventListener("blur", hideTooltip);
