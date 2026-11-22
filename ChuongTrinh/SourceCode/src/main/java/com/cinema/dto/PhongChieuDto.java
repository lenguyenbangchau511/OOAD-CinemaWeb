package com.cinema.dto;

/** Thông tin một phòng chiếu (giao diện 18, 19, 20). loaiPhong: STANDARD | VIP | IMAX | 3D. */
public record PhongChieuDto(String maPhong, String tenPhong, String loaiPhong,
                            int soLuongGhe, int tongSoHang, int tongSoCot, String trangThai) {
}
