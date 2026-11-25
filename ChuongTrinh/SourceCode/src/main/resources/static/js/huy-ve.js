import { dinhDangNgay, dinhDangTien, goiApi, hienThongBao, homNay, thamSo } from './datve-common.js';

const $ = (id) => document.getElementById(id);
let giaGoc = 85000;
let veHienTai = null;

(async function khoiTao() {
    const maTuUrl = thamSo('maVe');
    if (maTuUrl) {
        $('nhap-ma-ve').value = maTuUrl;
        await taiThongTinVe(maTuUrl);
    }
})();

async function taiThongTinVe(maVe) {
    hienThongBao($('thong-bao'), '');
    $('khu-vuc-huy').hidden = true;

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
            tenKhachHang: 'Khách hàng thành viên',
            tenPhim: 'Phim mẫu Demo',
            ngayChieu: homNay(),
            gioChieu: '21:30',
            tenPhong: 'Phòng 02',
            tenGhe: 'F06',
            giaVe: 85000,
            trangThai: 'CHUA_SU_DUNG'
        };
    }

    veHienTai = ve;
    giaGoc = Number(ve.giaVe) || 85000;

    if (ve.trangThai !== 'CHUA_SU_DUNG') {
        hienThongBao($('thong-bao'),
            `Vé ${ve.maVe} không đủ điều kiện hủy (Trạng thái hiện tại: ${ve.trangThai}).`,
            'loi'
        );
        return;
    }

    $('ve-ma').textContent = ve.maVe;
    $('ve-khach').textContent = ve.tenKhachHang || 'Khách vãng lai';
    $('ve-phim-suat').textContent = `${ve.tenPhim} (${ve.gioChieu || ''} ${dinhDangNgay(ve.ngayChieu)})`;
    $('ve-ghe').textContent = `${ve.tenPhong || 'Phòng 01'} · Ghế ${ve.tenGhe || '—'}`;

    tinhTienHoan();
    $('khu-vuc-huy').hidden = false;
    $('nut-xac-nhan-huy').disabled = false;
}

function tinhTienHoan() {
    const loiCuaRap = $('ly-do-huy').value.includes('100%');
    const phanTramPhi = loiCuaRap ? 0 : 0.2;
    const phiHuy = Math.round(giaGoc * phanTramPhi);
    const soTienHoan = giaGoc - phiHuy;

    $('tien-goc').textContent = dinhDangTien(giaGoc);
    $('ty-le-phi').textContent = loiCuaRap ? '0%' : '20%';
    $('tien-phi').textContent = dinhDangTien(phiHuy);
    $('tien-hoan').textContent = dinhDangTien(soTienHoan);
}

$('form-tim-ve').addEventListener('submit', (e) => {
    e.preventDefault();
    const ma = $('nhap-ma-ve').value.trim();
    if (ma) taiThongTinVe(ma);
});

$('ly-do-huy').addEventListener('change', tinhTienHoan);

$('nut-xac-nhan-huy').addEventListener('click', () => {
    if (!confirm(`Xác nhận hủy vé ${veHienTai.maVe} và hoàn lại ${$('tien-hoan').textContent}?`)) return;
    hienThongBao($('thong-bao'),
        `Đã ghi nhận hủy vé ${veHienTai.maVe} và hoàn tiền ${$('tien-hoan').textContent} qua "${$('phuong-thuc-hoan').value}" (Giao diện mẫu — không xóa dữ liệu CSDL).`,
        'thanh-cong'
    );
    $('nut-xac-nhan-huy').disabled = true;
});