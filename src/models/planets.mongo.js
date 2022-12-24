const mongoose = require('mongoose')

const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true
    }
});

//connects planet Schema to "planets" collection
module.exports = mongoose.model('Planet', planetSchema)