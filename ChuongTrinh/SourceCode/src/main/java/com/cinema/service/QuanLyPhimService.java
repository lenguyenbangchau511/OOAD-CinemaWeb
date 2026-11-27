package com.cinema.service;

import com.cinema.dto.PhimForm;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.PhimRepository;
import com.cinema.util.TimKiem;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class QuanLyPhimService {
    private final PhimRepository repository;

    public QuanLyPhimService(PhimRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSach(String tuKhoa, String trangThai) {
        return repository.danhSachQuanLy().stream()
                .filter(p -> trangThai.isBlank() || trangThai.equals(p.get("trangThai")))
                .filter(p -> tuKhoa.isBlank() || TimKiem.chua((String) p.get("tenPhim"), tuKhoa)
                        || TimKiem.chua((String) p.get("maPhim"), tuKhoa))
                .toList();
    }

    public Map<String, Object> chiTiet(String maPhim) {
        return repository.timTheoMa(maPhim).stream().findFirst()
                .orElseThrow(() -> new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
    }

    public void them(PhimForm p) {
        String maPhim = chuoi(p.maPhim(), "Mã phim", 10, true);
        if (!maPhim.matches("[A-Za-z0-9_-]+")) throw khongHopLe("Mã phim chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới");
        try {
            repository.them(duLieu(p, maPhim));
        } catch (DuplicateKeyException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã phim đã tồn tại");
        }
    }

    public void sua(String maPhim, PhimForm p) {
        int soDong = repository.sua(duLieu(p, maPhim));
        if (soDong == 0) chiTiet(maPhim);
    }

    public void ngungChieu(String maPhim) {
        int soDong = repository.ngungChieu(maPhim);
        if (soDong == 0) chiTiet(maPhim);
    }

    public void xoa(String maPhim) {
        try {
            if (repository.xoa(maPhim) == 0) {
                throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phim");
            }
        } catch (DataIntegrityViolationException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Phim đã có suất chiếu nên không thể xóa. Hãy vào Sửa, chọn trạng thái Ngừng chiếu rồi lưu để giữ lịch sử.");
        }
    }

    private PhimForm duLieu(PhimForm p, String maPhim) {
        if (p.thoiLuong() == null || p.thoiLuong() < 1) throw khongHopLe("Thời lượng phải lớn hơn 0");
        if (p.ngayKhoiChieu() == null) throw khongHopLe("Vui lòng nhập ngày khởi chiếu");
        String tuoi = chuoi(p.gioiHanDoTuoi(), "Giới hạn độ tuổi", 10, true);
        String trangThai = chuoi(p.trangThai(), "Trạng thái", 30, true);
        if (!Set.of("P", "K", "T13", "T16", "T18", "C").contains(tuoi)) throw khongHopLe("Giới hạn độ tuổi không hợp lệ");
        if (!Set.of("SAP_CHIEU", "DANG_CHIEU", "NGUNG_CHIEU").contains(trangThai)) throw khongHopLe("Trạng thái không hợp lệ");
        String poster = chuoi(p.poster(), "Tên file poster", 255, false);
        if (poster.contains("/") || poster.contains("\\") || poster.equals(".") || poster.equals("..")) {
            throw khongHopLe("Poster phải là tên file trong thư mục images");
        }
        String noiDung = p.noiDung() == null ? "" : p.noiDung().strip();
        if (noiDung.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 65_535) {
            throw khongHopLe("Nội dung phim quá dài");
        }
        return new PhimForm(maPhim, chuoi(p.tenPhim(), "Tên phim", 100, true),
                chuoi(p.theLoai(), "Thể loại", 50, true), p.thoiLuong(),
                chuoi(p.daoDien(), "Đạo diễn", 50, false), chuoi(p.dienVien(), "Diễn viên", 200, false),
                p.ngayKhoiChieu(), chuoi(p.quocGia(), "Quốc gia", 50, false),
                noiDung, poster, tuoi, trangThai);
    }

    private String chuoi(String giaTri, String nhan, int gioiHan, boolean batBuoc) {
        String ketQua = giaTri == null ? "" : giaTri.strip();
        if (batBuoc && ketQua.isEmpty()) throw khongHopLe("Vui lòng nhập " + nhan.toLowerCase());
        if (ketQua.length() > gioiHan) throw khongHopLe(nhan + " dài tối đa " + gioiHan + " ký tự");
        return ketQua;
    }

    private NghiepVuException khongHopLe(String thongBao) {
        return new NghiepVuException(HttpStatus.BAD_REQUEST, thongBao);
    }
}
