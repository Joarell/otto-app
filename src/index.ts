import { WorkerEntrypoint } from 'cloudflare:workers';

export default class Otto extends WorkerEntrypoint {
	async fetch(request: Request) {
		const appReq = new Request('http://app.ottocratesolver.com');
		const url = new URL(request.url);
		const checkIn = url.pathname.startsWith('/api/v1/login') || url.pathname.startsWith('/');
		let backEnd

		if (checkIn) {
			backEnd = await this.env.back.fetch(request);

			console.log('HEADERS:')
			if (backEnd.ok) {
				const app = await this.env.ASSETS.fetch(appReq);
				return(new Response(
					"https://app.ottocratesolver.com",
					{ status: app.status, headers: backEnd.headers }
				));
			};
		}
		return(backEnd ? backEnd: await this.env.back.fetch(request));
	};
};
