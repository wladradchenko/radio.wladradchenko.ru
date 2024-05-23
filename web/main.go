// build GOOS=linux GOARCH=amd64 CGO_ENABLED=0 // go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio main.go
// go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio main.go

package main

import (
	"encoding/json"
	"encoding/xml"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
	"path/filepath"
	"io"
	"os"
	"net"
)

type Radio struct {
	Url   string `json:"url"`
	Genre string `json:"genre"`
	Name  string `json:"name"`
}

type Podcast struct {
	Url      string `json:"url"`
	Lang string `json:"lang"`
}

func main() {
	fmt.Println("Program starting... Waiting a minute while the code checks radio points.")
	http.HandleFunc("/simulator_game", gameHandler)
	http.HandleFunc("/stream", streamHandler)  // Register the new stream handler
	http.HandleFunc("/podcast", podcastHandler)  // Register the new podcast handler

	host := flag.String("host", "127.0.0.1", "host to listen on")
	port := flag.Int("port", 8080, "port to listen on")  // add another port
	flag.Parse()

	rand.New(rand.NewSource(time.Now().UnixNano()))

	var wg sync.WaitGroup

	podcastFile := "./static/radio/podcast.json"
	podcasts, err := readPodcastFromFile(podcastFile)
	if err != nil {
		log.Fatalf("Error reading radios from file: %s", err)
	}

	podcastChan := make(chan Podcast)
	for _, podcast := range podcasts {
		wg.Add(1)
		go checkPodcast(podcast, &wg, podcastChan)
	}

	go func() {
		wg.Wait()
		close(podcastChan)
	}()

	numVoice := make(map[string][]string)

	var validPodcasts []Podcast
	for podcast := range podcastChan {
		validPodcasts = append(validPodcasts, podcast)
		numVoice[podcast.Lang] = append(numVoice[podcast.Lang], podcast.Url)
	}

	fmt.Printf("Podcasts found: %d\n", len(validPodcasts))

	genreMap := make(map[string][]string)

	radioFile := "./static/radio/radio.json"
	radios, err := readRadiosFromFile(radioFile)
	if err != nil {
		log.Fatalf("Error reading radios from file: %s", err)
	}

	radioChan := make(chan Radio)
	for _, radio := range radios {
		wg.Add(1)
		go checkRadio(radio, &wg, radioChan)
	}

	go func() {
		wg.Wait()
		close(radioChan)
	}()

	var validRadios []Radio
	for radio := range radioChan {
		validRadios = append(validRadios, radio)
		genreMap[radio.Genre] = append(genreMap[radio.Genre], radio.Url)
	}

	fmt.Printf("Radios found: %d\n", len(validRadios))

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/", handleRoot(genreMap))
	http.HandleFunc("/events", handleEvents(genreMap, numVoice))

	addr := fmt.Sprintf("%s:%d", *host, *port)
	fmt.Printf("Listening on %s\n", addr)
	http.ListenAndServe(addr, nil)
}

func readRadiosFromFile(file string) ([]Radio, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	var radios []Radio
	if err = json.Unmarshal(data, &radios); err != nil {
		return nil, err
	}

	return radios, nil
}

func readPodcastFromFile(file string) ([]Podcast, error) {
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	var podcasts []Podcast
	if err = json.Unmarshal(data, &podcasts); err != nil {
		return nil, err
	}

	return podcasts, nil
}

func checkRadio(radio Radio, wg *sync.WaitGroup, radioChan chan<- Radio) {
	defer wg.Done()
	if len(radio.Url) > 0 && radio.Url[:7] == "/stream" {
			radioChan <- radio
	}
}

func checkPodcast(podcast Podcast, wg *sync.WaitGroup, podcastChan chan<- Podcast) {
	defer wg.Done()
	if len(podcast.Url) > 0 && podcast.Url[:8] == "/podcast" {
		podcastChan <- podcast
	}
}

func handleRoot(genres map[string][]string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		music := make(map[string]string)
		for genre, names := range genres {
			if len(names) > 0 {
				randIndex := rand.Intn(len(names))
				music[genre] = names[randIndex]
			}
		}

		fmt.Println(music)

		tmpl, err := template.ParseFiles("static/html/index.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tmpl.Execute(w, music)
	}
}

func handleEvents(genres map[string][]string, numVoice map[string][]string) func(w http.ResponseWriter, r *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        flusher, ok := w.(http.Flusher)
        if !ok {
            http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "text/event-stream")
        w.Header().Set("Cache-Control", "no-cache")
        w.Header().Set("Connection", "keep-alive")
        w.Header().Set("Access-Control-Allow-Origin", "*")

        sendData := func() {
            genreData := make(map[string]string)
            for genre, urls := range genres {
                if len(urls) > 0 {
                    randomURL := urls[rand.Intn(len(urls))]
                    genreData[genre] = randomURL
                }
            }

            voiceData := make(map[string]string)
            for lang, voices := range numVoice {
                if len(voices) > 0 {
                    randomVoice := voices[rand.Intn(len(voices))]
                    voiceData[lang] = randomVoice
                }
            }

            jsonData, err := json.Marshal(map[string]interface{}{
                "name": genreData,
                "voice": voiceData,
            })

            if err != nil {
                http.Error(w, "Failed to marshal json", http.StatusInternalServerError)
                return
            }

            _, err = fmt.Fprintf(w, "data: %s\n\n", jsonData)
            if err != nil {
                return
            }
            flusher.Flush()
        }

        sendData() // Send data immediately upon connection

        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()

        for range ticker.C {
            sendData() // Then send data every 30 seconds
        }
    }
}

// Game
func gameHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Implement rendering of "simulator_post.html" template here
	// You'll need to handle rendering HTML templates using Go's HTML/template package
	// For example:
	tmpl, err := template.ParseFiles("static/html/game.html")
	if err != nil {
	   http.Error(w, err.Error(), http.StatusInternalServerError)
	   return
	}
	tmpl.Execute(w, nil) // Pass any required data to the template
}


func streamHandler(w http.ResponseWriter, r *http.Request) {
	station := r.URL.Query().Get("station")
	if station == "" {
			http.Error(w, "No station.", http.StatusBadRequest)
			return
	}

	audioPath := "static/music/"
	stationPath := filepath.Join(audioPath, station)

	if _, err := os.Stat(stationPath); os.IsNotExist(err) {
			http.Error(w, "No station.", http.StatusNotFound)
			return
	}

	stationFiles, err := filepath.Glob(filepath.Join(stationPath, "*.mp3"))
	if err != nil || len(stationFiles) == 0 {
			http.Error(w, "No audio files found.", http.StatusNotFound)
			return
	}

	rand.New(rand.NewSource(time.Now().UnixNano()))
	rand.Shuffle(len(stationFiles), func(i, j int) { stationFiles[i], stationFiles[j] = stationFiles[j], stationFiles[i] })

	w.Header().Set("Content-Type", "audio/mpeg")

	ctx := r.Context()

	for {
			for _, file := range stationFiles {
					select {
					case <-ctx.Done():
							log.Println("Client closed the connection")
							return
					default:
							audioFile, err := os.Open(file)
							if err != nil {
									log.Printf("Error opening file: %s", err)
									continue
							}

							_, err = io.Copy(w, audioFile)
							audioFile.Close()

							if err != nil {
									if isClientDisconnectError(err) {
											log.Println("Client closed the connection")
											return
									} else {
											log.Printf("Error streaming file: %s", err)
											return
									}
							}

							time.Sleep(500 * time.Millisecond)
					}
			}
			rand.Shuffle(len(stationFiles), func(i, j int) { stationFiles[i], stationFiles[j] = stationFiles[j], stationFiles[i] })
	}
}

func isClientDisconnectError(err error) bool {
	if opErr, ok := err.(*net.OpError); ok && (opErr.Err.Error() == "write: broken pipe" || opErr.Err.Error() == "write: connection reset by peer") {
			return true
	}
	return false
}

type Enclosure struct {
	URL string `xml:"url,attr"`
}

type Item struct {
	Enclosures []Enclosure `xml:"enclosure"`
}

type RSS struct {
	Channel struct {
			Items []Item `xml:"item"`
	} `xml:"channel"`
}

func podcastHandler(w http.ResponseWriter, r *http.Request) {
	rssFeedURL := r.URL.Query().Get("rss_feed_url")
	if rssFeedURL == "" {
			http.Error(w, "No podcast links found in the provided RSS feed URL.", http.StatusBadRequest)
			return
	}

	resp, err := http.Get(rssFeedURL)
	if err != nil {
			http.Error(w, "Error fetching RSS feed.", http.StatusInternalServerError)
			return
	}
	defer resp.Body.Close()

	var rss RSS
	if err := xml.NewDecoder(resp.Body).Decode(&rss); err != nil {
			http.Error(w, "Error parsing RSS feed.", http.StatusInternalServerError)
			return
	}

	var podcastLinks []string
	for _, item := range rss.Channel.Items {
			for _, enclosure := range item.Enclosures {
					podcastLinks = append(podcastLinks, enclosure.URL)
			}
	}

	if len(podcastLinks) == 0 {
			http.Error(w, "No podcast links found in the RSS feed.", http.StatusNotFound)
			return
	}

	rand.New(rand.NewSource(time.Now().UnixNano()))
	http.Redirect(w, r, podcastLinks[rand.Intn(len(podcastLinks))], http.StatusFound)
}