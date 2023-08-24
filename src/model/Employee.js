const mongoose = require('mongoose');
const util = require('../../util');

const employeeSchema = new mongoose.Schema ({
    id: {type: String, required: [true, "Employee ID is required."], unique: true},
    firstname: {type: String, required: [true, "First name is required."]},
    lastname: {type: String, required: [true, "Last name is required."]},
    department: {type: String, required: [true, "Department is required."]},
    empStatus: {type: String, required: [true, "Employment Status is required."], enum : ['full-time','part-time', 'contractual']},
    email: {type: String, required: [true, "Email is required."], validate: [ util.validation.validateEmail, 'Please enter a valid email' ]},
    documentURL: String,
    documentName: String
});

const Employee = mongoose.model("Employee", employeeSchema, "Employee");

module.exports = {Employee};