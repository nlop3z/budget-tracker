const indexedDB = window.indexedDB

let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', {autoIncrement: true});
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.onLine) {
        uploadTransaction();
    }
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    const getAll = store.getAll();

getAll.onsuccess = function() {
    if(getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(() => {
            const transaction = db.transaction(['new_transaction'], 'readwrite');
            const store = transaction.objectStore('new_transaction');
            store.clear()
        })
        //taking data in db and deleting/clearing it out
    }
}
}

