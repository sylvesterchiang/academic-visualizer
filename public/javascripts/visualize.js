var width = 700,
    height = 350,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick)
    .charge(-70)
    .gravity(0.2)

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
var bridgeNode;
var lineage;
var bridgeLinks = [];

var active;
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
      //links = d3.layout.tree().links(nodes);
      links = generateLinks();

  console.log(links.length);

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
      .attr('stroke', '#9ecae1')
      .attr('stroke-width', 1.5)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  var targetExists = false;
  var sourceExists = false;
  
  if (bridgeLinks.length != 0){
    console.log('checking bridge links');
    for (var i=0; i < nodes.length; i++){
      if (bridgeLinks[0].target.id == nodes[i].id){
        console.log('target ok');
        targetExists = true;
      }
      if (bridgeLinks[0].source.id == nodes[i].id){
        console.log('source ok');
        sourceExists = true;
      }
    }
  }

  if (targetExists && sourceExists){
    link.data(bridgeLinks, function(d) {return d.target.id;})
      .enter().insert("line", ".node")
        .attr("class", "link")
        .attr('stroke', 'red')
        .attr('stroke-width', 0.5)
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    }

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
        d3.select(this).style('fill', "#ffcc00");
        $("#hover").text(d3.select(this).attr('hover'));
      })
      .on("mouseout", function(d){
        d3.select(this).style('fill', color);
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

  lineage = [];

  function recurseChildren(children){
    for (var i=0; i < children.length; i++){
      if (lineage.has(children[i].key)){
        temp = children[i];
        if (!temp.children){
          temp.children = temp._children;
          temp._children = null;
        }
        recurseChildren(temp.children);
      }
    }
  }

  function expandLineage(){

    node.each(function(d,i){
      if (lineage.has(d.key)){
        if (!d.children){
          d.children = d._children;
          d_children = null;
        }
        recurseChildren(d.children);
      }
    });

    console.log('bridges expanded');
  }

  function getNode(key){

    var temp;

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      else{
        node._children.forEach(recurse);
      }
      if (node.key == key){
        temp = node;
      }
    }

    recurse(root.data[0]);
    recurse(root.data[1]);
    recurse(root.data[2]);

    return temp;
  }

  function getLineage(node){
    if (node.key != bridgeNode.bridge){
      lineage.push(node.key);
    }
    if (node.parent){
      getLineage(getNode(node.parent));
    }
    else{
      console.log(lineage);
      lineage = new Set(lineage);
      expandLineage();
    }
  }
  getLineage(getNode(bridgeNode.bridge));

  bridgeLinks.push({
    "source": bridgeNode,
    "target": getNode(bridgeNode.bridge), 
  });

  update();
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .attr("weight", function(d){ return 2});

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
    if (active){
      if (d.key == active){
        return "#ffcc00";
      }
    }
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

  active = d.key

  $("#active").text(d3.select(this).attr('hover'));
  if(d.bridge){
    $('#bridge-button').show();
    bridgeNode = d;
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

//generateLinks
function generateLinks(){
  var links = [];

  function recurse(node){
    if (node.children){
      for (var i = 0; i < node.children.length; i++){
        links.push({
          "source": node,
          "target": node.children[i]
        })
      }
      for (var i = 0; i < node.children.length; i++){
        recurse(node.children[i]);
      }
    }
  }

  recurse(root.data[0]);
  recurse(root.data[1]);
  recurse(root.data[2]);

  //add bridge node to links
  
  /*
  console.log('generateLinks');
  console.log(bridgeLinks);
  for (var i= 0 ; i < bridgeLinks.length; i++){
    var source;

    console.log('adding bridges to links');
    node.each(function(d,k){
      if (d.key == bridgeLinks[i].target)
        target = d;
      if (d.key == bridgeLinks[i].source)
        source = d;
    });
      
    links.push({
      "source": bridgeLinks[i].source, 
      "target": bridgeLinks[i].target,
      "weight": 1
    });
  }*/

  return links;
}
