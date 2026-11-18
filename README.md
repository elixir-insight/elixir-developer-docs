# elixir-developer-docs
Developer documentation for the ElixirPay payment gateway API. Covers authentication, hosted checkout orders, UPI intent links with QR codes, and payment webhooks, with request and response samples in cURL and Node.js.

## Development

Built with SvelteKit 3 and Svelte 5. Every page is prerendered to static HTML and deployed to AWS Amplify Hosting with [`amplify-adapter`](https://www.npmjs.com/package/amplify-adapter) (see `amplify.yml`). `POST /api/execute` (the playground proxy) runs on Amplify's Node compute.

```sh
npm install
npm run dev       # http://localhost:5173
npm run check     # type-check
npm run test      # unit tests
npm run build     # Amplify output in ./build (static/, compute/, deploy-manifest.json)
npm run preview   # serve the build
```

Husky installs Git hooks on `npm install` (`prepare`):

- **pre-commit** — `npm run check` then `npm run test`
- **pre-push** — `npm run build`

Skip once with `HUSKY=0 git commit …` or `git commit --no-verify` when you need an emergency bypass.

## Deploying to AWS Amplify

1. In the Amplify console choose **Create new app**, connect the Git provider and pick the repository and branch.
2. Amplify picks up `amplify.yml` from the repo root (Node 22, `npm ci`, `npm run build`, artifacts from `build`). Leave the build settings as detected.
3. Under **Hosting → Environment variables**, set `SANDBOX_API_BASE_URL` (the sandbox origin, without `/api/v1`) for the playground. Without it the docs still deploy and the playground reports that the server is not configured.
4. Save and deploy.

Response headers (security headers and long-term caching for `/_app/immutable/*`) live in `customHttp.yml`.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs two jobs:

- **CI** on every pull request and push to `dev`/`main`: `npm ci`, type check, unit tests, build, and a check that the Amplify bundle (`build/deploy-manifest.json`, `build/compute/default`) was produced.
- **Deploy** on pushes to `dev`/`main`, only after CI passes: starts a build of the Amplify branch with the same name and waits until it succeeds or fails.

One-time setup:

1. In Amplify, connect `dev` and `main` as branches and **turn off auto-build** on both (App settings → Branch settings), so only CI-approved commits deploy.
2. In AWS IAM, create a role that GitHub can assume through OIDC (`token.actions.githubusercontent.com`, restricted to this repo) with `amplify:StartJob` and `amplify:GetJob` on the app.
3. In GitHub, under Settings → Secrets and variables → Actions → **Variables**, add `AMPLIFY_APP_ID`, `AWS_REGION` and `AWS_DEPLOY_ROLE_ARN`.
4. Optional: add `dev` and `main` environments (Settings → Environments) to require approval before deploying, and make the CI job a required check in branch protection.

## Where things live

- `src/app.css`: design tokens from the Paper file, plus shared typography
- `src/lib/nav.ts`: sidebar groups and page order (also drives the Next/Previous card)
- `src/lib/api.ts`: endpoint content (fields, sample bodies, responses) for Create order and UPI intent
- `src/lib/samples.ts`: generates the cURL, Node.js, PHP, Python and Java samples from one request body
- `src/lib/snippets.ts`: hand-written code shown on Quickstart, Authentication and Webhooks
- `src/lib/components/`: layout and UI building blocks
- `src/routes/`: one folder per page
