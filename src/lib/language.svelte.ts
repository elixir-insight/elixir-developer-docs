const KEY = 'elixirpay-docs:language';

/** The code-sample language the reader picked last, shared by every tabbed block. */
export const language = $state<{ current: string | undefined }>({ current: undefined });

/** Restores the saved choice. Call after mount so server and client render the same tab first. */
export function restoreLanguage() {
	try {
		language.current = localStorage.getItem(KEY) ?? undefined;
	} catch {
		// Storage can be blocked (private mode); fall back to each block's default tab.
	}
}

export function setLanguage(value: string) {
	language.current = value;
	try {
		localStorage.setItem(KEY, value);
	} catch {
		// The choice still applies for this visit.
	}
}
