globalThis.onmessage = (newList) => {
	const dataName = "Materials";
	const request = globalThis.indexedDB.open(dataName);

	request.onerror = (event) => {
		alert(`ERROR: ${event.target.errorCode}`);
	};
	request.onsuccess = async (event) => {
		const db = event.target.result;
		const object = db.transaction(dataName, "readwrite").objectStore(dataName);
		const existsInIDB = object.get(newList.data.materials);

		existsInIDB.onsuccess = async () => {
			existsInIDB.result
				? await Promise.resolve(
						object.delete(existsInIDB.result.materials),
					).then(object.add(newList.data))
				: object.add(newList.data);
			// movingDataToSesseionStorage(reference, fetched);
			globalThis.postMessage("Saved");
		};
	};
};
