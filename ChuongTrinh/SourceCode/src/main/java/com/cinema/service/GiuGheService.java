package com.cinema.service;

import com.cinema.dto.GiuGheRequest;
import com.cinema.dto.PhienGiuDto;
import com.cinema.dto.SoDoGheDto;
import com.cinema.entity.Ghe;
import com.cinema.entity.GheSuatChieu;
import com.cinema.entity.PhongChieu;
import com.cinema.entity.SuatChieu;
import com.cinema.enums.TrangThaiGheSuat;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.GheRepository;
import com.cinema.repository.GheSuatChieuRepository;
import com.cinema.repository.PhongChieuRepository;
import com.cinema.repository.SuatChieuRepository;
import com.cinema.util.CauHinhRap;
import com.cinema.util.NguoiDung;
import com.cinema.util.SinhMa;
import com.cinema.util.ThoiGian;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UC5.1 (xem sơ đồ ghế) và UC5.2 (giữ ghế tạm thời).
 * Quy tắc: mỗi ghế chỉ được giữ bởi một phiên tại một thời điểm; thời hạn giữ ghế tính từ lúc giữ ghế
 * đầu tiên của phiên và không kéo dài khi chọn thêm ghế.
 */
@Service
public class GiuGheService {

    private final GheSuatChieuRepository gheSuatRepo;
    private final GheRepository gheRepo;
    private final SuatChieuRepository suatRepo;
    private final PhongChieuRepository phongRepo;
    private final SuatChieuService suatChieuService;
    private final CauHinhRap cauHinh;

    public GiuGheService(GheSuatChieuRepository gheSuatRepo, GheRepository gheRepo, SuatChieuRepository suatRepo,
                         PhongChieuRepository phongRepo, SuatChieuService suatChieuService, CauHinhRap cauHinh) {
        this.gheSuatRepo = gheSuatRepo;
        this.gheRepo = gheRepo;
        this.suatRepo = suatRepo;
        this.phongRepo = phongRepo;
        this.suatChieuService = suatChieuService;
        this.cauHinh = cauHinh;
    }

    // ------------------------------------------------------------------ UC5.1
    /** Sơ đồ ghế kèm trạng thái từng ghế; maPhienGiu (nếu có) để đánh dấu ghế của chính người đang chọn. */
    @Transactional
    public SoDoGheDto xemSoDoGhe(String maSuat, String maPhienGiu) {
        giaiPhongGheQuaHan();
        SuatChieu suat = laySuat(maSuat);
        PhongChieu phong = layPhong(suat);
        Map<String, Ghe> gheTheoMa = gheRepo.findByMaPhong(phong.getMaPhong()).stream()
                .collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));

        List<SoDoGheDto.Ghe> dsGhe = gheSuatRepo.findByMaSuat(maSuat).stream()
                .filter(gs -> gheTheoMa.containsKey(gs.getMaGhe()))
                .map(gs -> {
                    Ghe ghe = gheTheoMa.get(gs.getMaGhe());
                    String trangThai = ghe.dungDuoc() ? gs.getTrangThai().name() : "BAO_TRI";
                    return new SoDoGheDto.Ghe(gs.getMaGheSuat(), ghe.getMaGhe(), ghe.getTenGhe(), ghe.layHang(),
                            ghe.layCot(), ghe.getLoaiGhe().name(), gs.getGiaVe(), trangThai, gs.thuocPhien(maPhienGiu));
                })
                .sorted(Comparator.comparing(SoDoGheDto.Ghe::hang).thenComparingInt(SoDoGheDto.Ghe::cot))
                .toList();

        var suatDto = suatChieuService.chuyenDto(suat);
        String thongBao = suatDto.conBanVe() ? null : "Suất chiếu không khả dụng";
        return new SoDoGheDto(suatDto, phong.getTongSoHang(), phong.getTongSoCot(),
                cauHinh.soGheToiDa, cauHinh.soPhutGiuGhe, thongBao, dsGhe);
    }

    // ------------------------------------------------------------------ UC5.2
    /** Giữ thêm ghế cho một phiên (tạo phiên mới nếu chưa có). Tất cả ghế được giữ hoặc không ghế nào được giữ. */
    @Transactional
    public PhienGiuDto giuGhe(NguoiDung nd, GiuGheRequest req) {
        if (req.maSuat() == null || req.dsMaGheSuat() == null || req.dsMaGheSuat().isEmpty()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một ghế");
        }
        giaiPhongGheQuaHan();
        SuatChieu suat = laySuat(req.maSuat());
        PhongChieu phong = layPhong(suat);
        if (!suat.conBanVe(ThoiGian.bayGio()) || !phong.dangHoatDong()
                || !suatChieuService.phimConBanVe(suat.getMaPhim())) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "SUAT_KHONG_KHA_DUNG", "Suất chiếu không khả dụng");
        }

        boolean phienMoi = req.maPhienGiu() == null || req.maPhienGiu().isBlank();
        if (phienMoi && nd.maChuPhien() == null) {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Tài khoản chưa gắn với khách hàng hoặc nhân viên");
        }
        if (!phienMoi) kiemTraChuPhien(nd, req.maPhienGiu());
        // Mã phiên mang mã chủ phiên ("KH01-ab12cd34ef") để mọi bước sau kiểm tra được phiên thuộc đúng người dùng.
        String maPhien = phienMoi ? nd.maChuPhien() + "-" + SinhMa.ngauNhien("", 10) : req.maPhienGiu();
        List<GheSuatChieu> daGiu = gheSuatRepo.khoaTheoPhien(maPhien);
        if (daGiu.stream().anyMatch(g -> !g.getMaSuat().equals(suat.getMaSuat()))) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "PHIEN_KHAC_SUAT",
                    "Phiên giữ ghế đang thuộc một suất chiếu khác");
        }

        Set<String> maMoi = new LinkedHashSet<>(req.dsMaGheSuat());
        daGiu.forEach(g -> maMoi.remove(g.getMaGheSuat()));
        if (daGiu.size() + maMoi.size() > cauHinh.soGheToiDa) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "VUOT_SO_GHE_TOI_DA",
                    "Chỉ được chọn tối đa " + cauHinh.soGheToiDa + " ghế cho mỗi giao dịch");
        }

        if (!maMoi.isEmpty()) {
            LocalDateTime thoiGianGiu = daGiu.isEmpty() ? ThoiGian.bayGio() : daGiu.get(0).getThoiGianGiu();
            List<GheSuatChieu> dsMoi = gheSuatRepo.khoaTheoMa(maMoi);
            Map<String, Ghe> gheTheoMa = gheRepo.findByMaGheIn(dsMoi.stream().map(GheSuatChieu::getMaGhe).toList())
                    .stream().collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));
            if (dsMoi.size() != maMoi.size()) {
                throw new NghiepVuException(HttpStatus.NOT_FOUND, "Ghế được chọn không tồn tại");
            }
            for (GheSuatChieu gs : dsMoi) {
                Ghe ghe = gheTheoMa.get(gs.getMaGhe());
                boolean giuDuoc = gs.getMaSuat().equals(suat.getMaSuat())
                        && ghe != null && ghe.dungDuoc()
                        && gs.khoaGiuGhe(maPhien, thoiGianGiu);
                if (!giuDuoc) {
                    throw new NghiepVuException(HttpStatus.CONFLICT, "GHE_KHONG_KHA_DUNG",
                            "Ghế đã có người chọn, vui lòng chọn ghế khác");
                }
            }
            gheSuatRepo.saveAll(dsMoi);
        }
        return taoPhienDto(maPhien, suat.getMaSuat(), gheSuatRepo.findByMaPhienGiu(maPhien));
    }

    /** Bỏ giữ một ghế của phiên. Trả lại trạng thái phiên sau khi bỏ. */
    @Transactional
    public PhienGiuDto boGiuGhe(NguoiDung nd, String maPhien, String maGheSuat) {
        kiemTraChuPhien(nd, maPhien);
        List<GheSuatChieu> ds = gheSuatRepo.khoaTheoMa(List.of(maGheSuat));
        if (ds.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Ghế được chọn không tồn tại");
        }
        GheSuatChieu gs = ds.get(0);
        if (!gs.thuocPhien(maPhien)) {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Bạn chỉ được bỏ giữ ghế thuộc phiên giao dịch của mình");
        }
        gs.giaiPhongGhe();
        gheSuatRepo.save(gs);
        return taoPhienDto(maPhien, gs.getMaSuat(), gheSuatRepo.findByMaPhienGiu(maPhien));
    }

    /** Hủy cả phiên: giải phóng mọi ghế đang giữ của phiên (khách bấm hủy hoặc rời khỏi giao dịch). */
    @Transactional
    public void huyPhien(NguoiDung nd, String maPhien) {
        kiemTraChuPhien(nd, maPhien);
        giaiPhongTheoPhien(maPhien);
    }

    /** Phiên giữ ghế chỉ được thao tác bởi chính người đã tạo ra nó (mã phiên bắt đầu bằng mã chủ phiên). */
    public void kiemTraChuPhien(NguoiDung nd, String maPhien) {
        String chu = nd.maChuPhien();
        if (maPhien == null || chu == null || !maPhien.startsWith(chu + "-")) {
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "PHIEN_KHONG_THUOC_BAN",
                    "Phiên giữ ghế không thuộc về tài khoản của bạn");
        }
    }

    /** Giải phóng mọi ghế đang giữ của phiên; dùng được từ service khác trong cùng giao dịch CSDL. */
    public void giaiPhongTheoPhien(String maPhien) {
        List<GheSuatChieu> ds = gheSuatRepo.khoaTheoPhien(maPhien);
        ds.forEach(GheSuatChieu::giaiPhongGhe);
        gheSuatRepo.saveAll(ds);
    }

    /** Xem trạng thái phiên (khách tải lại trang hoặc quay lại từ bước sau). */
    @Transactional
    public PhienGiuDto xemPhien(NguoiDung nd, String maPhien) {
        kiemTraChuPhien(nd, maPhien);
        giaiPhongGheQuaHan();
        List<GheSuatChieu> ds = gheSuatRepo.findByMaPhienGiu(maPhien);
        if (ds.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "HET_GIU_GHE",
                    "Hết thời gian giữ ghế. Vui lòng chọn lại ghế");
        }
        return taoPhienDto(maPhien, ds.get(0).getMaSuat(), ds);
    }

    /** Giải phóng các ghế giữ quá hạn (thoiGianGiu + số phút giữ ghế đã qua). Trả số ghế được giải phóng. */
    @Transactional
    public int giaiPhongGheQuaHan() {
        LocalDateTime han = ThoiGian.bayGio().minusMinutes(cauHinh.soPhutGiuGhe);
        return gheSuatRepo.giaiPhongQuaHan(TrangThaiGheSuat.TRONG, TrangThaiGheSuat.DANG_GIU, han);
    }

    /** Số giây còn lại của phiên, tính từ thời điểm giữ sớm nhất; 0 nếu đã hết hạn hoặc không có ghế. */
    public long soGiayConLai(Collection<GheSuatChieu> dsGheGiu) {
        return dsGheGiu.stream().map(GheSuatChieu::getThoiGianGiu).min(Comparator.naturalOrder())
                .map(t -> Math.max(0, Duration.between(ThoiGian.bayGio(), t.plusMinutes(cauHinh.soPhutGiuGhe)).getSeconds()))
                .orElse(0L);
    }

    // ------------------------------------------------------------ nội bộ
    private PhienGiuDto taoPhienDto(String maPhien, String maSuat, List<GheSuatChieu> dsGheGiu) {
        Map<String, Ghe> gheTheoMa = gheRepo.findByMaGheIn(dsGheGiu.stream().map(GheSuatChieu::getMaGhe).toList())
                .stream().collect(Collectors.toMap(Ghe::getMaGhe, Function.identity()));
        List<PhienGiuDto.GheGiu> dsGhe = dsGheGiu.stream()
                .map(gs -> gheTheoMa.get(gs.getMaGhe()) == null ? null : new PhienGiuDto.GheGiu(gs.getMaGheSuat(), gs.getMaGhe(),
                        gheTheoMa.get(gs.getMaGhe()).getTenGhe(), gheTheoMa.get(gs.getMaGhe()).getLoaiGhe().name(), gs.getGiaVe()))
                .filter(g -> g != null)
                .sorted(Comparator.comparing(PhienGiuDto.GheGiu::tenGhe))
                .toList();
        BigDecimal tamTinh = dsGhe.stream().map(PhienGiuDto.GheGiu::giaVe).reduce(BigDecimal.ZERO, BigDecimal::add);
        long giay = soGiayConLai(dsGheGiu);
        LocalDateTime hetHan = ThoiGian.bayGio().plusSeconds(giay);
        return new PhienGiuDto(maPhien, maSuat, hetHan, giay, cauHinh.soGheToiDa, tamTinh, dsGhe);
    }

    private SuatChieu laySuat(String maSuat) {
        return suatRepo.findById(maSuat).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy suất chiếu"));
    }

    private PhongChieu layPhong(SuatChieu suat) {
        return phongRepo.findById(suat.getMaPhong()).orElseThrow(() ->
                new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chiếu của suất"));
    }
}
