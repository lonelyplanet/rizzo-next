module.exports = function(title) {
	var className = "";
	
	if (title === "Destinations") {
		className = "navigation__item--active";
	} else if (title === "Search") {
		className = "js-search";	
	} else if (title === "Shop") {
		className = "js-cart-notification";
	} else if (title === "Sign In") {
		className = "navigation__item--user";
	}
	
	return className;
};
