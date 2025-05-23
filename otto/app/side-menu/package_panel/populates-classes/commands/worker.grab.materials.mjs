globalThis.onmessage = () => {
	const dataName	= "Materials";
	const request	= globalThis.indexedDB.open(dataName);

	request.onerror = (event) => {
		console.log(`WARNING: ${event.target.errorCode}`);
	};
	request.onsuccess = () => {
		const db = request
		.result
		.transaction("Results")
		.objectStore("Results")
		.get("materials");

		db.onerror = () => {
			globalThis.postMessage(false);
		}
		db.onsuccess = () => {
			globalThis.postMessage(db.result);
		};
	};
};
