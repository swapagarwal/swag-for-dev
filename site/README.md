# devswag.io

## About

This folder contains the source code of the devSwag website (hosted at http://devswag.io).

## Development

Clone this repository by running
    ```sh
    git clone https://github.com/swapagarwal/swag-for-dev.git
    ```

### Local

1. Ensure you are running an up-to-date version of [Node.js](https://nodejs.org/en/download/package-manager/) on your machine, and that you have npm installed.
1. Open a terminal in the `swag-for-dev/site` directory. Type
    ```sh
    npm install
    ```
    into the terminal to install the dependencies. To start the webserver, type
    ```sh
    npm start
    ```
1. The website should open in a browser after it compiles, or you can view it by going to http://localhost:8000

### Docker

1. Ensure you are running an up-to-date version of [Docker](https://docs.docker.com/install/) on your machine.
1. Open a terminal in the `swag-for-dev` directory. Type
    ```sh
    docker build -t devswag:dev --target base .
    ```
    to build a docker image `devswag:dev`.
1. You now have to run this image with
    ```sh
    docker run -it --rm \
    -v $(pwd)/data.json:/swag-for-dev/data.json \
    -v $(pwd)/site/src:/swag-for-dev/site/src \
    -v $(pwd)/site/dist:/swag-for-dev/site/dist \
    -v $(pwd)/site/gulpfile.js:/swag-for-dev/site/gulpfile.js \
    -v $(pwd)/site/.eslintrc:/swag-for-dev/site/.eslintrc \
    -u $(id -u):$(id -g) \
    -p 8000:8000 -p 35729:35729 devswag:dev
    ```
1. You can view the website after it compiles by going to http://localhost:8000

> Tip: You can use an alias to ease the terminal use, simply type
> ```sh
>  alias devswag='docker run -it --rm \
> -v $(pwd)/data.json:/swag-for-dev/data.json \
> -v $(pwd)/site/src:/swag-for-dev/site/src \
> -v $(pwd)/site/dist:/swag-for-dev/site/dist \
> -v $(pwd)/site/gulpfile.js:/swag-for-dev/site/gulpfile.js \
> -v $(pwd)/site/.eslintrc:/swag-for-dev/site/.eslintrc \
> -u $(id -u):$(id -g) \
> -p 8000:8000 -p 35729:35729 devswag:dev npm run'
> ```
> and use it like
> ```sh
> devswag start # start in dev mode
> devswag lint # lint code
> devswag build # build production release
> ```

## Production release

### Local

1. Ensure your [local development environment](#local) works
1. Open a terminal in the `swag-for-dev/site` directory. Type
    ```sh
    npm run build
    ```
1. Your production release is ready in the `swag-for-dev/site/dist` directory. You can use any web-server to preview it in your browser. One way is using `http-server` module directly from npm as follows
    ```sh
    npx http-server -p 8000 ./dist
    ```

### Docker

1. Open a terminal in the `swag-for-dev` directory. Type
    ```sh
    docker build -t devswag .
    ```
    will build a docker image `devswag`.
1. To run it and serve the content via `nginx` web-server, type
    ```sh
    docker run -it --rm -p 8000:80 devswag
    ```
1. Your production build is served, you can view it by going to http://localhost:8000
1. The built release can be extracted to the `my-devwag-release` folder from a **running** container by typing
    ```sh
    BAREID=$(docker create devswag)
    docker cp $BAREID:/usr/share/nginx/html/devswag my-devswag-release
    docker rm $BAREID
    ```

> We leverage docker multi-stage builds to have the tiniest images as possible, but this feature does not automatically deletes images of intermediate stages from now (moby/moby#34513). To manually clean all dangling images after a build session, you can use
> ```sh
> docker rmi $(docker images -q -f dangling=true)
> ```

### Optimize

Docker production image has a default nginx that implements caching rules and basic security headers. You may want to take a look at the [`netlify.toml`](https://github.com/swapagarwal/swag-for-dev/blob/master/netlify.toml) to configurate your own production server.
