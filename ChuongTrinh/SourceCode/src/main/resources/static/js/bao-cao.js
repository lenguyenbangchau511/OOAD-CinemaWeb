/* Giao diện 45 - Báo cáo và thống kê (UC11.1 - UC11.6).
   Tab Doanh thu chạy thật: GET /api/bao-cao/doanh-thu?tuNgay=&denNgay=.
   Các tab còn lại và Xuất Excel là giao diện mẫu. */
import { $, dinhDangNgay, dinhDangSo, docDuLieu, ganTab, hienThongBao, htmlTien, ngay, thoat } from './quan-ly-common.js';
import { BAO_CAO_MAU, doanhThuMau } from './du-lieu-mau-quan-ly.js';

$('tu-ngay').value = ngay(-6);
$('den-ngay').value = ngay(0);
ganTab(document.querySelector('[role="tablist"]'));
$('chon-nhanh').addEventListener('change', chonNhanh);
$('bo-loc').addEventListener('submit', (e) => { e.preventDefault(); xemBaoCao(); });
$('xuat-excel').addEventListener('click', () => hienThongBao($('thong-bao'),
    'Giao diện mẫu: chức năng xuất Excel sẽ tạo tệp .xlsx theo đúng bảng và khoảng thời gian đang xem.', 'thong-tin'));
xemBaoCao();
hienCacTabMau();

function chonNhanh() {
    const v = $('chon-nhanh').value;
    if (!v) return;
    $('den-ngay').value = ngay(0);
    $('tu-ngay').value = v === 'thang' ? ngay(0).slice(0, 8) + '01' : ngay(1 - Number(v));
    xemBaoCao();
}

/* ------------------------------------------------ Tab Doanh thu (chạy thật) */
async function xemBaoCao() {
    const tuNgay = $('tu-ngay').value;
    const denNgay = $('den-ngay').value;
    if (!tuNgay || !denNgay) { hienThongBao($('thong-bao'), 'Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.', 'loi'); return; }
    if (tuNgay > denNgay) { hienThongBao($('thong-bao'), 'Ngày bắt đầu không được sau ngày kết thúc.', 'loi'); return; }
    hienThongBao($('thong-bao'), '');

    let ds;
    try {
        ds = await docDuLieu(`/api/bao-cao/doanh-thu?tuNgay=${tuNgay}&denNgay=${denNgay}`, doanhThuMau(tuNgay, denNgay));
    } catch (loi) {
        $('pn-doanh-thu').innerHTML = '';
        hienThongBao($('thong-bao'), loi.message, 'loi');   // ví dụ: "Bạn không có quyền thực hiện chức năng này"
        return;
    }
    hienDoanhThu(ds, tuNgay, denNgay);
}

function hienDoanhThu(ds, tuNgay, denNgay) {
    if (!ds.length) {
        $('pn-doanh-thu').innerHTML = '<div class="trong"><h2>Không có dữ liệu trong khoảng thời gian này</h2><p class="muted">Thử chọn khoảng thời gian khác.</p></div>';
        return;
    }
    // Cộng dồn tổng của cả khoảng
    const tong = { soDon: 0, doanhThuVe: 0, doanhThuFnb: 0, giamGia: 0, tongThu: 0 };
    ds.forEach((d) => Object.keys(tong).forEach((k) => { tong[k] += d[k]; }));

    const o = (nhan, giaTri, mau, noiBat = false) => `<div class="card${noiBat ? ' noi-bat' : ''}">
        <p class="muted">${mau ? `<i class="cham" style="background:${mau}"></i>` : ''}${nhan}</p><p class="gia-tri">${giaTri}</p></div>`;

    $('pn-doanh-thu').innerHTML = `
        <div class="o-so-lieu">
            ${o('Doanh thu vé', htmlTien(tong.doanhThuVe), 'var(--mau-ve)')}
            ${o('Doanh thu F&amp;B', htmlTien(tong.doanhThuFnb), 'var(--mau-fnb)')}
            ${o('Giảm giá', '−' + htmlTien(tong.giamGia))}
            ${o('Tổng thu', htmlTien(tong.tongThu), '', true)}
        </div>
        <div class="card">
            <h2>Doanh thu theo ngày</h2>
            <div class="chu-giai"><span><i class="cham" style="background:var(--mau-ve)"></i>Vé</span><span><i class="cham" style="background:var(--mau-fnb)"></i>Đồ ăn, thức uống</span></div>
            ${bieuDo(ds, tuNgay, denNgay)}
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>Ngày</th><th class="so">Số đơn</th><th class="so">Doanh thu vé</th><th class="so">Doanh thu F&amp;B</th><th class="so">Giảm giá</th><th class="so">Tổng thu</th></tr></thead>
            <tbody>${ds.map((d) => `<tr><td>${dinhDangNgay(d.ngay)}</td><td class="so">${d.soDon}</td>
                <td class="so">${htmlTien(d.doanhThuVe)}</td><td class="so">${htmlTien(d.doanhThuFnb)}</td>
                <td class="so">${htmlTien(d.giamGia)}</td><td class="so">${htmlTien(d.tongThu)}</td></tr>`).join('')}</tbody>
            <tfoot><tr><td>Tổng cộng</td><td class="so">${tong.soDon}</td><td class="so">${htmlTien(tong.doanhThuVe)}</td>
                <td class="so">${htmlTien(tong.doanhThuFnb)}</td><td class="so">${htmlTien(tong.giamGia)}</td><td class="so">${htmlTien(tong.tongThu)}</td></tr></tfoot>
        </table></div>
        <p class="muted">Tổng thu = Doanh thu vé + Doanh thu F&amp;B − Giảm giá (khuyến mãi và điểm). Đơn chưa thanh toán hoặc đã hủy không được tính.</p>`;
}

/** Biểu đồ cột chồng: mỗi ngày trong khoảng là một cột, phần dưới là vé, phần trên là F&B. Rê chuột để xem số liệu. */
function bieuDo(ds, tuNgay, denNgay) {
    const theoNgay = Object.fromEntries(ds.map((d) => [d.ngay, d]));
    const max = Math.max(...ds.map((d) => d.doanhThuVe + d.doanhThuFnb));
    let cot = '';
    let nhan = '';
    for (let d = new Date(tuNgay + 'T00:00:00'); d <= new Date(denNgay + 'T00:00:00'); d.setDate(d.getDate() + 1)) {
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const x = theoNgay[iso] || { doanhThuVe: 0, doanhThuFnb: 0 };
        cot += `<div class="cot" title="${dinhDangNgay(iso)}\nVé: ${dinhDangSo(x.doanhThuVe)} ₫\nF&B: ${dinhDangSo(x.doanhThuFnb)} ₫">
            <span style="height:${(x.doanhThuFnb / max) * 100}%;background:var(--mau-fnb)"></span>
            <span style="height:${(x.doanhThuVe / max) * 100}%;background:var(--mau-ve)"></span></div>`;
        nhan += `<span>${iso.slice(8)}/${iso.slice(5, 7)}</span>`;
    }
    return `<div class="bieu-do">${cot}</div><div class="nhan-cot">${nhan}</div>`;
}

/* ------------------------------------------------ Các tab còn lại (giao diện mẫu) */
function bang(cot, dong) {
    return `<p class="ghi-chu-mau">Dữ liệu minh họa: tab này là giao diện mẫu.</p>
        <div class="table-wrap"><table>
        <thead><tr>${cot.map(([ten, so]) => `<th class="${so ? 'so' : ''}">${ten}</th>`).join('')}</tr></thead>
        <tbody>${dong.map((r) => `<tr>${r.map((o, i) => `<td class="${cot[i][1] ? 'so' : ''}">${o}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
}

function hienCacTabMau() {
    const m = BAO_CAO_MAU;
    $('pn-ve-ban').innerHTML = bang([['Loại ghế'], ['Vé bán thành công', 1], ['Đã hủy', 1], ['Đã đổi', 1]],
        m.veBan.map((d) => [thoat(d.nhom), d.soVe, d.daHuy, d.daDoi]));
    $('pn-phim').innerHTML = bang([['Phim'], ['Vé bán', 1], ['Doanh thu vé', 1]],
        m.theoPhim.map((d) => [thoat(d.phim), d.soVe, htmlTien(d.doanhThu)]));
    $('pn-fnb').innerHTML = bang([['Sản phẩm / combo'], ['Loại'], ['Số lượng bán', 1], ['Doanh thu', 1]],
        m.fnb.map((d) => [thoat(d.ten), d.loai, d.soLuong, htmlTien(d.doanhThu)]));
    $('pn-km').innerHTML = bang([['Mã'], ['Chương trình'], ['Lượt sử dụng', 1], ['Tổng giảm', 1]],
        m.khuyenMai.map((d) => [d.ma, thoat(d.ten), d.soLuot, htmlTien(d.tongGiam)]));
}