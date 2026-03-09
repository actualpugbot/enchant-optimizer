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

## Language

The app is English-only. UI strings are sourced from `languages/en.json`.
