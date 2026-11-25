/* Giao diện 24 - Danh sách giá vé (UC6.3, UC6.4).
   Chạy thật phần đọc: GET /api/gia-ve. Thêm, sửa, xóa là giao diện mẫu. */
import { $, chipHieuLuc, dinhDangGio, dinhDangNgay, docDuLieu, doLuaChon, hienThongBao, htmlTien, NHAN, thoat } from './quan-ly-common.js';
import { GIA_VE } from './du-lieu-mau-quan-ly.js';

// [id ô lọc, tên trường dữ liệu, bảng nhãn]
const BO_LOC = [
    ['loc-loai-ve', 'loaiVe', NHAN.loaiVe],
    ['loc-doi-tuong', 'doiTuongKhachHang', NHAN.doiTuong],
    ['loc-loai-ghe', 'loaiGhe', NHAN.loaiGhe],
    ['loc-loai-ngay', 'loaiNgay', NHAN.loaiNgay],
    ['loc-trang-thai', 'trangThai', NHAN.trangThai]
];
let danhSach = [];
let sapXep = 0;   // 0: theo mã, 1: giá tăng dần, -1: giá giảm dần

BO_LOC.forEach(([id, , bang]) => doLuaChon(id, bang, true));
$('bo-loc').addEventListener('input', hienDanhSach);                     // lọc ngay khi gõ hoặc chọn
$('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); hienDanhSach(); });
$('xoa-loc').addEventListener('click', xoaLoc);
taiDuLieu();

async function taiDuLieu() {
    try {
        danhSach = await docDuLieu('/api/gia-ve', GIA_VE);
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
    const tuKhoa = $('tu-khoa').value.trim().toUpperCase();
    const giaTu = Number($('gia-tu').value) || 0;
    const giaDen = Number($('gia-den').value) || Infinity;
    return danhSach
        .filter((g) => g.maGiaVe.toUpperCase().includes(tuKhoa)
            && g.mucGia >= giaTu && g.mucGia <= giaDen
            && BO_LOC.every(([id, truong]) => !$(id).value || g[truong] === $(id).value))
        .sort((a, b) => (sapXep ? (a.mucGia - b.mucGia) * sapXep : a.maGiaVe.localeCompare(b.maGiaVe)));
}

function hienDanhSach() {
    if ((Number($('gia-tu').value) || 0) > (Number($('gia-den').value) || Infinity)) {
        hienThongBao($('thong-bao'), 'Giá từ không được lớn hơn giá đến.', 'loi');
        return;
    }
    const ds = locDuLieu();

    if (!ds.length) {
        $('ket-qua').innerHTML = `<div class="trong">
            <h2>Không tìm thấy giá vé phù hợp</h2>
            <p class="muted">Thử bỏ bớt điều kiện lọc.</p>
            <button class="button secondary" type="button" id="xoa-loc-2">Xóa bộ lọc</button></div>`;
        $('xoa-loc-2').addEventListener('click', xoaLoc);
        return;
    }

    const soDangApDung = ds.filter((g) => g.trangThai === 'DANG_AP_DUNG').length;
    const muiTen = { 0: '↕', 1: '↑', '-1': '↓' }[sapXep];

    $('ket-qua').innerHTML = `
        <p class="tom-tat"><strong>${ds.length}</strong> mức giá · <strong>${soDangApDung}</strong> đang áp dụng</p>
        <div class="table-wrap"><table>
            <thead><tr><th>Mã</th><th>Loại vé</th><th>Đối tượng</th><th>Loại ghế</th><th>Loại ngày</th><th>Khung giờ</th><th>Hiệu lực</th>
                <th class="so"><button type="button" id="sap-xep-gia" title="Bấm để sắp xếp theo mức giá">Mức giá <span class="mui-ten">${muiTen}</span></button></th>
                <th>Tình trạng</th><th></th></tr></thead>
            <tbody>${ds.map((g) => `<tr>
                <td><strong>${thoat(g.maGiaVe)}</strong></td>
                <td>${NHAN.loaiVe[g.loaiVe]}</td>
                <td>${NHAN.doiTuong[g.doiTuongKhachHang]}</td>
                <td>${NHAN.loaiGhe[g.loaiGhe]}</td>
                <td>${NHAN.loaiNgay[g.loaiNgay]}</td>
                <td>${dinhDangGio(g.khungGioBatDau)} – ${dinhDangGio(g.khungGioKetThuc)}</td>
                <td>${dinhDangNgay(g.ngayBatDau)}<span class="phu">đến ${dinhDangNgay(g.ngayKetThuc)}</span></td>
                <td class="so">${htmlTien(g.mucGia)}</td>
                <td>${chipHieuLuc(g.trangThai, g.ngayBatDau, g.ngayKetThuc)}</td>
                <td><div class="row-actions">
                    <a class="button secondary nho" href="gia-ve-form.html?ma=${g.maGiaVe}&xem=1">Xem</a>
                    <a class="button secondary nho" href="gia-ve-form.html?ma=${g.maGiaVe}">Sửa</a>
                    <button class="button secondary nho nguy-hiem" type="button" data-xoa="${g.maGiaVe}">Xóa</button>
                </div></td>
            </tr>`).join('')}</tbody>
        </table></div>`;

    $('sap-xep-gia').addEventListener('click', () => {
        sapXep = sapXep === 1 ? -1 : 1;
        hienDanhSach();
    });
    $('ket-qua').querySelectorAll('[data-xoa]').forEach((nut) => nut.addEventListener('click', () => {
        const ma = nut.dataset.xoa;
        if (confirm(`Xóa giá vé ${ma}?\nNếu giá vé đã có giao dịch, hệ thống sẽ chuyển sang "Ngừng áp dụng" thay vì xóa hẳn.`)) {
            hienThongBao($('thong-bao'), `Giao diện mẫu: đã ghi nhận yêu cầu xóa ${ma}, dữ liệu chưa thay đổi.`, 'thong-tin');
        }
    }));
}