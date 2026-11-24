package com.cinema.service;

import com.cinema.dto.DonHangMoiDto;
import com.cinema.dto.PhienGiuDto;
import com.cinema.dto.SuatChieuDto;
import com.cinema.dto.XacNhanDonRequest;
import com.cinema.entity.ChiTietDichVu;
import com.cinema.entity.DonHang;
import com.cinema.enums.KenhBanVe;
import com.cinema.enums.TrangThaiDonHang;
import com.cinema.enums.TrangThaiThanhToan;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.*;
import com.cinema.util.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonDatVeService {
    private final JdbcTemplate jdbc;
    private final GiuGheService giuGhe;
    private final SuatChieuRepository suatRepo;
    private final SuatChieuService suatService;
    private final DonHangRepository donRepo;
    private final ChiTietDichVuRepository dichVuRepo;
    private final ThanhToanRepository thanhToanRepo;
    private final LienKetModuleKhac lienKet;
    private final CauHinhRap cauHinh;

    public DonDatVeService(JdbcTemplate jdbc, GiuGheService giuGhe, SuatChieuRepository suatRepo,
                          SuatChieuService suatService, DonHangRepository donRepo, ChiTietDichVuRepository dichVuRepo,
                          ThanhToanRepository thanhToanRepo, LienKetModuleKhac lienKet, CauHinhRap cauHinh) {
        this.jdbc = jdbc;
        this.giuGhe = giuGhe;
        this.suatRepo = suatRepo;
        this.suatService = suatService;
        this.donRepo = donRepo;
        this.dichVuRepo = dichVuRepo;
        this.thanhToanRepo = thanhToanRepo;
        this.lienKet = lienKet;
        this.cauHinh = cauHinh;
    }

    public record Mon(String ma, String ten, String loai, BigDecimal gia, String moTa, String hinhAnh, int khaDung) {}
    public record Dong(Mon mon, int soLuong, BigDecimal thanhTien) {}
    public record ThanhVien(String hoTen, int diem) {}
    public record UuDai(String ma, String ten, int uuTien, BigDecimal soTienGiam) {}
    public record BaoGia(PhienGiuDto phien, SuatChieuDto suat, ThanhVien thanhVien, List<Dong> dichVu,
                         BigDecimal tienDoAn, List<UuDai> dongHang, UuDai khuyenMai,
                         int diemDung, long dongMoiDiem, BigDecimal giamDiem, BigDecimal tongTien) {}

    public List<Mon> danhMuc() {
        return jdbc.query("""
                SELECT maSanPham AS ma, tenSanPham AS ten, loaiSanPham AS loai, giaBan AS gia,
                       moTa, hinhAnh, soLuongTon AS khaDung
                FROM SANPHAM WHERE trangThai = 'DANG_BAN'
                UNION ALL
                SELECT c.maCombo, c.tenCombo, 'COMBO', c.giaCombo, c.moTa, c.hinhAnh,
                       COALESCE((SELECT MIN(CASE WHEN s.trangThai = 'DANG_BAN'
                           THEN FLOOR(s.soLuongTon / ct.soLuong) ELSE 0 END)
                           FROM CHITIETCOMBO ct JOIN SANPHAM s ON s.maSanPham = ct.maSanPham
                           WHERE ct.maCombo = c.maCombo), 0)
                FROM COMBO c WHERE c.trangThai = 'DANG_BAN'
                ORDER BY loai, ten
                """, (rs, i) -> new Mon(rs.getString("ma"), rs.getString("ten"), rs.getString("loai"),
                rs.getBigDecimal("gia"), rs.getString("moTa"), rs.getString("hinhAnh"), rs.getInt("khaDung")));
    }

    @Transactional
    public BaoGia tamTinh(NguoiDung khach, XacNhanDonRequest req) {
        return tinhGia(khach, req);
    }

    @Transactional
    public DonHangMoiDto xacNhan(NguoiDung khach, XacNhanDonRequest req, String maDonCu) {
        DonHang don = maDonCu == null ? new DonHang() : donRepo.khoaTheoMa(maDonCu).orElseThrow();
        if (maDonCu != null && (don.getTrangThai() != TrangThaiDonHang.CHO_THANH_TOAN
                || thanhToanRepo.findByMaDonHangOrderByThoiGianGiaoDichDesc(maDonCu).stream()
                        .anyMatch(tt -> tt.getTrangThai() == TrangThaiThanhToan.CHO_XU_LY))) {
            throw loi("Đơn đã được gửi thanh toán. Vui lòng tiếp tục tại màn hình thanh toán.");
        }

        BaoGia gia = tinhGia(khach, req);
        if (!gia.dongHang().isEmpty()) throw loi("Vui lòng chọn một chương trình khuyến mãi.");
        if (req.tongTienDaXem() == null || req.tongTienDaXem().compareTo(gia.tongTien()) != 0) {
            throw loi("Tổng tiền đã thay đổi. Vui lòng xem lại và xác nhận đơn.");
        }

        if (maDonCu == null) {
            don.setMaDonHang(SinhMa.ngauNhien("DH", 6));
            don.setMaKhachHang(khach.maKhachHang());
            don.setNgayDat(ThoiGian.bayGio());
            don.setKenhBan(KenhBanVe.ONLINE);
            don.setTrangThai(TrangThaiDonHang.CHO_THANH_TOAN);
        }
        don.setMaKhuyenMai(gia.khuyenMai() == null ? null : gia.khuyenMai().ma());
        don.setSoTienGiamTuKhuyenMai(gia.khuyenMai() == null ? BigDecimal.ZERO : gia.khuyenMai().soTienGiam());
        don.setDiemSuDung(gia.diemDung());
        don.setSoTienGiamTuDiem(gia.giamDiem());
        don.setTongTien(gia.tongTien());
        donRepo.save(don);
        if (maDonCu != null) dichVuRepo.deleteAll(dichVuRepo.findByMaDonHang(maDonCu));
        dichVuRepo.saveAll(gia.dichVu().stream().map(dong -> taoChiTiet(dong, don.getMaDonHang())).toList());
        return new DonHangMoiDto(don.getMaDonHang(), don.getTongTien());
    }

    private BaoGia tinhGia(NguoiDung khach, XacNhanDonRequest req) {
        PhienGiuDto phien = giuGhe.xemPhien(req.maPhienGiu());
        if (phien.soGiayConLai() <= 0 || phien.dsGhe().isEmpty()) throw loi("Hết thời gian giữ ghế.");
        SuatChieuDto suat = suatRepo.findById(phien.maSuat()).map(suatService::chuyenDto)
                .filter(SuatChieuDto::conBanVe).orElseThrow(() -> loi("Suất chiếu không khả dụng."));
        ThanhVien tv = jdbc.query("""
                SELECT k.hoTen, k.diemTichLuy FROM KHACHHANG k
                JOIN TAIKHOAN t ON t.maTaiKhoan = k.maTaiKhoan
                WHERE k.maKhachHang = ? AND t.trangThai = 'HOAT_DONG'
                """, (rs, i) -> new ThanhVien(rs.getString(1), rs.getInt(2)), khach.maKhachHang())
                .stream().findFirst().orElseThrow(() -> loi("Tài khoản không đủ điều kiện sử dụng quyền lợi thành viên."));

        List<Dong> dichVu = tinhDichVu(req.dichVu());
        BigDecimal tienDoAn = dichVu.stream().map(Dong::thanhTien).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tienVe = phien.tamTinh();
        List<UuDai> uuDai = timUuDai(req.maKhuyenMai(), tienVe, tienDoAn);
        UuDai khuyenMai = uuDai.size() == 1 ? uuDai.getFirst() : uuDai.stream()
                .filter(km -> km.ma().equals(req.khuyenMaiChon())).findFirst().orElse(null);
        List<UuDai> dongHang = khuyenMai == null ? uuDai : List.of();
        BigDecimal sauKhuyenMai = tienVe.add(tienDoAn)
                .subtract(khuyenMai == null ? BigDecimal.ZERO : khuyenMai.soTienGiam());

        int diem = req.diem() == null ? 0 : req.diem();
        BigDecimal giamDiem = BigDecimal.valueOf(cauHinh.dongMoiDiemDoi).multiply(BigDecimal.valueOf(diem));
        if (diem < 0 || diem > tv.diem() || giamDiem.compareTo(sauKhuyenMai) > 0) {
            throw loi("Số điểm quy đổi vượt số dư khả dụng hoặc giá trị còn lại của đơn.");
        }
        return new BaoGia(phien, suat, tv, dichVu, tienDoAn, dongHang, khuyenMai,
                diem, cauHinh.dongMoiDiemDoi, giamDiem, sauKhuyenMai.subtract(giamDiem));
    }

    private List<Dong> tinhDichVu(List<XacNhanDonRequest.MonChon> luaChon) {
        if (luaChon == null || luaChon.isEmpty()) return List.of();
        var danhMuc = danhMuc().stream().collect(Collectors.toMap(Mon::ma, Function.identity()));
        var daChon = new HashSet<String>();
        List<Dong> dichVu = new ArrayList<>();
        for (var chon : luaChon) {
            if (chon == null || chon.soLuong() == null || chon.soLuong() <= 0 || !daChon.add(chon.ma())) {
                throw loi("Mỗi món cần một số lượng nguyên dương.");
            }
            Mon mon = danhMuc.get(chon.ma());
            if (mon == null) throw loi("Sản phẩm hoặc combo đã ngừng bán. Vui lòng tải lại danh mục.");
            if (chon.soLuong() > mon.khaDung()) throw loi("Số lượng sản phẩm không đủ đáp ứng.");
            dichVu.add(new Dong(mon, chon.soLuong(), mon.gia().multiply(BigDecimal.valueOf(chon.soLuong()))));
        }
        String loiTon = lienKet.kiemTraTonKho(lienKet.nhuCauTonKho(
                dichVu.stream().map(dong -> taoChiTiet(dong, null)).toList()));
        if (loiTon != null) throw loi(loiTon);
        return dichVu;
    }

    private List<UuDai> timUuDai(List<String> ma, BigDecimal tienVe, BigDecimal tienDoAn) {
        if (ma == null || ma.isEmpty()) return List.of();
        List<UuDai> hopLe = new ArrayList<>();
        String lyDo = "Không có khuyến mãi đủ điều kiện.";
        BigDecimal tong = tienVe.add(tienDoAn);
        Date ngay = Date.valueOf(ThoiGian.bayGio().toLocalDate());

        for (String code : new LinkedHashSet<>(ma)) {
            String tinhTrang = lienKet.kiemTraKhuyenMai(code);
            if (tinhTrang != null) {
                lyDo = tinhTrang;
                continue;
            }
            var khuyenMai = jdbc.query("""
                    SELECT tenChuongTrinh, mucUuTien, phamViApDung, mucGiam, hinhThucGiam
                    FROM KHUYENMAI WHERE maKhuyenMai = ? AND kenhBan IN ('TRUC_TUYEN', 'TAT_CA')
                    AND doiTuongApDung IN ('THANH_VIEN', 'TAT_CA') AND giaTriDonToiThieu <= ?
                    AND ? BETWEEN ngayBatDau AND ngayKetThuc AND trangThai = 'DANG_AP_DUNG'
                    AND soLuotDaSuDung < gioiHanLuotSuDung
                    """, (rs, i) -> {
                BigDecimal phamVi = switch (rs.getString("phamViApDung")) {
                    case "VE" -> tienVe;
                    case "DO_AN_THUC_UONG" -> tienDoAn;
                    default -> tong;
                };
                BigDecimal muc = rs.getBigDecimal("mucGiam");
                BigDecimal giam = "THEO_PHAN_TRAM".equals(rs.getString("hinhThucGiam"))
                        ? phamVi.multiply(muc).movePointLeft(2).setScale(2, RoundingMode.HALF_UP) : muc;
                return new UuDai(code, rs.getString("tenChuongTrinh"), rs.getInt("mucUuTien"), giam.min(phamVi));
            }, code, tong, ngay).stream().filter(km -> km.soTienGiam().signum() > 0).toList();

            if (khuyenMai.isEmpty()) lyDo = "Đơn chưa đáp ứng giá trị tối thiểu, kênh, đối tượng hoặc phạm vi ưu đãi.";
            hopLe.addAll(khuyenMai);
        }
        if (hopLe.isEmpty()) throw loi(lyDo);
        int caoNhat = hopLe.stream().mapToInt(UuDai::uuTien).max().orElseThrow();
        return hopLe.stream().filter(km -> km.uuTien() == caoNhat).toList();
    }

    private ChiTietDichVu taoChiTiet(Dong dong, String maDon) {
        var ct = new ChiTietDichVu();
        if (maDon != null) ct.setMaChiTietDV(SinhMa.ngauNhien("DV", 10));
        ct.setMaDonHang(maDon);
        if ("COMBO".equals(dong.mon().loai())) ct.setMaCombo(dong.mon().ma());
        else ct.setMaSanPham(dong.mon().ma());
        ct.setSoLuong(dong.soLuong());
        ct.setDonGia(dong.mon().gia());
        ct.setThanhTien(dong.thanhTien());
        return ct;
    }

    private NghiepVuException loi(String thongBao) {
        return new NghiepVuException(HttpStatus.CONFLICT, thongBao);
    }
}
