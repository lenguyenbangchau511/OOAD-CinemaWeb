package com.cinema.service;

import com.cinema.dto.PhongChieuDto;
import com.cinema.dto.SoDoPhongDto;
import com.cinema.entity.Ghe;
import com.cinema.entity.GheSuatChieu;
import com.cinema.entity.PhongChieu;
import com.cinema.entity.SuatChieu;
import com.cinema.enums.LoaiPhong;
import com.cinema.enums.TrangThaiGheSuat;
import com.cinema.enums.TrangThaiPhong;
import com.cinema.enums.TrangThaiSuat;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.GheRepository;
import com.cinema.repository.GheSuatChieuRepository;
import com.cinema.repository.PhongChieuRepository;
import com.cinema.repository.SuatChieuRepository;
import com.cinema.util.TimKiem;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lớp PhongChieu: tra cứu danh sách, chi tiết và sơ đồ ghế phòng (UC3.2, UC3.3 phần xem). */
@Service
public class PhongChieuService {

    private final PhongChieuRepository phongRepo;
    private final GheRepository gheRepo;
    private final SuatChieuRepository suatRepo;
    private final GheSuatChieuRepository gheSuatRepo;

    public PhongChieuService(PhongChieuRepository phongRepo, GheRepository gheRepo,
                             SuatChieuRepository suatRepo, GheSuatChieuRepository gheSuatRepo) {
        this.phongRepo = phongRepo;
        this.gheRepo = gheRepo;
        this.suatRepo = suatRepo;
        this.gheSuatRepo = gheSuatRepo;
    }

    /** timKiemPhong: tìm theo mã / tên phòng (có dấu hoặc không dấu), lọc theo loại và trạng thái. */
    @Transactional(readOnly = true)
    public List<PhongChieuDto> timKiemPhong(String tuKhoa, String loaiPhong, TrangThaiPhong trangThai) {
        LoaiPhong loai = (loaiPhong == null || loaiPhong.isBlank()) ? null : LoaiPhong.tuMa(loaiPhong);
        return phongRepo.findAllByOrderByTenPhongAsc().stream()
                .filter(p -> tuKhoa == null || tuKhoa.isBlank()
                        || TimKiem.chua(p.getMaPhong(), tuKhoa) || TimKiem.chua(p.getTenPhong(), tuKhoa))
                .filter(p -> loaiPhong == null || loaiPhong.isBlank() || p.getLoaiPhong() == loai)
                .filter(p -> trangThai == null || p.getTrangThai() == trangThai)
                .map(this::chuyenDto).toList();
    }

    /** xemChiTietPhong */
    @Transactional(readOnly = true)
    public PhongChieuDto xemChiTietPhong(String maPhong) {
        return chuyenDto(layPhong(maPhong));
    }

    /** Sơ đồ ghế của phòng; đánh dấu các ghế đã bán / đang giữ trong suất chưa kết thúc. */
    @Transactional(readOnly = true)
    public SoDoPhongDto xemSoDo(String maPhong) {
        PhongChieu phong = layPhong(maPhong);
        List<String> dsSuatChuaKetThuc = suatRepo
                .findByMaPhongAndTrangThaiIn(maPhong, List.of(TrangThaiSuat.SAP_CHIEU, TrangThaiSuat.DANG_CHIEU))
                .stream().map(SuatChieu::getMaSuat).toList();
        Set<String> gheBiKhoa = new HashSet<>();
        if (!dsSuatChuaKetThuc.isEmpty()) {
            for (GheSuatChieu gs : gheSuatRepo.findByMaSuatIn(dsSuatChuaKetThuc)) {
                if (gs.getTrangThai() != TrangThaiGheSuat.TRONG) gheBiKhoa.add(gs.getMaGhe());
            }
        }
        List<SoDoPhongDto.Ghe> ghe = gheRepo.findByMaPhong(maPhong).stream()
                .sorted(Comparator.comparing(Ghe::layHang).thenComparingInt(Ghe::layCot))
                .map(g -> new SoDoPhongDto.Ghe(g.getMaGhe(), g.getTenGhe(), g.layHang(), g.layCot(),
                        g.getLoaiGhe().name(), g.getTrangThai().name(), gheBiKhoa.contains(g.getMaGhe())))
                .toList();
        return new SoDoPhongDto(chuyenDto(phong), !dsSuatChuaKetThuc.isEmpty(), ghe);
    }

    private PhongChieu layPhong(String maPhong) {
        return phongRepo.findById(maPhong).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chiếu"));
    }

    private PhongChieuDto chuyenDto(PhongChieu p) {
        return new PhongChieuDto(p.getMaPhong(), p.getTenPhong(), p.getLoaiPhong().getMa(),
                p.getSoLuongGhe(), p.getTongSoHang(), p.getTongSoCot(), p.getTrangThai().name());
    }
}
