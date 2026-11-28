package com.cinema.entity;

import com.cinema.enums.TrangThaiPhim;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.PhimRepository;
import com.cinema.util.TimKiem;
import com.cinema.util.ThoiGian;
import jakarta.persistence.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;

@Entity
@Table(name = "PHIM")
public class Phim {
    @Id
    @Column(name = "maPhim", nullable = false, length = 10)
    private String maPhim;

    @Column(name = "tenPhim", nullable = false, length = 100)
    private String tenPhim;

    @Column(name = "theLoai", nullable = false, length = 50)
    private String theLoai;

    @Column(name = "thoiLuong", nullable = false)
    private int thoiLuong;

    @Column(name = "daoDien", nullable = false, length = 50)
    private String daoDien;

    @Column(name = "dienVien", nullable = false, length = 200)
    private String dienVien;

    @Column(name = "ngayKhoiChieu", nullable = false)
    private LocalDate ngayKhoiChieu;

    @Column(name = "quocGia", nullable = false, length = 50)
    private String quocGia;

    @Column(name = "noiDung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "poster", nullable = false, length = 255)
    private String poster;

    @Column(name = "gioiHanDoTuoi", nullable = false, length = 10)
    private String gioiHanDoTuoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiPhim trangThai;

    @Transient
    private PhimRepository repository;

    public Phim() {}

    public Phim(PhimRepository repository) {
        this.repository = repository;
    }

    public boolean themPhim(Phim phim) {
        phim.trangThai = TrangThaiPhim.SAP_CHIEU;
        phim.kiemTraDuLieu();
        kiemTraTrung(phim, null);
        try {
            return repository.them(phim) == 1;
        } catch (DuplicateKeyException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã phim đã tồn tại");
        }
    }

    public boolean suaPhim(Phim phim) {
        Phim hienTai = repository.khoaTheoMa(phim.maPhim);
        if (hienTai == null) throw khongTimThay();
        phim.kiemTraDuLieu();
        kiemTraTrung(phim, phim.maPhim);
        int chenhLech = phim.thoiLuong - hienTai.thoiLuong;
        if (chenhLech != 0) capNhatLichChieu(phim.maPhim, chenhLech);
        repository.sua(phim);
        return true;
    }

    public boolean xoaPhim(String maPhim) {
        if (repository.khoaTheoMa(maPhim) == null) throw khongTimThay();
        var cacSuat = repository.suatChieuCuaPhim(maPhim);
        LocalDateTime bayGio = ThoiGian.bayGio();
        if (cacSuat.stream().anyMatch(s -> s.dangHoacSapChieu(bayGio))) {
            throw new NghiepVuException(HttpStatus.CONFLICT,
                    "Phim còn suất chiếu đang diễn ra hoặc chưa diễn ra. Hãy vào Sửa, chọn trạng thái Ngừng chiếu rồi lưu để giữ lịch sử.");
        }
        if (!cacSuat.isEmpty()) throw loiLichSu();
        try {
            return repository.xoa(maPhim) == 1;
        } catch (DataIntegrityViolationException e) {
            throw loiLichSu();
        }
    }

    public List<Phim> timKiemPhim(String tuKhoa, String theLoai, String gioiHanDoTuoi, TrangThaiPhim trangThai) {
        return repository.danhSachQuanLy().stream()
                .filter(p -> trangThai == null || p.trangThai == trangThai)
                .filter(p -> TimKiem.chua(p.theLoai, theLoai))
                .filter(p -> rong(gioiHanDoTuoi) || gioiHanDoTuoi.strip().equalsIgnoreCase(p.gioiHanDoTuoi))
                .filter(p -> TimKiem.chua(p.tenPhim, tuKhoa) || TimKiem.chua(p.maPhim, tuKhoa)
                        || TimKiem.chua(p.daoDien, tuKhoa) || TimKiem.chua(p.dienVien, tuKhoa))
                .toList();
    }

    public Phim xemChiTietPhim(String maPhim) {
        Phim phim = repository.timTheoMa(maPhim);
        if (phim == null) throw khongTimThay();
        return phim;
    }

    private void kiemTraTrung(Phim phim, String maBoQua) {
        if (repository.trungTenVaNgay(phim.tenPhim, phim.ngayKhoiChieu, maBoQua)) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Phim đã tồn tại");
        }
    }

    private void capNhatLichChieu(String maPhim, int chenhLech) {
        LocalDateTime bayGio = ThoiGian.bayGio();
        var lich = repository.khoaLichChieuTu(bayGio.toLocalDate());
        var suatCanSua = lich.stream().filter(s -> s.canDoiThoiLuong(maPhim, bayGio)).toList();
        for (var suat : suatCanSua) {
            var ketThucMoi = suat.ketThuc().plusMinutes(chenhLech);
            if (!ketThucMoi.isAfter(suat.batDau()) || !ketThucMoi.toLocalDate().equals(suat.batDau().toLocalDate())) {
                throw xungDot();
            }
            for (var khac : lich) {
                if (suat.maSuat().equals(khac.maSuat()) || !suat.maPhong().equals(khac.maPhong())) continue;
                var ketThucKhac = khac.canDoiThoiLuong(maPhim, bayGio)
                        ? khac.ketThuc().plusMinutes(chenhLech) : khac.ketThuc();
                if (suat.batDau().isBefore(ketThucKhac) && khac.batDau().isBefore(ketThucMoi)) throw xungDot();
            }
        }
        for (var suat : suatCanSua) {
            repository.capNhatGioKetThuc(suat.maSuat(), suat.ketThuc().plusMinutes(chenhLech).toLocalTime());
        }
    }

    private void kiemTraDuLieu() {
        maPhim = chuoi(maPhim, "Mã phim", 10, true);
        if (!maPhim.matches("[A-Za-z0-9_-]+")) throw khongHopLe("Mã phim không hợp lệ");
        if (thoiLuong < 1) throw khongHopLe("Thời lượng phải lớn hơn 0");
        if (ngayKhoiChieu == null) throw khongHopLe("Vui lòng nhập ngày khởi chiếu");
        tenPhim = chuoi(tenPhim, "Tên phim", 100, true);
        theLoai = chuoi(theLoai, "Thể loại", 50, true);
        daoDien = chuoi(daoDien, "Đạo diễn", 50, false);
        dienVien = chuoi(dienVien, "Diễn viên", 200, false);
        quocGia = chuoi(quocGia, "Quốc gia", 50, false);
        gioiHanDoTuoi = chuoi(gioiHanDoTuoi, "Giới hạn độ tuổi", 10, true);
        if (!Set.of("P", "K", "T13", "T16", "T18").contains(gioiHanDoTuoi)) {
            throw khongHopLe("Giới hạn độ tuổi không hợp lệ");
        }
        if (trangThai == null) throw khongHopLe("Trạng thái không hợp lệ");
        poster = chuoi(poster, "Tên file poster", 255, false);
        if (poster.contains("/") || poster.contains("\\") || poster.equals(".") || poster.equals("..")) {
            throw khongHopLe("Poster phải là tên file trong thư mục images");
        }
        noiDung = noiDung == null ? "" : noiDung.strip();
        if (noiDung.getBytes(StandardCharsets.UTF_8).length > 65_535) throw khongHopLe("Nội dung phim quá dài");
    }

    private static String chuoi(String giaTri, String nhan, int gioiHan, boolean batBuoc) {
        String ketQua = giaTri == null ? "" : giaTri.strip();
        if (batBuoc && ketQua.isEmpty()) throw khongHopLe("Vui lòng nhập " + nhan.toLowerCase());
        if (ketQua.length() > gioiHan) throw khongHopLe(nhan + " dài tối đa " + gioiHan + " ký tự");
        return ketQua;
    }

    private static boolean rong(String s) {
        return s == null || s.isBlank();
    }

    private static NghiepVuException khongHopLe(String thongBao) {
        return new NghiepVuException(HttpStatus.BAD_REQUEST, thongBao);
    }

    private static NghiepVuException khongTimThay() {
        return new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại");
    }

    private static NghiepVuException loiLichSu() {
        return new NghiepVuException(HttpStatus.CONFLICT,
                "Phim đã có dữ liệu suất chiếu cần bảo toàn. Hãy vào Sửa, chọn trạng thái Ngừng chiếu rồi lưu để giữ lịch sử.");
    }

    private static NghiepVuException xungDot() {
        return new NghiepVuException(HttpStatus.CONFLICT, "Thay đổi thời lượng gây xung đột lịch chiếu");
    }

    public String getMaPhim() { return maPhim; }
    public void setMaPhim(String maPhim) { this.maPhim = maPhim; }

    public String getTenPhim() { return tenPhim; }
    public void setTenPhim(String tenPhim) { this.tenPhim = tenPhim; }

    public String getTheLoai() { return theLoai; }
    public void setTheLoai(String theLoai) { this.theLoai = theLoai; }

    public int getThoiLuong() { return thoiLuong; }
    public void setThoiLuong(int thoiLuong) { this.thoiLuong = thoiLuong; }

    public String getDaoDien() { return daoDien; }
    public void setDaoDien(String daoDien) { this.daoDien = daoDien; }

    public String getDienVien() { return dienVien; }
    public void setDienVien(String dienVien) { this.dienVien = dienVien; }

    public LocalDate getNgayKhoiChieu() { return ngayKhoiChieu; }
    public void setNgayKhoiChieu(LocalDate ngayKhoiChieu) { this.ngayKhoiChieu = ngayKhoiChieu; }

    public String getQuocGia() { return quocGia; }
    public void setQuocGia(String quocGia) { this.quocGia = quocGia; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getGioiHanDoTuoi() { return gioiHanDoTuoi; }
    public void setGioiHanDoTuoi(String gioiHanDoTuoi) { this.gioiHanDoTuoi = gioiHanDoTuoi; }

    public TrangThaiPhim getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiPhim trangThai) { this.trangThai = trangThai; }
}
