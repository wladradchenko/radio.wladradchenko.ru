Для запуска проекта, достаточно сделать перейти в директорию с main.go и запустить:

```
git clone https://github.com/wladradchenko/radio.wladradchenko.ru.git
cd radio.wladradchenko.ru/web
go run main.go
```

Для билда проекта на linux, используется команда:

```
go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o radio.wladradchenko.ru main.go
```
