import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'avdeasisjewelry2@gmail.com',
      pass: 'dqeq ukrn hvjg vnyx'
    }
  });

  const mailOptions = {
    from: 'staywelldentalclinic@gmail',
    to: email,
    subject: 'Verify Your Email',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/STAY_WELL%2Flogo.jpg?alt=media&token=07fe4094-1e6f-474b-bb97-66c0ebbec774" alt="Logo" style="max-width: 150px;">
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1a365d; margin-bottom: 20px; text-align: center;">Verify Your Email</h1>
          <p style="color: #4a5568; line-height: 1.6;">Welcome to our dental clinic! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.REACT_FRONT_END_URL}/verify-email/${token}" 
               style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #718096; font-size: 14px; text-align: center;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

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
    firstName,
    middleName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    region,
    province,
    city,
    barangay,
    password,
    medicalHistory
  } = req.body;

  try {
    // Check if the email already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already in use' });
    }

    // Insert into users table
    const [userResult] = await db.query(
      'INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)',
      [email, password, 4] // Assuming role_id 4 is for 'patient'
    );

    const userId = userResult.insertId;

    // Insert into patients table
    const [patientResult] = await db.query(
      `INSERT INTO patients (
        user_id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        address_region,
        address_province,
        address_city,
        address_or_location,
        phone_number,
        medical_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        middleName || null,
        lastName,
        dateOfBirth,
        gender,
        region,
        province,
        city,
        barangay,
        phoneNumber,
        medicalHistory || ''
      ]
    );

    // Generate verification token
    const verificationToken = jwt.sign({ userId }, config.JWT_TOKEN_SECRET, {
      expiresIn: '24h'
    });
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully. Please verify your email.',
      data: {
        patient_id: patientResult.insertId,
        user_id: userId,
        email,
        firstName,
        lastName,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register patient'
    });
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
        patients.phone_number,
        users.created_at
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

// Add this route for deleting a patient
router.delete('/patients/:id', async (req, res) => {
  try {
    // First delete from patients table
    const [patientResult] = await db.query(
      'DELETE FROM patients WHERE patient_id = ?',
      [req.params.id]
    );

    if (patientResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete patient'
    });
  }
});

// Add this route for updating a patient
router.put('/patients/:id', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    region,
    province,
    city,
    barangay,
    medicalHistory
  } = req.body;

  try {
    const [patientResult] = await db.query(
      `UPDATE patients 
       SET first_name = ?,
           middle_name = ?,
           last_name = ?,
           date_of_birth = ?,
           gender = ?,
           address_region = ?,
           address_province = ?,
           address_city = ?,
           address_or_location = ?,
           phone_number = ?,
           medical_history = ?
       WHERE patient_id = ?`,
      [
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        region,
        province,
        city,
        barangay,
        phoneNumber,
        medicalHistory || '',
        req.params.id
      ]
    );

    if (patientResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update email in users table if provided
    if (email) {
      await db.query(
        'UPDATE users SET email = ? WHERE user_id = (SELECT user_id FROM patients WHERE patient_id = ?)',
        [email, req.params.id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully'
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update patient'
    });
  }
});

// Verify email endpoint
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, config.JWT_TOKEN_SECRET);

    // Check if user exists and isn't already verified
    const [user] = await db.query(
      'SELECT user_id, is_verified FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!user[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Update user verification status
    await db.query('UPDATE users SET is_verified = true WHERE user_id = ?', [
      decoded.userId
    ]);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);

    // Handle different types of errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db.query(
      'SELECT user_id, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (!user[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const verificationToken = jwt.sign(
      { userId: user[0].user_id },
      config.JWT_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    await sendVerificationEmail(email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add this route to get patient details
router.get('/patients/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      `
      SELECT 
        p.*,
        u.email,
        CONCAT(p.address_region, ', ', p.address_province, ', ', 
               p.address_city, ', ', p.address_or_location) as full_address
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.patient_id = ?
    `,
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Parse medical history safely
    let medicalHistory;

    try {
      medicalHistory =
        result[0].medical_history && result[0].medical_history !== 'none'
          ? JSON.parse(result[0].medical_history)
          : { allergies: [], conditions: [], medications: [] };
    } catch (error) {
      console.error('Error parsing medical history:', error.message);
      medicalHistory = { allergies: [], conditions: [], medications: [] }; // Default fallback
    }

    const patientData = {
      id: result[0].patient_id,
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      email: result[0].email,
      phone: result[0].phone_number,
      dateOfBirth: result[0].date_of_birth,
      address: result[0].full_address,
      medicalHistory,
      emergencyContact: {
        name: result[0].emergency_contact_name || '',
        relationship: result[0].emergency_contact_relationship || '',
        phone: result[0].emergency_contact_phone || ''
      }
    };

    res.status(200).json({
      success: true,
      data: patientData
    });
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
