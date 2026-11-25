package com.cinema.service;

import com.cinema.exception.NghiepVuException;
import com.cinema.repository.TaiKhoanTraCuuRepository;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Token thật phía server, chuyển phát thử qua thư mục riêng ngoài webroot. Không trả token qua API. */
@Service
public class KhoiPhucMatKhauService {
    private final TaiKhoanTraCuuRepository repo;
    private final XacThucService auth;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, YeuCau> tokens = new HashMap<>();
    private final Map<String, Instant> lanGui = new HashMap<>();
    private Instant batDauCuaSo = Instant.now();
    private int soYeuCau;
    private record YeuCau(String ma, String hashCu, String vaiTro, Instant hetHan, String phienBan) {}
    private final String thuMuc;
    private final String baseUrl;
    public KhoiPhucMatKhauService(TaiKhoanTraCuuRepository repo, XacThucService auth,
            @Value("${cinema.reset.outbox:}") String thuMuc,
            @Value("${cinema.reset.base-url:http://localhost:8080}") String baseUrl) {
        this.repo = repo; this.auth = auth; this.thuMuc = thuMuc.trim(); this.baseUrl = baseUrl.replaceAll("/+$", "");
    }
    public String cheDo() { return thuMuc.isBlank() ? "TAT" : "THU_CUC_BO"; }
    private void yeuCauBat() {
        if (thuMuc.isBlank()) throw new NghiepVuException(HttpStatus.SERVICE_UNAVAILABLE, "Chức năng khôi phục mật khẩu chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
    }
    public synchronized void yeuCau(String email) {
        yeuCauBat();
        email = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (email.length() > 255 || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập địa chỉ email hợp lệ.");
        Instant now = Instant.now();
        tokens.values().removeIf(t -> !now.isBefore(t.hetHan()));
        lanGui.values().removeIf(t -> !now.isBefore(t.plusSeconds(60)));
        if (!now.isBefore(batDauCuaSo.plusSeconds(60))) { soYeuCau = 0; batDauCuaSo = now; }
        if (++soYeuCau > 30 || tokens.size() >= 500) throw new NghiepVuException(HttpStatus.TOO_MANY_REQUESTS, "Có quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.");
        if (lanGui.containsKey(email)) return; // phản hồi giống nhau cho email tồn tại và không tồn tại
        lanGui.put(email, now);
        var tk = repo.theoEmail(email);
        if (tk == null || !"HOAT_DONG".equals(tk.trangThai())) return;
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String hash = bam(token);
        YeuCau yc = new YeuCau(tk.maTaiKhoan(), tk.matKhauHash(), tk.vaiTro(), now.plusSeconds(900), auth.phienBan(tk.maTaiKhoan()));
        try {
            // Chỉ phục vụ localhost; không dùng Host header của request để tạo URL.
            URI uri = URI.create(baseUrl);
            if (!"http".equals(uri.getScheme()) || !Set.of("localhost", "127.0.0.1").contains(uri.getHost())
                    || uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null
                    || !(uri.getRawPath().isEmpty() || "/".equals(uri.getRawPath()))) throw new IOException("Invalid local base URL");
            Path dir = Path.of(thuMuc).toAbsolutePath().normalize();
            // Không cho phép ghi vào thư mục dự án/webroot khi chạy từ SourceCode.
            Path cwd = Path.of("").toAbsolutePath().normalize();
            if (dir.startsWith(cwd) || !Files.isDirectory(dir) || Files.isSymbolicLink(dir)) throw new IOException("Use an existing private external directory");
            Path file = dir.resolve("reset-" + UUID.randomUUID() + ".txt");
            String mail = "To: " + email + "\nSubject: Khôi phục mật khẩu MegaCine (thử cục bộ)\n\nLiên kết có hiệu lực 15 phút và chỉ dùng một lần:\n" + baseUrl + "/dat-lai-mat-khau.html#token=" + token + "\n";
            if (Files.getFileStore(dir).supportsFileAttributeView("posix")) {
                Files.createFile(file, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")));
                Files.writeString(file, mail, StandardCharsets.UTF_8, StandardOpenOption.WRITE);
            } else Files.writeString(file, mail, StandardCharsets.UTF_8, StandardOpenOption.CREATE_NEW);
        } catch (IOException | IllegalArgumentException e) {
            // Không ghi token hoặc địa chỉ email vào log. Chỉ dùng chế độ thử cục bộ.
            System.getLogger(getClass().getName()).log(System.Logger.Level.WARNING, "Khong the ghi hop thu thu khoi phuc mat khau; kiem tra cau hinh.");
            return;
        }
        tokens.values().removeIf(t -> t.ma().equals(tk.maTaiKhoan()));
        tokens.put(hash, yc);
    }
    private static String bam(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    private NghiepVuException hetHan() { return new NghiepVuException(HttpStatus.BAD_REQUEST, "Liên kết không còn hiệu lực. Vui lòng gửi yêu cầu mới."); }
    private YeuCau hopLe(String token) {
        yeuCauBat();
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw hetHan();
        YeuCau t = tokens.get(bam(token));
        if (t == null || !Instant.now().isBefore(t.hetHan())) throw hetHan();
        var tk = repo.theoMa(t.ma());
        if (tk == null || !"HOAT_DONG".equals(tk.trangThai()) || !tk.matKhauHash().equals(t.hashCu())
                || !tk.vaiTro().equals(t.vaiTro()) || !auth.phienBan(t.ma()).equals(t.phienBan())) throw hetHan();
        return t;
    }
    public synchronized void kiemTra(String token) { hopLe(token); }
    public synchronized void datLai(String token, String matKhau, String xacNhan) {
        YeuCau t = hopLe(token);
        auth.datLaiMatKhau(t.ma(), t.hashCu(), t.vaiTro(), t.phienBan(), matKhau, xacNhan);
        tokens.remove(bam(token));
    }
}
