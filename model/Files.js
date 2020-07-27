const mongoose = require('mongoose');

const FilesSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        min: 100,
        max: 255
    },
    filename: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    format: {
        type: String,
        required: true,
        min: 6,
        max: 10
    },
    file:{
        type:Buffer
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Files', FilesSchema);