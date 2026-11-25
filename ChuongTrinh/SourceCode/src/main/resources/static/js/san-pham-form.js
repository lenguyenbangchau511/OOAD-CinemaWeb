import { goiApi } from './datve-common.js';
import { anToan, thongBao } from './kho-common.js';

const $ = (id) => document.getElementById(id);
const maSua = new URLSearchParams(location.search).get('ma');
const form = $('form-san-pham');
const preview = $('preview');
const nutLuu = form.querySelector('button[type="submit"]');

function xemAnh() {
    const u = $('anh').value.trim();
    const icon = $('loai').value === 'DO_AN' ? '🍿' : '🥤';
    preview.innerHTML = u
        ? `<img src="${anToan(u)}" alt="Ảnh xem trước" onerror="this.replaceWith(document.createTextNode('${icon}'))">`
        : icon;
}

$('anh').addEventListener('input', xemAnh);
$('loai').addEventListener('change', xemAnh);

async function khoiTao() {
    if (!maSua) {
        xemAnh();
        return;
    }
    try {
        const p = await goiApi(`/api/quan-ly/san-pham/${encodeURIComponent(maSua)}`);
        if (p.loaiDoiTuong !== 'SAN_PHAM') {
            thongBao($('thong-bao'), 'Mã này thuộc Combo, vui lòng chỉnh sửa tại biểu mẫu Combo.', 'loi');
            nutLuu.disabled = true;
            return;
        }
        document.querySelector('h1').textContent = `Sửa sản phẩm ${p.maSanPham}`;
        $('ma').value = p.maSanPham;
        $('ma').readOnly = true;
        $('ten').value = p.tenSanPham || '';
        $('loai').value = p.loaiSanPham || 'DO_AN';
        $('don-vi').value = p.donViTinh || '';
        $('gia').value = p.giaBan ?? 0;
        $('trang-thai').value = p.trangThai || 'DANG_BAN';
        $('anh').value = p.hinhAnh || '';
        $('mo-ta').value = p.moTa || '';
        xemAnh();
    } catch (e) {
        thongBao($('thong-bao'), e.thongBao || e.message, 'loi');
        nutLuu.disabled = true;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ma = $('ma').value.trim().toUpperCase();
    const ten = $('ten').value.trim();
    const donVi = $('don-vi').value.trim();
    const moTa = $('mo-ta').value.trim();
    const gia = Number($('gia').value);

    if (!ma || !ten || !donVi || !moTa || !Number.isFinite(gia) || gia < 0) {
        thongBao($('thong-bao'), 'Vui lòng nhập đầy đủ thông tin và giá bán hợp lệ.', 'loi');
        return;
    }
    if (!/^[A-Z0-9_-]{2,10}$/.test(ma)) {
        thongBao($('thong-bao'), 'Mã sản phẩm gồm 2–10 ký tự chữ in hoa, số, _ hoặc -.', 'loi');
        return;
    }

    nutLuu.disabled = true;
    thongBao($('thong-bao'), '');
    try {
        const payload = {
            maSanPham: ma,
            tenSanPham: ten,
            loaiSanPham: $('loai').value,
            donViTinh: donVi,
            giaBan: gia,
            moTa,
            hinhAnh: $('anh').value.trim(),
            trangThai: $('trang-thai').value
        };
        if (maSua) {
            await goiApi(`/api/quan-ly/san-pham/mat-hang/${encodeURIComponent(maSua)}`, {
                method: 'PUT',
                body: payload
            });
        } else {
            await goiApi('/api/quan-ly/san-pham/mat-hang', {
                method: 'POST',
                body: payload
            });
        }
        thongBao($('thong-bao'), `Đã ${maSua ? 'cập nhật' : 'thêm'} sản phẩm ${ma} vào hệ thống.`, 'thanh-cong');
        setTimeout(() => { location.href = `san-pham-chi-tiet.html?ma=${encodeURIComponent(ma)}`; }, 500);
    } catch (err) {
        thongBao($('thong-bao'), err.thongBao || err.message, 'loi');
        nutLuu.disabled = false;
    }
});

khoiTao();
