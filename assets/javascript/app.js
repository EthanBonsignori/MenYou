// Initialize Firebase
var config = {
  apiKey: 'AIzaSyD_RbNxA_Rad5T0IXj52n_-MZ8a8vvLQkI',
  authDomain: 'recipesz.firebaseapp.com',
  databaseURL: 'https://recipesz.firebaseio.com',
  projectId: 'recipesz',
  storageBucket: 'recipesz.appspot.com',
  messagingSenderId: '389525472979'
}
firebase.initializeApp(config)
let db = firebase.firestore()
let auth = firebase.auth()

// Reference to all the cached searches in firestore
let completed = []
let completedRef = db.collection('completed').doc('searches')
let blobsRef = db.collection('blobs')

// Html element where our recipes will be shown
let recipeDisplay = $('.recipeResults')

// On search form submit
$('#searchForm').submit((e) => {
  e.preventDefault() // Prevent page from reloading
  recipeDisplay.empty() // Empty the recipe display div
  showSpinner() // Show a spinner while results load
  // Get user input
  let searchTerm = $('#searchBox').val().trim().toLowerCase()
  // if the search has already been cached
  if (completed.indexOf(searchTerm) > -1) {
    // get cached data from firebase
    getResultsFirebase(searchTerm)
  // If the search has not been cached
  } else {
    // get data from api (and then cache it)
    getResultsAPI(searchTerm)
  }
})

let getResultsFirebase = (searchTerm) => {
  blobsRef.doc(`${searchTerm}`).get()
    .then((doc) => {
      if (doc.exists) {
        console.log('search cached... getting results from firebase')
        let recipes = JSON.parse(doc.data().json)
        console.log(recipes)
        displayResults(recipes)
      } else {
        getResultsAPI(searchTerm)
      }
    }).catch((error) => {
      console.log('Error getting document: ', error)
    })
}

// Query the API with searchterm and display results on page
let getResultsAPI = (searchTerm) => {
  console.log('search not cached... getting results from api')
  // Edamam API
  let apiKey = `ced3fcea9ee7146855cce55b5408809e`
  let apiID = `f1800d3c`
  let queryUrl = `https://api.edamam.com/search?q=${searchTerm}&app_id=${apiID}&app_key=${apiKey}`
  // Get recipes from API
  $.ajax({
    url: queryUrl,
    method: 'GET'
  }).then(function (response) {
    console.log(response)
    displayResults(response)
  })
}

let displayResults = (json) => {
  let columns = 3
  let rows = 0
  let columnWidth = 12 / columns
  let recipeHtml = `<div class="row">`
  let length = json.hits.length
  let search = json.q
  // if search returns results
  if (length > 0) {
    recipeDisplay.empty()
    for (let i = 0; i < length; i++) {
      let path = json.hits[i].recipe
      let image = path.image
      let title = path.label
      let source = path.source
      let ingredients = path.ingredientLines
      let whiskIngredients = []
      let ingredientsHtml = '<ul>'
      for (let j = 0; j < ingredients.length; j++) {
        ingredientsHtml += `<li>${ingredients[j]}</li>`
        whiskIngredients.push(ingredients[j])
      }
      let url = path.url
      // Build each recipe
      recipeHtml +=
        `<div class="col-md-${columnWidth} mt-3">
          <div class="card recipe">
            <img src="${image}" class="card-img" alt="${title}">
            <div class="card-img-overlay recipe-img-overlay">
              <p class="lead recipe-title" style="font-size:2rem; color:white;">${title}</p>
              <div class="text-center recipe-url-div">
                <small class="text-center recipe-url">View full recipe on <a href="${url}" target="_blank">${source} <i class="fas fa-external-link-alt"></i></a></small>
              </div>
            </div>
            <div class="card-body">  
              <h5>Ingredients</h5>  
              ${ingredientsHtml}</ul>
              <button class="btn btn-success" id="whisk${i}">Get ingredients</button>
            </div>
          </div>
        </div>`
      whisk.queue.push(function() {
        $(document).on('click', `#whisk${i}`, (e) => {
          e.preventDefault()
          whisk.shoppingList.addProductsToList({
              products: whiskIngredients,
              trackView: false
            }
          )
        })
      })
    }
    rows++
    if (rows % columns === 0) {
      recipeHtml += `</div><div class="row">`
    }
    // Add the search term to the completed searches array
    completedRef.update({
      searches: firebase.firestore.FieldValue.arrayUnion(`${search}`)
    })
    // Store the json response in a document named after the search
    blobsRef.doc(`${search}`).set({
      json: JSON.stringify(json)
    })
  } else {
    recipeHtml +=
      `<div class="text-center text-danger">
          <h3><i class="fas fa-exclamation-circle"></i> Could not find any results for: <span class="lead">${searchTerm}<span></h3>
        </div>
      </div>`
  }
  recipeDisplay.html(recipeHtml)
}

function showSpinner () {
  recipeDisplay.html(`
    <div class="d-flex justify-content-center">
      <div class="spinner-grow text-success mt-5" role="status" style="width: 5rem; height: 5rem;>
        <span class="sr-only"></span>
      </div>
    </div>`
  )
}

//
// USER AUTH
//
// Listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    setupUI(user)
    completedRef.onSnapshot(snap => {
      completed = snap.data().searches
    })
  } else {
    setupUI()
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

  // Signup the user
  auth.createUserWithEmailAndPassword(email, password).then((cred) => {
    return db.collection('users').doc(cred.user.uid).set({
      displayName: displayName
    })
  }).then(() => {
    // Close the signup modal and clear the signup forms
    $('#modal-signup').modal('toggle')
    document.getElementById('signup-form').reset()
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
    pwResponse.html('Passwords match').css('color', 'green')
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

// User logout
const logout = $('#logout')
logout.on('click', (e) => {
  e.preventDefault()
  // Sign the user out
  auth.signOut()
})

// Hide and show html elements based on whether user is logged in or out
const userLoggedOut = document.querySelectorAll('.logged-out')
const userLoggedIn = document.querySelectorAll('.logged-in')
const setupUI = (user) => {
  // if logged in
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      // Show account info
      $('#display-name').attr('data-value', doc.data().displayName)
      $('#user-display-name').text(doc.data().displayName)
      $('#user-email').text(user.email)
      $('#user-account-created').text(user.metadata.creationTime)
    })
    // Show UI elements
    userLoggedIn.forEach((item) => { item.style.display = 'block' })
    userLoggedOut.forEach((item) => { item.style.display = 'none' })
  // if logged out
  } else {
    // Hide account details
    $('#display-name').attr('data-value', '')
    $('#user-display-name').text('')
    $('#user-email').text('')
    $('#user-account-created').text('')
    // Hide UI elements
    userLoggedIn.forEach((item) => { item.style.display = 'none' })
    userLoggedOut.forEach((item) => { item.style.display = 'block' })
  }
}

// Yummly API
// let apiID = '48b24f4c'
// let apiKey = '02786a5969bae14e1731a198ac0e88d6'
// let queryUrl = `http://api.yummly.com/v1/api/recipes?_app_id=${apiID}&_app_key=${apiKey}&q=${searchTerm}&requirePictures=true`