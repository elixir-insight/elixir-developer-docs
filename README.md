# elixir-developer-docs
Developer documentation for the ElixirPay payment gateway API. Covers authentication, hosted checkout orders, UPI intent links with QR codes, and payment webhooks, with request and response samples in cURL and Node.js.

## Development

Built with SvelteKit 3 and Svelte 5. Every page is prerendered to static HTML and deployed to Netlify with `@sveltejs/adapter-netlify` (see `netlify.toml`).

```sh
npm install
npm run dev       # http://localhost:5173
npm run check     # type-check
npm run build     # Netlify output in ./build and ./.netlify
npm run preview   # serve the build
```

## Deploying to Netlify

Import the repository in Netlify. `netlify.toml` already sets the build command (`npm run build`), the publish directory (`build`) and Node 22, so there's nothing to configure in the UI.

## Where things live

- `src/app.css`: design tokens from the Paper file, plus shared typography
- `src/lib/nav.ts`: sidebar groups and page order (also drives the Next/Previous card)
- `src/lib/api.ts`: endpoint content (fields, sample bodies, responses) for Create order and UPI intent
- `src/lib/samples.ts`: generates the cURL, Node.js, PHP, Python and Java samples from one request body
- `src/lib/snippets.ts`: hand-written code shown on Quickstart, Authentication and Webhooks
- `src/lib/components/`: layout and UI building blocks
- `src/routes/`: one folder per page
