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
		//convert radius into number, since it defaults to a string
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
			rankby: 'prominence', 
			openNow: true,
			radius: radius,
			type: ['restaurant']
		}

		var service;
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function(results, status) {
			if (status == 'OK') {
				console.log(results)
				results.sort(function(a,b) {
					return b.rating - a.rating
				})
				var toMarkers = [];
				results.map(function(place, index) {
					if (index < 5) {
						toMarkers.push(place)
					}
				})
				getMarkers(toMarkers, 'restaurant')

				$.each(toMarkers, function(index, place) {
					$('#list').append($('<div>').append(`<li>${place.name} / ${place.rating}</li>`))
				})

			}
		})

		// var request1 = {
		// 	location: location, 
		// 	rankby: 'prominence', 
		// 	type: ['bank'],
		// 	radius: radius
		// }

		// var service1;
		// service1 = new google.maps.places.PlacesService(map);
		// service1.nearbySearch(request1, function(results, status) {
		// 	if (status == 'OK') {
		// 		results.sort(function(a,b) {
		// 			return b.rating - a.rating
		// 		})

		// 		var toMarkers = [];
		// 		results.map(function(place, index) {
		// 			if (index < 5) {
		// 				toMarkers.push(place)
		// 			}
		// 		})
		// 		getMarkers(toMarkers, 'ban')

		// 		$.each(toMarkers, function(index, place) {
		// 			$('#list2').append($('<div>').append(`<li>${place.name} / ${place.rating}</li>`))
		// 		})
		// 	}
		// })
	}

	var centerPoint;
	var centerCircle;

	function centerMarker(location, radius) {
		if (centerPoint || centerCircle) {
			centerPoint.setMap(null)
			centerCircle.setMap(null)
		} else {
		}
		centerPoint = new google.maps.Marker({
			position: location, 
			map: map, 
			animation: google.maps.Animation.DROP,
			icon: '../../assets/placeholder.png'
		})

		centerCircle = new google.maps.Circle({
			map: map,
			radius: radius,
			strokeWeight: 1, 
			strokeColor: 'rgba(255,255,255,.1)'
		})

		centerCircle.bindTo('center', centerPoint, 'position')

		//center map on center marker
		map.setCenter(centerPoint.position)

		var zoomin = radiusToZoom(radius)
		
		//automatically zoom map to fit the radius of the circle overlay
		map.setZoom(zoomin)
	}



	function getMarkers(arrayOfPlaces, icon) {
		hideListings();

		$.each(arrayOfPlaces, function(index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			var iconType;

			if (icon === 'bank') {
				iconType = '../../assets/money-bag.png'
			} else if (icon === 'restaurant'){
				iconType = '../../assets/store.png'
			}
			var marker = new google.maps.Marker({
				position: placeCoords, 
				address: placeAddress,
				name: placeName,
				map: map, 
				id: placeid,
				animation: google.maps.Animation.DROP
			})


			markers.push(marker)

			marker.addListener('mouseover', function() {
				// marker.setAnimation(google.maps.Animation.BOUNCE)
				marker.setIcon('../../assets/money-bag.png')
			})
			marker.addListener('mouseout', function() {
				// marker.setAnimation(null)
				marker.setIcon(null)
			})

			marker.addListener('click', function() {

				var deets = this;

				var request = {
					placeId: deets.id
				}

				var service;
				service = new google.maps.places.PlacesService(map);
				service.getDetails(request, function(results, status) {

					if (status == google.maps.places.PlacesServiceStatus.OK) {
						$('a#name').text(results.name).attr('id', results.place_id).addClass('feat')
						console.log(results)
					}
				})
			})
		})
	}
	


	$('#gotime').on('click', function() {
		codeAddress()
	})

	$('a#name').on('mouseover', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(google.maps.Animation.BOUNCE)
			}
		})
	})

	$('a#name').on('mouseout', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(null)
			}
		})
	})




	function hideListings() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
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

})