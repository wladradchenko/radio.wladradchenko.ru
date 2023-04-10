// SERVICE WORKER BLOCK
// Register service worker
window.addEventListener(
    'load',
    () => navigator.serviceWorker.register('/static/sw.js'),
    err => console.log('ServiceWorker registration failed: ', err),
);
  
  // Prompt to install PWA
  window.addEventListener('beforeinstallprompt', function(event) {
    if (event.isInstalled) {
        // PWA is already installed, no need to show notification banner
        return;
      }

    const notificationBanner = document.getElementById('notification-banner');

    if (Notification.permission === 'denied') {
        // User has blocked notifications
        notificationBanner.style.display = 'block';
     } else if (Notification.permission === 'default') {
        // User has not yet made a choice
        // Prompt user to allow notifications
        notificationBanner.style.display = 'block';
    } else {
        // User has allowed notifications
        notificationBanner.style.display = 'block';
    }

    const closeBannerBtn = document.getElementById('close-banner');
    const playMusicBannerBtn = document.querySelector('.play');

    closeBannerBtn.addEventListener('click', () => {
        notificationBanner.style.display = 'none';
    });

    playMusicBannerBtn.addEventListener('click', () => {
        notificationBanner.style.display = 'none';
    });

    if (Notification.permission !== 'granted') {
        notificationBanner.style.display = 'block';
    }

    // Prevent default prompt
    event.preventDefault();
  });
  
// SERVICE WORKER BLOCK

// HANDLE EVENT BLOCK //
document.getElementById("name-filter").addEventListener("change", function() {
    var filter = this.value;
    // Send an AJAX request to the server with the filter parameter
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Reset the source.onmessage function
            source.onmessage = null;
            // Update the EventSource with the new filter value
            source = new EventSource("/events?filter=" + filter);
            // Update the names list with the new data
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
        }
    };
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("filter=" + filter);
});
// HANDLE EVENT BLOCK //


// UPDATE H1 TIME BLOCK //
// Get the h1 element
const timerEl = document.getElementById('timer');

function updateTimer() {
    // Get the current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const buttonVolInput = document.getElementById('button-vol-input');
    const secondsFull = now.getSeconds() + now.getMinutes() * 60 + now.getHours() * 60 * 60;
    buttonVolInput.max = 86400;
    // Update the value of the input element
    buttonVolInput.value = secondsFull;

    // Update the text of the h1 element
    timerEl.textContent = timeString;
}

// Call the updateTimer function immediately
updateTimer();

// Call the updateTimer function every minute
setInterval(updateTimer, 1000);
// UPDATE H1 TIME BLOCK //


// AUDIO AND VOICE PLAYER BLOCK //
// radio
const audio = document.createElement('audio');
// podcats voice
const voice = document.createElement('audio');
// settings
// audio.autoplay = true;
audio.volume = 0.65;
// voice.autoplay = true;
voice.volume = 0.65;

let prevAudio;
let prevVoice = 0;

function playSong() {
    let lis = document.querySelectorAll('#names-list li');

    let nextLi = lis[lis.length - 1];
    let nextSrc = nextLi.textContent;

    prevAudio = audio.src;
    audio.src = nextSrc;
    // audio.autoplay = true;
}

audio.addEventListener('ended', playSong);
playSong();
audio.pause();  // TODO check
voice.pause();   // TODO check

const buttonPlay = document.querySelector('.play');
const buttonSwitch = document.querySelector('.button-play');

const onPlayBtnClick = () => {
if (audio.paused) {
    audio.autoplay = true;
    voice.autoplay = true;
    
    audio.play();
    buttonSwitch.classList.add('playing');
    // set podcast or play from pause
    if (voice.currentTime != 0) {
            voice.play(); // user already listening podcast
    } else {
            playVoice(); // user not listening podcast yet
    }
} else {
    audio.pause();
    buttonSwitch.classList.remove('playing');
    // turn off podcast
        voice.pause();
}
};
buttonPlay.addEventListener('click', onPlayBtnClick);
navigator.mediaSession.setActionHandler('play', onPlayBtnClick);
navigator.mediaSession.setActionHandler('pause', onPlayBtnClick);
navigator.mediaSession.setActionHandler('stop', onPlayBtnClick);

const buttonRefresh = document.querySelector('.right');
const onNextBtnClick = () => {
    playSong();
    audio.play();
};
// buttonRefresh.addEventListener('click', onNextBtnClick);
buttonRefresh.addEventListener('click', function() {
    playSong();
    audio.play();
    setMediaMetadata(null);
});
navigator.mediaSession.setActionHandler('nexttrack', onNextBtnClick);

setMediaMetadata("Wladradchenko");

const buttonPrev = document.querySelector('.left');
const onPrevBtnClick = () => {
if (prevAudio.length > 0) {
    audio.src = prevAudio;
    audio.play();
}
};
//buttonPrev.addEventListener('click', onPrevBtnClick);
buttonPrev.addEventListener('click', function() {
    audio.src = prevAudio;
    audio.play();
    setMediaMetadata(null);
});
navigator.mediaSession.setActionHandler('previoustrack', onPrevBtnClick);

document.getElementById("name-filter").addEventListener("change", function() {
    // Get option value
    var filter = this.value;
    setMediaMetadata(null);

    // Call playSong() function here
    setTimeout(function() {
        playSong();
    }, 2000);

    if (voiceButtonOn.style.display == 'block') {
        // User turned on podcast and listen wladradchenko radio, than mute on
        // console.log("Turn On Voice")
        voice.volume = 1;
    } else {
        // User on wladradchenko radio, but podacts turned off, than mute ff
        // console.log("Turn Off Voice")
        voice.volume = 0;
}
});

// Create function to get list of voices as attr
function podcatGenerator() {
// Get voice attr and create sort list
let objVoice = JSON.parse(document.querySelectorAll('#names-list li')[0].getAttribute('voice'));
let lisVoice = Object.values(objVoice).sort((a, b) => parseInt(a) - parseInt(b));

voice.src = lisVoice[prevVoice];

if (audio.played) {
    voice.play();
    audio.volume = 0.35;
}

if (prevVoice != lisVoice.length - 1) {
    prevVoice += 1;
} else {
    prevVoice = 0;
}
}

function playVoice() {
if (voice.currentTime == 0 && prevVoice == 0) {
    const nextPlayTime = Math.floor(Math.random() * (1 * 60 * 60 * 1000)) + 3 * 60 * 60 * 1000; // Random time between 60 minutes and 180 minutes
    setTimeout(podcatGenerator, nextPlayTime);
} else if (voice.currentTime == 0 && prevVoice != 0) {
    // Set a timeout to play the voice file again after a random amount of time
    podcatGenerator()
}
}

function endedVoice() {
voice.currentTime = 0;
playVoice();
}

voice.addEventListener('ended', endedVoice);
// AUDIO AND VOICE PLAYER BLOCK //


// UPDATE QUOTE BLOCK //
function updateQuote() {
// Fetch the JSON data
fetch('/static/quotes/quotes.json')
.then(response => response.json())
.then(data => {
// Select a random quote
const randomIndex = Math.floor(Math.random() * data.length);
const quote = data[randomIndex];

// Update the quote element
const quoteElement = document.querySelector('#quote');
if (quote.author == null){
    quoteElement.textContent = `"${quote.text}"`;
} else {
    quoteElement.textContent = `"${quote.text}" - ${quote.author}`;
}
});
}

// Call the updateQuote function immediately
updateQuote();

// Call the updateQuote function every half minute
setInterval(updateQuote, 30 * 1000);
// UPDATE QUOTE BLOCK //


// SETTINGS BUTTOMS BLOCK //
// Settings
// General
const mainButton = document.querySelector('#main-button');
const mainButtonChildOpen = mainButton.querySelector('#setting-open-button');
const mainButtonChildClose = mainButton.querySelector('#setting-close-button');
const listSettingsDescription = document.querySelector('#list-description');
const listSettings = document.querySelector('#list-settings');

mainButton.addEventListener('click', function() {
    listSettingsDescription.classList.toggle('opened');
    listSettings.classList.toggle('opened');
    if (listSettings.classList.contains('opened')) {
        mainButtonChildOpen.style.display = 'none';
        mainButtonChildClose.style.display = 'block';
    } else {
        mainButtonChildOpen.style.display = 'block';
        mainButtonChildClose.style.display = 'none';
    }
});

// Volume
const volumeButton = document.querySelector('#volume');
const volumeIcons = volumeButton.querySelectorAll('svg');
const volumeSteps = [1, 0.65, 0.35, 0];
let currentStep = 1;

volumeButton.addEventListener('click', function() {
currentStep = (currentStep + 1) % volumeSteps.length;
audio.volume = volumeSteps[currentStep];

volumeIcons.forEach((icon, index) => {
        if (index === currentStep) {
            icon.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    });
});

// Voice
const voiceButton = document.querySelector('#voice');
const voiceButtonOn = voiceButton.querySelector('#voice-on-button');
const voiceButtonOff = voiceButton.querySelector('#voice-off-button');

voiceButton.addEventListener('click', function() {
if (voiceButtonOn.style.display == 'none') {
    voiceButtonOn.style.display = 'block';
    voiceButtonOff.style.display = 'none';
    voice.volume = 1;
} else {
    voiceButtonOn.style.display = 'none';
    voiceButtonOff.style.display = 'block';
    voice.volume = 0;
}
});
// SETTINGS BUTTOMS BLOCK //

function setMediaMetadata(selectNameSet = null) {
    // Get the background image element
    let backgroundImg = document.querySelector('.background-img').src;
    // Get the current radio 
    let selectNameCurrent = "Wladradchenko"
    if (selectNameSet == null) {
      selectNameCurrent = document.querySelector("#name-filter").options[document.querySelector("#name-filter").selectedIndex].textContent;
    } 
  
    // Set metadata to null first
    navigator.mediaSession.metadata = null;
  
    // Create a new MediaMetadata object with the updated artwork src and artist
    let metadataNewSession = new MediaMetadata({
      title: "Нейронное радио",
      artist: selectNameCurrent,
      artwork: [
        {
          src: `${backgroundImg}`,
          sizes: "96x96",
          type: "image/gif",
        }
      ]
    });
  
    // Update metadata with the new object with a delay of 100 milliseconds
    setTimeout(() => {
      navigator.mediaSession.metadata = metadataNewSession;
    }, 500);
  }
