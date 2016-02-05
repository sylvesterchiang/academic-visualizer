var width = 700,
    height = 300,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick)
    .charge(-60)
    .gravity(0.3)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
  .attr("preserveAspectRatio", "xMidYMid meet");;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var first = true;
var temp_hover;
var temp_active;
var bridgeKey;
var bridgeLinks = [];

var hidden;

//jquery
$('#bridge-button').hide();
$('#bridge-button').click(function(){
  showBridge();
});

d3.json("data/actual_data.json", function(error, json) {
  if (error) throw error;

  root = json;
  
  update();

});

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.

  force
      .nodes(nodes)
      .links(links)
      .start();

  // Update the links…
  link = link.data(links, function(d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Update the nodes…
  node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return Math.sqrt(30-d.level*6); })
      .attr('id', function(d){ return 'name' + d.id; })
      .attr("key", function(d){ return d.key })
      .style("fill", color)
      .on("click", click)
      .call(force.drag)
      .attr('hover', function(d){
        return d.description;
      })
      .on("mouseover", function(d){
        temp_hover = d3.select(this).style('fill');
        d3.select(this).style('fill', "#ffcc00");
        $("#hover").text(d3.select(this).attr('hover'));
      })
      .on("mouseout", function(d){
        d3.select(this).style('fill', temp_hover);
        $("#hover").text(" ");
      });


  if (first){
    var parent = d3.select("svg").selectAll(".node");
    //hidden = jQuery.extend(true, {}, parent);

    parent.each(function(d, i){
      if(d.level > 0){
        d._children = d.children;
        d.children = null;
      }
    });
    first = false;
    console.log('hide nodes');
    update();
  }
}

function showBridge(){

  console.log('locating bridge...');

  function recurseParent(key){
    for (var i=0; i < hidden[0]; i++){
      if (hidden[0][i].key === key){
        console.log('found parent');
        console.log(d);
        graphNode = d3.select('#name' + hidden[0][i].id);
        if (graphNode._children){
          graphNode.children = graphNode._children;
          graphNode._children = null;
        }
        if (graphNode.parent){
          recurseParent(graphNode.parent);
        }
      }
    }
  }

  for (var i=0; i < hidden[0].length; i++){
    console.log(hidden[0][i].key);
    console.log(bridgeKey);
    var temp = d3.select('#name' + hidden[0][i].id)
    console.log(temp);
    if (temp.key === bridgeKey){
      recurseParent(hidden[0][i].parent);
    }
  }

  var lineage = [];

  update();
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
    if (d.group == 1){
      return d._children ? "#3182bd" : d.children ? "#3333cc" : "#c6dbef";
    }
    else if (d.group == 2){
      return d._children ? "ff3300" : d.children ? "#cc2900" : "#ffc2b3";
    }
    else{
      return d._children ? "#00cc66" : d.children ? "#008041" : "#00e675";
    }
}
// Toggle children on click.
function click(d) {
  $("#active").text(d3.select(this).attr('hover'));

  if(d.bridge){
    $('#bridge-button').show();
    bridgeKey = d.bridge;
  }else{
    $('#bridge-button').hide();
  }

  if (!d3.event.defaultPrevented) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    console.log(root);
    update();
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root.data[0]);
  recurse(root.data[1]);
  recurse(root.data[2]);
  return nodes;
}