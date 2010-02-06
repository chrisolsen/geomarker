(function($) {

  var DEFAULT_CENTER = {lat:45, lng:-97};

  /**
   * Binds form elements to a google map to allow the user to place
   * a marker on the map and set the specified form elements.
   */
  $.fn.geoMarkerForForm = function(latitudeFormElement, longitudeFormElement, options) {
    
    var defaultOptions = {
      startingLatitude: null,
      startingLongitude: null
    };

    var lat = latitudeFormElement.val();
    var lng = longitudeFormElement.val();
    
    options = $.extend(defaultOptions, options);

    return this.each(function() {
      var item = $(this);

      // ensure google libs are loaded 
      if (!GBrowserIsCompatible())
        return false;

      // bind the later cleanup
      $("body").unload(GUnload);

      var map = new GMap2(item[0]);
      var marker;
      
      // set the initial maps position and zoom when editting an existing location
      if (lat != "" && lng != "") {
        var location = new GLatLng(lat, lng);
        // the setCenter has to be done first to prevent error
        marker = new GMarker(location, {draggable:true});
        map.setCenter(location, 12);  
        map.addOverlay(marker);
      }
      // set starting location to North America if no coords are supplied
      else if (options.startingLatitude == null || options.startingLongitude == null) {
        map.setCenter(new GLatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng), 3);
      }
      // geo values exist within the form only starting points exist
      else {
        var loc= new GLatLng(options.startingLatitude, options.startingLongitude);
        // the setCenter has to be done first to prevent errors
        map.setCenter(loc, 12);  
      }

      // allow marker placements
      if (marker == null) {
        var markerListener = GEvent.addListener(map, "click", function(overlay, latlng) {
          marker = new GMarker(latlng, {draggable: true});
          map.addOverlay(marker);
           
          // set the coordinates in the form
          latitudeFormElement.val(latlng.y);
          longitudeFormElement.val(latlng.x);

          // remove the listener now that the marker exists
          GEvent.removeListener(markerListener);
        });
      }
      // allow existing marker to be moved
      else {
        GEvent.addListener(marker, "dragstart", function() {
          map.closeInfoWindow();
        });

        GEvent.addListener(marker, "dragend", function() {
          // set the coordinates in the form
          var point = marker.getPoint();
          latitudeFormElement.val( point.y );
          longitudeFormElement.val( point.x );
        });
      }

      // add mapping control widgets
      map.setUIToDefault();

    });
  } // end of geoMarkerForForm

  $.fn.geoMarker = function(lat, lng, caption) {
    return this.geoMarkers( 
      [{lat:lat, lng:lng, caption:caption}], 
      new GLatLng(lat, lng)
    );
  } // end of geoMarker

  $.fn.geoMarkers = function(coordArr, center) {
    // ensure google libs are loaded 
    if (!GBrowserIsCompatible())
      return [];

    // bind the later cleanup
    $("body").unload(GUnload);

    var map = new GMap2($(this)[0]);

    return this.each(function() {

      var minLat = 999;
      var minLng = 999;
      var maxLng = -999;
      var maxLat = -999;

      for(var i=0; i<coordArr.length; i++) {
        var coord = coordArr[i];
        var marker = new GMarker(new GLatLng(coord.lat, coord.lng));
        map.addOverlay(marker);

        if (coord.caption != null) {
          GEvent.addListener(marker, "click", function() {
            this.openInfoWindow( coord.caption );
          });
        }

        // obtain min and max coords
        if (coord.lat < minLat) minLat = coord.lat;
        if (coord.lat > maxLat) maxLat = coord.lat;
        if (coord.lng < minLng) minLng = coord.lng;
        if (coord.lng > maxLng) maxLng = coord.lng;
      }
    
      if (center == null) {
        var lat = (minLat + maxLat) / 2;
        var lng = (minLng + maxLng) / 2;
        center = new GLatLng(lat, lng); 
      }

      // mark the center point before the mapping the points
      // to prevent crash
      map.setCenter(center, 12);
      map.setUIToDefault();
    });
  } // end of geoMarker

})(jQuery);

