// Ion-icons 
function loadIonicons() {
  // ESM-versionen (för moderna webbläsare) ESM = EcmaScript Module gör så att man kan importera och exportera moduler i JavaScript från externa filer
  const scriptModule = document.createElement('script'); // Skapa ett script-element
  scriptModule.type = 'module'; // Sätt typ till module för att ladda ESM-versionen, vilket gör att den kan importeras som en modul i JavaScript
  scriptModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js'; // Sätt källan till ESM-versionen av Ionicons, sourcen är en CDN-länk som pekar på den senaste versionen av Ionicons
  document.head.appendChild(scriptModule); // Lägg till script-elementet i dokumentets head för att ladda det

  // Nomodule-versionen (för äldre webbläsare)
  const scriptNoModule = document.createElement('script');
  scriptNoModule.setAttribute('nomodule', ''); // Sätt nomodule-attributet för att indikera att detta script endast ska laddas i webbläsare som inte stödjer ESM
  scriptNoModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
  document.head.appendChild(scriptNoModule); // Lägg till nomodule-versionen av Ionicons i dokumentets head, vilket säkerställer att äldre webbläsare också kan använda ikonerna
}

loadIonicons();

// Header
const header = document.createElement('header');
header.id = 'dynamic-header';
header.classList.add('header-style');
document.body.appendChild(header);

const nav = document.createElement('nav');
nav.classList.add('nav-style');

const navList = document.createElement('ul');
navList.classList.add('nav-list-style');

const navItems = ['Hem', 'Om', 'Kontakt'];
navItems.forEach(item => {
    const listItem = document.createElement('li');
    listItem.classList.add('nav-item-style');
    listItem.textContent = item;
    navList.appendChild(listItem);
});

nav.appendChild(navList);
header.appendChild(nav);

 const mainDiv = document.createElement('div');
 mainDiv.id = 'main-content';
 mainDiv.classList.add('main-div-style');
 document.body.appendChild(mainDiv);

 const topDiv = document.createElement('div');
 topDiv.id = 'top-div';
 topDiv.classList.add('top-div-style');
 mainDiv.appendChild(topDiv);

 const divBibliotek = document.createElement('div');
 divBibliotek.id = 'div-bibliotek';
 divBibliotek.classList.add('div-bibliotek-style');
 mainDiv.appendChild(divBibliotek);

 const divBooks = document.createElement('div');
 divBooks.id = 'div-books';
 divBooks.classList.add('div-books-style');
 divBibliotek.appendChild(divBooks);

 const divSongs = document.createElement('div');
 divSongs.id = 'div-songs';
 divSongs.classList.add('div-songs-style');
 divBibliotek.appendChild(divSongs);

 const divMovies = document.createElement('div');
 divMovies.id = 'div-movies';
 divMovies.classList.add('div-movies-style');
 divBibliotek.appendChild(divMovies);

function createCrudSection(options) {
  const { container, title, placeholder, addLabel, emptyLabel } = options;

  let items = [];
  let editingId = null;

  const sectionTitle = document.createElement('h2');
  sectionTitle.classList.add('crud-title-style');
  sectionTitle.textContent = title;
  container.appendChild(sectionTitle);

  const form = document.createElement('div');
  form.classList.add('crud-form-style');
  container.appendChild(form);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.classList.add('crud-input-style');
  form.appendChild(input);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.classList.add('crud-primary-button-style');
  saveButton.textContent = addLabel;
  form.appendChild(saveButton);

  const list = document.createElement('ul');
  list.classList.add('crud-list-style');
  container.appendChild(list);

  const status = document.createElement('p');
  status.classList.add('crud-status-style');
  container.appendChild(status);

  function setDefaultFormState() {
    editingId = null;
    saveButton.textContent = addLabel;
    input.value = '';
  }

  function addToTrashBin(label) {
    const trashItem = document.createElement('p');
    trashItem.classList.add('trash-item-style');
    trashItem.textContent = label;
    trashCanItems.prepend(trashItem);
  }

  function render() {
    list.replaceChildren();

    if (items.length === 0) {
      status.textContent = emptyLabel;
      return;
    }

    status.textContent = '';

    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.classList.add('crud-item-style');

      const text = document.createElement('span');
      text.classList.add('crud-item-text-style');
      text.textContent = item.text;
      listItem.appendChild(text);

      const actions = document.createElement('div');
      actions.classList.add('crud-item-actions-style');

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.classList.add('crud-secondary-button-style');
      editButton.textContent = 'Update';
      editButton.addEventListener('click', () => {
        editingId = item.id;
        input.value = item.text;
        saveButton.textContent = 'Save';
        input.focus();
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.classList.add('crud-danger-button-style');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        items = items.filter((existingItem) => existingItem.id !== item.id);
        addToTrashBin(`${title}: ${item.text}`);

        if (editingId === item.id) {
          setDefaultFormState();
        }

        render();
      });

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);
      listItem.appendChild(actions);
      list.appendChild(listItem);
    });
  }

  function upsertItem() {
    const textValue = input.value.trim();
    if (!textValue) {
      return;
    }

    if (editingId === null) {
      items.push({
        id: crypto.randomUUID(),
        text: textValue,
      });
    } else {
      items = items.map((item) => {
        if (item.id !== editingId) {
          return item;
        }

        return {
          ...item,
          text: textValue,
        };
      });
    }

    setDefaultFormState();
    render();
  }

  saveButton.addEventListener('click', upsertItem);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      upsertItem();
    }
  });

  render();
}

createCrudSection({
  container: divBooks,
  title: 'Books',
  placeholder: 'Add a book title',
  addLabel: 'Create',
  emptyLabel: 'No books yet.',
});

createCrudSection({
  container: divSongs,
  title: 'Music',
  placeholder: 'Add a song title',
  addLabel: 'Create',
  emptyLabel: 'No songs yet.',
});

createCrudSection({
  container: divMovies,
  title: 'Movies',
  placeholder: 'Add a movie title',
  addLabel: 'Create',
  emptyLabel: 'No movies yet.',
});

 const bottomDiv = document.createElement('div');
 bottomDiv.id = 'bottom-content';
 bottomDiv.classList.add('bottom-div-style');
 mainDiv.appendChild(bottomDiv);

 const trashCan = document.createElement('ion-icon');
 trashCan.setAttribute('name', 'trash-outline');
 trashCan.classList.add('trash-can-style');
 bottomDiv.appendChild(trashCan);

 const trashCanItems = document.createElement('div');
 trashCanItems.id = 'trash-can-items';
 trashCanItems.classList.add('trash-can-items-style');
 bottomDiv.appendChild(trashCanItems);

 const deleteButton = document.createElement('button');
 deleteButton.textContent = 'Rensa papperskorgen';
 deleteButton.classList.add('delete-button-style');
 bottomDiv.appendChild(deleteButton);

 function emptyTrashCan() {
   trashCanItems.replaceChildren();
 }

 deleteButton.addEventListener('click', emptyTrashCan);
// Footer 
const footer = document.createElement('footer'); 
footer.id = 'dynamic-footer';
footer.classList.add('footer-style');
const year = new Date().getFullYear();
footer.textContent = `© ${year} CRUD Applikation. Alla rättigheter förbehållna.`;
document.body.appendChild(footer);