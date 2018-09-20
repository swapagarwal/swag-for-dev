const DATA_URL = "https://peaceful-chandrasekhar-efde8e.netlify.com/assets/json/data.json"

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