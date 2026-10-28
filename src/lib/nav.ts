import type { PageRouteId } from '$app/types';

export type Method = 'POST' | 'HOOK';

export interface NavItem {
	title: string;
	href: PageRouteId;
	method?: Method;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

export const nav: NavGroup[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Overview', href: '/' },
			{ title: 'Quickstart', href: '/quickstart' },
			{ title: 'Authentication', href: '/authentication' }
		]
	},
	{
		title: 'API reference',
		items: [
			{ title: 'Create order', href: '/api/create-order', method: 'POST' },
			{ title: 'UPI intent & QR', href: '/api/upi-intent', method: 'POST' },
			{ title: 'Payment webhooks', href: '/api/webhooks', method: 'HOOK' }
		]
	}
];

const pages = nav.flatMap((group) => group.items);

export function siblings(href: string) {
	const index = pages.findIndex((item) => item.href === href);
	return {
		previous: index > 0 ? pages[index - 1] : undefined,
		next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined
	};
}
