# MenYou

![Image of MenYou] (assets/MenYou-image.png)
https://ethanbonsignori.github.io/Project-1/

MenYou is a recipe database that allows users to search recipes and add ingredients to a shopping cart. Our goal is to allow users to meal plan and shop a location all within a few clicks.

Each search returns a list of ingredients needed to prepare the recipe.  Users can add ingredients into a shopping cart and delete itmes that do not need to be purchased.  Within the cart, users can edit the quantity needed for each ingredient, substitute brand name, price check, and change retailer based on location.

Users have the option to browse recipes as a guest or they can create an account. By creating an account, users have the ability to upload and save sacred family recipes.  This added feature ensures recipes are all stored in one central location with easy access and sharability.  The ingredients for the added recipes can also be added to the shopping cart.

# Development

MenYou was created using the Edamam API and storing the data response as JSON text in Firebase.  Initial searches were cached and stored in Firebase.  When a user searches a cached recipe, the data is returned as a JSON string.

If a search has not been cached, then the Edamam API will GET the data response and store it into Firebase.  Once stored in Firebase, the data will be returned as JSON text the next time it is searched.

For ingredients to be added to the shopping cart, features were built for storing all listed ingredients as an array that were then pushed to a SDK with prebuilt functionality provided by Whisk.

Added family recipes are also stored in Firebase and can be retrieved as a JSON string.

# Credits

* Bootstrap

* Google fonts

* Font Awesome

* Whisk (food technology platform)
https://whisk.com/

* Edamam's Developer API for Recipe Search
https://developer.edamam.com/edamam-recipe-api

# Contact Information

Ethan Bonsignori
![Ethan Photo] (assets/Ethan.jpeg)
https://github.com/EthanBonsignori

Whitney Crawford
![Whitney Photo] (assets/Portfolio Pic.jpg)
https://github.com/whitney227




