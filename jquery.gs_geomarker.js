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

      if (lat != "" && lng != "") {
        var location = new GLatLng(lat, lng);
        // the setCenter has to be done first to prevent errors
        map.setCenter(location, 12);  
        map.addOverlay(new GMarker(location));
      }
      // set starting location to North America if no coords are supplied
      else if (options.startingLatitude == null || options.startingLongitude == null) {
        map.setCenter(new GLatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng), 3);
      }
      // geo values exist within the form 
      // only starting points exist
      else {
        var location = new GLatLng(options.startingLatitude, options.startingLongitude);
        // the setCenter has to be done first to prevent errors
        map.setCenter(location, 12);  
      }

      // allow marker placements
      GEvent.addListener(map, "click", function(overlay, latlng) {
        map.clearOverlays();
        map.addOverlay(new GMarker(latlng));
         
        // set the coordinates in the form
        latitudeFormElement.val(latlng.lat());
        longitudeFormElement.val(latlng.lng());
      })

      // add mapping control widgets
      map.setUIToDefault();

    });
  } // end of geoMarkerForForm

  $.fn.geoMarker = function(lat, lng, caption) {
    return this.geoMarkers( [{lat:lat, lng:lng, caption:caption}] );
  } // end of geoMarker

  $.fn.geoMarkers = function(coordArr, center) {
    // ensure google libs are loaded 
    if (!GBrowserIsCompatible())
      return [];

    // bind the later cleanup
    $("body").unload(GUnload);

    if (center == null)
      center = coordArr[0];

    // mark the center point before the mapping the points
    // to prevent crash
    var map = new GMap2($(this)[0]);
    map.setCenter(new GLatLng(center.lat, center.lng), 12);
    map.setUIToDefault();

    var coord;
    var marker;

    return this.each(function() {
      for(var i=0; i<coordArr.length; i++) {
        coord = coordArr[i];
        marker = new GMarker(new GLatLng(coord.lat, coord.lng));
        map.addOverlay(marker);

        if (coord.caption != null) {
          GEvent.addListener(marker, "click", function() {
            map.openInfoWindow(map.getCenter(), document.createTextNode(coord.caption));
          });
        }
      }
    });
  } // end of geoMarker

})(jQuery);
