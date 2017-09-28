(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

$(function () {
	console.log('inist');
	var map;

	var service;

	var center;

	var markers = [];

	center = { lat: 49.283103, lng: -123.119290 };

	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 8
	});

	var geocoder = new google.maps.Geocoder();

	var locationObject;

	function codeAddress() {
		var address = $('#address').val();
		var rad = $('#radius').val();
		//convert radius into number, since it defaults to a string
		rad = parseInt(rad);

		geocoder.geocode({
			address: address
		}, function (results, status) {
			console.log('resultss', results);
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location);

				locationObject = results[0].geometry.location;

				listPlaces(locationObject, rad);

				centerMarker(locationObject, rad);
			}
		});
	}

	function listPlaces(location, radius) {
		var request = {
			location: location,
			rankby: 'prominence',
			type: ['restaurant'],
			radius: radius
		};

		var service;
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function (results, status) {
			if (status == 'OK') {
				console.log('cuz', results);
				getMarkers(results, 'res');

				$.each(results, function (index, place) {
					$('#list').append($('<div>').append('<li>' + place.name + '</li>'));
				});
			}
		});

		var request1 = {
			location: location,
			rankby: 'prominence',
			type: ['bank'],
			radius: radius
		};

		var service1;
		service1 = new google.maps.places.PlacesService(map);
		service1.nearbySearch(request1, function (results, status) {
			if (status == 'OK') {
				console.log('cuz', results);
				getMarkers(results, 'ban');

				$.each(results, function (index, place) {
					$('#list2').append($('<div>').append('<li>' + place.name + '</li>'));
				});
			}
		});
	}

	function centerMarker(location, radius) {
		var marker = new google.maps.Marker({
			position: location,
			map: map,
			animation: google.maps.Animation.DROP,
			icon: '../../assets/placeholder.png'
		});

		var circle = new google.maps.Circle({
			map: map,
			radius: radius,
			strokeWeight: 1,
			strokeColor: 'rgba(255,255,255,.1)'
		});

		circle.bindTo('center', marker, 'position');

		//center map on center marker
		map.setCenter(marker.position);

		var zoomin = radiusToZoom(radius);

		//automatically zoom map to fit the radius of the circle overlay
		map.setZoom(zoomin);
	}

	function getMarkers(arrayOfPlaces, icon) {

		$.each(arrayOfPlaces, function (index, place) {
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;
			var placeid = place.place_id;

			var iconType;

			if (icon === 'ban') {
				iconType = '../../assets/money-bag.png';
			} else {
				iconType = '../../assets/pin.png';
			}
			var marker = new google.maps.Marker({
				position: placeCoords,
				address: placeAddress,
				name: placeName,
				map: map,
				id: placeid,
				animation: google.maps.Animation.DROP,
				icon: iconType
			});

			markers.push(marker);

			marker.addListener('click', function () {

				var deets = this;

				var request = {
					placeId: deets.id
				};

				var service;
				service = new google.maps.places.PlacesService(map);
				service.getDetails(request, function (results, status) {

					if (status == google.maps.places.PlacesServiceStatus.OK) {
						$('h1#name').text(results.name);
					}
				});
			});
		});
	}

	$('#gotime').on('click', function () {
		codeAddress();
	});

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
});

},{}]},{},[1]);
