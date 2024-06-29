function createEventCard(event) {
    let card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
        <div class="event-card__image">
            <img src="${event.IMAGEM}" alt="${event.NAME}">
        </div>
        <div class="event-card-info">
            <div class="event-card__date">${event.DATE}</div>
            <div class="event-card__title">${event.NAME}</div>
        </div>
    `;
    return card;
}

function displayEvents(events) {
    let container = document.querySelector(".events-container");
    events.forEach((event) => {
        container.appendChild(createEventCard(event));
    });
}

// Carregar os dados da Google Sheet
const sheetId = "1SmOUrkJqCRIRqO2rInjG1gYABrouGzw8TblBPykG06E";
const sheetName = encodeURIComponent("PROXIMOS EVENTOS");
const sheetRanking = encodeURIComponent("RANKING");
const sheetEventosConcluidos = encodeURIComponent("EVENTOS");
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
const sheetURLRanking = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetRanking}`;
const sheetURLEventosConcluidos = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetEventosConcluidos}`;

fetch(sheetURL)
    .then((response) => response.text())
    .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    displayEvents(sheetObjects);
    console.log(sheetObjects);
}

function csvToObjects(csv) {
    const csvRows = csv.split("\n");
    const propertyNames = csvSplit(csvRows[0]);
    let objects = [];
    for (let i = 1, max = csvRows.length; i < max; i++) {
        let thisObject = {};
        let row = csvSplit(csvRows[i]);
        for (let j = 0, max = row.length; j < max; j++) {
            thisObject[propertyNames[j]] = row[j];
        }
        objects.push(thisObject);
    }
    return objects;
}

function csvSplit(row) {
    return row.split(",").map((val) => val.substring(1, val.length - 1));
}

// Ranking


function createRankingItem(rank) {
    let item = document.createElement("div");
    item.classList.add("ranking-item");
    item.innerHTML = `
        <a href=${rank.LINK} class="ranking-button"><i class="fas fa-trophy"></i> Ver Ranking</a>

    `;
    return item;
}

function displayRanking(rankings) {
    let container = document.querySelector(".ranking-container");
    rankings.forEach((rank) => {
        container.appendChild(createRankingItem(rank));
    });
}


fetch(sheetURLRanking)
    .then((response) => response.text())
    .then((csvText) => handleRankingResponse(csvText));

function handleRankingResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    displayRanking(sheetObjects);
    console.log(sheetObjects);
}


// Eventos Concluidos

fetch(sheetURLEventosConcluidos)
    .then((response) => response.text())
    .then((csvText) => handleEventosConcluidosResponse(csvText));

function handleEventosConcluidosResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    displayEventosConcluidos(sheetObjects);
    console.log(sheetObjects);
}

function createEventosConcluidosItem(evento) {
    let item = document.createElement("div");
    item.classList.add("event-card");
    
    let rankingButton = '';
    if (evento.RANKING) {
        rankingButton = `<a href="${evento.RANKING}" class="event-card__button">Ver Ranking da Etapa</a>`;
    }

    item.innerHTML = `
        <div class="event-card__image">
            <img src="${evento.CAPA}" alt="${evento.NOME}" class="expandable-image">
        </div>
        <div class="event-card-info">
            <div class="event-card__date">${evento.DATA}</div>
            <div class="event-card__title">${evento.NOME}</div>
            <div class="event-card__buttons">
                <a href="${evento.LINK}" class="event-card__button">Ver Fotos</a>
                ${rankingButton}
            </div>
        </div>
    `;
    return item;
}

function displayEventosConcluidos(eventos) {
    let container = document.querySelector(".eventos-concluidos-container");
    eventos.forEach((evento) => {
        container.appendChild(createEventosConcluidosItem(evento));
    });

    // Adicione evento de clique às imagens para expandi-las
    let images = document.querySelectorAll('.expandable-image');
    images.forEach((img) => {
        img.addEventListener('click', (event) => {
            let modal = document.getElementById("imageModal");
            let modalImg = document.getElementById("modalImage");
            modal.style.display = "block";
            modalImg.src = event.target.src;
        });
    });

    // Adicione evento de clique para fechar o modal
    let modal = document.getElementById("imageModal");
    let span = modal.querySelector(".fechar"); // Certifique-se de selecionar o span dentro do modal
    span.onclick = function () {
        modal.style.display = "none";
    }
}

// Também adicione uma verificação para fechar o modal ao clicar fora da imagem
window.onclick = function(event) {
    let modal = document.getElementById("imageModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
