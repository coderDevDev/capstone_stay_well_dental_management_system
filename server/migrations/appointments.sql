ALTER TABLE appointments
ADD COLUMN branch_id VARCHAR(36) NOT NULL,
ADD CONSTRAINT fk_appointment_branch
FOREIGN KEY (branch_id) REFERENCES dental_branches(id)
ON DELETE RESTRICT; 