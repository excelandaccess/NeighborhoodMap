
var map;
var markers = [];
var mainInfowindow;
var infoWindowString ; //holds string for selected marker
var resURL;
  var resStreet;
  var resCity ;
  var resPhone;

var locations = [
  {title: "Sal's", group: 'Burritos', location: {lat: 36.845671, lng: -119.783075}},
  {title: 'Casa Corona', group: 'Burritos', location: {lat: 36.838776646609254, lng: -119.75295066833496}},
  {title: 'The Habit Burger Grill', group: 'Hamburgers', location: {lat: 36.858096,lng:-119.783509}},
  {title: 'Panda Express', group: 'Noodles', location: {lat: 36.8531947559099, lng: -119.73028890098708}},
  {title: 'P.F. Chang Restaurant', group: 'Noodles', location: {lat: 36.851430, lng: -119.790233}},
  {title: 'BJ Brewhouse Restaurant', group: 'Hamburgers', location: {lat: 36.808439, lng: -119.774648}}         
];

      
function displaylist(){
  var displayList = "";
  for (var i = 0; i < locations.length; i++) {
    if (filter.value == "All Types" || filter.value == locations[i].group) {
      displayList += "<li><a onclick='selectClickedName(" + i + ")'>" + locations[i].title + "</a></li>";
    }
  }
  document.getElementById("loc-listings").innerHTML = "<ul>" + displayList + "</ul>";
}


function initMap() {
  // Create a new map; only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 36.848624, lng: -119.755932},
    zoom: 10,
  });
  mainInfowindow = new google.maps.InfoWindow();

  //Create markers for each location
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location
    var position = locations[i].location;
    var title = locations[i].title;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    console.log("markerID=" + marker.id + "; i="+i + title);
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      console.log("addListener: this title" + this.title);
      populateInfoWindow(this, mainInfowindow);
    });
  }
  showListings();
}

// Sets timer for animation;
function stopAnimation(marker, infowindow) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2000);
    // Sets 2nd timer o close infowindow and set marker to default
    setTimeout(function () {
        infowindow.close();
        marker.setIcon(infowindow.marker.defaultMarkerIcon);
    }, 8000);
}

function populateInfoWindow(marker, infowindow) {
  var apiURL = 'https://api.foursquare.com/v2/venues/search';//?ll=';
  var ClientID = "LJXW25X1PJ2PRLWV3BOLXAFLBRW0K2SM3FXEWWE4D2S2BCU2";
  var ClientSecret ="MBLBOVBFP5MNCPIRNKWSXJ01OZWHJG1DUWVUX4Y1V3Q4CTNW";
  var ClientVersion = '20170112';
 
  // Checks if infowindow is not already opened on this marker
  if (infowindow.marker != marker) {
    
    console.log("before bounce");

    infowindow.marker = marker;
    infowindow.open(map, marker);

    infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);
    console.log("== populateInfoWindow before getFoursquareInfo-------------- " + infoWindowString)
    //getFoursquareInfo(marker,infowindow);//Get foursquare info
    console.log("====before ajax=  " + marker.id + ":" + locations[marker.id].title + "==" + locations[marker.id].location.lat + "," + locations[marker.id].location.lng);
    $.ajax({
      url:apiURL,
      dataType:"json",
      data:{
        ll:locations[marker.id].location.lat + "," + locations[marker.id].location.lng,
        client_id:ClientID,
        client_secret:ClientSecret,
        v:ClientVersion
       // near:"Fresno CA",
        //query:"Restaurant"
        }
      }).done(function(data) {
        console.log(data);
        console.log("====after ajax=  " + marker.id + ":" + locations[marker.id].title + "==" + locations[marker.id].location.lat + "," + locations[marker.id].location.lng);    
        //var results = data.response.venues[0];
        console.log("Before resURL " + data.response.venues[0].url);

        resURL =  data.response.venues[0].url;
        console.log("resURL: " + resURL)
        if (typeof data.response.venues[0].url === 'undefined'){
          resURL = "";
        }
        resStreet = data.response.venues[0].location.formattedAddress[0];
        resCity = data.response.venues[0].location.formattedAddress[1];
        resPhone = formatPhone(data.response.venues[0].contact.phone);
        if (typeof data.response.venues[0].contact.phone === 'undefined'){
          resPhone = "";
        } 
        console.log(resPhone + " : " + resURL);
        console.log("infowindow variable before set:" + infoWindowString);
        infoWindowString = '<div class="infoWindow> ' +
              '<div class="contentTitle"><h3><a href="' + resURL +'">' + locations[marker.id].title + "</a></h3></div>" +
              '<div class="content"><u>' + resStreet + '</u></div>' +
              '<div class="content">' + resCity + '</div>' +
              '<div class="content">' + resPhone + '</div></div>';
        //infowindow.setContent(infoWindowString);
        console.log("infowindow variable after set:" + infoWindowString);
        infowindow.setContent(infoWindowString);
        console.log("================================================");
      }).fail(function() {
        alert("An error ocurred with Foursquare API call. Try to refresh page reload Foursquare data.");
      });

    console.log("== populateInfoWindow after getFoursquareInfo---------- " + infoWindowString)
    //infowindow.setContent(infoWindowString);

    stopAnimation(marker, infowindow);
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}

// Loops and Displays all markers
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  hideListings();
  for (var i = 0; i < markers.length; i++) {
    if (filter.value == "All Types" || filter.value == locations[i].group){
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
  }
  map.fitBounds(bounds);
}

// Loops and Hides all markers
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

//Selected from Menu list; click marker
function selectClickedName(index) {
//  console.log("index: " + index);
    for (var i = 0; i < locations.length; i++) {
      if (i == index) {
        populateInfoWindow(markers[i],mainInfowindow);
      }
    }
}

//udacity help credit: https://discussions.udacity.com/t/how-do-i-use-foursquare-api/210274/5
//also Udacity's Karol on 1:1
// Foursquare API settings
function getFoursquareInfo(marker,infowindow){
  
  var apiURL = 'https://api.foursquare.com/v2/venues/search';//?ll=';
  var ClientID = "LJXW25X1PJ2PRLWV3BOLXAFLBRW0K2SM3FXEWWE4D2S2BCU2";
  var ClientSecret ="MBLBOVBFP5MNCPIRNKWSXJ01OZWHJG1DUWVUX4Y1V3Q4CTNW";
  var ClientVersion = '20170112';
  
  console.log("====before ajax=  " + marker.id + ":" + locations[marker.id].title + "==" + locations[marker.id].location.lat + "," + locations[marker.id].location.lng);
  $.ajax({
    url:apiURL,
    dataType:"json",
    data:{
      ll:locations[marker.id].location.lat + "," + locations[marker.id].location.lng,
      client_id:ClientID,
      client_secret:ClientSecret,
      v:ClientVersion
     // near:"Fresno CA",
      //query:"Restaurant"
      }
    }).done(function(data) {
      console.log(data);
      console.log("====after ajax=  " + marker.id + ":" + locations[marker.id].title + "==" + locations[marker.id].location.lat + "," + locations[marker.id].location.lng);    
      //var results = data.response.venues[0];
      console.log("Before resURL " + data.response.venues[0].url);

      resURL =  data.response.venues[0].url;
      console.log("resURL: " + resURL)
      if (typeof data.response.venues[0].url === 'undefined'){
        resURL = "";
      }
      resStreet = data.response.venues[0].location.formattedAddress[0];
      resCity = data.response.venues[0].location.formattedAddress[1];
      resPhone = formatPhone(data.response.venues[0].contact.phone);
      if (typeof data.response.venues[0].contact.phone === 'undefined'){
        resPhone = "";
      } 
      console.log(resPhone + " : " + resURL);
      console.log("infowindow variable before set:" + infoWindowString);
      infoWindowString = '<div class="infoWindow> ' +
            '<div class="contentTitle"><h3><a href="' + resURL +'">' + locations[marker.id].title + "</a></h3></div>" +
            '<div class="content"><u>' + resStreet + '</u></div>' +
            '<div class="content">' + resCity + '</div>' +
            '<div class="content">' + resPhone + '</div></div>';
      //infowindow.setContent(infoWindowString);
      console.log("infowindow variable after set:" + infoWindowString);
      infowindow.setContent(infoWindowString);
console.log("================================================");
    }).fail(function() {
      alert("An error ocurred with Foursquare API call. Try to refresh page reload Foursquare data.");
    });

}
/* code credit for format function:
http://stackoverflow.com/questions/8358084/regular-expression-to-reformat-a-us-phone-number-in-javascript  */
function formatPhone(phone) {
    //normalize string and remove all unnecessary characters
    phone = phone.replace(/[^\d]/g, "");
    //check if number length equals to 10
    if (phone.length == 10) {
        //reformat and return phone number
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return null;
}
