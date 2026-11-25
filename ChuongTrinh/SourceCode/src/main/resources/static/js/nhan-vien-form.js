/* Giao diện 39 - Thêm / sửa / chi tiết nhân viên (UC10.1, UC10.2, UC10.4). Giao diện mẫu, chưa lưu CSDL.
   ?ma=NV03 -> sửa;  ?ma=NV03&xem=1 -> chỉ xem;  không có tham số -> thêm mới. */
import { $, datLoi, docDuLieu, hienThongBao, khoaForm, NHAN, thamSo, TRANG } from './quan-ly-common.js';
import { NHAN_VIEN } from './du-lieu-mau-quan-ly.js';

const ma = thamSo('maNhanVien') || thamSo('ma');
const mode = thamSo('mode');   // truyền mode=add | view | edit
const cheDo = mode === 'add' || !ma ? 'them' : (mode === 'view' || thamSo('xem')) ? 'xem' : 'sua';
let danhSach = [];
let daBamLuu = false;

['ve-danh-sach', 'nut-huy', 'nut-quay-lai'].forEach((id) => { $(id).href = TRANG.danhSachNhanVien; });
$('sdt').addEventListener('input', () => { $('sdt').value = $('sdt').value.replace(/\D/g, ''); });   // chỉ cho nhập số
$('form').addEventListener('input', () => { if (daBamLuu) kiemTra(); });
$('form').addEventListener('submit', luu);
khoiTao();

async function khoiTao() {
    danhSach = await docDuLieu('/api/nhan-vien', NHAN_VIEN);

    if (cheDo === 'them') {
        $('ma-nv').value = 'Tự sinh khi lưu';
        $('tk-ten').value = 'Chưa có tài khoản';
        return;
    }
    const nv = danhSach.find((n) => n.maNhanVien === ma);
    if (!nv) {
        hienThongBao($('thong-bao'), 'Không tìm thấy hồ sơ nhân viên.', 'loi');
        $('form').hidden = true;
        return;
    }
    $('ma-nv').value = nv.maNhanVien;
    $('ho-ten').value = nv.hoTen;
    $('sdt').value = nv.soDienThoai;
    $('chuc-vu').value = nv.chucVu;
    $('tk-ten').value = nv.tenDangNhap || 'Chưa có tài khoản';
    $('tk-email').value = nv.email || '';
    $('tk-vai-tro').value = NHAN.vaiTro[nv.vaiTro] || '';
    $('tk-trang-thai').value = NHAN.trangThaiTK[nv.trangThaiTaiKhoan] || '';

    if (cheDo === 'sua') {
        $('tieu-de').textContent = `Sửa hồ sơ nhân viên ${nv.maNhanVien}`;
        $('duong-dan').textContent = 'Chỉnh sửa';
        $('mo-ta').textContent = 'Chỉ cập nhật thông tin hồ sơ. Mã nhân viên, vai trò và trạng thái tài khoản không thay đổi tại đây.';
    } else {
        $('tieu-de').textContent = `Hồ sơ nhân viên ${nv.maNhanVien}`;
        $('duong-dan').textContent = 'Chi tiết';
        $('mo-ta').textContent = 'Chế độ chỉ xem.';
        khoaForm($('form'));
        $('nut-form').hidden = true;
        $('nut-xem').hidden = false;
        $('nut-sua').href = `nhan-vien-form.html?mode=edit&maNhanVien=${nv.maNhanVien}`;
    }
    document.title = `$('tieu-de').textContent}`;
}

/** Kiểm tra theo UC10.1 / UC10.4. Trùng định danh xét theo số điện thoại, không so với chính nó. */
function kiemTra() {
    const hoTen = $('ho-ten').value.trim();
    const sdt = $('sdt').value.trim();
    const chucVu = $('chuc-vu').value.trim();
    const trung = danhSach.find((n) => n.soDienThoai === sdt && n.maNhanVien !== ma);

    return [
        datLoi('ho-ten', !hoTen ? 'Vui lòng nhập họ và tên'
            : !/^[\p{L}\s]{2,100}$/u.test(hoTen) ? 'Họ tên chỉ gồm chữ cái và khoảng trắng, tối thiểu 2 ký tự' : ''),
        datLoi('sdt', !sdt ? 'Vui lòng nhập số điện thoại'
            : !/^0\d{9}$/.test(sdt) ? 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0'
                : trung ? `Số điện thoại đã được dùng cho nhân viên ${trung.maNhanVien}` : ''),
        datLoi('chuc-vu', chucVu ? '' : 'Vui lòng chọn hoặc nhập chức vụ')
    ].every(Boolean);
}

function luu(e) {
    e.preventDefault();
    daBamLuu = true;
    if (!kiemTra()) {
        hienThongBao($('thong-bao'), 'Thông tin chưa hợp lệ, vui lòng kiểm tra các ô được đánh dấu.', 'loi');
        return;
    }
    hienThongBao($('thong-bao'), cheDo === 'them'
        ? 'Thêm nhân viên thành công (giao diện mẫu, chưa lưu vào CSDL).'
        : 'Cập nhật thông tin nhân viên thành công (giao diện mẫu, chưa lưu vào CSDL).', 'thanh-cong');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}