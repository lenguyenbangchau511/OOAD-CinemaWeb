package com.cinema.controller;

import com.cinema.dto.KetQuaDatVeDto;
import com.cinema.dto.LichSuVeDto;
import com.cinema.dto.SoatVeDto;
import com.cinema.enums.TrangThaiDonHang;
import com.cinema.enums.TrangThaiVe;
import com.cinema.service.VeService;
import com.cinema.util.NguoiDung;
import com.cinema.util.PhienDangNhap;
import com.cinema.enums.VaiTro;
import org.springframework.web.bind.annotation.PostMapping;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** API vé: lịch sử mua vé (giao diện 12), kết quả đặt vé / chi tiết đơn (giao diện 11, 13). */
@RestController
public class VeController {

    private final VeService veService;
    private final PhienDangNhap phienDangNhap;

    public VeController(VeService veService, PhienDangNhap phienDangNhap) {
        this.veService = veService;
        this.phienDangNhap = phienDangNhap;
    }

    @GetMapping("/api/lich-su-ve")
    public List<LichSuVeDto> lichSu(@RequestParam(required = false) String tuKhoa,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
                                    @RequestParam(required = false) TrangThaiDonHang trangThaiDon,
                                    @RequestParam(required = false) TrangThaiVe trangThaiVe,
                                    @RequestParam(required = false) String maKhachHang,
                                    HttpSession session) {
        NguoiDung nd = phienDangNhap.yeuCau(session);
        return veService.traCuuLichSuVe(nd,
                new VeService.BoLocLichSu(tuKhoa, tuNgay, denNgay, trangThaiDon, trangThaiVe, maKhachHang));
    }

    @GetMapping("/api/dat-ve/ket-qua/{maDonHang}")
    public KetQuaDatVeDto ketQua(@PathVariable String maDonHang, HttpSession session) {
        return veService.xemKetQuaDatVe(phienDangNhap.yeuCau(session), maDonHang);
    }

    @GetMapping("/api/ve/{maVe}")
    public KetQuaDatVeDto chiTietVe(@PathVariable String maVe, HttpSession session) {
        return veService.xemChiTietVe(phienDangNhap.yeuCau(session), maVe);
    }

    /** Cho giao diện biết đã đăng nhập chưa và với vai trò nào (để hiện đúng thanh trên cùng). */
    @GetMapping("/api/dat-ve/toi")
    public Map<String, Object> toi(HttpSession session) {
        NguoiDung nd = phienDangNhap.layNguoiDung(session);
        Map<String, Object> kq = new LinkedHashMap<>();
        kq.put("dangNhap", nd != null);
        kq.put("vaiTro", nd == null ? null : nd.vaiTro().name());
        kq.put("maKhachHang", nd == null ? null : nd.maKhachHang());
        return kq;
    }

    /** Tra cứu vé hoặc QR trực tiếp từ CSDL để phục vụ UC5.11. */
    @GetMapping("/api/ve/soat-ve/{maVeHoacQr}")
    public SoatVeDto traCuuSoatVe(@PathVariable String maVeHoacQr, HttpSession session) {
        NguoiDung nd = phienDangNhap.yeuCau(session, VaiTro.NHAN_VIEN, VaiTro.QUAN_LY);
        return veService.traCuuSoatVe(nd, maVeHoacQr);
    }

    /** Xác nhận check-in; trạng thái và thời điểm được lưu bền vững trong bảng VE. */
    @PostMapping("/api/ve/{maVe}/check-in")
    public SoatVeDto checkIn(@PathVariable String maVe, HttpSession session) {
        NguoiDung nd = phienDangNhap.yeuCau(session, VaiTro.NHAN_VIEN, VaiTro.QUAN_LY);
        return veService.xacNhanCheckIn(nd, maVe);
    }

}
