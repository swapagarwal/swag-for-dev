const DATA_URL = "https://peaceful-chandrasekhar-efde8e.netlify.com/assets/json/data.json"

var swagCache

// Fetches the JSON swag list. Once it has got the data, it will call the given callback function
// with one argument: a list of objects.
function fetchSwag(callback) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var responseText = req.responseText
            var swag = JSON.parse(responseText)
            callback(swag)
        }
    }

    req.open("GET", DATA_URL, true)
    req.send()
}

function renderSwag(swag) {
    swagCache = swag
    
    var filter = getFilter()
    var sorting = getSorting()

    swag = swag
        .filter(v => {
            if (filter == "All difficulties") {
                return true
            }

            return v.difficulty == filter.toLowerCase()
        })
        .sort((a, b) => {
            if (sorting == "Alphabetical") return a.name > b.name
            if (sorting == "Alphabetical, reversed") return a.name < b.name
            if (sorting == "Difficulty") return difficultyIndex(a.difficulty) > difficultyIndex(b.difficulty)
            if (sorting == "Difficulty, reversed") return difficultyIndex(a.difficulty) < difficultyIndex(b.difficulty)
        })
    
        document.getElementById("content").innerHTML = ""

    for (var item of swag) {
        var card = document.createElement("div")
        card.className = "item"
        document.getElementById("content").appendChild(card)

        var titleDiv = document.createElement("div")
        titleDiv.classList.add("title")
        titleDiv.classList.add("flex")
        card.appendChild(titleDiv)

        var h1 = document.createElement("h1")
        h1.innerHTML = item.name
        titleDiv.appendChild(h1)

        var difficultyDiv = document.createElement("div")
        difficultyDiv.classList.add("difficulty")
        difficultyDiv.classList.add(item.difficulty)
        titleDiv.appendChild(difficultyDiv)

        var swagType = document.createElement("p")
        swagType.className = "swag"
        swagType.innerHTML = "Stickers"
        card.appendChild(swagType)

        var img = document.createElement("img")
        img.src = item.image
        card.appendChild(img)

        var description = document.createElement("p")
        description.className = "description"
        description.innerHTML = item.description
        card.appendChild(description)

        var link = document.createElement("a")
        link.href = item.reference
        link.innerHTML = "Go to page"
        card.appendChild(link)
    }
}

function difficultyIndex(diff) {
    return ["easy", "medium", "hard"].indexOf(diff)
}

function getFilter() {
    return document.getElementById("filter").value
}

function getSorting() {
    return document.getElementById("sorting").value
}

function attemptRender() {
    if (swagCache === undefined) {
        fetchSwag(renderSwag)
    } else {
        renderSwag(swagCache)
    }
}

function bodyLoaded() {
    attemptRender()

    document.getElementById("filter").addEventListener("input", attemptRender)
    document.getElementById("sorting").addEventListener("input", attemptRender)
}

document.body.onload = bodyLoaded
