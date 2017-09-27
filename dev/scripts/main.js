$(function()  {	
	console.log('inist')
	var map;

	var service;

	var center;

	var markers = [];

	center = {lat: 49.283103, lng: -123.119290};

	map = new google.maps.Map(document.getElementById('map'), {
		center: center, 
		zoom: 11
	})

	var geocoder = new google.maps.Geocoder()

	var locationObject;


	function codeAddress() {
		var address = $('#address').val();
		geocoder.geocode({
			address: address
		}, function(results, status) {
				console.log('resultss',results)
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location)
				locationObject = results[0].geometry.location

				listPlaces(locationObject)
			}
		})
	}

	function listPlaces(location) {
		var request = {
			location: location, 
			rankby: 'distance', 
			type: ['restaurant'],
			radius: 3000
		}

		var service;
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function(results, status) {
			if (status == 'OK') {
				getMarkers(results)
				
			}
		})
	}


	function getMarkers(arrayOfPlaces) {
		$.each(arrayOfPlaces, function(index, place) {
			// console.log(place)
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			var marker = new google.maps.Marker({
				position: placeCoords, 
				address: placeAddress,
				name: placeName,
				map: map, 
				id: placeid,
				animation: google.maps.Animation.DROP
			})

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