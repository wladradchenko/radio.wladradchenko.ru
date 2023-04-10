
// SET START EVENT LISTENER ON DEFAULT //
let source = new EventSource("/events?filter=lofi");
source.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var namesList = document.getElementById("names-list");
    // Remove the first item
    namesList.removeChild(namesList.childNodes[0]);
    // Add a new random name to the end
    var newItem = document.createElement("li");
    var newText = document.createTextNode(data.name);
    var newVoice = document.createAttribute("voice");
    newVoice.value = JSON.stringify(data.voice);
    newItem.setAttributeNode(newVoice);
    newItem.appendChild(newText);
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