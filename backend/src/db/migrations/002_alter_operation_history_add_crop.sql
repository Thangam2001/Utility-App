ALTER TABLE operation_history
  DROP CONSTRAINT IF EXISTS operation_history_operation_type_check;

ALTER TABLE operation_history
  ADD CONSTRAINT operation_history_operation_type_check
  CHECK (operation_type IN ('ocr', 'resize', 'convert', 'crop'));


