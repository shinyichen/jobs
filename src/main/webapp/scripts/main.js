(function() {
	
	/* default parameters */
	var user_id = "1111";
	var user_fullname = "Jennifer Chen";
	var lng = -122.08;
	var lat = 37.38;
	
	// entry point
	function init() {
		// register listeners
		document.querySelector("#login-form-btn").addEventListener("click", onSessionInvalid);
		document.querySelector("#register-form-btn").addEventListener("click", showRegisterForm);
		document.querySelector("#register-btn").addEventListener("click", register);
		document.querySelector("#login-btn").addEventListener("click", login);
		document.querySelector("#nearby-btn").addEventListener("click", loadNearbyItems);
		document.querySelector("#fav-btn").addEventListener("click", loadFavoriteItems);
		document.querySelector("#recommend-btn").addEventListener("click", loadRecommendedItems);

		validateSession();
	}
	
	function validateSession() {
		
		// show login form
		onSessionInvalid();
		
		var url = "./login";
		var req = JSON.stringify();
		
		// display loading message
		showLoadingMessage("Validating session...");
		
		// validate sesson
		ajax("GET", url, req, function(res) {
			var result = JSON.parse(res);
			if (result.status === "OK") {
				onSessionValid(result);
			}
		}, function() {
			console.log("Not logged in");
		})
	}
	
	function showLoadingMessage(msg) {
		var itemList = document.querySelector("#item-list");
		itemList.innerHTML = "<p class=\"notice\"><i class=\"fa fa-spinner fa-spin\"></i> "
			+ msg + "</p>";
	}
	
	function showWarningMessage(msg) {
		var itemList = document.querySelector('#item-list');
		itemList.innerHTML = "<p class=\"notice\"><i class=\"fa fa-exclamation-triangle\"></i> "
			+ msg + "</p>";
	}
	
	function showErrorMessage(msg) {
		var itemList = document.querySelector('#item-list');
		itemList.innerHTML = "<p class=\"notice\"><i class=\"fa fa-exclamation-circle\"></i> "
			+ msg + "</p>";
	}

	
	// display main content
	function onSessionValid(result) {
		user_id = result.user_id;
		user_fullname = result.name;
		
		var loginForm = document.querySelector('#login-form');
		var registerForm = document.querySelector('#register-form');
		var itemNav = document.querySelector('#item-nav');
		var itemList = document.querySelector('#item-list');
		var avatar = document.querySelector('#avatar');
		var welcomeMsg = document.querySelector('#welcome-msg');
		var logoutBtn = document.querySelector('#logout-link');

		welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;

		showElement(itemNav);
		showElement(itemList);
		showElement(avatar);
		showElement(welcomeMsg);
		showElement(logoutBtn, 'inline-block');
		hideElement(loginForm);
		hideElement(registerForm);
		
		initGeoLocation();
		
	}
	
	function initGeoLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(onPositionUpdated, onLoadPositionFailed, {
				maximumAge: 60000
			});
			showLoadingMessage("Retrieving your location...");
		} else {
			onLoadPositionFailed();
		}
	}
	
	function onPositionUpdated(position) {
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		loadNearbyItems();
	}
	
	function onLoadPositionFailed() {
		console.warn("navigator.geolocation is not available");
		console.warn("Getting location from ip");
		getLocationFromIP();
	}
	
	function getLocationFromIP() {
		var url = "http://ipinfo.io/json";
		var data = null;
		ajax("GET", url, data, function(res) {
			var result = JSON.parse(res);
			if ("loc" in result) {
				var loc = result.loc.split(",");
				lat = loc[0];
				lng = loc[1];
			} else {
				console.warn("Getting location by IP failed");
			}
			loadNearbyItems();
		}, function() {
			console.warn("Getting location by IP failed");
			lat = 37.38;
			lng = -122.08;
			loadNearbyItems();
		});
	}
	
	function loadNearbyItems(myLat, myLng) {
		activeBtn("nearby-btn");
		
		var url = "./search";
		var params;
		if (myLat && myLng) {
			params = "user_id=" + user_id + "&lat=" + lat + "&lon=" + lng;
		} else {
			params = "user_id=" + user_id + "&lat=" + lat + "&lon=" + lng;
		}
		var data = null;
		
		showLoadingMessage("Loading nearby items...");
		
		ajax("GET", url + "?" + params, data, function(res) {
			var items = JSON.parse(res);
			if (!items || items.length === 0) {
				showWarningMessage("No nearby results found.");
			} else {
				listItems(items);
			}
		}, function() {
			if (!myLat && !myLng) {
				loadNearbyItems(37.38, -112.08);
			} else {
				showErrorMessage("Cannot load nearby items.");
			}
		});
	}
	
	function loadFavoriteItems() {
		activeBtn("fav-btn");

		// request parameters
		var url = "./history";
		var params = "user_id=" + user_id;
		var req = JSON.stringify({});

		// display loading message
		showLoadingMessage("Loading favorite items...");

		// make AJAX call
		ajax("GET", url + "?" + params, req, function(res) {
			var items = JSON.parse(res);
			if (!items || items.length === 0) {
				showWarningMessage("No favorite item.");
			} else {
				listItems(items);
			}
		}, function() {
			showErrorMessage("Cannot load favorite items.");
		});
	}

	function loadRecommendedItems(myLat, myLng) {
		activeBtn("recommend-btn");

		// request parameters
		var url;
		if (myLat && myLng) {
			url = "./recommendation" + "?" + "user_id=" + user_id + "&lat="
				+ myLat + "&lon=" + myLng;
		} else {
			url = "./recommendation" + "?" + "user_id=" + user_id + "&lat="
			+ lat + "&lon=" + lng;
		}
		var data = null;

		// display loading message
		showLoadingMessage("Loading recommended items...");

		// make AJAX call
		ajax("GET", url, data, function(res) {
			var items = JSON.parse(res);
			if (!items || items.length === 0) {
				if (myLat && myLng) {
					showWarningMessage("No recommended item. Make sure you have favorites.");
				}
				else {
					loadRecommendedItems(37.38, -112.08);
				}
			} else {
				listItems(items);
			}
		},
		// failed callback
		function() {
			showErrorMessage("Cannot load recommended items.");
		});
	}

	
	// POST/DELETE /history request
	// data: {user_id, favorite}
	function changeFavoriteItem(item) {
		var li = document.querySelector("#item-" + item.item_id);
		var favIcon = document.querySelector("#fav-icon-" + item.item_id);
		var favorite = !(li.dataset.favorite === "true");
		
		// request
		var url = "./history";
		var data = JSON.stringify({
			user_id: user_id,
			favorite: item
		});
		var method = favorite? "POST" : "DELETE";
		
		ajax(method, url, data, function(res) {
			var result = JSON.parse(res);
			if (result.status === "OK" || result.result === "SUCCESS") {
				li.dataset.favorite = favorite;
				favIcon.className = favorite? "fa fa-heart" : "fa fa-heart-o";
			}
		}, function() {
			console.log("change favorite failed");
		});
	}
	
	// helper function to create a DOM element
	function create(tag, options) {
		var element = document.createElement(tag);
		for (var key in options) {
			if (options.hasOwnProperty(key)) {
				element[key] = options[key];
			}
		}
		return element;
	}
	
	// build the results list in DOM
	function listItems(items) {
		var itemList = document.querySelector("#item-list");
		itemList.innerHTML = ""; // clear current results
		
		for (var i = 0; i < items.length; i++) {
			addItem(itemList, items[i]);
		}
	}
	
	// given item (JSONObject), build the DOM and add to result list
	function addItem(itemList, item) {
		var item_id = item.item_id;
		
		var li = create("li", {
			id: "item-" + item_id,
			className: "item"
		});
		
		li.dataset.item_id = item_id;
		li.dataset.favorite = item.favorite;
		
		// item image
		if (item.image_url) {
			li.append(create("img", {
				src: item.image_url
			}));
		}
		
		// section
		var section = create("div");
		
		// title
		var title = create("a", {
			className: "item-name",
			href: item.url,
			target: "_blank"
		});
		
		title.innerHTML = item.name;		
		section.append(title);

		// keyword
		var keyword = create("p", {
			className : "item-keyword"
		});
		keyword.innerHTML = "Keyword: " + item.keywords.join(", ");
		section.append(keyword);

		li.append(section);

		// address
		var address = create("p", {
			className : "item-address"
		});

		// "," => "<br/>", "\"" => ""
		address.innerHTML = item.address.replace(/,/g, "<br/>").replace(/\"/g,
				"");
		li.append(address);

		// favorite link
		var favLink = create("p", {
			className : "fav-link"
		});

		favLink.onclick = function() {
			changeFavoriteItem(item);
		};

		favLink.append(create("i", {
			id : "fav-icon-" + item_id,
			className : item.favorite ? "fa fa-heart" : "fa fa-heart-o"
		}));

		li.append(favLink);
		itemList.append(li);
		
	}
	
	function activeBtn(btnId) {
		var btns = document.querySelectorAll(".main-nav-btn");
		
		// deactivate all nav buttons
		for (var i = 0; i < btns.length; i++) {
			btns[i].className = btns[i].className.replace(/\bactive\b/, "");
		}
		
		// activate btnId
		var btn = document.querySelector("#" + btnId);
		btn.className += " active";
	}

	// display show login form
	function onSessionInvalid() {
		var loginForm = document.querySelector("#login-form");
		var registerForm = document.querySelector("#register-form");
		var itemNav = document.querySelector("#item-nav");
		var itemList = document.querySelector("#item-list");
		var avatar = document.querySelector("#avatar");
		var welcomeMsg = document.querySelector("#welcome-msg");
		var logoutBtn = document.querySelector("#logout-link");

		hideElement(itemNav);
		hideElement(itemList);
		hideElement(avatar);
		hideElement(logoutBtn);
		hideElement(welcomeMsg);
		hideElement(registerForm);

		clearLoginError();
		showElement(loginForm);
	}
	
	// display register form
	function showRegisterForm() {
		var loginForm = document.querySelector("#login-form");
		var registerForm = document.querySelector("#register-form");
		var itemNav = document.querySelector("#item-nav");
		var itemList = document.querySelector("#item-list");
		var avatar = document.querySelector("#avatar");
		var welcomeMsg = document.querySelector("#welcome-msg");
		var logoutBtn = document.querySelector("#logout-link");
		
		hideElement(itemNav);
		hideElement(itemList);
		hideElement(avatar);
		hideElement(logoutBtn);
		hideElement(welcomeMsg);
		hideElement(loginForm);
		
		clearRegisterResult();
		showElement(registerForm);
		
	}
	
	function clearLoginError() {
		document.querySelector("#login-error").innerHTML = "";
	}
	
	function clearRegisterResult() {
		document.querySelector("#register-result").innerHTML = "";
	}

	function hideElement(element) {
		element.style.display = "none";
	}
	
	function showElement(element, style) {
		var displayStyle = style ? style : "block";
		element.style.display = displayStyle;
	}
	
	//-----------------
	// Register
	//-----------------
	
	function register() {
		var username = document.querySelector("#register-username").value;
		var password = document.querySelector("#register-password").value;
		var firstname = document.querySelector("#register-first-name").value;
		var lastname = document.querySelector("#register-last-name").value;
		
		if (username === "" || password === "" || firstname === "" || lastname === "") {
			showRegisterResult("Please fill in all fields");
			return;
		}
		
		if (username.match(/^[a-z0-9_]+$/) === null) {
			showRegisterResult("Invalid username");
			return;
		}
		
		password = md5(username + md5(password));
		
		// request params
		var url = "./register";
		var req = JSON.stringify({
			user_id: username,
			password: password,
			first_name: firstname,
			last_name: lastname
		});
		
		ajax("POST", url, req, function(res) {
			var result = JSON.parse(res);
			if (result.status === "OK") {
				showRegisterResult("Succesfully registered");
			}
			else {
				showRegisterResult("User already existed");
			}
		}, function() {
			showRegisterResult("Failed to register");
		});
	}
	
	function showRegisterResult(registerMessage) {
		document.querySelector("#register-result").innerHTML = registerMessage;
	}
	
	function clearRegisterResult() {
		document.querySelector("#register-result").innerHTML = "";
	}
	
	//-------------
	// login
	//-------------
	
	function login() {
		var username = document.querySelector("#username").value;
		var password = document.querySelector("#password").value;
		password = md5(username + md5(password));
		
		var url = "./login";
		var req = JSON.stringify({
			user_id: username,
			password: password
		});
		
		ajax("POST", url, req, function(res) {
			var result = JSON.parse(res);
			if (result.status === "OK") {
				onSessionValid(result);
			}
		}, function() {
			showLoginError();
		});
	}
	
	function showLoginError() {
		document.querySelector("#login-error").innerHTML = "Invalid username or password";
	}
	
	function ajax(method, url, data, successCallback, errorCallback) {
		var req = new XMLHttpRequest();
		
		req.onload = function() {
			if (req.status === 200) {
				successCallback(req.responseText);
			} else {
				errorCallback();
			}
		}
		
		req.onerror = function() {
			console.log("The request could not be completed.");
			errorCallback();
		}
		
		req.open(method, url, true);
		
		if (data === null) {
			req.send();
		} else {
			req.setRequestHeader("Content-Type", "application/json;charset-utf-8");
			req.send(data);
		}
	}
	
	// run
	init();

})();