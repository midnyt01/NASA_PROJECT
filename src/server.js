const http = require('http');

require('dotenv').config();

const { planetData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model')
const {mongoConnect} = require('./services/mongo');

const app = require('./app');


const PORT = process.env.PORT || 8000;

const server = http.createServer(app)
async function startServer () {
    await mongoConnect()
    await planetData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`Listening at port ${PORT}`)
    })

}

startServer()


