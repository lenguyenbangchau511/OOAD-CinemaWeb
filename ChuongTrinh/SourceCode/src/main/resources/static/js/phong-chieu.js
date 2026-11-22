/* Giao diện 18 - Danh sách phòng chiếu (UC3.1). Đọc/lọc chạy thật; thêm, sửa, đóng phòng là minh họa. */
import { chipTrangThai, goiApi, hienThongBao, NHAN, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
$('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); tim(); });
$('xoa-loc').addEventListener('click', () => { $('bo-loc').reset(); tim(); });
tim();

async function tim() {
    const q = new URLSearchParams();
    [['tuKhoa', $('tu-khoa').value.trim()], ['loaiPhong', $('loai-phong').value], ['trangThai', $('trang-thai').value]]
        .forEach(([k, v]) => { if (v) q.set(k, v); });
    hienThongBao($('thong-bao'), '');
    try {
        const ds = await goiApi('/api/phong-chieu?' + q);
        ve(ds, q.size > 0);
    } catch (loi) {
        $('ket-qua').innerHTML = ''; $('so-ket-qua').textContent = '';
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
    }
}

function ve(ds, coLoc) {
    $('so-ket-qua').textContent = ds.length ? `${ds.length} phòng chiếu` : '';
    if (!ds.length) {
        $('ket-qua').innerHTML = `<div class="trong"><h2>${coLoc ? 'Không tìm thấy phòng phù hợp' : 'Chưa có phòng chiếu'}</h2></div>`;
        return;
    }
    $('ket-qua').innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Tên phòng</th><th>Loại</th><th class="so">Số ghế</th><th>Kích thước</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${ds.map((p) => `<tr>
            <td><strong>${thoat(p.maPhong)}</strong></td><td>${thoat(p.tenPhong)}</td>
            <td>${NHAN.loaiPhong[p.loaiPhong] || thoat(p.loaiPhong)}</td><td class="so">${p.soLuongGhe}</td>
            <td>${p.tongSoHang} hàng × ${p.tongSoCot} ghế</td><td>${chipTrangThai(p.trangThai, NHAN.trangThaiPhong)}</td>
            <td class="hanh-dong"><a class="button secondary nho" href="phong-chieu-chi-tiet.html?maPhong=${encodeURIComponent(p.maPhong)}">Xem</a>
                <a class="button secondary nho" href="phong-chieu-form.html?maPhong=${encodeURIComponent(p.maPhong)}">Sửa</a>
                <button class="button secondary nho nguy-hiem" type="button" data-dong="${thoat(p.maPhong)}">Đóng phòng</button></td></tr>`).join('')}</tbody></table></div>`;
    $('ket-qua').querySelectorAll('[data-dong]').forEach((n) => n.addEventListener('click', () => {
        if (confirm(`Đóng phòng ${n.dataset.dong}?`)) hienThongBao($('thong-bao'), 'Minh họa: chức năng đóng phòng chưa lưu vào cơ sở dữ liệu.', 'thong-tin');
    }));
}
