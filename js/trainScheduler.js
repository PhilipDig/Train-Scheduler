var database = firebase.database();

// 2. Button for adding trains
$("#add-train-btn").on("click", function (event) {
  event.preventDefault();

  // Grabs user input
  var trainName = $("#train-name-input").val().trim();
  var trainRole = $("#role-input").val().trim();
  var trainStart = $("#start-input").val().trim();
  var trainRate = $("#rate-input").val().trim();

  // Only accept complete inputs

  if (trainName && trainRole && trainStart && trainRate > 0 && trainRate < 1440) {

    // Creates local "ttrainorary" object for holding train data
    var newtrain = {
      name: trainName,
      role: trainRole,
      start: trainStart,
      rate: trainRate
    };

    // Uploads train data to the database
    database.ref().push(newtrain);

    // Logs everything to console
    console.log(newtrain.name);
    console.log(newtrain.role);
    console.log(newtrain.start);
    console.log(newtrain.rate);

    // Alert
    alert("Train successfully added");
  } else {
    alert("Failed to add train, all fields must be specified\nFrequency must be greater than 0 and less than 1440")
  }


  // Clears all of the text-boxes
  $("#train-name-input").val("");
  $("#role-input").val("");
  $("#start-input").val("");
  $("#rate-input").val("");
});

// 3. Create Firebase event for adding train to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function (childSnapshot, prevChildKey) {

  console.log(childSnapshot.val());

  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var trainRole = childSnapshot.val().role;
  var trainStart = childSnapshot.val().start;
  var trainRate = childSnapshot.val().rate;

  // Calculate next train arrival
  var trainBegin = moment().hour(trainStart.slice(0, 2)).minute(trainStart.slice(3, 5))
  var trainStop = trainBegin.clone().add(1, "days").hour(0).minute(0)
  var duration = moment.duration({ minutes: trainRate });
  var trainArrivals = trainBegin.twix(trainStop).toArray(duration)
  var nextArrival = Infinity
  var nextArrivalMinutes = Infinity
  let haveResult = false
  trainRate = parseInt(trainRate)
  trainArrivals.forEach(function (arrival) {
    let waitTime = moment().twix(arrival).length("minutes")
    if (waitTime >= 0 && waitTime < nextArrivalMinutes) {
      nextArrival = arrival
      nextArrivalMinutes = waitTime
    }
  })

  trainBegin = trainBegin.format("LT")
  if (nextArrival != Infinity) {
    nextArrival = nextArrival.format("LT")
  } else {
    nextArrival = trainBegin
  }

  // Add each train's data into the table
  $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + trainRole + "</td><td>" +
    trainBegin + "</td><td>Every " + trainRate + " min</td><td>" + nextArrival + "</td></tr>");
});
