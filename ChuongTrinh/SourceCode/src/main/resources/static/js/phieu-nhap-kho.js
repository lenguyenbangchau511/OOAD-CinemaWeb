import {docKho,ghiKho,tien,anToan,taoMa,ngayGio,thongBao} from './kho-common.js';
const $=id=>document.getElementById(id),state=docKho(),form=$('form-phieu-nhap');
$('ma-phieu').value=taoMa('PN',state.phieuNhap,'maPhieu');$('ngay').value=new Date().toISOString().slice(0,10);
const products=state.sanPham;const list=$('ds-dong');
function themDong(ma='',sl=1,dg=0){
 const row=document.createElement('div');row.className='line-item';
 row.innerHTML=`<div class="field"><label>Sản phẩm</label><select class="sp"><option value="">Chọn sản phẩm</option>${products.map(p=>`<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)}</option>`).join('')}</select></div><div class="field"><label>Số lượng nhập</label><input class="sl" type="number" min="1" step="1" value="${sl}"></div><div class="field"><label>Đơn giá nhập</label><input class="dg" type="number" min="0" step="500" value="${dg}"></div><div class="field"><label>Thành tiền</label><input class="tt" readonly value="0 ₫"></div><button class="icon-btn" type="button" title="Xóa dòng">×</button>`;
 row.querySelector('.sp').value=ma;row.querySelectorAll('input').forEach(i=>i.addEventListener('input',tinh));row.querySelector('button').addEventListener('click',()=>{row.remove();tinh();});list.append(row);tinh();
}
function tinh(){
 let total=0,qty=0;
 [...list.children].forEach(r=>{const s=Number(r.querySelector('.sl').value)||0,d=Number(r.querySelector('.dg').value)||0,t=s*d;qty+=s;total+=t;r.querySelector('.tt').value=tien(t);});
 $('tong-so-luong').textContent=qty;$('tong-tien').textContent=tien(total);
}
$('them-dong').addEventListener('click',()=>themDong());themDong('SP01',10,22500);
form.addEventListener('submit',e=>{
 e.preventDefault();const rows=[...list.children].map(r=>({maSanPham:r.querySelector('.sp').value,soLuongNhap:Number(r.querySelector('.sl').value),donGiaNhap:Number(r.querySelector('.dg').value)}));
 if(!$('ngay').value||!$('ncc').value.trim()||!rows.length||rows.some(x=>!x.maSanPham||!Number.isInteger(x.soLuongNhap)||x.soLuongNhap<=0||!Number.isFinite(x.donGiaNhap)||x.donGiaNhap<0)){thongBao($('thong-bao'),'Vui lòng nhập ngày, nhà cung cấp và các dòng sản phẩm hợp lệ.','loi');return;}
 if(new Set(rows.map(x=>x.maSanPham)).size!==rows.length){thongBao($('thong-bao'),'Mỗi sản phẩm chỉ được xuất hiện một lần trong phiếu nhập.','loi');return;}
 const ma=$('ma-phieu').value,phieu={maPhieu:ma,ngayNhap:$('ngay').value,nhaCungCap:$('ncc').value.trim(),ghiChu:$('ghi-chu').value,chiTiet:rows,tongTien:rows.reduce((s,x)=>s+x.soLuongNhap*x.donGiaNhap,0),thoiDiemLuu:ngayGio()};
 state.phieuNhap.push(phieu);
 rows.forEach(x=>{const p=state.sanPham.find(p=>p.maSanPham===x.maSanPham);const truoc=p.soLuongTon;p.soLuongTon+=x.soLuongNhap;state.bienDong.push({ma:taoMa('BD',state.bienDong,'ma'),maSanPham:p.maSanPham,thoiDiem:ngayGio(),loai:'NHAP_KHO',soLuongThayDoi:x.soLuongNhap,tonTruoc:truoc,tonSau:p.soLuongTon,maThamChieu:ma,ghiChu:'Nhập kho demo'});});
 ghiKho(state);thongBao($('thong-bao'),`Đã lưu phiếu ${ma} trong dữ liệu demo và cập nhật tồn kho trên trình duyệt.`,'thanh-cong');form.querySelector('button[type=submit]').disabled=true;
});
