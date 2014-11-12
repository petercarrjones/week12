var width = Math.max(960, window.innerWidth), height = Math.max(500, window.innerHeight);

var tile = d3.geo.tile()
    .size([width, height]);



var projection = d3.geo.mercator()
    .scale((1 << 12) / 2 / Math.PI)
    .translate([width / 2, height / 2]);

var center = projection([-100, 40]);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 11, 1 << 14])
    .translate([width - center[0], height - center[1]])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var raster = svg.append("g");

var vector = svg.append("path");

d3.csv("judges_1800s.csv", type, function(error, place) {
  svg.call(zoom);
  vector.datum({type: "FeatureCollection", features: place});
  zoomed();
});

function type(d) {
  return {
    type: "Feature",
    properties: {
      name: d.name,
      decade: d.decade 
    },
    geometry: {
      type: "Point",
      coordinates: [+d.lon, +d.lat]
    }
  };
}

function zoomed() {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  projection
      .scale(zoom.scale() / 2 / Math.PI)
      .translate(zoom.translate());

  vector
      .attr("d", path);

  var image = raster
      .attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
    .selectAll("image")
      .data(tiles, function(d) { return d; });

  image.exit()
      .remove();

  image.enter().append("image")
      .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/examples.map-vyofok3q/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", function(d) { return d[0]; })
      .attr("y", function(d) { return d[1]; });
}


d3.json("state_1890.json", function(error, state_1890) {
  svg.append("g")
      .attr("class", "feature feature--state")
    .selectAll("path")
      .data(topojson.feature(state_1890, ch.objects.state).features)
    .enter().append("path")
      .attr("d", path);

