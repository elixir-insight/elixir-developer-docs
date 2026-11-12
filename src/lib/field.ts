export interface Field {
	name: string;
	description: string;
	type?: string;
	required?: boolean;
	/** Draw attention to this row: primary-coloured name. */
	accent?: boolean;
	/** Tint the row, e.g. fields that only this endpoint has. */
	highlight?: boolean;
	children?: Field[];
}
