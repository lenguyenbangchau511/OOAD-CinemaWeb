package com.cinema.service;

import com.cinema.dto.PhimForm;
import com.cinema.entity.Phim;
import com.cinema.enums.TrangThaiPhim;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.PhimRepository;
import com.cinema.util.ThoiGian;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuanLyPhimService {
    private final Phim phim;
    private final PhimRepository repository;

    public QuanLyPhimService(PhimRepository repository) {
        this.repository = repository;
        this.phim = new Phim(repository);
    }

    public List<Phim> danhSach(String tuKhoa, String theLoai, String gioiHanDoTuoi, String trangThai) {
        return phim.timKiemPhim(tuKhoa, theLoai, gioiHanDoTuoi, docTrangThai(trangThai));
    }

    public record ChiTietPhim(@com.fasterxml.jackson.annotation.JsonUnwrapped Phim phim,
                              List<PhimRepository.LichChieu> suatChieuSapToi) {}

    public ChiTietPhim chiTiet(String maPhim) {
        Phim ketQua = phim.xemChiTietPhim(maPhim);
        LocalDateTime bayGio = ThoiGian.bayGio();
        var suatChieu = repository.suatChieuCuaPhim(maPhim).stream()
                .filter(s -> s.canDoiThoiLuong(maPhim, bayGio))
                .sorted(java.util.Comparator.comparing(PhimRepository.LichChieu::batDau))
                .toList();
        return new ChiTietPhim(ketQua, suatChieu);
    }

    @Transactional
    public void them(PhimForm form) {
        if (!phim.themPhim(chuyenForm(form.maPhim(), form, TrangThaiPhim.SAP_CHIEU))) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Không thêm được phim");
        }
    }

    @Transactional
    public void sua(String maPhim, PhimForm form) {
        phim.suaPhim(chuyenForm(maPhim, form, docTrangThai(form.trangThai())));
    }

    @Transactional
    public void ngungChieu(String maPhim) {
        Phim hienTai = repository.khoaTheoMa(maPhim);
        if (hienTai == null) throw new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại");
        hienTai.setTrangThai(TrangThaiPhim.NGUNG_CHIEU);
        phim.suaPhim(hienTai);
    }

    @Transactional
    public void xoa(String maPhim) {
        if (!phim.xoaPhim(maPhim)) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại");
        }
    }

    private static TrangThaiPhim docTrangThai(String giaTri) {
        if (giaTri == null || giaTri.isBlank()) return null;
        try {
            return TrangThaiPhim.valueOf(giaTri.strip());
        } catch (IllegalArgumentException e) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
    }

    private static Phim chuyenForm(String maPhim, PhimForm form, TrangThaiPhim trangThai) {
        Phim duLieu = new Phim();
        duLieu.setMaPhim(maPhim);
        duLieu.setTenPhim(form.tenPhim());
        duLieu.setTheLoai(form.theLoai());
        duLieu.setThoiLuong(form.thoiLuong() == null ? 0 : form.thoiLuong());
        duLieu.setDaoDien(form.daoDien());
        duLieu.setDienVien(form.dienVien());
        duLieu.setNgayKhoiChieu(form.ngayKhoiChieu());
        duLieu.setQuocGia(form.quocGia());
        duLieu.setNoiDung(form.noiDung());
        duLieu.setPoster(form.poster());
        duLieu.setGioiHanDoTuoi(form.gioiHanDoTuoi());
        duLieu.setTrangThai(trangThai);
        return duLieu;
    }
}
