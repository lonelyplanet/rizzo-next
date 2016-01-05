module.exports = function(title) {
	var className = "";
	
	if (title === "Destinations") {
		className = "navigation__item--active";
	} else if (title === "Search") {
		className = "js-search";	
	} else if (title === "Shop") {
		className = 'js-cart-notification'
	}		
	
	return className;
};