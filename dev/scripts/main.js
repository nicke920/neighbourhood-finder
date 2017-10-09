$(function()  {	
	console.log('inist')
	var map;

	var service;

	var center;

	//markers that are gonna show on map
	var markers = [];

	center = {lat: 49.283103, lng: -123.119290};

	map = new google.maps.Map(document.getElementById('map'), {
		center: center, 
		zoom: 8
	})

	var geocoder = new google.maps.Geocoder()

	//gets the lat lng function of the postal code entered
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

				setTextAboutCity(results[0].address_components[1].long_name, results[0].formatted_address)

			}
		})
	}

	function listPlaces(location, radius) {
		hideListings();
		
		var request = {
			location: location, 
			rankby: 'prominence', 
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

				var toMarkersRestaurant = [];
				results.map(function(place, index) {
					if (index < 5) {
						toMarkersRestaurant.push(place)
					}
				})

				getMarkers(toMarkersRestaurant, 'restaurant')

				$('.dropdown-restaurant #list').empty();

				$.each(toMarkersRestaurant, function(index, place) {
					console.log('poalce', place)
					$('.dropdown-restaurant #list').append($('<div>').append(`<li id='${place.place_id}'>${place.name} / ${place.rating}</li>`))
				})

			}
		})

		var cafeRequest = {
			location: location, 
			rankby: 'prominence',
			radius: radius, 
			type: ['cafe']
		}

		var cafeService;
		cafeService = new google.maps.places.PlacesService(map);
		cafeService.nearbySearch(cafeRequest, function(results, status) {
			if (status == 'OK') {
				
				results.sort(function(a,b) {
					return b.rating - a.rating
				})

				var toMarkersCafe = [];

				results.map(function(place, index) {
					if (index < 5) {
						toMarkersCafe.push(place)
					}
				})

				console.log('rezzies', toMarkersCafe)



				getMarkers(toMarkersCafe, 'cafe')

				$('.dropdown-cafe #list').empty();

				$.each(toMarkersCafe, function(index, place) {
					$('.dropdown-cafe #list').append($('<div>').append(`<li id='${place.place_id}'>${place.name} / ${place.rating}</li>`))
				})
			}
		})

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

		$.each(arrayOfPlaces, function(index, place) {
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

			//on click, get details of the marker
			marker.addListener('click', function() {
				var deets = this;

				var request = {
					placeId: deets.id
				}

				var service;
				service = new google.maps.places.PlacesService(map);
				service.getDetails(request, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						//added attr so that when they hover over the list item, marker goes up and down
						setFeatListingText(results)
					}
				})
			})
		})
	}
	







	$('#gotime').on('click', function() {
		codeAddress();
		$('html, body').animate({
			scrollTop: $('#mapSection').offset().top
		}, 2000);
		$('#about').hide();
		$('.hero').addClass('searched')
		$('.main-copy-searched').show();
		$('.main-copy').hide();
	})

	$('.dropdown h3').on('click', function() {
		$(this).parent().find('#list').toggle();
	})

	$(document).on('click', '#list div li', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				var request = {
					placeId: val.id
				}

				var service;
				service = new google.maps.places.PlacesService(map);
				service.getDetails(request, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						//added attr so that when they hover over the list item, marker goes up and down
						setFeatListingText(results)
					}
				})
			}
		})
	})

	$(document).on('mouseover', '#list div li, .feat-listing-name', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				console.log('va', val)
				markers[ind].setAnimation(google.maps.Animation.BOUNCE)
			}
		})
	})

	$(document).on('mouseout', '#list div li, .feat-listing-name', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(null)
			}
		})
	})



	function setFeatListingText(results) {
		$('.feat-listing-name').text(results.name).attr('id', results.place_id).addClass('feat')
		$('.feat-listing-address').text(results.formatted_address)
		$('.feat-listing-phone').text(results.formatted_phone_number)
		$('.feat-listing-website').text(results.website)
		$('.feat-listing-rating').text(results.rating)
	}




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

	function setTextAboutCity(cityName, fullCityName) {
		$('.area-name').text(cityName)
		$('.full-area-name').text(fullCityName)
	}


	//SMOOTH SCROLL 
	$('a[href*="#"]:not([href="#"])').click(function() {
	  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	    var target = $(this.hash);
	    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	    if (target.length) {
	      $('html, body').animate({
	        scrollTop: target.offset().top
	      }, 1000);
	      return false;
	    }
	  }
	});
	
	$('#about-nav').on('click', function() {
			$('html, body').animate({
		        scrollTop: $('#about').offset().top
		    }, 1000);
	})

})







