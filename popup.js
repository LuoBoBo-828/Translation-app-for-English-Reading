const enabledCheckbox = document.getElementById("enabled");

chrome.storage.sync.get({ hoverTranslateEnabled: true }, ({ hoverTranslateEnabled }) => {
  enabledCheckbox.checked = hoverTranslateEnabled;
});

enabledCheckbox.addEventListener("change", () => {
  chrome.storage.sync.set({ hoverTranslateEnabled: enabledCheckbox.checked });
});
