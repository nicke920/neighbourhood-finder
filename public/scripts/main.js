(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// require('./_firebase.js')

$(function () {

	// FIREBASE VARIABLES
	var config = {
		apiKey: "AIzaSyBJ5aGM2771uuDHEtp54gLQmWwvkAy0P9k",
		authDomain: "neighbourhood-8b089.firebaseapp.com",
		databaseURL: "https://neighbourhood-8b089.firebaseio.com",
		projectId: "neighbourhood-8b089",
		storageBucket: "",
		messagingSenderId: "246296678951"
	};
	firebase.initializeApp(config);

	var userFavsIds = [];

	var currentUserId;

	var dbRef = firebase.database();

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

	function codeAddress(whichForm, areacode, arearadius) {
		if (whichForm === 'homepage') {
			if (!areacode) {
				var address = $('#address1').val();
				var rad = $('#radius1').val();
				//convert radius into number, since it defaults to a string
				rad = parseInt(rad);
			} else {
				var address = areacode;
				var rad = arearadius;
			}

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

		if (whichForm === 'secondaryForm') {
			var address = $('#address2').val();
			var rad = $('#radius2').val();
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

								$(".dropdown-" + requestType + " #list").append("<li id='" + place.place_id + "' place-name='" + place.name + "' class='result-tile'>\n\t\t\t\t\t\t\t\t\t\t<a>\n\t\t\t\t\t\t\t\t\t\t\t<h3>" + place.name + "</h3>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-detail\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-image\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"" + photoURL + "\" alt=\"\" />\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"result-description\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<h5><i class=\"fa fa-map-marker\" aria-hidden=\"true\"></i>" + place.vicinity + "</h5>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"rating-div\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + starRatings(place.rating) + "\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"types\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<p>" + place.types[0].replace(/_/g, " ") + "</p>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<p>" + place.types[1].replace(/_/g, " ") + "</p>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<a class=\"addToFavs\"></a>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t</li>");
							});
						}
					};

					// console.log('REZZZY', results)
					results.map(function (place, index) {
						if (place.rating !== undefined) {
							avg += place.rating;
							totalPlaces += 1;
							sumOfRatings.push(place.rating);
						}
					});
					$('.avg-area-rating').text((avg / totalPlaces).toFixed(2));

					var count = 0;
					results.filter(function (el) {
						return el.rating !== undefined;
					}).sort(function (a, b) {
						return b.rating - a.rating;
					}).map(function (place, index) {
						var isOK = true;
						place.types.map(function (place, index) {
							if (place === 'lodging' || place === 'shopping_mall') {
								isOK = false;
							}
						});

						if (isOK === true && count < 5) {
							theMarkersArray.push(place);
							count += 1;
						}
					});

					pattern(requestType);
				}
			});
		}

		top5Search(toMarkersRestaurant, 'restaurant', location, radius);
		top5Search(toMarkersCafes, 'cafe', location, radius);
		top5Search(toMarkersDoctors, 'doctor', location, radius);
		top5Search(toMarkersSchool, 'school', location, radius);
		top5Search(toMarkersBank, 'bank', location, radius);
		top5Search(toMarkersBar, 'night_club', location, radius);
		top5Search(toMarkersGym, 'gym', location, radius);
	}

	var centerPoint;
	var centerCircle;

	function centerMarker(location, radius) {

		settingCenterMarker(map, location, radius);
	}

	function getMarkers(arrayOfPlaces, icon) {

		$.each(arrayOfPlaces, function (index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			var typeOfIcon;
			if (icon === 'cafe') {
				typeOfIcon = '../../assets/icons/map-marker.png';
			} else if (icon === 'doctor') {
				typeOfIcon = '../../assets/icons/map-marker1.png';
			} else if (icon === 'school') {
				typeOfIcon = '../../assets/icons/map-marker2.png';
			} else if (icon === 'bank') {
				typeOfIcon = '../../assets/icons/map-marker3.png';
			} else if (icon === 'restaurant') {
				typeOfIcon = '../../assets/icons/map-marker4.png';
			} else if (icon === 'night_club') {
				typeOfIcon = '../../assets/icons/map-marker5.png';
			} else if (icon === 'gym') {
				typeOfIcon = '../../assets/icons/map-marker6.png';
			}
			var iconObject = {
				url: typeOfIcon,
				origin: new google.maps.Point(0, 0),
				labelOrigin: new google.maps.Point(16, 10)
			};

			// var markerLabel = {
			// 	text: (index + 1).toString(),
			// 	color: 'black', 
			// 	fontSize: '14px',
			// }

			var marker = new google.maps.Marker({
				position: placeCoords,
				address: placeAddress,
				name: placeName,
				map: map,
				id: placeid,
				animation: google.maps.Animation.DROP,
				icon: iconObject,
				allDeets: place
				// label: markerLabel

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

						var markerLocation = results.geometry.location;

						settingTheCenter(map, 5, markerLocation);

						if ($(window).width() < 900) {
							$('body').addClass('mobileSlide');
						}
					}
				});
			});
		});
	}

	$('.mapCheck').on('change', function () {
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
				var ids = $(val).find('li').attr('id');

				$.each(markers, function (ind, val) {
					if (ids === val.id) {
						markers[ind].setMap(map);
					}
				});
			});
		}
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
		$('#mapSection').addClass('openn');
		$('.hero').hide();
		$('.about-us').hide();
		$('body').addClass('searched');
		codeAddress('homepage');
		$('#about').hide();
		$('.hero').addClass('searched');
		$('.main-copy-searched').show();
		$('.main-copy').hide();
	});

	function afterSearchStuff(areacode, arearadius) {
		$('#mapSection').addClass('openn');
		$('.hero').hide();
		$('.about-us').hide();
		$('body').addClass('searched');
		$('#about').hide();
		$('.hero').addClass('searched');
		$('.main-copy-searched').show();
		$('.main-copy').hide();
		codeAddress('homepage', areacode, arearadius);
	}

	$('.city').on('click', function (e) {
		e.preventDefault();
		var areacode;
		if ($(this).hasClass('ny')) {
			areacode = '10001';
		}
		if ($(this).hasClass('sf')) {
			areacode = '94114';
		}
		if ($(this).hasClass('tr')) {
			areacode = 'm5h2g4';
		}
		if ($(this).hasClass('la')) {
			areacode = '90232';
		}
		if ($(this).hasClass('dt')) {
			areacode = '48226';
		}
		if ($(this).hasClass('mia')) {
			areacode = '33135';
		}
		if ($(this).hasClass('van')) {
			areacode = 'v6b3l4';
		}
		if ($(this).hasClass('phi')) {
			areacode = '19106';
		}
		var arearadius = 2000;
		afterSearchStuff(areacode, arearadius);
	});

	$('.secondary-search').on('submit', function (e) {
		e.preventDefault();
		$('.secondary-search-tab').removeClass('secondary-search-open');
		$('.secondary-search-tab .fa').removeClass('fa-times');
		$('.secondary-search-tab .fa').addClass('fa-search');
		codeAddress('secondaryForm');
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

	$(document).on('click', '#list > li, .userFavs-area > li', function (e) {

		if (e.target.className !== 'addToFavs') {

			var details = this;

			var request = {
				placeId: details.id
			};

			var service;
			service = new google.maps.places.PlacesService(map);

			service.getDetails(request, function (results, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					setFeatListingText(results);

					var markerLocation = results.geometry.location;

					settingTheCenter(map, 5, markerLocation);
				}
			});
		}
	});

	//hovering over list item makes its respective marker bounce
	$(document).on('mouseover', '#list > li', function () {
		var that = this;
		$.each(markers, function (ind, val) {
			if ($(that).attr('id') === val.id) {

				markers[ind].setAnimation(google.maps.Animation.BOUNCE);
			}
		});
	});

	$(document).on('mouseout', '#list > li', function () {
		var that = this;
		$.each(markers, function (ind, val) {

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
			photoUrl = '../../assets/no-image.jpg';
		}

		var isOpenText;
		var weeklyHours;
		if (results.opening_hours) {

			isOpenText = "Open Now";
			weeklyHours = results.opening_hours.weekday_text;
			$('.place-open-list').empty();
			$.each(weeklyHours, function (ind, val) {
				$('.place-open-list').append("<li class=\"week-hours\">" + val + "</li>");
			});
		} else {
			isOpenText = "Hours Unavailable";
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
		$('.place').attr('place-id', results.id);
		$('.place').attr('place-name', results.name);
		$('.place-image > img').attr('src', photoUrl);
		$('.place-name').text(results.name);
		$('.place-stars-rating').empty().append(starRatings(results.rating));
		$('.place-category').text(results.types[0]);
		$('.place-address').text(results.formatted_address);
		$('.place-website').text(results.website).attr('href', results.website).attr('target', '_blank');
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
		var d = r * 1.2;
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

		var ratingOutput;
		if (rating > 4.7) {
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
			icon: '../../assets/icons/locationCenter.png'
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

		var centerControl = CenterControl(centerControlDiv, map);
		centerControlDiv.index = 0;
		// map.addListener('dragstart', function() {
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
		// })

		function CenterControl(controlDiv, map) {

			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = 'rgb(70,17,167)';
			// controlUI.style.border = '2px solid #fff';
			controlUI.style.borderRadius = '3px';
			controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
			controlUI.style.cursor = 'pointer';
			controlUI.style.marginBottom = '22px';
			controlUI.style.textAlign = 'center';
			controlUI.title = 'Click to recenter the map';
			$(controlUI).addClass('uiControl');
			$(controlDiv).addClass('thebigdiv');
			$('.thebigdiv').empty();
			controlDiv.appendChild(controlUI);

			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.color = 'rgb(255,255,255)';
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

			// $('.place-toggle-slide').on('click', function() {
			// 	settingTheCenter(whichMap, radius, centerPoint.position)
			// })
		}

		settingTheCenter(whichMap, radius, centerPoint.position);
	}

	function settingTheCenter(whichMap, radius, whereToCenter) {

		whichMap.setCenter(whereToCenter);

		var zoomin = radiusToZoom(radius);

		//automatically zoom map to fit the radius of the circle overlay
		whichMap.setZoom(zoomin);
	}

	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {

			$('body').removeClass('loginModalShowing');

			currentUserId = user.uid;

			var dbRef = firebase.database().ref("users/" + currentUserId + "/favourites").on('value', function (firebaseData) {

				var itemsData = firebaseData.val();

				var userFavsIdss = [];

				// getIDsFromFirebase(itemsData, userFavsIdss);
				for (var itemKey in itemsData) {

					var theobjected = {
						key: itemKey,
						id: itemsData[itemKey]
					};
					userFavsIdss.push(theobjected);
				}

				$('.dropdown-userFavs .userFavs-area').empty();

				convertEachFavIDToAList(userFavsIdss);
			});

			$('body').addClass('loggedIn').removeClass('notLoggedIn');
			$('#usersUserName').text(firebase.auth().currentUser.displayName);
		} else {

			$('body').removeClass('loggedIn').addClass('notLoggedIn');
		}
	});

	// function getIDsFromFirebase(itemsData, userFavsIdss) {
	// 	// userFavsIdss.splice(0,userFavsIdss.length);

	// 	// userFavsIdss = [];

	// 	// userFavsIdss = new Array;
	// 	console.log('itemsdata', itemsData)


	// }

	function convertEachFavIDToAList(pushed) {

		$.each(pushed, function (ind, val) {
			var request = {
				placeId: val.id,
				dbRef: val.key
			};

			var service;
			service = new google.maps.places.PlacesService(map);

			service.getDetails(request, function (results, status) {

				if (status == google.maps.places.PlacesServiceStatus.OK) {
					var photoURL;

					if ($(results.photos).length > 0) {
						photoURL = results.photos[0].getUrl({ 'maxWidth': 1000, 'maxHeight': 1000 });
					} else {
						photoURL = "https://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716";
					}

					$('.dropdown-userFavs .userFavs-area').append("\n\n\t\t\t\t\t\t<li id='" + results.place_id + "' data-db-ref='" + request.dbRef + "' class='result-tile'>\n\t\t\t\t\t\t\t<a>\n\t\t\t\t\t\t\t\t<h3>" + results.name + "</h3>\n\t\t\t\t\t\t\t\t<div class=\"result-detail\">\n\t\t\t\t\t\t\t\t\t<div class=\"result-image\">\n\t\t\t\t\t\t\t\t\t\t<img src=\"" + photoURL + "\" alt=\"\" />\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"result-description\">\n\t\t\t\t\t\t\t\t\t\t<h5><i class=\"fa fa-map-marker\" aria-hidden=\"true\"></i>" + results.vicinity + "</h5>\n\t\t\t\t\t\t\t\t\t\t<div class=\"rating-div\">\n\t\t\t\t\t\t\t\t\t\t\t" + starRatings(results.rating) + "\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"types\">\n\t\t\t\t\t\t\t\t\t\t\t<p>" + results.types[0].replace(/_/g, " ") + "</p>\n\t\t\t\t\t\t\t\t\t\t\t<p>" + results.types[1].replace(/_/g, " ") + "</p>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<a class=\"removeFromFavs\">Remove</a>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\n\t\t\t\t\t\t");
				}
			});
		});
	}

	//REGULAR SIGNUP THROUGH EMAIL/PASSWORD

	$('.authForm').on('submit', function (e) {
		e.preventDefault();

		var userEmail = $('#userEmail').val();
		var userPass = $('#userPass').val();
		var userPassConfirm = $('#userPassConfirm').val();

		if (userPass === userPassConfirm) {
			firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).then(function (userData) {
				$('body').removeClass('loginModalShowing');
			}).catch(function (error) {

				alert(error);
			});
		} else {
			alert('Passwords do not match');
		}
	});

	$('.loginform').on('submit', function (e) {
		e.preventDefault();
		firebase.auth().signInWithEmailAndPassword($('#userLoginEmail').val(), $('#userLoginPass').val());
	});

	//GOOGLE AUTHORIZATION FROM FIREBASE

	var provider = new firebase.auth.GoogleAuthProvider();

	$('.google-signin').on('click', function (e) {
		e.preventDefault();

		firebase.auth().signInWithPopup(provider).catch(function (error) {

			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
		}).then(function (result) {
			// var token = result.credential.accessToken;

			// var user = result.user;

			// var newUser = {
			// 	displayName: user.displayName,
			// 	email: user.email
			// }

			// firebase.database().ref(`users/${user.uid}`).set(newUser)

			$('body').removeClass('loginModalShowing');
		});
	});

	//EVENT FOR WHEN USER CLICKS TILE TO ADD TO FAVS
	$(document).on('click', '.addToFavs', function () {
		console.log('clicks???');
		var user = firebase.auth().currentUser.uid;

		if (user) {
			var dbRef = firebase.database().ref("users/" + user + "/favourites");

			var placeId;
			var placeName;
			if ($('body').hasClass('place-details-active')) {
				placeId = $('.place').attr('place-id');
				placeName = $('.place').attr('place-name');
			} else {
				placeId = $(this).parents('.result-tile').attr('id');
				placeName = $(this).parents('.result-tile').attr('place-name');;
			}

			dbRef.push(placeId);

			$('.favs-alert').addClass('actioned');
			$('.fav-action').text('added ');
			$('.fav-name').text(placeName);

			setTimeout(function () {
				$('.favs-alert').removeClass('actioned');
			}, 1200);
		} else {
			alert('Please sign in to add to favs');
		}
	});

	$(document).on('click', '.removeFromFavs', function () {

		var user = firebase.auth().currentUser.uid;

		var placeId = $(this).parents('.result-tile').attr('data-db-ref');

		var dbRef = firebase.database().ref("users/" + user + "/favourites/" + placeId);

		dbRef.remove();

		var placeName = $(this).parents('.result-tile').attr('place-name');

		$('.favs-alert').addClass('actioned');
		$('.fav-action').text('removed ');
		$('.fav-name').text(placeName);

		setTimeout(function () {
			$('.favs-alert').removeClass('actioned');
		}, 1200);
	});

	//FAVOURITES EVENT LISTENERS
	$('.login-btn').on('click', function (e) {
		e.preventDefault();
		$('body').addClass('loginModalShowing');
	});

	$('#userSignOut').on('click', function () {
		firebase.auth().signOut();
		window.location.reload();
	});

	$('.goToFavs').on('click', function () {
		$('body').addClass('userFavsActive');
		$('body').removeClass('place-details-active');
	});

	$('.favs-toggle-slide').on('click', function () {
		$('body').removeClass('userFavsActive');
	});

	$('.place-hours > p').on('click', function () {
		$(this).parent().find('ul.place-open-list').slideToggle();
	});

	$('.authModal button.activate-signup').on('click', function () {
		$('.forms').toggleClass('logging-in').toggleClass('signing-in');
	});

	$('.authModal button.activate-login').on('click', function () {
		$('.forms').toggleClass('logging-in').toggleClass('signing-in');
	});

	$('.mobile-auth-toggle button').on('click', function () {
		$('.mobile-auth-toggle button').removeClass('mob-tog-selected');
		$(this).addClass('mob-tog-selected');
		$('.forms').removeClass('logging-in').removeClass('signing-in');
		if ($(this).is('#mob-signup')) {
			$('.forms').addClass('signing-in');
		}
		if ($(this).is('#mob-login')) {
			$('.forms').addClass('logging-in');
		}
	});

	$('.exit-auth').on('click', function () {
		$('body').removeClass('loginModalShowing');
	});

	//secondary search slide out event function

	$('.searchFilter').on('click', function () {
		if ($(this).parent().hasClass('secondary-search-open')) {

			$(this).parent().removeClass('secondary-search-open');
			$(this).addClass('fa-search');
			$(this).removeClass('fa-times');
		} else {

			$(this).parent().addClass('secondary-search-open');
			$(this).removeClass('fa-search');
			$(this).addClass('fa-times');
		}
	});

	//mobile main slidetoggle 

	$('.sidebar-mob-toggle').on('click', function () {
		$('body').toggleClass('mobileSlide');
		// codeAddress('secondaryForm')
	});

	$(window).on('resize', function () {
		if ($(window).width() > 900) {
			$('body').removeClass('mobileSlide');
		}

		if ($(window).width() > 670) {
			$('ul.navbar').removeClass('mobNavOpen').css('display', 'flex');
		} else {
			$('ul.navbar').css('display', 'none');
		}
	});

	// if ($(window).width() < 670) {
	$('nav .fa').on('click', function () {
		$('ul.navbar').slideToggle().toggleClass('mobNavOpen');
		$('nav.nav').toggleClass('mobNavOpen');
	});
	$('.navbar.mobNavOpen li').on('click', function () {
		$('ul.navbar').removeClass('mobNavOpen');
		$('nav.nav').removeClass('mobNavOpen');
		$('ul.navbar').slideUp();
	});
	// }

	if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
		$('body').addClass('mobile-device');
	}

	$('nav.nav ul.navbar li a').on('click', function () {
		if ($(window).width() < 685) {
			$('nav.nav').removeClass('mobNavOpen');
			$('nav.nav ul.navbar').removeClass('mobNavOpen').slideUp();
		}
	});

	$('.place-directions').on('click', function () {
		alert('Feature coming soon! :)');
	});
	$('.headerFavs').on('click', function () {
		alert('Feature coming soon! :)');
	});
});

},{}]},{},[1]);
