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
				const { body } = await this.env.ASSETS.fetch(appReq);
				const { headers } = backEnd;

				newHeaders.append(headers);
				return(new Response(body, { status: 303, headers }));
			};
		}
		return(backEnd ? backEnd: await this.env.back.fetch(request));
	};
};
