// require('./_firebase.js')

$(function()  {	

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
		var toMarkersGym = [];
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
								console.log('placeee', place)

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
													<div class="types">
														<p>${place.types[0].replace(/_/g, " ")}</p>
														<p>${place.types[1].replace(/_/g, " ")}</p>
													</div>
													<a class="addToFavs">Add to favourites</a>
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
		}

		top5Search(toMarkersRestaurant, 'restaurant', location, radius)
		top5Search(toMarkersCafes, 'cafe', location, radius)
		top5Search(toMarkersDoctors, 'doctor', location, radius)
		top5Search(toMarkersSchool, 'school', location, radius)
		top5Search(toMarkersBank, 'bank', location, radius)
		top5Search(toMarkersBar, ['bar', 'night_club'] , location, radius)
		top5Search(toMarkersGym, 'gym', location, radius)



	}








	var centerPoint;
	var centerCircle;

	function centerMarker(location, radius) {

		settingCenterMarker(map, location, radius)

	}



	function getMarkers(arrayOfPlaces, icon) {
		console.log('AOP', arrayOfPlaces)

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
			} else if (icon === 'gym') {
				typeOfIcon = '../../assets/barbell.png'
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
						setFeatListingText(results)

						var markerLocation = results.geometry.location;

						settingTheCenter(map, 5, markerLocation)

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

		$('#address').text('')
		$('#radius').text('')

	})


	//open and close dropdown menu in results
	$('.result-card-description').on('click', function(e) {

		if (!$(this).parent().hasClass('open')) {
			$('.result-card > ul').slideUp();
			$(this).parent().find('ul').slideDown();
			$('.result-card').removeClass('open')
			$(this).parent().addClass('open')
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



	$(document).on('click', '#list > li', function(e) {
		console.log('eee', e)
		if (e.target.className !== 'addToFavs') {
			console.log('RANNNNNNN')
			var details = this

			var request = {
				placeId: details.id
			}

			var service;
			service = new google.maps.places.PlacesService(map);

			service.getDetails(request, function(results, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					setFeatListingText(results)

					var markerLocation = results.geometry.location;

					settingTheCenter(map, 5, markerLocation)

				}
			})
		}
	})

	//hovering over list item makes its respective marker bounce
	$(document).on('mouseover', '#list > li', function() {
		var that = this
		$.each(markers, function(ind, val) {
			if ($(that).attr('id') === val.id) {
				// console.log('va', val.id)
				markers[ind].setAnimation(google.maps.Animation.BOUNCE)
			}
		})
	})

	$(document).on('mouseout', '#list > li', function() {
		var that = this
		$.each(markers, function(ind, val) {
			// console.log('88')
			if ($(that).attr('id') === val.id) {
				markers[ind].setAnimation(null)
			}
		})
	})

	$('.place-toggle-slide').on('click', function() {
		$('body').removeClass('place-details-active')
	})



	function setFeatListingText(results) {
		var photoUrl;
		var photosArray;

		if (results.photos !== undefined) {
			photoUrl = results.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000})
			photosArray = results.photos;

			$('.photo-carousel-length').text(`(${photosArray.length})`)



			function initFlickity() {
				$('.main-carousel').flickity({
					imagesLoaded: true, 
					percentPosition: false,
					wrapAround: true
				});
			}

			
			

			function theloop() {
				$('.main-carousel').flickity('destroy');
				$('.main-carousel').empty();

				$.each(photosArray, function(ind, val) {
					var arrPhotoUrl = val.getUrl({'maxWidth': 1000, 'maxHeight': 1000})
					$('.main-carousel').append(`<img src="${arrPhotoUrl}" alt="" class="carousel-cell"/>`)
				})
			} 

			$.when(theloop()).then(
				initFlickity()
				)

		} else {
			photoUrl = '../../assets/grey.jpg'
		}

		var isOpenText;
		var weeklyHours;
		if (results.opening_hours) {
			$('.place-hours > p').on('click', function() {
				$(this).parent().find('ul.place-open-list').slideToggle()
			})
			isOpenText = "Open Now";
			weeklyHours = results.opening_hours.weekday_text;
			$('.place-open-list').empty();
			$.each(weeklyHours, function(ind, val) {
				$('.place-open-list').append(`<li class="week-hours">${val}</li>`)
			})
		} else {
			isOpenText = "Hours Unavailable"
		}

		var resultsArray;
		if (results.reviews !== undefined) {
			resultsArray = results.reviews;
			$('.reviews-container').empty()
			$('.reviews-length').text(`(${resultsArray.length})`)
			$.each(resultsArray, function(ind, val) {
				var review = (`
					<div class="user-review">
						<div class="user-image">
							<img src="${val.profile_photo_url}" alt="" />
							<div class="user-rating">
								${starRatings(val.rating)}
							</div>
						</div>
						<div class="user-comment">
							${val.text} <span>${val.relative_time_description}</span>
						</div>
					</div>
					<hr>
				`)
				$('.reviews-container').append(review)
			})
		}

		$('.place-image > img').attr('src', photoUrl)
		$('.place-name').text(results.name)
		$('.place-stars-rating').empty().append(starRatings(results.rating))
		$('.place-category').text(results.types[0])
		$('.place-address').text(results.formatted_address)
		$('.place-website').text(results.website).attr('href', results.website)
		$('.place-number').text(results.formatted_phone_number) 
		$('.place-open').text(isOpenText)

		$('body').addClass('place-details-active')

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
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i>`
		} else if (rating > 4.2 && rating <= 4.7) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i>`
		} else if (rating > 3.8 && rating <= 4.2) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else if (rating > 3.2 && rating <= 3.8) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else if (rating > 2.8 && rating <= 3.2) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else if (rating > 2.2 && rating <= 2.8) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-half-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else if (rating > 1.8 && rating <= 2.2) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else if (rating <= 1.8 ) {
			ratingOutput = `<span>(${rating})</span><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i>`
		} else {
			ratingOutput = `<p>No Rating</p>`
		}
		return ratingOutput
	}





	function settingCenterMarker(whichMap, location, radius) {
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
			fillOpacity: 0
		})

		centerCircle.bindTo('center', centerPoint, 'position')

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
		        controlUI.addEventListener('click', function() {
		        	settingTheCenter(whichMap, radius, centerPoint.position)
		        });

		        $('.place-toggle-slide').on('click', function() {
		        	settingTheCenter(whichMap, radius, centerPoint.position)
		        })

		      }

		settingTheCenter(whichMap, radius, centerPoint.position)

	}

	function settingTheCenter(whichMap, radius, whereToCenter) {
		// console.log('center set')
		whichMap.setCenter(whereToCenter)

		var zoomin = radiusToZoom(radius) 
		
		//automatically zoom map to fit the radius of the circle overlay
		whichMap.setZoom(zoomin)

	}







		function getIDsFromFirebase(itemsData, userFavsIdss) {
			userFavsIdss.splice(0,userFavsIdss.length);

			userFavsIdss = [];

			userFavsIdss = new Array;

			for (var itemKey in itemsData) {

				var theobjected = {
					key: itemKey,
					id: itemsData[itemKey]
				}
				userFavsIdss.push(theobjected)
			}

			$('.dropdown-userFavs').empty()

			convertEachFavIDToAList(userFavsIdss)

		}

	





		firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					currentUserId = user.uid;

					$('body').removeClass('loginModalShowing')

					var userFavsIdss = [];

					var dbRef = firebase.database().ref(`users/${currentUserId}/favourites`).on('value', function(firebaseData) {


						var itemsData = firebaseData.val();

						getIDsFromFirebase(itemsData, userFavsIdss);

					})

					$('body').addClass('loggedIn').removeClass('notLoggedIn')
					$('#usersUserName').text(firebase.auth().currentUser.displayName)
				} 
				else {
					console.log('user NOT logged in')
					$('body').removeClass('loggedIn').addClass('notLoggedIn')
				}

		})


		//REGULAR SIGNUP THROUGH EMAIL/PASSWORD

		$('.authForm').on('submit', function(e) {
			e.preventDefault();

			var userEmail = $('#userEmail').val();
			var userPass = $('#userPass').val();
			var userUserName = $('#userUserName').val();
			
			firebase.auth().createUserWithEmailAndPassword(userEmail, userPass)
			.then(function(userData) {
				$('body').removeClass('loginModalShowing')

			})
			.catch(function(error) {
				console.log('type of error', typeof error)
				alert(error)
			})

		})

		//GOOGLE AUTHORIZATION FROM FIREBASE

		var provider = new firebase.auth.GoogleAuthProvider();

		$('.googleForm').on('click', function(e) {
			e.preventDefault();

			firebase.auth().signInWithPopup(provider).catch(function(error) {
				console.log('error message', error)
				// The email of the user's account used.
				  var email = error.email;
				  // The firebase.auth.AuthCredential type that was used.
				  var credential = error.credential;
			}).then(function(result) {
				var token = result.credential.accessToken;

				var user = result.user;

				var newUser = {
					displayName: user.displayName,
					email: user.email
				}

				firebase.database().ref(`users/${user.uid}`).set(newUser)

				$('body').removeClass('loginModalShowing')
				
				console.log('ressss', result)

			})
		})



		//EVENT FOR WHEN USER CLICKS TILE TO ADD TO FAVS
		$(document).on('click', '.addToFavs', function() {
			var user = firebase.auth().currentUser.uid;

			if (user) {
				var dbRef = firebase.database().ref(`users/${user}/favourites`);

				var placeId = $(this).parents('.result-tile').attr('id')

				console.log('yes', dbRef)

				dbRef.push(placeId)
			} else {
				alert('Please sign in to add to favs')
			}

			
		})


		$(document).on('click', '.removeFav', function() {

			var user = firebase.auth().currentUser.uid;
			
			var placeId = $(this).parents('.result-tile').attr('data-db-ref')

			var dbRef = firebase.database().ref(`users/${user}/favourites/${placeId}`);

			dbRef.remove();

			console.log('lci')
		})



		function convertEachFavIDToAList(pushed) {

			$.each(pushed, function(ind, val) {
				var request = {
					placeId: val.id,
					dbRef: val.key
				}

				var service;
				service = new google.maps.places.PlacesService(map);

				service.getDetails(request, function(results, status) {

					if (status == google.maps.places.PlacesServiceStatus.OK) {
						var photoURL;

						if ($(results.photos).length > 0) {
							photoURL = results.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000})
						} else {
							photoURL = "https://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716"
						}

						$('.dropdown-userFavs').append(`
							<li id='${results.place_id}' data-db-ref='${request.dbRef}' class='result-tile'>
								<a>
									<h3>${results.name}</h3>
									<div class="result-detail">
										<div class="result-image">
											<img src="${photoURL}" alt="" />
										</div>
										<div class="result-description">
											<h5><i class="fa fa-map-marker" aria-hidden="true"></i>${results.vicinity}</h5>
											<div class="rating-div">
												${starRatings(results.rating)}
											</div>
											<button class="removeFav">Remove</button>
										</div>
									</div>
								</a>
							</li>
							`)
					}
				})
				
			})

			// console.log('resssUlts -- OUTSIDE', results)
		}





		//FAVOURITES EVENT LISTENERS
		$('.login-btn').on('click', function(e) {
			e.preventDefault();
			$('body').addClass('loginModalShowing')
		})
		
		$('#userSignOut').on('click', function() {
			firebase.auth().signOut();
			window.location.reload();
		})

		$('.goToFavs').on('click', function() {
			$('body').addClass('userFavsActive');
		})





	$('.dropdown-toggle').on('click', function() {
		
	})






})








