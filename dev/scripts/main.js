$(function()  {	
	console.log('inist')
	var map;

	var service;

	var center;

	center = {lat: 49.283103, lng: -123.119290};

	map = new google.maps.Map(document.getElementById('map'), {
		center: center, 
		zoom: 11
	})

	var geocoder = new google.maps.Geocoder()

	var locationObject;


	function codeAddress() {
		console.log('fucntion fired')
		var address = $('#address').val();
		geocoder.geocode({
			address: address
		}, function(results, status) {
				console.log(results)
				console.log(status)
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location)
				locationObject = results[0].geometry.location
				console.log('87asdf', locationObject)
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
			console.log('nigga', results)
			if (status == 'OK') {
				console.log('okayed')
			}
		})

	}
	

	$('#gotime').on('click', function() {
		codeAddress()
	})

})