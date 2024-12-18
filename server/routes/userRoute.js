import express from 'express';

import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

// Get user by ID

router.get('/:id', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM users WHERE user_id  = ?', [
      req.params.id
    ]);
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/create', async (req, res) => {
  const {
    email,
    password,
    firstName,
    middleName,
    lastName,
    address_region,
    address_province,
    address_city,
    Address_or_Location,
    age,
    gender,
    birthDate,
    medical_history,
    phone_number
  } = req.body;

  try {
    // Step 1: Check if the email already exists in the users table
    const [existingUser] = await db.query(
      `SELECT * FROM users WHERE email = ? OR phone_number = ?`,
      [email, phone_number]
    );

    // If either email or phone number already exists, return a conflict response
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists.'
      });
    }

    // Step 2: Insert user data into the users table
    const [userResult] = await db.query(
      `INSERT INTO users (full_name, email, password, role , phone_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
        email,
        password,
        'Patient',
        phone_number
      ]
    );

    // Get the generated user_id
    const user_id = userResult.insertId;

    // Step 3: Insert patient data into the patients table
    const [patientResult] = await db.query(
      `INSERT INTO patients (
        user_id,
        address,
        address_region,
        address_province,
        address_city,
        address_or_location,
        date_of_birth,
        age,
        gender,
        first_name,
        middle_name,
        last_name,
        medical_history,
        email,
        password,
        phone_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        null, // Address field is missing in the formData, you can update this if needed
        address_region,
        address_province,
        address_city,
        Address_or_Location,
        birthDate,
        age,
        gender,
        firstName,
        middleName,
        lastName,
        medical_history,
        email,
        password,
        phone_number
      ]
    );

    // Step 4: Return success response with inserted data
    res.status(200).json({
      success: true,
      data: { patient_id: patientResult.insertId, user_id, ...req.body }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/patients/all', async (req, res) => {
  try {
    // Query to fetch all patients with their details
    const [patients] = await db.query(`
      SELECT 
        patients.patient_id,
        patients.user_id,
        patients.first_name as patient_first_name,
        patients.middle_name as middle_name,
        patients.last_name as patient_last_name,
        CONCAT(patients.first_name, ' ', patients.middle_name, ' ', patients.last_name) AS full_name,
        patients.address,
        patients.address_region,
        patients.address_province,
        patients.address_city,
        patients.address_or_location,
        patients.date_of_birth,
        patients.age,
        patients.gender,
        patients.medical_history,
        users.email,
        users.phone_number
      FROM 
        patients
      JOIN 
        users 
      ON 
        patients.user_id = users.user_id
    `);

    // Check if there are any patients
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No patients found'
      });
    }

    // Respond with the list of patients
    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (err) {
    // Handle errors

    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
