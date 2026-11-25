import { dinhDangNgay, dinhDangTien, goiApi, hienThongBao, homNay, thamSo, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
let giaVeGoc = 85000;
let veHienTai = null;

(async function khoiTao() {
    try {
        const dsSuat = await goiApi('/api/suat-chieu?ngay=' + homNay(), { chuyenKhiChuaDangNhap: false });
        if (Array.isArray(dsSuat) && dsSuat.length) {
            $('suat-moi').innerHTML = dsSuat.map(s =>
                `<option value="${thoat(s.maSuat)}">${thoat(s.tenPhim)} · ${(s.gioBatDau || '').slice(11, 16)} (${thoat(s.tenPhong)})</option>`
            ).join('');
        } else {
            $('suat-moi').innerHTML = `
                <option value="SC-DEMO-1">Suất 19:30 Hôm nay · Phòng 02</option>
                <option value="SC-DEMO-2">Suất 21:45 Hôm nay · Phòng 01</option>`;
        }
    } catch {
        $('suat-moi').innerHTML = `<option value="SC-DEMO-1">Suất 19:30 Hôm nay · Phòng 02</option>`;
    }

    const maTuUrl = thamSo('maVe');
    if (maTuUrl) {
        $('nhap-ma-ve').value = maTuUrl;
        await kiemTraVe(maTuUrl);
    }
})();

async function kiemTraVe(maVe) {
    hienThongBao($('thong-bao'), '');
    $('khu-vuc-doi').hidden = true;

    let ve = null;
    try {
        ve = await goiApi(`/api/ve/soat-ve/${encodeURIComponent(maVe)}`, { chuyenKhiChuaDangNhap: false });
    } catch {
        const luuTam = JSON.parse(sessionStorage.getItem('cinema.veDangXuLy') || 'null');
        if (luuTam && luuTam.maVe === maVe) ve = luuTam;
    }

    if (!ve) {
        ve = {
            maVe,
            tenPhim: 'Phim mẫu Demo',
            ngayChieu: homNay(),
            gioChieu: '22:00',
            tenPhong: 'Phòng 01',
            tenGhe: 'D04',
            giaVe: 85000,
            trangThai: 'CHUA_SU_DUNG'
        };
    }

    veHienTai = ve;
    giaVeGoc = Number(ve.giaVe) || 85000;

    if (ve.trangThai !== 'CHUA_SU_DUNG') {
        hienThongBao($('thong-bao'),
            `Vé ${ve.maVe} không đủ điều kiện đổi vì đang ở trạng thái "${ve.trangThai}". Chỉ hỗ trợ đổi vé chưa sử dụng.`,
            'loi'
        );
        return;
    }

    $('ve-ma').textContent = ve.maVe;
    $('ve-phim').textContent = ve.tenPhim || '—';
    $('ve-suat').textContent = `${ve.gioChieu || ''} ${dinhDangNgay(ve.ngayChieu)}`;
    $('ve-ghe').textContent = `${ve.tenPhong || 'Phòng 01'} · Ghế ${ve.tenGhe || '—'}`;
    $('ve-gia').textContent = dinhDangTien(giaVeGoc);

    tinhChenhLech();
    $('khu-vuc-doi').hidden = false;
    $('nut-xac-nhan-doi').disabled = false;
}

function tinhChenhLech() {
    const [, , giaStr] = $('ghe-moi').value.split('|');
    const giaMoi = Number(giaStr) || 85000;
    const chenh = giaMoi - giaVeGoc;
    $('gia-moi').textContent = dinhDangTien(giaMoi);

    if (chenh > 0) {
        $('ket-luan-chenh-lech').textContent = `Chênh lệch khách cần bù thêm: ${dinhDangTien(chenh)}`;
    } else if (chenh < 0) {
        $('ket-luan-chenh-lech').textContent = `Chênh lệch thấp hơn vé cũ: ${dinhDangTien(Math.abs(chenh))} (Không hoàn chênh lệch theo quy định)`;
    } else {
        $('ket-luan-chenh-lech').textContent = 'Đồng giá vé cũ — Chênh lệch: 0 ₫';
    }
}

$('form-tim-ve').addEventListener('submit', (e) => {
    e.preventDefault();
    const ma = $('nhap-ma-ve').value.trim();
    if (ma) kiemTraVe(ma);
});

$('ghe-moi').addEventListener('change', tinhChenhLech);

$('nut-xac-nhan-doi').addEventListener('click', () => {
    const [tenGheMoi] = $('ghe-moi').value.split('|');
    const suatText = $('suat-moi').selectedOptions[0]?.textContent || '';
    hienThongBao($('thong-bao'),
        `Đã xác nhận đổi vé ${veHienTai.maVe} sang ${suatText} – Ghế ${tenGheMoi} (Giao diện mẫu, không ghi đè CSDL).`,
        'thanh-cong'
    );
    $('nut-xac-nhan-doi').disabled = true;
});