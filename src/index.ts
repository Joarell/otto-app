import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const ok =	['https://ottocratesovler.com', 'https://app.ottocratesovler.com', null];
		let auth: Response;

		console.log('origin', request.headers.get('origin'));
		if(ok.includes(request.headers.get('origin')))
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
