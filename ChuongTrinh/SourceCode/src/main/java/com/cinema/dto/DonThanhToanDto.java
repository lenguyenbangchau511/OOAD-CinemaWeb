package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Thông tin đơn hàng hiển thị ở giao diện 10 (kiểm tra đơn trước khi thanh toán).
 * choPhepThanhToan = false thì lyDoKhongThanhToan giải thích vì sao (đã thanh toán, hết giữ ghế, đơn thay đổi...).
 */
public record DonThanhToanDto(
        String maDonHang, String trangThai, String kenhBan, LocalDateTime ngayDat,
        BigDecimal tongTien, BigDecimal tienVe, BigDecimal tienDichVu,
        BigDecimal giamKhuyenMai, BigDecimal giamDiem, int diemSuDung, String maKhuyenMai,
        String tenPhim, LocalDate ngayChieu, LocalTime gioBatDau, String tenPhong,
        List<PhienGiuDto.GheGiu> dsGhe, List<DichVuDto> dsDichVu,
        long soGiayConLai, boolean choPhepThanhToan, String lyDoKhongThanhToan,
        ThanhToanDto thanhToanDangCho) {
}
