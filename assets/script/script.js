const searchBar = document.getElementById("search");
const cardDiv = document.getElementById("meteo-list");
const cardTemplate = document.getElementById("card-template");
const myAPI = "Replace this string with your OpenWeatherMap API";

let cardCounter = 0;

function convertResponseToJSON(response) {
    return response.json();
}

function returnData(data) {
    return data;
}

function acceptInput() {
    if (searchBar.value) {
        let input = searchBar.value;
        if (cardCounter >= 1) {
            searchBar.select();
        }
        return input;
    }
}

function retrieveWeatherData(city) {
    let jsonData = fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},fr&lang=fr&appid=${myAPI}`).then(convertResponseToJSON).then(returnData);
    return jsonData;
}

function retrieveCityData(city) {
    let jsonData = fetch(`https://geo.api.gouv.fr/communes?nom=${city}&fields=departement&boost=population&limit=1`).then(convertResponseToJSON).then(returnData);
    return jsonData;
}

function displayInfo(jsonData) {
    this.children["2"].src = `http://openweathermap.org/img/wn/${jsonData.weather[0].icon}@2x.png`;
    this.children["3"].children["0"].innerHTML = jsonData.weather["0"].description[0].toUpperCase() + jsonData.weather["0"].description.slice(1);
    this.children["3"].children["1"].innerHTML = `Température: ${Math.round((jsonData.main.temp - 273.15)* 100) / 100} °C`;
    this.children["3"].children["2"].innerHTML = `Humidité: ${jsonData.main.humidity} %`;
    this.children["3"].children["3"].innerHTML = `Vent: ${jsonData.wind.speed} m/s`;
}

async function refreshCard() {
    let thisCard = this.parentElement.parentElement
    let thisCity = thisCard.getElementsByTagName("h3")[0].innerHTML;
    let weatherJson = await retrieveWeatherData(thisCity);
    thisCard.displayInfo(weatherJson);
}

function deleteCard() {
    let thisCard = this.parentElement.parentElement;
    cardDiv.removeChild(thisCard);
}

async function createCard() {
    let cityInput = acceptInput();
    if (cityInput) {
        let weatherJson =  await retrieveWeatherData(cityInput);
        let cityJson = await retrieveCityData(cityInput);
        if (weatherJson.cod !== "404" && cityJson[0] !== undefined) {
            searchBar.value = "";
            searchBar.style.color = "initial";
            let newCard = cardTemplate.cloneNode(true);
            newCard.id = "card" + cardCounter++;
            newCard.style.display = "initial";
            newCard.children[1].innerHTML = `${weatherJson.name}, ${cityJson[0].departement.nom} (${cityJson[0].departement.code})`;
            newCard.displayInfo = displayInfo;
            newCard.children[0].getElementsByClassName("refresh")[0].addEventListener("click", refreshCard);
            newCard.children[0].getElementsByClassName("close")[0].addEventListener("click", deleteCard);
            newCard.displayInfo(weatherJson);
            for (card of cardDiv.children) {
                if (card.children[1].innerHTML === newCard.children[1].innerHTML) {
                    cardDiv.replaceChild(newCard, card);
                    return;
                }
            }
            if (cardDiv.children.length > 6) {
                cardDiv.removeChild(cardDiv.lastElementChild.previousElementSibling);
            } 
            cardDiv.insertBefore(newCard, cardDiv.firstElementChild);
            return;
        } else {
            alert("Ville non trouvée.");
        }
    }
}

function alphaSort() {
    let cityNameArray = [];
    for (card of cardDiv.children) {
        if (card.id !== "card-template") {
            cityNameArray.push(card.children[1].innerHTML.split(",")[0]);
        }
    }
    cityNameArray.sort()
    for (city of cityNameArray) {
        for (card of cardDiv.children) {
            if (card.children[1].innerHTML.split(",")[0] === city) {
                cardDiv.insertBefore(card, document.getElementById("card-template"));
            }
        }
    }
}

searchBar.value = "paris";
createCard();

document.getElementById("submit").addEventListener("click", createCard);
document.getElementById("search").addEventListener("keyup", function(event) {
    if (event.code === "Enter") {
        event.preventDefault();
        document.getElementById("submit").click();
    }
});
document.getElementById("sort").addEventListener("click", alphaSort);
