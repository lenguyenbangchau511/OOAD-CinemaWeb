import { goiApi } from './datve-common.js';
import { anToan, thongBao } from './kho-common.js';

const $ = (id) => document.getElementById(id);
const maSua = new URLSearchParams(location.search).get('ma');
const box = $('thanh-phan');
const form = $('form-combo');
const nutLuu = form.querySelector('button[type="submit"]');
let dsSanPham = [];

function taoOptions(maDangChon) {
    const dangBan = dsSanPham.filter((p) => p.trangThai === 'DANG_BAN' || p.maSanPham === maDangChon);
    return '<option value="">Chọn sản phẩm</option>' + dangBan.map((p) =>
        `<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)} (tồn: ${p.soLuongTon})</option>`
    ).join('');
}

function themDong(ma = '', sl = 1) {
    const row = document.createElement('div');
    row.className = 'line-item combo-line';
    row.innerHTML = `<div class="field"><label>Sản phẩm thành phần</label><select class="sp">${taoOptions(ma)}</select></div>
        <div class="field"><label>Số lượng</label><input class="sl" type="number" min="1" step="1" value="${sl}"></div>
        <button class="icon-btn" type="button" title="Xóa dòng">×</button>`;
    row.querySelector('.sp').value = ma;
    row.querySelector('button').addEventListener('click', () => {
        if (box.children.length > 1) row.remove();
        else thongBao($('thong-bao'), 'Combo cần ít nhất một sản phẩm thành phần.', 'loi');
    });
    box.append(row);
}

$('them-dong').addEventListener('click', () => themDong());

async function khoiTao() {
    try {
        dsSanPham = await goiApi('/api/quan-ly/ton-kho');
        if (maSua) {
            const c = await goiApi(`/api/quan-ly/san-pham/${encodeURIComponent(maSua)}`);
            if (c.loaiDoiTuong !== 'COMBO') {
                thongBao($('thong-bao'), 'Mã này thuộc sản phẩm lẻ, vui lòng chỉnh sửa tại biểu mẫu Sản phẩm.', 'loi');
                nutLuu.disabled = true;
                return;
            }
            document.querySelector('h1').textContent = `Sửa combo ${c.maCombo}`;
            $('ma').value = c.maCombo;
            $('ma').readOnly = true;
            $('ten').value = c.tenCombo || '';
            $('gia').value = c.giaCombo ?? 0;
            $('anh').value = c.hinhAnh || '';
            $('mo-ta').value = c.moTa || '';
            $('trang-thai').value = c.trangThai || 'DANG_BAN';
            (c.thanhPhan || []).forEach((x) => themDong(x.maSanPham, x.soLuong));
        }
        if (!box.children.length) themDong();
    } catch (e) {
        thongBao($('thong-bao'), e.thongBao || e.message, 'loi');
        nutLuu.disabled = true;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ma = $('ma').value.trim().toUpperCase();
    const ten = $('ten').value.trim();
    const moTa = $('mo-ta').value.trim();
    const gia = Number($('gia').value);
    const parts = [...box.querySelectorAll('.line-item')].map((r) => ({
        maSanPham: r.querySelector('.sp').value,
        soLuong: Number(r.querySelector('.sl').value)
    }));

    if (!ma || !ten || !moTa || !Number.isFinite(gia) || gia < 0 || !parts.length
            || parts.some((x) => !x.maSanPham || !Number.isInteger(x.soLuong) || x.soLuong <= 0)) {
        thongBao($('thong-bao'), 'Vui lòng nhập đủ thông tin và ít nhất một thành phần có số lượng nguyên dương.', 'loi');
        return;
    }
    if (!/^[A-Z0-9_-]{2,10}$/.test(ma)) {
        thongBao($('thong-bao'), 'Mã combo gồm 2–10 ký tự chữ in hoa, số, _ hoặc -.', 'loi');
        return;
    }
    if (new Set(parts.map((x) => x.maSanPham)).size !== parts.length) {
        thongBao($('thong-bao'), 'Không chọn trùng một sản phẩm trong nhiều dòng.', 'loi');
        return;
    }

    nutLuu.disabled = true;
    thongBao($('thong-bao'), '');
    try {
        const payload = {
            maCombo: ma,
            tenCombo: ten,
            giaCombo: gia,
            hinhAnh: $('anh').value.trim(),
            moTa,
            trangThai: $('trang-thai').value,
            thanhPhan: parts
        };
        if (maSua) {
            await goiApi(`/api/quan-ly/san-pham/combo/${encodeURIComponent(maSua)}`, {
                method: 'PUT',
                body: payload
            });
        } else {
            await goiApi('/api/quan-ly/san-pham/combo', {
                method: 'POST',
                body: payload
            });
        }
        thongBao($('thong-bao'), `Đã ${maSua ? 'cập nhật' : 'lưu'} combo ${ma} vào hệ thống.`, 'thanh-cong');
        setTimeout(() => { location.href = `san-pham-chi-tiet.html?ma=${encodeURIComponent(ma)}`; }, 500);
    } catch (err) {
        thongBao($('thong-bao'), err.thongBao || err.message, 'loi');
        nutLuu.disabled = false;
    }
});

khoiTao();
