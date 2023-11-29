// GET MULTI-SELECT OPTIONS //
// Load the radio data from radio.json
function fetchAndProcessData(jsonUrl) {
    return fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            let optionsSet = {};
            data.forEach(item => {
                optionsSet[item.genre] = { name: item.name, source: item.source };
            });

            let options = [];
            for (let genre in optionsSet) {
                options.push(`<option value="${genre}" data-source="${optionsSet[genre].source}">${optionsSet[genre].name}</option>`);
            }

            return options;
        })
        .catch(error => {
            console.error('Error fetching radio data:', error);
            return [];
        });
}

Promise.all([fetchAndProcessData('/static/radio/radio.json')])
    .then(results => {
        let combinedOptions = results.reduce((acc, cur) => acc.concat(cur), []);
        
        let multiSelect = document.querySelector('#name-filter');
        let rangeSelect = document.createRange();
        let fragmentSelect = rangeSelect.createContextualFragment(combinedOptions.join('\n'));
        multiSelect.appendChild(fragmentSelect);

        // Set the first option as selected by default if none is selected
        if (!multiSelect.querySelector('option[selected]')) {
            multiSelect.querySelector('option').setAttribute('selected', true);
        }
    });


// Function to change the option's text
function changeOptionTextCustom(option) {
    const originalText = option.textContent;
    if (option.dataset.source === 'neural') {
        option.textContent = 'Wladradchenko';
        setTimeout(() => {
            option.textContent = originalText;
        }, 5000);
    }
}

// Interval function to animate text change for the selected option
setInterval(() => {
    const selectedOption = document.querySelector('#name-filter option:checked');
    changeOptionTextCustom(selectedOption);
}, 5000);
// GET MULTI-SELECT OPTIONS //


// SET START EVENT LISTENER ON DEFAULT //
let source = new EventSource("/events");
source.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var namesList = document.getElementById("names-list");
    // Remove the first item
    while (namesList.firstChild) {
        namesList.removeChild(namesList.firstChild);
    }
    // Add a new random name to the end
    var newItem = document.createElement("li");
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
        const backgroundNames = Array.from(doc.querySelectorAll('a'))
            .map(link => '/static/assets/' + link.textContent.trim());

        let backgroundImg = backgroundNames[Math.floor(Math.random() * backgroundNames.length)];
        const imgElement = document.querySelector('.background-img');
        imgElement.src = `${backgroundImg}`;

        // Check if the select element has options
        const nameFilterSelect = document.querySelector('#name-filter');
        if (nameFilterSelect && nameFilterSelect.options.length > 0) {
            imgElement.addEventListener('load', () => {
                setMediaMetadata(null);
            });
        }

        setInterval(() => {
            backgroundImg = backgroundNames[Math.floor(Math.random() * backgroundNames.length)];
            imgElement.src = `${backgroundImg}`;
        }, 60000);
    })
    .catch(error => console.error(error));

// GET RANDOM BACKGROUND //
