export interface Patient {
	readonly name: string;
	readonly slug: string;
	readonly link: string;
	address?: string;
};

export type PatientsMap = {
	[slug: string]: Patient;
};
