import { goiApi, hienThongBao, dinhDangNgay, thoat } from './datve-common.js';

const $ = id => document.getElementById(id);
const tenTrangThai = { DANG_CHIEU: 'Đang chiếu', SAP_CHIEU: 'Sắp chiếu', NGUNG_CHIEU: 'Ngừng chiếu' };
async function tai(thongBao = "") {
    hienThongBao($('thong-bao'), '');
    const query = new URLSearchParams({
        tuKhoa: $('q').value, trangThai: $('tt').value,
        theLoai: $('the-loai').value, gioiHanDoTuoi: $('do-tuoi').value
    });
    try {
        const ds = await goiApi('/api/quan-ly/phim?' + query);
        $('chi-so').innerHTML = Object.entries({ 'Kết quả': null, ...Object.fromEntries(
            Object.entries(tenTrangThai).map(([ma, ten]) => [ten, ma])) }).map(([ten, ma]) =>
            `<div data-status="${ma ?? 'all'}"><span>${ten}</span><strong>${ma ? ds.filter(p => p.trangThai === ma).length : ds.length}</strong></div>`
        ).join('');
        $('ds').innerHTML = ds.map(p => {
            const ma = encodeURIComponent(p.maPhim);
            const poster = p.poster
                ? `<img src="images/${encodeURIComponent(p.poster)}" alt="" loading="lazy">`
                : '<span class="film-poster-placeholder" aria-hidden="true"></span>';
            return `<tr>
                <td><div class="film-identity">${poster}<div>
                    <strong>${thoat(p.tenPhim)}</strong>
                    <small>${thoat(p.maPhim)}${p.daoDien ? ` · ${thoat(p.daoDien)}` : ''}</small>
                </div></div></td>
                <td>${thoat(p.theLoai)}</td><td>${thoat(p.thoiLuong)} phút</td><td>${thoat(p.gioiHanDoTuoi)}</td>
                <td>${thoat(dinhDangNgay(p.ngayKhoiChieu)) || '—'}</td>
                <td><span class="mc-pill" data-status="${thoat(p.trangThai)}">${thoat(tenTrangThai[p.trangThai])}</span></td>
                <td><div class="mc-row-actions"><a href="phim-form.html?maPhim=${ma}&xem=1">Chi tiết</a>
                <a href="phim-form.html?maPhim=${ma}">Sửa</a>
                <button type="button" data-xoa-phim="${thoat(p.maPhim)}">Xóa</button></div></td></tr>`;
        }).join('') || '<tr><td colspan="7" class="film-empty">Không tìm thấy phim phù hợp.</td></tr>';
        if (thongBao) hienThongBao($('thong-bao'), thongBao, 'thanh-cong');
    } catch (loi) {
        if (!$('chi-so').children.length) {
            $('ds').innerHTML = '<tr><td colspan="7" class="film-empty">Chưa tải được danh sách phim.</td></tr>';
        }
        hienThongBao($('thong-bao'), loi.message, 'loi');
    }
}
$('ds').addEventListener('click', async e => {
    const nut = e.target.closest('[data-xoa-phim]');
    if (!nut || nut.disabled) return;
    const ma = nut.dataset.xoaPhim;
    if (!confirm(`Xóa vĩnh viễn phim ${ma}?`)) return;
    nut.disabled = true;
    try {
        await goiApi('/api/quan-ly/phim/' + encodeURIComponent(ma), { method: 'DELETE' });
        await tai('Đã xóa phim.');
    } catch (loi) {
        alert(loi.message);
    } finally {
        nut.disabled = false;
    }
});
$('loc').addEventListener('submit', e => { e.preventDefault(); tai(); });
$('tt').addEventListener('change', () => tai());
tai(new URLSearchParams(location.search).has('daLuu') ? 'Đã lưu phim.' : '');
