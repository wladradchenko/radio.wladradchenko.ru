package main
// build GOOS=linux GOARCH=amd64 CGO_ENABLED=0 // go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio main.go

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"path/filepath"
	"strings"
	"sync"
	"time"
	"strconv"
)

type Radio struct {
	Url   string `json:"url"`
	Genre string `json:"genre"`
	Name  string `json:"name"`
}

type ServerMusic struct {
	URL      string `json:"url"`
	Genre    string `json:"genre"`
	MaxRand  int    `json:"max_rand"`
	NumIter  int    `json:"num_iter"`
}

func main() {
	fmt.Printf("Programm start!!! Waiting for minute while the code check radio points")
	host := flag.String("host", "127.0.0.1", "host to listen on")
	port := flag.Int("port", 8002, "port to listen on")
	flag.Parse()
	rand.Seed(time.Now().UnixNano())

	var wg sync.WaitGroup
	c := make(chan ServerMusic)

	// Read the custom server music and voice from the JSON file
	serverMusicFile := "./static/radio/custom.json"
	serverMusicList, err := readCustomMusicFromFile(serverMusicFile)
	if err != nil {
		fmt.Printf("Error reading radios from file: %s\n", err)
		return
	}

	for _, music := range serverMusicList {
		for i := 0; i < music.NumIter; i++ {
			randInt := rand.Intn(music.MaxRand) + 1
			urlMusic := music.URL + strconv.Itoa(randInt) + ".mp3"

			wg.Add(1)
			go checkMusicFile(urlMusic, &wg, c, music.Genre)
		}
	}

	go func() {
		wg.Wait()
		close(c)
	}()

	// Set genre
	genreMap := make(map[string][]string)
	// Set voice
	numVoice := make(map[string][]string)

	for music := range c {
		numVoice[music.Genre] = append(numVoice[music.Genre], music.URL)
	}

	// Print the number of values for each key in the map
	fmt.Println("Voice loads")
	for key, val := range numVoice {
		fmt.Printf("Key: %d, Num Values: %d\n", key, len(val))
	} 

	// Read the radio stations from the JSON file
	radioFile := "./static/radio/radio.json"
	radios, err := readRadiosFromFile(radioFile)
	if err != nil {
		fmt.Printf("Error reading radios from file: %s\n", err)
		return
	}

	// Check each radio URL and collect the ones that are valid
	radioChan := make(chan Radio)
	for _, radio := range radios {
		wg.Add(1)
		go checkRadio(radio, &wg, radioChan)
	}
	go func() {
		wg.Wait()
		close(radioChan)
	}()

	// Collect the results and print them
	var validRadios []Radio
	for radio := range radioChan {
		validRadios = append(validRadios, radio)
	}

	fmt.Printf("Radios found: %d \n", len(validRadios))
	for _, radio := range validRadios {
		genreMap[radio.Genre] = append(genreMap[radio.Genre], radio.Url)
	}

	// Serve static files from the "static" directory
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", handleRoot(genreMap))
	http.HandleFunc("/events", handleEvents(genreMap, numVoice))

	addr := fmt.Sprintf("%s:%d", *host, *port)
	fmt.Printf("Listening on %s\n", addr)
	http.ListenAndServe(addr, nil)
}

func readRadiosFromFile(file string) ([]Radio, error) {
	var radios []Radio
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, &radios)
	if err != nil {
		return nil, err
	}
	return radios, nil
}

func readCustomMusicFromFile(file string) ([]ServerMusic, error) {
	var serverMusic []ServerMusic
	data, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, &serverMusic)
	if err != nil {
		return nil, err
	}
	return serverMusic, nil
}

func checkRadio(radio Radio, wg *sync.WaitGroup, radioChan chan<- Radio) {
	defer wg.Done()
	resp, err := http.Get(radio.Url)
	if err != nil {
		fmt.Printf("Error checking radio %s: %s\n", radio.Url, err)
		return
	}
	contentType := resp.Header.Get("Content-Type")
	if contentType == "audio/mpeg" {
		radioChan <- radio
	}
}

func checkMusicFile(url string, wg *sync.WaitGroup, c chan ServerMusic, genre string) {
	defer wg.Done()

	resp, err := http.Get(url)
	if err != nil {
		fmt.Println(err)
		return
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "audio/mpeg" {
		c <- ServerMusic{URL: url, Genre: genre}
	}
}

func dirFiles(dirFiles string, typeFiles string) []string {
	files, err := ioutil.ReadDir(dirFiles)
	if err != nil {
		log.Fatal(err)
	}

	var fileNames []string
	for _, file := range files {
		if filepath.Ext(file.Name()) == typeFiles {
			fileNames = append(fileNames, filepath.Join("/"+dirFiles, file.Name()))
		}
	}

	return fileNames
}

func convertString(names []string) string {
	// Conver []string to string
	namesList := `"` + strings.ReplaceAll(strings.Join(names, `","`), " ", "") + `"`
	return namesList
}

func handleRoot(genres map[string][]string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		var names []string

		// Get the filter query parameter
		filter := r.FormValue("filter")
		if len(filter) == 0 {
			names = genres["lofi"]
		} else {
			val, status := genres[filter]
			if status {
				names = val
			} else {
				names = genres["lofi"]
			}
		}

		fmt.Println(filter)
		// Generate an initial list of random names from the filtered list
		music := generateNames(names, 1) // set number from 1 to n
		fmt.Println(music)
		
		// Load the HTML template file
		tmpl, err := template.ParseFiles("static/html/index.html")
		if err != nil {
			log.Fatal(err)
		}

		// Render the template with the list of names and the filter query parameter
		data := struct {
			Music  []string
			Filter string
		}{
			Music:  music,
			Filter: filter,
		}
		err = tmpl.Execute(w, data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func handleEvents(genres map[string][]string, voices map[string][]string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set the response headers for Server-Sent Events (SSE)
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		var names []string

		// Parse the filter parameter from the URL query
		// filter := r.URL.Query().Get("filter")
		filter := r.FormValue("filter")

		if len(filter) == 0 {
			names = genres["lofi"]
		} else {
			val, status := genres[filter]
			if status {
				names = val
			} else {
				names = genres["lofi"]
			}
		}

		// Send a "ping" message to keep the connection open
		fmt.Fprintln(w, "event: ping\ndata: {}\n\n")
		w.(http.Flusher).Flush()

		// Send Server-Sent Events (SSE) every second
		for {
			// Wait for 60 second
			time.Sleep(1 * time.Second)

			// Generate a new random name based on the filter
			name := generateName(names)

			// Create a data object with the name and voice fields
			voiceMap := make(map[string]string)
			for key, value := range voices {
				voice := generateName(value)
				voiceMap[key] = voice
			}

			data := struct {
				Name  string `json:"name"`
				Voice map[string]string `json:"voice"`
			}{
				Name:  name,
				Voice: voiceMap,
			}

			// Encode the data object as JSON
			jsonData, err := json.Marshal(data)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Send the name as a Server-Sent Event (SSE)
			fmt.Fprintf(w, "data: %s\n\n", string(jsonData))
			w.(http.Flusher).Flush()
		}
	}
}

// Generate a slice of n random names
func generateNames(names []string, n int) []string {
	result := make([]string, n)
	for i := range result {
		if len(names) == 0 {
			break
		}
		result[i] = names[rand.Intn(len(names))]
	}
	return result
}

// Generate a random name
func generateName(names []string) string {
	if len(names) == 0 {
		return ""
	}
	return names[rand.Intn(len(names))]
}
