window.addEventListener("load", function () {

// Access the form element...
  const form = document.getElementById("myForm");

   // take over its submit event.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendReq();
  });

  function sendReq() {
    let httpRequest = new XMLHttpRequest();

    let url = "https://api.github.com/users/eschuler22"

    httpRequest.open("GET", url, true);

    httpRequest.onerror = function () {// diese Funktion wird ausgefuehrt, wenn ein Fehler auftritt
      console.log("Connecting to server with " + url + " failed!\n");
    };

    httpRequest.onload = function (e) {
      // diese Funktion wird ausgefuehrt, wenn die Anfrage erfolgreich war
      let data = this.response;
      let obj = JSON.parse(data);

      if (this.status == 200) {
        console.log(this);
        console.log(obj);
        console.log(status);
      }
      else {     //Handhabung von nicht-200er
        console.log("HTTP-status code was: " + obj.status);
      }
    };

    httpRequest.send();
  }

  

 
});

