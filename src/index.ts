import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		let auth: Response;

		switch(url.pathname) {
			case '/':
				return(await this.env.ASSETS.fetch(request));
				// auth = await this.env.back.fetch(request);
				// console.log('ROOT', await auth.text())
				// return(
				// 	await auth.text() === 'ok' ?
				// 		await this.env.ASSETS.fetch(request):
				// 		new Response('Not Found!', { status: 404 })
				// );
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
