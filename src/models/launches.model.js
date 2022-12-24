const { default: axios } = require('axios');
const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
  console.log('Downloading data from spacex_api...')
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
        pagination: false,
        populate : [
            {
                path : 'rocket',
                select : {
                    name: 1
                }
            },
            {
              path : 'payloads',
              select: {
                customers: 1
              }
            }

        ]
    }
})

const launchDocs = response.data.docs
for (const launchDoc of launchDocs) {
  const payloads = launchDoc['payloads']
  const customers = payloads.flatMap((payload)=> {
    return payload['customers']
  })
  const launch = {
  flightNumber: launchDoc['flight_number'],
  mission: launchDoc['name'],
  rocket: launchDoc['rocket']['name'],
  launchDate: launchDoc['date_local'],
  upcoming: launchDoc['upcoming'],
  success: launchDoc['success'],
  customers,
  }
  // console.log(`${launch.flightNumber}, ${launch.mission}`)
  saveLaunches(launch)

}
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  })
  console.log(firstLaunch)
  if(firstLaunch) {
    console.log('launchdata already exist!')
  } else {
    await populateLaunches()
  }
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter)
}


async function isLaunchIdExits(launchId) {
  return await findLaunch({
    flightNumber: launchId
  })
} 

async function getAlllaunches(skip, limit) {
  return await launchesDB
    .find({}, {_id: 0, __v: 0})
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
}

async function saveLaunches(launch) {
  await launchesDB.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
  })
}

async function getLatestFlightNumber () {
  const latestLaunch = await launchesDB
    .findOne()
    .sort('-flightNumber')

    if(!latestLaunch) {
      return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function saveNewLaunches (launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  })

  if (!planet) {
    throw new Error ('No matching planet found')
  }
  const newFlightNumber = await getLatestFlightNumber() + 1;

  Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['zero to mastery', 'NASA'],
    flightNumber: newFlightNumber,
  })

  await saveLaunches(launch)
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne({
    flightNumber: launchId
  },
  {
    success: false,
    upcoming: false
  })

  return aborted.modifiedCount === 1
  // const aborted = launches.get(launchId)
  // console.log(aborted)
  // aborted.upcoming = false
  // aborted.success = false
}




module.exports = {
  loadLaunchData,
  isLaunchIdExits,
  getAlllaunches,
  saveNewLaunches,
  abortLaunchById
};
