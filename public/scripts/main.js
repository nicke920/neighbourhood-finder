(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

$(function () {

	var map;

	var service;

	var center;

	//markers that are gonna show on map
	var markers = [];

	var styles = [{
		"featureType": "administrative",
		"elementType": "all",
		"stylers": [{
			"saturation": "-100"
		}]
	}, {
		"featureType": "administrative.province",
		"elementType": "all",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [{
			"saturation": -100
		}, {
			"lightness": 65
		}, {
			"visibility": "on"
		}]
	}, {
		"featureType": "poi",
		"elementType": "all",
		"stylers": [{
			"saturation": -100
		}, {
			"lightness": "50"
		}, {
			"visibility": "simplified"
		}]
	}, {
		"featureType": "road",
		"elementType": "all",
		"stylers": [{
			"saturation": "-100"
		}]
	}, {
		"featureType": "road.highway",
		"elementType": "all",
		"stylers": [{
			"visibility": "simplified"
		}]
	}, {
		"featureType": "road.arterial",
		"elementType": "all",
		"stylers": [{
			"lightness": "30"
		}]
	}, {
		"featureType": "road.local",
		"elementType": "all",
		"stylers": [{
			"lightness": "40"
		}]
	}, {
		"featureType": "transit",
		"elementType": "all",
		"stylers": [{
			"saturation": -100
		}, {
			"visibility": "simplified"
		}]
	}, {
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [{
			"hue": "#ffff00"
		}, {
			"lightness": -25
		}, {
			"saturation": -97
		}]
	}, {
		"featureType": "water",
		"elementType": "labels",
		"stylers": [{
			"lightness": -25
		}, {
			"saturation": -100
		}]
	}];

	center = { lat: 49.283103, lng: -123.119290 };

	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 9,
		styles: styles
	});

	var transitLayer = new google.maps.TransitLayer();

	var bikeLayer = new google.maps.BicyclingLayer();

	var trafficLayer = new google.maps.TrafficLayer();

	var geocoder = new google.maps.Geocoder();

	//gets the lat lng function of the postal code entered
	var locationObject;

	function codeAddress() {
		var address = $('#address').val();
		var rad = $('#radius').val();
		//convert radius into number, since it defaults to a string
		rad = parseInt(rad);

		geocoder.geocode({
			address: address
		}, function (results, status) {
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location);

				locationObject = results[0].geometry.location;

				//populate city details in top bar
				$('.city-name').text(results[0].formatted_address);
				$('.results-radius').text(rad);

				listPlaces(locationObject, rad);

				centerMarker(locationObject, rad);
			}
		});
	}

	function listPlaces(location, radius) {
		hideListings();

		var toMarkersRestaurant = [];
		var toMarkersCafes = [];
		var toMarkersDoctors = [];
		var toMarkersSchool = [];
		var toMarkersBank = [];
		var toMarkersBar = [];
		var toMarkersGym = [];
		var toMarkersTransit = [];

		var sumOfRatings = [];
		var avg = 0;
		var totalPlaces = 0;

		function top5Search(theMarkersArray, requestType, location, radius) {
			var request = {
				location: location,
				rankby: 'prominence',
				radius: radius,
				type: requestType
			};

			var service;
			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, function (results, status) {
				if (status == 'OK') {
					var pattern = function pattern(requestType) {
						if (requestType === requestType) {
							getMarkers(theMarkersArray, "" + requestType);

							if (typeof requestType !== "string") {
								requestType = requestType[0];
							}

							$(".dropdown-" + requestType + " #list").empty();

							$.each(theMarkersArray, function (index, place) {
								var isOpenText;
								var photoURL;

								if ($(place.photos).length > 0) {
									photoURL = place.photos[0].getUrl({ 'maxWidth': 1000, 'maxHeight': 1000 });
								} else {
									photoURL = "https://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716";
								}

								$(".dropdown-" + requestType + " #list").append("<li id='" + place.place_id + "' class='result-tile'>\n\t\t\t\t\t\t\t\t\t\t<a>\n\t\t\t\t\t\t\t\t\t\t\t<h3>" + place.name + "</h3>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-detail\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-image\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"" + photoURL + "\" alt=\"\" />\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-description\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<h5><i class=\"fa fa-map-marker\" aria-hidden=\"true\"></i>" + place.vicinity + "</h5>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"rating-div\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + starRatings(place.rating) + "\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t</li>");
							});
						}
					};

					results.map(function (place, index) {
						if (place.rating !== undefined) {
							avg += place.rating;
							totalPlaces += 1;
							sumOfRatings.push(place.rating);
						}
					});
					$('.avg-area-rating').text((avg / totalPlaces).toFixed(2));

					results.filter(function (el) {
						return el.rating !== undefined;
					}).sort(function (a, b) {
						return b.rating - a.rating;
					}).map(function (place, index) {
						if (index < 5) {
							theMarkersArray.push(place);
						}
					});

					pattern(requestType);
				}
			});
			console.log('the markers array', theMarkersArray);
		}

		top5Search(toMarkersRestaurant, 'restaurant', location, radius);
		top5Search(toMarkersCafes, 'cafe', location, radius);
		top5Search(toMarkersDoctors, 'doctor', location, radius);
		top5Search(toMarkersSchool, 'school', location, radius);
		top5Search(toMarkersBank, 'bank', location, radius);
		top5Search(toMarkersBar, ['bar', 'night_club'], location, radius);
		top5Search(toMarkersGym, 'gym', location, radius);
	}

	var centerPoint;
	var centerCircle;

	function centerMarker(location, radius) {

		settingCenterMarker(map, location, radius);
	}

	function getMarkers(arrayOfPlaces, icon) {
		console.log('AOP', arrayOfPlaces);

		$.each(arrayOfPlaces, function (index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			var typeOfIcon;
			if (icon === 'cafe') {
				typeOfIcon = '../../assets/001-hot-coffee-rounded-cup-on-a-plate-from-side-view.png';
			} else if (icon === 'doctor') {
				typeOfIcon = '../../assets/004-medicine-briefcase.png';
			} else if (icon === 'school') {
				typeOfIcon = '../../assets/003-college-graduation.png';
			} else if (icon === 'bank') {
				typeOfIcon = '../../assets/002-bank-building.png';
			} else if (icon === 'restaurant') {
				typeOfIcon = '../../assets/006-restaurant-cutlery-circular-symbol-of-a-spoon-and-a-fork-in-a-circle.png';
			} else if (icon === 'bar,night_club') {
				typeOfIcon = '../../assets/005-drink-beer-jar.png';
			} else if (icon === 'gym') {
				typeOfIcon = '../../assets/barbell.png';
			}

			var marker = new google.maps.Marker({
				position: placeCoords,
				address: placeAddress,
				name: placeName,
				map: map,
				id: placeid,
				animation: google.maps.Animation.DROP,
				icon: typeOfIcon,
				allDeets: place
			});

			markers.push(marker);

			//on click, get details of the marker
			marker.addListener('click', function () {

				var deets = this;

				var request = {
					placeId: deets.id
				};

				var service;
				service = new google.maps.places.PlacesService(map);

				service.getDetails(request, function (results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {

						setFeatListingText(results);
					}
				});
			});
		});
	}

	$('.mapCheck').on('change', function () {
		// console.log(this)
		if ($(this).attr('checked')) {
			$(this).removeAttr('checked');

			var n = $(this).parent().parent().find('#list').children();

			$.each(n, function (ind, val) {

				var ids = $(val).find('li').attr('id');

				$.each(markers, function (ind, val) {
					if (ids === val.id) {
						markers[ind].setMap(null);
					}
				});
			});
		} else {
			$(this).attr('checked', 'true');

			var n = $(this).parent().parent().find('#list').children();

			$.each(n, function (ind, val) {
				// console.log('s', $(val).find('li').attr('id'))
				var ids = $(val).find('li').attr('id');

				$.each(markers, function (ind, val) {
					if (ids === val.id) {
						markers[ind].setMap(map);
					}
				});
			});
		}

		// console.log('asd', n)
	});

	//EVENT LISTENERS
	$('li.result-tab a.hover-link').on('click', function () {
		$('.result-tab a.hover-link').removeClass('selected');
		$(this).addClass('selected');
		var tabAttr = $(this).attr('category');
		$('.listings-nav.dropdown').removeClass('active');
		$(".listings-nav.dropdown[category=\"" + tabAttr + "\"]").addClass('active');
		$(this).parent().parent().parent().addClass('opened');
	});

	$('form.home-search').on('submit', function (e) {
		e.preventDefault();
		$('.hero').hide();
		$('.about-us').hide();

		$('body').addClass('searched');
		codeAddress();
		$('#about').hide();
		$('.hero').addClass('searched');
		$('.main-copy-searched').show();
		$('.main-copy').hide();

		$('#address').text('');
		$('#radius').text('');
	});

	//open and close dropdown menu in results
	$('.result-card-description').on('click', function (e) {

		if (!$(this).parent().hasClass('open')) {
			$('.result-card > ul').slideUp();
			$(this).parent().find('ul').slideDown();
			$('.result-card').removeClass('open');
			$(this).parent().addClass('open');
		} else {
			$('.result-card > ul').slideUp();
			$('.result-card').removeClass('open');
		}
	});

	//toggle transit layer
	$('#showTransit').on('click', function () {
		$('body').toggleClass('transitLayerActive');

		if ($('body').hasClass('transitLayerActive')) {
			transitLayer.setMap(map);
		} else {
			transitLayer.setMap(null);
		}
	});

	//toggle bike layer
	$('#showBikes').on('click', function () {
		$('body').toggleClass('bikeLayerActive');

		if ($('body').hasClass('bikeLayerActive')) {
			bikeLayer.setMap(map);
		} else {
			bikeLayer.setMap(null);
		}
	});

	//toggle traffic layer
	$('#showTraffic').on('click', function () {
		$('body').toggleClass('trafficLayerActive');

		if ($('body').hasClass('trafficLayerActive')) {
			trafficLayer.setMap(map);
		} else {
			trafficLayer.setMap(null);
		}
	});

	$(document).on('click', '#list > li', function () {
		var details = this;

		var request = {
			placeId: details.id
		};

		var service;
		service = new google.maps.places.PlacesService(map);

		service.getDetails(request, function (results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				setFeatListingText(results);
				console.log('resssss', results);

				var markerLocation = results.geometry.location;

				settingTheCenter(map, 5, markerLocation);
			}
		});
	});

	//hovering over list item makes its respective marker bounce
	$(document).on('mouseover', '#list > li', function () {
		var that = this;
		$.each(markers, function (ind, val) {
			if ($(that).attr('id') === val.id) {
				console.log('va', val.id);
				markers[ind].setAnimation(google.maps.Animation.BOUNCE);
			}
		});
	});

	$(document).on('mouseout', '#list > li', function () {
		var that = this;
		$.each(markers, function (ind, val) {
			console.log('88');
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(null);
			}
		});
	});

	$('.place-toggle-slide').on('click', function () {
		$('body').removeClass('place-details-active');
	});

	function setFeatListingText(results) {
		var photoUrl;
		var photosArray;

		if (results.photos !== undefined) {
			var initFlickity = function initFlickity() {
				$('.main-carousel').flickity({
					imagesLoaded: true,
					percentPosition: false,
					wrapAround: true
				});
			};

			var theloop = function theloop() {
				$('.main-carousel').flickity('destroy');
				$('.main-carousel').empty();

				$.each(photosArray, function (ind, val) {
					var arrPhotoUrl = val.getUrl({ 'maxWidth': 1000, 'maxHeight': 1000 });
					$('.main-carousel').append("<img src=\"" + arrPhotoUrl + "\" alt=\"\" class=\"carousel-cell\"/>");
				});
			};

			photoUrl = results.photos[0].getUrl({ 'maxWidth': 1000, 'maxHeight': 1000 });
			photosArray = results.photos;

			$('.photo-carousel-length').text("(" + photosArray.length + ")");

			$.when(theloop()).then(initFlickity());
		} else {
			photoUrl = '../../assets/grey.jpg';
		}

		var isOpenText;
		var weeklyHours;
		if (results.opening_hours && results.opening_hours.open_now === true) {
			$('.place-hours > p').on('click', function () {
				$(this).parent().find('ul.place-open-list').slideToggle();
			});
			isOpenText = "Open Now";
			weeklyHours = results.opening_hours.weekday_text;
			$.each(weeklyHours, function (ind, val) {
				$('.place-open-list').append("<li class=\"week-hours\">" + val + "</li>");
			});
		} else {
			isOpenText = "";
		}

		var resultsArray;
		if (results.reviews !== undefined) {
			resultsArray = results.reviews;
			$('.reviews-container').empty();
			$('.reviews-length').text("(" + resultsArray.length + ")");
			$.each(resultsArray, function (ind, val) {
				var review = "\n\t\t\t\t\t<div class=\"user-review\">\n\t\t\t\t\t\t<div class=\"user-image\">\n\t\t\t\t\t\t\t<img src=\"" + val.profile_photo_url + "\" alt=\"\" />\n\t\t\t\t\t\t\t<div class=\"user-rating\">\n\t\t\t\t\t\t\t\t" + starRatings(val.rating) + "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"user-comment\">\n\t\t\t\t\t\t\t" + val.text + " <span>" + val.relative_time_description + "</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<hr>\n\t\t\t\t";
				$('.reviews-container').append(review);
			});
		}

		$('.place-image > img').attr('src', photoUrl);
		$('.place-name').text(results.name);
		$('.place-stars-rating').empty().append(starRatings(results.rating));
		$('.place-category').text(results.types[0]);
		$('.place-address').text(results.formatted_address);
		$('.place-website').text(results.website).attr('href', results.website);
		$('.place-number').text(results.formatted_phone_number);
		$('.place-open').text(isOpenText);

		$('body').addClass('place-details-active');
	}

	function hideListings() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
	}

	function radiusToZoom(r) {
		var w = $('#map').width();
		var d = r * 2;
		var zooms = [, 21282, 16355, 10064, 5540, 2909, 1485, 752, 378, 190, 95, 48, 24, 12, 6, 3, 1.48, 0.74, 0.37, 0.19];
		var z = 20,
		    m;
		while (zooms[--z]) {
			m = zooms[z] * w;
			if (d < m) {
				break;
			}
		}
		return z;
	}

	//SMOOTH SCROLL 
	$('a[href*="#"]:not([href="#"])').click(function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: target.offset().top
				}, 1000);
				return false;
			}
		}
	});

	$('.secondary-navbar i.fa-bars').on('click', function () {
		$(this).parent().toggleClass('secondary-search-open');
	});

	function starRatings(rating) {
		// console.log('working', rating)
		var ratingOutput;
		if (rating > 4.8) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
		} else if (rating > 4.2 && rating <= 4.7) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-half-o\" aria-hidden=\"true\"></i>";
		} else if (rating > 3.8 && rating <= 4.2) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else if (rating > 3.2 && rating <= 3.8) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-half-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else if (rating > 2.8 && rating <= 3.2) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else if (rating > 2.2 && rating <= 2.8) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-half-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else if (rating > 1.8 && rating <= 2.2) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else if (rating <= 1.8) {
			ratingOutput = "<span>(" + rating + ")</span><i class=\"fa fa-star\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i><i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>";
		} else {
			ratingOutput = "<p>No Rating</p>";
		}
		return ratingOutput;
	}

	function settingCenterMarker(whichMap, location, radius) {
		if (centerPoint || centerCircle) {
			centerPoint.setMap(null);
			centerCircle.setMap(null);
		}

		centerPoint = new google.maps.Marker({
			position: location,
			map: whichMap,
			animation: google.maps.Animation.DROP,
			icon: '../../assets/placeholder.png'
		});

		centerCircle = new google.maps.Circle({
			map: whichMap,
			radius: radius,
			strokeWeight: 1,
			strokeColor: '#607D8B',
			fillOpacity: 0
		});

		centerCircle.bindTo('center', centerPoint, 'position');

		//center map on center marker

		var centerControlDiv = document.createElement('div');
		var centerControl = new CenterControl(centerControlDiv, map);
		centerControlDiv.index = 0;
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

		function CenterControl(controlDiv, map) {

			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#fff';
			controlUI.style.border = '2px solid #fff';
			controlUI.style.borderRadius = '3px';
			controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
			controlUI.style.cursor = 'pointer';
			controlUI.style.marginBottom = '22px';
			controlUI.style.textAlign = 'center';
			controlUI.title = 'Click to recenter the map';
			controlDiv.appendChild(controlUI);

			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.color = 'rgb(25,25,25)';
			controlText.style.fontFamily = 'Lato';
			controlText.style.fontSize = '16px';
			controlText.style.lineHeight = '38px';
			controlText.style.paddingLeft = '5px';
			controlText.style.paddingRight = '5px';
			controlText.innerHTML = 'Center Map';
			controlUI.appendChild(controlText);

			// Setup the click event listeners: simply set the map to Chicago.
			controlUI.addEventListener('click', function () {
				settingTheCenter(whichMap, radius, centerPoint.position);
			});

			$('.place-toggle-slide').on('click', function () {
				settingTheCenter(whichMap, radius, centerPoint.position);
			});
		}

		settingTheCenter(whichMap, radius, centerPoint.position);
	}

	function settingTheCenter(whichMap, radius, whereToCenter) {
		// console.log('center set')
		whichMap.setCenter(whereToCenter);

		var zoomin = radiusToZoom(radius);

		//automatically zoom map to fit the radius of the circle overlay
		whichMap.setZoom(zoomin);
	}
});

},{}]},{},[1]);
