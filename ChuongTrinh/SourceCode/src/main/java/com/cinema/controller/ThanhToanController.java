package com.cinema.controller;

import com.cinema.dto.DonThanhToanDto;
import com.cinema.dto.KetQuaCongRequest;
import com.cinema.dto.KetQuaThanhToanDto;
import com.cinema.dto.KhoiTaoThanhToanRequest;
import com.cinema.dto.PhatHanhLaiRequest;
import com.cinema.dto.ThanhToanDto;
import com.cinema.service.ThanhToanService;
import com.cinema.util.PhienDangNhap;
import java.util.List;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** API thanh toán trực tuyến (UC5.5, giao diện 10). */
@RestController
@RequestMapping("/api/thanh-toan")
public class ThanhToanController {

    private final ThanhToanService thanhToanService;
    private final PhienDangNhap phienDangNhap;

    public ThanhToanController(ThanhToanService thanhToanService, PhienDangNhap phienDangNhap) {
        this.thanhToanService = thanhToanService;
        this.phienDangNhap = phienDangNhap;
    }

    /** Kiểm tra đơn hàng + giữ chỗ trước khi thanh toán. */
    @GetMapping("/don-hang/{maDonHang}")
    public DonThanhToanDto xemDon(@PathVariable String maDonHang,
                                  @RequestParam(required = false) String maPhienGiu,
                                  @RequestParam(required = false) List<String> dsMaGheSuat, HttpSession session) {
        return thanhToanService.xemDonDeThanhToan(phienDangNhap.yeuCau(session), maDonHang, maPhienGiu, dsMaGheSuat);
    }

    /** Tạo giao dịch thanh toán (trạng thái CHO_XU_LY). */
    @PostMapping("/khoi-tao")
    public ThanhToanDto khoiTao(@RequestBody KhoiTaoThanhToanRequest req, HttpSession session) {
        return thanhToanService.khoiTaoThanhToan(phienDangNhap.yeuCau(session), req);
    }

    /** Cổng thanh toán (sandbox) báo kết quả: THANH_CONG | THAT_BAI | CHO_XAC_MINH. */
    @PostMapping("/{maThanhToan}/ket-qua")
    public KetQuaThanhToanDto ketQua(@PathVariable String maThanhToan, @RequestBody KetQuaCongRequest req,
                                     HttpSession session) {
        return thanhToanService.ghiNhanKetQuaCong(phienDangNhap.yeuCau(session), maThanhToan, req);
    }

    /** Đơn đã thu tiền nhưng phát hành vé lỗi: thử phát hành lại. */
    @PostMapping("/don-hang/{maDonHang}/phat-hanh-lai")
    public KetQuaThanhToanDto phatHanhLai(@PathVariable String maDonHang, @RequestBody PhatHanhLaiRequest req,
                                          HttpSession session) {
        return thanhToanService.phatHanhLai(phienDangNhap.yeuCau(session), maDonHang, req);
    }
}
