const { getTrips, getDriver, getVehicle } = require("api");

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  // variables
  let noOfCashTrips = 0;
  let noOfNonCashTrips = 0;
  let billedTotal = 0;
  let cashBilledTotal = 0;
  let nonCashBilledTotal = 0;
  let noOfDriversWithMoreThanOneVehicle = 0;
  let totalAmountEarned = 0;

  const arrOfMostTripDriver = [];
  let driverIds = [];
  let highestEarningDriverObj = {};
  let getTrip;

  // calling the getTrip api

  getTrip = await getTrips();

  getTrip.forEach((curr) => {
    if (curr.isCash == true) {
      noOfCashTrips++;
      let cash1 = Number(curr.billedAmount.toString().split(",").join(""));
      cashBilledTotal += cash1;
    } else {
      noOfNonCashTrips++;
      let cash2 = Number(curr.billedAmount.toString().split(",").join(""));
      nonCashBilledTotal += cash2;
    }
    let count = Number(curr.billedAmount.toString().split(",").join(""));
    billedTotal += count;

    driverIds.push(curr.driverID);

    highestEarningDriverObj[curr.driverID] =
      highestEarningDriverObj[curr.driverID] +
        Number(curr.billedAmount.toString().split(",").join("")) ||
      Number(curr.billedAmount.toString().split(",").join(""));
  });

  // checking for most trips by a driver by using the ids as key and the number of their trips as value
  const driverObj = {};

  driverIds.forEach((x) => {
    driverObj[x] = driverObj[x] + 1 || 1;
  });

  //picking the highest value, to equal the most trips
  let resultNum = 0;
  let resultKey = "";
  for (const [key, value] of Object.entries(driverObj)) {
    if (value > resultNum) {
      resultNum = value;
      resultKey = key;
    }
  }

  //picking the highest value, to equal the most earn
  let noOfTripsForHigestEarnDriver = 0;
  let idOfHighestEarnDriver = "";
  for (const [keys, values] of Object.entries(highestEarningDriverObj)) {
    if (values > totalAmountEarned) {
      totalAmountEarned = values;
      idOfHighestEarnDriver = keys;
    }
  }

  //creating unique ids to avoid duplicate
  const uniqueIds = [...new Set(driverIds)];

  let mostTripsByDriverObj = [];
  const highestEarnD = [];

  // calling the driver api using the unique ids in a loop

  let driverInfo = uniqueIds.map((each) => getDriver(each));
  let allDrivers = await Promise.allSettled(driverInfo);

  let withIdObj = {};

  uniqueIds.forEach((curr, index) => (withIdObj[curr] = allDrivers[index]));

  try {
    for (const each in withIdObj) {
      if (withIdObj[each].value.vehicleID.length > 1) {
        noOfDriversWithMoreThanOneVehicle++;
      }
      if (each == resultKey) {
        mostTripsByDriverObj.push(withIdObj[each].value);
      }

      if (each == idOfHighestEarnDriver) {
        highestEarnD.push(withIdObj[each].value);
      }
    }
  } catch (err) {
    console.log(err);
  }

  // pushing all the trips of most trips driver in an array
  const arrOfTotalAmountMost = [];
  getTrip.forEach((x) => {
    if (x.driverID == resultKey) {
      arrOfTotalAmountMost.push(x);
    }

    if (x.driverID == idOfHighestEarnDriver) {
      noOfTripsForHigestEarnDriver++;
    }
  });

  // creating the most trips obj
  let mostTripsByDriver;
  mostTripsByDriverObj.forEach((each) => {
    return (mostTripsByDriver = {
      mostTripsByDriver: {
        name: each.name,
        email: each.email,
        phone: each.phone,
        noOfTrips: resultNum,
        totalAmountEarned: arrOfTotalAmountMost.reduce((acc, curr) => {
          return acc + Number(curr.billedAmount.toString().split(",").join(""));
        }, 0),
      },
    });
  });

  // creating the higest earn driver obj
  let highestEarningDriver;
  highestEarnD.forEach((each) => {
    return (highestEarningDriver = {
      highestEarningDriver: {
        name: each.name,
        email: each.email,
        phone: each.phone,
        noOfTrips: noOfTripsForHigestEarnDriver,
        totalAmountEarned: Number(totalAmountEarned.toFixed(2)),
      },
    });
  });

  // constructing the output
  const output = {
    noOfCashTrips: noOfCashTrips,
    noOfNonCashTrips: noOfNonCashTrips,
    billedTotal: Number(billedTotal.toFixed(2)),
    cashBilledTotal: Number(cashBilledTotal.toFixed(2)),
    nonCashBilledTotal: Number(nonCashBilledTotal.toFixed(2)),
    noOfDriversWithMoreThanOneVehicle: noOfDriversWithMoreThanOneVehicle,
    ...mostTripsByDriver,
    ...highestEarningDriver,
  };

  // console.log(output);
  return output;
}
analysis();

module.exports = analysis;
