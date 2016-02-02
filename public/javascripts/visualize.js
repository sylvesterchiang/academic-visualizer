var width = 600,
    height = 400,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick)
    .charge(-30)
    .gravity(0.3)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
  .attr("preserveAspectRatio", "xMidYMid meet");;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

d3.json("data/actual_data.json", function(error, json) {
  if (error) throw error;

  root = json;
  console.log(root);
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  //root.data[0].children.forEach(collapse);
  //root.data[1].children.forEach(collapse);
  //root.data[2].children.forEach(collapse);
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
      .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);
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
  if (!d3.event.defaultPrevented) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
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

//hides initial nodes
function hideNodes(root){
  function recurse(node){
    if (node.children) node.children.forEach(recurse);
    if (node.level > 1){
      node._children = node.children;
      node.children = null;
    }
  }

  recurse(root.data[0]);
  recurse(root.data[1]);
  recurse(root.data[2]);
  return root;
}
