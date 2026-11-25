import { dinhDangTien, goiApi, hienThongBao, homNay, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);

const COMBO_MAU = [
    { ma: 'CB01', ten: 'Combo Cá Nhân (1 Bắp + 1 Nước)', gia: 79000 },
    { ma: 'CB02', ten: 'Combo Cặp Đôi (1 Bắp Lớn + 2 Nước)', gia: 119000 },
    { ma: 'SP01', ten: 'Coca-Cola Lớn', gia: 35000 },
    { ma: 'SP02', ten: 'Bắp Rang Bơ Phô Mai', gia: 55000 }
];

let gheDaChon = []; // [{ maGhe, loai, gia }]
let gioCombo = {};  // { ma: soLuong }
let khachThanhVien = null;

(async function khoiTao() {
    // Tải suất chiếu hôm nay từ API thật, nếu trống dùng suất mẫu
    try {
        const dsSuat = await goiApi('/api/suat-chieu?ngay=' + homNay(), { chuyenKhiChuaDangNhap: false });
        if (Array.isArray(dsSuat) && dsSuat.length) {
            $('chon-suat').innerHTML = dsSuat.map(s =>
                `<option value="${thoat(s.maSuat)}">${thoat(s.tenPhim)} · ${(s.gioBatDau || '').slice(11, 16)} (${thoat(s.tenPhong)})</option>`
            ).join('');
        } else {
            throw new Error('empty');
        }
    } catch {
        $('chon-suat').innerHTML = `
            <option value="SC01">Godzilla Trừ Không · 19:30 (Phòng 01)</option>
            <option value="SC02">Chị Chị Em Em 3 · 21:15 (Phòng 02)</option>`;
    }

    veLuoiGheMau();
    veDanhSachCombo();
    capNhatTongTien();
})();

function veLuoiGheMau() {
    const hangGhe = ['A', 'B', 'C', 'D', 'E', 'F'];
    const gheDaBan = new Set(['C04', 'C05', 'D05', 'D06']);

    $('luoi-ghe').innerHTML = hangGhe.map(hang => {
        const isVip = hang === 'D' || hang === 'E' || hang === 'F';
        const gia = isVip ? 105000 : 85000;
        const buttons = Array.from({ length: 8 }, (_, i) => {
            const maGhe = `${hang}0${i + 1}`;
            const daBan = gheDaBan.has(maGhe);
            const dangChon = gheDaChon.some(g => g.maGhe === maGhe);
            const bg = daBan ? '#75665C' : dangChon ? '#C45116' : isVip ? '#FFDFC4' : '#FFFFFF';
            const color = (daBan || dangChon) ? '#FFFFFF' : '#3D3029';
            return `<button type="button" data-ghe="${maGhe}" data-loai="${isVip ? 'VIP' : 'Thường'}" data-gia="${gia}"
                ${daBan ? 'disabled' : ''}
                style="min-width:44px; height:38px; border-radius:6px; border:1px solid #EEDDD0; background:${bg}; color:${color}; font-weight:600; cursor:${daBan ? 'not-allowed' : 'pointer'};">
                ${maGhe}
            </button>`;
        }).join('');
        return `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;"><strong style="width:24px;">${hang}</strong>${buttons}</div>`;
    }).join('');
}

function veDanhSachCombo() {
    $('ds-combo').innerHTML = COMBO_MAU.map(cb => {
        const sl = gioCombo[cb.ma] || 0;
        return `<div style="border:1px solid #EEDDD0; background:#fff; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
                <div style="font-weight:600; font-size:14px;">${thoat(cb.ten)}</div>
                <div style="color:#C45116; font-weight:700; font-size:14px;">${dinhDangTien(cb.gia)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <button type="button" class="button secondary" data-cb="${cb.ma}" data-delta="-1" style="min-height:34px; padding:0 10px;">-</button>
                <strong style="min-width:20px; text-align:center;">${sl}</strong>
                <button type="button" class="button secondary" data-cb="${cb.ma}" data-delta="1" style="min-height:34px; padding:0 10px;">+</button>
            </div>
        </div>`;
    }).join('');
}

function tinhCacKhoanTien() {
    const tienVe = gheDaChon.reduce((sum, g) => sum + g.gia, 0);
    const tienFb = COMBO_MAU.reduce((sum, cb) => sum + (gioCombo[cb.ma] || 0) * cb.gia, 0);
    const giamGia = tienVe > 0 ? Math.min(Number($('ma-uu-dai').value) || 0, tienVe + tienFb) : 0;
    const tong = Math.max(0, tienVe + tienFb - giamGia);
    return { tienVe, tienFb, giamGia, tong };
}

function capNhatTongTien() {
    const { tienVe, tienFb, giamGia, tong } = tinhCacKhoanTien();
    $('tom-tat-suat').textContent = $('chon-suat').selectedOptions[0]?.textContent || '—';
    $('tom-tat-ghe').textContent = gheDaChon.length ? gheDaChon.map(g => `${g.maGhe} (${g.loai})`).join(', ') : 'Chưa chọn ghế';
    $('tien-ve').textContent = dinhDangTien(tienVe);
    $('tien-fb').textContent = dinhDangTien(tienFb);
    $('tien-giam').textContent = `- ${dinhDangTien(giamGia)}`;
    $('tong-thanh-toan').textContent = dinhDangTien(tong);

    const khachDua = Number($('tien-khach-dua').value) || 0;
    const tienThua = Math.max(0, khachDua - tong);
    $('tien-thua').textContent = dinhDangTien(tienThua);
}

$('luoi-ghe').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ghe]');
    if (!btn) return;
    const maGhe = btn.dataset.ghe;
    const idx = gheDaChon.findIndex(g => g.maGhe === maGhe);
    if (idx >= 0) {
        gheDaChon.splice(idx, 1);
    } else {
        if (gheDaChon.length >= 8) {
            hienThongBao($('thong-bao'), 'Mỗi giao dịch tại quầy chỉ chọn tối đa 8 ghế.', 'loi');
            return;
        }
        gheDaChon.push({ maGhe, loai: btn.dataset.loai, gia: Number(btn.dataset.gia) });
    }
    hienThongBao($('thong-bao'), '');
    veLuoiGheMau();
    capNhatTongTien();
});

$('ds-combo').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cb]');
    if (!btn) return;
    const ma = btn.dataset.cb;
    const delta = Number(btn.dataset.delta);
    gioCombo[ma] = Math.max(0, (gioCombo[ma] || 0) + delta);
    veDanhSachCombo();
    capNhatTongTien();
});

$('nut-tim-tv').addEventListener('click', () => {
    const sdt = $('sdt-thanh-vien').value.trim();
    if (!sdt) {
        khachThanhVien = null;
        $('thong-tin-tv').textContent = 'Khách vãng lai (Không tích điểm)';
        return;
    }
    khachThanhVien = { sdt, ten: 'Nguyễn Văn Thành Viên', hang: 'Vàng', diem: 120 };
    $('thong-tin-tv').innerHTML = `Thành viên: <strong>${khachThanhVien.ten}</strong> · Hạng ${khachThanhVien.hang} (${khachThanhVien.diem} điểm)`;
});

$('chon-suat').addEventListener('change', capNhatTongTien);
$('ma-uu-dai').addEventListener('change', capNhatTongTien);
$('tien-khach-dua').addEventListener('input', capNhatTongTien);

$('phuong-thuc').addEventListener('change', () => {
    $('khung-tien-mat').hidden = $('phuong-thuc').value !== 'TIEN_MAT';
});

function taoNoiDungVeIn() {
    const { tienVe, tienFb, giamGia, tong } = tinhCacKhoanTien();
    const suat = $('chon-suat').selectedOptions[0]?.textContent || '';
    const dsGhe = gheDaChon.map(g => g.maGhe).join(', ') || 'Chưa chọn';
    const dsCb = COMBO_MAU.filter(c => (gioCombo[c.ma] || 0) > 0)
        .map(c => `${c.ten} x${gioCombo[c.ma]}`).join('<br>') || 'Không có';

    return `
        <div style="text-align:center; border-bottom:1px dashed #3D3029; padding-bottom:10px; margin-bottom:10px;">
            <strong style="font-size:18px;">MEGACINE / CINEMA 11</strong><br>
            <span>VÉ XEM PHIM TẠI QUẦY</span>
        </div>
        <div><strong>Suất chiếu:</strong> ${thoat(suat)}</div>
        <div><strong>Ghế ngồi:</strong> ${thoat(dsGhe)}</div>
        <div><strong>Khách hàng:</strong> ${thoat(khachThanhVien ? khachThanhVien.ten : 'Khách vãng lai')}</div>
        <div style="margin-top:8px;"><strong>Bắp nước:</strong><br>${dsCb}</div>
        <div style="border-top:1px dashed #3D3029; margin-top:10px; padding-top:10px;">
            <div>Tiền vé: ${dinhDangTien(tienVe)}</div>
            <div>Bắp nước: ${dinhDangTien(tienFb)}</div>
            <div>Giảm giá: -${dinhDangTien(giamGia)}</div>
            <div style="font-size:16px;"><strong>TỔNG CỘNG: ${dinhDangTien(tong)}</strong></div>
            <div>Thanh toán: ${$('phuong-thuc').selectedOptions[0]?.textContent}</div>
        </div>
        <div style="text-align:center; margin-top:12px; font-size:12px;">Mã vé mẫu: QUAY-${Date.now().toString().slice(-6)}</div>
    `;
}

$('nut-xem-truoc').addEventListener('click', () => {
    $('noi-dung-ve-in').innerHTML = taoNoiDungVeIn();
    $('modal-ve-in').showModal();
});

$('dong-modal').addEventListener('click', () => $('modal-ve-in').close());

$('nut-xuat-ve').addEventListener('click', () => {
    if (!gheDaChon.length) {
        hienThongBao($('thong-bao'), 'Vui lòng chọn ít nhất 1 ghế trước khi xuất vé.', 'loi');
        return;
    }
    const { tong } = tinhCacKhoanTien();
    if ($('phuong-thuc').value === 'TIEN_MAT') {
        const khachDua = Number($('tien-khach-dua').value) || 0;
        if (khachDua < tong) {
            hienThongBao($('thong-bao'), `Số tiền khách đưa (${dinhDangTien(khachDua)}) chưa đủ thanh toán (${dinhDangTien(tong)}).`, 'loi');
            return;
        }
    }
    hienThongBao($('thong-bao'), 'Đã xác nhận thu tiền tại quầy và xuất vé thành công (Giao diện mẫu).', 'thanh-cong');
    $('noi-dung-ve-in').innerHTML = taoNoiDungVeIn();
    $('modal-ve-in').showModal();
});

$('nut-lam-moi').addEventListener('click', () => {
    gheDaChon = [];
    gioCombo = {};
    khachThanhVien = null;
    $('sdt-thanh-vien').value = '';
    $('thong-tin-tv').textContent = 'Khách vãng lai (Không tích điểm)';
    $('ma-uu-dai').value = '0';
    $('tien-khach-dua').value = '';
    hienThongBao($('thong-bao'), '');
    veLuoiGheMau();
    veDanhSachCombo();
    capNhatTongTien();
});