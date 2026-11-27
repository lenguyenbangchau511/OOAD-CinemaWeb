package com.cinema.service;

import com.cinema.exception.NghiepVuException;
import com.cinema.repository.SanPhamRepository;
import com.cinema.util.TimKiem;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class QuanLyKhoService {
    private final SanPhamRepository repository;

    public QuanLyKhoService(SanPhamRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSach(String tuKhoa, String loai, String tinhTrang) {
        return repository.danhSachTonKho().stream()
                .filter(p -> tuKhoa.isBlank()
                        || TimKiem.chua(String.valueOf(p.get("maSanPham")), tuKhoa)
                        || TimKiem.chua(String.valueOf(p.get("tenSanPham")), tuKhoa))
                .filter(p -> loai.isBlank() || loai.equals(p.get("loaiSanPham")))
                .filter(p -> {
                    int ton = ((Number) p.get("soLuongTon")).intValue();
                    int min = ((Number) p.get("mucTonToiThieu")).intValue();

                    return switch (tinhTrang) {
                        case "het-hang" -> ton == 0;
                        case "sap-het" -> ton > 0 && ton <= min;
                        case "binh-thuong" -> ton > min;
                        default -> true;
                    };
                })
                .toList();
    }

    public List<Map<String, Object>> lichSuBienDong(String maSanPham, String loai) {
        return repository.lichSuBienDong(maSanPham, loai);
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
            throw new NghiepVuException(
                    HttpStatus.NOT_FOUND,
                    "KHONG_TIM_THAY",
                    "Không tìm thấy sản phẩm hoặc combo"
            );
        }
        Map<String, Object> result = new LinkedHashMap<>(combos.get(0));
        result.put("loaiDoiTuong", "COMBO");
        result.put("thanhPhan", repository.thanhPhanCombo(ma));
        return result;
    }
}
