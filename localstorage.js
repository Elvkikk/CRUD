const STORAGE_ITEMS_KEY = "crud-items";
const STORAGE_NEXT_ID_KEY = "crud-next-id";

function readStoredItems() {
    const rawItems = window.localStorage.getItem(STORAGE_ITEMS_KEY);

    if (!rawItems) {
        return [];
    }

    try {
        return JSON.parse(rawItems);
    } catch (error) {
        return [];
    }
}

function writeStoredItems(items) {
    window.localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
}

function readNextId() {
    const rawNextId = Number(window.localStorage.getItem(STORAGE_NEXT_ID_KEY));
    return Number.isInteger(rawNextId) && rawNextId > 0 ? rawNextId : 1;
}

function writeNextId(nextId) {
    window.localStorage.setItem(STORAGE_NEXT_ID_KEY, String(nextId));
}

function syncNextId(items) {
    const highestId = items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0);
    writeNextId(highestId + 1);
}

window.localStorageApi = {
    getItems(userId) {
        return readStoredItems().filter((item) => item.userId === userId);
    },
    replaceItems(items) {
        writeStoredItems(items);
        syncNextId(items);
        return items;
    },
    createItem(item) {
        const items = readStoredItems();
        const nextId = readNextId();
        const savedItem = { ...item, id: nextId };

        items.push(savedItem);
        writeStoredItems(items);
        writeNextId(nextId + 1);

        return savedItem;
    },
    updateItem(itemId, updates) {
        const items = readStoredItems();
        const itemIndex = items.findIndex((item) => item.id === itemId);

        if (itemIndex === -1) {
            throw new Error("Ej sparat i local storage."); // Demonstrerar att vi inte kan uppdatera ett objekt som inte finns i local storage
        }

        items[itemIndex] = {
            ...items[itemIndex],
            ...updates
        };

        writeStoredItems(items);
        return items[itemIndex];
    },
    deleteItem(itemId) {
        const items = readStoredItems();
        const nextItems = items.filter((item) => item.id !== itemId);
        writeStoredItems(nextItems);
    }
};
