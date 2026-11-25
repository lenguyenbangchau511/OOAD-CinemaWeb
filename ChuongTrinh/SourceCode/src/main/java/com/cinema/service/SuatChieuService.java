package com.cinema.service;

import com.cinema.dto.BoLocSuatChieuDto;
import com.cinema.dto.SuatChieuDto;
import com.cinema.entity.GheSuatChieu;
import com.cinema.entity.PhongChieu;
import com.cinema.entity.SuatChieu;
import com.cinema.enums.TrangThaiGheSuat;
import com.cinema.enums.TrangThaiSuat;
import com.cinema.repository.GheSuatChieuRepository;
import com.cinema.repository.PhongChieuRepository;
import com.cinema.repository.SuatChieuRepository;
import com.cinema.service.LienKetModuleKhac.PhimTomTat;
import com.cinema.util.ThoiGian;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lớp SuatChieu: tra cứu suất chiếu (UC5.1 bước 1-3, UC4.2 danh sách suất chiếu). */
@Service
public class SuatChieuService {

    private final SuatChieuRepository suatRepo;
    private final PhongChieuRepository phongRepo;
    private final GheSuatChieuRepository gheSuatRepo;
    private final LienKetModuleKhac lienKet;

    public SuatChieuService(SuatChieuRepository suatRepo, PhongChieuRepository phongRepo,
                            GheSuatChieuRepository gheSuatRepo, LienKetModuleKhac lienKet) {
        this.suatRepo = suatRepo;
        this.phongRepo = phongRepo;
        this.gheSuatRepo = gheSuatRepo;
        this.lienKet = lienKet;
    }

    /** timKiemSuatChieu: các suất còn được phép bán của một phim trong một ngày (dành cho khách). */
    @Transactional(readOnly = true)
    public List<SuatChieuDto> timKiemSuatChieu(String maPhim, LocalDate ngay) {
        LocalDateTime bayGio = ThoiGian.bayGio();
        LocalDate ngayXem = ngay != null ? ngay : bayGio.toLocalDate();
        List<SuatChieu> ds = maPhim != null && !maPhim.isBlank()
                ? suatRepo.findByMaPhimAndNgayChieu(maPhim, ngayXem)
                : suatRepo.findByNgayChieu(ngayXem);
        return chuyenDanhSach(ds.stream().filter(s -> s.conBanVe(bayGio)).toList())
                .stream().filter(SuatChieuDto::conBanVe).toList();
    }

    /** Danh sách suất chiếu cho quản lý / nhân viên, lọc theo phim, phòng, ngày, trạng thái (mọi tham số đều tùy chọn). */
    @Transactional(readOnly = true)
    public List<SuatChieuDto> danhSachSuatChieu(String maPhim, String maPhong, LocalDate ngay, TrangThaiSuat trangThai) {
        List<SuatChieu> ds = ngay != null ? suatRepo.findByNgayChieu(ngay) : suatRepo.findAll();
        return chuyenDanhSach(ds.stream()
                .filter(s -> maPhim == null || maPhim.isBlank() || maPhim.equals(s.getMaPhim()))
                .filter(s -> maPhong == null || maPhong.isBlank() || maPhong.equals(s.getMaPhong()))
                .filter(s -> trangThai == null || trangThai == s.getTrangThai())
                .toList());
    }

    @Transactional(readOnly = true)
    public BoLocSuatChieuDto layBoLoc() {
        List<BoLocSuatChieuDto.Phim> phim = lienKet.tatCaPhim().stream()
                .map(p -> new BoLocSuatChieuDto.Phim(p.maPhim(), p.tenPhim())).toList();
        List<BoLocSuatChieuDto.Phong> phong = phongRepo.findAllByOrderByTenPhongAsc().stream()
                .map(p -> new BoLocSuatChieuDto.Phong(p.getMaPhong(), p.getTenPhong())).toList();
        return new BoLocSuatChieuDto(phim, phong);
    }

    /** Chuyển một suất chiếu sang DTO (dùng chung với màn hình chọn ghế). */
    public SuatChieuDto chuyenDto(SuatChieu suat) {
        return chuyenDanhSach(List.of(suat)).get(0);
    }

    public boolean phimConBanVe(String maPhim) {
        PhimTomTat phim = lienKet.layPhim(List.of(maPhim)).get(maPhim);
        return phim != null && phim.conBanVe();
    }

    private List<SuatChieuDto> chuyenDanhSach(List<SuatChieu> dsSuat) {
        LocalDateTime bayGio = ThoiGian.bayGio();
        Map<String, PhimTomTat> phim = lienKet.layPhim(dsSuat.stream().map(SuatChieu::getMaPhim).collect(Collectors.toSet()));
        Map<String, PhongChieu> phong = phongRepo.findAll().stream()
                .collect(Collectors.toMap(PhongChieu::getMaPhong, p -> p));
        Collection<String> dsMa = dsSuat.stream().map(SuatChieu::getMaSuat).toList();
        Map<String, List<GheSuatChieu>> gheTheoSuat = dsMa.isEmpty() ? new HashMap<>()
                : gheSuatRepo.findByMaSuatIn(dsMa).stream().collect(Collectors.groupingBy(GheSuatChieu::getMaSuat));

        return dsSuat.stream()
                .sorted(Comparator.comparing(SuatChieu::getNgayChieu).thenComparing(SuatChieu::getGioBatDau))
                .map(s -> {
                    PhimTomTat p = phim.get(s.getMaPhim());
                    PhongChieu pc = phong.get(s.getMaPhong());
                    List<GheSuatChieu> ghe = gheTheoSuat.getOrDefault(s.getMaSuat(), List.of());
                    return new SuatChieuDto(s.getMaSuat(), s.getMaPhim(),
                            p != null ? p.tenPhim() : s.getMaPhim(), p != null ? p.gioiHanDoTuoi() : null,
                            s.getMaPhong(), pc != null ? pc.getTenPhong() : s.getMaPhong(),
                            pc != null ? pc.getLoaiPhong().getMa() : null,
                            s.getNgayChieu(), s.getGioBatDau(), s.getGioKetThuc(),
                            s.getTrangThai().name(), s.conBanVe(bayGio) && p != null && p.conBanVe() && pc != null && pc.dangHoatDong(),
                            ghe.size(), dem(ghe, TrangThaiGheSuat.TRONG), dem(ghe, TrangThaiGheSuat.DANG_GIU),
                            dem(ghe, TrangThaiGheSuat.DA_DAT));
                }).toList();
    }

    private int dem(List<GheSuatChieu> ghe, TrangThaiGheSuat tt) {
        return (int) ghe.stream().filter(g -> g.getTrangThai() == tt).count();
    }
}
