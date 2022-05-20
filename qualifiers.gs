
var OSU_API_KEY = scriptProperties.getProperty('APIv1 key')
var BASE_API_URL = 'https://osu.ppy.sh/api/'

// (MAP_ID, MOD_MULTIPLIER)
var MAPPOOL = [
  ["2567738", 1],
  ["2766489", 1],
  ["1590460", 1],
  ["2729964", 1.06],
  ["2594989", 1.10],
  ["3330566", 1.20],
  ["2096800", 1.17],
  ["2828902", 1],
  ["3158362", 1.06],
  ["1602030", 1.10],
  ["2015326", 1.20],
  ["2885483", 0.5],
  ["3470472", 1.12],
  ["2713369", 0.3]
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
      scores[MAPPOOL.map(x => x[0]).indexOf(beatmapID)] = Number(results[playerID][beatmapID])
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
        if (MAPPOOL.map(x => x[0]).includes(map["beatmap_id"]) === false) {
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
          var mappoolIndex = MAPPOOL.map(x => x[0]).indexOf(map["beatmap_id"])
          results[score["user_id"]][map["beatmap_id"]] = score["score"] / MAPPOOL[mappoolIndex][1]
        }
      }
    } catch (TypeError) {
      break
    }
  }
  PropertiesService.getDocumentProperties().setProperty('results', JSON.stringify(results))
}
