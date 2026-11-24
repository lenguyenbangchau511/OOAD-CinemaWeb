import {docKho,ghiKho,anToan,thongBao} from './kho-common.js';
const $=id=>document.getElementById(id), state=docKho(), maSua=new URLSearchParams(location.search).get('ma');
const form=$('form-san-pham'), preview=$('preview');
if(maSua){
 const p=state.sanPham.find(x=>x.maSanPham===maSua);
 if(!p){thongBao($('thong-bao'),'Không tìm thấy sản phẩm.','loi');}
 else{
  document.querySelector('h1').textContent='Sửa sản phẩm';
  Object.entries({ma:p.maSanPham,ten:p.tenSanPham,loai:p.loaiSanPham,'don-vi':p.donViTinh,gia:p.giaBan,'trang-thai':p.trangThai,anh:p.hinhAnh||'','mo-ta':p.moTa}).forEach(([k,v])=>$(k).value=v);
  $('ma').readOnly=true; xemAnh();
 }
}
$('anh').addEventListener('input',xemAnh);
function xemAnh(){const u=$('anh').value.trim(); preview.innerHTML=u?`<img src="${anToan(u)}" alt="Ảnh xem trước" onerror="this.remove()">`:'🍿';}
form.addEventListener('submit',e=>{
 e.preventDefault();
 const ma=$('ma').value.trim().toUpperCase(),ten=$('ten').value.trim(),gia=Number($('gia').value);
 if(!ma||!ten||!$('don-vi').value.trim()||!$('mo-ta').value.trim()||!Number.isFinite(gia)||gia<0){thongBao($('thong-bao'),'Vui lòng nhập đầy đủ thông tin và giá bán hợp lệ.','loi');return;}
 if(!/^[A-Z0-9_-]{2,10}$/.test(ma)){thongBao($('thong-bao'),'Mã sản phẩm gồm 2–10 ký tự chữ, số, _ hoặc -.','loi');return;}
 const trung=state.sanPham.some(p=>p.maSanPham.toLowerCase()===ma.toLowerCase()&&p.maSanPham!==maSua);
 if(trung){thongBao($('thong-bao'),'Mã sản phẩm đã tồn tại.','loi');return;}
 const p={maSanPham:ma,tenSanPham:ten,loaiSanPham:$('loai').value,donViTinh:$('don-vi').value.trim(),giaBan:gia,moTa:$('mo-ta').value.trim(),hinhAnh:$('anh').value.trim(),trangThai:$('trang-thai').value,soLuongTon:0,mucTonToiThieu:5,icon:$('loai').value==='DO_AN'?'🍿':'🥤'};
 if(maSua){const i=state.sanPham.findIndex(x=>x.maSanPham===maSua); if(i>=0){p.soLuongTon=state.sanPham[i].soLuongTon;p.mucTonToiThieu=state.sanPham[i].mucTonToiThieu;p.icon=state.sanPham[i].icon;state.sanPham[i]=p;}}
 else state.sanPham.push(p);
 ghiKho(state);thongBao($('thong-bao'),`Đã ${maSua?'cập nhật':'thêm'} sản phẩm ${ma} trong dữ liệu demo.`,'thanh-cong');
 setTimeout(()=>location.href=`san-pham-chi-tiet.html?ma=${encodeURIComponent(ma)}`,700);
});
