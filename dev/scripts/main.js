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
			}
		})
	}


	$('#gotime').on('click', function() {
		codeAddress()
	})

})