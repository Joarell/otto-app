import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const ok =	['https://ottocratesolver.com', 'https://app.ottocratesolver.com', null];
		const origin = ok.includes(request.headers.get('origin'));
		const access = request.method === 'GET' && origin;
		let auth: Response;

		// console.log('origin', request.headers.get('origin'));
		if(access)
			return(await this.env.ASSETS.fetch(request));
		switch(url.pathname) {
			case '/':
				auth =		await this.env.back.fetch(request);
				const msg = await auth.text();
				console.log('ROOT', msg);
				return(
					msg === 'ok' ? await this.env.ASSETS.fetch(request):
						new Response('Not Found!', { status: 404 })
				);
			case '/:name':
				auth = await this.env.back.fetch(request);
				const checkIn = await this.env.OTTO_USERS.get(await auth.text());
				console.log('APP', checkIn);
				return(
					checkIn && checkIn !== null ?
						await this.env.ASSETS.fetch(request): auth
				);
			default:
				return(await this.env.back.fetch(request));
		};
	};
};
