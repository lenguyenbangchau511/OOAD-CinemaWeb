package com.cinema.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/** Một suất chiếu kèm tên phim, tên phòng và tình hình ghế (dùng cho giao diện 6, 7, 21, 23). */
public record SuatChieuDto(
        String maSuat, String maPhim, String tenPhim, String gioiHanDoTuoi,
        String maPhong, String tenPhong, String loaiPhong,
        LocalDate ngayChieu, LocalTime gioBatDau, LocalTime gioKetThuc,
        String trangThai, boolean conBanVe,
        int tongSoGhe, int soGheTrong, int soGheDangGiu, int soGheDaBan) {
}
