import { anhMon, dinhDangTien, goiApi, hienThongBao, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
const loaiMon = { DO_AN: 'Đồ ăn', THUC_UONG: 'Thức uống', COMBO: 'Combo' };
let mon = [];

async function tai() {
    hienThongBao($('thong-bao'), '');
    const query = new URLSearchParams({ tuKhoa: $('q').value, loai: $('loai').value, trangThai: $('tt').value });
    try {
        mon = await goiApi('/api/quan-ly/san-pham?' + query);
        $('chi-so').innerHTML = [['Kết quả', mon.length], ...Object.entries(loaiMon)
            .map(([ma, ten]) => [ten, mon.filter((m) => m.loai === ma).length])]
            .map(([ten, so]) => `<div><span>${ten}</span><strong>${so}</strong></div>`).join('');
        $('ds').innerHTML = mon.map((m, i) => {
            const img = anhMon(m);
            const ma = encodeURIComponent(m.ma);
            const suaHref = m.loai === 'COMBO' ? `combo-form.html?ma=${ma}` : `san-pham-form.html?ma=${ma}`;
            const dangBan = m.trangThai === 'DANG_BAN';
            return `<tr>
                <td>${img ? `<img src="${thoat(img)}" alt="" loading="lazy">` : '—'}</td>
                <td>${thoat(m.ma)}</td>
                <td><strong>${thoat(m.ten)}</strong><small>${thoat(m.moTa)}</small></td>
                <td>${thoat(loaiMon[m.loai])}</td>
                <td>${dinhDangTien(m.gia)}</td>
                <td><span class="mc-pill">${dangBan ? 'Đang bán' : 'Ngừng bán'}</span></td>
                <td><div class="mc-row-actions">
                    <a href="san-pham-chi-tiet.html?ma=${ma}">Chi tiết</a>
                    <a href="${suaHref}">Sửa</a>
                    <button type="button" data-i="${i}">${dangBan ? 'Ngừng bán' : 'Mở bán lại'}</button>
                </div></td>
            </tr>`;
        }).join('') || '<tr><td colspan="7">Không tìm thấy sản phẩm hoặc combo phù hợp.</td></tr>';
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message, 'loi');
    }
}

$('ds').addEventListener('click', async (e) => {
    const nut = e.target.closest('button[data-i]');
    if (!nut) return;
    const m = mon[Number(nut.dataset.i)];
    if (!m) return;
    const trangThaiMoi = m.trangThai === 'DANG_BAN' ? 'NGUNG_BAN' : 'DANG_BAN';
    const hanhDong = trangThaiMoi === 'NGUNG_BAN' ? 'ngừng bán' : 'mở bán lại';
    if (!confirm(`Xác nhận ${hanhDong} ${m.ten}?`)) return;
    nut.disabled = true;
    try {
        await goiApi(`/api/quan-ly/san-pham/${encodeURIComponent(m.ma)}/trang-thai`, {
            method: 'PATCH',
            body: { trangThai: trangThaiMoi }
        });
        await tai();
        hienThongBao($('thong-bao'), `Đã cập nhật trạng thái "${m.ten}" thành ${trangThaiMoi === 'DANG_BAN' ? 'Đang bán' : 'Ngừng bán'}.`, 'thanh-cong');
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.thongBao || loi.message, 'loi');
        nut.disabled = false;
    }
});

$('loc').addEventListener('submit', (e) => { e.preventDefault(); tai(); });
$('loai').addEventListener('change', tai);
$('tt').addEventListener('change', tai);
tai();
