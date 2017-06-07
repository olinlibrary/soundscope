var r = new Rune({
  container: "body",
  width: 600,
  height: 600,
  frameRate : 60,
  debug: true
});

var my_group = r.group(0, 0);
// var noise = new Rune.Noise().noiseDetail(0.2); // https://github.com/runemadsen/rune.noise.js

var people = [];
var beacons = [];
var sampleInput1 = {
  "locations": [
    {
      "id": "3",
      "type": "person",
      "x": 400,
      "y": 300,
    },
    {
      "id": "4",
      "type": "person",
      "x": 200,
      "y": 300
    },
    {
      "id": "5",
      "type": "person",
      "x": 300,
      "y": 300,
    }
  ]
};

var sampleInput2 = {
  "locations": [
    {
      "id": "1",
      "type": "person",
      "x": 20,
      "y": 20
    },
    {
      "id": "3",
      "type": "person",
      "x": 20,
      "y": 30
    },
  ]
};

var initialBeacons = [
  {
    "id": "0",
    "type": "beacon",
    "x": r.width / 2,
    "y": 0,
    "color": new Rune.Color(255, 0, 0),
    "points": [-50, 0, 50, 0, 0, 100],
  },
  {
    "id": "1",
    "type": "beacon",
    "x": r.width,
    "y": r.height,
    "color": new Rune.Color(0, 255, 0),
    "points": [0, 0, 0, -100, -100, 0],
  },
  {
    "id": "2",
    "type": "beacon",
    "x": 0,
    "y": r.height,
    "color": new Rune.Color(0, 0, 255),
    "points": [0, 0, 0, -100, 100, 0],
  }
]

function Thing(location){
  this.id = location.id;
  this.music = null;
  this.x = location.x;
  this.y = location.y;
  this.get_location = function (){
    var tmp = []
    tmp.push(this.x);
    tmp.push(this.y);
    return tmp
  }
  this.update_color = function(color){
    this.color = color;
    this.shape.fill(this.color)
  }
  this.move = function(dx, dy){
    this.x = this.x + dx;
    this.y = this.y + dy;
    this.shape.move(dx, dy, true)
  }
  this.moveTo = function(x, y){
    this.x = x;
    this.y = y;
    this.shape.move(this.x, this.y)
  }
  return this;
}

function Person(location, stage){
  Thing.call(this, location)
  this.stage = stage;
  this.width = 50;
  this.height = 50;
  this.shape = new Rune.Ellipse(this.x, this.y,
    this.width, this.height)
    .fill(this.color).addTo(this.stage);
  this.lines = [];

  this.move = function(dx, dy){
    this.x = this.x + dx;
    this.y = this.y + dy;
    this.shape.move(dx, dy, true)
  }
  this.update_my_color = function(beacons){
    //console.log(beacons)
    var dist = this.get_dist_to_things(beacons);
    //console.log(dist)
    var rgb = []
    for (var i = 0; i < dist.length; i++) {
      max_dist = Math.sqrt(r.width**2 + r.height**2);
      // console.log(dist[i][0])
      rgb.push(Rune.map(dist[i][1], max_dist, 0, 0, 255));
    }
    var new_color = new Rune.Color(rgb[0], rgb[1], rgb[2])
    this.color = new_color;
    this.shape.fill(new_color);
  }
  this.update_size = function(width, height){
    this.width = width;
    this.height = height;
    this.shape.state.width = width;
    this.shape.state.height= height;
  }
  this.get_dist_to_things = function(things){
    var distances = [];
    for (var i = 0; i < things.length; i++) {
      var distance = [];
      var thing_id = things[i].id;
      distance.push(thing_id);

      var thing_x = things[i].x;
      var thing_y = things[i].y;
      var dist = Math.sqrt((this.x - thing_x)**2 + (this.y - thing_y)**2);
      distance.push(dist);

      distances.push(distance);
    }
    return distances;
  }

  this.draw_lines_to_people = function(ppl_array){
    // var distances = this.get_dist_to_things(ppl_array);
    if (this.lines != []) {  // delete lines
      for (line of this.lines) line.removeParent();
    }
    this.lines = [];
    for (person of ppl_array) {
      newLine = new Rune.Line(this.x, this.y, person.x, person.y)
      newLine.addTo(this.stage);
      this.lines.push(newLine);
    }
  }
  return this;

}

function Beacon(location, stage){
  Thing.call(this, location)
  if (location.hasOwnProperty('color')) this.color = location.color;
  else this.color = new Rune.Color('hsv', 10, 100, 70);

  if (location.hasOwnProperty('points')) {
    this.shape = new Rune.Triangle(  // TODO: use apply() for this
      this.x + location.points[0],
      this.y + location.points[1],
      this.x + location.points[2],
      this.y + location.points[3],
      this.x + location.points[4],
      this.y + location.points[5],
    );
  } else {
    this.shape = new Rune.Triangle(
    this.x, this.y,
    this.x + 100, this.y + 0,
    this.x + 50, this.y - 50,
  );
  }
  this.shape.fill(this.color).addTo(stage);
  this.stage = stage;
  return this;
}

/** Initialize beacons from sample array */
for (let beaconOptions of initialBeacons) {
  newBeacon = new Beacon(beaconOptions, my_group);
  beacons.push(newBeacon);
  console.log('created beacon', newBeacon.id, '@', newBeacon.x, newBeacon.y);
}

/** Initialize people from sample array */
for (let location of sampleInput1.locations) {  // initial list of people
  thisPerson = new Person(location, my_group)
  people.push(thisPerson);
  console.log('created person', thisPerson.id, '@', thisPerson.x, thisPerson.y);
}

r.on('update', function() {
  var boundary = 40;
  var maxStep = 20;
  for (person of people) {  // move people randomly
    var xLower = -maxStep, xUpper = maxStep;
    var yLower = -maxStep, yUpper = maxStep;
    if (person.x <= boundary) {
      xLower = 0;
    } else if (person.x >= r.width - boundary) {
      xUpper = 0;
    };
    if (person.y <= boundary) {
      yLower = 0;
    } else if (person.y >= r.height - boundary) {
      yUpper = 0;
    };
    person.move(Rune.random(xLower, xUpper), Rune.random(yLower, yUpper))
    person.update_my_color(beacons);
    person.draw_lines_to_people(people);
  }
});

function mapIncomingDataToCanvas(incomingLocation) {
  var newX = Rune.map(incomingLocation.x, 0, 1000, 0, r.width);
  var newY = Rune.map(incomingLocation.y, 0, 1000, 0, r.width);
  return {'x': newX, 'y': newY}
}

/**
 * Compare received data with current list of people and update/create
 * new ones
 * TODO: create new people if IDs aren't found in people array
 */
function updateLocations(locations, testData=false) {
  console.log(locations);
  for (let location of locations) {
    foundPerson = people.find(function(person) {return person.id == location.id});
    if (foundPerson !== undefined) {
      newLocation = {'x': location.x, 'y': location.y};
      if (!testData) {
        newLocation = mapIncomingDataToCanvas(newLocation);
      }
      foundPerson.moveTo(newLocation.x, newLocation.y);
      console.log('moved person', foundPerson.id, 'to', location.x, location.y);
    } else {  // create new person
      console.log('No matching person found for id', location.id);
      newLocation = mapIncomingDataToCanvas(location);
      console.log(location);
      newLocation.id = location.id;
      thisPerson = new Person(newLocation, my_group)
      people.push(thisPerson);
      console.log('created person', thisPerson.id, '@', thisPerson.x, thisPerson.y);
    }
  }
}

var socket = io.connect();
// socket.emit('connection', '');
socket.emit('connection', '');
socket.on('vizPositions', updateLocations);

r.play()
