const { getTrips, getDriver, getVehicle } = require("api");
// import {withIdObj} from './analysis.js'
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */

//

async function driverReport() {
  const driverIds = [];

  // calling the getTrip api
  getTrip = await getTrips();

  //pushing the driverIds to array
  getTrip.forEach((curr) => {
    driverIds.push(curr.driverID);
  });

  //creating unique ids
  const uniqueIds = [...new Set(driverIds)];

  // using two point method to group drivers and their trips
  const subGroups = [];
  for (const i of uniqueIds) {
    let temporaryArr = [];
    for (const j of getTrip) {
      if (i == j.driverID) {
        temporaryArr.push(j);
      }
    }
    subGroups.push(temporaryArr);
    temporaryArr = [];
  }

  // using unique ids to call the driver info
  let driverInfo = uniqueIds.map((each) => getDriver(each));
  let allDrivers = await Promise.allSettled(driverInfo);

  // process of adding drivers id to the info gotten
  let withIdObj = {};

  uniqueIds.forEach((curr, index) => (withIdObj[curr] = allDrivers[index]));

  const vehicleIds = [];

  // using the info gottent to get vehicle info
  try {
    for (const each in withIdObj) {
      vehicleIds.push(withIdObj[each].value.vehicleID);
    }
  } catch (err) {
    console.log(err);
  }

  // turning the vehidle ids arrays to 1D array
  const flattenVehicleIds = vehicleIds.flat();

  //using the flattenVehicleIds to call the vehicle function
  let vehicleInfo = flattenVehicleIds.map((each) => getVehicle(each));
  let allVehicle = await Promise.allSettled(vehicleInfo);

  // adding drivers id to the vehicle info
  let withVehicleId = {};

  flattenVehicleIds.forEach(
    (curr, index) => (withVehicleId[curr] = allVehicle[index])
  );

  try {
    for (const each in withVehicleId) {
    }
  } catch (err) {
    console.log(err);
  }

  // funtion for creation of trips info
  function createTripsInfo(index) {
    const driver = uniqueIds[index];
    const trips = subGroups[index];
    const driverTrips = [];
    const tripsFact = trips.map((trip, index) => {
      const ans = {
        user: trip.user.name,
        created: trip.created,
        pickup: trip.pickup.address,
        destination: trip.destination.address,
        billed: +trip.billedAmount.toString().split(",").join(""),
        isCash: trip.isCash,
      };
      driverTrips.push(ans);
    });
    return driverTrips;
  }

  // creation of the final result object
  let totalResult = [];
  let count = 0;
  try {
    totalResult = uniqueIds.forEach((id, index) => {
      return totalResult.push({
        fullName: withIdObj[id].value.name,
        phone: withIdObj[id].value.phone,
        id: id,
        // vehicles:
        noOfTrips: subGroups[index].length,
        noOfCashTrips: subGroups[index]
          .filter(({ isCash }) => isCash === true)
          .reduce((acc, curr, index, arr) => arr.length, 0),
        noOfNonCashTrips: subGroups[index]
          .filter(({ isCash }) => isCash === false)
          .reduce((acc, curr, index, arr) => arr.length, 0),
        trips: createTripsInfo(index),
        totalAmountEarned: subGroups[index].reduce((acc, curr, index, arr) => {
          return (
            acc +
            Number(
              Number(curr.billedAmount.toString().split(",").join("")).toFixed(
                2
              )
            )
          );
        }, 0),
        totalCashAmount: subGroups[index]
          .filter(({ isCash }) => isCash === true)
          .reduce(
            (acc, curr, index, arr) =>
              acc +
              Number(
                Number(
                  curr.billedAmount.toString().split(",").join("")
                ).toFixed(2)
              ),
            0
          ),
        totalNonCashAmount: subGroups[index]
          .filter(({ isCash }) => isCash === false)
          .reduce(
            (acc, curr, index, arr) =>
              acc +
              Number(
                Number(
                  curr.billedAmount.toString().split(",").join("")
                ).toFixed(2)
              ),
            0
          ),
      });
    });
  } catch (e) {
    console.log(e);
  }
  return totalResult;
}
driverReport();

module.exports = driverReport;
