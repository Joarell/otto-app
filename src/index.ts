import { WorkerEntrypoint } from 'cloudflare:workers';

export default class Otto extends WorkerEntrypoint {
	async fetch(request: Request) {
		const appReq = new Request('http://app.ottocratesolver.com');
		const url = new URL(request.url);
		const checkIn = url.pathname.startsWith('/api/v1/login') || url.pathname.startsWith('/');
		let backEnd

		if (checkIn) {
			backEnd = await this.env.back.fetch(request);

			console.log('HEADERS:', backEnd.headers)
			if (backEnd.ok) {
				const app = await this.env.ASSETS.fetch(appReq);
				const { headers } = backEnd;

				return(new Response(app.body, { status: app.status, headers }));
			};
		}
		return(backEnd ? backEnd: await this.env.back.fetch(request));
	};
};
