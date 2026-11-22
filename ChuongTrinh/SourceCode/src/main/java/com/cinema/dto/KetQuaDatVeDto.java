package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Kết quả đặt vé và vé điện tử (giao diện 11), cũng đủ dữ liệu cho chi tiết vé / đơn hàng (giao diện 13).
 * ketQua: THANH_CONG | CHO_XAC_MINH | THAT_BAI | CAN_DOI_SOAT | CHUA_THANH_TOAN.
 */
public record KetQuaDatVeDto(
        String ketQua, String thongBao,
        String maDonHang, LocalDateTime ngayDat, String kenhBan, String trangThaiDon,
        BigDecimal tongTien, BigDecimal tienVe, BigDecimal tienDichVu,
        BigDecimal giamKhuyenMai, BigDecimal giamDiem, int diemSuDung, int diemTichDuoc, String maKhuyenMai,
        String phuongThuc, String maGiaoDichDoiTac,
        String tenPhim, String gioiHanDoTuoi, String tenPhong, LocalDate ngayChieu, LocalTime gioBatDau,
        List<Ve> dsVe, List<DichVuDto> dsDichVu) {

    /** trangThai: CHUA_SU_DUNG | DA_SU_DUNG | DA_HUY | HET_HAN | DA_DOI. */
    public record Ve(String maVe, String maQR, String tenGhe, String loaiGhe, BigDecimal donGia, String trangThai) {
    }
}
