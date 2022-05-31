
var OSU_API_KEY = scriptProperties.getProperty('APIv1 key') // Deprecated but cba change everywhere
var OSU_CLIENT_ID = PropertiesService.getUserProperties().getProperty('client_id')
var OSU_CLIENT_SECRET = PropertiesService.getUserProperties().getProperty('client_secret')

var API_URL = 'https://osu.ppy.sh/api/v2'
var TOKEN_URL = 'https://osu.ppy.sh/oauth/token'

function infofromusername(username) {
  var url = 'https://osu.ppy.sh/api/get_user?k=' + OSU_API_KEY + '&m=0&type=string&u=' + username
  var data = JSON.parse(UrlFetchApp.fetch(url).getContentText())
  return [Number(data[0]["user_id"]), Number(data[0]["pp_rank"])]
}

function get_token() {
  var data = {
    'client_id': OSU_CLIENT_ID,
    'client_secret': OSU_CLIENT_SECRET,
    'grant_type': 'client_credentials',
    'scope': 'public'
  }

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  }

  return JSON.parse(UrlFetchApp.fetch(TOKEN_URL, options))["access_token"]
}

function newinfofromusername(username) {

  var token = get_token()

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  }

  var options = {
    'method': 'get',
    'contentType': 'application/json',
    'headers': headers
  }

  var url = API_URL + "/users/" + username + "/osu?key=username"

  var data = JSON.parse(UrlFetchApp.fetch(url, options).getContentText())

  var badge_value = 0

  for (var badge_index in data["badges"]) {
    var badge = data["badges"][badge_index]
    if ((badge["description"].toLowerCase().indexOf("winner") != -1) || (badge["description"].toLowerCase().indexOf("winning") != -1)) {
      var badge_date = new Date(badge["awarded_at"])
      var today = new Date()
      var days_ago = Math.floor((today - badge_date) / (1000*60*60*24))
      badge_value += 0.9994 ** days_ago
    }
  }

  var id = data["id"]
  var rank = data["statistics"]["global_rank"]

  var bws = Math.round(rank ** (0.92 ** badge_value))

  return [id, rank, badge_value, bws]
}
