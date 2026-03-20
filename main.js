const API_BASE_URL = "http://localhost:3001";
const DEFAULT_USER_ID = 1;

const flipButton = document.createElement("button");
flipButton.type = "button";
flipButton.classList.add("flip-button");
flipButton.textContent = "Show Saved Items";
document.body.appendChild(flipButton);

const mainScene = document.createElement("div");
mainScene.classList.add("main-scene");
document.body.appendChild(mainScene);

const mainDiv = document.createElement("div");
mainDiv.classList.add("main-div");
mainScene.appendChild(mainDiv);

const mainFront = document.createElement("div");
mainFront.classList.add("main-face", "main-front");
mainDiv.appendChild(mainFront);

const mainBack = document.createElement("div");
mainBack.classList.add("main-face", "main-back");
mainDiv.appendChild(mainBack);

flipButton.addEventListener("click", () => {
    const isFlipped = mainDiv.classList.toggle("is-flipped");
    flipButton.textContent = isFlipped ? "Show Forms" : "Show Saved Items";
});

function setText(element, text) {
    element.textContent = text;
}

function setStatus(statusElement, message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.toggle("is-error", isError);
}

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
    editButton.textContent = "Edit";
    actions.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("item-action-button", "delete-button");
    deleteButton.textContent = "Delete";
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
    saveButton.type = "submit";
    saveButton.classList.add("item-action-button");
    saveButton.textContent = "Update";
    editActions.appendChild(saveButton);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("item-action-button");
    cancelButton.textContent = "Cancel";
    editActions.appendChild(cancelButton);

    const itemStatus = document.createElement("p");
    itemStatus.classList.add("item-status");
    card.appendChild(itemStatus);

    function renderView(data) {
        setText(title, data.title);
        setText(creator, data.creator);
        setText(year, data.year);
        setText(description, data.description);

        editTitle.value = data.title;
        editCreator.value = data.creator;
        editYear.value = data.year;
        editDescription.value = data.description;
    }

    function showViewMode() {
        content.classList.remove("is-hidden");
        actions.classList.remove("is-hidden");
        editForm.classList.add("is-hidden");
    }

    function showEditMode() {
        content.classList.add("is-hidden");
        actions.classList.add("is-hidden");
        editForm.classList.remove("is-hidden");
        setStatus(itemStatus, "");
    }

    renderView(item);

    editButton.addEventListener("click", () => {
        showEditMode();
    });

    cancelButton.addEventListener("click", () => {
        renderView(item);
        showViewMode();
    });

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

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
            const savedItem = await requestJson(`${API_BASE_URL}/items/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title: updatedItem.title,
                    creator: updatedItem.creator,
                    year: updatedItem.year,
                    description: updatedItem.description
                })
            });

            item = savedItem;
            renderView(item);
            showViewMode();
            setStatus(itemStatus, "Updated successfully.");
        } catch (error) {
            setStatus(itemStatus, "Could not update item.", true);
        } finally {
            saveButton.disabled = false;
            cancelButton.disabled = false;
        }
    });

    deleteButton.addEventListener("click", async () => {
        deleteButton.disabled = true;
        editButton.disabled = true;
        setStatus(itemStatus, "Deleting...");

        try {
            await requestJson(`${API_BASE_URL}/items/${item.id}`, {
                method: "DELETE"
            });

            card.remove();
            section.ensureEmptyState();
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
    savedHeading.textContent = `Saved ${config.heading}`;
    savedSection.appendChild(savedHeading);

    const itemsContainer = document.createElement("div");
    itemsContainer.classList.add("items-container");
    savedSection.appendChild(itemsContainer);

    const emptyState = document.createElement("p");
    emptyState.classList.add("empty-state");
    emptyState.textContent = `No ${config.heading.toLowerCase()} saved yet.`;
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
            const savedItem = await requestJson(`${API_BASE_URL}/items`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            section.prependItem(savedItem);
            form.reset();
            setStatus(formStatus, "Saved successfully.");
        } catch (error) {
            setStatus(formStatus, "Could not save item. Start json-server and try again.", true);
        } finally {
            submitButton.disabled = false;
        }
    });

    return section;
}

const sections = [
    createMediaSection({
        heading: "Books",
        type: "book",
        buttonText: "Add Book",
        fields: [
            { key: "title", placeholder: "Book Title", type: "text" },
            { key: "creator", placeholder: "Author Name", type: "text" },
            { key: "year", placeholder: "Publication Year", type: "number" },
            { key: "description", placeholder: "Book Description", tagName: "textarea" }
        ]
    }),
    createMediaSection({
        heading: "Movies",
        type: "movie",
        buttonText: "Add Movie",
        fields: [
            { key: "title", placeholder: "Movie Title", type: "text" },
            { key: "creator", placeholder: "Director Name", type: "text" },
            { key: "year", placeholder: "Release Year", type: "number" },
            { key: "description", placeholder: "Movie Description", tagName: "textarea" }
        ]
    }),
    createMediaSection({
        heading: "Songs",
        type: "song",
        buttonText: "Add Song",
        fields: [
            { key: "title", placeholder: "Song Title", type: "text" },
            { key: "creator", placeholder: "Artist Name", type: "text" },
            { key: "year", placeholder: "Release Year", type: "number" },
            { key: "description", placeholder: "Song Description", tagName: "textarea" }
        ]
    })
];

async function loadSavedItems() {
    try {
        const items = await requestJson(`${API_BASE_URL}/items?userId=${DEFAULT_USER_ID}`);

        items.forEach((item) => {
            const section = sections.find((entry) => entry.type === item.type);

            if (section) {
                section.prependItem(item);
            }
        });
    } catch (error) {
        sections.forEach((section) => {
            section.emptyState.textContent = "Could not load saved items.";
        });
    }
}

loadSavedItems();

const footer = document.createElement("footer");
const currentYear = new Date().getFullYear();
footer.classList.add("footer");
footer.textContent = `Copyright © ${currentYear}. All rights reserved.`;
document.body.appendChild(footer);
