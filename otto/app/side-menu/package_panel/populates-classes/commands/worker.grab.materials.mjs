globalThis.onmessage = (type) => {
	const request	= globalThis.indexedDB.open(type.data);

	request.onerror = (event) => {
		console.log(`WARNING: ${event.target.errorCode}`);
		globalThis.postMessage(false);
	};
	request.onsuccess = (event) => {
		const db = event
		.target
		.result
		.transaction("Materials")
		.objectStore("Materials")
		.get("packing");

		db.onerror = () => {
			globalThis.postMessage(false);
		};
		db.onsuccess = () => {
			globalThis.postMessage(db.result);
		};
	};
};
