import { WorkerEntrypoint } from 'cloudflare:workers';

type Auth = { response: Response, headers: Headers };

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =			new URL(request.url);
		const authAccess =	await this.authCheck(request);
		const routes: string[] = [
			'/api/v1/boot/login',
			'/api/v1/currencies',
			'/api/v1/boot/login',
			'/api/v1/shift/tokens',
			'/api/v1/newEstimate',
			'/api/v1/logout',
			'/api/v1/estimates/:ref_id',
			'/api/v1/update/estimates'
		];

		if (request.method === 'OPTIONS')
			return (await this.env.back.fetch(request));
		else if (url.pathname.startsWith('/api/v1/login')) {
			const result: Response = await this.env.back.fetch(request);
			return (result);
		}
		else if (routes.includes(url.pathname))
			return(await this.ottoAPIRoutes(request));
		return(await this.appAssets(request, authAccess));
	};

	/**
	* @method reach the Otto API for DB queries.
	* @param request - the client content for access and cookies.
	*/
	private async ottoAPIRoutes(request: Request): Promise<Response> {
		const cookies =	Object.fromEntries(request.headers).cookie;
		const headers =	new Headers();

		headers.set('Cookies', `${cookies}`);
		const revert = request.method === "GET" ?
			this.env.back.fetch(new Request(request.url, {
				method: request.method,
				headers,
			})): this.env.back.fetch(new Request(request.url, {
				method: request.method,
				headers,
				body: request.body
			}));
		return(await revert);
	};

	/**
	* @method returns the app assets.
	* @param request - the client request assets.
	* @param auth - the user authorization for all assets
	*/
	private async appAssets(request: Request, auth: Auth): Promise<Response | undefined> {
		const asset: Response = await this.env.ASSETS.fetch(request);
		const { status } = auth.response;
		const cache = status === 200 && await caches.default.match(request.url);

		if(cache)
			return(await caches.default.match(request.url));
		if (status === 200) {
			await caches.default.put(request, asset.clone());
			return(asset);
		};
		return (status === 200 ? asset: auth.response);
	};

	/**
	* @method executes the authorization API consult.
	* @param request - it has the cookies for authorization checkout.
	*/
	private async authCheck(request: Request): Promise<Auth> {
		const app =		new URL('https://app.ottocratesolver.com');
		const cookies = Object.fromEntries(request.headers).cookie;
		const headers = new Headers();

		headers.set('Cookies', `${cookies}`);
		const auth =	new Request(app, {
			method: request.method,
			headers
		});
		const result = {
			response: await this.env.back.fetch(auth),
			headers,
		}
		return(result);
	};
};
