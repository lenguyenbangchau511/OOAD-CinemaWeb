import {tien, anToan, trangThaiTon, thongBao} from './kho-common.js';
const $ = id => document.getElementById(id);
let sanPham = [], bienDong = [];
const tenLoai = {DO_AN:'Đồ ăn',THUC_UONG:'Thức uống'};
const tenBienDong = {NHAP_KHO:'Nhập kho',BAN_HANG:'Bán hàng',KIEM_KE:'Kiểm kê',DIEU_CHINH:'Điều chỉnh'};
const status = $('api-status');

async function api(url) {
  const response = await fetch(url, {credentials:'same-origin', headers:{'Accept':'application/json'}});
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try { const body = await response.json(); message = body.thongBao || body.message || body.thongDiep || message; } catch {}
    throw new Error(message);
  }
  return response.json();
}
function capNhat() {
  $('tong-mat-hang').textContent = sanPham.length;
  $('dang-ban').textContent = sanPham.filter(p=>p.trangThai==='DANG_BAN').length;
  $('sap-het').textContent = sanPham.filter(p=>p.soLuongTon>0 && p.soLuongTon<=p.mucTonToiThieu).length;
  $('het-hang').textContent = sanPham.filter(p=>p.soLuongTon===0).length;
  const q=$('tu-khoa').value.trim().toLocaleLowerCase('vi');
  const loai=$('loai').value, tinh=$('tinh-trang').value;
  const ds=sanPham.filter(p=>{
    const tt=p.soLuongTon===0?'het-hang':p.soLuongTon<=p.mucTonToiThieu?'sap-het':'binh-thuong';
    return (!q || (p.maSanPham+' '+p.tenSanPham).toLocaleLowerCase('vi').includes(q)) && (!loai||p.loaiSanPham===loai) && (!tinh||tt===tinh);
  });
  $('ds-ton').innerHTML=ds.length?ds.map(p=>{
    const [label,cls]=trangThaiTon(p);
    return `<tr><td><strong>${anToan(p.maSanPham)}</strong></td><td><div class="name-cell"><span class="kho-thumb">${p.hinhAnh?`<img src="${anToan(p.hinhAnh)}" alt="">`:p.loaiSanPham==='DO_AN'?'🍿':'🥤'}</span><span>${anToan(p.tenSanPham)}<small>${p.trangThai==='DANG_BAN'?'Đang bán':'Ngừng bán'}</small></span></div></td><td>${tenLoai[p.loaiSanPham]||anToan(p.loaiSanPham)}</td><td>${anToan(p.donViTinh)}</td><td class="so"><strong>${p.soLuongTon}</strong></td><td class="so">${p.mucTonToiThieu}</td><td><span class="chip ${cls}">${label}</span></td><td class="row-actions"><a class="button secondary nho" href="san-pham-chi-tiet.html?ma=${encodeURIComponent(p.maSanPham)}">Chi tiết</a><a class="button secondary nho" href="san-pham-form.html?ma=${encodeURIComponent(p.maSanPham)}">Sửa</a></td></tr>`;
  }).join(''):`<tr><td colspan="8" style="text-align:center;padding:26px">Không tìm thấy sản phẩm phù hợp.</td></tr>`;
  const selected=$('loc-san-pham').value;
  $('loc-san-pham').innerHTML='<option value="">Tất cả sản phẩm</option>'+sanPham.map(p=>`<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)}</option>`).join('');
  $('loc-san-pham').value=selected;
  locLichSu();
}
function locLichSu(){
  const ma=$('loc-san-pham').value, loai=$('loc-bien-dong').value;
  const ds=bienDong.filter(x=>(!ma||x.maSanPham===ma)&&(!loai||x.loai===loai));
  $('ds-lichsu').innerHTML=ds.length?ds.map(x=>`<tr><td>${anToan(x.thoiDiem)}</td><td>${anToan(x.maSanPham)} · ${anToan(x.tenSanPham||sanPham.find(p=>p.maSanPham===x.maSanPham)?.tenSanPham||'')}</td><td>${tenBienDong[x.loai]||anToan(x.loai)}</td><td class="so ${x.soLuongThayDoi<0?'low-stock':'good-stock'}">${x.soLuongThayDoi>0?'+':''}${x.soLuongThayDoi}</td><td class="so">${x.tonTruoc}</td><td class="so">${x.tonSau}</td><td>${anToan(x.maThamChieu||'—')}</td><td>${anToan(x.ghiChu||'—')}</td></tr>`).join(''):`<tr><td colspan="8" style="text-align:center;padding:26px">Chưa có dữ liệu biến động phù hợp.</td></tr>`;
}
async function taiDuLieu(){
  status.hidden=false; status.className='alert thong-tin'; status.textContent='Đang tải dữ liệu tồn kho từ máy chủ...';
  try {
    const [sp, bd] = await Promise.all([
      api('/api/quan-ly/ton-kho'),
      api('/api/quan-ly/ton-kho/bien-dong')
    ]);
    sanPham=sp; bienDong=bd;
    capNhat();
    status.className='alert thanh-cong'; status.textContent=`Đã kết nối CSDL Spring Boot: ${sanPham.length} sản phẩm và ${bienDong.length} bản ghi biến động kho.`;
  } catch (e) {
    status.className='alert loi';
    status.textContent=`Không tải được dữ liệu từ máy chủ: ${e.message}. Hãy đăng nhập bằng tài khoản có quyền Quản lý/Nhân viên rồi tải lại trang.`;
    $('ds-ton').innerHTML='<tr><td colspan="8" style="text-align:center;padding:26px">Không thể tải dữ liệu. Vui lòng kiểm tra đăng nhập và máy chủ.</td></tr>';
    $('ds-lichsu').innerHTML='<tr><td colspan="8" style="text-align:center;padding:26px">Không thể tải dữ liệu.</td></tr>';
  }
}
['tu-khoa','loai','tinh-trang'].forEach(id=>$(id).addEventListener('input',capNhat));
$('xoa-loc').addEventListener('click',()=>{$('tu-khoa').value='';$('loai').value='';$('tinh-trang').value='';capNhat();});
$('loc-san-pham').addEventListener('change',locLichSu); $('loc-bien-dong').addEventListener('change',locLichSu);
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));
 $('bang-ton').hidden=b.dataset.tab!=='ton'; $('bang-lichsu').hidden=b.dataset.tab!=='lichsu';
}));
taiDuLieu();
