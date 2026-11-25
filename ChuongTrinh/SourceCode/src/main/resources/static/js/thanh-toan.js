/* Giao diện 10 - Thanh toán đơn hàng (UC5.5). Chạy thật: kiểm tra đơn, tạo giao dịch, ghi nhận kết quả từ cổng sandbox. */
import {
    dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao, layPhienDatVe, luuPhienDatVe,
    NHAN, taoDongHoDemNguoc, thamSo, thoat
} from './datve-common.js';

const $ = (id) => document.getElementById(id);
let maDonHang = thamSo('maDonHang') || layPhienDatVe().maDonHang;
const maPhienGiu = layPhienDatVe().maPhienGiu;
/** Danh sách ghế đã chốt của đơn (lưu từ bước chọn ghế); server đối chiếu đúng với ghế đang giữ. */
const dsMaGheSuat = (layPhienDatVe().dsGhe || []).map((g) => g.maGheSuat);
let don = null;          // DonThanhToanDto
let giaoDich = null;     // ThanhToanDto đang xử lý (CHO_XU_LY)
let dangXuLy = false;
const dongHo = taoDongHoDemNguoc($('dem-nguoc'), () => {
    hienThongBao($('thong-bao'), 'Hết thời gian giữ ghế. Vui lòng chọn lại ghế.', 'loi');
    khoaThanhToan();
});

khoiTao();

async function khoiTao() {
    try {
        if (!maDonHang && thamSo('tamThoi')) {          // chưa có giao diện 8/9: tạo đơn tạm chỉ gồm vé
            const moi = await goiApi('/api/thanh-toan/don-tam', { method: 'POST', body: { maPhienGiu } });
            maDonHang = moi.maDonHang;
            luuPhienDatVe({ maDonHang });
            history.replaceState(null, '', `thanh-toan.html?maDonHang=${encodeURIComponent(maDonHang)}`);
        }
        if (!maDonHang) {
            hienThongBao($('thong-bao'), 'Chưa có đơn hàng để thanh toán. Vui lòng bắt đầu từ bước chọn ghế.', 'loi');
            $('ma-don').textContent = '';
            return;
        }
        await taiDon();
    } catch (loi) {
        $('ma-don').textContent = '';
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
    }
    $('form-tt').addEventListener('submit', khoiTaoThanhToan);
    $('sandbox').querySelectorAll('button[data-kq]').forEach((nut) => nut.addEventListener('click', () => baoKetQua(nut.dataset.kq)));
}

async function taiDon() {
    don = await goiApi(`/api/thanh-toan/don-hang/${encodeURIComponent(maDonHang)}` +
        (maPhienGiu ? `?maPhienGiu=${encodeURIComponent(maPhienGiu)}` +
            (dsMaGheSuat.length ? `&dsMaGheSuat=${dsMaGheSuat.map(encodeURIComponent).join(',')}` : '') : ''));
    if (don.trangThai === 'DA_THANH_TOAN') {          // 3c: đã thanh toán rồi -> xem kết quả
        location.replace(`ket-qua-dat-ve.html?maDonHang=${encodeURIComponent(maDonHang)}`);
        return;
    }
    veDon();
    giaoDich = don.thanhToanDangCho;
    const ptDaChon = giaoDich?.phuongThuc || layPhienDatVe().phuongThuc;
    document.querySelectorAll('input[name="pt"]').forEach((r) => { r.checked = r.value === ptDaChon; });

    if (!don.choPhepThanhToan) {
        hienThongBao($('thong-bao'), don.lyDoKhongThanhToan, 'loi');
        khoaThanhToan();
        $('trang-thai-tt').innerHTML = '<span class="chip xau">Không thể thanh toán</span>';
        return;
    }
    dongHo.bat(don.soGiayConLai);
    if (giaoDich) {                                   // 6b: đã có giao dịch chờ xác minh
        hienSandbox();
        datTrangThai('CHO_XAC_MINH');
    } else {
        datTrangThai('CHO_THANH_TOAN');
    }
}

function veDon() {
    $('noi-dung').hidden = false;
    $('ma-don').textContent = `Mã đơn hàng: ${don.maDonHang}`;
    $('ten-phim').textContent = don.tenPhim || '';
    $('thong-tin-suat').textContent = don.ngayChieu
        ? `${dinhDangNgay(don.ngayChieu)} · ${dinhDangGio(don.gioBatDau)} · ${don.tenPhong || ''}` : '';
    $('ds-ghe').innerHTML = don.dsGhe.map((g) =>
        `<span class="ghe-chip">${thoat(g.tenGhe)} <span class="muted">${NHAN.loaiGhe[g.loaiGhe] || ''} · ${dinhDangTien(g.giaVe)}</span></span>`).join('');
    $('khoi-dich-vu').hidden = don.dsDichVu.length === 0;
    $('ds-dich-vu').innerHTML = don.dsDichVu.map((d) =>
        `<div class="dong-tien"><span>${thoat(d.ten)} × ${d.soLuong}</span><span>${dinhDangTien(d.thanhTien)}</span></div>`).join('');
    $('tien-ve').textContent = dinhDangTien(don.tienVe);
    $('dong-dich-vu').hidden = don.dsDichVu.length === 0;
    $('tien-dich-vu').textContent = dinhDangTien(don.tienDichVu);
    $('dong-km').hidden = !(Number(don.giamKhuyenMai) > 0);
    $('ma-km').textContent = don.maKhuyenMai ? `(${don.maKhuyenMai})` : '';
    $('giam-km').textContent = '-' + dinhDangTien(don.giamKhuyenMai);
    $('dong-diem').hidden = !(Number(don.giamDiem) > 0);
    $('so-diem').textContent = don.diemSuDung;
    $('giam-diem').textContent = '-' + dinhDangTien(don.giamDiem);
    $('tong-tien').textContent = dinhDangTien(don.tongTien);
    $('nut-thanh-toan').textContent = `Thanh toán ${dinhDangTien(don.tongTien)}`;
}

function datTrangThai(ma) {
    const bang = {
        CHO_THANH_TOAN: '<span class="chip cho">Chờ thanh toán</span>',
        CHO_XAC_MINH: '<span class="chip cho">Đang chờ xác minh</span>',
        THAT_BAI: '<span class="chip xau">Thanh toán thất bại</span>'
    };
    $('trang-thai-tt').innerHTML = bang[ma] || '';
    const dangCho = ma === 'CHO_XAC_MINH';          // chưa biết kết quả cũ thì không cho tạo giao dịch mới
    $('nut-thanh-toan').disabled = dangCho;
    $('nhom-phuong-thuc').disabled = dangCho;
}

function khoaThanhToan() {
    $('nut-thanh-toan').disabled = true;
    $('nhom-phuong-thuc').disabled = true;
    $('sandbox').hidden = true;
    dongHo.dung();
}

function hienSandbox() {
    $('ma-gd').textContent = giaoDich.maGiaoDichDoiTac;
    $('sandbox').hidden = false;
}

async function khoiTaoThanhToan(e) {
    e.preventDefault();
    if (dangXuLy) return;
    const pt = document.querySelector('input[name="pt"]:checked')?.value;
    if (!pt) {
        hienThongBao($('thong-bao'), 'Vui lòng chọn phương thức thanh toán', 'loi');
        return;
    }
    dangXuLy = true;
    hienThongBao($('thong-bao'), '');
    try {
        giaoDich = await goiApi('/api/thanh-toan/khoi-tao', { method: 'POST', body: { maDonHang, maPhienGiu, phuongThuc: pt, dsMaGheSuat } });
        luuPhienDatVe({ phuongThuc: pt });
        hienSandbox();
        hienThongBao($('thong-bao'), `Đã tạo giao dịch qua ${NHAN.phuongThuc[giaoDich.phuongThuc]}. Đang chờ cổng thanh toán báo kết quả.`, 'thong-tin');
    } catch (loi) {
        if (loi.ma === 'DA_THANH_TOAN' || loi.ma === 'DA_THU_TIEN') {
            location.replace(`ket-qua-dat-ve.html?maDonHang=${encodeURIComponent(maDonHang)}`);
            return;
        }
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
        if (loi.ma === 'HET_GIU_GHE' || loi.ma === 'SUAT_KHONG_KHA_DUNG') khoaThanhToan();
    } finally {
        dangXuLy = false;
    }
}

/** Mô phỏng cổng thanh toán gọi lại hệ thống. */
async function baoKetQua(ketQua) {
    if (dangXuLy || !giaoDich) return;
    dangXuLy = true;
    try {
        const kq = await goiApi(`/api/thanh-toan/${encodeURIComponent(giaoDich.maThanhToan)}/ket-qua`, {
            method: 'POST', body: { maPhienGiu, ketQua, soTien: giaoDich.soTien, dsMaGheSuat }
        });
        if (['THANH_CONG', 'CAN_DOI_SOAT', 'CHO_PHAT_HANH'].includes(kq.ketQua)) {
            location.href = `ket-qua-dat-ve.html?maDonHang=${encodeURIComponent(maDonHang)}`;
        } else if (kq.ketQua === 'THAT_BAI') {
            giaoDich = null;
            $('sandbox').hidden = true;
            datTrangThai('THAT_BAI');
            hienThongBao($('thong-bao'), kq.thongBao, 'loi');
        } else {
            datTrangThai('CHO_XAC_MINH');
            hienThongBao($('thong-bao'), kq.thongBao, 'thong-tin');
        }
    } catch (loi) {
        hienThongBao($('thong-bao'), loi.thongBao, 'loi');
    } finally {
        dangXuLy = false;
    }
}
