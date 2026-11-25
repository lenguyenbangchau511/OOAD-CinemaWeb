/* Giao diện 7 - Chọn ghế và giữ ghế (UC5.1, UC5.2). Chạy thật với API /api/suat-chieu/{maSuat}/so-do-ghe và /api/giu-ghe. */
import {
    TRANG, layNguoiDungDatVe, dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao, layPhienDatVe,
    luuPhienDatVe, NHAN, taoDongHoDemNguoc, thamSo, thoat, xoaPhienDatVe
} from './datve-common.js';

const maSuat = thamSo('maSuat');
const el = {
    thongBao: document.getElementById('thong-bao'), soDo: document.getElementById('so-do'),
    tieuDe: document.getElementById('tieu-de-phim'), thongTinSuat: document.getElementById('thong-tin-suat'),
    gheChon: document.getElementById('ghe-chon'), chuaChon: document.getElementById('chua-chon'),
    tamTinh: document.getElementById('tam-tinh'), nutHuy: document.getElementById('nut-huy'),
    nutTiepTuc: document.getElementById('nut-tiep-tuc'), khoiDem: document.getElementById('khoi-dem'),
    dem: document.getElementById('dem-nguoc'), soGheToiDa: document.getElementById('so-ghe-toi-da'),
    buocChonSuat: document.getElementById('buoc-chon-suat'), linkChonSuat: document.getElementById('link-chon-suat'),
    nutQuayLai: document.getElementById('nut-quay-lai')
};

let maPhienGiu = null;      // phiên giữ ghế hiện tại (lưu trong sessionStorage để sang bước sau vẫn dùng được)
let phienHienTai = null;    // PhienGiuDto gần nhất
let suatHienTai = null;
let daDangNhap = true;
let dangXuLy = false;
const dongHo = taoDongHoDemNguoc(el.dem, hetGio);

khoiTao();

async function khoiTao() {
    const luu = layPhienDatVe();
    if (luu.daXacNhan && luu.maDonHang && (!maSuat || luu.maSuat === maSuat)) {
        location.replace(`thanh-toan.html?maDonHang=${encodeURIComponent(luu.maDonHang)}`);
        return;
    }
    if (!maSuat) {
        el.soDo.innerHTML = '<div class="trong"><h2>Chưa chọn suất chiếu</h2><p>Vui lòng chọn suất chiếu từ trang phim.</p><a class="button primary" href="./">Về trang chủ</a></div>';
        el.thongTinSuat.textContent = '';
        return;
    }
    maPhienGiu = luu.maSuat === maSuat ? luu.maPhienGiu || null : null;
    const toi = await layNguoiDungDatVe();
    daDangNhap = !toi || toi.dangNhap;
    if (!daDangNhap) {
        hienThongBao(el.thongBao, 'Bạn có thể xem sơ đồ ghế. Vui lòng đăng nhập để giữ ghế.', 'thong-tin');
    }
    await taiSoDo();
    if (maPhienGiu && daDangNhap) await dongBoPhien();
    el.nutHuy.addEventListener('click', huyGiuGhe);
    el.nutTiepTuc.addEventListener('click', tiepTuc);
    setInterval(() => { if (!dangXuLy) taiSoDo(true); }, 15000);   // thấy ghế người khác vừa giữ / bán
}

async function taiSoDo(imLang = false) {
    try {
        const sd = await goiApi(`/api/suat-chieu/${encodeURIComponent(maSuat)}/so-do-ghe` +
            (maPhienGiu ? `?maPhienGiu=${encodeURIComponent(maPhienGiu)}` : ''), { chuyenKhiChuaDangNhap: false });
        veThongTinSuat(sd);
        veSoDo(sd);
        el.soGheToiDa.textContent = sd.soGheToiDa;
        if (sd.thongBao) {
            hienThongBao(el.thongBao, `${sd.thongBao}. Vui lòng chọn suất chiếu khác.`, 'loi');
        }
    } catch (loi) {
        if (!imLang) {
            el.soDo.innerHTML = '';
            hienThongBao(el.thongBao, loi.thongBao, 'loi');
        }
    }
}

function veThongTinSuat(sd) {
    const s = sd.suat;
    suatHienTai = s;
    el.tieuDe.textContent = s.tenPhim + (s.gioiHanDoTuoi ? ` (${s.gioiHanDoTuoi})` : '');
    el.thongTinSuat.textContent = `${dinhDangNgay(s.ngayChieu)} · ${dinhDangGio(s.gioBatDau)} - ${dinhDangGio(s.gioKetThuc)} · ` +
        `${s.tenPhong} (${NHAN.loaiPhong[s.loaiPhong] || s.loaiPhong})`;
    const suatHref = s.maPhim ? `chi-tiet-phim.html?maPhim=${encodeURIComponent(s.maPhim)}#lich-chieu` : './';
    [el.buocChonSuat, el.linkChonSuat, el.nutQuayLai].forEach((a) => { if (a) a.href = suatHref; });
}

function veSoDo(sd) {
    const theoHang = new Map();
    sd.ghe.forEach((g) => { if (!theoHang.has(g.hang)) theoHang.set(g.hang, []); theoHang.get(g.hang).push(g); });
    const choPhep = !sd.thongBao;
    el.soDo.innerHTML = [...theoHang.entries()].map(([hang, dsGhe]) => `
        <div class="hang-ghe" role="group" aria-label="Hàng ${thoat(hang)}">
            <span class="hang-nhan" aria-hidden="true">${thoat(hang)}</span>
            ${dsGhe.map((g) => nutGhe(g, choPhep)).join('')}
        </div>`).join('');
    el.soDo.querySelectorAll('button.seat').forEach((nut) => nut.addEventListener('click', () => chonGhe(nut.dataset.ma, nut.dataset.cuaToi === '1')));
}

const BIEU_TUONG = { CUA_TOI: '✓', DANG_GIU: '…', DA_DAT: '✕', BAO_TRI: '–' };
const NHAN_TRANG_THAI = { TRONG: 'trống', DANG_GIU: 'đang được giữ', DA_DAT: 'đã bán', BAO_TRI: 'bảo trì' };

function nutGhe(g, choPhep) {
    const trangThai = g.cuaToi ? 'CUA_TOI' : g.trangThai;
    const bam = choPhep && (g.cuaToi || g.trangThai === 'TRONG');
    const loai = g.loaiGhe === 'VIP' ? 'vip' : g.loaiGhe === 'SWEETBOX' ? 'sweetbox' : '';
    const mota = `Ghế ${g.tenGhe}, ${NHAN.loaiGhe[g.loaiGhe] || g.loaiGhe}, ${dinhDangTien(g.giaVe)}, ` +
        (g.cuaToi ? 'ghế bạn đang giữ' : NHAN_TRANG_THAI[g.trangThai]);
    return `<button type="button" class="seat ${loai} ${trangThai}" data-ma="${thoat(g.maGheSuat)}" data-cua-toi="${g.cuaToi ? 1 : 0}"
        aria-label="${thoat(mota)}" aria-pressed="${g.cuaToi}" ${bam ? '' : 'disabled'}>${BIEU_TUONG[trangThai] || thoat(g.tenGhe)}</button>`;
}

/** Chọn ghế trống -> giữ ghế; bấm lại ghế của mình -> bỏ giữ. */
async function chonGhe(maGheSuat, laCuaToi) {
    if (dangXuLy) return;
    if (!daDangNhap) {
        location.href = `${TRANG.dangNhap}?quayLai=${encodeURIComponent(location.pathname + location.search)}`;
        return;
    }
    dangXuLy = true;
    hienThongBao(el.thongBao, '');
    try {
        phienHienTai = laCuaToi
            ? await goiApi(`/api/giu-ghe/${encodeURIComponent(maPhienGiu)}/ghe/${encodeURIComponent(maGheSuat)}`, { method: 'DELETE' })
            : await goiApi('/api/giu-ghe', { method: 'POST', body: { maSuat, maPhienGiu, dsMaGheSuat: [maGheSuat] } });
        maPhienGiu = phienHienTai.maPhienGiu;
        if (layPhienDatVe().maPhienGiu !== maPhienGiu) xoaPhienDatVe();
        luuPhienDatVe({
            maSuat,
            maPhienGiu,
            maPhim: suatHienTai?.maPhim || layPhienDatVe().maPhim || null,
            tenPhim: suatHienTai?.tenPhim || layPhienDatVe().tenPhim || null
        });
        veTomTat();
    } catch (loi) {
        hienThongBao(el.thongBao, loi.thongBao, 'loi');   // vd "Ghế đã có người chọn, vui lòng chọn ghế khác"
    } finally {
        dangXuLy = false;
        await taiSoDo(true);     // làm mới sơ đồ (đổi màu ghế vừa giữ / ghế bị người khác lấy)
    }
}

async function dongBoPhien() {
    try {
        phienHienTai = await goiApi(`/api/giu-ghe/${encodeURIComponent(maPhienGiu)}`, { chuyenKhiChuaDangNhap: false });
        veTomTat();
    } catch {
        phienHienTai = null;       // phiên cũ đã hết hạn
        maPhienGiu = null;
        xoaPhienDatVe();
        veTomTat();
        await taiSoDo(true);
    }
}

function veTomTat() {
    const ds = phienHienTai?.dsGhe || [];
    el.chuaChon.hidden = ds.length > 0;
    el.gheChon.innerHTML = ds.map((g) => `<span class="ghe-chip">${thoat(g.tenGhe)} <span class="muted">${dinhDangTien(g.giaVe)}</span></span>`).join('');
    el.tamTinh.textContent = dinhDangTien(phienHienTai?.tamTinh || 0);
    el.nutHuy.disabled = ds.length === 0;
    el.nutTiepTuc.disabled = ds.length === 0;
    el.khoiDem.hidden = ds.length === 0;
    if (ds.length) dongHo.bat(phienHienTai.soGiayConLai); else dongHo.dung();
}

async function hetGio() {
    hienThongBao(el.thongBao, 'Hết thời gian giữ ghế. Các ghế đã được trả lại, vui lòng chọn lại ghế.', 'loi');
    maPhienGiu = null;
    phienHienTai = null;
    xoaPhienDatVe();
    veTomTat();
    await taiSoDo(true);
}

async function huyGiuGhe() {
    if (!maPhienGiu || dangXuLy) return;
    dangXuLy = true;
    try {
        await goiApi(`/api/giu-ghe/${encodeURIComponent(maPhienGiu)}`, { method: 'DELETE' });
        maPhienGiu = null;
        phienHienTai = null;
        xoaPhienDatVe();
        veTomTat();
        hienThongBao(el.thongBao, 'Đã hủy giữ ghế.', 'thong-tin');
    } catch (loi) {
        hienThongBao(el.thongBao, loi.thongBao, 'loi');
    } finally {
        dangXuLy = false;
        await taiSoDo(true);
    }
}

/** Sang bước chọn đồ ăn (giao diện 8 của Châu). Nếu trang đó chưa có thì đi thẳng sang thanh toán (đơn tạm). */
async function tiepTuc() {
    if (!phienHienTai || phienHienTai.dsGhe.length === 0) {
        hienThongBao(el.thongBao, 'Vui lòng chọn ít nhất một ghế', 'loi');
        return;
    }
    luuPhienDatVe({
        maSuat,
        maPhienGiu,
        maPhim: suatHienTai?.maPhim || layPhienDatVe().maPhim || null,
        tenPhim: suatHienTai?.tenPhim || layPhienDatVe().tenPhim || null,
        tamTinh: phienHienTai.tamTinh,
        dsGhe: phienHienTai.dsGhe.map((g) => ({ maGheSuat: g.maGheSuat, tenGhe: g.tenGhe, loaiGhe: g.loaiGhe, giaVe: g.giaVe }))
    });
    let coTrangDoAn = false;
    try { coTrangDoAn = (await fetch(TRANG.chonDoAn, { method: 'HEAD' })).ok; } catch { /* bỏ qua */ }
    location.href = coTrangDoAn ? TRANG.chonDoAn : 'thanh-toan.html?tamThoi=1';
}
