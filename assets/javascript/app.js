// Initialize Firebase
var config = {
  apiKey: 'AIzaSyD_RbNxA_Rad5T0IXj52n_-MZ8a8vvLQkI',
  authDomain: 'recipesz.firebaseapp.com',
  databaseURL: 'https://recipesz.firebaseio.com',
  projectId: 'recipesz',
  storageBucket: 'recipesz.appspot.com',
  messagingSenderId: '389525472979'
};
firebase.initializeApp(config)
let db = firebase.firestore()
let auth = firebase.auth()

let search
$('#searchForm').on('submit', function (event) {
  event.preventDefault()
  search = $('#searchBox').val()
  console.log(search)
})

let apiID = `f1800d3c`
let apiKey = `ced3fcea9ee7146855cce55b5408809e`

// UNCOMMENT THIS URL TO SEARCH
// let queryUrl = `https://api.edamam.com/search?q=${search}&app_id=${apiID}&app_key=${apiKey}`

$.ajax({
  url: queryUrl,
  method: 'GET'
}).then(function (response) {
  console.log(response)
})


// USER AUTH

// Hide and show html elements based on whether user is logged in or out
const userLoggedOut = document.querySelectorAll('.logged-out')
const userLoggedIn = document.querySelectorAll('.logged-in')

// Store displayName of logged in user globally
let userDisplayName
// Listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in', user)
    // Save the display name of the logged in user
    userDisplayName = user.displayName
    // // Grab train info on any change in the database
    // db.collection('').onSnapshot(snapshot => {
    //
    // DO STUFF IF USER LOGGED IN
    //
    // }, error => console.log(error.message))
  } else {
    console.log('User logged out')
    //
    // DO STUFF IF USER LOGGED OUT
    //
  }
})

// New user signup
const signupForm = $('#signup-form')
signupForm.on('submit', (e) => {
  e.preventDefault()

  // Get Signup Form Inputs
  const displayName = $('#signup-displayname').val()
  const email = $('#signup-email').val()
  const password = $('#signup-password').val()
  userDisplayName = displayName

  // Signup the user
  auth.createUserWithEmailAndPassword(email, password)
    .then(function (cred) {
      // Close the signup modal and clear the signup forms
      $('#modal-signup').modal('toggle')
      document.getElementById('signup-form').reset()
      let user = auth.currentUser
      user.updateProfile({
        displayName: displayName
      })
    }).catch(function (error) {
      $('#password-response').html(error.message).css('color', 'red')
    })
})

// Toggle password visibility with icon by switching it from type=password to type=text
$('.password-toggle').on('click', function () {
  $(this).children('i').toggleClass('fa-eye fa-eye-slash')
  let pwInput = $('.password')
  let type = pwInput.attr('type')
  if (type === 'password') {
    pwInput.attr('type', 'text')
  } else {
    pwInput.attr('type', 'password')
  }
})

// Get user keyup from password field to check if both password fields match
$('#signup-password, #signup-password-confirm').on('keyup', function () {
  let pw1 = $('#signup-password')
  let pw2 = $('#signup-password-confirm')
  let pwResponse = $('#password-response')
  if (pw1.val() === pw2.val()) {
    pwResponse.html('Password match').css('color', 'green')
    $('#match').css('display', 'block')
    $('#no-match').css('display', 'none')
  } else {
    pwResponse.html('Passwords do not match').css('color', 'red')
    $('#no-match').css('display', 'block')
    $('#match').css('display', 'none')
  }
})

// User Login
const loginForm = $('#login-form')
loginForm.on('submit', (e) => {
  e.preventDefault()

  // Get user info
  const email = $('#login-email').val()
  const password = $('#login-password').val()

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Close the login modal and clear the login forms
      $('#modal-login').modal('toggle')
      document.getElementById('login-form').reset()
    }).catch(function (error) {
      $('#password-login-response').html(error.message).css('color', 'red')
    })
})

