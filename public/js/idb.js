const indexedDB = window.indexedDB

let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

request.onerror = function (event) {
    console.log(event.target.errorCode);
}

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    store.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then((serverResponse) => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const store = transaction.objectStore('new_transaction');
                    store.clear();

                    alert('All transactions that were saved have been submitted.')
                })
                .catch(err => {
                    console.log(err)
                })
            //taking data in db and deleting/clearing it out
        }
    }
}

window.addEventListener('online', uploadTransaction);