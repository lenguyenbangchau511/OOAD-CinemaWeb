package com.cinema.service;

import com.cinema.entity.Phim;
import com.cinema.enums.TrangThaiPhim;
import com.cinema.exception.NghiepVuException;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PhimCongKhaiService {
    private final QuanLyPhimService danhMucPhim;

    public PhimCongKhaiService(QuanLyPhimService danhMucPhim) {
        this.danhMucPhim = danhMucPhim;
    }

    public List<Phim> danhSach(String tuKhoa, String theLoai, String gioiHanDoTuoi, String trangThai) {
        return danhMucPhim.danhSach(tuKhoa, theLoai, gioiHanDoTuoi, trangThai).stream()
                .filter(p -> p.getTrangThai() != TrangThaiPhim.NGUNG_CHIEU)
                .sorted(Comparator.comparing(Phim::getMaPhim))
                .toList();
    }

    public QuanLyPhimService.ChiTietPhim chiTiet(String maPhim) {
        var chiTiet = danhMucPhim.chiTiet(maPhim);
        if (chiTiet.phim().getTrangThai() == TrangThaiPhim.NGUNG_CHIEU) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại");
        }
        return chiTiet;
    }
}
