interface Env {
	ASSETS: Fetcher;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case '/':
				return (new Response("Hi From Otto!"));
			default :
				return (new Response('Not found!', {status : 404}));
		};
	},
} satisfies ExportedHandler<Env>;
