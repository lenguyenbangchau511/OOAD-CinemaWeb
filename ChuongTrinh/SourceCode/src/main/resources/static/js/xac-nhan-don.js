import { dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao, layPhienDatVe,
    luuPhienDatVe, taoDongHoDemNguoc, thoat } from './datve-common.js';

const $ = id => document.getElementById(id);
const phien = layPhienDatVe();
const form = $('uu-dai');
const xacNhan = $('xac-nhan');
const tinh = $('tinh');
let gia;
let khuyenMaiDaChon = null;
let dangGui = false;
let hetHan = false;

const dongHo = taoDongHoDemNguoc($('han'), () => {
    hetHan = true;
    xacNhan.disabled = tinh.disabled = true;
    hienThongBao($('thong-bao'), 'Hết thời gian giữ ghế. Vui lòng chọn lại ghế.', 'loi');
});

function yeuCau() {
    return {
        maPhienGiu: phien.maPhienGiu, dichVu: phien.dichVu || [],
        maKhuyenMai: $('ma').value.split(',').map(ma => ma.trim()).filter(Boolean),
        khuyenMaiChon: form.querySelector('[name="chon"]:checked')?.value || khuyenMaiDaChon,
        diem: Number($('diem').value || 0), tongTienDaXem: gia?.tongTien
    };
}

function hienGia(g) {
    $('don').innerHTML = `<h2>${thoat(g.suat.tenPhim)}</h2>
        <p>${dinhDangNgay(g.suat.ngayChieu)} · ${dinhDangGio(g.suat.gioBatDau)} · ${thoat(g.suat.tenPhong)}</p>
        <p>Ghế: ${g.phien.dsGhe.map(x => thoat(x.tenGhe)).join(', ')}</p>
        <p>${thoat(g.thanhVien.hoTen)} · ${g.thanhVien.diem} điểm · ${dinhDangTien(g.dongMoiDiem)}/điểm</p>
        <ul>${g.dichVu.map(d => `<li>${thoat(d.mon.ten)} × ${d.soLuong}: ${dinhDangTien(d.thanhTien)}</li>`).join('')}</ul>
        `;
    $('tong-ket').innerHTML = `<dl class="mc-money">
        <div><dt>Tiền vé</dt><dd>${dinhDangTien(g.phien.tamTinh)}</dd></div>
        <div><dt>Đồ ăn, thức uống</dt><dd>${dinhDangTien(g.tienDoAn)}</dd></div>
        <div><dt>Giảm khuyến mãi</dt><dd>${dinhDangTien(g.khuyenMai?.soTienGiam)}</dd></div>
        <div><dt>Giảm từ điểm</dt><dd>${dinhDangTien(g.giamDiem)}</dd></div>
        <div><dt>Tổng thanh toán</dt><dd>${dinhDangTien(g.tongTien)}</dd></div>
    </dl>`;
    $('diem').max = g.thanhVien.diem;
    $('lua-chon').hidden = !g.dongHang.length;
    $('lua-chon').innerHTML = '<legend>Chọn một ưu đãi đồng hạng rồi tính lại</legend>' +
        g.dongHang.map(u => `<label><input name="chon" type="radio" value="${thoat(u.ma)}">
            ${thoat(u.ten)} · ${dinhDangTien(u.soTienGiam)}</label>`).join('');
    dongHo.bat(g.phien.soGiayConLai);
}

async function tinhLai(body = yeuCau()) {
    if (!phien.maPhienGiu || hetHan || dangGui) return;
    dangGui = true;
    xacNhan.disabled = tinh.disabled = true;
    [...form.elements].forEach(el => { el.disabled = true; });
    hienThongBao($('thong-bao'), '');
    try {
        gia = await goiApi('/api/don-dat-ve/tam-tinh', { method: 'POST', body });
        hienGia(gia);
        khuyenMaiDaChon = gia.khuyenMai?.ma || null;
        $('ma').value = (body.maKhuyenMai || []).join(', ');
        $('diem').value = gia.diemDung;
        xacNhan.disabled = hetHan || gia.dongHang.length > 0;
    } catch (loi) {
        gia = null;
        hienThongBao($('thong-bao'), loi.message, 'loi');
    } finally {
        dangGui = false;
        [...form.elements].forEach(el => { el.disabled = false; });
        tinh.disabled = hetHan;
    }
}

form.addEventListener('input', event => {
    if (event.target.id === 'ma') {
        khuyenMaiDaChon = null;
        $('lua-chon').replaceChildren();
        $('lua-chon').hidden = true;
    }
    xacNhan.disabled = true;
});
form.addEventListener('submit', event => {
    event.preventDefault();
    tinhLai();
});
xacNhan.addEventListener('click', async () => {
    if (!gia || hetHan || dangGui || !form.reportValidity()) return;
    dangGui = true;
    xacNhan.disabled = tinh.disabled = true;
    try {
        const body = { ...yeuCau(), khuyenMaiChon: gia.khuyenMai?.ma || null };
        const don = await goiApi('/api/don-dat-ve/xac-nhan', { method: 'POST', body });
        luuPhienDatVe({ maDonHang: don.maDonHang, phuongThuc: $('phuong-thuc').value, uuDai: body });
        location.href = 'thanh-toan.html?maDonHang=' + encodeURIComponent(don.maDonHang);
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.message, 'loi');
        tinh.disabled = hetHan;
    } finally {
        dangGui = false;
    }
});
if (phien.maPhienGiu) {
    const cu = phien.uuDai;
    tinhLai(cu?.maPhienGiu === phien.maPhienGiu
        ? { ...cu, dichVu: phien.dichVu || [] } : yeuCau());
} else {
    tinh.disabled = true;
    hienThongBao($('thong-bao'), 'Vui lòng chọn và giữ ghế trước.', 'loi');
}
