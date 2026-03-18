// Header
const header = document.createElement('header');
header.id = 'dynamic-header';
header.classList.add('header-style');
header.textContent = 'CRUD Applikation';
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


// Footer 
const footer = document.createElement('footer'); 
footer.id = 'dynamic-footer';
footer.classList.add('footer-style');
const year = new Date().getFullYear();
footer.textContent = `© ${year} CRUD Applikation. Alla rättigheter förbehållna.`;
document.body.appendChild(footer);