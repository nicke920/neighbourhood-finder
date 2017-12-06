$(function() {
	console.log('FIREEBASEEEE')

	var userFavsIds = [];

	var dbRef = firebase.database();

	

	firebase.auth().onAuthStateChanged(function(user) {
		setTimeout(function() {

			if (user) {
				$('body').addClass('loggedIn')
				$('#usersUserName').text(firebase.auth().currentUser.displayName)

				// dbRef.ref(`users/${firebase.auth().currentUser.uid}/favourites`).on('value', function(firebaseData) {
				// 	var itemsData = firebaseData.val();

				// 	for (var itemKey in itemsData) {
				// 		userFavsIds.push(itemsData[itemKey])
				// 	}

				// 	userFavsIds.map(function(val, ind) {
				// 		$('.userFavs').append(val)
				// 		console.log('valll', val)
				// 	})
				// 	console.log(userFavsIds)
			 // 	})

			} else {
				$('body').removeClass('loggedIn').addClass('notLoggedIn')
			}
		}, 500)
	})

	$('.login-btn').on('click', function(e) {
		e.preventDefault();
		$('body').addClass('loginModalShowing')
	})
	
	$('#userSignOut').on('click', function() {
		firebase.auth().signOut();
	})


	$('.authForm').on('submit', function(e) {
		e.preventDefault();

		var userEmail = $('#userEmail').val();
		var userPass = $('#userPass').val();
		var userUserName = $('#userUserName').val();
		
		firebase.auth().createUserWithEmailAndPassword(userEmail, userPass)
		.then(function(success) {
			console.log('success', success)

			var newUser = {
				email: userEmail,
				displayName: userUserName
			}

			success.updateProfile({
				displayName: userUserName
			})


			firebase.database().ref(`users/${success.uid}`).set(newUser)

			$('body').removeClass('loginModalShowing')

		})
		.catch(function(error) {
			console.log('type of error', typeof error)
		})

	})

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

	$(document).on('click', '.addToFavs', function() {

		var user = firebase.auth().currentUser.uid;
		
		var dbRef = firebase.database().ref(`users/${user}/favourites`);

		var placeId = $(this).parents('.result-tile').attr('id')

		userFavsIds.push(placeId)

		dbRef.push(placeId)
	})

	

	







})