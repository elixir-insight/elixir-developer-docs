# elixir-developer-docs
Developer documentation for the ElixirPay payment gateway API. Covers authentication, hosted checkout orders, UPI intent links with QR codes, and payment webhooks, with request and response samples in cURL and Node.js.

## Development

Built with SvelteKit 3 and Svelte 5, prerendered to static HTML with `@sveltejs/adapter-static`.

```sh
npm install
npm run dev       # http://localhost:5173
npm run check     # type-check
npm run build     # static site in ./build
npm run preview   # serve the build
```

## Where things live

- `src/app.css`: design tokens from the Paper file, plus shared typography
- `src/lib/nav.ts`: sidebar groups and page order (also drives the Next/Previous card)
- `src/lib/api.ts`: endpoint content (fields, sample bodies, responses) for Create order and UPI intent
- `src/lib/samples.ts`: generates the cURL, Node.js, PHP, Python and Java samples from one request body
- `src/lib/snippets.ts`: hand-written code shown on Quickstart, Authentication and Webhooks
- `src/lib/components/`: layout and UI building blocks
- `src/routes/`: one folder per page
