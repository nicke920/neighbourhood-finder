$(function() {
	console.log('FIREEBASEEEE')
	
	firebase.auth().onAuthStateChanged(function(user) {
		setTimeout(function() {

			if (user) {
				$('body').addClass('loggedIn')
				$('#usersUserName').text(firebase.auth().currentUser.displayName)
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
			console.log('suss', success)

			var newUser = {
				email: userEmail,
				displayName: userUserName
			}

			success.updateProfile({
				displayName: userUserName
			})

			firebase.database().ref(`users/${userUserName}`).set(newUser)

			$('body').removeClass('loginModalShowing')

		})
		.catch(function(error) {
			console.log('type of error', typeof error)
		})

	})



})