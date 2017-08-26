(function(app, undefined) {
    'use strict';

    /* Global variables
     *
     */
    var map;

    // public method
    // callback in Google Maps API request
    // what the map first looks like when it loads
    // adds markers to the view model

    app.initMap = function() {
        console.log("initMap");
        var mapElem = document.getElementById('map');
        //create google map and append it to the page
        var vienna = { lat: 48.2082, lng: 16.3738 };
        // declare bounds of map
        var bounds = new google.maps.LatLngBounds();

        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapElem, {
            center: vienna,
            zoom: 13
        });

        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
        //create one info window for all markers
        var infowindow = new google.maps.InfoWindow({
            maxWidth: 250
        });

        // create a marker for each location
        // attach marker to attraction object
        // define click events on marker
        vm.filteredItems().forEach(function(attraction) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(
                    attraction.location.lat,
                    attraction.location.lng),
                map: map,
                title: attraction.name(),
                animation: google.maps.Animation.DROP,
                gestureHandling: 'cooperative',
                scrollwheel: false
            });
            // assign marker to attraction
            attraction.marker = marker;
            // adjust boundaries for each location
            bounds.extend(marker.position);
            // Extend the boundaries of the map for each marker
            map.fitBounds(bounds);

            //add event listener to marker
            marker.addListener('click', function() {
                getInfoWindowContent();
                toggleBounce();
            });

            // toggle Bounce marker with setTimeout
            function toggleBounce() {
                if (attraction.marker.getAnimation() !== null) {
                    attraction.marker.setAnimation(null);
                } else {
                    attraction.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        attraction.marker.setAnimation(null);
                    }, 1500);
                }
            }

            // create infowindow content
            function getInfoWindowContent() {
                infowindow.marker = attraction.marker;
                // four square stuff
                setVenueContent();
                //infowindow.setContent('<div>' + attraction.marker.title + '</div>');
                infowindow.open(map, attraction.marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.setMarker = null;
                    // vm.venueInfo('');
                });
            };

            // update venue information in DOM
            function setVenueContent() {
                var foursquareClientID = 'V3SD0U1WAIJOPXUK4W2AR0DPZXUKFQQL5Y2FXKK4YO25FVX0';
                var foursquareClientSecret = 'NEH1GYLAFDS2CL5DSBFRO3DENB55KPWAVJE5ERBWQ1MGLD0X';
                var foursquareVersion = '20170801';
                var foursquareURL_venue = 'https://api.foursquare.com/v2/venues/' + attraction.foursquareID;
                $.ajax({
                    url: foursquareURL_venue,
                    dataType: "jsonp",
                    data: {
                        client_id: 'V3SD0U1WAIJOPXUK4W2AR0DPZXUKFQQL5Y2FXKK4YO25FVX0',
                        client_secret: 'NEH1GYLAFDS2CL5DSBFRO3DENB55KPWAVJE5ERBWQ1MGLD0X',
                        v: '20170801',
                        async: true
                    },
                    success: function(data){
                        console.log(data.response);
                        attraction.marker.title = data.response.venue.name;
                        infowindow.setContent('<div>' + attraction.marker.title + '</div>');
                        // var venue_street = data.response.venue.location.address;
                        // var venue_postalCode = data.response.venue.location.postalCode;
                        // var venue_address = venue_street + ", " + venue_postalCode;
                        // vm.venueName(venue_name);
                        // vm.venueAddress(venue_address);

                    }
                });
            }

        });

        //resize map, tell it to redraw when window is resized
        google.maps.event.addDomListener(window, 'resize', function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
        });
    };

    // Google maps load error
    app.mapError = function() {
        console.log('Google Maps failed to load. Please reload the page.');
    }

    /*
     * Ajax call
     */

    // var getFourSquareData = function() {
    //     var foursquareClientID = 'V3SD0U1WAIJOPXUK4W2AR0DPZXUKFQQL5Y2FXKK4YO25FVX0';
    //     var foursquareClientSecret = 'NEH1GYLAFDS2CL5DSBFRO3DENB55KPWAVJE5ERBWQ1MGLD0X';
    //     var foursquareVersion = '20170801';
    //     var foursquareURL_venue = 'https://api.foursquare.com/v2/venues/' + '4c8df3ce58668cfa9a96cdec';
    //     $.ajax({
    //         url: foursquareURL_venue,
    //         dataType: "jsonp",
    //         data: {
    //             client_id: 'V3SD0U1WAIJOPXUK4W2AR0DPZXUKFQQL5Y2FXKK4YO25FVX0',
    //             client_secret: 'NEH1GYLAFDS2CL5DSBFRO3DENB55KPWAVJE5ERBWQ1MGLD0X',
    //             v: '20170801',
    //             async: true
    //         },
    //         success: function(data) {
    //             console.log('foursquare');
    //             console.log(data.response);
    //             //attraction.marker.title = data.response.venue.name;
    //             // var venue_street = data.response.venue.location.address;
    //             // var venue_postalCode = data.response.venue.location.postalCode;
    //             // var venue_address = venue_street + ", " + venue_postalCode;
    //             // vm.venueName(venue_name);
    //             // vm.venueAddress(venue_address);

    //         }
    //     });
    // }

    /*
     * Attraction Class constructor
     * Gets properties from Model
     */
    var Attraction = function(data) {
        this.name = ko.observable(data.name);
        this.location = {
            lat: data.location.lat,
            lng: data.location.lng
        }
        // this.marker = '';
        this.foursquareID = data.foursquareID;
    };

    // Section class
    var Section = function(name, id) {
        this.name = name;
        this.id = id;
    };

    /*
     * View Model of App
     *
     */
    var ViewModel = function() {
        console.log("ViewModel");
        var self = this;

        /*
         * UI View Model
         */
        self.chosenTab = ko.observable();

        //observable array of sections
        self.sections = ko.observableArray([
            new Section("Venues", "venueView"),
            new Section("Map", "mapView")
        ]);

        // set click target as current chosen object/tab
        self.activateSection = function(tab) {
            self.chosenTab(tab);
            self.resizeMap();
        };

        // if map div is resized while hidden,
        // map needs to be resized.
        self.resizeMap = function() {
            if (self.chosenTab().id === "mapView") {
                var center = map.getCenter();
                google.maps.event.trigger(map, "resize");
                map.setCenter(center);
            }
        }

        self.showContent = function(element) {
            return element === self.chosenTab().id;
        }

        //switch to map
        self.openMap = function(attraction) {
            self.activateSection(self.sections()[1]);
            google.maps.event.trigger(attraction.marker, 'click');
        }


        // Set Map as default open tab
        self.chosenTab(self.sections()[1]);


        /*
         * Content View Model
         */

        // Creates a ko observable array of location objects
        this.attractionList = ko.observableArray(ko.utils.arrayMap(app.initialPOI, function(attraction) {
            return new Attraction(attraction);
        }));

        //console.log(this.attractionList()[0]);

        // make input field an observable
        this.searchTerm = ko.observable('');

        //return search results for listings in an array
        // Google dependent
        this.filteredItems = ko.computed(this._filter, this);

        //foursquare stuff
        this.venueName = ko.observable();
        this.venueAddress = ko.observable();


    };

    ViewModel.prototype._filter = function() {
        var filterText = this.searchTerm().toLowerCase();
        return ko.utils.arrayFilter(this.attractionList(), function(attraction) {
            if (attraction.name().toLowerCase().indexOf(filterText) >= 0) {
                if (attraction.marker) {
                    attraction.marker.setVisible(true);
                }
                return true;
            } else {
                attraction.marker.setVisible(false);
                return false;
            }
        });
    }

    // // Assign View Model to a variable
    var vm = new ViewModel();
    ko.applyBindings(vm);

})(window.app = window.app || {});