// GET MULTI-SELECT OPTIONS //
// Load the radio data from radio.json
fetch('/static/radio/radio.json')
    .then(response => response.json())
    .then(data => {
        let optionsSet = {};
        data.forEach(item => {
        optionsSet[item.genre] = item.name;
        });

        let options = [`<option value="custom">Wladradchenko</option>`];
        for (let genre in optionsSet) {
            options.push(`<option value="${genre}">${optionsSet[genre]}</option>`);
        }

        let multiSelect = document.querySelector('#name-filter');
        let rangeSelect = document.createRange();
        let fragmentSelect = rangeSelect.createContextualFragment(options.join('\n'));
        multiSelect.appendChild(fragmentSelect);
    })
    .catch(error => {
        console.error('Error fetching radio data:', error);
    });
// GET MULTI-SELECT OPTIONS //


// SET START EVENT LISTENER ON DEFAULT //
let source = new EventSource("/events");
source.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var namesList = document.getElementById("names-list");
    // Remove the first item
    // Remove all existing items
    while (namesList.firstChild) {
        namesList.removeChild(namesList.firstChild);
    }
    // Add a new random name to the end
    var newItem = document.createElement("li");
    // Add a new item for each key-value pair
    for (var genreItem in data.name) {
        var newGenre = document.createAttribute(genreItem);
        newGenre.value = data.name[genreItem];
        newItem.setAttributeNode(newGenre);
    }
    var newVoice = document.createAttribute("voice");
    newVoice.value = JSON.stringify(data.voice);
    newItem.setAttributeNode(newVoice);
    namesList.appendChild(newItem);
}
// SET START EVENT LISTENER ON DEFAULT //


// GET RANDOM BACKGROUND //
fetch('/static/assets/')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const backgroundNames= Array.from(doc.querySelectorAll('a'))
            .map(link => '/static/assets/' + link.textContent.trim());

        let backgroundImg = backgroundNames[Math.floor(Math.random() * backgroundNames.length)];
        // Get the img element
        const imgElement = document.querySelector('.background-img');

        // Get the src attribute value
        imgElement.src = `${backgroundImg}`;
        setInterval(() => {
            backgroundImg = backgroundNames[Math.floor(Math.random() * backgroundNames.length)];
            imgElement.src = `${backgroundImg}`;
        }, 60000); // update background every minute (60000 milliseconds)

        // Listen for changes to the imgElement.src property
        imgElement.addEventListener('load', () => {
            setMediaMetadata(null);
        });
    })
    .catch(error => console.error(error));
// GET RANDOM BACKGROUND //
