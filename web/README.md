To run the project, just go to the directory with main.go and run:

```
go run main.go
```

To build a project on Linux, use the command:

```
go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio.wladradchenko.ru main.go
```
