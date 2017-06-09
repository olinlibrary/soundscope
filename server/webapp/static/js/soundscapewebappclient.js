var id = "dev" + (new Date()).getTime();


var gpsSettings = { 'origin': {'lon':  -71.264367, 'lat': 42.293178},
                    'lon_max': -71.263536,
                    'lat_max': 42.293801};


function setVolume(vol){
    // var bingSound = document.getElementById('bing');
    // console.log('set bingSound.volume to ', vol);
    // bingSound.volume = vol;

    try{ volumes = JSON.parse(vol); }
    catch(err) { console.log("could not decode", vol); }

    console.log("Received volumes:");

    for(var i=0; i<volumes.volumes.length; i++){
      console.log(i, volumes.volumes[i].vol)
    }
    return 1;
}

function playBing(){
  var bingSound = document.getElementById('bing');
  console.log("playing bingSound");
  bingSound.play();
}

function toggleLoop(){
  var bingSound = document.getElementById('bing');
  console.log('toggling bingSound loop to ', !bingSound.loop);
  bingSound.loop = !bingSound.loop;
}


function sendPosition(){
  var gpsPos = {};
  var xPos = document.getElementById('xPosSlide').value;
  var yPos = document.getElementById('yPosSlide').value;

  gpsPos.lat = (xPos/1000) * (gpsSettings.lat_max - gpsSettings.origin.lat) + gpsSettings.origin.lat;
  gpsPos.lon = (yPos/1000) * (gpsSettings.lon_max - gpsSettings.origin.lon) + gpsSettings.origin.lon;

  var position = {"lat": Number(gpsPos.lat), "lon": Number(gpsPos.lon), 'id':id};

  jsonLocation = JSON.stringify(position);
  socket.emit('position', jsonLocation);
  // console.log('sent position', position.x, position.y);
}


var socket = io();
socket.emit('connection', '');

socket.on('volumes', setVolume);

// sendPosition();
setInterval(sendPosition, 2000);