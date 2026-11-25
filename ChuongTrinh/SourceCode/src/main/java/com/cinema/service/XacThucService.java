package com.cinema.service;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.TaiKhoanTraCuuRepository;
import com.cinema.repository.TaiKhoanTraCuuRepository.TaiKhoan;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.http.HttpSessionBindingListener;
import jakarta.servlet.http.HttpSessionBindingEvent;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DuplicateKeyException;

@Service
public class XacThucService {
    private final TaiKhoanTraCuuRepository repo;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
    private final String hashGia = new BCryptPasswordEncoder(12).encode(java.util.UUID.randomUUID().toString());
    public XacThucService(TaiKhoanTraCuuRepository repo) { this.repo = repo; }

    // Không trả matKhauHash cho trình duyệt.
    public record ThongTin(String maTaiKhoan, String tenDangNhap, String email, String hoTen,
                           String vaiTro, String maKhachHang, String maNhanVien, String soDienThoai, Integer diemTichLuy) {}

    public synchronized ThongTin dangNhap(String taiKhoan, String matKhau, HttpServletRequest request) {
        if (taiKhoan == null || taiKhoan.isBlank() || taiKhoan.length() > 255 ||
                matKhau == null || matKhau.isEmpty() || matKhau.getBytes(StandardCharsets.UTF_8).length > 72 || matKhau.indexOf(0) >= 0) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu hợp lệ.");
        }
        TaiKhoan tk = repo.timTaiKhoan(taiKhoan.trim());
        boolean dung = matKhauKhop(matKhau, tk == null ? hashGia : tk.matKhauHash());
        if (tk == null || !dung)
            throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác.");
        if (!"HOAT_DONG".equals(tk.trangThai()))
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa.");
        VaiTro.valueOf(tk.vaiTro());
        // Hủy session cũ để tránh session fixation; giữ đúng hợp đồng PhienDangNhap của nhóm.
        HttpSession cu = request.getSession(false);
        if (cu != null) huyPhien(cu);
        HttpSession session = request.getSession(true);
        session.setAttribute("maTaiKhoan", tk.maTaiKhoan());
        session.setAttribute("vaiTro", tk.vaiTro());
        session.setAttribute("maKhachHang", tk.maKhachHang());
        session.setAttribute("maNhanVien", tk.maNhanVien());
        session.setMaxInactiveInterval(30 * 60);
        session.setAttribute("cinema.auth.hash", tk.matKhauHash());
        theoDoiPhien(tk.maTaiKhoan(), session);
        return thongTin(tk);
    }
    public ThongTin hienTai(HttpSession session, VaiTro... duocPhep) {
        return thongTin(taiKhoanHienTai(session, duocPhep));
    }

    private TaiKhoan taiKhoanHienTai(HttpSession session, VaiTro... duocPhep) {
        try {
            String ma = session == null ? null : (String) session.getAttribute("maTaiKhoan");
            TaiKhoan tk = ma == null ? null : repo.theoMa(ma);
            if (tk == null || !"HOAT_DONG".equals(tk.trangThai()) || !tk.vaiTro().equals(session.getAttribute("vaiTro"))
                    || !Objects.equals(tk.matKhauHash(), session.getAttribute("cinema.auth.hash"))) {
                if (session != null) huyPhien(session);
                throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục.");
            }
            if (duocPhep.length > 0 && Arrays.stream(duocPhep).noneMatch(v -> v.name().equals(tk.vaiTro())))
                throw new NghiepVuException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập chức năng này.");
            return tk;
        } catch (IllegalStateException e) {
            throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục.");
        }
    }
    public void kiemTraSoDienThoai(String so, HttpSession session, boolean hoSo) {
        String ma = hoSo ? hienTai(session).maTaiKhoan() : "";
        kiemTraDienThoai(so, ma);
    }

    private void kiemTraDienThoai(String so, String ma) {
        if (so == null || so.isBlank()) return;
        so = so.trim();
        if (!so.matches("0[0-9]{9}"))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.");
        if (repo.trungSoDienThoai(so, ma))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng.");
    }
    // Kiểm tra thông tin đăng ký và tài khoản nhân viên.
    public void kiemTraDangKy(String email, String ten, String so) {
        if (email == null || email.length() > 255 || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Email không hợp lệ.");
        if (ten == null || !ten.matches("[a-zA-Z0-9._]{3,32}"))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Tên đăng nhập không hợp lệ.");
        if (repo.trungEmail(email))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
        if (repo.trungTen(ten))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Tên đăng nhập đã được sử dụng.");
        kiemTraSoDienThoai(so, null, false);
    }
    private boolean matKhauKhop(String matKhau, String hash) {
        if (matKhau == null || matKhau.isEmpty() || matKhau.indexOf(0) >= 0
                || matKhau.getBytes(StandardCharsets.UTF_8).length > 72) return false;
        try { return bcrypt.matches(matKhau, hash); }
        catch (IllegalArgumentException e) { return false; }
    }

    public void kiemTraMatKhau(String matKhau, HttpSession session) {
        TaiKhoan tk = taiKhoanHienTai(session);
        if (!matKhauKhop(matKhau, tk.matKhauHash()))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
    }
    public synchronized void doiMatKhau(String hienTai, String matKhauMoi, String xacNhan, HttpSession session) {
        TaiKhoan tk = taiKhoanHienTai(session);
        if (hienTai == null || hienTai.isEmpty())
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mật khẩu hiện tại.");
        kiemTraMatKhauMoi(matKhauMoi, xacNhan, true);
        if (!matKhauKhop(hienTai, tk.matKhauHash()))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
        if (bcrypt.matches(matKhauMoi, tk.matKhauHash()))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu hiện tại.");
        String hashMoi = bcrypt.encode(matKhauMoi);
        if (!repo.doiMatKhau(tk.maTaiKhoan(), tk.vaiTro(), tk.matKhauHash(), hashMoi))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Thông tin tài khoản vừa thay đổi. Vui lòng đăng nhập lại trước khi đổi mật khẩu.");
        huyTatCaPhien(tk.maTaiKhoan());
    }
    private void kiemTraHoTen(String hoTen) {
        if (hoTen.isBlank() || hoTen.codePointCount(0, hoTen.length()) > 100)
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập họ và tên, tối đa 100 ký tự.");
    }

    // Giữ nguyên schema: số điện thoại tạm thời bắt buộc (C01).
    @Transactional
    public void dangKy(String hoTen, String email, String so, String ten, String matKhau,
                       String xacNhan, boolean noiBo, HttpSession session) {
        if (noiBo) hienTai(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        hoTen = hoTen == null ? "" : hoTen.trim();
        email = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        so = so == null ? "" : so.trim();
        kiemTraHoTen(hoTen);
        if (so.isEmpty())
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập số điện thoại.");
        kiemTraDangKy(email, ten, so);
        kiemTraMatKhauMoi(matKhau, xacNhan, false);
        String maTaiKhoan = maMoi("TK"), maKhachHang = maMoi("KH");
        String hash = bcrypt.encode(matKhau);
        try {
            repo.taoTaiKhoanKhachHang(maTaiKhoan, ten, email, hash);
            repo.taoHoSoKhachHang(maKhachHang, maTaiKhoan, hoTen, so);
        } catch (DuplicateKeyException e) {
            // Ném lỗi để rollback cả hai thao tác, kể cả khi hai người đăng ký cùng lúc.
            throw new NghiepVuException(HttpStatus.CONFLICT,
                    "Thông tin đăng ký đã được sử dụng hoặc bị trùng. Vui lòng kiểm tra và thử lại.");
        }
    }
    // Theo dõi phiên thật trong một tiến trình Spring Boot, không sửa PhienDangNhap của nhóm.
    private record Phien(String maTaiKhoan, HttpSession session) {}
    private final ConcurrentHashMap<String, Phien> cacPhien = new ConcurrentHashMap<>();
    private void theoDoiPhien(String ma, HttpSession session) {
        String id = session.getId();
        Phien phien = new Phien(ma, session);
        cacPhien.put(id, phien);
        session.setAttribute("cinema.auth.binding", new HttpSessionBindingListener() {
            @Override public void valueUnbound(HttpSessionBindingEvent e) { cacPhien.remove(id, phien); }
        });
    }
    private void huyPhien(HttpSession session) {
        try { session.invalidate(); } catch (IllegalStateException ignored) { }
    }
    private final ConcurrentHashMap<String, String> cacPhienBan = new ConcurrentHashMap<>();
    public String phienBan(String ma) { return cacPhienBan.getOrDefault(ma, "0"); }
    private void huyTatCaPhien(String ma) {
        cacPhienBan.put(ma, java.util.UUID.randomUUID().toString());
        cacPhien.values().stream().filter(p -> p.maTaiKhoan().equals(ma))
                .toList().forEach(p -> huyPhien(p.session()));
    }
    public static void kiemTraMatKhauMoi(String matKhau, String xacNhan, boolean moi) {
        String ten = moi ? "Mật khẩu mới" : "Mật khẩu";
        String nhap = moi ? "mật khẩu mới" : "mật khẩu";
        if (matKhau == null || matKhau.isEmpty()) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập " + nhap + ".");
        if (matKhau.isBlank()) throw new NghiepVuException(HttpStatus.BAD_REQUEST, ten + " không được chỉ chứa khoảng trắng.");
        if (matKhau.indexOf(0) >= 0) throw new NghiepVuException(HttpStatus.BAD_REQUEST, ten + " chứa ký tự không hợp lệ.");
        if (matKhau.codePointCount(0, matKhau.length()) < 8) throw new NghiepVuException(HttpStatus.BAD_REQUEST, ten + " phải có ít nhất 8 ký tự.");
        if (matKhau.getBytes(StandardCharsets.UTF_8).length > 72) throw new NghiepVuException(HttpStatus.BAD_REQUEST, ten + " quá dài. Vui lòng nhập mật khẩu ngắn hơn.");
        if (xacNhan == null || xacNhan.isEmpty()) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lại " + nhap + ".");
        if (!matKhau.equals(xacNhan)) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu nhập lại không khớp với " + nhap + ".");
    }
    @Transactional
    public ThongTin capNhatHoSo(String hoTen, String so, HttpSession session) {
        TaiKhoan tk = taiKhoanHienTai(session);
        if (tk.maKhachHang() == null && tk.maNhanVien() == null)
            throw new NghiepVuException(HttpStatus.CONFLICT, "Tài khoản chưa có hồ sơ cá nhân để cập nhật.");
        hoTen = hoTen == null ? "" : hoTen.trim();
        so = so == null ? "" : so.trim();
        kiemTraHoTen(hoTen);
        if (so.isEmpty()) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập số điện thoại.");
        kiemTraDienThoai(so, tk.maTaiKhoan());
        try {
            if (!Objects.equals(hoTen, tk.hoTen()) || !Objects.equals(so, tk.soDienThoai())) {
                if (!repo.capNhatHoSo(tk, hoTen, so)) throw new NghiepVuException(HttpStatus.CONFLICT, "Hồ sơ vừa thay đổi. Vui lòng tải lại trang.");
            }
        } catch (DuplicateKeyException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng.");
        }
        return thongTin(repo.theoMa(tk.maTaiKhoan()));
    }
    private TaiKhoan taiKhoanDuocQuanLy(String ma, HttpSession session) {
        ThongTin admin = hienTai(session, VaiTro.ADMIN);
        TaiKhoan tk = repo.theoMa(ma);
        if (tk == null) throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản.");
        if (admin.maTaiKhoan().equals(ma) || !("NHAN_VIEN".equals(tk.vaiTro()) || "QUAN_LY".equals(tk.vaiTro())))
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Không được thay đổi tài khoản này.");
        return tk;
    }
    public synchronized void doiVaiTro(String ma, String cu, String moi, HttpSession session) {
        TaiKhoan tk = taiKhoanDuocQuanLy(ma, session);
        if (!("NHAN_VIEN".equals(moi) || "QUAN_LY".equals(moi)) || moi.equals(cu))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng chọn vai trò mới hợp lệ.");
        if (!tk.vaiTro().equals(cu) || !repo.capNhatVaiTro(ma, cu, moi))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Tài khoản vừa thay đổi. Vui lòng tải lại danh sách.");
        huyTatCaPhien(ma);
    }
    public synchronized void doiTrangThai(String ma, String cu, String moi, HttpSession session) {
        TaiKhoan tk = taiKhoanDuocQuanLy(ma, session);
        if (!("HOAT_DONG".equals(moi) || "KHONG_HOAT_DONG".equals(moi)) || moi.equals(cu))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Trạng thái mới không hợp lệ.");
        if (!tk.trangThai().equals(cu) || !repo.capNhatTrangThai(ma, cu, moi))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Tài khoản vừa thay đổi. Vui lòng tải lại danh sách.");
        huyTatCaPhien(ma);
    }
    @Transactional
    public void taoTaiKhoanNhanVien(String nv, String ten, String email, String matKhau, String xacNhan, HttpSession session) {
        hienTai(session, VaiTro.ADMIN);
        if (nv == null || nv.isBlank() || nv.length() > 10 || !repo.nhanVienChuaCoTaiKhoan(nv))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Nhân viên không tồn tại hoặc đã có tài khoản.");
        email = email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
        kiemTraDangKy(email, ten, null);
        kiemTraMatKhauMoi(matKhau, xacNhan, false);
        String ma = maMoi("TK");
        try {
            repo.taoTaiKhoanNhanVien(ma, ten, email, bcrypt.encode(matKhau));
            if (!repo.ganTaiKhoanNhanVien(nv, ma)) throw new NghiepVuException(HttpStatus.CONFLICT, "Nhân viên đã có tài khoản.");
        } catch (DuplicateKeyException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Email hoặc tên đăng nhập đã được sử dụng. Vui lòng kiểm tra lại.");
        }
    }
    // Chỉ service khôi phục mật khẩu gọi sau khi xác minh token phía server.
    public synchronized void datLaiMatKhau(String ma, String hashCu, String vaiTro, String phienBanCu, String matKhau, String xacNhan) {
        kiemTraMatKhauMoi(matKhau, xacNhan, true);
        TaiKhoan tk = repo.theoMa(ma);
        if (tk == null || !"HOAT_DONG".equals(tk.trangThai()) || !tk.vaiTro().equals(vaiTro) || !tk.matKhauHash().equals(hashCu) || !phienBan(ma).equals(phienBanCu))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Liên kết không còn hiệu lực. Vui lòng gửi yêu cầu mới.");
        if (bcrypt.matches(matKhau, hashCu)) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu hiện tại.");
        if (!repo.doiMatKhau(ma, vaiTro, hashCu, bcrypt.encode(matKhau)))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Liên kết không còn hiệu lực. Vui lòng gửi yêu cầu mới.");
        huyTatCaPhien(ma);
    }

    private String maMoi(String tienTo) {
        return tienTo + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
    private ThongTin thongTin(TaiKhoan t) {
        return new ThongTin(t.maTaiKhoan(), t.tenDangNhap(), t.email(), t.hoTen(), t.vaiTro(), t.maKhachHang(), t.maNhanVien(), t.soDienThoai(), t.diemTichLuy());
    }
}
