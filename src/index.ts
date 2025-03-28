import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const ok =	['https://app.ottocratesolver.com', null];
		const origin = ok.includes(request.headers.get('origin'));
		const access = request.method === 'GET' && origin;
		let auth: Response;

		if(request.method === 'OPTIONS')
			return(await this.env.back.fetch(request));
		switch(url.pathname) {
			case '/':
				auth =		await this.env.back.fetch(request);
				if (auth.ok) {
					const APP = await this.env.ASSETS.fetch(request);
					const newHeaders = new Headers(APP.headers)

					newHeaders.set('Access-Control-Allow-Origin', 'https://ottocratesolver.com')
					newHeaders.set('Vary', `Accept-Language`);
					newHeaders.set('content-type', 'text/html; charset=utf-8');
					newHeaders.append('content-type', 'text/css; charset=utf-8');
					newHeaders.append('content-type', 'text/javascript; charset=utf-8');
					newHeaders.set('cache-control', 'max-age=28800, proxy-revalidate, immutable');
					return(
						new Response(APP.body, { status: 200, headers: newHeaders })
					);
				}
				return(new Response('Not Found!', { status: 404 }));
			case '/:name':
				auth = await this.env.back.fetch(request);
				const checkIn = await this.env.OTTO_USERS.get(await auth.text());
				console.log('APP', checkIn);
				return(
					checkInmsg === 'ok' && checkIn !== null ?
						await this.env.ASSETS.fetch(request): auth
				);
			default:
				return(await this.env.back.fetch(request));
		};
	};
};
