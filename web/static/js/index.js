// SERVICE WORKER BLOCK
// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/static/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed: ', err);
        });
    });
} else {
    console.log('Service workers are not supported.');
}
  
  
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
    const pwaInstallBtn = document.getElementById('install-pwa');

    closeBannerBtn.addEventListener('click', () => {
        notificationBanner.style.display = 'none';
    });

    playMusicBannerBtn.addEventListener('click', () => {
        notificationBanner.style.display = 'none';
    });

    pwaInstallBtn.addEventListener('click', () => {
        // Get the current URL path
        const currentPath = window.location.pathname;
        // Extract the language code from the path
        const languageCode = currentPath.split('/')[1];

        if (languageCode === "eng") {
            alert("After installing the application on your device, turn on the notification to play media content in your browser to control the player on the lock screen.");
        } else {
            alert("После установки приложения на ваше устройство включите уведомление для воспроизведения медиаконтента в своем браузере, чтобы управлять плеером на экране блокировки.");
        
        }
        event.prompt();
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
    // Voice will work only in custom radio
    muteVoice(filter);
    canPlay();
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
audio.autoplay = true;
audio.volume = 0.65;
// voice.autoplay = true;
voice.volume = 0.65;

let prevAudio;
let prevVoice = 0;

function playSong() {
    let filter = document.getElementById("name-filter").value;
    if (filter === "") {
        filter = "custom"
    }

    let lis = document.querySelectorAll('#names-list li');

    let nextLi = lis[lis.length - 1];
    let nextSrc = nextLi.getAttribute(filter);

    prevAudio = audio.src;
    audio.src = nextSrc;
};

function canPlay() {
    audio.pause();
    playSong();
    setMediaMetadata(null);
    // Wait for the new audio source to be loaded before playing it
    buttonSwitch.classList.remove('playing');
    buttonSwitch.classList.add('playing');
    audio.addEventListener('canplay', function() {
        audio.play(); //TODO
    });
};


audio.addEventListener('ended', playSong);
playSong();
audio.pause();  // TODO check
voice.pause();   // TODO check

const buttonPlay = document.querySelector('.play');
const buttonSwitch = document.querySelector('.button-play');

const onPlayBtnClick = () => {
    if (audio.paused) {
        audio.play();
        buttonSwitch.classList.add('playing');

        // Check if voice should be played
        if (voice.currentTime != 0) {
            if (voiceButtonOn.style.display == 'none' && document.getElementById("name-filter").value == 'custom') {
                voice.volume = 0;
            } else {
                if (!audio.paused) { 
                    voice.play(); // user already listening podcast
                    voice.volume = 1;
                }
            }
        } else {
            playVoice(); // user not listening podcast yet
        }
    } else {
        audio.pause();
        buttonSwitch.classList.remove('playing');
        voice.pause();  // turn off podcast
    }
};

buttonPlay.addEventListener('click', onPlayBtnClick);
navigator.mediaSession.setActionHandler('play', onPlayBtnClick);
navigator.mediaSession.setActionHandler('pause', onPlayBtnClick);

function onStopBtnClick() {
    // Stop the audio playback
    audio.pause();
    audio.currentTime = 0;
  
    // Clear any existing media session metadata and action handlers
    navigator.mediaSession.metadata = null;
  
    // Update the playback state to stopped
    navigator.mediaSession.playbackState = 'stopped';
  
    // Close the PWA
    window.close();
}
  
navigator.mediaSession.setActionHandler('stop', onStopBtnClick);

function changeOptionByClick(reverse = false) {
    var selectElement = document.getElementById("name-filter");
    var selectedIndex = selectElement.selectedIndex;
    var optionsLength = selectElement.options.length;

    // Function to find the next visible index in a specified direction
    function findNextVisibleIndex(startIndex, direction) {
        let index = startIndex;
        while (direction === 'forward' ? index < optionsLength : index >= 0) {
            if (window.getComputedStyle(selectElement.options[index]).display !== 'none') {
                return index;
            }
            index += direction === 'forward' ? 1 : -1;
        }
        return -1; // Return -1 if no visible index is found
    }

    // Calculate the new index based on visibility and direction
    if (reverse) {
        selectedIndex = findNextVisibleIndex(selectedIndex - 1, 'backward');
        if (selectedIndex === -1) {
            selectedIndex = findNextVisibleIndex(optionsLength - 1, 'backward'); // Start from last if not found earlier
        }
    } else {
        selectedIndex = findNextVisibleIndex(selectedIndex + 1, 'forward');
        if (selectedIndex === -1) {
            selectedIndex = findNextVisibleIndex(0, 'forward'); // Start from 0 if not found earlier
        }
    }

    // Set the new selected index
    selectElement.selectedIndex = selectedIndex;

    // Trigger the change event on the select element
    selectElement.dispatchEvent(new Event('change'));

    var filter = selectElement.value;
    // Voice will work only in custom radio
    muteVoice(filter);
}


const buttonRefresh = document.querySelector('.right');
const onNextBtnClick = () => {
    changeOptionByClick(false);
    canPlay();
};

buttonRefresh.addEventListener('click', function() {
    changeOptionByClick(false);
    canPlay();
});
navigator.mediaSession.setActionHandler('nexttrack', onNextBtnClick);

setMediaMetadata("Wladradchenko");

const buttonPrev = document.querySelector('.left');
const onPrevBtnClick = () => {
    changeOptionByClick(true);
    canPlay();
};

buttonPrev.addEventListener('click', function() {
    changeOptionByClick(true);
    canPlay();
});
navigator.mediaSession.setActionHandler('previoustrack', onPrevBtnClick);

// Create function to get list of voices as attr
function podcatGenerator() {
    // Get voice attr and create sort list
    let objVoice = JSON.parse(document.querySelectorAll('#names-list li')[0].getAttribute('voice'));
    let lisVoice = Object.values(objVoice).sort((a, b) => parseInt(a) - parseInt(b));

    // Work is folder is language
    // Get all keys from objVoice
    const lisVoiceLang = Object.keys(objVoice);

    // Get the current URL path
    const currentPath = window.location.pathname;

    // Extract the language code from the path
    const languageCode = currentPath.split('/')[1];

    // Construct URLs using keys and extracted language code
    if (lisVoiceLang.includes(languageCode)) {
        voice.src = objVoice[languageCode];
    } else {
        voice.src = objVoice["rus"];
    }

    // TODO: Uncommit if I will wanna to work with not lang, with int
    // voice.src = lisVoice[prevVoice];

    if (!audio.paused) {  // If the audio is currently playing
        voice.play();
        audio.volume = 0.1;
    }

    if (prevVoice != lisVoice.length - 1) {
        // prevVoice += 1; TODO (if need to read a few news)
        prevVoice = 0
    } else {
        prevVoice = 0;
    }
}

function playVoice() {
    if (voice.currentTime == 0 && prevVoice == 0) {
        const nextPlayTime = Math.floor(Math.random() * (10 * 60 * 1000)) + 15 * 60 * 1000; // Random time between 10 minutes and 25 minutes
        setTimeout(podcatGenerator, nextPlayTime);
    } else if (voice.currentTime == 0 && prevVoice != 0) {
        // Set a timeout to play the voice file again after a random amount of time
        podcatGenerator()
    }
}

function muteVoice(filter) {
    if (filter != 'custom') {
        // User change radio, than mute off podcats
        // console.log("Turn Off Voice")
        voiceButtonOn.style.display = 'none';
        voiceButtonOff.style.display = 'block';
        voice.volume = 0;
    } else if (filter == 'custom' && voiceButtonOn.style.display == 'block') {
        // User turned on podcast and listen wladradchenko radio, than mute on
        // console.log("Turn On Voice")
        voice.volume = 1;
    } else {
        // User on wladradchenko radio, but podacts turned off, than mute ff
        // console.log("Turn Off Voice")
        voice.volume = 0;
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
    var quotes_url;
    // Get the current URL path
    const currentPath = window.location.pathname;
    // Extract the language code from the path
    const languageCode = currentPath.split('/')[1];

    if (languageCode === "eng") {
        quotes_url = '/static/quotes/quotes_eng.json';
        document.querySelector("#list-description").style.marginRight = "10pt";
        document.querySelector("#game-text").innerText = "Game";
        document.querySelector("#game-button").addEventListener("click", function() {
            window.location.href = '/simulator_game?lang=eng';
        });        
        document.querySelector("#donat-text").innerText = "Donat";
        document.querySelector("#voice-text").innerText = "Podcast";
        document.querySelector("#volume-text").innerText = "Volume";
        document.querySelector("#install-pwa").innerText = "Install application";
        document.title = "Neural Radio"
    } else {
        quotes_url = '/static/quotes/quotes.json';
    }
    // Fetch the JSON data
    fetch(quotes_url)
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

function voiceChangeButton() {
    if (voiceButtonOn.style.display == 'none' && document.getElementById("name-filter").value == 'custom') {
        voiceButtonOn.style.display = 'block';
        voiceButtonOff.style.display = 'none';
        voice.volume = 1;
    } else {
        voiceButtonOn.style.display = 'none';
        voiceButtonOff.style.display = 'block';
        voice.volume = 0;
    }
};

voiceButton.addEventListener('click', function() {
    voiceChangeButton();
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


// IF AUDIO IS BROKEN //
audio.addEventListener('error', (event) => {
    // Handle the error here
    console.error('Error loading audio file:', event.target.error.message);
  
    // Revert to a default audio file
    audio.src = 'https://wladradchenko.ru/stream?station=christmas';
});
// IF AUDIO IS BROKEN //

//CHANGE BACKGROUND AND LIST GENRE FILTER LOGICAL//
function modeBackground(elem) {
    const btnMode = elem.querySelector(".button");
    const multiSelectFilter = document.querySelector('#name-filter');
    const btnModeText = btnMode.textContent.trim();

    if (btnModeText === '2D') {
        is2DMode = false; // Toggle to 3D mode
        btnMode.textContent = '3D';
        for (let i = 0; i < multiSelectFilter.options.length; i++) {
            let optionSource = multiSelectFilter.options[i].getAttribute('data-source') || '2d';
            if (optionSource === '2d') {
                multiSelectFilter.options[i].style.display = 'none';
            } else {
                multiSelectFilter.options[i].innerText = multiSelectFilter.options[i].getAttribute('data-name')  || multiSelectFilter.options[i].innerText;
                multiSelectFilter.options[i].style.display = '';
            }
        }
    } else {
        is2DMode = true; // Toggle to 2D mode
        btnMode.textContent = '2D';
        for (let i = 0; i < multiSelectFilter.options.length; i++) {
            let optionSource = multiSelectFilter.options[i].getAttribute('data-source') || '3d';
            if (optionSource === '3d') {
                multiSelectFilter.options[i].style.display = 'none';
            } else {
                multiSelectFilter.options[i].innerText = multiSelectFilter.options[i].getAttribute('data-name')  || multiSelectFilter.options[i].innerText;
                multiSelectFilter.options[i].style.display = '';
            }
        }
    }

    clearInterval(intervalModeId); // Clear the previous interval
    fetchImages(); // Call fetchImages to fetch images based on the updated mode
    changeOptionByClick(false);
    canPlay();
}

//CHANGE BACKGROUND AND LIST GENRE FILTER LOGICAL//