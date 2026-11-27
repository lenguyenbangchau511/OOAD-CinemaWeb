package com.cinema.dto;

import java.time.LocalDate;

public record PhimForm(
        String maPhim, String tenPhim, String theLoai, Integer thoiLuong,
        String daoDien, String dienVien, LocalDate ngayKhoiChieu, String quocGia,
        String noiDung, String poster, String gioiHanDoTuoi, String trangThai) {}
