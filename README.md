# HoverTranslate EN→中文 (Chrome Extension)

A lightweight GitHub project starter for **hover-to-translate**: move your mouse over English words or directly select text on web pages to see a Chinese translation tooltip.

## Features

- Hover over English text to trigger translation
- Select (drag highlight) English text to translate immediately (no right-click needed)
- Fast in-memory cache to avoid duplicate requests
- Small floating tooltip near your cursor
- Toggle extension on/off via popup

## Project structure

- `manifest.json` – Extension metadata (Manifest V3)
- `content.js` – Hover detection, word extraction, translation, tooltip UI
- `popup.html` – Mini control panel
- `popup.js` – Persist extension enabled state

## Quick start

1. Clone this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and choose this project folder.
5. Open any English webpage and hover over words.

## Notes

- This starter uses MyMemory's free translation endpoint for simplicity.
- Free public APIs can be rate-limited.
- For production, consider replacing `translateText()` in `content.js` with your preferred API (OpenAI, Google Cloud Translate, DeepL, etc.).

## Customize

- Change source/target language in `translateText()` (`en|zh-CN`).
- Adjust hover delay via `HOVER_DELAY_MS`.
- Update tooltip styling in `createTooltip()`.

## License

MIT
