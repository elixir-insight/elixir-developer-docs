import type { CodeTab } from '#lib/code-tab.ts';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

interface Syntax {
	indent: string;
	key: (key: string) => string;
	object: [open: string, close: string];
	literal: (value: string | number | boolean | null) => string;
}

const quote = (value: string) => JSON.stringify(value);

const json: Syntax = {
	indent: '  ',
	key: (key) => `${quote(key)}: `,
	object: ['{', '}'],
	literal: (value) => JSON.stringify(value)
};

const php: Syntax = {
	indent: '    ',
	key: (key) => `${quote(key)} => `,
	object: ['[', ']'],
	literal: (value) => (value === null ? 'null' : JSON.stringify(value))
};

const python: Syntax = {
	indent: '    ',
	key: (key) => `${quote(key)}: `,
	object: ['{', '}'],
	literal: (value) =>
		value === null ? 'None' : typeof value === 'boolean' ? (value ? 'True' : 'False') : JSON.stringify(value)
};

/** Serialises `value` in a language's literal syntax. Arrays of scalars stay on one line. */
function literal(value: Json, syntax: Syntax, depth = 0): string {
	const pad = syntax.indent.repeat(depth + 1);
	const end = syntax.indent.repeat(depth);

	if (Array.isArray(value)) {
		const items = value.map((item) => literal(item, syntax, depth + 1));
		if (value.every((item) => item === null || typeof item !== 'object')) {
			return `[${items.join(', ')}]`;
		}
		return `[\n${items.map((item) => pad + item).join(',\n')}\n${end}]`;
	}
	if (value !== null && typeof value === 'object') {
		const [open, close] = syntax.object;
		const entries = Object.entries(value).map(
			([key, item]) => pad + syntax.key(key) + literal(item, syntax, depth + 1)
		);
		return `${open}\n${entries.join(',\n')}\n${end}${close}`;
	}
	return syntax.literal(value);
}

/** Pretty JSON in the docs' style (two spaces, scalar arrays inline). */
export function toJson(value: Json) {
	return literal(value, json);
}

function indentBlock(text: string, prefix: string) {
	return text
		.split('\n')
		.map((line, i) => (i === 0 ? line : prefix + line))
		.join('\n');
}

/**
 * Request samples in every language the docs offer, for an authenticated JSON POST.
 * `path` is relative to $API_BASE_URL, which the samples read from the environment so
 * the host never appears in the docs.
 */
export function requestSamples(path: string, body: Json): CodeTab[] {
	const curl = [
		'curl -X POST \\',
		`  "$API_BASE_URL${path}" \\`,
		'  -H "Content-Type: application/json" \\',
		'  -H "X-Client-Key: $ELIXIRPAY_CLIENT_KEY" \\',
		'  -H "X-Client-Secret: $ELIXIRPAY_CLIENT_SECRET" \\',
		`  -d '${indentBlock(toJson(body), '  ')}'`
	].join('\n');

	const node = [
		`const res = await fetch(\`\${process.env.API_BASE_URL}${path}\`, {`,
		'  method: "POST",',
		'  headers: {',
		'    "Content-Type": "application/json",',
		'    "X-Client-Key": process.env.ELIXIRPAY_CLIENT_KEY,',
		'    "X-Client-Secret": process.env.ELIXIRPAY_CLIENT_SECRET',
		'  },',
		`  body: JSON.stringify(${indentBlock(toJson(body), '  ')})`,
		'});',
		'const data = await res.json();'
	].join('\n');

	const phpCode = [
		'<?php',
		`$payload = json_encode(${literal(body, php)});`,
		'',
		`$ch = curl_init(getenv("API_BASE_URL") . "${path}");`,
		'curl_setopt_array($ch, [',
		'    CURLOPT_POST => true,',
		'    CURLOPT_RETURNTRANSFER => true,',
		'    CURLOPT_HTTPHEADER => [',
		'        "Content-Type: application/json",',
		'        "X-Client-Key: " . getenv("ELIXIRPAY_CLIENT_KEY"),',
		'        "X-Client-Secret: " . getenv("ELIXIRPAY_CLIENT_SECRET"),',
		'    ],',
		'    CURLOPT_POSTFIELDS => $payload,',
		']);',
		'$data = json_decode(curl_exec($ch), true);',
		'curl_close($ch);'
	].join('\n');

	const pythonCode = [
		'import os',
		'import requests',
		'',
		'response = requests.post(',
		`    os.environ["API_BASE_URL"] + "${path}",`,
		'    headers={',
		'        "X-Client-Key": os.environ["ELIXIRPAY_CLIENT_KEY"],',
		'        "X-Client-Secret": os.environ["ELIXIRPAY_CLIENT_SECRET"],',
		'    },',
		`    json=${indentBlock(literal(body, python), '    ')},`,
		')',
		'data = response.json()'
	].join('\n');

	const java = [
		'import java.net.URI;',
		'import java.net.http.HttpClient;',
		'import java.net.http.HttpRequest;',
		'import java.net.http.HttpResponse;',
		'',
		'String body = """',
		`    ${indentBlock(toJson(body), '    ')}`,
		'    """;',
		'',
		'HttpRequest request = HttpRequest.newBuilder()',
		`    .uri(URI.create(System.getenv("API_BASE_URL") + "${path}"))`,
		'    .header("Content-Type", "application/json")',
		'    .header("X-Client-Key", System.getenv("ELIXIRPAY_CLIENT_KEY"))',
		'    .header("X-Client-Secret", System.getenv("ELIXIRPAY_CLIENT_SECRET"))',
		'    .POST(HttpRequest.BodyPublishers.ofString(body))',
		'    .build();',
		'',
		'HttpResponse<String> response = HttpClient.newHttpClient()',
		'    .send(request, HttpResponse.BodyHandlers.ofString());'
	].join('\n');

	return [
		{ label: 'cURL', code: curl },
		{ label: 'Node.js', code: node },
		{ label: 'PHP', code: phpCode },
		{ label: 'Python', code: pythonCode },
		{ label: 'Java', code: java }
	];
}
