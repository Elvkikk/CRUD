const API_BASE_URL = "http://127.0.0.1:3000";

async function getUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error("! kunde ej hämta användare:", error);
        return [];
    }
    
}

async function getUserById(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error(`! kunde ej hämta användare med ID ${userId}:`, error);
        return null;
    }
}


async function createUser(user) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newUser = await response.json();
        return newUser;
    } catch (error) {
        console.error("! kunde ej skapa användare:", error);
        return null;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error(`! kunde ej radera användare med ID ${userId}:`, error);
        return false;
    }
}

async function getItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const items = await response.json();
        return items;
    } catch (error) {
        console.error("! kunde ej hämta artiklar:", error);
        return [];
    }
}

async function createItem(item) {
    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newItem = await response.json();
        return newItem;
    } catch (error) {
        console.error("! kunde ej skapa artikel:", error);
        return null;
    }
}

async function updateItem(itemId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedItem = await response.json();
        return updatedItem;
    } catch (error) {
        console.error(`! kunde ej uppdatera artikel med ID ${itemId}:`, error);
        return null;
    }
}

async function deleteItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error(`! kunde ej radera artikel med ID ${itemId}:`, error);
        return false;
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        API_BASE_URL,
        getUsers,
        getUserById,
        createUser,
        deleteUser,
        getItems,
        createItem,
        updateItem,
        deleteItem
    };
}
