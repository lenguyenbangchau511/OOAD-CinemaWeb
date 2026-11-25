/* Giao diện 36 - Danh sách khuyến mãi (UC9.3, UC9.4).
   Chạy thật phần đọc: GET /api/khuyen-mai. Thêm, sửa, xóa là giao diện mẫu. */
import { $, chipHieuLuc, dinhDangNgay, dinhDangTien, docDuLieu, doLuaChon, hienThongBao, htmlTien, NHAN, thoat } from './quan-ly-common.js';
import { KHUYEN_MAI } from './du-lieu-mau-quan-ly.js';

let danhSach = [];

doLuaChon('loc-hinh-thuc', NHAN.hinhThucGiam, true);
doLuaChon('loc-pham-vi', NHAN.phamVi, true);
doLuaChon('loc-trang-thai', NHAN.trangThai, true);
$('bo-loc').addEventListener('input', hienDanhSach);
$('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); hienDanhSach(); });
$('xoa-loc').addEventListener('click', xoaLoc);
taiDuLieu();

async function taiDuLieu() {
    try {
        danhSach = await docDuLieu('/api/khuyen-mai', KHUYEN_MAI);
        hienDanhSach();
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message, 'loi');
    }
}

function xoaLoc() {
    $('bo-loc').reset();
    hienDanhSach();
}

function locDuLieu() {
    const tuKhoa = $('tu-khoa').value.trim().toLowerCase();
    const tuNgay = $('tu-ngay').value;
    const denNgay = $('den-ngay').value;
    return danhSach
        .filter((km) => `${km.maKhuyenMai} ${km.tenChuongTrinh}`.toLowerCase().includes(tuKhoa)
            && (!$('loc-hinh-thuc').value || km.hinhThucGiam === $('loc-hinh-thuc').value)
            && (!$('loc-pham-vi').value || km.phamViApDung === $('loc-pham-vi').value)
            && (!$('loc-trang-thai').value || km.trangThai === $('loc-trang-thai').value)
            && (!tuNgay || km.ngayKetThuc >= tuNgay)       // còn hiệu lực sau "từ ngày"
            && (!denNgay || km.ngayBatDau <= denNgay))     // đã bắt đầu trước "đến ngày"
        .sort((a, b) => a.mucUuTien - b.mucUuTien);        // ưu tiên cao (số nhỏ) đứng trước
}

/** Mức giảm: phần trăm hiện "10%", số tiền hiện "10.000 ₫" (số đậm, ký hiệu nhỏ). */
function htmlMucGiam(km) {
    return km.hinhThucGiam === 'THEO_PHAN_TRAM'
        ? `<span class="tien">${Number(km.mucGiam)}<small>%</small></span>`
        : htmlTien(km.mucGiam);
}

/** Chip tình trạng: hết lượt được báo trước, còn lại xét theo hiệu lực. */
function chipTinhTrang(km) {
    if (km.trangThai === 'DANG_AP_DUNG' && km.soLuotDaSuDung >= km.gioiHanLuotSuDung) return '<span class="chip xau">Hết lượt</span>';
    return chipHieuLuc(km.trangThai, km.ngayBatDau, km.ngayKetThuc);
}

function hienDanhSach() {
    if ($('tu-ngay').value && $('den-ngay').value && $('tu-ngay').value > $('den-ngay').value) {
        hienThongBao($('thong-bao'), 'Ngày bắt đầu lọc không được sau ngày kết thúc.', 'loi');
        return;
    }
    const ds = locDuLieu();

    if (!ds.length) {
        $('ket-qua').innerHTML = `<div class="trong">
            <h2>Không tìm thấy kết quả</h2>
            <p class="muted">Thử bỏ bớt điều kiện lọc.</p>
            <button class="button secondary" type="button" id="xoa-loc-2">Xóa bộ lọc</button></div>`;
        $('xoa-loc-2').addEventListener('click', xoaLoc);
        return;
    }

    const soDangApDung = ds.filter((km) => km.trangThai === 'DANG_AP_DUNG').length;
    $('ket-qua').innerHTML = `
        <p class="tom-tat"><strong>${ds.length}</strong> chương trình · <strong>${soDangApDung}</strong> đang áp dụng · xếp theo mức ưu tiên</p>
        <div class="table-wrap"><table>
            <thead><tr><th class="giua">Ưu tiên</th><th>Mã</th><th>Chương trình</th><th class="so">Mức giảm</th>
                <th>Điều kiện</th><th>Hiệu lực</th><th>Lượt dùng</th><th>Tình trạng</th><th></th></tr></thead>
            <tbody>${ds.map((km) => `<tr>
                <td class="giua"><span class="so-uu-tien">${km.mucUuTien}</span></td>
                <td><strong>${thoat(km.maKhuyenMai)}</strong></td>
                <td>${thoat(km.tenChuongTrinh)}<span class="phu">${NHAN.phamVi[km.phamViApDung]}</span></td>
                <td class="so">${htmlMucGiam(km)}</td>
                <td class="khong-xuong-dong">${NHAN.doiTuongKM[km.doiTuongApDung] || thoat(km.doiTuongApDung)}
                    <span class="phu">${NHAN.kenhBan[km.kenhBan]} · ${km.giaTriDonToiThieu > 0 ? `Đơn từ ${dinhDangTien(km.giaTriDonToiThieu)}` : 'Không yêu cầu đơn tối thiểu'}</span></td>
                <td class="khong-xuong-dong">${dinhDangNgay(km.ngayBatDau)}<span class="phu">đến ${dinhDangNgay(km.ngayKetThuc)}</span></td>
                <td>${km.soLuotDaSuDung}/${km.gioiHanLuotSuDung}<span class="phu">còn ${km.gioiHanLuotSuDung - km.soLuotDaSuDung} lượt</span></td>
                <td>${chipTinhTrang(km)}</td>
                <td><div class="row-actions">
                    <a class="button secondary nho" href="khuyen-mai-form.html?ma=${km.maKhuyenMai}&xem=1">Xem</a>
                    <a class="button secondary nho" href="khuyen-mai-form.html?ma=${km.maKhuyenMai}">Sửa</a>
                    <button class="button secondary nho nguy-hiem" type="button" data-xoa="${km.maKhuyenMai}" data-luot="${km.soLuotDaSuDung}">Xóa</button>
                </div></td>
            </tr>`).join('')}</tbody>
        </table></div>`;

    $('ket-qua').querySelectorAll('[data-xoa]').forEach((nut) => nut.addEventListener('click', () => {
        const ma = nut.dataset.xoa;
        const daDung = Number(nut.dataset.luot) > 0;
        const cauHoi = daDung
            ? `Khuyến mãi ${ma} đã được dùng ${nut.dataset.luot} lượt nên sẽ được chuyển sang "Ngừng áp dụng", lịch sử giao dịch giữ nguyên. Tiếp tục?`
            : `Xóa khuyến mãi ${ma}? Chương trình chưa có lượt dùng nên sẽ bị xóa hẳn.`;
        if (confirm(cauHoi)) {
            hienThongBao($('thong-bao'), `Giao diện mẫu: ${daDung ? 'Khuyến mãi đã được ngừng áp dụng' : 'Xóa khuyến mãi thành công'} (${ma}). Dữ liệu chưa thay đổi.`, 'thong-tin');
        }
    }));
}