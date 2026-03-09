# Enchant Optimizer

Static web app for finding the cheapest anvil merge order for Minecraft enchantments.
It evaluates possible combine trees in a Web Worker and returns the best step-by-step sequence.

Inspired by: https://github.com/iamcal/enchant-order

## Run Locally

No build step is required. Serve the repository root as static files, then open `index.html`.

Example:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Localization

To add or update a language:

- Create or edit `languages/<locale>.json`.
- Add the locale to the `languages` map in `script.js`.
- Add the locale to the `languages` map in `langs.html`.
- Open `langs.html` in a browser to check for missing keys.
