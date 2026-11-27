package com.cinema.service;

import com.cinema.dto.ComboRequest;
import com.cinema.dto.SanPhamRequest;
import com.cinema.dto.ThanhPhanCombo;
import com.cinema.dto.TrangThaiRequest;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.SanPhamRepository;
import com.cinema.util.TimKiem;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuanLySanPhamService {
    private static final Pattern MA_HOP_LE = Pattern.compile("^[A-Z0-9_-]{2,10}$");
    private static final Set<String> LOAI_SAN_PHAM = Set.of("DO_AN", "THUC_UONG");
    private static final Set<String> TRANG_THAI = Set.of("DANG_BAN", "NGUNG_BAN");

    private final SanPhamRepository repository;

    public QuanLySanPhamService(SanPhamRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSach(String tuKhoa,
                                              String loai,
                                              String trangThai) {
        return repository.danhSachSanPhamVaCombo().stream()
                .filter(m -> loai.isBlank() || loai.equals(m.get("loai")))
                .filter(m -> trangThai.isBlank() || trangThai.equals(m.get("trangThai")))
                .filter(m -> tuKhoa.isBlank() || TimKiem.chua((String) m.get("ten"), tuKhoa)
                        || TimKiem.chua((String) m.get("ma"), tuKhoa))
                .toList();
    }

    public Map<String, Object> chiTiet(String ma) {
        List<Map<String, Object>> sp = repository.timSanPham(ma);
        if (!sp.isEmpty()) {
            Map<String, Object> result = new LinkedHashMap<>(sp.get(0));
            result.put("loaiDoiTuong", "SAN_PHAM");
            return result;
        }
        List<Map<String, Object>> combos = repository.timCombo(ma);
        if (combos.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm hoặc combo");
        }
        Map<String, Object> result = new LinkedHashMap<>(combos.get(0));
        result.put("loaiDoiTuong", "COMBO");
        result.put("thanhPhan", repository.thanhPhanCombo(ma));
        return result;
    }

    @Transactional
    public Map<String, Object> taoSanPham(SanPhamRequest req) {
        String ma = chuanHoaMa(req.maSanPham(), "Mã sản phẩm");
        kiemTraSanPham(req);
        if (daTonTaiMa(ma)) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã sản phẩm hoặc combo đã tồn tại");
        }
        int mucMin = req.mucTonToiThieu() == null ? 5 : req.mucTonToiThieu();
        repository.themSanPham(ma, req, rongThanhNull(req.hinhAnh()), mucMin);
        return chiTiet(ma);
    }

    @Transactional
    public Map<String, Object> capNhatSanPham(String ma, SanPhamRequest req) {
        kiemTraSanPham(req);
        int updated = repository.suaSanPham(ma, req, rongThanhNull(req.hinhAnh()));
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
        }
        return chiTiet(ma);
    }

    @Transactional
    public Map<String, Object> taoCombo(ComboRequest req) {
        String ma = chuanHoaMa(req.maCombo(), "Mã combo");
        kiemTraCombo(req);
        if (daTonTaiMa(ma)) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã sản phẩm hoặc combo đã tồn tại");
        }
        repository.themCombo(ma, req, rongThanhNull(req.hinhAnh()));
        luuThanhPhanCombo(ma, req.thanhPhan());
        return chiTiet(ma);
    }

    @Transactional
    public Map<String, Object> capNhatCombo(String ma, ComboRequest req) {
        kiemTraCombo(req);
        int updated = repository.suaCombo(ma, req, rongThanhNull(req.hinhAnh()));
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy combo");
        }
        repository.xoaThanhPhanCombo(ma);
        luuThanhPhanCombo(ma, req.thanhPhan());
        return chiTiet(ma);
    }

    @Transactional
    public Map<String, Object> doiTrangThai(String ma, TrangThaiRequest req) {
        if (req == null || !TRANG_THAI.contains(req.trangThai())) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        int updated = repository.doiTrangThaiSanPham(req.trangThai(), ma);
        if (updated == 0) {
            updated = repository.doiTrangThaiCombo(req.trangThai(), ma);
        }
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm hoặc combo");
        }
        return Map.of("ma", ma, "trangThai", req.trangThai());
    }

    private String chuanHoaMa(String raw, String nhan) {
        String ma = raw == null ? "" : raw.trim().toUpperCase();
        if (!MA_HOP_LE.matcher(ma).matches()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, nhan + " gồm 2–10 ký tự chữ in hoa, số, _ hoặc -");
        }
        return ma;
    }

    private boolean daTonTaiMa(String ma) {
        Integer spCount = repository.demSanPham(ma);
        Integer cbCount = repository.demCombo(ma);
        return (spCount != null && spCount > 0) || (cbCount != null && cbCount > 0);
    }

    private void kiemTraSanPham(SanPhamRequest req) {
        if (req == null || isBlank(req.tenSanPham()) || isBlank(req.donViTinh()) || isBlank(req.moTa())
                || !LOAI_SAN_PHAM.contains(req.loaiSanPham()) || !TRANG_THAI.contains(req.trangThai())
                || req.giaBan() == null || req.giaBan().signum() < 0
                || (req.mucTonToiThieu() != null && req.mucTonToiThieu() < 0)) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đầy đủ thông tin và giá bán hợp lệ");
        }
        if (req.tenSanPham().trim().length() > 100 || req.donViTinh().trim().length() > 20) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Tên hoặc đơn vị tính vượt quá độ dài cho phép");
        }
    }

    private void kiemTraCombo(ComboRequest req) {
        if (req == null || isBlank(req.tenCombo()) || isBlank(req.moTa())
                || !TRANG_THAI.contains(req.trangThai())
                || req.giaCombo() == null || req.giaCombo().signum() < 0
                || req.thanhPhan() == null || req.thanhPhan().isEmpty()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đủ thông tin combo và ít nhất một sản phẩm thành phần");
        }
        if (req.tenCombo().trim().length() > 100 || req.moTa().trim().length() > 255) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Tên hoặc mô tả combo vượt quá độ dài cho phép");
        }
        Set<String> seen = new HashSet<>();
        for (ThanhPhanCombo tp : req.thanhPhan()) {
            if (tp == null || isBlank(tp.maSanPham()) || tp.soLuong() == null || tp.soLuong() <= 0) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mỗi thành phần combo cần sản phẩm và số lượng nguyên dương");
            }
            if (!seen.add(tp.maSanPham())) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Không chọn trùng một sản phẩm trong nhiều dòng");
            }
            Integer tonTai = repository.demSanPham(tp.maSanPham());
            if (tonTai == null || tonTai == 0) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Sản phẩm thành phần không tồn tại: " + tp.maSanPham());
            }
        }
    }

    private void luuThanhPhanCombo(String maCombo, List<ThanhPhanCombo> thanhPhan) {
        for (ThanhPhanCombo tp : thanhPhan) {
            repository.themThanhPhanCombo(maCombo, tp.maSanPham(), tp.soLuong());
        }
    }

    private String rongThanhNull(String s) {
        return s == null || s.trim().isEmpty() ? null : s.trim();
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
