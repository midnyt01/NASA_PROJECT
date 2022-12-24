const request = require('supertest')
const app = require('../../app')
const { mongoConnect, mongoDisconnect } = require('../../services/mongo')
const completelaunchData = {
    mission: "Kepler Exploration X",
    rocket: "NASA-177 A",
    launchDate: "May 19, 2025",
    target: "Kepler-452 b"
}
const launchDatawithoutdate = {
    mission: "Kepler Exploration X",
    rocket: "NASA-177 A",
    target: "Kepler-452 b",
}
const launchDatawithworngdate = {
    mission: "Kepler Exploration X",
    rocket: "NASA-177 A",
    launchDate: "abcd",
    target: "Kepler-452 b",
}

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect()
    });

    afterAll(async () => {
        await mongoDisconnect()
    })

    describe('Test / GET launches', () => {
        test('It should responde with 200 success', async ()=> {
            await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200)
        })
    })
    
    describe('Test / POST launches', () => {
        test('It should respond with 201 created',async ()=> {
            const response = await request(app)
            .post('/v1/launches')
            .send(completelaunchData)
            .expect(201)
            .expect('Content-Type', /json/)
            
            const requestDate = new Date(completelaunchData.launchDate).valueOf()
            const responseDate = new Date (response.body.launchDate).valueOf()
    
            expect(requestDate).toBe(responseDate)
    
            expect(response.body).toMatchObject(launchDatawithoutdate)
    
        })
    
        test('It should catch missing required properties', async ()=> {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDatawithoutdate)
            .expect(400)
            .expect('Content-Type', /json/)
    
            expect(response.body).toStrictEqual({
                error: "mission launch property"
            })
        })
        test('It should catch invalid Date', async ()=> {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDatawithworngdate)
            .expect(400)
            .expect('Content-Type', /json/)
    
            expect(response.body).toStrictEqual({
                error: "please use correct format for date"
            })
        })
    })
})



