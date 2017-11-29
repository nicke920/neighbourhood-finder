$(function()  {	

	var map;

	var service;

	var center;

	//markers that are gonna show on map
	var markers = [];

	var styles = [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 65
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": "50"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
            {
                "lightness": "30"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "lightness": "40"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#ffff00"
            },
            {
                "lightness": -25
            },
            {
                "saturation": -97
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "lightness": -25
            },
            {
                "saturation": -100
            }
        ]
    }
]

	center = {lat: 49.283103, lng: -123.119290};

	map = new google.maps.Map(document.getElementById('map'), {
		center: center, 
		zoom: 9,
		styles: styles
	})
	var transitLayer = new google.maps.TransitLayer();

	var bikeLayer = new google.maps.BicyclingLayer();

	var trafficLayer = new google.maps.TrafficLayer();



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
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location)

				locationObject = results[0].geometry.location

				//populate city details in top bar
				$('.city-name').text(results[0].formatted_address)
				$('.results-radius').text(rad)

				listPlaces(locationObject, rad)

				centerMarker(locationObject, rad)

			}
		})
	}

	function listPlaces(location, radius) {
		hideListings();

		var toMarkersRestaurant = []
		var toMarkersCafes = [];
		var toMarkersDoctors = [];
		var toMarkersSchool = [];
		var toMarkersBank = [];
		var toMarkersBar = [];
		var toMarkersTransit = [];

		var sumOfRatings = []
		var avg = 0;
		var totalPlaces = 0;

		function top5Search(theMarkersArray, requestType, location, radius) {
			var request = {
				location: location, 
				rankby: 'prominence', 
				radius: radius,
				type: requestType
			}

			var service;
			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, function(results, status) {
				if (status == 'OK') {
					results.map(function(place, index) {
						if (place.rating !== undefined) {
							avg += place.rating
							totalPlaces += 1
							sumOfRatings.push(place.rating)
						}
					})
					$('.avg-area-rating').text((avg / totalPlaces).toFixed(2))


					results.filter(function(el) {
						return el.rating !== undefined
					}).sort(function(a,b) {
						return (b.rating - a.rating)
					}).map(function(place, index) {
						if (index < 5) {
							theMarkersArray.push(place)
						}
					})


					function pattern(requestType) {
						if (requestType === requestType) {
							getMarkers(theMarkersArray, `${requestType}`)

							if (typeof requestType !== "string") {
								requestType = requestType[0]
							}

							$(`.dropdown-${requestType} #list`).empty();

							$.each(theMarkersArray, function(index, place) {
								var isOpenText;
								var photoURL;

								if (place.opening_hours && place.opening_hours.open_now === true) {
									isOpenText = "Open"
								} else {
									isOpenText = ""
								}

								if ($(place.photos).length > 0) {
									photoURL = place.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000})
								} else {
									photoURL = "https://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716"
								}

								$(`.dropdown-${requestType} #list`).append(
									`<li id='${place.place_id}' class='result-tile'>
										<a>
											<h3>${place.name}</h3>
											<div class="result-detail">
												<div class="result-image">
													<img src="${photoURL}" alt="" />
												</div>
												<div class="result-description">
													<h5><i class="fa fa-map-marker" aria-hidden="true"></i>${place.vicinity}</h5>
													<div class="rating-div">
														${starRatings(place.rating)}
													</div>
												</div>
											</div>
										</a>
									</li>`
									)
							})
						}
					}
					pattern(requestType)

				}
			})
			console.log('the markers array', theMarkersArray)
		}

		top5Search(toMarkersRestaurant, 'restaurant', location, radius)
		top5Search(toMarkersCafes, 'cafe', location, radius)
		top5Search(toMarkersDoctors, 'doctor', location, radius)
		top5Search(toMarkersSchool, 'school', location, radius)
		top5Search(toMarkersBank, 'bank', location, radius)
		top5Search(toMarkersBar, ['bar', 'night_club'] , location, radius)



	}





	var centerPoint;
	var centerCircle;

	function centerMarker(location, radius) {


		function settingCenterMarker(whichMap) {
			if (centerPoint || centerCircle) {
				centerPoint.setMap(null)
				centerCircle.setMap(null)
			}

			centerPoint = new google.maps.Marker({
				position: location, 
				map: whichMap, 
				animation: google.maps.Animation.DROP,
				icon: '../../assets/placeholder.png'
			})

			centerCircle = new google.maps.Circle({
				map: whichMap,
				radius: radius,
				strokeWeight: 1, 
				strokeColor: '#607D8B',
				// fillColor: 'rgba(255,255,255,1)',
				fillOpacity: 0
			})

			centerCircle.bindTo('center', centerPoint, 'position')

			//center map on center marker
			

			function settingTheCenter() {
				// console.log('center set')
				whichMap.setCenter(centerPoint.position)

				var zoomin = radiusToZoom(radius) 
				
				//automatically zoom map to fit the radius of the circle overlay
				whichMap.setZoom(zoomin)

			}

			settingTheCenter();
			
			$('#setTheCenter').on('click', function() {
				settingTheCenter();
			})

		}

		settingCenterMarker(map)


	}



	function getMarkers(arrayOfPlaces, icon) {

		$.each(arrayOfPlaces, function(index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;


			var typeOfIcon;
			if (icon === 'cafe') {
				typeOfIcon = '../../assets/001-hot-coffee-rounded-cup-on-a-plate-from-side-view.png'
			} else if (icon === 'doctor') {
				typeOfIcon = '../../assets/004-medicine-briefcase.png'
			} else if (icon === 'school') {
				typeOfIcon = '../../assets/003-college-graduation.png'
			} else if (icon === 'bank') {
				typeOfIcon = '../../assets/002-bank-building.png'
			} else if (icon === 'restaurant') {
				typeOfIcon = '../../assets/006-restaurant-cutlery-circular-symbol-of-a-spoon-and-a-fork-in-a-circle.png'
			} else if (icon === 'bar,night_club') {
				typeOfIcon = '../../assets/005-drink-beer-jar.png'
			} 

			var marker = new google.maps.Marker({
				position: placeCoords, 
				address: placeAddress,
				name: placeName,
				map: map, 
				id: placeid,
				animation: google.maps.Animation.DROP,
				icon: typeOfIcon
			})

			markers.push(marker)
			
			if (icon === 'bank' || icon === 'school' || icon === 'doctor') {
				marker.setMap(null)
			}
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
						setFeatListingText(results)
					}
				})
			})
		})

	}




	$('.mapCheck').on('change', function() {
		// console.log(this)
		if ($(this).attr('checked')) {
			$(this).removeAttr('checked')

			var n = $(this).parent().parent().find('#list').children();

			$.each(n, function(ind, val) {

				var ids = $(val).find('li').attr('id')

				$.each(markers, function(ind, val) {
					if (ids === val.id) {
						markers[ind].setMap(null)
					}
				})

			})
		} else {
			$(this).attr('checked', 'true')

			var n = $(this).parent().parent().find('#list').children();

			$.each(n, function(ind, val) {
				// console.log('s', $(val).find('li').attr('id'))
				var ids = $(val).find('li').attr('id')

				$.each(markers, function(ind, val) {
					if (ids === val.id) {
						markers[ind].setMap(map)
					}
				})

			})
		}
		
		// console.log('asd', n)
	})



	//EVENT LISTENERS
	$('li.result-tab a.hover-link').on('click', function() {
		$('.result-tab a.hover-link').removeClass('selected')
		$(this).addClass('selected')
		var tabAttr = $(this).attr('category')
		$('.listings-nav.dropdown').removeClass('active');
		$(`.listings-nav.dropdown[category="${tabAttr}"]`).addClass('active')
		$(this).parent().parent().parent().addClass('opened')
	})


	$('form.home-search').on('submit', function(e) {
		e.preventDefault();
		$('.hero').hide();
		$('.about-us').hide();


		$('body').addClass('searched')
		codeAddress();
		$('#about').hide();
		$('.hero').addClass('searched')
		$('.main-copy-searched').show();
		$('.main-copy').hide();
		// $('html, body').animate({
		// 	scrollTop: $('#mapSection').offset().top
		// }, 2000);
	})

	//open and close dropdown menu in results
	$('.result-card').on('click', function(e) {

		if (!$(this).hasClass('open')) {
			$('.result-card > ul').slideUp();
			$(this).find('ul').slideDown();
			$('.result-card').removeClass('open')
			$(this).addClass('open')
		} else {
			$('.result-card > ul').slideUp();
			$('.result-card').removeClass('open')
		}

	})

	//toggle transit layer
	$('#showTransit').on('click', function() {
		$('body').toggleClass('transitLayerActive')

		if ($('body').hasClass('transitLayerActive')) {
			transitLayer.setMap(map)
		} else {
			transitLayer.setMap(null)
		}

	})

	//toggle bike layer
	$('#showBikes').on('click', function() {
		$('body').toggleClass('bikeLayerActive')

		if ($('body').hasClass('bikeLayerActive')) {
			bikeLayer.setMap(map)
		} else {
			bikeLayer.setMap(null)
		}
		
	})

	//toggle traffic layer
	$('#showTraffic').on('click', function() {
		$('body').toggleClass('trafficLayerActive')

		if ($('body').hasClass('trafficLayerActive')) {
			trafficLayer.setMap(map)
		} else {
			trafficLayer.setMap(null)
		}
		
	})



	$(document).on('click', '#list > li', function() {
		// console.log('wok')
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

	$(document).on('mouseover', '#list > li, .feat-listing-name', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				// console.log('va', val)
				markers[ind].setAnimation(google.maps.Animation.BOUNCE)
			}
		})
	})

	$(document).on('mouseout', '#list > li, .feat-listing-name', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(null)
			}
		})
	})



	function setFeatListingText(results) {
		var photoUrl = results.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000})
		$('.feat-listing-name').text(results.name).attr('id', results.place_id).addClass('feat')
		$('.feat-listing-address').text(results.formatted_address)
		$('.feat-listing-phone').text(results.formatted_phone_number)
		$('.feat-listing-website').text(results.website)
		$('.feat-listing-rating').text(results.rating)
		$('.feat-listing-image').attr('src', photoUrl)
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

	$('.secondary-navbar i.fa-bars').on('click', function() {
		$(this).parent().toggleClass('secondary-search-open')
	})



	function starRatings(rating) {
		// console.log('working', rating)
		var ratingOutput;
		if (rating > 4.8) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 4.2 && rating <= 4.7) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 3.8 && rating <= 4.2) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 3.2 && rating <= 3.8) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 2.8 && rating <= 3.2) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 2.2 && rating <= 2.8) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating > 1.8 && rating <= 2.2) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else if (rating <= 1.8 ) {
			ratingOutput = `<i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><span>(${rating})</span>`
		} else {
			ratingOutput = `<p>No Rating</p>`
		}
		return ratingOutput
	}


})







