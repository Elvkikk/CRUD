const crudContainer = document.getElementById('container');
const 
// footer 
const footer = document.createElement('footer'); 
const year = new Date().getFullYear();
footer.textContent = `© ${year} CRUD Applikation. Alla rättigheter förbehållna.`;
document.body.appendChild(footer);