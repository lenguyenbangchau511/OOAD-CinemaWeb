-- Bo sung thoi diem check-in cho UC5.11.
USE cinema_db;
-- Script co the chay lai an toan: chi them cot neu chua ton tai.
SET @co_cot_checkin = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'VE'
      AND COLUMN_NAME = 'thoiDiemCheckIn'
);
SET @sql_checkin = IF(
    @co_cot_checkin = 0,
    'ALTER TABLE VE ADD COLUMN thoiDiemCheckIn DATETIME NULL AFTER trangThai',
    'SELECT ''Cot thoiDiemCheckIn da ton tai'' AS ket_qua'
);
PREPARE stmt_checkin FROM @sql_checkin;
EXECUTE stmt_checkin;
DEALLOCATE PREPARE stmt_checkin;
