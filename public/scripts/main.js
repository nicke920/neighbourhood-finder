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
		zoom: 11
	});

	var geocoder = new google.maps.Geocoder();

	var locationObject;

	function codeAddress() {
		var address = $('#address').val();
		geocoder.geocode({
			address: address
		}, function (results, status) {
			console.log(results);
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location);
				locationObject = results[0].geometry.location;

				listPlaces(locationObject);
			}
		});
	}

	function listPlaces(location) {
		var request = {
			location: location,
			radius: 10000,
			type: ['restaurant']
		};

		var service;
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, function (results, status) {
			if (status == 'OK') {
				getMarkers(results);
			}
		});
	}

	function getMarkers(arrayOfPlaces) {
		$.each(arrayOfPlaces, function (index, place) {
			console.log('1', place.name + ' ' + index);
			var placeName = place.name;
			var placeCoords = place.geometry.location;
			var placeAddress = place.vicinity;

			var marker = new google.maps.Marker({
				position: placeCoords,
				address: placeAddress,
				name: placeName,
				map: map,
				animation: google.maps.Animation.DROP
			});

			markers.push(marker);
		});
	}

	$('#gotime').on('click', function () {
		codeAddress();
	});
});

},{}]},{},[1]);
