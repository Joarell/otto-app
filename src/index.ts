import { WorkerEntrypoint } from 'cloudflare:workers';

export default class Otto extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url = new URL(request.url);
		if (url.pathname.startsWith('/api/'))
			return new Response('Hello from Otto!');
		return(await this.env.ASSETS.fetch(request));
	};

	get ottoApp() {
		return( this.fetch(new Request('http://app.ottocratesolver.com')));
	};
};
