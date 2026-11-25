package com.cinema.service;

import com.cinema.dto.DichVuDto;
import com.cinema.dto.DonHangMoiDto;
import com.cinema.dto.DonThanhToanDto;
import com.cinema.dto.KetQuaCongRequest;
import com.cinema.dto.KetQuaThanhToanDto;
import com.cinema.dto.KhoiTaoThanhToanRequest;
import com.cinema.dto.PhatHanhLaiRequest;
import com.cinema.dto.PhienGiuDto;
import com.cinema.dto.ThanhToanDto;
import com.cinema.entity.ChiTietDichVu;
import com.cinema.entity.DonHang;
import com.cinema.entity.Ghe;
import com.cinema.entity.GheSuatChieu;
import com.cinema.entity.PhongChieu;
import com.cinema.entity.SuatChieu;
import com.cinema.entity.ThanhToan;
import com.cinema.enums.KenhBanVe;
import com.cinema.enums.LoaiGiaoDich;
import com.cinema.enums.PhuongThucThanhToan;
import com.cinema.enums.TrangThaiDonHang;
import com.cinema.enums.TrangThaiThanhToan;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.ChiTietDichVuRepository;
import com.cinema.repository.DonHangRepository;
import com.cinema.repository.GheRepository;
import com.cinema.repository.GheSuatChieuRepository;
import com.cinema.repository.PhongChieuRepository;
import com.cinema.repository.SuatChieuRepository;
import com.cinema.repository.ThanhToanRepository;
import com.cinema.util.CauHinhRap;
import com.cinema.util.NguoiDung;
import com.cinema.util.SinhMa;
import com.cinema.util.ThoiGian;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * UC5.5 Thanh toán đơn hàng trực tuyến (giao diện 10).
 * Cổng thanh toán là sandbox mô phỏng: hệ thống tạo giao dịch CHO_XU_LY, giao diện mô phỏng cổng báo kết quả
 * (thành công / thất bại / chưa xác định) qua {@link #ghiNhanKetQuaCong}. Trong thực tế bước này là cổng gọi lại hệ thống.
 */
@Service
public class ThanhToanService {

    private static final Logger LOG = LoggerFactory.getLogger(ThanhToanService.class);

    private static final Set<PhuongThucThanhToan> PHUONG_THUC_ONLINE =
            EnumSet.of(PhuongThucThanhToan.MOMO, PhuongThucThanhToan.VNPAY, PhuongThucThanhToan.THE_NGAN_HANG);

    private final DonHangRepository donHangRepo;
    private final ThanhToanRepository thanhToanRepo;
    private final ChiTietDichVuRepository dichVuRepo;
    private final GheSuatChieuRepository gheSuatRepo;
    private final GheRepository gheRepo;
    private final SuatChieuRepository suatRepo;
    private final PhongChieuRepository phongRepo;
    private final GiuGheService giuGheService;
    private final VeService veService;
    private final LienKetModuleKhac lienKet;
    private final CauHinhRap cauHinh;
    private final TransactionTemplate giaoDich;

    public ThanhToanService(DonHangRepository donHangRepo, ThanhToanRepository thanhToanRepo,
                            ChiTietDichVuRepository dichVuRepo, GheSuatChieuRepository gheSuatRepo,
                            GheRepository gheRepo, SuatChieuRepository suatRepo, PhongChieuRepository phongRepo,
                            GiuGheService giuGheService, VeService veService, LienKetModuleKhac lienKet,
                            CauHinhRap cauHinh, PlatformTransactionManager quanLyGiaoDich) {
        this.donHangRepo = donHangRepo;
        this.thanhToanRepo = thanhToanRepo;
        this.dichVuRepo = dichVuRepo;
        this.gheSuatRepo = gheSuatRepo;
        this.gheRepo = gheRepo;
        this.suatRepo = suatRepo;
        this.phongRepo = phongRepo;
        this.giuGheService = giuGheService;
        this.veService = veService;
        this.lienKet = lienKet;
        this.cauHinh = cauHinh;
        this.giaoDich = new TransactionTemplate(quanLyGiaoDich);
    }

    // ------------------------------------------------- Giao diện 10: kiểm tra đơn
    @Transactional
    public DonThanhToanDto xemDonDeThanhToan(NguoiDung nd, String maDonHang, String maPhienGiu, List<String> dsMaGheChot) {
        if (maPhienGiu != null && !maPhienGiu.isBlank()) giuGheService.kiemTraChuPhien(nd, maPhienGiu);
        giuGheService.giaiPhongGheQuaHan();
        DonHang don = layDon(maDonHang);
        veService.kiemTraQuyenXem(nd, don);

        List<GheSuatChieu> dsGheGiu = maPhienGiu == null || maPhienGiu.isBlank() ? List.of()
                : gheSuatRepo.findByMaPhienGiu(maPhienGiu);
        List<ChiTietDichVu> dsDichVu = dichVuRepo.findByMaDonHang(maDonHang);
        BigDecimal tienVe = tong(dsGheGiu.stream().map(GheSuatChieu::getGiaVe).toList());
        BigDecimal tienDichVu = tong(dsDichVu.stream().map(ChiTietDichVu::getThanhTien).toList());

        String lyDo = null;
        if (don.getTrangThai() == TrangThaiDonHang.DA_THANH_TOAN) lyDo = "Đơn hàng đã được thanh toán";
        else if (don.getTrangThai() == TrangThaiDonHang.DA_HUY) lyDo = "Đơn hàng đã bị hủy";
        else if (daThuTien(maDonHang)) {
            lyDo = "Cổng thanh toán đã thu tiền cho đơn này, vé đang chờ phát hành. Vui lòng không thanh toán lại";
        } else if (dsGheGiu.isEmpty()) lyDo = "Hết thời gian giữ ghế. Vui lòng chọn lại ghế";
        else if (dsMaGheChot != null && !dsMaGheChot.isEmpty() && !khopDanhSachGhe(dsGheGiu, dsMaGheChot)) {
            lyDo = "Danh sách ghế đang giữ không khớp với đơn hàng đã xác nhận, vui lòng kiểm tra lại đơn hàng";
        }
        else if (tongTienDuKien(don, tienVe, tienDichVu).compareTo(don.getTongTien()) != 0) {
            lyDo = "Thông tin đơn hàng đã thay đổi, vui lòng kiểm tra lại đơn hàng";
        }

        Map<String, Ghe> ghe = gheRepo.findByMaGheIn(dsGheGiu.stream().map(GheSuatChieu::getMaGhe).toList())
                .stream().collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));
        List<PhienGiuDto.GheGiu> dsGhe = dsGheGiu.stream()
                .map(g -> new PhienGiuDto.GheGiu(g.getMaGheSuat(), g.getMaGhe(), ghe.get(g.getMaGhe()).getTenGhe(),
                        ghe.get(g.getMaGhe()).getLoaiGhe().name(), g.getGiaVe()))
                .sorted((a, b) -> a.tenGhe().compareTo(b.tenGhe())).toList();

        SuatChieu suat = dsGheGiu.isEmpty() ? null : suatRepo.findById(dsGheGiu.get(0).getMaSuat()).orElse(null);
        String tenPhim = suat == null ? null : tenPhim(suat.getMaPhim());
        PhongChieu phong = suat == null ? null : phongRepo.findById(suat.getMaPhong()).orElse(null);
        List<DichVuDto> dsDichVuDto = dsDichVu.stream().map(veService::chuyenDichVu).toList();
        ThanhToan dangCho = layThanhToanDangCho(maDonHang);

        return new DonThanhToanDto(don.getMaDonHang(), don.getTrangThai().name(), don.getKenhBan().name(),
                don.getNgayDat(), don.getTongTien(), tienVe, tienDichVu,
                nz(don.getSoTienGiamTuKhuyenMai()), nz(don.getSoTienGiamTuDiem()), don.getDiemSuDung(),
                don.getMaKhuyenMai(), tenPhim, suat == null ? null : suat.getNgayChieu(),
                suat == null ? null : suat.getGioBatDau(), phong == null ? null : phong.getTenPhong(),
                dsGhe, dsDichVuDto, giuGheService.soGiayConLai(dsGheGiu), lyDo == null, lyDo,
                dangCho == null ? null : chuyenDto(dangCho));
    }

    // --------------------------------------------- Bước 1: yêu cầu thanh toán
    /** Kiểm tra đơn + giữ chỗ rồi tạo giao dịch CHO_XU_LY. Nếu đã có giao dịch đang chờ thì trả lại giao dịch đó. */
    @Transactional
    public ThanhToanDto khoiTaoThanhToan(NguoiDung nd, KhoiTaoThanhToanRequest req) {
        PhuongThucThanhToan phuongThuc = parsePhuongThuc(req.phuongThuc());
        if (!PHUONG_THUC_ONLINE.contains(phuongThuc)) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không được hỗ trợ cho giao dịch trực tuyến");
        }
        DonHang don = donHangRepo.khoaTheoMa(req.maDonHang()).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        veService.kiemTraQuyenXem(nd, don);
        giuGheService.kiemTraChuPhien(nd, req.maPhienGiu());

        if (don.getTrangThai() == TrangThaiDonHang.DA_THANH_TOAN) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "DA_THANH_TOAN", "Đơn hàng đã được thanh toán");
        }
        if (don.getTrangThai() == TrangThaiDonHang.DA_HUY) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "DON_DA_HUY", "Đơn hàng đã bị hủy");
        }
        if (daThuTien(don.getMaDonHang())) {            // đã thu tiền, chờ phát hành vé: tuyệt đối không thu thêm lần nữa
            throw new NghiepVuException(HttpStatus.CONFLICT, "DA_THU_TIEN",
                    "Cổng thanh toán đã thu tiền cho đơn này, vé đang chờ phát hành. Vui lòng không thanh toán lại");
        }
        ThanhToan dangCho = layThanhToanDangCho(don.getMaDonHang());
        if (dangCho != null) {                       // 6b: không tạo giao dịch thu tiền mới khi chưa biết kết quả cũ
            return chuyenDto(dangCho);
        }

        giuGheService.giaiPhongGheQuaHan();
        List<GheSuatChieu> dsGhe = kiemTraDieuKienThanhToan(don, req.maPhienGiu(), req.dsMaGheSuat());
        LocalDateTime bayGio = ThoiGian.bayGio();
        dsGhe.forEach(g -> g.setThoiGianGiu(bayGio));  // đang thanh toán: tính lại thời hạn giữ ghế từ lúc này
        gheSuatRepo.saveAll(dsGhe);

        ThanhToan tt = new ThanhToan();
        do {
            tt.setMaThanhToan(SinhMa.ngauNhien("TT", 6));
        } while (thanhToanRepo.existsById(tt.getMaThanhToan()));
        tt.setMaDonHang(don.getMaDonHang());
        tt.setPhuongThuc(phuongThuc);
        tt.setSoTien(don.getTongTien());
        tt.setLoaiGiaoDich(LoaiGiaoDich.THANH_TOAN);
        tt.setThoiGianGiaoDich(bayGio);
        tt.setMaGiaoDichDoiTac("SBX-" + phuongThuc.name() + "-" + SinhMa.ngauNhien("", 8));
        tt.setTrangThai(TrangThaiThanhToan.CHO_XU_LY);
        return chuyenDto(thanhToanRepo.save(tt));
    }

    // ------------------------------------ Bước 2: cổng báo kết quả (sandbox)
    /** Kết quả giai đoạn 1: ketThuc != null nghĩa là đã có câu trả lời cuối; ngược lại cổng đã thu tiền, cần hoàn tất đơn. */
    private record GiaiDoanMot(KetQuaThanhToanDto ketThuc, String maDonHang) {
    }

    /**
     * Gồm hai giao dịch CSDL riêng để KHÔNG bao giờ mất dấu khoản tiền đã thu:
     * (1) ghi nhận ngay "cổng đã thu tiền" (THANH_CONG) và lưu lại; (2) hoàn tất đơn (ghế, vé, kho, điểm).
     * Nếu (2) gặp lỗi hệ thống thì (1) vẫn còn, đơn ở trạng thái CHO_PHAT_HANH để thử phát hành lại hoặc đối soát.
     */
    public KetQuaThanhToanDto ghiNhanKetQuaCong(NguoiDung nd, String maThanhToan, KetQuaCongRequest req) {
        GiaiDoanMot gd1 = giaoDich.execute(st -> ghiNhanTuCong(nd, maThanhToan, req));
        if (gd1.ketThuc() != null) {
            return gd1.ketThuc();
        }
        return hoanTatDonDaThuTien(gd1.maDonHang(), maThanhToan, req.maPhienGiu(), req.dsMaGheSuat());
    }

    private GiaiDoanMot ghiNhanTuCong(NguoiDung nd, String maThanhToan, KetQuaCongRequest req) {
        // Khóa đơn hàng TRƯỚC khi đọc giao dịch để hai yêu cầu cùng lúc không hoàn tất đơn hai lần.
        String maDonHang = thanhToanRepo.findById(maThanhToan).map(ThanhToan::getMaDonHang).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch"));
        DonHang don = donHangRepo.khoaTheoMa(maDonHang).orElseThrow();
        veService.kiemTraQuyenXem(nd, don);
        if (req.maPhienGiu() != null && !req.maPhienGiu().isBlank()) giuGheService.kiemTraChuPhien(nd, req.maPhienGiu());
        ThanhToan tt = thanhToanRepo.findById(maThanhToan).orElseThrow();
        if (req.ketQua() == null) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Thiếu kết quả giao dịch");
        }

        if (tt.getTrangThai() != TrangThaiThanhToan.CHO_XU_LY) {   // đã xử lý rồi: không làm lại
            if (tt.getTrangThai() == TrangThaiThanhToan.THANH_CONG && don.getTrangThai() == TrangThaiDonHang.CHO_THANH_TOAN
                    && "THANH_CONG".equals(req.ketQua())) {
                return new GiaiDoanMot(null, maDonHang);           // cổng gọi lại sau khi lỗi phát hành vé: thử hoàn tất tiếp
            }
            String kq = tt.getTrangThai() == TrangThaiThanhToan.THANH_CONG ? "THANH_CONG" : "THAT_BAI";
            return new GiaiDoanMot(new KetQuaThanhToanDto(tt.getMaThanhToan(), maDonHang, kq,
                    "Giao dịch đã được xử lý trước đó"), maDonHang);
        }
        if ("THAT_BAI".equals(req.ketQua())) {
            tt.setTrangThai(TrangThaiThanhToan.THAT_BAI);
            thanhToanRepo.save(tt);
            return new GiaiDoanMot(new KetQuaThanhToanDto(maThanhToan, maDonHang, "THAT_BAI",
                    "Giao dịch không thành công. Đơn hàng được giữ nguyên để bạn thử lại"), maDonHang);
        }
        if ("CHO_XAC_MINH".equals(req.ketQua())) {
            return new GiaiDoanMot(new KetQuaThanhToanDto(maThanhToan, maDonHang, "CHO_XAC_MINH",
                    "Giao dịch đang chờ xác minh. Vui lòng không thanh toán lại cho đến khi có kết quả"), maDonHang);
        }
        if ("THANH_CONG".equals(req.ketQua())) {
            if (req.soTien() == null || req.soTien().compareTo(tt.getSoTien()) != 0) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không khớp với giao dịch");
            }
            tt.setTrangThai(TrangThaiThanhToan.THANH_CONG);     // ghi nhận khoản tiền đã thu, lưu ngay
            tt.setThoiGianGiaoDich(ThoiGian.bayGio());
            thanhToanRepo.save(tt);
            return new GiaiDoanMot(null, maDonHang);
        }
        throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Kết quả giao dịch không hợp lệ");
    }

    /** Hoàn tất đơn đã thu tiền. Lỗi hệ thống bất ngờ -> giữ nguyên giao dịch đã thu, báo CHO_PHAT_HANH. */
    private KetQuaThanhToanDto hoanTatDonDaThuTien(String maDonHang, String maThanhToan, String maPhienGiu,
                                                   List<String> dsMaGheChot) {
        try {
            return giaoDich.execute(st -> {
                DonHang don = donHangRepo.khoaTheoMa(maDonHang).orElseThrow();
                ThanhToan tt = thanhToanRepo.findById(maThanhToan).orElseThrow();
                if (don.getTrangThai() == TrangThaiDonHang.DA_THANH_TOAN) {
                    return new KetQuaThanhToanDto(maThanhToan, maDonHang, "THANH_CONG", "Thanh toán thành công");
                }
                return hoanTatThanhToan(don, tt, maPhienGiu, dsMaGheChot);
            });
        } catch (RuntimeException e) {
            LOG.error("Đã thu tiền (giao dịch {}) nhưng lỗi khi hoàn tất đơn {}; giữ lại giao dịch để thử phát hành lại hoặc đối soát",
                    maThanhToan, maDonHang, e);
            return new KetQuaThanhToanDto(maThanhToan, maDonHang, "CHO_PHAT_HANH",
                    "Cổng thanh toán đã thu tiền nhưng hệ thống chưa phát hành được vé do lỗi. Giao dịch đã được lưu, "
                            + "vui lòng KHÔNG thanh toán lại. Hãy thử phát hành lại hoặc liên hệ quầy vé với mã đơn " + maDonHang);
        }
    }

    /** Thử phát hành lại vé cho đơn đã thu tiền nhưng chưa phát hành được (khách hoặc nhân viên bấm). */
    public KetQuaThanhToanDto phatHanhLai(NguoiDung nd, String maDonHang, PhatHanhLaiRequest req) {
        DonHang don = layDon(maDonHang);
        veService.kiemTraQuyenXem(nd, don);
        if (req.maPhienGiu() != null && !req.maPhienGiu().isBlank()) giuGheService.kiemTraChuPhien(nd, req.maPhienGiu());
        ThanhToan tt = thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(maDonHang).stream()
                .filter(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN && t.getTrangThai() == TrangThaiThanhToan.THANH_CONG)
                .findFirst().orElseThrow(() -> new NghiepVuException(HttpStatus.CONFLICT, "Đơn hàng chưa có giao dịch đã thu tiền"));
        if (don.getTrangThai() != TrangThaiDonHang.CHO_THANH_TOAN) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Đơn hàng không ở trạng thái chờ phát hành vé");
        }
        return hoanTatDonDaThuTien(maDonHang, tt.getMaThanhToan(), req.maPhienGiu(), req.dsMaGheSuat());
    }

    /** Cổng báo đã thu tiền (đã ghi nhận ở giai đoạn 1): hoàn tất đơn (ghế -> đã đặt, phát hành vé, trừ kho, điểm, khuyến mãi). */
    private KetQuaThanhToanDto hoanTatThanhToan(DonHang don, ThanhToan tt, String maPhienGiu, List<String> dsMaGheChot) {
        List<GheSuatChieu> dsGhe;
        try {
            if (don.getTrangThai() != TrangThaiDonHang.CHO_THANH_TOAN) {
                throw new NghiepVuException(HttpStatus.CONFLICT, "Đơn hàng không còn ở trạng thái chờ thanh toán");
            }
            dsGhe = kiemTraDieuKienThanhToan(don, maPhienGiu, dsMaGheChot);
        } catch (NghiepVuException e) {
            return ghiNhanCanDoiSoat(don, tt, maPhienGiu, e.getMessage());
        }

        don.setTrangThai(TrangThaiDonHang.DA_THANH_TOAN);
        donHangRepo.save(don);

        dsGhe.forEach(GheSuatChieu::danhDauDaDat);
        gheSuatRepo.saveAll(dsGhe);
        veService.phatHanhVe(don, dsGhe);

        lienKet.truTonKho(lienKet.nhuCauTonKho(dichVuRepo.findByMaDonHang(don.getMaDonHang())),
                don.getMaDonHang(), don.getMaNhanVien());
        if (don.getMaKhuyenMai() != null) {
            lienKet.tangLuotKhuyenMai(don.getMaKhuyenMai());
        }
        if (don.getMaKhachHang() != null) {
            if (don.getDiemSuDung() > 0
                    && !lienKet.capNhatDiem(don.getMaKhachHang(), -don.getDiemSuDung(), "Dùng điểm", don.getMaDonHang())) {
                throw new IllegalStateException("Số điểm sử dụng vượt số dư");   // hủy bước hoàn tất; giao dịch đã thu vẫn được giữ
            }
            int diemTich = cauHinh.diemTichDuoc(don.getTongTien());
            if (diemTich > 0) {
                lienKet.capNhatDiem(don.getMaKhachHang(), diemTich, "Tích điểm", don.getMaDonHang());
            }
        }
        veService.guiEmailXacNhanMinhHoa(don, dsGhe.size());
        return new KetQuaThanhToanDto(tt.getMaThanhToan(), don.getMaDonHang(), "THANH_CONG", "Thanh toán thành công");
    }

    /** UC5.5 6c: cổng đã thu tiền nhưng đơn không thể hoàn tất -> không phát hành vé, ghi nhận hoàn tiền chờ xử lý. */
    private KetQuaThanhToanDto ghiNhanCanDoiSoat(DonHang don, ThanhToan tt, String maPhienGiu, String lyDo) {
        tt.setTrangThai(TrangThaiThanhToan.THANH_CONG);
        tt.setThoiGianGiaoDich(ThoiGian.bayGio());
        thanhToanRepo.save(tt);
        if (don.getTrangThai() == TrangThaiDonHang.CHO_THANH_TOAN) {
            don.setTrangThai(TrangThaiDonHang.DA_HUY);
            donHangRepo.save(don);
        }
        if (maPhienGiu != null && !maPhienGiu.isBlank()) {
            giuGheService.giaiPhongTheoPhien(maPhienGiu);
        }
        boolean daCoHoanTien = thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(don.getMaDonHang()).stream()
                .anyMatch(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.HOAN_TIEN);
        if (!daCoHoanTien) {
        ThanhToan hoan = new ThanhToan();
        do {
            hoan.setMaThanhToan(SinhMa.ngauNhien("TT", 6));
        } while (thanhToanRepo.existsById(hoan.getMaThanhToan()));
        hoan.setMaDonHang(don.getMaDonHang());
        hoan.setPhuongThuc(tt.getPhuongThuc());
        hoan.setSoTien(tt.getSoTien());
        hoan.setLoaiGiaoDich(LoaiGiaoDich.HOAN_TIEN);
        hoan.setThoiGianGiaoDich(ThoiGian.bayGio());
        hoan.setMaGiaoDichDoiTac(tt.getMaGiaoDichDoiTac());
        hoan.setTrangThai(TrangThaiThanhToan.CHO_XU_LY);
        thanhToanRepo.save(hoan);
        }
        return new KetQuaThanhToanDto(tt.getMaThanhToan(), don.getMaDonHang(), "CAN_DOI_SOAT",
                "Cổng thanh toán đã thu tiền nhưng đơn hàng không thể hoàn tất (" + lyDo
                        + "). Vé không được phát hành, khoản tiền sẽ được hoàn lại");
    }

    // ----------------------------------------------------------- Đơn tạm
    /**
     * TẠM THỜI - chỉ dùng khi giao diện 8/9 (đồ ăn, xác nhận đơn) của Châu chưa ghép:
     * tạo đơn CHO_THANH_TOAN chỉ gồm các ghế đang giữ, để vẫn chạy được luồng 7 -> 10 -> 11.
     * Khi module đơn hàng hoàn thiện, giao diện 9 tạo đơn và có thể xóa hàm này.
     */
    @Transactional
    public DonHangMoiDto taoDonTam(NguoiDung nd, String maPhienGiu) {
        if (nd.maKhachHang() == null) {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Chỉ khách hàng thành viên mới đặt vé trực tuyến");
        }
        giuGheService.kiemTraChuPhien(nd, maPhienGiu);
        giuGheService.giaiPhongGheQuaHan();
        List<GheSuatChieu> dsGhe = maPhienGiu == null ? List.of() : gheSuatRepo.findByMaPhienGiu(maPhienGiu);
        if (dsGhe.isEmpty()) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "HET_GIU_GHE", "Hết thời gian giữ ghế. Vui lòng chọn lại ghế");
        }
        DonHang don = new DonHang();
        do {
            don.setMaDonHang(SinhMa.ngauNhien("DH", 6));
        } while (donHangRepo.existsById(don.getMaDonHang()));
        don.setMaKhachHang(nd.maKhachHang());
        don.setNgayDat(ThoiGian.bayGio());
        don.setTongTien(tong(dsGhe.stream().map(GheSuatChieu::getGiaVe).toList()));
        don.setKenhBan(KenhBanVe.ONLINE);
        don.setTrangThai(TrangThaiDonHang.CHO_THANH_TOAN);
        don.setSoTienGiamTuKhuyenMai(BigDecimal.ZERO);
        don.setDiemSuDung(0);
        don.setSoTienGiamTuDiem(BigDecimal.ZERO);
        donHangRepo.save(don);
        return new DonHangMoiDto(don.getMaDonHang(), don.getTongTien());
    }

    // ----------------------------------------------------------- nội bộ
    /**
     * Kiểm tra đơn trước khi thu tiền / hoàn tất (UC5.5 luồng ngoại lệ 3a, 3b, 3c).
     * Trả danh sách ghế đang giữ của phiên (đã khóa dòng). Ném NghiepVuException nếu có điều kiện không hợp lệ.
     */
    private List<GheSuatChieu> kiemTraDieuKienThanhToan(DonHang don, String maPhienGiu, List<String> dsMaGheChot) {
        List<GheSuatChieu> dsGhe = maPhienGiu == null || maPhienGiu.isBlank() ? List.of()
                : gheSuatRepo.khoaTheoPhien(maPhienGiu);
        if (dsGhe.isEmpty()) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "HET_GIU_GHE", "Hết thời gian giữ ghế. Vui lòng chọn lại ghế");
        }
        if (dsMaGheChot == null || dsMaGheChot.isEmpty()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "THIEU_DS_GHE", "Thiếu danh sách ghế đã chốt của đơn hàng");
        }
        if (!khopDanhSachGhe(dsGhe, dsMaGheChot)) {       // đúng từng ghế đã chốt, không chỉ trùng tổng tiền
            throw new NghiepVuException(HttpStatus.CONFLICT, "DON_THAY_DOI",
                    "Danh sách ghế đang giữ không khớp với đơn hàng đã xác nhận, vui lòng kiểm tra lại đơn hàng");
        }
        SuatChieu suat = suatRepo.findById(dsGhe.get(0).getMaSuat()).orElseThrow();
        var phim = lienKet.layPhim(List.of(suat.getMaPhim())).get(suat.getMaPhim());
        if (!suat.conBanVe(ThoiGian.bayGio()) || phim == null || !phim.conBanVe()) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "SUAT_KHONG_KHA_DUNG", "Suất chiếu không khả dụng");
        }
        List<ChiTietDichVu> dsDichVu = dichVuRepo.findByMaDonHang(don.getMaDonHang());
        BigDecimal tienVe = tong(dsGhe.stream().map(GheSuatChieu::getGiaVe).toList());
        BigDecimal tienDichVu = tong(dsDichVu.stream().map(ChiTietDichVu::getThanhTien).toList());
        if (tongTienDuKien(don, tienVe, tienDichVu).compareTo(don.getTongTien()) != 0) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "DON_THAY_DOI",
                    "Thông tin đơn hàng đã thay đổi, vui lòng kiểm tra lại đơn hàng");
        }
        String loi = null;
        if (don.getMaKhuyenMai() != null) loi = lienKet.kiemTraKhuyenMai(don.getMaKhuyenMai());
        if (loi != null) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "UU_DAI_KHONG_HOP_LE", loi + ". Vui lòng điều chỉnh đơn hàng");
        }
        if (don.getDiemSuDung() > 0
                && (don.getMaKhachHang() == null || lienKet.diemHienCo(don.getMaKhachHang()) < don.getDiemSuDung())) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "DIEM_KHONG_HOP_LE",
                    "Số điểm sử dụng không còn hợp lệ. Vui lòng điều chỉnh đơn hàng");
        }
        loi = lienKet.kiemTraTonKho(lienKet.nhuCauTonKho(dsDichVu));
        if (loi != null) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "TON_KHO_KHONG_DU", loi + ". Vui lòng điều chỉnh đơn hàng");
        }
        return dsGhe;
    }

    private boolean khopDanhSachGhe(List<GheSuatChieu> dsGheGiu, List<String> dsMaGheChot) {
        Set<String> dangGiu = dsGheGiu.stream().map(GheSuatChieu::getMaGheSuat).collect(Collectors.toSet());
        return dangGiu.equals(new HashSet<>(dsMaGheChot));
    }

    /** Cổng đã thu tiền cho đơn này (có giao dịch THANH_TOAN thành công). */
    private boolean daThuTien(String maDonHang) {
        return thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(maDonHang).stream()
                .anyMatch(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN && t.getTrangThai() == TrangThaiThanhToan.THANH_CONG);
    }

    /** Tổng tiền đúng = vé + dịch vụ - giảm khuyến mãi - giảm điểm. */
    private BigDecimal tongTienDuKien(DonHang don, BigDecimal tienVe, BigDecimal tienDichVu) {
        return tienVe.add(tienDichVu).subtract(nz(don.getSoTienGiamTuKhuyenMai())).subtract(nz(don.getSoTienGiamTuDiem()));
    }

    private String tenPhim(String maPhim) {
        var phim = lienKet.layPhim(List.of(maPhim)).get(maPhim);
        return phim == null ? maPhim : phim.tenPhim();
    }

    private DonHang layDon(String maDonHang) {
        return donHangRepo.findById(maDonHang).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
    }

    private ThanhToan layThanhToanDangCho(String maDonHang) {
        return thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(maDonHang).stream()
                .filter(t -> t.getLoaiGiaoDich() == LoaiGiaoDich.THANH_TOAN
                        && t.getTrangThai() == TrangThaiThanhToan.CHO_XU_LY)
                .findFirst().orElse(null);
    }

    private PhuongThucThanhToan parsePhuongThuc(String ma) {
        try {
            return PhuongThucThanhToan.valueOf(ma);
        } catch (RuntimeException e) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng chọn phương thức thanh toán");
        }
    }

    private ThanhToanDto chuyenDto(ThanhToan t) {
        return new ThanhToanDto(t.getMaThanhToan(), t.getMaDonHang(), t.getPhuongThuc().name(), t.getSoTien(),
                t.getLoaiGiaoDich().name(), t.getTrangThai().name(), t.getMaGiaoDichDoiTac(), t.getThoiGianGiaoDich());
    }

    private BigDecimal tong(List<BigDecimal> ds) {
        return ds.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
