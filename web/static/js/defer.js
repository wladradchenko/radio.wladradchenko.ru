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
                if (optionsSet[genre].source == '2d') {
                    options.push(`<option value="${genre}" data-name="${optionsSet[genre].name}" data-source="${optionsSet[genre].source}">${optionsSet[genre].name}</option>`);
                } else {
                    options.push(`<option style="display:none;" value="${genre}" data-name="${optionsSet[genre].name}" data-source="${optionsSet[genre].source}">${optionsSet[genre].name}</option>`);
                }
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
    if (option.dataset.source === ('2d' || '3d')) {
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
    const notCheckedOptions = document.querySelectorAll('#name-filter option:not(:checked)');
    for (let i = 0; i < notCheckedOptions.length; i++) {
        notCheckedOptions[i].innerText = notCheckedOptions[i].getAttribute('data-name') || notCheckedOptions[i].innerText;
    };
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
    // Close the EventSource after updating the names list
    source.close();
}
// SET START EVENT LISTENER ON DEFAULT //


// GET RANDOM BACKGROUND //
let is2DMode = true; // Track the mode, initially set to 2D
let intervalModeId; // To store the interval ID

// Function to fetch images based on the mode
function fetchImages() {
    const modeFolder = is2DMode ? '2d' : '3d'; // Determine folder based on the mode
    fetch(`/static/assets/${modeFolder}/`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const backgroundNames = Array.from(doc.querySelectorAll('a'))
                .map(link => `/static/assets/${modeFolder}/` + link.textContent.trim());

            // Select a random image from the fetched images
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

            // Change the image every 60 seconds
            intervalModeId = setInterval(() => {
                backgroundImg = backgroundNames[Math.floor(Math.random() * backgroundNames.length)];
                imgElement.src = `${backgroundImg}`;
            }, 60000);
        })
        .catch(error => console.error(error));
}

// Call fetchImages initially to fetch images based on the initial mode
fetchImages();

// GET RANDOM BACKGROUND //
