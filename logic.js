$(document).ready(function() {
  var searchCity = "";
  var queryURL = "";
  var beginInput = "";
  var beginDate = "";
  var endInput = "";
  var endDate = "";
  var city = "";
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  //Default the Date
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  beginDate = yyyy + "-" + mm + "-" + dd;
  $("#beginDate-input").val(beginDate);

  dd1 = dd + 1;
  endDate = yyyy + "-" + mm + "-" + dd1;
  $("#endDate-input").val(endDate);

  $("#searchButton").on("click", function() {
    var cityInput = $("#city-input")
      .val()
      .trim();
    renderEvents(cityInput);
  });

  $("#clearButton").on("click", function() {
    refresh();
  });

  // API to get user city location by computer IP Address
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
      "https://app.ticketmaster.com/discovery/v2/events.json?&sort=date,asc&apikey=pczsxb2VNGTaABdwFJ0vza3eRe29BFWQ";
    if (lcity !== "") {
      searchCity = lcity;
    } else {
      searchCity = $("#city-input")
        .val()
        .trim();
      if (searchCity === "") {
        return $(".errorText").append(
          "<div class='alert alert-danger' role='alert'>The City must be populated.</div>"
        );
      }
    }

    beginInput = $("#beginDate-input")
      .val()
      .trim();
    if (beginInput === "") {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>The begin date must be populated.</div>"
      );
    } else {
      beginDate = beginInput + "T00:00:00Z";
    }

    endInput = $("#endDate-input")
      .val()
      .trim();
    if (endInput !== "") {
      endDate = endInput + "T23:59:59Z";
    }

    if (searchCity) {
      queryURL += "&" + $.param({ city: searchCity });
      searchCity = "";
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

        for (i = 0; i < 15; i++) {
          if (json._embedded.events) {
            //Name
            $("#results").append(
              $("<h3 class=card-title>").text(json._embedded.events[i].name)
            );
            //Status
            $("#results").append(
              $("<span class='badge badge-success'>").text(
                json._embedded.events[i].dates.status.code
              )
            );

            //Image
            $("#results").append(
              "<img src=" +
                json._embedded.events[i].images[0].url +
                " class=card-img-top width=350 height=250></img>"
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
            $("#results").append(
              $("<h6 class=card-text>").text(
                "Time: " +
                  moment(
                    json._embedded.events[i].dates.start.localTime,
                    "HH:mm"
                  ).format("hh:mm a")
              )
            );

            //URL
            $("#results").append(
              $("<a href=" + json._embedded.events[i].url + ">").text(
                "More Info"
              )
            );

            //Line
            $("#results").append("<hr/>");
          }
        }
      },
      error: function(xhr, status, err) {}
    });
  }
});
