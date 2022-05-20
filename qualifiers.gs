
var OSU_API_KEY = scriptProperties.getProperty('APIv1 key')
var BASE_API_URL = 'https://osu.ppy.sh/api/'

var MAPPOOL = [
  "2567738",
  "2766489",
  "1590460",
  "2729964",
  "2594989",
  "3330566",
  "2096800",
  "2828902",
  "3158362",
  "1602030",
  "2015326",
  "2885483",
  "3470472",
  "2713369"
]

var STAFF = [
  "8631719",  // Defectum
  "8226974",  // Husa
  "7428460",  // Razito
  "8818089",  // Vendelicious
  "18916920", // Mist31
  "13806692", // ThatG0y
  "16204122", // TonyWorep
  "8414284",  // Markus
  "16102492"  // PapaGunch
]

function initResults() {
  PropertiesService.getDocumentProperties().setProperty('results', JSON.stringify({}))
}

function showResults() {
  var results = JSON.parse(PropertiesService.getDocumentProperties().getProperty('results'))
  var parsed = []

  for (var playerID in results) {
    var scores = Array(MAPPOOL.length).fill(0)
    for (var beatmapID in results[playerID]) {
      scores[MAPPOOL.indexOf(beatmapID)] = Number(results[playerID][beatmapID])
    }
    parsed.push([playerID].concat(scores))
  }

  return parsed
}

function processQueue() {
  var multiplayerLinks = SpreadsheetApp.getActiveSpreadsheet().getRange("Qualifiers private!B1:1").getValues()[0]
  
  var results = {}

  for (var link of multiplayerLinks) {
    try {
      var multiplayerID = link.match(/[0-9]+/)[0]
      var url = BASE_API_URL + '/get_match?k=' + OSU_API_KEY + '&mp=' + multiplayerID
      var data = JSON.parse(UrlFetchApp.fetch(url).getContentText())["games"]
      for (var map of data) {
        if (MAPPOOL.includes(map["beatmap_id"]) === false) {
          continue
        }
        var scores = map["scores"]
        for (var score of scores) {
          if (STAFF.includes(score["user_id"])) {
            continue
          }
          if (score["user_id"] in results === false) {
            results[score["user_id"]] = {} // key: beatmapID, val: score
          }
          results[score["user_id"]][map["beatmap_id"]] = score["score"]

        }
      }
    } catch (TypeError) {
      break
    }
  }
  
  PropertiesService.getDocumentProperties().setProperty('results', JSON.stringify(results))
}
