const contractAddresses = require("./contractAddresses.json")
const abi = require("./abi.json")
const AADHAR_SERVER_URL = "http://localhost:12345"; 

const field_to_numbers = {
    "name": 1, 
    "dob": 2, 
    "fatherName": 3, 
    "motherName": 4,
    "address": 5, 
    "biometrics": 6, 
    "phoneNumber": 7
}; 

module.exports = {
    contractAddresses,
    abi,
    AADHAR_SERVER_URL, 
    field_to_numbers
}
