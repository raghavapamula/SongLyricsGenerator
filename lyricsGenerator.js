var apikey = "526a9ff5e04d900840ed38f494f3746c"
var artist = "tool"

function searchArtist(artist) {
  return fetch("https://api.musixmatch.com/ws/1.1/track.search" + "?apikey=" + apikey + "&q_artist=" + artist + "&format=jsonp&callback=application/json")
    .then(res => res.text())
    .then(res => JSON.parse(res.slice(17, res.length-2)))
    .then(res => res.message.body.track_list)
}

function getTrack(track) {
  return fetch("https://api.musixmatch.com/ws/1.1/track.lyrics.get" + "?apikey=" + apikey + "&track_id=" + track + "&format=jsonp&callback=application/json")
  .then(res => res.text())
  .then(res => JSON.parse(res.slice(17, res.length-2)))
  .then(res => {
    if(res.message.body.length != 0) {
      return JSON.stringify(res.message.body.lyrics.lyrics_body);} else {
      return null;
  }})
  .then(res => {
    if(res != null) {
      return res.slice(1, res.length-1);}
    return null})
}

const getLyrics = (artist) => searchArtist(artist).then(tracks => {
  var lyrics = []
  for(var i = 0; i < tracks.length; i++) {
    lyrics.push(getTrack(tracks[i].track.track_id));
  }
  return Promise.all(lyrics);
});

function fillMarkovChain(artist) {
  return getLyrics(artist).then(lyrics => {
    if(lyrics.length == 0) {
      return null;
    }
    const starters = [];
    const lengths = [];
    const markov_chain = {};
    lyrics.forEach(lines => {
      if(lines == null) {
        return;
      }
      lines = lines.replace(/,\.!?;:/g, " $0").replace(/\(([^\)]+)\)/g, "").split(/\\n/g);
      lines = lines.slice(0, lines.length - 4);
      if(lines.length > 12) {
        lengths.push(lines.length);
      }
      for(var i = 0; i < lines.length-1; i++) {
        var temp = lines[i].match(/\S+/g);
        if(temp != null && temp.length > 0 && temp[0] != ".") {
          starters.push(temp[0]);
        }
        if(temp != null && temp.length > 1) {
          for(var j = 0; j < temp.length-1; j++) {
            let cur = temp[j]
            if(cur in markov_chain) {
              markov_chain[cur].push(temp[j+1]);
            } else {
              markov_chain[cur] = [temp[j+1]];
            }
          }
        }
      }
  })
  return [markov_chain, starters, lengths];
 })};

const generate = (artist) => {
  return fillMarkovChain(artist).then(ans => {
  if(ans == null) {
    return null;
  }
  const markov_chain = ans[0];
  const starters = ans[1];
  const lengths = ans[2];
markov_chain["."] = [];
var song = []
var cur_line;
var cur;
var next;
const length = lengths[Math.floor(Math.random() * lengths.length)]
for(var i = 0; i < length; i++) {
  cur_line = "";
  cur = starters[Math.floor(Math.random() * starters.length)];
  let j = 0;
  while(j < 15 && cur != "." && markov_chain[cur] != null) {
    j += 1;
    if(cur == ",")
      cur_line = cur_line.slice(-1);
    cur_line += cur + " ";
    next = Math.floor(markov_chain[cur].length * Math.random());
    cur = markov_chain[cur][next];
  }
  if(cur == ".")
    cur_line = cur_line.slice(-1);
  cur_line += cur
  song.push(cur_line)
}
return song;
});}

const get = ()=> {
  var artist = document.getElementById("artistSearch").value;
  document.getElementById("artistSearch").value = "";
  generate(artist).then(res => {
    if(res != null) {
    var content = document.createElement("ul");
    for(var i = 0; i < res.length; i++) {
      var node = document.createElement("li");
      var t = document.createTextNode(res[i]);
      node.appendChild(t);
      content.appendChild(node);
    }
   } else {
     var content = document.createTextNode("Sorry! We can't find information on that artist. Please Try another one!");
   }
    document.getElementById("lyricsArea").innerHTML = "";
    document.getElementById("lyricsArea").appendChild(content);
  });
}