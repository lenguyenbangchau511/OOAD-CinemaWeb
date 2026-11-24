package com.cinema.service;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.repository.TaiKhoanTraCuuRepository;
import com.cinema.repository.TaiKhoanTraCuuRepository.TaiKhoan;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Arrays;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class XacThucService {
    private final TaiKhoanTraCuuRepository repo;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
    private final String hashGia = new BCryptPasswordEncoder(12).encode(java.util.UUID.randomUUID().toString());
    public XacThucService(TaiKhoanTraCuuRepository repo) { this.repo = repo; }

    // Không trả matKhauHash cho trình duyệt.
    public record ThongTin(String maTaiKhoan, String tenDangNhap, String email, String hoTen,
                           String vaiTro, String maKhachHang, String maNhanVien, String soDienThoai, Integer diemTichLuy) {}

    public ThongTin dangNhap(String taiKhoan, String matKhau, HttpServletRequest request) {
        if (taiKhoan == null || taiKhoan.isBlank() || taiKhoan.length() > 255 ||
                matKhau == null || matKhau.isEmpty() || matKhau.length() > 1024) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tài khoản và mật khẩu hợp lệ.");
        }
        TaiKhoan tk = repo.timTaiKhoan(taiKhoan.trim());
        boolean dung;
        try { dung = bcrypt.matches(matKhau, tk == null ? hashGia : tk.matKhauHash()); }
        catch (IllegalArgumentException e) { dung = false; }
        if (tk == null || !dung)
            throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác.");
        if (!"HOAT_DONG".equals(tk.trangThai()))
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa.");
        VaiTro.valueOf(tk.vaiTro());
        // Hủy session cũ để tránh session fixation; giữ đúng hợp đồng PhienDangNhap của nhóm.
        HttpSession cu = request.getSession(false);
        if (cu != null) cu.invalidate();
        HttpSession session = request.getSession(true);
        session.setAttribute("maTaiKhoan", tk.maTaiKhoan());
        session.setAttribute("vaiTro", tk.vaiTro());
        session.setAttribute("maKhachHang", tk.maKhachHang());
        session.setAttribute("maNhanVien", tk.maNhanVien());
        session.setMaxInactiveInterval(30 * 60);
        return thongTin(tk);
    }
    public ThongTin hienTai(HttpSession session, VaiTro... duocPhep) {
        String ma = session == null ? null : (String) session.getAttribute("maTaiKhoan");
        TaiKhoan tk = ma == null ? null : repo.theoMa(ma);
        if (tk == null || !"HOAT_DONG".equals(tk.trangThai()) || !tk.vaiTro().equals(session.getAttribute("vaiTro"))) {
            if (session != null) session.invalidate();
            throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục.");
        }
        if (duocPhep.length > 0 && Arrays.stream(duocPhep).noneMatch(v -> v.name().equals(tk.vaiTro())))
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập chức năng này.");
        return thongTin(tk);
    }
    public void kiemTraSoDienThoai(String so, HttpSession session, boolean hoSo) {
        String ma = hoSo ? hienTai(session).maTaiKhoan() : "";
        if (so == null || so.isBlank()) return;
        so = so.trim();
        if (!so.matches("0[0-9]{9}"))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.");
        if (repo.trungSoDienThoai(so, ma))
            throw new NghiepVuException(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng.");
    }
    // Kiểm tra dữ liệu thật; không tạo tài khoản hoặc thay đổi mật khẩu trong bản mẫu.
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
    public void kiemTraMatKhau(String matKhau, HttpSession session) {
        ThongTin me = hienTai(session);
        TaiKhoan tk = repo.theoMa(me.maTaiKhoan());
        boolean dung = false;
        if (tk != null && matKhau != null && !matKhau.isEmpty() && matKhau.length() <= 1024) {
            try { dung = bcrypt.matches(matKhau, tk.matKhauHash()); }
            catch (IllegalArgumentException e) { dung = false; }
        }
        if (!dung) throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác.");
    }
    private ThongTin thongTin(TaiKhoan t) {
        return new ThongTin(t.maTaiKhoan(), t.tenDangNhap(), t.email(), t.hoTen(), t.vaiTro(), t.maKhachHang(), t.maNhanVien(), t.soDienThoai(), t.diemTichLuy());
    }
}
