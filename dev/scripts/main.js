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
				console.log(results)
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
			radius: 10000, 
			type: ['restaurant']
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
			console.log('1', place.name + ' ' + index)
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;

			var marker = new google.maps.Marker({
				position: placeCoords, 
				address: placeAddress,
				name: placeName,
				map: map, 
				animation: google.maps.Animation.DROP
			})

			markers.push(marker)

		})
	}
	

	$('#gotime').on('click', function() {
		codeAddress()
	})

})