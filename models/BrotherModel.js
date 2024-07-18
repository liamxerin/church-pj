const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const brotherSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ch_name: {
        type: String,
        required: true
    },
    age:{
        type:Number,
        require: true,
    },
    status:{
        type:String,
        require:true,
    },
    birthdate: {
        type: Date,
        required: true
    },
    ethnicity: {
        type: String,
        required: true
    },
    res_lead: {
        type: String,
        required: true
    },
    baptism: {
        type: String,
        required: true
    },
    first_com: {
        type: String,
        required: true
    },
    second_com: {
        type: String,
        required: true
    },
    gender: {
        type:String,
        required: true
    },
    marriage: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    family_image: 
    { type: String },
    members: [
        {
            name: {
                type: String,
                required: true
            },
            ch_name: {
                type: String,
                required: true
            },
            age:{
                type:Number,
                require: true,
            },
            status:{
                type:String,
                require:true,
            },
            birthdate: {
                type: Date,
                required: true
            },
            ethnicity: {
                type: String,
                required: true
            },
            res_lead: {
                type: String,
                required: true
            },
             baptism: {
                type: String,
                required: true
            },
            first_com: {
                type: String,
                required: true
            },
            second_com: {
                type: String,
                required: true
            },
            marriage: {
                type: String,
                required: true
            },
            gender: {
                type:String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
       
            
          
        },
       
      ],
    // picture: {
    //     type: String // Assuming picture is a URL or file path
    // }
}, {timestamps: true},);

module.exports = mongoose.model("Brother", brotherSchema);
