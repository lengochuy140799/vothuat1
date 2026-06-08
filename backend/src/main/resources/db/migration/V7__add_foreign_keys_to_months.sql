-- Safeguard: Insert any missing months into tuition_months
INSERT INTO tuition_months (month)
SELECT DISTINCT month FROM tuitions 
WHERE month IS NOT NULL AND month NOT IN (SELECT month FROM tuition_months)
ON CONFLICT (month) DO NOTHING;

INSERT INTO tuition_months (month)
SELECT DISTINCT month FROM registrations 
WHERE month IS NOT NULL AND month NOT IN (SELECT month FROM tuition_months)
ON CONFLICT (month) DO NOTHING;

-- Add foreign key constraint to tuitions table
ALTER TABLE tuitions
ADD CONSTRAINT fk_tuitions_tuition_months
FOREIGN KEY (month)
REFERENCES tuition_months(month)
ON DELETE CASCADE;

-- Add foreign key constraint to registrations table
ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_tuition_months
FOREIGN KEY (month)
REFERENCES tuition_months(month)
ON DELETE CASCADE;
