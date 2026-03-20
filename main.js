const API_HOST = window.location.hostname || "127.0.0.1"; // Dynamiskt API-host baserat på var sidan laddas ifrån, med fallback till localhost
const API_BASE_URL = `http://${API_HOST}:3001`;
const DEFAULT_USER_ID = 1;
const storageApi = window.localStorageApi; // Exponerar localStorage API via en global variabel för att hålla main.js mer fokuserad på UI och API-interaktion
const UI_STATE_KEY = "crud-ui-state"; // Nyckel för att spara UI-tillstånd i sessionStorage, vilket gör att vi kan bevara saker som vilken vy som är aktiv eller vilket objekt som redigeras även när sidan laddas om

// Dynamisk skapande av navbar innehållande "li" i "ul"
const navbar = document.createElement("nav");
navbar.classList.add("navbar");
document.body.appendChild(navbar);

const navbarUl = document.createElement("ul");
navbar.appendChild(navbarUl);

const navbarItems = [
    { text: "Home", href: "#" },
    { text: "About", href: "#" },
    { text: "Contact", href: "#" }
];

navbarItems.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("navbar-item");
    const a = document.createElement("a"); // Skapar länkar i navbaren baserat på navbarItems-arrayen, ej hunnit lägga till riktiga sidor
    a.textContent = item.text;
    a.href = item.href;
    li.appendChild(a);
    navbarUl.appendChild(li);
});

// Dynamisk skapande av huvudscenens struktur inklusive flip-knapp, användarpanel och två sidor för formulär och sparade objekt
const flipButton = document.createElement("button");
flipButton.type = "button";
flipButton.classList.add("flip-button");
 

const mainScene = document.createElement("div");
mainScene.classList.add("main-scene");
document.body.appendChild(mainScene);

// Skapar element för att visa användarens email och antal sparade objekt,
// som kommer att uppdateras när data laddasn från API eller local storage, 
// och visar relevant information eller felmeddelanden baserat på tillgänglig data
const userPanel = document.createElement("section");
userPanel.classList.add("user-panel");
mainScene.appendChild(userPanel);

const userInfo = document.createElement("div");
userInfo.classList.add("user-info");
userPanel.appendChild(userInfo);

const userName = document.createElement("h1");
userName.classList.add("user-name");
userName.textContent = "Hämtar användare..."; 
// Initial text som indikerar att vi försöker hämta användardata, 
// kommer att uppdateras när data är tillgänglig eller om det uppstår ett fel
userInfo.appendChild(userName);

const userEmail = document.createElement("p");
userEmail.classList.add("user-meta");
userInfo.appendChild(userEmail);

const userItemCount = document.createElement("p");
userItemCount.classList.add("user-meta");
userInfo.appendChild(userItemCount);

userPanel.appendChild(flipButton);

const mainDiv = document.createElement("div");
mainDiv.classList.add("main-div");
mainScene.appendChild(mainDiv);

const mainFront = document.createElement("div");
mainFront.classList.add("main-face", "main-front");
mainDiv.appendChild(mainFront);

const mainBack = document.createElement("div");
mainBack.classList.add("main-face", "main-back");
mainDiv.appendChild(mainBack);

// Local Storage Helper Functions
function readUiState() { // Funktion för att läsa UI-tillstånd från sessionStorage, med felhantering för att säkerställa att vi alltid får ett giltigt objekt tillbaka
    try {
        return JSON.parse(window.sessionStorage.getItem(UI_STATE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

// Funktion för att skriva uppdaterat UI-tillstånd till sessionStorage, 
// som bevarar tidigare tillstånd och bara uppdaterar de delar som ändrats
function writeUiState(updates) {
    const currentState = readUiState();
    window.sessionStorage.setItem(UI_STATE_KEY, JSON.stringify({
        ...currentState, 
        ...updates 
    }));
}

// Funktion för att applicera flip-effekten baserat på det sparade UI-tillståndet,
// som gör att vi kan bevara vilken sida som är aktiv även när sidan laddas om eller när användaren navigerar bort och tillbaka
function applyFlipState(isFlipped) {
    mainDiv.classList.toggle("is-flipped", Boolean(isFlipped));
    flipButton.textContent = isFlipped ? "Visa formulär" : "Visa sparade objekt ";
}

// Event listener för flip-knappen som växlar mellan formulär och sparade objektdet 
flipButton.addEventListener("click", () => {
    const isFlipped = !mainDiv.classList.contains("is-flipped");
    applyFlipState(isFlipped);
    writeUiState({ isFlipped });
});

applyFlipState(readUiState().isFlipped);

// Funktion för att enkelt sätta textinnehåll i ett element, som används för att uppdatera UI med relevant information eller felmeddelanden
function setText(element, text) {
    element.textContent = text;
}
// Funktion för att visa statusmeddelanden i UI, som kan användas för att ge feedback till användaren om framgång eller fel vid olika operationer
function setStatus(statusElement, message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.toggle("is-error", isError);
}

// Local Storage API Implementation
async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Funktioner för att läsa och skriva sparade objekt och nästa ID i local storage, med felhantering för att säkerställa att vi alltid får giltiga data tillbaka
async function getItems(userId) {
    try {
        const items = await requestJson(`${API_BASE_URL}/items?userId=${userId}`); // Försöker hämta sparade objekt från servern, vilket ger oss den mest uppdaterade listan över användarens objekt
        storageApi.replaceItems(items);
        return items;
    } catch (error) {
        return storageApi.getItems(userId);
    }
}


async function getUser(userId) {
    try {
        return await requestJson(`${API_BASE_URL}/users/${userId}`); // Försöker hämta användardata från servern, vilket ger oss den mest uppdaterade informationen, inklusive email som inte sparas i local storage
    } catch (error) {
        return {
            id: userId,
            name: "Offline User",
            email: "Saved in this browser only"
        };
    }
}

async function getUsers() {
    try {
        return await requestJson(`${API_BASE_URL}/users`);
    } catch (error) {
        return [];
    }
}

async function createUser(payload) {
    return requestJson(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

async function deleteUser(userId) {
    await requestJson(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE"
    });
    return true;
}

// Hämtar både användardata och sparade objekt parallellt för att optimera laddningstiden, 
// och hanterar eventuella fel individuellt för att ge bästa möjliga data även om en del av anropen misslyckas
async function getUserWithItems(userId) {
    const [user, items] = await Promise.all([getUser(userId), getItems(userId)]); 
    return { user, items };
}

function renderUserSummary(user, items) {
    setText(userName, user.name || "Okänd användare");
    setText(userEmail, user.email ? `Email: ${user.email}` : "Email: ogiltig");
    setText(userItemCount, `Saved items: ${items.length}`);
}


async function createItem(payload) {
    try {
        const savedItem = await requestJson(`${API_BASE_URL}/items`, { 
            method: "POST",
            body: JSON.stringify(payload)
        });

        const currentItems = storageApi.getItems(payload.userId);
        storageApi.replaceItems([...currentItems, savedItem]);
        return { item: savedItem, source: "server" };
    } catch (error) {
        return { item: storageApi.createItem(payload), source: "local" };
    }
}

async function updateItem(itemId, updates) {
    try {
        const savedItem = await requestJson(`${API_BASE_URL}/items/${itemId}`, {
            method: "PUT",
            body: JSON.stringify(updates)
        });

        storageApi.updateItem(itemId, savedItem);
        return { item: savedItem, source: "server" };
    } catch (error) {
        return { item: storageApi.updateItem(itemId, updates), source: "local" };
    }
}

async function deleteItem(itemId) {
    try {
        await requestJson(`${API_BASE_URL}/items/${itemId}`, {
            method: "DELETE"
        });
        storageApi.deleteItem(itemId);
        return "server";
    } catch (error) {
        storageApi.deleteItem(itemId);
        return "local";
    }
}

// Funktioner för att läsa och skriva sparade objekt och nästa ID i local storage, 
// med felhantering för att säkerställa att vi alltid får giltiga data tillbaka
function createItemCard(item, section) {
    const card = document.createElement("article");
    card.classList.add("item-card");

    const content = document.createElement("div");
    content.classList.add("item-content");
    card.appendChild(content);

    const title = document.createElement("h3");
    content.appendChild(title);

    const creator = document.createElement("p");
    creator.classList.add("item-meta");
    content.appendChild(creator);

    const year = document.createElement("p");
    year.classList.add("item-meta");
    content.appendChild(year);

    const description = document.createElement("p");
    content.appendChild(description);

    const actions = document.createElement("div");
    actions.classList.add("item-actions");
    card.appendChild(actions);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("item-action-button");
    editButton.textContent = "Redigera";
    actions.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("item-action-button", "delete-button");
    deleteButton.textContent = "Radera";
    actions.appendChild(deleteButton);

    const editForm = document.createElement("form");
    editForm.classList.add("item-edit-form", "is-hidden");
    card.appendChild(editForm);

    const editTitle = document.createElement("input");
    editTitle.type = "text";
    editTitle.required = true;
    editForm.appendChild(editTitle);

    const editCreator = document.createElement("input");
    editCreator.type = "text";
    editCreator.required = true;
    editForm.appendChild(editCreator);

    const editYear = document.createElement("input");
    editYear.type = "number";
    editYear.required = true;
    editForm.appendChild(editYear);

    const editDescription = document.createElement("textarea");
    editDescription.required = true;
    editForm.appendChild(editDescription);

    const editActions = document.createElement("div");
    editActions.classList.add("item-actions");
    editForm.appendChild(editActions);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.classList.add("item-action-button");
    saveButton.textContent = "Uppdatera";
    editActions.appendChild(saveButton);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("item-action-button");
    cancelButton.textContent = "Avbryt";
    editActions.appendChild(cancelButton);

    const itemStatus = document.createElement("p");
    itemStatus.classList.add("item-status");
    card.appendChild(itemStatus);

    function renderView(data) { // Funktion för att rendera visningsläget av kortet baserat på objektets data, som används både initialt och när vi återgår från redigeringsläget för att visa uppdaterad information
        setText(title, data.title);
        setText(creator, data.creator);
        setText(year, data.year);
        setText(description, data.description);

        editTitle.value = data.title;
        editCreator.value = data.creator;
        editYear.value = data.year;
        editDescription.value = data.description;
    }

    function showViewMode() { // Funktion för att visa visningsläget, som döljer redigeringsformuläret och visar det vanliga kortinnehållet, samt uppdaterar UI-tillståndet för att indikera att vi inte längre redigerar detta objekt
        content.classList.remove("is-hidden");
        actions.classList.remove("is-hidden");
        editForm.classList.add("is-hidden");
        const uiState = readUiState();
        if (uiState.editingItemId === item.id) {
            writeUiState({ editingItemId: null });
        }
    }
    // Funktion för att visa redigeringsläget
    function showEditMode() {
        applyFlipState(true);
        writeUiState({ isFlipped: true, editingItemId: item.id });
        content.classList.add("is-hidden");
        actions.classList.add("is-hidden");
        editForm.classList.remove("is-hidden");
        setStatus(itemStatus, "");
    }

    renderView(item); // Initial rendering av kortet med objektets data

    if (readUiState().editingItemId === item.id) {
        showEditMode();
    }

    editButton.addEventListener("click", () => { // När användaren klickar på "Redigera" knappen, växlar vi till redigeringsläget och sparar i UI-tillståndet att detta objekt är det som redigeras, vilket gör att vi kan bevara detta läge även om sidan laddas om
        showEditMode();
    });

    cancelButton.addEventListener("click", () => { // När användaren klickar på "Avbryt" knappen, återgår vi till visningsläget och renderar om kortet med den ursprungliga datan för att rulla tillbaka eventuella ändringar som gjorts i redigeringsformuläret
        showViewMode();
    });

    async function handleEditSave() {
        const updatedItem = {
            ...item,
            title: editTitle.value.trim(),
            creator: editCreator.value.trim(),
            year: Number(editYear.value),
            description: editDescription.value.trim()
        };

        saveButton.disabled = true;
        cancelButton.disabled = true;
        setStatus(itemStatus, "Updating...");

        try {
            const { item: savedItem, source } = await updateItem(item.id, {
                title: updatedItem.title,
                creator: updatedItem.creator,
                year: updatedItem.year,
                description: updatedItem.description
            });

            item = savedItem;
            renderView(item);
            showViewMode();
            setStatus(itemStatus, source === "server" ? "Uppdaterad framgångsrikt." : "Uppdaterad lokalt.");
        } catch (error) {
            setStatus(itemStatus, "Could not update item.", true);
        } finally {
            saveButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    saveButton.addEventListener("click", async () => {
        await handleEditSave();
    });

    editForm.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    deleteButton.addEventListener("click", async () => {
        deleteButton.disabled = true;
        editButton.disabled = true;
        setStatus(itemStatus, "Deleting...");

        try {
            const source = await deleteItem(item.id);

            card.remove();
            section.ensureEmptyState();
            if (source === "local") {
                setStatus(itemStatus, "Deleted locally.");
            }
        } catch (error) {
            setStatus(itemStatus, "Could not delete item.", true);
            deleteButton.disabled = false;
            editButton.disabled = false;
        }
    });

    return card;
}

function createMediaSection(config) {
    const formSection = document.createElement("div");
    formSection.classList.add("media-section");
    mainFront.appendChild(formSection);

    const formHeading = document.createElement("h2");
    formHeading.textContent = config.heading;
    formSection.appendChild(formHeading);

    const form = document.createElement("form");
    form.classList.add("media-form");
    formSection.appendChild(form);

    const inputs = config.fields.map((field) => {
        const input = document.createElement(field.tagName || "input");

        if (field.tagName !== "textarea") {
            input.type = field.type || "text";
        }

        input.placeholder = field.placeholder;
        input.required = true;
        form.appendChild(input);

        return { key: field.key, input };
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = config.buttonText;
    form.appendChild(submitButton);

    const formStatus = document.createElement("p");
    formStatus.classList.add("form-status");
    formSection.appendChild(formStatus);

    const savedSection = document.createElement("div");
    savedSection.classList.add("media-section");
    mainBack.appendChild(savedSection);

    const savedHeading = document.createElement("h2");
    savedHeading.textContent = `Sparade ${config.heading}`;
    savedSection.appendChild(savedHeading);

    const itemsContainer = document.createElement("div");
    itemsContainer.classList.add("items-container");
    savedSection.appendChild(itemsContainer);

    const emptyState = document.createElement("p");
    emptyState.classList.add("empty-state");
    emptyState.textContent = `Inget ${config.heading.toLowerCase()} sparat ännu.`;
    itemsContainer.appendChild(emptyState);

    const section = {
        type: config.type,
        itemsContainer,
        emptyState,
        ensureEmptyState() {
            if (!itemsContainer.querySelector(".item-card") && !itemsContainer.contains(emptyState)) {
                itemsContainer.appendChild(emptyState);
            }
        },
        prependItem(item) {
            if (itemsContainer.contains(emptyState)) {
                emptyState.remove();
            }

            itemsContainer.prepend(createItemCard(item, section));
        }
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = inputs.reduce((result, field) => {
            result[field.key] = field.input.value.trim();
            return result;
        }, {});

        payload.type = config.type;
        payload.userId = DEFAULT_USER_ID;
        payload.year = Number(payload.year);

        submitButton.disabled = true;
        setStatus(formStatus, "Saving...");

        try {
            const { item: savedItem, source } = await createItem(payload);

            section.prependItem(savedItem);
            form.reset();
            setStatus(formStatus, source === "server" ? "Sparat framgångsrikt." : "Sparat i local storage.");
        } catch (error) {
            setStatus(formStatus, "Ej kunnat spara.", true);
        } finally {
            submitButton.disabled = false;
        }
    });

    return section;
}

// Local Storage Helper Functions + API + Sync Logic + UI State Persistence  
const sections = [
    createMediaSection({
        heading: "Böcker",
        type: "book",
        buttonText: "Lägg till bok",
        fields: [
            { key: "title", placeholder: "Boktitel", type: "text" },
            { key: "creator", placeholder: "Författarnamn", type: "text" },
            { key: "year", placeholder: "Utgivningsår", type: "number" },
            { key: "description", placeholder: "Bokbeskrivning", tagName: "textarea" }
        ]
    }),
    createMediaSection({
        heading: "Filmer",
        type: "movie",
        buttonText: "Lägg till film",
        fields: [
            { key: "title", placeholder: "Filmtitel", type: "text" },
            { key: "creator", placeholder: "Regissör", type: "text" },
            { key: "year", placeholder: "Utgivningsår", type: "number" },
            { key: "description", placeholder: "Filmbeskrivning", tagName: "textarea" }
        ]
    }),
    createMediaSection({
        heading: "Låtar",
        type: "song",
        buttonText: "Lägg till låt",
        fields: [
            { key: "title", placeholder: "Låttitel", type: "text" },
            { key: "creator", placeholder: "Artistnamn", type: "text" },
            { key: "year", placeholder: "Utgivningsår", type: "number" },
            { key: "description", placeholder: "Låtbeskrivning", tagName: "textarea" }
        ]
    })
];

// Local Storage API Implementation
async function loadSavedItems() {
    try {
        const { user, items } = await getUserWithItems(DEFAULT_USER_ID);
        renderUserSummary(user, items);

        items.forEach((item) => {
            const section = sections.find((entry) => entry.type === item.type);

            if (section) {
                section.prependItem(item);
            }
        });
    } catch (error) {
        setText(userName, "Kunde inte ladda användare");
        setText(userEmail, "");
        setText(userItemCount, "");
        sections.forEach((section) => {
            section.emptyState.textContent = "Kunde inte ladda sparade objekt.";
        });
    }
}

loadSavedItems();

// Exponerar enkla hjälpfunktioner för webbkonsolen.
// Exempel: await crud.getUser(1), await crud.getUsers(), await crud.createUser({...})
window.crud = {
    apiBaseUrl: API_BASE_URL,
    defaultUserId: DEFAULT_USER_ID,
    getUsers,
    getUser,
    getUserById: getUser,
    createUser,
    deleteUser,
    getItems,
    getUserWithItems,
    createItem,
    updateItem,
    deleteItem,
    reload: loadSavedItems
};

// Kör några testanrop i webbkonsolen för att verifiera att allt fungerar som det ska
// await crud.getUsers()
// await crud.getUser(1)
// await crud.getUserWithItems(1)
// await crud.createUser({ id: "2", name: "Anna", email: "anna@example.com" })
// await crud.deleteUser("2")
// await crud.reload()

const footer = document.createElement("footer");
const currentYear = new Date().getFullYear();
footer.classList.add("footer");
footer.textContent = `Copyright © ${currentYear}. CRUD applikation. Alla rättigheter förbehållna.`;
document.body.appendChild(footer);
