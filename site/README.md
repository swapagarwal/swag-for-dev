# devswag.io

## About

This folder contains the source code of the devSwag website (hosted at http://devswag.io).

## Development

Clone this repository by running
    ```
    git clone https://github.com/swapagarwal/swag-for-dev.git
    ```

### Using vanilla

1. Ensure you are running an up-to-date version of [Node.js](https://nodejs.org/en/download/package-manager/) on your machine, and that you have npm installed.
1. Open a terminal in the `swag-for-dev/site` directory. Type
    ```
    npm install
    ```
    into the terminal to install the dependencies. To start the webserver, type
    ```
    npm start
    ```
1. The website should open in a browser after it compiles, or you can view it by going to http://localhost:8000

### Using docker

1. Ensure you are running an up-to-date version of [Docker](https://docs.docker.com/install/) on your machine.
1. Open a terminal in the `swag-for-dev` directory. Type
```
# Build image
docker build -t devswag:dev --target base .
# Run image
docker run -it --rm -v $(pwd)/data.json:/swag-for-dev/data.json -v $(pwd)/site/src:/swag-for-dev/site/src -p 8000:8000 -p 35729:35729 devswag:dev
```
1. The website should open in a browser after it compiles, or you can view it by going to http://localhost:8000


## Production

### Using docker

1. Open a terminal in the `swag-for-dev` directory. Type
```
# Build image
docker build -t devswag .
# Run image
docker run -it --rm -p 8000:80 devswag
```
