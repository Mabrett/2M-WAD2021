/* Marten Brettfeld
Mascha Prugel
WebDev 2021 */

/*********************************************** User and Contact Creation Start ************************************************/

//constructor for creating user
function createUser(username, password, isAdmin) {
    this.username = username;
    this.password = password;
	this.isAdmin = isAdmin;
}

//hard coded User-Personen
var admin = new createUser("admina", "admina");
var normalo = new createUser("normalo", "normalo");

//creates contacts
function createContact(owner, firstName, lastName, street, zip, city, state, country, isPrivate) {
    this.owner = owner;
    this.firstName = firstName;
    this.lastName = lastName;
    this.street = street;
    this.zip = zip;
    this.city = city;
	this.state = state;
    this.country = country;
    this.isPrivate = isPrivate;
}

//hard coded contacts for Admina: Anne, Carl
var anne = new createContact("admina", "Anne", "Meier", "An der Wuhlheide 100", 12459, "Berlin", "Berlin", "Germany", true);
var carl = new createContact("admina", "Carl", "Schulze", "Plönzeile 23", 12459, "Berlin", "Berlin", "Germany", false);

//hard coded contacts for Normalo: Peter, Natascha
var peter = new createContact("normalo", "Peter", "Grupp", "Ostendstraße 15", 12459, "Berlin", "Berlin", "Germany", true);
var natascha = new createContact("normalo", "Natascha", "Orlova", "Wilhelminenhofstraße 50", 12459, "Berlin", "Berlin", "Germany", false);

//array named contacts
var contacts = [anne, carl, peter, natascha];

/*********************************************** Global Variables ************************************************/

//determines if User is Admin or not
var isAdminTest;
//variable to set normalo as owner
var normaloIsOwner = "normalo";
//array to store the map markers
let markers = [];
let map;
//variable for timeout (increments)
var delayFactor = 0;
//variable to store a contact
var tempContact;



/*********************************************** Google Map ************************************************/

// Initialize and add the Map
function initMap() {
    // coordinates of HTW
    var htw = {lat: 52.4569312, lng: 13.5264437};
    map = new google.maps.Map(
    document.getElementById('googleMap'), {zoom: 15, center: htw});
	//needs to be global
    geocoder = new google.maps.Geocoder();
}

// Adds a marker to the map and push to the array.
function addMarker(contact) {
	//temp variable address 
    var address = contact.street + contact.zip;
    //function for geocoding
	geocoder.geocode({'address': address}, function (results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
				//give marker description
                title: contact.firstName + " \n" + contact.street
            });
			//store marker in array
            markers.push(marker);
        }
        //check the status of the response, if OVER_QUERY_LIMIT use Exponential Backoff
        else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            delayFactor++;
            setTimeout(function () {
                addMarker(contact)
            }, delayFactor * 1100);
        } 
		else {            
			geocodingErrorDialog();
        }
    });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing all references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}


/*********************************************** Login & Logout ************************************************/


//function for Login Window
function login() {
    //fetching login data from form fields
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
	//user is admin
    if (username === admin.username && password === admin.password) {
		//set helper variable
		isAdminTest = true;
		loginOk();	
    }
    //user is no admin
    else if (username === normalo.username && password === normalo.password) {
        //set helper variable
		isAdminTest = false;
		loginOk();
    }
    //wrong user or password
    else{
       loginError();
    }
}

//if credentials ok
function loginOk(){
	showMapWindow();
	welcome();
}

//Displays Username and Admin/User after login in Header
function welcome() {
	//get username from login form (admina or normalo)
    var username = document.getElementById("username").value;
    if (isAdminTest === true) {
		//displays name and status on html
        document.getElementById("welcomeUser").innerHTML = username;
        document.getElementById("welcomeUserStatus").innerHTML = "Administrator";
    }
    if (isAdminTest === false) {
		//displays name and status on html
        document.getElementById("welcomeUser").innerHTML = username;
        document.getElementById("welcomeUserStatus").innerHTML = "Normalo";
    }
};

//function for Logout 
function logout() {
    location.reload();
}


/*********************************************** Window Loading ************************************************/


//displays dialogbox when user enters wrong credentials
function loginError() { 
  document.getElementById("loginDialog").showModal(); 
} 

//closes dialogbox 
function closeLoginDialog(){
	var dialog = document.getElementById("loginDialog");
	dialog.close();
}

//Loads 2nd Window, hides all other 
function showMapWindow() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainScreen").style.display = "block";
    document.getElementById("addNewAddressScreen").style.display = "none";
    document.getElementById("updateDeleteScreen").style.display = "none";
	clearMarkers();
	loadList();
}

//change view from Mainscreen to AddContactWindow 
function showAddContactWindow() {
	//hide mainscreen
    document.getElementById("mainScreen").style.display = "none";
	disablePullDownMenu();
	//show addNewAddressScreen
    document.getElementById("addNewAddressScreen").style.display = "block";
}

//outgreys the first option and sets normalo as owner in pulldon menu
function disablePullDownMenu(){
	//normalo is logged in
	if (isAdminTest === false) {
		//disable "admina"-option
		document.getElementById("owner").options[0].disabled = true;
		//set normalo as default
		document.getElementById("owner").selectedIndex = "1";		
		//if admina is already owner
		if(document.getElementById("updateOwner").value === "admina"){
			//disable "normalo"-option
			document.getElementById("updateOwner").options[1].disabled = true;
			//set admina as default
			document.getElementById("updateOwner").selectedIndex = "0";
		}
		//if normalo is already owner
		if(document.getElementById("updateOwner").value === "normalo"){
			//disable "admina"-option
			document.getElementById("updateOwner").options[0].disabled = true;
			//set normalo as default
			document.getElementById("updateOwner").selectedIndex = "1";
		}
	}
}

//shows contacts on list depending on owner
function showMyContacts() {
	clearMarkers();
    loadList();
}

//shows all contacts on list
function showAllContacts() {
	clearMarkers();
    if (isAdminTest === false) {
        loadListPublicAndNormalo();
    } 
	else {
        loadListAllForAdmin();
    }
}

//displayes user data after clicked on Name on List
function showUpdateContactWindow(contact) {
	tempContact = contact;
	document.getElementById("mainScreen").style.display = "none";
    document.getElementById("updateDeleteScreen").style.display = "block";
    getContactInfo(contact);
    disablePullDownMenu();
}

//displays dialogbox when normalo trys to delete admin contact
function forbiddenDelete() { 
	document.getElementById("forbiddenDeleteDialog").showModal(); 
} 

//closes dialogbox 
function closeDeleteDialog(){
	var dialog = document.getElementById("forbiddenDeleteDialog");
	dialog.close();
}

//displays dialogbox when normalo trys to update admin contact
function forbiddenUpdate(){
	document.getElementById("forbiddenUpdateDialog").showModal();
}

//closes dialogbox 
function closeUpdateDialog(){
	var dialog = document.getElementById("forbiddenUpdateDialog");
	dialog.close();
}

//displays dialogbox when geocoding error occurs
function geocodingErrorDialog(){
	document.getElementById("geocodingErrorDialog").showModal();
}

//closes dialogbox 
function closeGeocodingErrorDialog(){
	var dialog = document.getElementById("geocodingErrorDialog");
	dialog.close();
}

//return from New User Window to Map Window after Cancel Button is clicked
function backFromNewUserToMap() {
    //get form fields from html
    var firstName = document.getElementById("firstName");
    var lastName = document.getElementById("lastName");
    var streetNumber = document.getElementById("streetNumber");
    var zip = document.getElementById("zip");
    var city = document.getElementById("city");
	var state = document.getElementById("state");
    var country = document.getElementById("country");
    var isPrivate = document.getElementById("isPrivate");
    //show Map WIndow hide Add Contact Window
    document.getElementById("mainScreen").style.display = "block";
    document.getElementById("addNewAddressScreen").style.display = "none";
    //set already insertet input back to zero
    firstName.value = "";
    lastName.value = "";
    streetNumber.value = "";
    zip.value = "";
    city.value = "";
	state.value = "";
    country.value = "";
    isPrivate.checked = true;
}


/*********************************************** Contact List ************************************************/


//Loads contact list depending on user status
function loadList() {
    //if normalo is logged in
    if (isAdminTest === false) {
        loadListUser();
    }
    //if admina is logged in
    else {
        loadListAdmin();
    }
}

//Loads contact list, creates HTML-List from Javascript Array
function loadListUser() {
	//get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
	//for each object in contacts array
    contacts.forEach(function (contact) {
        // private contact and user is not an admin
        if (contact.owner === "admina")
            return;
        // Create the list item
        var contactLi = document.createElement("li");
        // add Event Listener
        contactLi.addEventListener("click", function () {
			//function call for open new Window with displayed user data
            showUpdateContactWindow(contact);
        }, false);
        // Set list item content
        var name = document.createTextNode(contact.firstName);
        // Add it to the list
        contactLi.appendChild(name);
		//add contact class to list item
        contactLi.classList.add("contact");
		//add to the html document
        listContacts.appendChild(contactLi);
        //Add Marker on Map
        addMarker(contact);
    });
}

function loadListAdmin() {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    contacts.forEach(function (contact) {
        // determine if contact is private and user is not an admin
        if (contact.owner === "normalo")
            //don't display the user then
            return;
        // Create the list item
        var contactLi = document.createElement("li");
        // add Event Listener 
        contactLi.addEventListener("click", function () {
            //function call for open new Window with displayed user data
            showUpdateContactWindow(contact);
        }, false);
        // Set list item content which should be displayed
        var name = document.createTextNode(contact.firstName);
        // Add it to the list
        contactLi.appendChild(name);
        //add contact class to list item
        contactLi.classList.add("contact");
        //add to the html document
        listContacts.appendChild(contactLi);
        //Add Marker on Map
        addMarker(contact);
    });
}

function loadListPublicAndNormalo() {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    contacts.forEach(function (contact) {
        // determine if contact is private and user is not an admin
        if (contact.owner === "admina" && contact.isPrivate)
            //don't display the user then
            return;
        // Create the list item
        var contactLi = document.createElement("li");
        // add Event Listener when list element is clicked
        contactLi.addEventListener("click", function () {
            //function call for open new Window with displayed user data
            showUpdateContactWindow(contact);
        }, false);
        // Set list item content which should be displayed
        var name = document.createTextNode(contact.firstName);
        // Add it to the list
        contactLi.appendChild(name);
        //add cintact class to list item
        contactLi.classList.add("contact");
        //add to the html document
        listContacts.appendChild(contactLi);
        //Add Marker on Map
        addMarker(contact);
    });
}

function loadListAllForAdmin() {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    contacts.forEach(function (contact) {
        // determine if contact is private and user is not an admin
        // if (contact.owner === "normalo")
        //     //don't display the user then
        // return;
        // Create the list item
        var contactLi = document.createElement("li");
        // add Event Listener when list element is clicked
        contactLi.addEventListener("click", function () {
            //function call for open new Window with displayed user data
            showUpdateContactWindow(contact);
        }, false);
        // Set list item content which should be displayed
        var name = document.createTextNode(contact.firstName);
        // Add it to the list
        contactLi.appendChild(name);
        //add cintact class to list item
        contactLi.classList.add("contact");
        //add to the html document
        listContacts.appendChild(contactLi);
        //Add Marker on Map
        addMarker(contact);
    });
}

