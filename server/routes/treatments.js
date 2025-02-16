import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';

const router = express.Router();
const db = config.mySqlDriver;

const queries = {
  getAllTreatments: `
    SELECT 
      t.*,
      e.name as dentist_name,
      GROUP_CONCAT(tt.tooth_number) as tooth_numbers,
      GROUP_CONCAT(tt.treatment) as tooth_treatments,
      GROUP_CONCAT(tt.status) as tooth_statuses
    FROM treatments t
    LEFT JOIN employees e ON t.dentist_id = e.id
    LEFT JOIN treatment_teeth tt ON t.id = tt.treatment_id
    WHERE t.patient_id = ?
    GROUP BY t.id
  `,
  getTreatmentById: `
    SELECT 
      t.*,
      e.name as dentist_name,
      GROUP_CONCAT(tt.tooth_number) as tooth_numbers,
      GROUP_CONCAT(tt.treatment) as tooth_treatments,
      GROUP_CONCAT(tt.status) as tooth_statuses
    FROM treatments t
    LEFT JOIN employees e ON t.dentist_id = e.id
    LEFT JOIN treatment_teeth tt ON t.id = tt.treatment_id
    WHERE t.id = ?
    GROUP BY t.id
  `,
  createTreatment: `
    INSERT INTO treatments (
      id, appointment_id, patient_id, date, dentist_id, 
      notes, type
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  createTreatmentTooth: `
    INSERT INTO treatment_teeth 
    (treatment_id, tooth_number, treatment, status) 
    VALUES (?, ?, ?, ?)
  `,
  updateTreatment: `
    UPDATE treatments 
    SET dentist_id = ?, notes = ?, type = ?
    WHERE id = ?
  `,
  deleteTreatmentTeeth: `
    DELETE FROM treatment_teeth 
    WHERE treatment_id = ?
  `,
  deleteTreatment: `
    DELETE FROM treatments WHERE id = ?
  `,
  getTreatmentTeeth: `
    SELECT 
      tooth_number as toothNumber,
      treatment,
      status
    FROM treatment_teeth 
    WHERE treatment_id = ?
  `
};

// Get all treatments for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const [treatments] = await db.query(queries.getAllTreatments, [
      req.params.patientId
    ]);

    // Get tooth treatments for each treatment
    const formattedTreatments = await Promise.all(
      treatments.map(async treatment => {
        const [toothTreatments] = await db.query(queries.getTreatmentTeeth, [
          treatment.id
        ]);

        console.log({ treatment, toothTreatments });

        return {
          id: treatment.id,
          appointmentId: treatment.appointment_id,
          patientId: treatment.patient_id,
          date: treatment.date,
          dentist_id: treatment.dentist_id,
          dentist_name: treatment.dentist_name,
          notes: treatment.notes,
          type: treatment.type,
          toothTreatments // This will be an array of objects with the correct structure
        };
      })
    );

    res.json({
      success: true,
      data: formattedTreatments
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch treatments'
    });
  }
});

// Get treatment by ID
router.get('/:id', async (req, res) => {
  try {
    const [treatments] = await db.query(queries.getTreatmentById, [
      req.params.id
    ]);

    if (!treatments || treatments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    // Format the response with the new structure
    const treatment = treatments[0];
    const toothNumbers = treatment.tooth_numbers?.split(',') || [];
    const toothTreatments = treatment.tooth_treatments?.split(',') || [];

    const formattedTreatment = {
      id: treatment.id,
      appointmentId: treatment.appointment_id,
      patientId: treatment.patient_id,
      date: treatment.date,
      dentist_id: treatment.dentist_id,
      dentist_name: treatment.dentist_name,
      notes: treatment.notes,
      type: treatment.type,
      toothNumbers,
      toothTreatments: toothNumbers.reduce((acc, num, index) => {
        acc[num] = toothTreatments[index];
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: formattedTreatment
    });
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment'
    });
  }
});

// Create treatment
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const treatmentId = uuidv4();
    const {
      patientId,
      appointmentId,
      dentist: dentistId,
      notes,
      type,
      toothTreatments // Now an array of { toothNumber, treatment, status }
    } = req.body;

    // Create treatment record
    await connection.query(queries.createTreatment, [
      treatmentId,
      appointmentId,
      patientId,
      new Date(),
      dentistId,
      notes,
      type
    ]);

    // Insert tooth treatments using the new structure
    for (const treatment of toothTreatments) {
      await connection.query(queries.createTreatmentTooth, [
        treatmentId,
        treatment.toothNumber,
        treatment.treatment,
        treatment.status || 'Pending'
      ]);
    }

    await connection.commit();

    // Fetch and return the created treatment
    const [treatments] = await db.query(queries.getTreatmentById, [
      treatmentId
    ]);

    if (!treatments || treatments.length === 0) {
      throw new Error('Treatment creation failed');
    }

    // Format the response
    const treatment = treatments[0];
    const formattedTreatment = {
      id: treatment.id,
      appointmentId: treatment.appointment_id,
      patientId: treatment.patient_id,
      date: treatment.date,
      dentist_id: treatment.dentist_id,
      dentist_name: treatment.dentist_name,
      notes: treatment.notes,
      type: treatment.type,
      toothTreatments // Return the same toothTreatments array
    };

    // Emit treatment created event
    global.io.emit('treatmentCreated', {
      patientId: formattedTreatment.patientId,
      treatment: formattedTreatment
    });

    res.status(201).json({
      success: true,
      data: formattedTreatment
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create treatment'
    });
  } finally {
    connection.release();
  }
});

// Update treatment
router.put('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { dentist: dentistId, notes, type, toothTreatments } = req.body;
    console.log('Received data:', { dentistId, notes, type, toothTreatments });

    // Validate toothTreatments
    if (!Array.isArray(toothTreatments)) {
      throw new Error('toothTreatments must be an array');
    }

    // Update treatment record
    await connection.query(queries.updateTreatment, [
      dentistId,
      notes,
      type,
      req.params.id
    ]);

    // Delete existing tooth treatments
    await connection.query(queries.deleteTreatmentTeeth, [req.params.id]);

    // Insert new tooth treatments
    for (const tt of toothTreatments) {
      await connection.query(queries.createTreatmentTooth, [
        req.params.id,
        tt.toothNumber,
        tt.treatment,
        tt.status || 'Pending'
      ]);
    }

    await connection.commit();

    // Fetch updated treatment
    const [treatments] = await connection.query(queries.getTreatmentById, [
      req.params.id
    ]);

    if (!treatments || treatments.length === 0) {
      throw new Error('Treatment not found after update');
    }

    // Format the response
    const treatment = treatments[0];
    const formattedTreatment = {
      id: treatment.id,
      appointmentId: treatment.appointment_id,
      patientId: treatment.patient_id,
      date: treatment.date,
      dentist_id: treatment.dentist_id,
      dentist_name: treatment.dentist_name,
      notes: treatment.notes,
      type: treatment.type,
      toothTreatments: toothTreatments // Use the updated toothTreatments directly
    };

    res.json({
      success: true,
      data: formattedTreatment
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating treatment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update treatment'
    });
  } finally {
    connection.release();
  }
});

// Delete treatment
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Get treatment before deleting for patientId
    const [treatment] = await db.query(queries.getTreatmentById, [
      req.params.id
    ]);
    const patientId = treatment[0]?.patient_id;

    await connection.beginTransaction();
    await connection.query(queries.deleteTreatmentTeeth, [req.params.id]);
    await connection.query(queries.deleteTreatment, [req.params.id]);
    await connection.commit();

    // Emit treatment deleted event
    if (patientId) {
      global.io.emit('treatmentDeleted', {
        patientId,
        treatmentId: req.params.id
      });
    }

    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting treatment:', error);
    res.status(500).json({ message: 'Failed to delete treatment' });
  } finally {
    connection.release();
  }
});

// Get treatment by appointment ID
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const [treatments] = await db.query(
      `
      SELECT 
        t.*,
        tt.tooth_number,
        tt.treatment,
        tt.status,
        e.name as dentist_name,
        e.id as dentist_id
      FROM treatments t
      LEFT JOIN treatment_teeth tt ON t.id = tt.treatment_id
      LEFT JOIN employees e ON t.dentist_id = e.id
      WHERE t.appointment_id = ?
      `,
      [req.params.appointmentId]
    );

    if (!treatments || treatments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    // Group treatments by treatment ID and format tooth treatments
    const treatment = treatments[0];
    const toothTreatments = treatments
      .filter(t => t.tooth_number)
      .map(t => ({
        toothNumber: t.tooth_number,
        treatment: t.treatment,
        status: t.status || 'Pending'
      }));

    const formattedTreatment = {
      id: treatment.id,
      appointmentId: treatment.appointment_id,
      patientId: treatment.patient_id,
      date: treatment.date,
      dentist_id: treatment.dentist_id,
      dentist_name: treatment.dentist_name,
      notes: treatment.notes,
      type: treatment.type,
      toothTreatments
    };

    res.json({
      success: true,
      data: formattedTreatment
    });
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment'
    });
  }
});

// Update appointment status and handle inventory
router.put('/appointment/:appointmentId/status', async (req, res) => {
  const connection = await db.getConnection();
  try {
    // await connection.beginTransaction();

    // const { status, treatmentId, medication, statusId } = req.body;
    // const appointmentId = req.params.appointmentId;

    // // Update appointment status
    // await connection.query(
    //   'UPDATE appointments SET status_id = ? WHERE id = ?',
    //   [statusId, appointmentId]
    // );

    // // Update treatment status if treatmentId provided
    // // if (treatmentId) {
    // //   await connection.query('UPDATE treatments SET status = ? WHERE id = ?', [
    // //     'Done',
    // //     treatmentId
    // //   ]);
    // // }

    // // Update inventory if medication provided
    // if (medication) {
    //   await connection.query(
    //     'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
    //     [medication.quantity, medication.id]
    //   );

    //   // Emit inventory update event
    //   global.io.emit('inventoryUpdated', {
    //     itemId: medication.id,
    //     quantity: medication.quantity
    //   });
    // }

    // await connection.commit();

    // // Emit appointment status update event
    // global.io.emit('appointmentStatusUpdated', {
    //   appointmentId,
    //   status,
    //   treatmentId
    // });

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status'
    });
  } finally {
    connection.release();
  }
});

export default router;
