/* Giao diện 28 - Hồ sơ khách hàng và điểm thành viên (UC7.2, UC7.3, UC7.6).
   Chạy thật phần xem: GET /api/khach-hang/{ma} (nhân viên xem khách) hoặc /api/khach-hang/toi (khách xem của mình).
   Chỉnh sửa hồ sơ là giao diện mẫu. */
import { $, chip, datLoi, dinhDangNgay, dinhDangSo, dinhDangTien, docDuLieu, ganTab, hienThongBao, NHAN, thamSo, thoat, TRANG } from './quan-ly-common.js';
import { KHACH_HANG } from './du-lieu-mau-quan-ly.js';

const DONG_MOI_DIEM = 1000;   // 1 điểm = 1.000 ₫
const ma = thamSo('maKhachHang') || thamSo('ma');
let kh = null;

ganTab(document.querySelector('[role="tablist"]'));
$('ve-danh-sach').href = TRANG.danhSachKhachHang;
$('nut-sua').addEventListener('click', () => moSua(true));
$('huy-sua').addEventListener('click', () => moSua(false));
$('form-sua').addEventListener('submit', luuHoSo);
$('loai-gd').addEventListener('change', hienLichSu);
khoiTao();

async function khoiTao() {
    const url = ma ? `/api/khach-hang/${encodeURIComponent(ma)}` : '/api/khach-hang/toi';
    try {
        kh = await docDuLieu(url, KHACH_HANG[ma || 'KH01'] ?? null);
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.status === 403 ? 'Bạn không có quyền xem hồ sơ này.' : loi.message, 'loi');
        return;
    }
    if (!kh) {
        hienThongBao($('thong-bao'), 'Không tìm thấy hồ sơ khách hàng.', 'loi');
        return;
    }
    document.title = `Hồ sơ ${kh.hoTen}`;
    $('ten-kh').textContent = kh.hoTen;
    $('phu-kh').textContent = `${kh.maKhachHang} · ${kh.soDienThoai} · ${kh.email}`;
    $('diem-dau').textContent = `${dinhDangSo(kh.diemTichLuy)} điểm`;
    $('nut-lich-su-ve').href = `${TRANG.lichSuVe}?maKhachHang=${encodeURIComponent(kh.maKhachHang)}`;
    $('noi-dung').hidden = false;
    hienThongTin();
    hienDiem();
    hienLichSu();
}

function hienThongTin() {
    $('thong-tin').innerHTML = `
        <dt>Mã khách hàng</dt><dd><strong>${thoat(kh.maKhachHang)}</strong></dd>
        <dt>Họ và tên</dt><dd>${thoat(kh.hoTen)}</dd>
        <dt>Số điện thoại</dt><dd>${thoat(kh.soDienThoai)}</dd>
        <dt>Email</dt><dd>${thoat(kh.email)}</dd>
        <dt>Tên đăng nhập</dt><dd>${thoat(kh.tenDangNhap)}</dd>
        <dt>Trạng thái tài khoản</dt><dd>${chip(kh.trangThaiTaiKhoan, NHAN.trangThaiTK)}</dd>`;
}

function hienDiem() {
    const ds = kh.giaoDichDiem || [];
    const daTich = ds.filter((g) => g.diemThayDoi > 0).reduce((tong, g) => tong + g.diemThayDoi, 0);
    const daDung = ds.filter((g) => g.diemThayDoi < 0).reduce((tong, g) => tong - g.diemThayDoi, 0);
    const o = (nhan, giaTri, noiBat = false) => `<div class="card${noiBat ? ' noi-bat' : ''}"><p class="muted">${nhan}</p><p class="gia-tri">${giaTri}</p></div>`;
    $('o-diem').innerHTML = o('Điểm hiện có', dinhDangSo(kh.diemTichLuy), true)
        + o('Giá trị quy đổi', dinhDangTien(kh.diemTichLuy * DONG_MOI_DIEM))
        + o('Tổng điểm đã tích', dinhDangSo(daTich))
        + o('Tổng điểm đã dùng', dinhDangSo(daDung));
}

function hienLichSu() {
    // Danh sách xếp mới nhất trước. Số dư sau mỗi giao dịch = lùi dần từ điểm hiện có.
    let soDu = kh.diemTichLuy;
    const ds = (kh.giaoDichDiem || []).map((g) => {
        const sau = soDu;
        soDu -= g.diemThayDoi;
        return { ...g, sau };
    });
    const loai = $('loai-gd').value;
    const loc = ds.filter((g) => !loai || (loai === 'TANG') === (g.diemThayDoi > 0));

    if (!loc.length) {
        $('lich-su-diem').innerHTML = `<div class="trong"><h2>${ds.length ? 'Không có giao dịch phù hợp' : 'Chưa có giao dịch điểm'}</h2>
            <p class="muted">Điểm hiện có: ${dinhDangSo(kh.diemTichLuy)}</p></div>`;
        return;
    }
    $('lich-su-diem').innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Thời gian</th><th>Mã giao dịch</th><th>Lý do</th><th>Đơn hàng</th><th class="so">Điểm thay đổi</th><th class="so">Số dư sau</th></tr></thead>
        <tbody>${loc.map((g) => `<tr>
            <td>${g.thoiGian.slice(11, 16)} ${dinhDangNgay(g.thoiGian)}</td>
            <td>${thoat(g.maGiaoDichDiem)}</td>
            <td>${thoat(g.lyDo)}</td>
            <td>${thoat(g.maDonHang || '—')}</td>
            <td class="so ${g.diemThayDoi > 0 ? 'tang' : 'giam'}">${g.diemThayDoi > 0 ? '+' : '−'}${dinhDangSo(Math.abs(g.diemThayDoi))}</td>
            <td class="so">${dinhDangSo(g.sau)}</td>
        </tr>`).join('')}</tbody></table></div>`;
}

function moSua(mo) {
    $('form-sua').hidden = !mo;
    $('khung-xem').hidden = mo;
    if (mo) {
        $('sua-ho-ten').value = kh.hoTen;
        $('sua-sdt').value = kh.soDienThoai;
        $('sua-email').value = kh.email;
        $('sua-ho-ten').focus();
    }
}

function luuHoSo(e) {
    e.preventDefault();
    const hoTen = $('sua-ho-ten').value.trim();
    const sdt = $('sua-sdt').value.trim();
    const email = $('sua-email').value.trim();
    const hopLe = [
        datLoi('sua-ho-ten', /^[\p{L}\s]{2,100}$/u.test(hoTen) ? '' : 'Họ tên chỉ gồm chữ cái và khoảng trắng, tối thiểu 2 ký tự'),
        datLoi('sua-sdt', /^0\d{9}$/.test(sdt) ? '' : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0'),
        datLoi('sua-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Email không đúng định dạng')
    ].every(Boolean);
    if (!hopLe) return;
    hienThongBao($('thong-bao'), 'Cập nhật thông tin khách hàng thành công (giao diện mẫu, chưa lưu vào CSDL).', 'thanh-cong');
    moSua(false);
}