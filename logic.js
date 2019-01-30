$(document).ready(function() {
  var searchCity = "";
  var queryURL = "";
  var beginInput = "";
  var beginDate = "";
  var endInput = "";
  var endDate = "";
  var city = "";
  var autocity = ""; 
  var autostatecode = "";

//code to determine the default begin date (today's current date) 
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

      if (dd < 10) {
      dd = "0" + dd;
      }
      if (mm < 10) {
      mm = "0" + mm;
      }
  beginDate = yyyy + "-" + mm + "-" + dd;
  $("#beginDate-input").val(beginDate);
//code to determine the default end date (1 day from today's date)
  dd1 = dd + 1;
  endDate = yyyy + "-" + mm + "-" + dd1;
  $("#endDate-input").val(endDate);

// code to autocomplete list of cities
jQuery(function () 
 {
	 jQuery("#city-input").autocomplete({
		source: function (request, response) {
		 jQuery.getJSON(

            "http://gd.geobytes.com/AutoCompleteCity?callback=?&filter=US&template=<geobytes%20city>,%20<geobytes%20code>&q="+request.term,
      
       function (data) {
			 response(data);
			}
		 );
		},
		minLength: 3,
		select: function (event, ui) {
		 var selectedObj = ui.item;
		 jQuery("#city-input").val(selectedObj.value);
		getcitydetails(selectedObj.value);
		 return false;
		},
		open: function () {
		 jQuery(this).removeClass("ui-corner-all").addClass("ui-corner-top");
		},
		close: function () {
		 jQuery(this).removeClass("ui-corner-top").addClass("ui-corner-all");
		}
	 });
	 jQuery("#city-input").autocomplete("option", "delay", 100);
	});
//code to extract city inputs details 
  function getcitydetails(fqcn) {
    if (typeof fqcn == "undefined") fqcn = jQuery("#city-input").val();
    cityfqcn = fqcn;
    if (cityfqcn) {
        jQuery.getJSON(
                    "http://gd.geobytes.com/GetCityDetails?callback=?&fqcn="+cityfqcn,
                       function (data) {
                        
                        jQuery("#geobytescode").val(data.geobytescode);
                       

                jQuery("#geobytesinternet").val(data.geobytesinternet);
                jQuery("#geobytescountry").val(data.geobytescountry);
                jQuery("#geobytesregionlocationcode").val(data.geobytesregionlocationcode);
                jQuery("#geobytesregion").val(data.geobytesregion);
                jQuery("#geobyteslocationcode").val(data.geobyteslocationcode);
                jQuery("#geobytescity").val(data.geobytescity);
                jQuery("#geobytescityid").val(data.geobytescityid);
                jQuery("#geobytesfqcn").val(data.geobytesfqcn);
                jQuery("#geobyteslatitude").val(data.geobyteslatitude);
                jQuery("#geobyteslongitude").val(data.geobyteslongitude);
                jQuery("#geobytescapital").val(data.geobytescapital);
                jQuery("#geobytestimezone").val(data.geobytestimezone);
                jQuery("#geobytesnationalitysingular").val(data.geobytesnationalitysingular);
                jQuery("#geobytespopulation").val(data.geobytespopulation);
                jQuery("#geobytesnationalityplural").val(data.geobytesnationalityplural);
                jQuery("#geobytesmapreference").val(data.geobytesmapreference);
                jQuery("#geobytescurrency").val(data.geobytescurrency);
                jQuery("#geobytescurrencycode").val(data.geobytescurrencycode);

                autocity = data.geobytescity; 
                autostatecode = data.geobytescode;
                
                console.log(autocity);
                console.log(autostatecode);
              }
        );
    }
  }


//on click event for search button
  $("#searchButton").on("click", function() {
    var cityInput = autocity;
    renderEvents(cityInput);
    autocity = "";
    autostatecode="";
  });

//on click event for clear button
  $("#clearButton").on("click", function() {
    refresh();
  });

// API to get default city location by computer IP Address
  $.get("https://ipinfo.io/json", function(response) {
    city = response.city;
    $("#city-input").val(city);
    renderEvents(city);
  });

  function refresh() {
    $("#city-input").val("");
    $("#beginDate-input").val("");
    $("#endDate-input").val("");
    $("#results").empty();
    $(".errorText").empty();
  }

  function renderEvents(lcity) {
    $("#results").empty();
    $(".errorText").empty();
    queryURL =
      "https://app.ticketmaster.com/discovery/v2/events.json?&size=200&sort=date,asc&apikey=pczsxb2VNGTaABdwFJ0vza3eRe29BFWQ";
    if (lcity !== "") {
      searchCity = lcity;
    } else {
      searchCity = autocity;
      city2 = $("#city-input").val().trim();

      if (city2 === "") {
        return $(".errorText").append(
          "<div class='alert alert-danger' role='alert'>The city must be populated.</div>"
        );
      }
    }

    beginInput = $("#beginDate-input").val().trim();
    if (beginInput === "") {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>The begin date must be populated.</div>"
      );
    } else {
      beginDate = beginInput + "T00:00:00Z";
    }

    endInput = $("#endDate-input").val().trim();
    if (endInput !== "") {
      endDate = endInput + "T23:59:59Z";
    }

    function calcDaysBetween(date1, date2) {
      dt1 = new Date(date1);
      dt2 = new Date(date2);
      return Math.floor(
        (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
          Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
          (1000 * 60 * 60 * 24)
      );
    }
    var daysBetween = calcDaysBetween(beginInput, endInput);
 
    if (daysBetween <= -1) {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>The end date cannot be before or on the begin date.</div>"
      );
    }

    if (searchCity) {
      queryURL += "&" + $.param({ city: searchCity });
      searchCity = "";
    }

    if (autostatecode) {
      queryURL += "&" + $.param({ stateCode: autostatecode});
      autostatecode = ""; 
    }

    if (beginDate) {
      queryURL += "&" + $.param({ startDateTime: beginDate });
      beginDate = "";
    }

    // if (endDate) {
    //   queryURL += "&" + $.param({ endDateTime: endDate });
    //   endDate = "";
    // }

    console.log(queryURL);
    $.ajax({
      type: "GET",
      url: queryURL,
      async: true,
      dataType: "json",
      success: function(json) {
        console.log(json);

        for (i = 0; i < json.page.totalElements; i++) {
          if (json._embedded.events) {
 	    var newRow = $("<div>");
            newRow.addClass("row");
            var newDiv = $("<div>");
            newDiv.addClass("col-sm-7");
            var newContainer = $("<div>");
            newContainer.addClass("container");

            var divImg = $("<div>");
            divImg.addClass("col-sm-3");
            //Name
            newContainer.append(
              $("<h3 card-text>").text(json._embedded.events[i].name)
            );
		  
          //Status
          if(json._embedded.events[i].dates.status.code == "onsale") {
            $("#results").append(
              $("<span class='badge badge-success'>").text(
                json._embedded.events[i].dates.status.code
              )
            );
            } else if (json._embedded.events[i].dates.status.code == "offsale") {
            $("#results").append(
              $("<span class='badge badge-warning'>").text(
                json._embedded.events[i].dates.status.code
              )
            );
            } else {
            $("#results").append(
              $("<span class='badge badge-danger'>").text(
                json._embedded.events[i].dates.status.code
              )
            );
          } 
            //Image
            divImg.append(
              "<img src=" +
                json._embedded.events[i].images[0].url +
                " width=150 height=150 />"
            );
            //Local Date
            $("#results").append(
              $("<h5 class=card-text>").text(
                "Date: " +
                  moment(json._embedded.events[i].dates.start.localDate).format(
                    "MMM Do YYYY"
                  )
              )
            );
            //Local Time
            newDiv.append(
              $("<h6>").text(
                "Time: " +
                  moment(
                    json._embedded.events[i].dates.start.localTime,
                    "HH:mm"
                  ).format("hh:mm a")
              )
            );
  
             //Venue 
            newDiv..append(
              $("<p class=card-text>").text(
                json._embedded.events[i]._embedded.venues[0].name
              )
            );
            //Address
            newDiv..append(
              $("<p class=card-text>").text(
                json._embedded.events[i]._embedded.venues[0].address.line1
              )
            );
           //URL
            newDiv.append(
              $("<a href=" + json._embedded.events[i].url + ">").text(
                "More Info"
              )
            );
            //Line
            newRow.append(divImg).append(newDiv);
            newContainer.append(newRow);
            $("#results").append(newContainer);
          }
        }
      },
      error: function(xhr, status, err) {}
    });
  }
});

