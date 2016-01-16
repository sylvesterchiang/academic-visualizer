var myStyles=['#268BD2', '#BD3613', '#FCF4DC'];

d3.selectAll('.item')
	.data(myStyles)
	.style({
		'color':'white', 
		'background':function(d){
			return d;
		}
	});

var nodes = [];
var links = [];
var index = {};

var s1 = {};
var t1 = {};
var t2 = {};

standard = {
	"http://asn.jesandco.org/resources/D10003B9": 1, 
	"http://asn.jesandco.org/resources/D100029D": 5, 
	"http://asn.jesandco.org/resources/D10003FB": 10
}

var loadData = function(){

	d3.json('data/s1.json', function(data){
		for (key in data){
			var temp = data[key]

			//if (temp != undefined){
			//	console.log(temp[0].value);
			//
			if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003FB.xml'){
				s1[key] = {
					"description": temp['http://purl.org/dc/terms/description'][0].value, 
					"comment": temp['http://purl.org/ASN/schema/core/comments'], 
					"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
					"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
					"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
					"educationLevel": temp['http://purl.org/dc/terms/educationLevel'].length, 
				}

				var tempNode = {
					"name": s1[key]['description'],
					"id": key
				}

				if (key != "http://asn.jesandco.org/resources/D10003FB")
					tempNode.group = standard[s1[key].isPartOf[0].value]
				else
					tempNode.group = standard['http://asn.jesandco.org/resources/D10003FB']

				nodes.push(tempNode);

				index[key] = nodes.length - 1;

				if (s1[key].isChildOf != undefined){
					links.push({
						"source": s1[key].isChildOf[0].value, 
						"target": key, 
						"value": 10
					});
				}
			}
		}

		if (nodes.length > 1500){
			console.log(nodes.length);
			console.log('s1 setup');
			loadBridges();
		}
	});

	d3.json('data/t1.json', function(data){
		for (key in data){
			var temp = data[key]

			if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003B9.xml'){
				
				t1[key] = {
					"description": temp['http://purl.org/dc/terms/description'], 
					"title": temp['http://purl.org/ASN/schema/core/comments'], 
					"subject": temp['http://purl.org/dc/terms/subject'], 
					"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
					"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
					"educationLevel": temp['http://purl.org/dc/terms/educationLevel'].length,
					"title": temp['http://purl.org/dc/elements/1.1/title'] 
				}

				var tempNode = {
					"name": t1[key]['description'],
					"id": key, 
				}

				if (key != "http://asn.jesandco.org/resources/D10003B9")
					tempNode.group = standard[t1[key].isPartOf[0].value]
				else
					tempNode.group = standard['http://asn.jesandco.org/resources/D10003B9']

				nodes.push(tempNode);

				index[key] = nodes.length - 1;

				if (t1[key].isChildOf != undefined){
					links.push({
						"source": t1[key].isChildOf[0].value, 
						"target": key,
						"value": 10
					});
				}
			}
		}

		if (nodes.length > 1500){
			console.log(nodes.length);
			console.log('t1 setup');
			loadBridges();
		}
	});

	d3.json('data/t2.json', function(data){
		for (key in data){
			var temp = data[key]
			//if (temp != undefined){
			//	console.log(temp[0].value);
			//
			if ((temp != undefined && key != 'http://asn.jesandco.org/resources/D100029D.xml') ){

				t2[key] = {
					"description": temp['http://purl.org/dc/terms/description'][0].value, 
					"comment": temp['http://purl.org/ASN/schema/core/comments'], 
					"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
					"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
					"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
					"educationLevel": temp['http://purl.org/dc/terms/educationLevel'].length, 
					"title": temp['http://purl.org/dc/elements/1.1/title'] 

				}

				var tempNode = {
					"name": t2[key]['description'],
					"id": key, 
				}

				if (key != "http://asn.jesandco.org/resources/D100029D")
					tempNode.group = standard[t2[key].isPartOf[0].value]
				else
					tempNode.group = standard['http://asn.jesandco.org/resources/D100029D']
				nodes.push(tempNode);

				index[key] = nodes.length - 1;

				if (t2[key].isChildOf != undefined){
					links.push({
						"source": t2[key].isChildOf[0].value, 
						"target": key,
						"value": 10
					});
				}
			}
		}

		if (nodes.length > 1500){
			console.log(nodes.length);
			console.log('t2 setup');
			loadBridges();
		}
	});
	console.log('returning something');
	return nodes;
}

var loadBridges = function(){
	console.log('drawing bridges');

	d3.csv('data/t1-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			links.push({
				"source": temp.subjectURI,
				"target": temp.objectURI, 
				"value": 0.4
			});
		}
		//once both sets of links are drown
		if (links.length > 2000){
			setUpForce();
		}
	});

	d3.csv('data/t2-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			links.push({
				"source": temp.subjectURI,
				"target": temp.objectURI, 
				"value": 0.4
			});
		}
		//once both sets of links are drown
		if (links.length > 2000){
			setUpForce();
		}
	});
}

console.log(nodes.length);
console.log(links.length);

console.log(s1);
console.log('nodemon works');

function generateIndex(){
	for (var i = 0; i < links.length; i++){
		links[i].source = index[links[i].source];
		links[i].target = index[links[i].target];
	}
}

function setUpForce(){

	generateIndex();

	//constants for SVG
	var width = 5000;
	var height = 3000;

	//set up colour scale
	var color = d3.scale.category20();

	//set up focus
	var focus_node = null, high_node = null;
	var outline = false
	var temp_color = null

	//set up force layout
	var force = d3.layout.force()
		.charge(-120)
		.linkDistance(30)
		.size([width, height]);

	//append svg to body
	var svg = d3.select("body").append("svg")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("preserveAspectRatio", "xMidYMid meet");

	force.nodes(nodes)
		.links(links)
		.start();

	var link = svg.selectAll(".link")
		.data(links)
		.enter().append('line')
		.attr('class', 'link')
		.style('stroke-width', function(d){
			return Math.sqrt(d.value)
		});

	var node = svg.selectAll('.node')
		.data(nodes)
		.enter().append('circle')
		.attr('class', 'node')
		.attr('r', 12)
		.attr('name', function(d){
			return d.name;
		})
		.style('fill', function(d){
			return color(d.group);
		})
		.on("mouseover", function(d){
			temp_color = d3.select(this).style('fill');
			d3.select(this).style('fill', color(4));
			$("#name").text(d3.select(this).attr('name'));
		})
		.on("mouseout", function(d){
			d3.select(this).style('fill', temp_color);
			$("#name").text("placeholder");
		});

	//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
	force.on("tick", function () {
	    link.attr("x1", function (d) {
	        return d.source.x;
	    })
	        .attr("y1", function (d) {
	        return d.source.y;
	    })
	        .attr("x2", function (d) {
	        return d.target.x;
	    })
	        .attr("y2", function (d) {
	        return d.target.y;
	    });

	    node.attr("cx", function (d) {
	        return d.x;
	    })
	        .attr("cy", function (d) {
	        return d.y;
	    });
	});
}

//Main Call
loadData();
/*

var updateLinks, updateNodes;

updateNodes = function() {
  var node;
  node = nodesG.selectAll("circle.node").data(curNodesData, function(d) {
    return d.id;
  });
  node.enter().append("circle").attr("class", "node").attr("cx", function(d) {
    return d.x;
  }).attr("cy", function(d) {
    return d.y;
  }).attr("r", function(d) {
    return d.radius;
  }).style("fill", function(d) {
    return nodeColors(d.artist);
  }).style("stroke", function(d) {
    return strokeFor(d);
  }).style("stroke-width", 1.0);
  node.on("mouseover", showDetails).on("mouseout", hideDetails);
  return node.exit().remove();
};

updateLinks = function() {
  var link;
  link = linksG.selectAll("line.link").data(curLinksData, function(d) {
    return d.source.id + "_" + d.target.id;
  });
  link.enter().append("line").attr("class", "link").attr("stroke", "#ddd").attr("stroke-opacity", 0.8).attr("x1", function(d) {
    return d.source.x;
  }).attr("y1", function(d) {
    return d.source.y;
  }).attr("x2", function(d) {
    return d.target.x;
  }).attr("y2", function(d) {
    return d.target.y;
  });
  return link.exit().remove();
};

// ---
// generated by coffee-script 1.9.2

//generating visualization
var Network = function() {
   	var height, network, update, width;
	width = 960;
    height = 800;

  	network = function(selection, data) {};

  	update = function() {
	  	var artists, curLinksData, curNodesData, link;
	  	curNodesData = filterNodes(allData.nodes);
	  	curLinksData = filterLinks(allData.links, curNodesData);
	  	if (layout === "radial") {
	    	artists = sortedArtists(curNodesData, curLinksData);
	   	 updateCenters(artists);
	  	}
	  	force.nodes(curNodesData);
	  	updateNodes();
	  	if (layout === "force") {
	    	force.links(curLinksData);
	   	 updateLinks();
	 	 } else {
	  	  force.links([]);
	   	 if (link) {
	   	   link.data([]).exit().remove();
	   	   link = null;
	   	 }
	  	}
	  	return force.start();
	};

	network.toggleLayout = function(newLayout) {};

	return network;
};

var myNetwork = Network();

d3.json("data/songs.json", function(json) {
  return myNetwork("#vis", json);
});

*/
