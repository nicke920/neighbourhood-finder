$(function()  {	
	console.log('inist')
	var map;

	var service;

	var center;

	var markers = [];

	center = {lat: 49.283103, lng: -123.119290};

	map = new google.maps.Map(document.getElementById('map'), {
		center: center, 
		zoom: 8
	})

	var geocoder = new google.maps.Geocoder()

	var locationObject;


	function codeAddress() {
		var address = $('#address').val();
		var rad = $('#radius').val();
		rad = parseInt(rad)


		geocoder.geocode({
			address: address
		}, function(results, status) {
				console.log('resultss',results)
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location)

				locationObject = results[0].geometry.location

				listPlaces(locationObject, rad)

				centerMarker(locationObject, rad)
			}
		})
	}

	function listPlaces(location, radius) {
		
		var request = {
			location: location, 
			rankby: 'distance', 
			type: ['restaurant'],
			radius: radius
		}

		var service;
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function(results, status) {
			if (status == 'OK') {
				getMarkers(results)
			}
		})
	}

	function centerMarker(location, radius) {
		var marker = new google.maps.Marker({
			position: location, 
			map: map, 
			animation: google.maps.Animation.DROP,
			icon: '../../assets/placeholder.png'
		})

		var circle = new google.maps.Circle({
			map: map,
			radius: radius,
			strokeWeight: 1, 
			strokeColor: 'rgba(255,255,255,.1)'
		})

		circle.bindTo('center', marker, 'position')

		map.setCenter(marker.position)
		var zoomin = radiusToZoom(radius)
		
		map.setZoom(zoomin)
	}

	function radiusToZoom( r ){
	    var w = $('#map').width();
	    var d = r * 2;
	    var zooms = [,21282,16355,10064,5540,2909,1485,752,378,190,95,48,24,12,6,3,1.48,0.74,0.37,0.19];
	    var z = 20, m;
	    while( zooms[--z] ){
	        m = zooms[z] * w;
	        if( d < m ){
	            break;
	        }
	    }
	    return z;
	}

	function getMarkers(arrayOfPlaces) {
		var bounds = new google.maps.LatLngBounds();

		$.each(arrayOfPlaces, function(index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			bounds.extend(placeCoords)

			var marker = new google.maps.Marker({
				position: placeCoords, 
				address: placeAddress,
				name: placeName,
				map: map, 
				id: placeid,
				animation: google.maps.Animation.DROP
			})

			// map.fitBounds(bounds)

			markers.push(marker)

			marker.addListener('click', function() {
				console.log('clicked')
				var deets = this;

				var request = {
					placeId: deets.id
				}

				var service;
				service = new google.maps.places.PlacesService(map);
				service.getDetails(request, function(results, status) {
					console.log('22', results)
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						console.log('reqqqq', results.name)
						$('h1#name').text(results.name)
					}
				})
			})
		})
	}
	

	$('#gotime').on('click', function() {
		codeAddress()
	})

})