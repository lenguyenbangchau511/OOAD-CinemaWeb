import { dinhDangTien, goiApi, hienThongBao, thoat } from './datve-common.js';

const $ = id => document.getElementById(id);
const loaiMon = { DO_AN: 'Đồ ăn', THUC_UONG: 'Thức uống', COMBO: 'Combo' };
let mon = [];

async function tai() {
    hienThongBao($('thong-bao'), '');
    const query = new URLSearchParams({ tuKhoa: $('q').value, loai: $('loai').value, trangThai: $('tt').value });
    try {
        mon = await goiApi('/api/quan-ly/san-pham?' + query);
        $('chi-so').innerHTML = [['Kết quả', mon.length], ...Object.entries(loaiMon)
            .map(([ma, ten]) => [ten, mon.filter(m => m.loai === ma).length])]
            .map(([ten, so]) => `<div><span>${ten}</span><strong>${so}</strong></div>`).join('');
        $('ds').innerHTML = mon.map((m, i) => `<tr>
            <td>${m.hinhAnh ? `<img src="${thoat(m.hinhAnh)}" alt="" loading="lazy">` : '—'}</td>
            <td>${thoat(m.ma)}</td><td><strong>${thoat(m.ten)}</strong><small>${thoat(m.moTa)}</small></td>
            <td>${thoat(loaiMon[m.loai])}</td><td>${dinhDangTien(m.gia)}</td>
            <td><span class="mc-pill">${m.trangThai === 'DANG_BAN' ? 'Đang bán' : 'Ngừng bán'}</span></td>
            <td><div class="mc-row-actions">
                <button data-i="${i}" data-viec="xem">Chi tiết</button>
                <button data-i="${i}" data-viec="sua">Sửa</button>
                <button data-i="${i}" data-viec="ngung">Ngừng bán</button>
            </div></td></tr>`).join('') || '<tr><td colspan="7">Không tìm thấy sản phẩm hoặc combo phù hợp.</td></tr>';
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message, 'loi');
    }
}

function moForm(m, chiXem = false) {
    const form = $('form');
    form.reset();
    [...form.elements].forEach(el => { el.disabled = chiXem && el.id !== 'dong'; });
    form.elements.ma.readOnly = Boolean(m);
    if (m) {
        for (const [ten, giaTri] of Object.entries(m)) {
            const el = form.elements.namedItem(ten);
            if (el) el.value = giaTri ?? '';
        }
    }
    $('tieu-de').textContent = chiXem ? 'Chi tiết sản phẩm / combo' : m ? 'Sửa sản phẩm / combo' : 'Thêm sản phẩm / combo';
    $('mon-form').showModal();
}
$('them').addEventListener('click', () => moForm(null));
$('dong').addEventListener('click', () => $('mon-form').close());
$('form').addEventListener('submit', e => {
    e.preventDefault();
    $('mon-form').close();
    hienThongBao($('thong-bao'), 'Đã hoàn tất thao tác lưu mẫu.', 'thanh-cong');
});
$('ds').addEventListener('click', e => {
    const nut = e.target.closest('[data-i]');
    if (!nut) return;
    const m = mon[Number(nut.dataset.i)];
    if (nut.dataset.viec !== 'ngung') {
        moForm(m, nut.dataset.viec === 'xem');
    } else if (confirm(`Xác nhận ngừng bán ${m.ten}?`)) {
        hienThongBao($('thong-bao'), 'Đã xác nhận thao tác mẫu. Trạng thái bán chưa thay đổi.');
    }
});
$('loc').addEventListener('submit', e => { e.preventDefault(); tai(); });
['loai', 'tt'].forEach(id => $(id).addEventListener('change', tai));
tai();
