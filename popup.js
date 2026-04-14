const enabledCheckbox = document.getElementById("enabled");
const statusEl = document.getElementById("status");

function renderStatus(enabled) {
  statusEl.textContent = enabled ? "当前状态：已开启" : "当前状态：已关闭";
}

chrome.storage.sync.get({ hoverTranslateEnabled: true }, ({ hoverTranslateEnabled }) => {
  enabledCheckbox.checked = hoverTranslateEnabled;
  renderStatus(hoverTranslateEnabled);
});

enabledCheckbox.addEventListener("change", () => {
  const nextValue = enabledCheckbox.checked;
  chrome.storage.sync.set({ hoverTranslateEnabled: nextValue });
  renderStatus(nextValue);
});
