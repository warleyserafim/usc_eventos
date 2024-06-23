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
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

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
