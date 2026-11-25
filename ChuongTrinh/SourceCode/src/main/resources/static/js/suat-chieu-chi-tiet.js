import { chipTrangThai, dinhDangGio, dinhDangNgay, goiApi, hienThongBao, NHAN, TRANG, thamSo, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
const maSuat = thamSo('maSuat');
let duLieuSuat = null;
let soGheDaBan = 0;

(async function taiChiTietSuat() {
    if (!maSuat) {
        hienThongBao($('thong-bao'), 'Thiếu mã suất chiếu (?maSuat=...).', 'loi');
        return;
    }

    try {
        const res = await goiApi(`/api/suat-chieu/${encodeURIComponent(maSuat)}/so-do-ghe`);
        const s = res.suatChieu || res;
        const dsGhe = res.danhSachGhe || res.ghe || [];
        duLieuSuat = s;

        $('tieu-de').textContent = `Chi tiết suất: ${s.tenPhim || maSuat}`;
        $('ma-suat').textContent = s.maSuat || maSuat;
        $('ten-phim').textContent = s.tenPhim || '—';
        $('ten-phong').textContent = s.tenPhong || '—';
        $('thoi-gian').textContent = `${dinhDangGio(s.gioBatDau)} – ${dinhDangGio(s.gioKetThuc)} (${dinhDangNgay(s.gioBatDau)})`;
        $('trang-thai').innerHTML = chipTrangThai(s.trangThai, NHAN.trangThaiSuat);

        soGheDaBan = dsGhe.filter(g => g.trangThai === 'DA_DAT' || g.trangThai === 'DA_BAN').length;
        const soGheGiu = dsGhe.filter(g => g.trangThai === 'DANG_GIU').length;
        const soGheTrong = dsGhe.filter(g => g.trangThai === 'TRONG').length;
        $('thong-ke-ghe').textContent = `${soGheDaBan} đã bán · ${soGheGiu} đang giữ · ${soGheTrong} trống`;

        $('nut-sua').href = `${TRANG.suatChieuThemSua}?maSuat=${encodeURIComponent(maSuat)}`;
        if (s.trangThai !== 'DA_HUY' && s.trangThai !== 'KET_THUC') {
            $('nut-huy').hidden = false;
        }

        veSoDoGhe(dsGhe);
        $('thong-tin-suat').hidden = false;
        $('khung-so-do').hidden = false;
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.thongBao || 'Không tải được chi tiết suất chiếu.', 'loi');
    }
})();

function veSoDoGhe(dsGhe) {
    if (!dsGhe.length) {
        $('so-do-ghe').innerHTML = '<p class="muted">Suất chiếu này chưa có dữ liệu ghế.</p>';
        return;
    }

    // Gom nhóm ghế theo hàng (A, B, C...)
    const theoHang = {};
    dsGhe.forEach(g => {
        const hang = g.hangGhe || String(g.soGhe || g.maGhe || '').charAt(0) || 'A';
        (theoHang[hang] ||= []).push(g);
    });

    const mauTrangThai = {
        TRONG: 'background:#FFFFFF; border:1px solid #EEDDD0; color:#3D3029;',
        DANG_GIU: 'background:#FFDFC4; border:1px solid #C45116; color:#3D3029;',
        DA_DAT: 'background:#C45116; border:1px solid #A64010; color:#FFFFFF;',
        DA_BAN: 'background:#C45116; border:1px solid #A64010; color:#FFFFFF;',
        BAO_TRI: 'background:#75665C; border:1px solid #3D3029; color:#FFFFFF;'
    };

    $('so-do-ghe').innerHTML = Object.entries(theoHang).map(([hang, ghes]) => `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <strong style="width:28px; display:inline-block;">${thoat(hang)}</strong>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${ghes.map(g => {
                    const nhan = g.tenGhe || g.soGhe || g.maGhe;
                    const style = mauTrangThai[g.trangThai] || mauTrangThai.TRONG;
                    return `<span title="${thoat(nhan)} - ${thoat(g.loaiGhe || '')} (${thoat(g.trangThai)})"
                        style="${style} min-width:42px; height:36px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:600;">
                        ${thoat(nhan)}
                    </span>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

$('nut-huy').addEventListener('click', () => {
    if (!duLieuSuat) return;
    if (soGheDaBan > 0) {
        hienThongBao($('thong-bao'),
            `Không thể hủy suất chiếu này vì đã có ${soGheDaBan} ghế được bán cho khách hàng!`,
            'loi'
        );
        return;
    }
    const lyDo = prompt(`Xác nhận hủy suất chiếu ${maSuat}?\nNhập lý do hủy suất:`);
    if (lyDo === null) return;
    if (!lyDo.trim()) {
        hienThongBao($('thong-bao'), 'Vui lòng nhập lý do hủy suất chiếu.', 'loi');
        return;
    }
    $('trang-thai').innerHTML = chipTrangThai('DA_HUY', NHAN.trangThaiSuat);
    $('nut-huy').hidden = true;
    hienThongBao($('thong-bao'),
        `Đã xác nhận hủy suất chiếu (giao diện mẫu). Lý do: "${lyDo.trim()}". Dữ liệu CSDL không bị thay đổi.`,
        'thanh-cong'
    );
});