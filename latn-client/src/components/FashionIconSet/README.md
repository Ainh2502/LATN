# FashionIconSet (LATN)

A lightweight, license-safe fashion icon pack (15 SVGs) + React component.
Place the `FashionIconSet` folder into your `src/components/` (or anywhere) and import.

## Install
No npm packages required. SVGs are bundled by Vite / CRA automatically.

## Usage
```tsx
import FashionIconSet from "@/components/FashionIconSet";

<FashionIconSet name="Giày sneaker" size={40} />
<FashionIconSet name="Áo thun" />
```

## Mapping
Edit `mapping.json` to add/adjust category → icon file mapping.

## Files
- `index.tsx` — React wrapper that auto-selects icon by category name
- `mapping.json` — VN names → svg filename
- `assets/icons/fashion/*.svg` — 15 minimalist icons
