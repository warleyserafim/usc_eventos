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
    .then((csvText) => handleResponse(csvText))
    .catch((error) => console.error('Error fetching sheetURL:', error));

function handleResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    if (sheetObjects) {
        displayEvents(sheetObjects);
        checkForEventThisWeek(sheetObjects);
    } else {
        console.error('Error converting CSV to objects.');
    }
    console.log('Sheet Objects:', sheetObjects);
}

function csvToObjects(csv) {
    const csvRows = csv.split("\n");
    if (csvRows.length < 2) {
        console.error('CSV does not have enough rows.');
        return null;
    }
    const propertyNames = csvSplit(csvRows[0]);
    let objects = [];
    for (let i = 1, max = csvRows.length; i < max; i++) {
        let thisObject = {};
        let row = csvSplit(csvRows[i]);
        if (row.length !== propertyNames.length) {
            console.error('Row length does not match property names length:', row, propertyNames);
            continue;
        }
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

// Função para analisar a data no formato "DD/MM/YYYY HH:MM:SS"
function parseDate(dateString) {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1] ? parts[1].split(':') : [0, 0, 0]; // Se a hora não for fornecida, definir como meia-noite
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
}

// Função para verificar eventos desta semana
function checkForEventThisWeek(events) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    console.log('Start of week:', startOfWeek, 'End of week:', endOfWeek);

    let weeklyEventFound = false;

    events.forEach((event) => {
        if (!event || !event.DATE) {
            console.error('Event or event date is undefined:', event);
            return;
        }
        let eventDate = parseDate(event.DATE);
        console.log('Checking event date:', eventDate);
        if (eventDate >= startOfWeek && eventDate <= endOfWeek && !weeklyEventFound) {
            weeklyEventFound = true;
            showEventPopup(event);  // Exibe o popup da semana

            // Aguarda o fechamento do popup da semana antes de mostrar o da final
            let closePopup = document.querySelector("#eventPopup .close-popup");
            closePopup.onclick = function () {
                document.getElementById("eventPopup").classList.remove("show");
                setTimeout(() => {
                    setTimeout(() => {
                        showFinalPopup(); // Exibe o popup da final após 1 minuto do fechamento
                    }, 500); // 1 minuto
                }, 500); // Tempo de transição para fechar o popup
            };
        }
    });

    // Se não houver evento da semana, mostra o popup da final direto após 1 minuto
    if (!weeklyEventFound) {
        setTimeout(() => {
            showFinalPopup();
        }, 500);
    }
}

// Função para mostrar o popup do evento
function showEventPopup(event) {
    console.log('Showing event popup for event:', event);
    let popup = document.getElementById("eventPopup");
    let popupImg = document.getElementById("popupImage");
    let popupText = document.getElementById("popupText");

    popupImg.src = event.IMAGEM;
    popupText.innerHTML = `<h3>Venha curtir nosso próximo evento: ${event.NAME} no dia ${event.DATE}</h3>`;

    popup.classList.add("show");

    // Close the popup when the close button is clicked
    let closePopup = popup.querySelector(".close-popup");
    closePopup.onclick = function () {
        popup.classList.remove("show");
        setTimeout(() => {
            popup.style.display = "none";
        }, 500); // Match this duration with the CSS transition duration
    }
}

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
    .then((csvText) => handleRankingResponse(csvText))
    .catch((error) => console.error('Error fetching sheetURLRanking:', error));

function handleRankingResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    if (sheetObjects) {
        displayRanking(sheetObjects);
    } else {
        console.error('Error converting CSV to objects.');
    }
    console.log('Sheet Objects:', sheetObjects);
}

// Eventos Concluidos

fetch(sheetURLEventosConcluidos)
    .then((response) => response.text())
    .then((csvText) => handleEventosConcluidosResponse(csvText))
    .catch((error) => console.error('Error fetching sheetURLEventosConcluidos:', error));

function handleEventosConcluidosResponse(csvText) {
    let sheetObjects = csvToObjects(csvText);
    if (sheetObjects) {
        displayEventosConcluidos(sheetObjects);
    } else {
        console.error('Error converting CSV to objects.');
    }
    console.log('Sheet Objects:', sheetObjects);
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


// Funcao para fechar popup ao clicar fora

window.onclick = function(event) {
    let popup = document.getElementById("eventPopup");
    if (event.target == popup) {
        popup.style.display = "none";
    }
}


var acc = document.getElementsByClassName("accordion");

for (var i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    // Fecha todas as seções abertas
    for (var j = 0; j < acc.length; j++) {
      if (acc[j] !== this) {
        acc[j].classList.remove("active");
        var panel = acc[j].nextElementSibling;
        panel.style.display = "none";
      }
    }

    // Abre ou fecha a seção clicada
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}


function showFinalPopup() {
    console.log('Showing final event popup for event:', );
    let popup = document.getElementById("eventPopup");
    let popupImg = document.getElementById("popupImage");
    let popupText = document.getElementById("popupText");

    popupImg.src = 'https://i.ibb.co/C63NBzM/Whats-App-Image-2024-11-01-at-14-00-49-2.jpg'
    popupText.innerHTML = `<h2>🏆 Não perca a grande final: FINAL USC - AVARE - SP </h2>
                           <p>Prepare-se para um evento incrível!</p>`;

    // Exibe o popup da final com destaque
    popup.classList.add("show", "final-popup");

    // Fecha o popup ao clicar no botão de fechamento
    let closePopup = popup.querySelector(".close-popup");
    closePopup.onclick = function () {
        popup.classList.remove("show", "final-popup");
        setTimeout(() => {
            popup.style.display = "none";
        }, 60000); // Match this duration with the CSS transition duration
    }
}


