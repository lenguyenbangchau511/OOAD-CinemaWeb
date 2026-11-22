/* Giao diện 19 - Form thêm/sửa phòng chiếu (UC3.2). Kiểm tra dữ liệu thật (gồm trùng mã), lưu là minh họa. */
import { goiApi, hienThongBao, NHAN, thamSo } from './datve-common.js';

const $ = (id) => document.getElementById(id);
const maSua = thamSo('maPhong');
const truong = { 'ma-phong': 'loi-ma-phong', 'ten-phong': 'loi-ten-phong', 'so-hang': 'loi-so-hang', 'so-cot': 'loi-so-cot' };

(async function () {
    if (maSua) {
        $('tieu-de').textContent = 'Sửa phòng chiếu';
        try {
            const p = await goiApi(`/api/phong-chieu/${encodeURIComponent(maSua)}`);
            $('ma-phong').value = p.maPhong; $('ma-phong').readOnly = true;
            $('ten-phong').value = p.tenPhong; $('loai-phong').value = p.loaiPhong; $('trang-thai').value = p.trangThai;
            $('so-hang').value = p.tongSoHang; $('so-cot').value = p.tongSoCot;
        } catch (loi) { hienThongBao($('thong-bao'), loi.thongBao, 'loi'); }
    }
    ['so-hang', 'so-cot'].forEach((i) => $(i).addEventListener('input', xemTruoc));
    $('form').addEventListener('submit', luu);
    xemTruoc();
})();

function xemTruoc() {
    const h = parseInt($('so-hang').value, 10), c = parseInt($('so-cot').value, 10);
    if (!(h >= 1 && h <= 26 && c >= 1 && c <= 30)) { $('xem-truoc').innerHTML = ''; $('tong-ghe').textContent = ''; return; }
    $('tong-ghe').textContent = `Tổng số ghế: ${h * c}`;
    $('xem-truoc').innerHTML = Array.from({ length: h }, (_, i) => `<div class="hang-ghe"><span class="hang-nhan">${String.fromCharCode(65 + i)}</span>` +
        Array.from({ length: c }, (_, j) => `<span class="seat" aria-hidden="true">${j + 1}</span>`).join('') + '</div>').join('');
}

function loi(id, noiDung) {
    const o = $(id), nhom = o.closest('.field');
    nhom.classList.toggle('invalid', !!noiDung);
    $(truong[id]).textContent = noiDung || '';
    return !noiDung;
}

async function luu(e) {
    e.preventDefault();
    hienThongBao($('thong-bao'), '');
    const ma = $('ma-phong').value.trim(), ten = $('ten-phong').value.trim();
    const h = parseInt($('so-hang').value, 10), c = parseInt($('so-cot').value, 10);
    let ok = true;
    ok = loi('ma-phong', !ma ? 'Vui lòng nhập mã phòng' : (!/^[A-Za-z0-9_-]+$/.test(ma) ? 'Mã phòng chỉ gồm chữ, số, - và _' : '')) && ok;
    ok = loi('ten-phong', !ten ? 'Vui lòng nhập tên phòng' : '') && ok;
    ok = loi('so-hang', !(h >= 1 && h <= 26) ? 'Số hàng phải từ 1 đến 26' : '') && ok;
    ok = loi('so-cot', !(c >= 1 && c <= 30) ? 'Số ghế mỗi hàng phải từ 1 đến 30' : '') && ok;
    if (!ok) return;
    if (!maSua) {                                   // kiểm tra trùng mã bằng dữ liệu thật
        try {
            const ds = await goiApi('/api/phong-chieu?tuKhoa=' + encodeURIComponent(ma));
            if (ds.some((p) => p.maPhong.toLowerCase() === ma.toLowerCase())) { loi('ma-phong', 'Mã phòng đã tồn tại'); return; }
        } catch (l) { hienThongBao($('thong-bao'), l.thongBao, 'loi'); return; }
    }
    hienThongBao($('thong-bao'), `Minh họa: dữ liệu hợp lệ (${NHAN.loaiPhong[$('loai-phong').value]}, ${h * c} ghế) nhưng chưa lưu vào cơ sở dữ liệu.`, 'thanh-cong');
}
