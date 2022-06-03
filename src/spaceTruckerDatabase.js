let SpaceTruckersDb = function () {
    const scoreData = [
        { name: "AAA", score: 10000 },
        { name: "BBB", score: 7000 },
        { name: "CCC", score: 5000 },
        { name: "DDD", score: 3400 },
        { name: "EEE", score: 3000 },
        { name: "FFF", score: 2500 },
        { name: "GGG", score: 2000 },
        { name: "HHH", score: 1000 },
        { name: "III", score: 1000 },
        { name: "JBE", score: 500 },
    ];
    let indexedDbIsSupported = window.indexedDB;
    const currentSchemaVersion = 1;
    const databaseName = "SpaceTruckersDb";
    const tableName = "HighScores";
    var database;

    if (!indexedDbIsSupported) {
        console.error("Browser does not support IndexedDB yet! High Scores will not be saved.");
        return;
    }
    const { indexedDB } = window;

    let readyPromise = new Promise((resolve, reject) => {
        let openDbRequest = indexedDB.open(databaseName, currentSchemaVersion);
        openDbRequest.onerror = (error) => reject(error);
        openDbRequest.onsuccess = (event) => {
            console.log('openDb success', event);
            database = event.target.result;
            resolve(database);
        };
        openDbRequest.onupgradeneeded = (event) => {
            console.log('openDB: onUpgradeNeeded');
            database = event.currentTarget.result;
            database.onerror = handleError;
            let objectStore = event.currentTarget.result
                .createObjectStore(tableName, {
                    autoIncrement: true
                });
            objectStore.createIndex("score", "score", { unique: false });
            objectStore.transaction.oncomplete = (event) => {
                let scoreStore = database.transaction(tableName, "readwrite").objectStore(tableName);
                scoreData.forEach(scoreD => scoreStore.add(scoreD));
                console.log('finished onupgradeneeded. Added scoreData to store');
            };
        };
    });

    let retrieveScores = function (resultLimit = 100) {
        let promise = new Promise(async (resolve, reject) => {
            let txn = database.transaction(tableName, "readonly");
            let objectStore = txn.objectStore(tableName);
            let q = objectStore.getAll(null, resultLimit);
            q.onsuccess = event => {
                console.log('retrieveScores: getAllKeys - done.');
                resolve(event.target.result);
            };
            q.onerror = error => reject(error);
        });
        return promise;
    }

    function handleError(err) {
        console.error(err.target.errorCode);
    }

    function addScore(score) {
        let prom = new Promise((resolve, reject) => {
            let txn = database.transaction(tableName, "readwrite");
            let objectStore = txn.objectStore(tableName);
            objectStore.add(score);
            txn.oncomplete = (event) => {
                console.log('add score transaction completed');
                resolve(event.target.result);
            };
        });
        return prom;
    }

    return { retrieveScores, addScore, readyPromise };
};

export default SpaceTruckersDb;