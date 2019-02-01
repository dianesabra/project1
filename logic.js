$(document).ready(function() {
  var searchCity = "";
  var queryURL = "";
  var beginInput = "";
  var beginDate = "";
  var endInput = "";
  var endDate = "";
  var city = "";

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
  todayDate = yyyy + "-" + mm + "-" + dd;
  $("#beginDate-input").val(beginDate);
  //code to determine the default end date (1 day from today's date)

  dd1 = dd + 1;
  endDate = yyyy + "-" + mm + "-" + dd1;
  $("#endDate-input").val(endDate);

  function sendEmail(subject, body, email) {
    Email.send({
      Host: "smtp.elasticemail.com",
      Username: "dwsabra@gmail.com",
      Password: "e697d0d0-f66f-474a-93e5-8ac035b1305a",
      To: email,
      From: "dsabra@wiseit.com",
      Subject: subject,
      Body: body
    }).then(message => {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>Email Sent</div>"
      );
    });
  }

  $(document).on("click", ".buttonMe", function() {
    $(".errorText").empty();
    var subject = $(this).attr("data-name");
    var body = $(this).attr("data-url");
    var email = $(".email-input")
      .val()
      .trim();

    if (email === "") {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>The email must be populated.</div>"
      );
    }
    sendEmail(subject, body, email);
  });

  //on click event for search button
  $("#searchButton").on("click", function() {
    var cityInput = $("#city-input")
      .val()
      .trim();
    renderEvents(cityInput);
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
    $(".form-control").val("");
    $("#results").empty();
    $(".errorText").empty();
  }

  function renderEvents(lcity) {
    $("#results").empty();
    $(".errorText").empty();
    queryURL =
      "https://app.ticketmaster.com/discovery/v2/events.json?&sort=date,asc&apikey=pczsxb2VNGTaABdwFJ0vza3eRe29BFWQ&size=100";
    if (lcity !== "") {
      searchCity = lcity;
    } else {
      searchCity = autocity;
      city2 = $("#city-input")
        .val()
        .trim();

      if (city2 === "") {
        return $(".errorText").append(
          "<div class='alert alert-danger' role='alert'>The city must be populated.</div>"
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
      beginDate = beginInput + "T12:00:00Z";
    }

    endInput = $("#endDate-input")
      .val()
      .trim();
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

    if (beginInput < todayDate) {
      return $(".errorText").append(
        "<div class='alert alert-danger' role='alert'>The begin date cannot be before today.</div>"
      );
    }

    if (searchCity) {
      queryURL += "&" + $.param({ city: searchCity });
      searchCity = "";
    }

    if (beginDate) {
      queryURL += "&" + $.param({ startDateTime: beginDate });
      beginDate = "";
    }

    if (endDate) {
      queryURL += "&" + $.param({ endDateTime: endDate });
      endDate = "";
    }
    console.log(queryURL);
    $.ajax({
      type: "GET",
      url: queryURL,
      async: true,
      dataType: "json",
      success: function(json) {
        if (json.page.totalElements === 0) {
          return $(".errorText").append(
            "<div class='alert alert-danger' role='alert'>There are no search results within these filters.</div>"
          );
        }
        if (json.page.totalElements > 200) {
          counter = 200;
        } else {
          counter = json.page.totalElements;
        }

        for (i = 0; i < counter; i++) {
          if (json._embedded.events) {
            var newRow = $("<div>");
            newRow.addClass("row");
            var newDiv = $("<div>");
            newDiv.addClass("col-sm-7");
            var newContainer = $("<div>");
            newContainer.addClass("container cardbox");
            var newHdr = $("<h3>");
            newHdr.addClass("card-text");

            var divImg = $("<div>");
            divImg.addClass("col-sm-3");

            //Name

            if (typeof json._embedded.events[i].name == "string") {
              newHdr.append(json._embedded.events[i].name);
            } else {
              continue;
            }

            //Status
            if (json._embedded.events[i].dates.status.code == "onsale") {
              newHdr.append(
                $("<span class='badge badge-success'>").text(
                  json._embedded.events[i].dates.status.code
                )
              );
            } else if (
              json._embedded.events[i].dates.status.code == "offsale"
            ) {
              newHdr.append(
                $("<span class='badge badge-warning'>").text(
                  json._embedded.events[i].dates.status.code
                )
              );
            } else {
              newHdr.append(
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

            //Button
            newDiv.append(
              "<button class='buttonMe btn btn-info'> Email </button>"
            );
            $(".buttonMe").attr("data-name", json._embedded.events[i].name);
            $(".buttonMe").attr("data-url", json._embedded.events[i].url);

            //URL
            newDiv.append(
              $(
                "<a href=" +
                  json._embedded.events[i].url +
                  " target='_blank' class='btn btn-outline-success active' role='button' aria-pressed='true'>"
              ).text("More Info")
            );

            //Local Date
            newDiv.append(
              $("<h5>").text(
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
            newDiv.append(
              $("<p>").text(
                json._embedded.events[i]._embedded.venues[0].name +
                  ", " +
                  json._embedded.events[i]._embedded.venues[0].address.line1
              )
            );

            //Line
            newRow.append(divImg).append(newDiv);
            newContainer.append(newHdr).append(newRow);
            $("#results").append(newContainer);
          }
        }
      },
      error: function(xhr, status, err) {}
    });
  }
});
