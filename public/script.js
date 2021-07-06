/* Marten Brettfeld
Mascha Prugel
WebDev 2021 */

/*********************************************** Global Variables ************************************************/

//determines if User is Admin or not
var isAdminTest;
//array to store the map markers
let markers = [];
let map;
//for geocoding timeframe
var delayFactor = 0;
//for temporary storeing contact
var tempContact;
//for storing geocords
var globalGeoCord = [];

/*********************************************** Google Map ************************************************/

// Initialize and add the Map
function initMap() {
    // coordinates of HTW
    var htw = { lat: 52.4569312, lng: 13.5264437 };
    //initialise map
    map = new google.maps.Map(document.getElementById('googleMap'), { zoom: 15, center: htw });
    //initialise new geocoder --> everytime you use geocoder you use google service 
    geocoder = new google.maps.Geocoder();
}

// Adds a marker to the map, marker will be stored in array.
function addMarker(contact) {
    //get geo-coordinates from contact and store in object which google.maps.api can read
    geocordinates = { lat: contact.geocord[1], lng: contact.geocord[0] };
    //create new marker
    var marker = new google.maps.Marker({
        map: map,
        position: geocordinates,
        title: contact.firstName + " \n" + contact.streetNumber
    });
    //store marker in array
    markers.push(marker);
    //method from google to calculate bounds for showing all markers on map with smooth transition
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    //apply smooth transmition
    map.fitBounds(bounds)
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

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}


/*********************************************** Login & Logout ************************************************/


/* this function does send a Post request to the server with credentials as payload
after verification from server the program will continue, if server rejects the user will be informed via modal */
function login() {
    //fetching login data
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    //store credentials in an object
    var userCredentials = { username, password };
    //create request object
    let httpRequest = new XMLHttpRequest();
    //set url
    let url = "http://localhost:3000/users/login"
    httpRequest.open("POST", url, true)
    httpRequest.setRequestHeader("Content-Type", "application/json");
    //if connection fails
    httpRequest.onerror = function () {
        console.log("Connecting to server with " + url + " failed!\n");
    };
    //response from server
    httpRequest.onload = function (e) {
        //store response in object
        let data = this.response;
        //parsing json string to js object
        let obj = JSON.parse(data);
        //store received status in object
        let status = this.status;
        //if response was code 200
        if (status === 200) {
            /*  console.log(obj);
             console.log(status);
             console.log(obj.message);
             console.log(obj.role); */
            //check if user is flagged as admin
            if (obj.role === "admin") {
                //set global variable true
                isAdminTest = true;
                //console.log("Admin login");
            }
            //if user not flagged as admin
            else {
                //set global variable false
                isAdminTest = false;
                //console.log("Normalo login");
            }
            //call function after auth successfull
            loginValidatedUser();
        }
        //if no 200er was send
        else if (status != 200) {
            console.log(status);
            //display wrong pw or user credentials
            loginError();
        }
        else {
            //Handhabung von nicht-200er
            console.log("HTTP-status code was: " + status);
        }
    }
    //wrap js-object to equivalent json string form
    let json = JSON.stringify(userCredentials)
    //send request to server
    httpRequest.send(json);
}

//will call functions for changing view
function loginValidatedUser() {
    showMapWindow();
    welcome();
}

//Displays Username and Admin/User after login in Header
function welcome() {
    var username = document.getElementById("username").value;
    if (isAdminTest === true) {
        document.getElementById("welcomeUser").innerHTML = username;
        document.getElementById("welcomeUserStatus").innerHTML = "Administrator";
    }
    if (isAdminTest === false) {
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
function closeLoginDialog() {
    var dialog = document.getElementById("loginDialog");
    dialog.close();
}

//Loads 2nd Window depending on Status
function showMapWindow() {
    //admin
    if (isAdminTest === true) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainScreen").style.display = "block";
        document.getElementById("addNewAddressScreen").style.display = "none";
        document.getElementById("updateDeleteScreen").style.display = "none";
    }
    //no admin
    if (isAdminTest === false) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainScreen").style.display = "block";
        document.getElementById("addNewAddressScreen").style.display = "none";
        document.getElementById("updateDeleteScreen").style.display = "none";
    }
    //clean up the map from all markers and clear Markers Array
    deleteMarkers();
    //load user list and create markers anew
    loadList();
}

//change view from Mainscreen to AddContactWindow 
function showAddContactWindow() {
    document.getElementById("mainScreen").style.display = "none";
    /* outgreys the first option and sets normalo as owner in pulldon menu */
    if (isAdminTest === false) {
        document.getElementById("owner").options[0].disabled = true;
        document.getElementById("owner").selectedIndex = "1";
    }
    document.getElementById("addNewAddressScreen").style.display = "block";
}

//shows contacts on list depending on owner
function showMyContacts() {
    //clean up the map from all markers
    deleteMarkers();
    //load user list and create markers anew
    loadList();
}

//shows all contacts on list
function showAllContacts(obj) {
    //clean up the map from all markers
    deleteMarkers();
    //if non-admin is logged in
    if (isAdminTest === false) {
        //load only contacts from non-admin and public contacts from admin
        loadListPublicAndNormalo(obj);
    } else {
        //if admin is logged in load all contacts
        loadListAllForAdmin(obj);
    }
}

//displayes user data after clicked on Name on List
function showUpdateContactWindow(contact) {
    document.getElementById("mainScreen").style.display = "none";
    /* outgreys the options for setting an owner when non-admin is logged */
    if (isAdminTest === false) {
        document.getElementById("updateOwner").options[0].disabled = true;
        document.getElementById("updateOwner").options[1].disabled = true;
    }
    document.getElementById("updateDeleteScreen").style.display = "block";
    getContactInfo(contact);
    /*  document.getElementById("deleteButton").addEventListener("click", function () {
         deleteUser(contact);
     }); */
    /*  document.getElementById("updateButton").addEventListener("click", function () {
         updateUser(contact);
     }); */
    //store specific contact in global variable
    tempContact = contact;
}

//displays dialogbox when normalo trys to delete admin contact
function forbiddenDelete() {
    document.getElementById("forbiddenDeleteDialog").showModal();
}

//closes dialogbox 
function closeDeleteDialog() {
    var dialog = document.getElementById("forbiddenDeleteDialog");
    dialog.close();
}

//displays dialogbox when normalo trys to update admin contact
function forbiddenUpdate() {
    document.getElementById("forbiddenUpdateDialog").showModal();
}

//closes dialogbox 
function closeUpdateDialog() {
    var dialog = document.getElementById("forbiddenUpdateDialog");
    dialog.close();
}

//displays dialogbox when geocoding error occurs
function geocodingErrorDialog() {
    document.getElementById("geocodingErrorDialog").showModal();
}

//closes dialogbox 
function closeGeocodingErrorDialog() {
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


//initiates contact list 
function loadList() {
    getAllContactsFromBackend();
}

//requests all contacts from server
function getAllContactsFromBackend() {
    //create request object
    let httpRequest = new XMLHttpRequest();
    //set url
    let url = "http://localhost:3000/contacts"
    httpRequest.open("GET", url, true)
    httpRequest.setRequestHeader("Content-Type", "application/json");
    //if connection fails
    httpRequest.onerror = function () {
        console.log("Connecting to server with " + url + " failed!\n");
    };
    //response from server
    httpRequest.onload = function (e) {
        //store response in object
        let data = this.response;
        //parsing json string to js object
        let obj = JSON.parse(data);
        //contacts = JSON.parse(data);
        //console.log(contacts);
        //store received status in object
        let status = this.status;
        //if response was code 200
        if (status === 200) {
            console.log(status);
            //if normalo is logged in
            if (isAdminTest === false) {
                loadListUser(obj);
            }
            //if admina is logged in
            else {
                loadListAdmin(obj);
            }
            document.getElementById("showAllContacts").addEventListener("click", function () {
                showAllContacts(obj);
            });
        }
        else {
            //Handhabung von nicht-200er
            console.log("HTTP-status code was: " + status);
        }
    }
    //wrap js-object to equivalent json string form
    let json = JSON.stringify()
    //send request to server
    httpRequest.send();
}

//Loads contact list, creates HTML-List, adds Eventlistener to every element
function loadListUser(obj) {
    //var i = 0;
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    obj.forEach(function (contact) {
        // private contact and user is not an admin
        if (contact.owner === "admina")
            return;
        // Create the list item
        var contactLi = document.createElement("li");
        // add Event Listener
        contactLi.addEventListener("click", function () {
            showUpdateContactWindow(contact);
        }, false);
        /*   contactLi.addEventListener("mouseover", function(){
              showme(i)
          }, false);
          contactLi.addEventListener("mouseout", function(){
              showme(i)
          }, false); */
        // Set list item content
        var name = document.createTextNode(contact.firstName);
        // Add it to the list
        contactLi.appendChild(name);
        contactLi.classList.add("contact");
        /* contactLi.onmouseover = function () { showme(i) };
        contactLi.onmouseout = function () { showme(i) }; */
        listContacts.appendChild(contactLi);
        //Add Marker on Map
        addMarker(contact);
        //i = i+1;
    });
}

function loadListAdmin(obj) {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    obj.forEach(function (contact) {
        // determine if contact is private and user is not an admin
        if (contact.owner === "normalo")
            //     //don't display the user then
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

function loadListPublicAndNormalo(obj) {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    obj.forEach(function (contact) {
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

function loadListAllForAdmin(obj) {
    //get element from html document
    var listContacts = document.getElementById("listContacts");
    //remove all child nodes
    while (listContacts.hasChildNodes()) {
        listContacts.removeChild(listContacts.firstChild);
    }
    //for each object in contacts array
    obj.forEach(function (contact) {
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


/*********************************************** Contact and Propertie-Fields ************************************************/


//creates new contact through AddContactWindow Form via Post request to server, geocoding will be used once -> when creating a new contact
function addContact() {
    //get form fields from html, store content in variables
    var owner = document.getElementById("owner").value;
    var firstName = document.getElementById("firstName").value;
    var lastName = document.getElementById("lastName").value;
    var streetNumber = document.getElementById("streetNumber").value;
    var zip = document.getElementById("zip").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    var country = document.getElementById("country").value;
    var isPrivate = document.getElementById("isPrivate").value;
    //store street + zip in object
    var address = streetNumber + zip;
    //get geocords from address
    /* this is the only time when google geocoding is used: when creating a new contact
    all additional drawings on map will use latidute/longitude only to prevent possible costs */
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == 'OK') {
            var longi = results[0].geometry.location.lng();
            var lati = results[0].geometry.location.lat();
            globalGeoCord = [longi, lati];
            callFollowFunction(globalGeoCord);
        }
        //check the status of the response, if OVER_QUERY_LIMIT use Exponential Backoff
        else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            delayFactor++;
            setTimeout(function () {
                addMarker(contact)
            }, delayFactor * 1100);
        } else {
            geocodingErrorDialog();
        }
    });
    //this function runs after geocoding
    function callFollowFunction(globalGeoCord) {
        //store geocodin data in variable
        var geocord = globalGeoCord;
        //create object for parsing to JSON
        var createMe = {
            owner,
            firstName,
            lastName,
            streetNumber,
            zip,
            city,
            state,
            country,
            isPrivate,
            geocord
        }
        //create request
        let httpRequest = new XMLHttpRequest();
        //set url
        let url = "http://localhost:3000/contacts/";
        httpRequest.open("POST", url, true)
        httpRequest.setRequestHeader("Content-Type", "application/json");
        //if connection fails
        httpRequest.onerror = function () {
            console.log("Connecting to server with " + url + " failed!\n");
        };
        //response from server
        httpRequest.onload = function (e) {
            //store received status in object
            let status = this.status;
            //if response was code 204
            if (status === 201) {
                console.log(status);
            }
            else {
                //handle non-200er response
                console.log("HTTP-status code was: " + status);
            }
        }
        //wrap js-object to equivalent json string form
        let json = JSON.stringify(createMe)
        //send request to server
        httpRequest.send(json);
        //return to Map Screen
        showMapWindow();
        setBackToZero();
    }
    //set input back to zero so that form fields are empty
    function setBackToZero() {
        var firstName = document.getElementById("firstName");
        var lastName = document.getElementById("lastName");
        var streetNumber = document.getElementById("streetNumber");
        var zip = document.getElementById("zip");
        var city = document.getElementById("city");
        var state = document.getElementById("state");
        var country = document.getElementById("country");
        var isPrivate = document.getElementById("isPrivate");
        firstName.value = "";
        lastName.value = "";
        streetNumber.value = "";
        zip.value = "";
        city.value = "";
        state.value = "";
        country.value = "";
        isPrivate.checked = true;
    }
}

//gets the information for a contact which will be displayed in the UpdateContactWindow
function getContactInfo(contact) {
    //get contact id
    id = contact._id;
    //create request
    let httpRequest = new XMLHttpRequest();
    //set url
    let url = "http://localhost:3000/contacts/" + id;
    httpRequest.open("GET", url, true)
    httpRequest.setRequestHeader("Content-Type", "application/json");
    //if connection fails
    httpRequest.onerror = function () {
        console.log("Connecting to server with " + url + " failed!\n");
    };
    //response from server
    httpRequest.onload = function (e) {
        //store response in object
        let data = this.response;
        //parsing json string to js object
        let contactInfo = JSON.parse(data);
        //store received status in object
        let status = this.status;
        //if response was code 204
        if (status === 200) {
            console.log(status);
            var owner = document.getElementById("updateOwner");
            var firstName = document.getElementById("updateFirstname");
            var lastName = document.getElementById("updateLastName");
            var streetNumber = document.getElementById("updateStreetNumber");
            var zip = document.getElementById("updateZip");
            var city = document.getElementById("updateCity");
            var state = document.getElementById("updateState");
            var country = document.getElementById("updateCountry");
            var isPrivate = document.getElementById("updateIsPrivate");
            //insert contact values in form fields
            //document.getElementById("owner").selectedIndex = "1";
            owner.value = contactInfo.contact.owner;
            firstName.value = contactInfo.contact.firstName;
            lastName.value = contactInfo.contact.lastName;
            streetNumber.value = contactInfo.contact.streetNumber;
            zip.value = contactInfo.contact.zip;
            city.value = contactInfo.contact.city;
            state.value = contactInfo.contact.state;
            country.value = contactInfo.contact.country;
            isPrivate.checked = contactInfo.contact.isPrivate;
        }
        else {
            //Handhabung von nicht-200er
            console.log("HTTP-status code was: " + status);
        }
    }
    //wrap js-object to equivalent json string form
    let json = JSON.stringify()
    //send request to server
    httpRequest.send();
}

//sends delete request to server
function deleteUser() {
    //get owner of contact
    var owner = document.getElementById("updateOwner");
    //if normalo is logged in and wants to delete an admin contact
    if (isAdminTest === false && owner.value === "admina") {
        //display Modal
        forbiddenDelete();
    }
    else {
        //get Mongo unique id from contact and store in deleteId
        deleteId = tempContact._id;
        //create request
        let httpRequest = new XMLHttpRequest();
        //set url
        let url = "http://localhost:3000/contacts/" + deleteId;
        httpRequest.open("DELETE", url, true)
        httpRequest.setRequestHeader("Content-Type", "application/json");
        //if connection fails
        httpRequest.onerror = function () {
            console.log("Connecting to server with " + url + " failed!\n");
        };
        //response from server
        httpRequest.onload = function (e) {
            //store received status in object
            let status = this.status;
            //if response was code 204
            if (status === 204) {
                console.log(status);
            }
            else {
                //Handhabung von nicht-200er
                console.log("HTTP-status code was: " + status);
            }
        }
        //wrap js-object to equivalent json string form
        let json = JSON.stringify()
        //send request to server
        httpRequest.send();
        showMapWindow();
    }
}

//updates contact by sending Put request to server
function updateUser() {
    //determine if owner is admin or non-admin
    var owner = document.getElementById("updateOwner");
    //normalo can't update contacts from admin
    if (isAdminTest === false && owner.value === "admina") {
        //display forbidden modal
        forbiddenUpdate();
    }
    //if ok -> get data from Form
    else {
        //get Mongo unique id from contact and store in deleteId
        changeId = tempContact._id;
        var owner = document.getElementById("updateOwner").value;
        var firstName = document.getElementById("updateFirstname").value;
        var lastName = document.getElementById("updateLastName").value;
        var streetNumber = document.getElementById("updateStreetNumber").value;
        var zip = document.getElementById("updateZip").value;
        var city = document.getElementById("updateCity").value;
        var state = document.getElementById("updateState").value;
        var country = document.getElementById("updateCountry").value;
        if (document.getElementById("updateIsPrivate").checked === true) {
            var isPrivate = true;
        }
        else {
            isPrivate = false;
        }
        //var geocord = tempContact.geocord;

        //store street + zip in object
        var address = streetNumber + zip;
        //get geocords from address
        /* this is the only time when google geocoding is used: when creating a new contact
        all additional drawings on map will use latidute/longitude only to prevent possible costs */
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == 'OK') {
                var longi = results[0].geometry.location.lng();
                var lati = results[0].geometry.location.lat();
                globalGeoCord = [longi, lati];
                callFollowFunction(globalGeoCord);
            }
            //check the status of the response, if OVER_QUERY_LIMIT use Exponential Backoff
            else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                delayFactor++;
                setTimeout(function () {
                    addMarker(contact)
                }, delayFactor * 1100);
            } else {
                geocodingErrorDialog();
            }
        });
        //this function runs after geocoding
        function callFollowFunction(globalGeoCord) {
            //store geocodin data in variable
            var geocord = globalGeoCord;
            //create object for parsing to JSON


            //create object for parsing to JSON
            var updateMe = {
                owner,
                firstName,
                lastName,
                streetNumber,
                zip,
                city,
                state,
                country,
                isPrivate,
                geocord
            }
            //create request
            let httpRequest = new XMLHttpRequest();
            //set url
            let url = "http://localhost:3000/contacts/" + changeId;
            httpRequest.open("PUT", url, true)
            httpRequest.setRequestHeader("Content-Type", "application/json");
            //if connection fails
            httpRequest.onerror = function () {
                console.log("Connecting to server with " + url + " failed!\n");
            };
            //response from server
            httpRequest.onload = function (e) {
                //store received status in object
                let status = this.status;
                //if response was code 204
                if (status === 204) {
                    console.log(status);
                }
                else {
                    //handle non-200er response
                    console.log("HTTP-status code was: " + status);
                }
            }
            //wrap js-object to equivalent json string form
            let json = JSON.stringify(updateMe)
            //send request to server
            httpRequest.send(json);
            //return to Map Screen
            showMapWindow();
        }
    }
}
