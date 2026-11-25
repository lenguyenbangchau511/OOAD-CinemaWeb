package com.cinema.controller;

import com.cinema.dto.XacNhanDonRequest;
import com.cinema.enums.VaiTro;
import com.cinema.service.DonDatVeService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-dat-ve")
public class DonDatVeController {
    static final String KHOA_DON_DAT_VE = "donDatVe:";
    private final DonDatVeService service;
    private final PhienDangNhap dangNhap;

    public DonDatVeController(DonDatVeService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping("/danh-muc")
    public Object danhMuc() {
        return service.danhMuc();
    }

    @PostMapping("/tam-tinh")
    public Object tamTinh(@RequestBody XacNhanDonRequest req, HttpSession session) {
        var khach = dangNhap.yeuCau(session, VaiTro.KHACH_HANG);
        return service.tamTinh(khach, req);
    }

    @PostMapping("/xac-nhan")
    public Object xacNhan(@RequestBody XacNhanDonRequest req, HttpSession session) {
        var khach = dangNhap.yeuCau(session, VaiTro.KHACH_HANG);
        synchronized (session) {
            String khoa = KHOA_DON_DAT_VE + req.maPhienGiu();
            var don = service.xacNhan(khach, req, (String) session.getAttribute(khoa));
            session.setAttribute(khoa, don.maDonHang());
            return don;
        }
    }
}
