-- Treatments table
CREATE TABLE treatments (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36),
    patient_id VARCHAR(36) NOT NULL,
    date DATETIME NOT NULL,
    dentist_id VARCHAR(36) NOT NULL,
    notes TEXT,
    type ENUM('medical', 'cosmetic') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (dentist_id) REFERENCES employees(id) ON DELETE RESTRICT
);

-- Treatment teeth table (for many-to-many relationship)
CREATE TABLE treatment_teeth (
    treatment_id VARCHAR(36),
    tooth_number VARCHAR(2),
    treatment VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Ongoing', 'Done') NOT NULL DEFAULT 'Pending',
    medication_id INT NULL,
    PRIMARY KEY (treatment_id, tooth_number),
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES inventory(id)
); 