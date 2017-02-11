
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

var apiURL = 'https://api.foursquare.com/v2/venues/"';
var ClientID = "LJXW25X1PJ2PRLWV3BOLXAFLBRW0K2SM3FXEWWE4D2S2BCU2";
var ClientSecret ="MBLBOVBFP5MNCPIRNKWSXJ01OZWHJG1DUWVUX4Y1V3Q4CTNW";
var ClientVersion = '20170112';

var foursquareURL = apiURL + markers[1] + '?client_id=' 
                    + ClientID +  '&client_secret=' 
                    + ClientSecret +'&v=' + ClientVersion;

$.ajax({
  url: foursquareURL, dataType: "json",
  success: function(data) {
    console.log(data);
  } 
});

// Make AJAX request to Foursquare
$.ajax({
    url: 'https://api.foursquare.com/v2/venues/' + markers[1].id() +
    '?client_id=NONGGLXBKX5VFFIKKEK1HXQPFAFVMEBTRXBWJUPEN4K14JUE&client_secret=ZZDD1SLJ4PA2X4AJ4V23OOZ53UM4SFZX0KORGWP5TZDK4YYJ&v=20130815',
    dataType: "json",
    success: function (data) {
        // Make results easier to handle
        var result = data.response.venue;

        // placeItem.name(result.name);

        // The following lines handle inconsistent results from Foursquare
        // Check each result for properties, if the property exists,
        // add it to the Place constructor
        // Credit https://discussions.udacity.com/t/foursquare-results-undefined-until-the-second-click-on-infowindow/39673/2
        var contact = result.hasOwnProperty('contact') ? result.contact : '';
        if (contact.hasOwnProperty('formattedPhone')) {
            placeItem.phone(contact.formattedPhone || '');
        }

        var location = result.hasOwnProperty('location') ? result.location : '';
        if (location.hasOwnProperty('address')) {
            placeItem.address(location.address || '');
        }

        var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
        if (bestPhoto.hasOwnProperty('prefix')) {
            placeItem.photoPrefix(bestPhoto.prefix || '');
        }

        if (bestPhoto.hasOwnProperty('suffix')) {
            placeItem.photoSuffix(bestPhoto.suffix || '');
        }

        var description = result.hasOwnProperty('description') ? result.description : '';
        placeItem.description(description || '');

        var rating = result.hasOwnProperty('rating') ? result.rating : '';
        placeItem.rating(rating || 'none');

        var url = result.hasOwnProperty('url') ? result.url : '';
        placeItem.url(url || '');

        placeItem.canonicalUrl(result.canonicalUrl);

        // Infowindow code is in the success function so that the error message
        // displayed in infowindow works properly, instead of a mangled infowindow
        // Credit https://discussions.udacity.com/t/trouble-with-infowindows-and-contentstring/39853/14

        // Content of the infowindow
        var contentString = '<div id="iWindow"><h4>' + placeItem.name() + '</h4><div id="pic"><img src="' +
                placeItem.photoPrefix() + '110x110' + placeItem.photoSuffix() +
                '" alt="Image Location"></div><p>Information from Foursquare:</p><p>' +
                placeItem.phone() + '</p><p>' + placeItem.address() + '</p><p>' +
                placeItem.description() + '</p><p>Rating: ' + placeItem.rating() +
                '</p><p><a href=' + placeItem.url() + '>' + placeItem.url() +
                '</a></p><p><a target="_blank" href=' + placeItem.canonicalUrl() +
                '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                placeItem.lat() + ',' + placeItem.lng() + '>Directions</a></p></div>';

        // Add infowindows credit http://you.arenot.me/2010/06/29/google-maps-api-v3-0-multiple-markers-multiple-infowindows/
        google.maps.event.addListener(placeItem.marker, 'click', function () {
            infowindow.open(map, this);
            // Bounce animation credit https://github.com/Pooja0131/FEND-Neighbourhood-Project5a/blob/master/js/app.js
            placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                placeItem.marker.setAnimation(null);
            }, 500);
            infowindow.setContent(contentString);
        });
    },
    // Alert the user on error. Set messages in the DOM and infowindow
    error: function (e) {
        infowindow.setContent('<h5>Foursquare data is unavailable. Please try refreshing later.</h5>');
        document.getElementById("error").innerHTML = "<h4>Foursquare data is unavailable. Please try refreshing later.</h4>";
    }
});
