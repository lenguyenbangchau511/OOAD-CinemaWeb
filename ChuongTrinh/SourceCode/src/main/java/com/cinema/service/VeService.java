package com.cinema.service;

import com.cinema.dto.DichVuDto;
import com.cinema.dto.KetQuaDatVeDto;
import com.cinema.dto.LichSuVeDto;
import com.cinema.entity.ChiTietDichVu;
import com.cinema.entity.DonHang;
import com.cinema.entity.Ghe;
import com.cinema.entity.GheSuatChieu;
import com.cinema.entity.PhongChieu;
import com.cinema.entity.SuatChieu;
import com.cinema.entity.ThanhToan;
import com.cinema.entity.Ve;
import com.cinema.enums.LoaiGiaoDich;
import com.cinema.enums.LoaiPhong;
import com.cinema.enums.TrangThaiDonHang;
import com.cinema.enums.TrangThaiThanhToan;
import com.cinema.enums.TrangThaiVe;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.ChiTietDichVuRepository;
import com.cinema.repository.DonHangRepository;
import com.cinema.repository.GheRepository;
import com.cinema.repository.GheSuatChieuRepository;
import com.cinema.repository.PhongChieuRepository;
import com.cinema.repository.SuatChieuRepository;
import com.cinema.repository.ThanhToanRepository;
import com.cinema.repository.VeRepository;
import com.cinema.service.LienKetModuleKhac.PhimTomTat;
import com.cinema.util.CauHinhRap;
import com.cinema.util.NguoiDung;
import com.cinema.util.SinhMa;
import com.cinema.util.ThoiGian;
import com.cinema.util.TimKiem;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lớp Ve: phát hành vé + mã QR (UC5.8), tra cứu lịch sử vé (UC5.9), xem chi tiết vé / đơn hàng (UC5.10). */
@Service
public class VeService {

    private static final Logger LOG = LoggerFactory.getLogger(VeService.class);

    private final VeRepository veRepo;
    private final DonHangRepository donHangRepo;
    private final ChiTietDichVuRepository dichVuRepo;
    private final ThanhToanRepository thanhToanRepo;
    private final GheSuatChieuRepository gheSuatRepo;
    private final GheRepository gheRepo;
    private final SuatChieuRepository suatRepo;
    private final PhongChieuRepository phongRepo;
    private final LienKetModuleKhac lienKet;
    private final CauHinhRap cauHinh;

    public VeService(VeRepository veRepo, DonHangRepository donHangRepo, ChiTietDichVuRepository dichVuRepo,
                     ThanhToanRepository thanhToanRepo, GheSuatChieuRepository gheSuatRepo, GheRepository gheRepo,
                     SuatChieuRepository suatRepo, PhongChieuRepository phongRepo,
                     LienKetModuleKhac lienKet, CauHinhRap cauHinh) {
        this.veRepo = veRepo;
        this.donHangRepo = donHangRepo;
        this.dichVuRepo = dichVuRepo;
        this.thanhToanRepo = thanhToanRepo;
        this.gheSuatRepo = gheSuatRepo;
        this.gheRepo = gheRepo;
        this.suatRepo = suatRepo;
        this.phongRepo = phongRepo;
        this.lienKet = lienKet;
        this.cauHinh = cauHinh;
    }

    // ------------------------------------------------------------------ UC5.8
    /**
     * Phát hành vé cho đơn đã thanh toán: mỗi ghế một vé, mã vé và mã QR duy nhất, trạng thái CHUA_SU_DUNG.
     * Gọi trong cùng giao dịch với bước ghi nhận thanh toán. Nếu đơn đã có vé thì trả lại vé cũ (không phát hành lại).
     */
    public List<Ve> phatHanhVe(DonHang don, List<GheSuatChieu> dsGhe) {
        List<Ve> daCo = veRepo.findByMaDonHang(don.getMaDonHang());
        if (!daCo.isEmpty()) return daCo;

        List<Ve> dsVe = new ArrayList<>();
        for (GheSuatChieu gs : dsGhe) {
            Ghe ghe = gheRepo.findById(gs.getMaGhe()).orElseThrow();
            SuatChieu suat = suatRepo.findById(gs.getMaSuat()).orElseThrow();
            PhongChieu phong = phongRepo.findById(suat.getMaPhong()).orElseThrow();

            Ve ve = new Ve();
            do {                                               // trùng mã thì tự sinh lại
                ve.setMaVe(SinhMa.ngauNhien("V", 7));
            } while (veRepo.existsById(ve.getMaVe()));
            ve.setMaQR(xuatMaQR(ve.getMaVe()));
            ve.setMaDonHang(don.getMaDonHang());
            ve.setMaGheSuat(gs.getMaGheSuat());
            ve.setDonGia(gs.getGiaVe());
            ve.setMaGiaVe(lienKet.timMaGiaVe(loaiVeTheoPhong(phong.getLoaiPhong()), ghe.getLoaiGhe().name(),
                    suat.getNgayChieu(), suat.getGioBatDau())
                    .orElseThrow(() -> new IllegalStateException("Chưa cấu hình bảng giá vé phù hợp")));
            ve.setTrangThai(TrangThaiVe.CHUA_SU_DUNG);
            dsVe.add(ve);
        }
        return veRepo.saveAll(dsVe);
    }

    /** xuatMaQR: chuỗi dữ liệu mã QR của vé (duy nhất); giao diện vẽ ra hình QR từ chuỗi này. */
    private String xuatMaQR(String maVe) {
        String qr;
        do {
            qr = "CINEMA-" + maVe + "-" + SinhMa.ngauNhien("", 6);
        } while (veRepo.existsByMaQR(qr));
        return qr;
    }

    private String loaiVeTheoPhong(LoaiPhong loai) {
        return switch (loai) {
            case PHIM_3D -> "VE_3D";
            case IMAX -> "VE_IMAX";
            default -> "VE_2D";
        };
    }

    /** Email xác nhận chỉ minh họa (đề bài không yêu cầu gửi thật): ghi log. */
    public void guiEmailXacNhanMinhHoa(DonHang don, int soVe) {
        LOG.info("[Email minh họa] Đã gửi xác nhận đơn {} ({} vé) cho khách {}",
                don.getMaDonHang(), soVe, don.getMaKhachHang());
    }

    // ------------------------------------------------------------ UC5.9
    public record BoLocLichSu(String tuKhoa, LocalDate tuNgay, LocalDate denNgay,
                              TrangThaiDonHang trangThaiDon, TrangThaiVe trangThaiVe, String maKhachHang) {
    }

    /**
     * Tra cứu lịch sử giao dịch / vé. Khách hàng chỉ thấy đơn của mình; nhân viên và quản lý tra cứu được
     * theo mã khách hàng, số điện thoại, mã đơn hoặc mã vé. Mới nhất xếp trước.
     */
    @Transactional(readOnly = true)
    public List<LichSuVeDto> traCuuLichSuVe(NguoiDung nd, BoLocLichSu loc) {
        if (loc.tuNgay() != null && loc.denNgay() != null && loc.tuNgay().isAfter(loc.denNgay())) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Thời điểm bắt đầu không được sau thời điểm kết thúc");
        }
        List<DonHang> dsDon;
        if (nd.laKhachHang()) {
            if (nd.maKhachHang() == null) throw new NghiepVuException(HttpStatus.FORBIDDEN, "Tài khoản chưa gắn với khách hàng");
            dsDon = donHangRepo.findByMaKhachHangOrderByNgayDatDesc(nd.maKhachHang());
        } else if (nd.laNhanVienHoacQuanLy()) {
            dsDon = loc.maKhachHang() != null && !loc.maKhachHang().isBlank()
                    ? donHangRepo.findByMaKhachHangOrderByNgayDatDesc(loc.maKhachHang())
                    : donHangRepo.findAllByOrderByNgayDatDesc();
        } else {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "KHONG_CO_QUYEN", "Bạn không có quyền thực hiện chức năng này");
        }

        Map<String, List<Ve>> veTheoDon = veRepo.findByMaDonHangIn(dsDon.stream().map(DonHang::getMaDonHang).toList())
                .stream().collect(Collectors.groupingBy(Ve::getMaDonHang));
        String tuKhoa = loc.tuKhoa() == null ? "" : loc.tuKhoa().trim();
        List<String> khachTheoSdt = tuKhoa.length() >= 3 ? lienKet.timMaKhachHangTheoSdt(tuKhoa) : List.of();

        List<DonHang> ketQua = dsDon.stream()
                .filter(d -> loc.trangThaiDon() == null || d.getTrangThai() == loc.trangThaiDon())
                .filter(d -> loc.tuNgay() == null || !d.getNgayDat().toLocalDate().isBefore(loc.tuNgay()))
                .filter(d -> loc.denNgay() == null || !d.getNgayDat().toLocalDate().isAfter(loc.denNgay()))
                .filter(d -> loc.trangThaiVe() == null || veTheoDon.getOrDefault(d.getMaDonHang(), List.of()).stream()
                        .anyMatch(v -> v.getTrangThai() == loc.trangThaiVe()))
                .filter(d -> tuKhoa.isEmpty() || khopTuKhoa(d, veTheoDon.getOrDefault(d.getMaDonHang(), List.of()),
                        tuKhoa, khachTheoSdt))
                .toList();
        return chuyenLichSu(ketQua, veTheoDon);
    }

    private boolean khopTuKhoa(DonHang d, List<Ve> dsVe, String tuKhoa, List<String> khachTheoSdt) {
        return TimKiem.chua(d.getMaDonHang(), tuKhoa)
                || dsVe.stream().anyMatch(v -> TimKiem.chua(v.getMaVe(), tuKhoa) || TimKiem.chua(v.getMaQR(), tuKhoa))
                || (d.getMaKhachHang() != null && khachTheoSdt.contains(d.getMaKhachHang()));
    }

    private List<LichSuVeDto> chuyenLichSu(List<DonHang> dsDon, Map<String, List<Ve>> veTheoDon) {
        Set<String> dsMaGheSuat = new HashSet<>();
        veTheoDon.values().forEach(l -> l.forEach(v -> dsMaGheSuat.add(v.getMaGheSuat())));
        Map<String, GheSuatChieu> gheSuat = gheSuatRepo.findAllById(dsMaGheSuat).stream()
                .collect(Collectors.toMap(GheSuatChieu::getMaGheSuat, Function.identity()));
        Map<String, Ghe> ghe = gheRepo.findAllById(gheSuat.values().stream().map(GheSuatChieu::getMaGhe).toList())
                .stream().collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));
        Map<String, SuatChieu> suat = suatRepo.findAllById(gheSuat.values().stream().map(GheSuatChieu::getMaSuat).toList())
                .stream().collect(Collectors.toMap(SuatChieu::getMaSuat, Function.identity()));
        Map<String, PhimTomTat> phim = lienKet.layPhim(suat.values().stream().map(SuatChieu::getMaPhim).collect(Collectors.toSet()));
        Map<String, PhongChieu> phong = phongRepo.findAll().stream()
                .collect(Collectors.toMap(PhongChieu::getMaPhong, Function.identity()));

        List<LichSuVeDto> ketQua = new ArrayList<>();
        for (DonHang d : dsDon) {
            List<Ve> dsVe = veTheoDon.getOrDefault(d.getMaDonHang(), List.of());
            SuatChieu s = dsVe.isEmpty() ? null : suat.get(gheSuat.get(dsVe.get(0).getMaGheSuat()).getMaSuat());
            PhimTomTat p = s == null ? null : phim.get(s.getMaPhim());
            PhongChieu pc = s == null ? null : phong.get(s.getMaPhong());
            List<String> tenGhe = dsVe.stream()
                    .map(v -> ghe.get(gheSuat.get(v.getMaGheSuat()).getMaGhe()).getTenGhe()).sorted().toList();
            ketQua.add(new LichSuVeDto(d.getMaDonHang(), d.getNgayDat(), d.getTongTien(), d.getTrangThai().name(),
                    d.getKenhBan().name(), p == null ? null : p.tenPhim(),
                    s == null ? null : s.getNgayChieu(), s == null ? null : s.getGioBatDau(),
                    pc == null ? null : pc.getTenPhong(), tenGhe, dsVe.size(), tomTatTrangThaiVe(dsVe)));
        }
        return ketQua;
    }

    /** Trạng thái chung của các vé trong đơn: nếu khác nhau thì lấy "CHUA_SU_DUNG" nếu còn vé chưa dùng. */
    private String tomTatTrangThaiVe(List<Ve> dsVe) {
        if (dsVe.isEmpty()) return null;
        Set<TrangThaiVe> tt = dsVe.stream().map(Ve::getTrangThai).collect(Collectors.toSet());
        return tt.size() == 1 ? tt.iterator().next().name()
                : (tt.contains(TrangThaiVe.CHUA_SU_DUNG) ? TrangThaiVe.CHUA_SU_DUNG.name() : tt.iterator().next().name());
    }

    // ------------------------------------------------------ UC5.10 + giao diện 11
    /** Chi tiết đơn hàng, vé và kết quả thanh toán. Khách hàng chỉ xem đơn của mình. */
    @Transactional(readOnly = true)
    public KetQuaDatVeDto xemKetQuaDatVe(NguoiDung nd, String maDonHang) {
        return chiTietDon(nd, maDonHang, null);
    }

    @Transactional(readOnly = true)
    public KetQuaDatVeDto xemChiTietVe(NguoiDung nd, String maVe) {
        Ve ve = veRepo.findById(maVe).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy vé"));
        return chiTietDon(nd, ve.getMaDonHang(), ve);
    }

    private KetQuaDatVeDto chiTietDon(NguoiDung nd, String maDonHang, Ve veDangXem) {
        DonHang don = donHangRepo.findById(maDonHang).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        kiemTraQuyenXem(nd, don);

        List<Ve> dsVe = veRepo.findByMaDonHang(maDonHang);
        List<ThanhToan> dsThanhToan = thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(maDonHang);
        List<ChiTietDichVu> dsDichVu = dichVuRepo.findByMaDonHang(maDonHang);

        Map<String, GheSuatChieu> gheSuat = gheSuatRepo.findAllById(dsVe.stream().map(Ve::getMaGheSuat).toList())
                .stream().collect(Collectors.toMap(GheSuatChieu::getMaGheSuat, Function.identity()));
        Map<String, Ghe> ghe = gheRepo.findAllById(gheSuat.values().stream().map(GheSuatChieu::getMaGhe).toList())
                .stream().collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));
        Ve veDaiDien = veDangXem != null ? veDangXem : dsVe.stream().findFirst().orElse(null);
        SuatChieu suat = veDaiDien == null ? null
                : suatRepo.findById(gheSuat.get(veDaiDien.getMaGheSuat()).getMaSuat()).orElse(null);
        PhimTomTat phim = suat == null ? null : lienKet.layPhim(List.of(suat.getMaPhim())).get(suat.getMaPhim());
        PhongChieu phong = suat == null ? null : phongRepo.findById(suat.getMaPhong()).orElse(null);

        List<Ve> veHienThi = veDangXem == null ? dsVe : List.of(veDangXem);
        List<KetQuaDatVeDto.Ve> dsVeDto = veHienThi.stream().map(v -> {
            Ghe g = ghe.get(gheSuat.get(v.getMaGheSuat()).getMaGhe());
            return new KetQuaDatVeDto.Ve(v.getMaVe(), v.getMaQR(), g.getTenGhe(), g.getLoaiGhe().name(),
                    v.getDonGia(), v.getTrangThai().name());
        }).sorted(Comparator.comparing(KetQuaDatVeDto.Ve::tenGhe)).toList();

        List<DichVuDto> dsDichVuDto = dsDichVu.stream().map(this::chuyenDichVu).toList();
        BigDecimal tienVe = dsVe.stream().map(Ve::getDonGia).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tienDichVu = dsDichVu.stream().map(ChiTietDichVu::getThanhTien).reduce(BigDecimal.ZERO, BigDecimal::add);
        ThanhToan thanhCong = dsThanhToan.stream().filter(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN
                && t.getTrangThai() == TrangThaiThanhToan.THANH_CONG).findFirst().orElse(null);
        String ketQua = xacDinhKetQua(don, dsThanhToan);
        int diemTich = don.getTrangThai() == TrangThaiDonHang.DA_THANH_TOAN && don.getMaKhachHang() != null
                ? cauHinh.diemTichDuoc(don.getTongTien()) : 0;

        return new KetQuaDatVeDto(ketQua, thongBaoKetQua(ketQua), don.getMaDonHang(), don.getNgayDat(),
                don.getKenhBan().name(), don.getTrangThai().name(), don.getTongTien(), tienVe, tienDichVu,
                don.getSoTienGiamTuKhuyenMai(), don.getSoTienGiamTuDiem(), don.getDiemSuDung(), diemTich,
                don.getMaKhuyenMai(),
                thanhCong == null ? null : thanhCong.getPhuongThuc().name(),
                thanhCong == null ? null : thanhCong.getMaGiaoDichDoiTac(),
                phim == null ? null : phim.tenPhim(), phim == null ? null : phim.gioiHanDoTuoi(),
                phong == null ? null : phong.getTenPhong(),
                suat == null ? null : suat.getNgayChieu(), suat == null ? null : suat.getGioBatDau(),
                dsVeDto, dsDichVuDto);
    }

    private String xacDinhKetQua(DonHang don, List<ThanhToan> dsThanhToan) {
        if (don.getTrangThai() == TrangThaiDonHang.DA_THANH_TOAN) return "THANH_CONG";
        boolean daThuTien = dsThanhToan.stream().anyMatch(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN
                && t.getTrangThai() == TrangThaiThanhToan.THANH_CONG);
        if (daThuTien) return "CAN_DOI_SOAT";
        ThanhToan moiNhat = dsThanhToan.stream().filter(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN)
                .findFirst().orElse(null);
        if (moiNhat == null) return "CHUA_THANH_TOAN";
        return moiNhat.getTrangThai() == TrangThaiThanhToan.CHO_XU_LY ? "CHO_XAC_MINH" : "THAT_BAI";
    }

    private String thongBaoKetQua(String ketQua) {
        return switch (ketQua) {
            case "THANH_CONG" -> "Thanh toán thành công";
            case "CHO_XAC_MINH" -> "Giao dịch đang chờ xác minh. Vui lòng không thanh toán lại cho đến khi có kết quả";
            case "THAT_BAI" -> "Giao dịch không thành công";
            case "CAN_DOI_SOAT" -> "Cổng thanh toán đã thu tiền nhưng đơn hàng không thể hoàn tất. Vé không được phát hành, khoản tiền sẽ được hoàn lại";
            default -> "Đơn hàng chưa được thanh toán";
        };
    }

    public DichVuDto chuyenDichVu(ChiTietDichVu dv) {
        boolean laCombo = dv.getMaCombo() != null;
        String ma = laCombo ? dv.getMaCombo() : dv.getMaSanPham();
        return new DichVuDto(laCombo ? "COMBO" : "SAN_PHAM", ma,
                laCombo ? lienKet.tenCombo(ma) : lienKet.tenSanPham(ma),
                dv.getSoLuong(), dv.getDonGia(), dv.getThanhTien());
    }

    /** Khách hàng chỉ xem đơn của mình; nhân viên / quản lý xem được mọi đơn; admin không xem dữ liệu vé. */
    public void kiemTraQuyenXem(NguoiDung nd, DonHang don) {
        boolean duocXem = nd.laNhanVienHoacQuanLy()
                || (nd.laKhachHang() && nd.maKhachHang() != null && nd.maKhachHang().equals(don.getMaKhachHang()));
        if (!duocXem) {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "KHONG_CO_QUYEN", "Bạn không có quyền xem đơn hàng này");
        }
    }
}
