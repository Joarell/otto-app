globalThis.onmessage = (newList) => {
	const dataName =	"Materials";
	const request =		globalThis.indexedDB.open(dataName);

	request.onerror = (event) => {
		alert(`ERROR: ${event.target.errorCode}`);
	}
	request.onsuccess = async (event) => {
		const db =			event.target.result;
		const object =		db.transaction(dataName, "readwrite")
			.objectStore(dataName);
		const existsInIDB =	object.get(materials);

		existsInIDB.onsuccess = async () => {
			await Promise.resolve(object.delete(existsInIDB.materials))
				.then(object.add(materials));
			// movingDataToSesseionStorage(reference, fetched);
		};
		// onLine ? 'ok' : addNewWorksToIndexedDBOffLine(materials);
	}
};
