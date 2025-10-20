globalThis.onmessage = (estimate) => {
	const dataName = "Results";
	const request = globalThis.indexedDB.open(dataName);
	const { data } = estimate;

	request.onerror = (event) => {
		alert(`ERROR: ${event.target.errorCode}`);
	};
	request.onsuccess = async (event) => {
		const db = event.target.result;
		const object = db.transaction(dataName, "readwrite").objectStore(dataName);
		const existsInIDB = object.get(data.reference);

		existsInIDB.onsuccess = async () => {
			existsInIDB.result === undefined
				? object.add(data)
				: await Promise.resolve(
						object.delete(existsInIDB.result.reference),
					).then(object.add(data));
			globalThis.postMessage("OK");
		};
	};
};
