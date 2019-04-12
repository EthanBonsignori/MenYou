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
              <h5>Ingredients <button class="btn btn-success" id="whisk${i}" 
                data-toggle="tooltip" data-placement="top" title="Add all ingredients to shopping cart">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </h5>  
              ${ingredientsHtml}</ul>
              
            </div>
          </div>
        </div>`
      whisk.queue.push(function () {
        $(document).on('click', `#whisk${i}`, (e) => {
          e.preventDefault()
          whisk.shoppingList.addProductsToBasket({
            products: whiskIngredients
          })
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
          <h3><i class="fas fa-exclamation-circle"></i> Could not find any results for: <span class="lead">${search}<span></h3>
        </div>
      </div>`
  }
  recipeDisplay.html(recipeHtml)
  // Get bootstrap tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
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
// USER RECIPE FORM
//
// Store the user recipe in an object so we can send it to firebase
let userRecipe = {
  title: '',
  ingredients: [],
  directions: ''
}

// Add new ingredient to ingredient list
$(document).on('click', '#add-ingredient', (e) => {
  e.preventDefault() // Prevent the form from sending
  let newIngredient = $('#ingredient')
  let ingredientList = $('#ingredients')
  let ingredientText = newIngredient.val().trim()
  ingredientList.append(`<li>${ingredientText} <button class="remove-ingredient" data-value="${ingredientText}"><i class="far fa-minus-square"></i></button></li>`)
  userRecipe.ingredients.push(ingredientText)
  newIngredient.val('')
})

// Remove ingredient from list
$(document).on('click', '.remove-ingredient', function (e) {
  e.preventDefault() // Prevent the form from sending
  // Remove item from ingredients array
  let removedIngredient = $(this).attr('data-value')
  for (let i = userRecipe.ingredients.length; i >= 0; i--) {
    if (userRecipe.ingredients[i] === removedIngredient) {
      userRecipe.ingredients.splice(i, 1)
      break
    }
  }
  // Remove the list item from the page
  $(this).parent().remove()
})

// Get user recipe input and send it to firebase
$('#addFamilyRecipe').on('submit', (e) => {
  e.preventDefault()

  userRecipe.title = $('#recipeTitle').val()
  userRecipe.directions = $('#recipeDirections').val()
  console.log(userRecipe)
  let userName = $('#display-name').attr('data-value')
  db.collection('user-recipes').add({
    recipe: userRecipe,
    addedBy: userName,
    addedByID: auth.currentUser.uid
  })
  // Reset
  $('#recipe-form').trigger('reset') // Reset every form field
  $('#ingredients').empty() // Remove all the appended ingredient list items
  $('#addFamilyRecipe').modal('hide') // Hide the add recipe modal
  // Reset the userRecipe object
  userRecipe.title = ''
  userRecipe.ingredients = []
  userRecipe.directions = ''
})

// Show user recipes
$(document).on('click', '#get-user-recipes', () => {
  getUserRecipes()
})

let getUserRecipes = () => {
  $('.recipeResults').empty()
  db.collection('user-recipes').get()
    .then((snap) => {
      snap.docs.forEach((doc) => {
        displayUserRecipes(doc.data(), doc.id)
      })
    })
}

// Generate html for user recipes
let displayUserRecipes = (data, id) => {
  let recipe = data.recipe
  let num = Math.floor(100000 + Math.random() * 900000)
  let recipeHTML = `
    <div class="row">
      <div class="col-12">
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="d-inline lead"><b>${recipe.title}</b></h5>
            <div class="d-inline ml-2">
              <small class="text-muted">Created by <b>${data.addedBy}</b></small>
            </div>`
  // Add a delete button if the user created this recipe
  let userID = auth.currentUser.uid
  if (data.addedByID === userID) {
    recipeHTML += `
            <span data-id="${id}" class="delete" data-toggle="tooltip" data-placement="top" title="Delete Recipe">
              <button class="btn btn-danger">
                <i class="fas fa-trash-alt"></i>
              </button>
            </span>`
  }
  recipeHTML += ` 
        </div>
          <div class="card-body">
            <h5 class="card-title">Ingredients <button class="btn btn-success" id="whisk${num}" 
            data-toggle="tooltip" data-placement="top" title="Add all ingredients to shopping cart">
              <i class="fas fa-shopping-cart"></i>
            </button>
            </h5>`
  recipeHTML += generateIngredientList(recipe.ingredients)
  recipeHTML += `
            <h5 class="card-title">Directions</h5>
            <p class="card-text">${recipe.directions}</p>
          </div>
        </div>
      </div>
    </div>`
  whisk.queue.push(function () {
    $(document).on('click', `#whisk${num}`, (e) => {
      e.preventDefault()
      whisk.shoppingList.addProductsToBasket({
        products: recipe.ingredients
      })
    })
  })
  $('.recipeResults').append(recipeHTML)
  // Get bootstrap tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
}

// Create ingredient list out of the array of ingredients from firebase
let generateIngredientList = (ingredients) => {
  let ingredientsList = '<ul class="row">'
  for (let i = 0; i < ingredients.length; i++) {
    ingredientsList += `<li class="col-6">${ingredients[i]}</li>`
  }
  ingredientsList += '</ul>'
  return ingredientsList
}

// Delete User recipe
let deleteID
$(document).on('click', '.delete', function () {
  deleteID = $(this).attr('data-id')
  $('#modal-delete').modal('show')
})

// Confirm and delete
$('#confirm-delete').on('click', () => {
  db.collection('user-recipes').doc(deleteID)
    .delete()
    .then(() => {
      console.log('Recipe deleted succesfully')
      $('#modal-delete').modal('hide') // Hide the modal
      getUserRecipes() // Show all the user recipes again minus the deleted one
    }).catch((error) => {
      console.error(`Error deleting recipe ${error}`)
    })
})

// Cancel deletion
$('#cancel-delete').on('click', () => {
  $('#modal-delete').modal('hide') // Hide the modal
})

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
const userWelcome = $('#welcome-user')
const setupUI = (user) => {
  // if logged in
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      userWelcome.html(`Welcome, <span id="display-name" data-value="${doc.data().displayName}">${doc.data().displayName}</span>`)
      // Show account info
      // $('#display-name').attr('data-value', doc.data().displayName)
      // $('#user-display-name').text(doc.data().displayName)
      // $('#user-email').text(user.email)
      // $('#user-account-created').text(user.metadata.creationTime)
    })
    // Show UI elements
    userLoggedIn.forEach((item) => { item.style.display = 'block' })
    userLoggedOut.forEach((item) => { item.style.display = 'none' })
  // if logged out
  } else {
    userWelcome.text(`Welcome`)
    // Hide account details
    // $('#display-name').attr('data-value', '')
    // $('#user-display-name').text('')
    // $('#user-email').text('')
    // $('#user-account-created').text('')
    // Hide UI elements
    userLoggedIn.forEach((item) => { item.style.display = 'none' })
    userLoggedOut.forEach((item) => { item.style.display = 'block' })
  }
}

// Yummly API
// let apiID = '48b24f4c'
// let apiKey = '02786a5969bae14e1731a198ac0e88d6'
// let queryUrl = `http://api.yummly.com/v1/api/recipes?_app_id=${apiID}&_app_key=${apiKey}&q=${searchTerm}&requirePictures=true`
