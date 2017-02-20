'use strict';
var map;
var markers = [];
var mainInfowindow;
var infoWindowString ; //holds string for selected marker
var resURL;
var resStreet;
var resCity ;
var resPhone;

var locJSON = [
  {title: "Sal's", group: 'Burritos', location: {lat: 36.845671, lng: -119.783075}},
  {title: 'Casa Corona', group: 'Burritos', location: {lat: 36.838776646609254, lng: -119.75295066833496}},
  {title: 'The Habit Burger Grill', group: 'Hamburgers', location: {lat: 36.858096,lng:-119.783509}},
  {title: 'Panda Express', group: 'Noodles', location: {lat: 36.8531947559099, lng: -119.73028890098708}},
  {title: 'P.F. Chang Restaurant', group: 'Noodles', location: {lat: 36.851430, lng: -119.790233}},
  {title: 'BJ Brewhouse Restaurant', group: 'Hamburgers', location: {lat: 36.808439, lng: -119.774648}}         
];

  /**
   * Knockout ViewModel class
   */
  class ViewModel {
    constructor() {
      var self = this;
      this.categoryList = [];

      // dynamically retrieve categories to
      // create drop down list later
      locJSON.map(food => {
        if (!this.categoryList.includes(food.group))
          this.categoryList.push(food.group);
      });

      this.foodArray = ko.observableArray(locJSON);
      // Observable Array for drop down list
      this.foodGroups = ko.observableArray(this.categoryList); 
      // This will hold the selected value from drop down menu
      this.selectedCategory = ko.observable(); 

      /**
       * Filter function, return filtered food by
       * selected category from <select>
       */
      this.filterFood = ko.computed(() => {
        if (!this.selectedCategory()) {
          // No input found, return all food
          console.log("Want to call showlistings for all markers");
          //showListings('Choose category to filter');
          return this.foodArray();
        } else {
          // input found, match food type to filter 
          //console.log("==================="+self.selectedCategory());
          showListings(self.selectedCategory());
          return ko.utils.arrayFilter(this.foodArray(), function(food) {
            if ( food.group === self.selectedCategory() ) {
                return true;
              } else {
                return false;
              }
          });
        } //.conditional  someMarker.setVisible(true);
      }); //.filterFood
      this.listItemClick = function(data) {
        populateInfoWindow(data.marker, mainInfowindow);
      }
    } //.constructor
  }; //.class

var vm;

function initMap() {
  // Create a new map; only center and zoom are required.
  vm = new ViewModel();
  ko.applyBindings(vm);

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 36.848624, lng: -119.755932},
    zoom: 10,
  });
  mainInfowindow = new google.maps.InfoWindow();

  //Create markers for each location
  for (var i = 0; i < vm.foodArray().length; i++) {
    // Get the position from the location
    var position = vm.foodArray()[i].location;
    var title = vm.foodArray()[i].title;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      map: map
    });
    console.log("markerID=" + marker.id + "; i="+i + title);
    // Push the marker to our array of markers.
    markers.push(marker);

    vm.foodArray()[i].marker = marker;
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      console.log("addListener: this title" + this.title);
      populateInfoWindow(this, mainInfowindow);
    });
  }
  showListings('Choose category to filter');
}


// Sets timer for animation;
function stopAnimation(marker, infowindow) {
    setTimeout(function () {
        marker.setAnimation(null);
         marker.setIcon(infowindow.marker.defaultMarkerIcon);
    }, 2100);//credit udacity reviewer:  multiple the desired number of bounces by 700 ms. So if you want 2 bounces, use 1400 ms.
             //Sets 2nd timer o close infowindow and set marker to default
}

function populateInfoWindow(marker, infowindow) {
  var apiURL = 'https://api.foursquare.com/v2/venues/search';//?ll=';
  var ClientID = "LJXW25X1PJ2PRLWV3BOLXAFLBRW0K2SM3FXEWWE4D2S2BCU2";
  var ClientSecret ="MBLBOVBFP5MNCPIRNKWSXJ01OZWHJG1DUWVUX4Y1V3Q4CTNW";
  var ClientVersion = '20170112';
 
  // Checks if infowindow is not already opened on this marker
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.open(map, marker);
    //infowindow.setContent('Loading...');//clear window so it doesn't show prev click's info
    infowindow.setContent("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>");

    infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);
    //console.log("== populateInfoWindow before getFoursquareInfo-------------- " + infoWindowString)
    $.ajax({
      url:apiURL,
      dataType:"json",
      data:{
        ll:locJSON[marker.id].location.lat + "," + locJSON[marker.id].location.lng,
        client_id:ClientID,
        client_secret:ClientSecret,
        v:ClientVersion
       // near:"Fresno CA",
        //query:"Restaurant"
        }
      }).done(function(data) {
        resURL =  data.response.venues[0].url;
        if (typeof data.response.venues[0].url === 'undefined'){
          resURL = "";
        }
        resStreet = data.response.venues[0].location.formattedAddress[0];
        resCity = data.response.venues[0].location.formattedAddress[1];
        resPhone = formatPhone(data.response.venues[0].contact.phone);
        if (typeof data.response.venues[0].contact.phone === 'undefined'){
          resPhone = "";
        } 
        infoWindowString = '<div class="infoWindow> ' +
              '<div class="contentTitle"><h3><a href="' + resURL +'">' + locJSON[marker.id].title + "</a></h3></div>" +
              '<div class="content"><u>' + resStreet + '</u></div>' +
              '<div class="content">' + resCity + '</div>' +
              '<div class="content">' + resPhone + '</div></div>';
        infowindow.setContent(infoWindowString);
      }).fail(function() {
        alert("An error ocurred with Foursquare API call. Try to refresh page reload Foursquare data.");
      });

    stopAnimation(marker, infowindow);
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}

// Loops and Displays all markers
function showListings(selGroup) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  //selectedCategory.value == "Choose category to filter" ||
  hideListings();
  for (var i = 0; i < markers.length; i++) {
    console.log("compare..."+ selGroup + "  vs " + locJSON[i].group);
    console.log("index:"+ i + "  position " + markers[i].position);
    if (selGroup == "Choose category to filter"||selGroup == locJSON[i].group){  
      //markers[i].setMap(map);
      markers[i].setVisible(true);
      bounds.extend(markers[i].position);
    }
    else {
      markers[i].setVisible(false);
//      markers[i].setMap(null);
      bounds.extend(markers[i].position);
    }
  }
  map.fitBounds(bounds);
}

// Loops and Hides all markers
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    //markers[i].setMap(null);
    markers[i].setVisible(false);
  }
}

function googleError() {
  alert("Google Maps has failed to load. Please check your internet connection and try again.");
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
