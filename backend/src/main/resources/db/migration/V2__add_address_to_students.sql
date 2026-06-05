-- Migration to add address column to students table
ALTER TABLE students ADD COLUMN address VARCHAR(255);
