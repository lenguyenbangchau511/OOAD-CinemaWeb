package com.cinema.dto;

import java.util.List;

/** Dữ liệu cho các ô lọc ở giao diện 21 (danh sách phim và phòng để chọn). */
public record BoLocSuatChieuDto(List<Phim> phim, List<Phong> phong) {
    public record Phim(String maPhim, String tenPhim) {
    }

    public record Phong(String maPhong, String tenPhong) {
    }
}
