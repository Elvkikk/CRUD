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

const title = document.createElement('h1');
title.classList.add('title-style');
title.textContent = 'CRUD Applikation';
header.appendChild(title);

// Div-container
const mainDiv = document.createElement('div');
mainDiv.id = 'main-div';
mainDiv.classList.add('main-div-style');
document.body.appendChild(mainDiv);

const upperDiv = document.createElement('div');
upperDiv.id = 'upper-div';
upperDiv.classList.add('upper-div-style');
mainDiv.appendChild(upperDiv);

const lowerDiv = document.createElement('div');
lowerDiv.id = 'lower-div';
lowerDiv.classList.add('lower-div-style');
mainDiv.appendChild(lowerDiv);

const rightDiv = document.createElement('div');
rightDiv.id = 'right-div';
rightDiv.classList.add('right-div-style');
mainDiv.appendChild(rightDiv);

const leftDiv = document.createElement('div');
leftDiv.id = 'left-div';
leftDiv.classList.add('left-div-style');
mainDiv.appendChild(leftDiv);

const centerDiv = document.createElement('div');
centerDiv.id = 'center-div';
centerDiv.classList.add('center-div-style');
mainDiv.appendChild(centerDiv);

// Footer 
const footer = document.createElement('footer'); 
footer.id = 'dynamic-footer';
footer.classList.add('footer-style');
const year = new Date().getFullYear();
footer.textContent = `© ${year} CRUD Applikation. Alla rättigheter förbehållna.`;
document.body.appendChild(footer);