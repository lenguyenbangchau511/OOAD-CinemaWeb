package com.cinema.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Dữ liệu tra cứu và xác nhận soát vé (UC5.11). */
public record SoatVeDto(
        String maVe, String maQR, String tenPhim,
        LocalDate ngayChieu, LocalTime gioChieu, String tenPhong, String tenGhe,
        String tenKhachHang, String trangThai, LocalDateTime thoiDiemCheckIn,
        boolean coTheSoat, String lyDo) {
}
