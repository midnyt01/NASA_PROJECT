const {
  getAlllaunches,
  saveNewLaunches,
  isLaunchIdExits,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const {skip, limit} = getPagination(req.query)
  const launches = await getAlllaunches(skip, limit);
  return res.status(200).json(launches)
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "mission launch property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    res.status(400).json({
      error: "please use correct format for date",
    });
  }
  await saveNewLaunches(launch);
  console.log(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const launchExist = await isLaunchIdExits(launchId);

  if (!launchExist) {
    res.status(400).json({
      error: "this launch doesnot exist",
    });
  }
  const aborted = await abortLaunchById(launchId);

  if (!aborted) {
    res.status(400).json({
      error: "launch doesnot aborted",
    });
  }
  res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
