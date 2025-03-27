import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);

		switch(url.pathname) {
			case '/:name':
				console.log(await this.env.OTTO_USERS.get('Professor'));
				return(await this.env.ASSETS.fetch(request));
			default:
				return(await this.env.back.fetch(request));
		}
	};
};
