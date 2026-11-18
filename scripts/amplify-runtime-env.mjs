// Amplify exposes console environment variables to the build, but not to the running
// server. This runs after `npm run build` and carries them over:
//   1. writes the listed variables into build/compute/default/.env, and
//   2. makes the server load that file on start (shims.js is imported before the server
//      reads its environment). Variables already set on the process win.
// The values are never printed, so they stay out of the build log.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const NAMES = ['SANDBOX_API_BASE_URL'];
const dir = 'build/compute/default';
const shims = `${dir}/shims.js`;

if (!existsSync(shims)) {
	console.error(`${shims} not found. Run "npm run build" first.`);
	process.exit(1);
}

const lines = NAMES.filter((name) => process.env[name]).map((name) => `${name}=${process.env[name]}`);
writeFileSync(`${dir}/.env`, lines.length ? lines.join('\n') + '\n' : '');
console.log(`Runtime env: wrote ${lines.length}/${NAMES.length} variable(s) to ${dir}/.env`);

const marker = '// amplify-runtime-env';
if (!readFileSync(shims, 'utf8').includes(marker)) {
	appendFileSync(
		shims,
		`\n${marker}\nimport { fileURLToPath as __envPath } from 'node:url';\ntry { process.loadEnvFile(__envPath(new URL('./.env', import.meta.url))); } catch {}\n`
	);
}
