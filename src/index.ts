import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =		new URL(request.url);
		const app =		new URL('https://app.ottocratesolver.com');

		if (request.method === 'OPTIONS')
			return (await this.env.back.fetch(request));

		if (url.pathname.startsWith('/api/v1/login')) {
			const auth: Response = await this.env.back.fetch(request);
			await caches.default.put(url, auth.clone());
			return (auth);
		}
		const cookies = Object.fromEntries(request.headers).cookie;
		const headers = new Headers();

		headers.set('Cookies', `${cookies}`);

		const auth =	new Request(app, {
			method: request.method,
			headers
		});
		const checkIn: Response = await this.env.back.fetch(auth);
		const asset: Response = await this.env.ASSETS.fetch(request);
		const cache = checkIn.status === 200 && await caches.default.match(request.url);

		if(cache)
			return(await caches.default.match(request.url));
		if (checkIn.status === 200) {
			console.log('Credentials', request.headers.get('Cookie'));
			await caches.default.put(request, asset.clone());
			return(asset);
		};
		return (checkIn.status === 200 ? asset: checkIn);
	};
};
