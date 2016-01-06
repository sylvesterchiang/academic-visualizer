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

var s1 = {};
var t1 = {};
var t2 = {};

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
				"educationLevel": temp['http://purl.org/dc/terms/educationLevel'], 
			}

			nodes.push({
				"name": s1[key]['description'],
				"id": key
			});

			if (s1[key].isChildOf != undefined){
				links.push({
					"source": s1[key].isChildOf[0].value, 
					"target": key
				});
			}
		}
	}
});

d3.json('data/t1.json', function(data){
	for (key in data){
		console.log(data);
		var temp = data[key]

		if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003B9.xml'){
			
			console.log(key);
			t1[key] = {
				"description": temp['http://purl.org/dc/terms/description'][0].value, 
				"comment": temp['http://purl.org/ASN/schema/core/comments'], 
				"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
				"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
				"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
				"educationLevel": temp['http://purl.org/dc/terms/educationLevel'], 
			}

			nodes.push({
				"name": t1[key]['description'],
				"id": key
			});

			if (t1[key].isChildOf != undefined){
				links.push({
					"source": t1[key].isChildOf[0].value, 
					"target": key
				});
			}
		}
	}
});

d3.json('data/t2.json', function(data){
	for (key in data){
		var temp = data[key]
		//if (temp != undefined){
		//	console.log(temp[0].value);
		//
		if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003FB.xml'){
			t2[key] = {
				"description": temp['http://purl.org/dc/terms/description'][0].value, 
				"comment": temp['http://purl.org/ASN/schema/core/comments'], 
				"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
				"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
				"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
				"educationLevel": temp['http://purl.org/dc/terms/educationLevel'], 
			}

			nodes.push({
				"name": t2[key]['description'],
				"id": key
			});
		}

		if (t2[key].isChildOf != undefined){
				links.push({
					"source": t2[key].isChildOf[0].value, 
					"target": key
				});
			}
	}
});

//d3.csv('data/t1-s1.csv')

console.log(nodes.length);
console.log(links.length);

console.log(s1);
console.log('nodemon works');

//generating visualization
var Network = function() {
  var height, network, update, width;
  width = 960;
  height = 800;
  network = function(selection, data) {};
  update = function() {};
  network.toggleLayout = function(newLayout) {};
  return network;
};

var myNetwork = Network();

d3.json("data/songs.json", function(json) {
  return myNetwork("#vis", json);
});
