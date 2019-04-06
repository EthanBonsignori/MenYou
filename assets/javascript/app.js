// Initialize Firebase
// var config = {
//   apiKey: "AIzaSyD_RbNxA_Rad5T0IXj52n_-MZ8a8vvLQkI",
//   authDomain: "recipesz.firebaseapp.com",
//   databaseURL: "https://recipesz.firebaseio.com",
//   projectId: "recipesz",
//   storageBucket: "recipesz.appspot.com",
//   messagingSenderId: "389525472979"
// };
// firebase.initializeApp(config);

let apiID = `f1800d3c`
let apiKey = `ced3fcea9ee7146855cce55b5408809e`
let search = `chicken`

let queryUrl = `https://api.edamam.com/search?q=${search}&app_id=${apiID}&app_key=${apiKey}`

$.ajax({
  url: queryUrl,
  method: 'GET'
}).then(function (response) {
  console.log(response)
})