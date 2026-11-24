import { goiApi, hienThongBao, thoat } from './datve-common.js';

const $ = id => document.getElementById(id);
const tenTrangThai = { DANG_CHIEU: 'Đang chiếu', SAP_CHIEU: 'Sắp chiếu', NGUNG_CHIEU: 'Ngừng chiếu' };
async function tai() {
    hienThongBao($('thong-bao'), '');
    const query = new URLSearchParams({ tuKhoa: $('q').value, trangThai: $('tt').value });
    try {
        const ds = await goiApi('/api/quan-ly/phim?' + query);
        $('chi-so').innerHTML = Object.entries({ 'Kết quả': null, ...Object.fromEntries(
            Object.entries(tenTrangThai).map(([ma, ten]) => [ten, ma])) }).map(([ten, ma]) =>
            `<div><span>${ten}</span><strong>${ma ? ds.filter(p => p.trangThai === ma).length : ds.length}</strong></div>`
        ).join('');
        $('ds').innerHTML = ds.map(p => {
            const ma = encodeURIComponent(p.maPhim);
            return `<tr><td>${p.poster ? `<img src="images/${encodeURIComponent(p.poster)}" alt="" loading="lazy">` : '—'}</td>
                <td>${thoat(p.maPhim)}</td><td><strong>${thoat(p.tenPhim)}</strong><small>${thoat(p.daoDien)}</small></td>
                <td>${thoat(p.theLoai)}</td><td>${thoat(p.thoiLuong)} phút</td><td>${thoat(p.gioiHanDoTuoi)}</td>
                <td>${thoat(p.ngayKhoiChieu)}</td><td><span class="mc-pill">${thoat(tenTrangThai[p.trangThai])}</span></td>
                <td><div class="mc-row-actions"><a href="phim-form.html?maPhim=${ma}&xem=1">Chi tiết</a>
                <a href="phim-form.html?maPhim=${ma}">Sửa</a>
                <button type="button" data-ma="${thoat(p.maPhim)}">Ngừng chiếu</button></div></td></tr>`;
        }).join('') || '<tr><td colspan="9">Không tìm thấy phim phù hợp.</td></tr>';
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message, 'loi');
    }
}
$('ds').addEventListener('click', e => {
    const ma = e.target.closest('[data-ma]')?.dataset.ma;
    if (ma && confirm(`Xác nhận ngừng chiếu phim ${ma}?`)) {
        hienThongBao($('thong-bao'), 'Đã xác nhận thao tác mẫu. Dữ liệu phim chưa thay đổi.');
    }
});
$('loc').addEventListener('submit', e => { e.preventDefault(); tai(); });
$('tt').addEventListener('change', tai);
tai();
