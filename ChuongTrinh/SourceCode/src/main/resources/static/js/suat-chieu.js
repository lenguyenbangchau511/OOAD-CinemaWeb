/* Giao diện 21 - Danh sách / lịch suất chiếu (UC4.1). Đọc và lọc thật; thêm/chi tiết chuyển sang giao diện 22/23 của Trung. */
import { chipTrangThai, congNgay, dinhDangGio, dinhDangNgay, goiApi, hienThongBao, homNay, NHAN, TRANG, thamSo, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
$('ngay').value = thamSo('ngay') || homNay();
$('nut-them').href = TRANG.suatChieuThemSua;

(async function () {
    try {
        const bl = await goiApi('/api/suat-chieu/bo-loc');
        $('phim').insertAdjacentHTML('beforeend', bl.phim.map((p) => `<option value="${thoat(p.maPhim)}">${thoat(p.tenPhim)}</option>`).join(''));
        $('phong').insertAdjacentHTML('beforeend', bl.phong.map((p) => `<option value="${thoat(p.maPhong)}">${thoat(p.tenPhong)}</option>`).join(''));
    } catch (loi) { hienThongBao($('thong-bao'), loi.thongBao, 'loi'); }
    $('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); tim(); });
    ['phim', 'phong', 'trang-thai', 'ngay'].forEach((i) => $(i).addEventListener('change', tim));
    $('ngay-truoc').addEventListener('click', () => doiNgay(-1));
    $('ngay-sau').addEventListener('click', () => doiNgay(1));
    tim();
})();

function doiNgay(n) { $('ngay').value = congNgay($('ngay').value || homNay(), n); tim(); }

async function tim() {
    const ngay = $('ngay').value;
    const q = new URLSearchParams();
    [['ngay', ngay], ['maPhim', $('phim').value], ['maPhong', $('phong').value], ['trangThai', $('trang-thai').value]]
        .forEach(([k, v]) => { if (v) q.set(k, v); });
    hienThongBao($('thong-bao'), '');
    try {
        ve(await goiApi('/api/suat-chieu?' + q), q.size > 1);
    } catch (loi) {
        $('ket-qua').innerHTML = ''; $('so-ket-qua').textContent = '';
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
    }
}

function ve(ds, coLoc) {
    $('so-ket-qua').textContent = ds.length ? `${ds.length} suất chiếu ngày ${dinhDangNgay($('ngay').value)}` : '';
    if (!ds.length) {
        $('ket-qua').innerHTML = `<div class="trong"><h2>${coLoc ? 'Không tìm thấy suất chiếu phù hợp' : 'Chưa có suất chiếu trong ngày'}</h2></div>`;
        return;
    }
    $('ket-qua').innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Giờ</th><th>Phim</th><th>Phòng</th><th>Ghế đã bán</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${ds.map((s) => {
            const phanTram = s.tongSoGhe ? Math.round((s.soGheDaBan + s.soGheDangGiu) * 100 / s.tongSoGhe) : 0;
            return `<tr><td><strong>${dinhDangGio(s.gioBatDau)}</strong> – ${dinhDangGio(s.gioKetThuc)}</td>
            <td>${thoat(s.tenPhim)}${s.gioiHanDoTuoi ? ` <span class="muted">(${thoat(s.gioiHanDoTuoi)})</span>` : ''}</td>
            <td>${thoat(s.tenPhong)}<br><span class="muted">${NHAN.loaiPhong[s.loaiPhong] || thoat(s.loaiPhong)}</span></td>
            <td><div class="thanh-tien-do" role="progressbar" aria-valuenow="${phanTram}" aria-valuemin="0" aria-valuemax="100"><span style="width:${phanTram}%"></span></div>
                <span class="muted">${s.soGheDaBan} bán · ${s.soGheDangGiu} giữ · ${s.soGheTrong} trống</span></td>
            <td>${chipTrangThai(s.trangThai, NHAN.trangThaiSuat)}</td>
            <td><a class="button secondary nho" href="${TRANG.suatChieuChiTiet}?maSuat=${encodeURIComponent(s.maSuat)}">Chi tiết</a></td></tr>`;
        }).join('')}</tbody></table></div>`;
}
