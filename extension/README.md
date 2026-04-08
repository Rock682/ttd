# TTD Auto Fill Pro - Chrome Extension

A production-ready, privacy-first Chrome Manifest V3 extension to instantly autofill pilgrim details on the official TTD booking portal.

## Features
- **Privacy First**: All data is stored locally in your browser (`chrome.storage.local`). No cloud, no tracking.
- **Unlimited Profiles**: Save as many pilgrim profiles as you need.
- **Smart Filling**: Robust selectors that handle dynamic forms and Material UI components.
- **One-Click Action**: Fill all pilgrim details in seconds.
- **Export/Import**: Backup your profiles to a JSON file.
- **Dark Mode**: Beautiful UI that respects your system theme.

## How to Install and Test

1. **Download/Extract the Files**:
   Ensure you have the following files in a folder (e.g., `ttd-autofill-extension`):
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `popup.css`
   - `content.js`
   - `background.js`
   - `icons/` (Add your own `icon16.png`, `icon48.png`, `icon128.png`)

2. **Open Chrome Extensions Page**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in the top right corner).

3. **Load the Extension**:
   - Click the **"Load unpacked"** button.
   - Select the folder containing the extension files.

4. **Test the Extension**:
   - Click the extension icon in the toolbar to open the popup.
   - Add a few pilgrim profiles.
   - Navigate to the [TTD Booking Portal](https://ttdevasthanams.ap.gov.in).
   - Once you are on the pilgrim details entry page, open the popup and click **"Fill Current Page"**.

## How to Update Selectors (If TTD Changes the Form)

If the TTD website updates its layout and the autofill stops working, you can update the selectors in `content.js`:

1. Right-click on the input field on the TTD website and select **"Inspect"**.
2. Look for attributes like `name`, `id`, `placeholder`, or `formcontrolname`.
3. Open `content.js` and find the `fieldSelectors` object.
4. Add the new selector to the corresponding array.

Example:
```javascript
const fieldSelectors = {
  name: [
    'input[placeholder*="New Placeholder Name"]', // Add new ones here
    ...
  ],
  ...
}
```

## Technical Notes
- **Manifest V3**: Compliant with the latest Chrome extension standards.
- **MutationObserver**: Can be added to `content.js` if the form loads asynchronously after a button click.
- **Shadow DOM**: If TTD starts using Shadow DOM, use `element.shadowRoot.querySelector` to find elements.

---
Created with ❤️ for pilgrims.
