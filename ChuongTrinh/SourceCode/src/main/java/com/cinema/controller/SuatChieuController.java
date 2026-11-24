package com.cinema.controller;

import com.cinema.dto.BoLocSuatChieuDto;
import com.cinema.dto.SoDoGheDto;
import com.cinema.dto.SuatChieuDto;
import com.cinema.enums.TrangThaiSuat;
import com.cinema.enums.VaiTro;
import com.cinema.service.GiuGheService;
import com.cinema.service.SuatChieuService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** API suất chiếu: tra cứu suất đang bán (khách), danh sách quản lý (giao diện 21), sơ đồ ghế (giao diện 7). */
@RestController
@RequestMapping("/api/suat-chieu")
public class SuatChieuController {

    private final SuatChieuService suatChieuService;
    private final GiuGheService giuGheService;
    private final PhienDangNhap phienDangNhap;

    public SuatChieuController(SuatChieuService suatChieuService, GiuGheService giuGheService,
                               PhienDangNhap phienDangNhap) {
        this.suatChieuService = suatChieuService;
        this.giuGheService = giuGheService;
        this.phienDangNhap = phienDangNhap;
    }

    /** Công khai: các suất còn bán của một phim trong một ngày (để giao diện 6 dùng chung). */
    @GetMapping("/dang-ban")
    public List<SuatChieuDto> dangBan(@RequestParam(required = false) String maPhim,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {
        return suatChieuService.timKiemSuatChieu(maPhim, ngay);
    }

    /** Quản lý / nhân viên: danh sách suất chiếu theo bộ lọc. */
    @GetMapping
    public List<SuatChieuDto> danhSach(@RequestParam(required = false) String maPhim,
                                       @RequestParam(required = false) String maPhong,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay,
                                       @RequestParam(required = false) TrangThaiSuat trangThai,
                                       HttpSession session) {
        phienDangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return suatChieuService.danhSachSuatChieu(maPhim, maPhong, ngay, trangThai);
    }

    @GetMapping("/bo-loc")
    public BoLocSuatChieuDto boLoc(HttpSession session) {
        phienDangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return suatChieuService.layBoLoc();
    }

    /** Công khai: sơ đồ ghế của suất. maPhienGiu (tùy chọn) để đánh dấu ghế của chính người đang chọn. */
    @GetMapping("/{maSuat}/so-do-ghe")
    public SoDoGheDto soDoGhe(@PathVariable String maSuat, @RequestParam(required = false) String maPhienGiu) {
        return giuGheService.xemSoDoGhe(maSuat, maPhienGiu);
    }
}
