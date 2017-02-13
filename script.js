
var map;
var markers = [];
var mainInfowindow;

var locations = [
  {title: 'Home', group: 'Daily Grind', location: {lat: 36.848624, lng: -119.755932}},
  {title: 'Work', group: 'Daily Grind', location: {lat: 36.793786, lng: -119.795606}},
  {title: 'High School', group: 'Schools', location: {lat: 36.889985, lng: -119.733462}},
  {title: 'Elementary School', group: 'Schools', location: {lat: 36.776031, lng: -119.830358}},
  {title: 'P.F. Chang Restaurant', group: 'Restaurants', location: {lat: 36.851713, lng: -119.790201}},
  {title: 'BJ Brewhouse Restaurant', group: 'Restaurants', location: {lat: 36.808439, lng: -119.774648}}         
];

      
function displaylist(){
  var displayList = "";
  for (var i = 0; i < locations.length; i++) {
    if (filter.value == "All Locations" || filter.value == locations[i].group) {
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
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
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
    }, 5000);
}

function populateInfoWindow(marker, infowindow) {
  // Checks if infowindow is not already opened on this marker
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    
    getFoursquareInfo(marker);//Get foursquare info

    infowindow.open(map, marker);
    infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);
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
    if (filter.value == "All Locations" || filter.value == locations[i].group){
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
// Foursquare API settings
function getFoursquareInfo(marker){
  var apiURL = 'https://api.foursquare.com/v2/venues/search?ll=';
  var ClientID = "LJXW25X1PJ2PRLWV3BOLXAFLBRW0K2SM3FXEWWE4D2S2BCU2";
  var ClientSecret ="MBLBOVBFP5MNCPIRNKWSXJ01OZWHJG1DUWVUX4Y1V3Q4CTNW";
  var ClientVersion = '20170112';

  var foursquareURL = apiURL + markers[1].lat  + ',' + markers[1].lng  
                      + '?client_id=' + ClientID  
                      + '&client_secret=' + ClientSecret 
                      + '&v=' + ClientVersion;
                      //+ '&query=' + markers[1].name;
  var results = data.response.venues[0];
  
  $.getJSON(foursquareURL).done(function(data) {
      var results = data.response.venues[0];
      self.URL = results.url;
      if (typeof self.URL === 'undefined'){
        self.URL = "";
      }
      self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
          self.phone = results.contact.phone;
          if (typeof self.phone === 'undefined'){
        self.phone = "";
      } else {
        self.phone = formatPhone(self.phone);
      }
    }).fail(function() {
      alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
    });

    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
          '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
          '<div class="content">' + self.street + "</div>" +
          '<div class="content">' + self.city + "</div>" +
          '<div class="content">' + self.phone + "</div></div>";

}
