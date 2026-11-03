export type TokenType =
	| 'key'
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'comment'
	| 'keyword'
	| 'plain';

export interface Token {
	type: TokenType;
	text: string;
}

const JSON_VALUES =
	/"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b/g;

/**
 * Splits JSON text into coloured spans. Punctuation and whitespace stay `plain`, so the
 * tokens concatenate back to the exact input — the editor overlays them under a transparent
 * textarea, and any dropped character would shift the caret.
 *
 * Works on invalid JSON too, which matters while the reader is mid-edit.
 */
export function highlightJson(text: string): Token[] {
	const tokens: Token[] = [];
	let last = 0;

	for (const match of text.matchAll(JSON_VALUES)) {
		const start = match.index;
		if (start > last) tokens.push({ type: 'plain', text: text.slice(last, start) });

		const value = match[0];
		if (value.startsWith('"')) {
			// A string followed by a colon is a property name.
			const isKey = /^\s*:/.test(text.slice(start + value.length));
			tokens.push({ type: isKey ? 'key' : 'string', text: value });
		} else if (value === 'true' || value === 'false') {
			tokens.push({ type: 'boolean', text: value });
		} else if (value === 'null') {
			tokens.push({ type: 'null', text: value });
		} else {
			tokens.push({ type: 'number', text: value });
		}
		last = start + value.length;
	}

	if (last < text.length) tokens.push({ type: 'plain', text: text.slice(last) });
	return tokens;
}

const CODE_CHUNK =
	/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:const|let|var|await|async|return|import|from|new|function|class|if|else|for|while|true|false|null|None|True|False|def|package|public|private|static|void|String|System|curl|echo)\b/g;

/**
 * Lightweight VS Code–style colouring for the playground language samples (cURL, Node, PHP…).
 * Strings and keywords go green; comments muted; numbers green; everything else stays soft white.
 */
export function highlightCode(text: string): Token[] {
	const tokens: Token[] = [];
	let last = 0;

	for (const match of text.matchAll(CODE_CHUNK)) {
		const start = match.index;
		if (start > last) tokens.push({ type: 'plain', text: text.slice(last, start) });

		const value = match[0];
		if (
			value.startsWith('"') ||
			value.startsWith("'") ||
			value.startsWith('`')
		) {
			// Property names in embedded JSON / object literals: "key":
			const isKey = value.startsWith('"') && /^\s*:/.test(text.slice(start + value.length));
			tokens.push({ type: isKey ? 'key' : 'string', text: value });
		} else if (value.startsWith('//') || value.startsWith('#') || value.startsWith('/*')) {
			tokens.push({ type: 'comment', text: value });
		} else if (/^-?\d/.test(value)) {
			tokens.push({ type: 'number', text: value });
		} else if (value === 'true' || value === 'false' || value === 'True' || value === 'False') {
			tokens.push({ type: 'boolean', text: value });
		} else if (value === 'null' || value === 'None') {
			tokens.push({ type: 'null', text: value });
		} else {
			tokens.push({ type: 'keyword', text: value });
		}
		last = start + value.length;
	}

	if (last < text.length) tokens.push({ type: 'plain', text: text.slice(last) });
	return tokens;
}

export function tokensToHtml(tokens: Token[]): string {
	return tokens
		.map((token) => {
			const text = token.text
				.replaceAll('&', '&amp;')
				.replaceAll('<', '&lt;')
				.replaceAll('>', '&gt;')
				.replaceAll('"', '&quot;');
			return `<span class="tok-${token.type}">${text}</span>`;
		})
		.join('');
}
