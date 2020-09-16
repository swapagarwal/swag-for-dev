# Contribute to devSwag

Thank you for working to make devSwag better! 🎉

We have a very simple [code of conduct](https://github.com/swapagarwal/swag-for-dev/tree/master/CODE_OF_CONDUCT.md) - please ensure you uphold it!

We're working on creating an in-depth documention on how to set up the website for development - in the meantime, if you have any questions, feel free to drop by our [lobby](https://gitter.im/swag-for-dev/Lobby).

## What's a contribution?

You might be wondering what a contribution is. Here are some things that you can do:

- [File](https://github.com/swapagarwal/swag-for-dev/issues/new?template=---issue-website.md) bug reports for our website
- [Post](https://github.com/swapagarwal/swag-for-dev/issues/new?template=----new-swag-opportunity.md) about new swag opportunities
- Work on [feature requests](https://github.com/swapagarwal/swag-for-dev/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22)
- Review [open Pull Requests](https://github.com/swapagarwal/swag-for-dev/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc).

Thanks again, we hope to see you soon! ❤

## How do I add a Swag Opportunity?

1. Open an issue [here](https://github.com/swapagarwal/swag-for-dev/issues/new?template=----new-swag-opportunity.md) or implement one [that already exists](https://github.com/swapagarwal/swag-for-dev/labels/%3Atada%3A%20new%20swag) 
2. Fork the repository
3. Edit [`data.json`](data.json) to add your swag opportunity. Please keep it in alphabetical order, and use the date the issue was first posted.
4. Open a pull request and fill out the entire template.
5. Well done! Soon the swag will be on the site!

## Let's start hacking!

### Start one-click with Gitpod 

Contribute to swag-for-dev using a fully featured online development environment that will automatically: clone the repo, install the dependencies and start the webserver.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)

### Start using NPM

1. Clone this repository by running
```sh
git clone https://github.com/swapagarwal/swag-for-dev.git
```
1. Ensure you are running an up-to-date version of [Node.js](https://nodejs.org/en/download/package-manager/) on your machine, and that you have `npm` installed.
1. Open a terminal in the `swag-for-dev` directory. Type
    ```sh
    npm install
    ```
    into the terminal to install the dependencies. To start the webserver, type
    ```sh
    npm start
    ```
1. The website should open in a browser after it compiles, or you can view it by going to http://127.0.0.1:8000

---

1. To build a production release, type
    ```sh
    npm run build
    ```
1. Dist is now ready in the `swag-for-dev/dist` directory. You can use any web-server to preview it in your browser. One way is using `http-server` module directly from npm as follows
    ```sh
    npx http-server -p 8000 ./dist
    ```

### Start using Docker

1. Clone this repository by running
```sh
git clone https://github.com/swapagarwal/swag-for-dev.git
```
1. Ensure you are running an up-to-date version of [Docker](https://docs.docker.com/install/) on your machine.
1. Open a terminal in the `swag-for-dev` directory. Type
    ```sh
    docker build -t devswag:dev --target base .
    ```
    to build a docker image `devswag:dev`.
1. You now have to run this image with
    ```sh
    docker run -it --rm \
    -v $(pwd)/data.json:/devswag/data.json \
    -v $(pwd)/src:/devswag/src \
    -v $(pwd)/gulpfile.js:/devswag/gulpfile.js \
    -v $(pwd)/get-data.js:/devswag/get-data.js \
    -v $(pwd)/dist:/devswag/dist \
    -u $(id -u):$(id -g) \
    -p 8000:8000 -p 35729:35729 devswag:dev
    ```
1. You can view the website after it compiles by going to http://127.0.0.1:8000

> Tip: You can use an alias to ease the terminal use, simply type
> ```sh
>  alias devswag='docker run -it --rm \
> -v $(pwd)/data.json:/devswag/data.json \
> -v $(pwd)/src:/devswag/src \
> -v $(pwd)/gulpfile.js:/devswag/gulpfile.js \
> -v $(pwd)/get-data.js:/devswag/get-data.js \
> -v $(pwd)/dist:/devswag/dist \
> -u $(id -u):$(id -g) \
> -p 8000:8000 -p 35729:35729 devswag:dev npm run'
> ```
> and use it like
> ```sh
> devswag start # start in dev mode
> devswag lint # lint code
> devswag build # build production release
> ```

---

1. To build the production container, move to `swag-for-dev` directory. Type
    ```sh
    docker build -t devswag .
    ```
    will build a docker image `devswag`.
1. To run it and serve the content via `nginx` web-server, type
    ```sh
    docker run -it --rm -p 8000:80 devswag
    ```
1. Your production build is served, you can view it by going to http://127.0.0.1:8000
1. The built release can be extracted to the `my-devwag-release` folder from a **running** container by typing
    ```sh
    BAREID=$(docker create devswag)
    docker cp $BAREID:/usr/share/nginx/html/devswag my-devswag-release
    docker rm $BAREID
    ```

> We leverage docker multi-stage builds to have the tiniest images as possible, but this feature does not automatically deletes images of intermediate stages from now. To manually clean remaning images after building, you can run
> ```sh
> docker image prune --filter label=stage=intermediate
> ```

#### Optimizations

Docker production image has a default nginx configuration file that implements caching rules and basic security headers. You may want to take a look at [`netlify.toml`](https://github.com/swapagarwal/swag-for-dev/blob/master/netlify.toml) to configurate your own production server.

#### _docker-compose.yml example_

```yaml
version: '3.4'
services:

    # Production release
    prod:
        image: devswag
        build:
            context: .
        ports:
        - 8000:80

    # Development release
    # To use the following service, you may have to export
    # the $UID and $GID variables from bash before using
    # docker-compose command. Here's how:
    # $ export UID=$(id -u)
    # $ export GID=$(id -g)
    #
    # UID defaults to 1000
    # GID defaults to 1000
    dev:
        image: devswag:dev
        build:
            context: .
            target: base # only build dev
        volumes:
        - ./data.json:/swag-for-dev/data.json
        - ./site/src:/swag-for-dev/site/src
        - ./site/dist:/swag-for-dev/site/dist
        - ./site/.eslintrc:/swag-for-dev/site/.eslintrc
        - ./site/gulpfile.js:/swag-for-dev/site/gulpfile.js
        environment:
            GULP_LISTEN_HOST: 0.0.0.0
            GULP_LISTEN_PORT: 8000
        ports:
        - 8000:8000
        - 35729:35729
        user: "${UID:-1000}:${GID:-1000}"
        command: npm start
```
