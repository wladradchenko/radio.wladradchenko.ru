// build GOOS=linux GOARCH=amd64 CGO_ENABLED=0 // go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio main.go
// go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio main.go

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
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

	host := flag.String("host", "127.0.0.1", "host to listen on")
	port := flag.Int("port", 8080, "port to listen on")  // add another port
	flag.Parse()

	rand.Seed(time.Now().UnixNano())

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
	resp, err := http.Get(radio.Url)
	if err != nil {
		log.Printf("Error checking radio %s: %s", radio.Url, err)
		return
	}
	defer resp.Body.Close()

	if resp.Header.Get("Content-Type") == "audio/mpeg" {
		radioChan <- radio
	}
}

func checkPodcast(podcast Podcast, wg *sync.WaitGroup, podcastChan chan<- Podcast) {
	defer wg.Done()
	resp, err := http.Get(podcast.Url)
	if err != nil {
		log.Printf("Error checking radio %s: %s", podcast.Url, err)
		return
	}
	defer resp.Body.Close()

	if resp.Header.Get("Content-Type") == "audio/mpeg" {
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