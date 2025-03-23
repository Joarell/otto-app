import { WorkerEntrypoint } from 'cloudflare:workers';

export default class Otto extends WorkerEntrypoint {
	async fetch(request: Request) {
		const appReq = new Request('http://app.ottocratesolver.com');
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/v1/login')) {
			const backEnd = await this.env.back.fetch(request);

			if (backEnd.ok) {
				const app = await this.env.ASSETS.fetch(appReq);
				return(new Response(app.body, { status: app.status, headers: backEnd.headers }));
			};
		};
		return(await this.env.back.fetch(request));
	};
};
