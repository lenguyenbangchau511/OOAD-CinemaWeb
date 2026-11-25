import {$,icon,iconBtn,esc,val,labels,norm,brand,footer,account,bindLogout,notice,api,current,goLogin,emailOk,userOk,field,passField,userHint,bindEyes,clearFormErrors,formError,invalidField} from './cinema-ui.js';

const screen=document.body.dataset.screen;
const pageTitles={home:'Trang chủ nội bộ',customers:'Danh sách khách hàng',employees:'Danh sách nhân viên',accounts:'Quản lý tài khoản và quyền'};
// Các URL chưa ghép tập trung tại đây, tránh tạo lại module của thành viên khác.
const menuItems={home:['Trang chủ','home','noi-bo.html'],accounts:['Tài khoản và quyền','shield','tai-khoan.html'],employees:['Nhân viên','users','nhan-vien.html'],customers:['Khách hàng','users','khach-hang.html'],phim:['Phim','film','quan-ly-phim.html'],phong:['Phòng chiếu','screen','phong-chieu.html'],lich:['Lịch suất chiếu','calendar','suat-chieu.html'],gia:['Giá vé','tag','gia-ve.html'],food:['Đồ ăn và thức uống','cup','quan-ly-san-pham.html'],stock:['Kho hàng','box','ton-kho.html'],promo:['Khuyến mãi','gift','khuyen-mai.html'],report:['Báo cáo','chart','bao-cao.html'],ve:['Quản lý vé','ticket','tra-cuu-ve.html'],ban:['Bán vé tại quầy','ticket','ban-ve-tai-quay.html'],scan:['Soát vé','scan','soat-ve.html'],history:['Tra cứu vé','search','lich-su-ve.html']};
const nav={ADMIN:['home','accounts','employees','customers'],QUAN_LY:['home','phim','phong','lich','gia','customers','food','stock','promo','employees','report','ve'],NHAN_VIEN:['home','ban','scan','history','customers','phim','lich','gia','food']};
// Staff không mở trang sửa suất/phim của Manager; các trang tra cứu riêng đang chờ ghép.
const ready=new Set(['home','accounts','employees','customers','phong','lich','history','phim','food','gia','promo','report','stock','scan']);
// Điểm nối tới giao diện 28/39 đã merge của Giang.
const linkedPages={customerProfile:'khach-hang-ho-so.html',employeeProfile:'nhan-vien-form.html'};
const params=new URLSearchParams(location.search);
let me,rows=[],shown=[],page=1,employees=[],keyword='',requestId=0;
const pageSize=10;
const maskPhone=s=>s?String(s).slice(0,3)+'****'+String(s).slice(-3):null;

footer();
function menuHref(k){return ready.has(k)&&!(me.vaiTro==='NHAN_VIEN'&&['lich','phim','food'].includes(k))?menuItems[k][2]:'noi-bo.html?module='+encodeURIComponent(k);}
async function init(){
    try{me=await current();}catch(e){if(e.status===401)goLogin();else $('#main').textContent=e.message;return;}
    if(!nav[me.vaiTro]){location.replace('./');return;}
    $('#header').innerHTML=brand(true)+account(me);
    const menu=nav[me.vaiTro],selected=screen==='home'?(params.get('module')||'home'):screen;
    $('#main').innerHTML=`<aside class="sidebar"><small>KHÔNG GIAN NỘI BỘ</small><nav aria-label="Menu nội bộ">${menu.map(k=>`<a ${selected===k?'aria-current="page"':''} href="${menuHref(k)}">${icon(menuItems[k][1])}${menuItems[k][0]}</a>`).join('')}</nav><div class="access"><strong>${icon('shield')} Quyền truy cập</strong><p class="muted">Chỉ hiển thị chức năng được cấp theo vai trò của bạn.</p></div></aside><section id="content"><div id="notice" class="notice" role="status" aria-live="polite" hidden></div><div id="view"></div></section>`;
    $('#main').removeAttribute('aria-busy');bindLogout();
    if(!menu.includes(selected)){ $('#view').innerHTML='<div class="card empty"><h2>Bạn không có quyền truy cập</h2><a href="noi-bo.html">Về trang chủ</a></div>';return; }
    if(screen==='home'){home(selected);return;}
    setup();await load();
}
function home(selected){
    const name=menuItems[selected][0],task=params.get('task');
    $('#view').innerHTML=`<small>Nội bộ / ${name}</small><div class="page-head"><h1>${selected==='home'?pageTitles.home:name}</h1></div>${selected==='home'?`<div class="card welcome"><div><p class="muted">Chào mừng đến với MegaCine.</p><h2>${esc(me.hoTen||me.tenDangNhap)}</h2><p>Vui lòng chọn chức năng từ menu bên trái.</p></div><img src="images/clapper-small.svg" alt=""></div>`:''}<div class="card empty">${icon('window')}<h2>${selected==='home'?'Không gian làm việc':'Giao diện đang được phát triển'}</h2><p class="muted">${selected==='home'?'Chọn chức năng để bắt đầu.':task==='add'?'Giao diện thêm nhân viên (39) chưa được tích hợp.':'Chức năng này chưa được tích hợp vào hệ thống.'}</p>${selected==='home'?'':'<a href="noi-bo.html">Quay lại trang chủ</a>'}</div>`;
}
const config={
    customers:{name:'khách hàng',intro:'Tra cứu thông tin khách hàng thành viên.',placeholder:'Nhập mã, họ tên, số điện thoại hoặc email',head:['Mã khách hàng','Tên đăng nhập','Họ và tên','Email','Số điện thoại','Hạng thành viên','Điểm tích lũy','Thao tác']},
    employees:{name:'nhân viên',intro:'Tra cứu và quản lý thông tin nhân viên tại rạp.',placeholder:'Nhập mã, họ tên, số điện thoại...',head:['Mã nhân viên','Họ và tên','Số điện thoại','Chức vụ','Tài khoản','Trạng thái tài khoản','Thao tác']},
    accounts:{name:'tài khoản',intro:'Quản lý tài khoản truy cập của nhân viên.',placeholder:'Nhập mã, tên đăng nhập, email...',head:['Mã tài khoản','Tên đăng nhập','Email','Mã nhân viên','Vai trò','Trạng thái','Thao tác']}
};
const c=config[screen];
function setup(){
    const add=screen==='customers'&&me.vaiTro!=='ADMIN'?`<a class="btn primary" href="dang-ky.html?noiBo=1">${icon('plus')} Đăng ký thành viên</a>`:screen==='employees'&&me.vaiTro==='QUAN_LY'?`<button class="btn primary" id="add-employee">${icon('plus')} Thêm nhân viên</button>`:screen==='accounts'?`<button class="btn primary" id="create">${icon('plus')} Tạo tài khoản</button>`:'';
    const filters=screen==='employees'?'<select id="job" aria-label="Lọc chức vụ"><option value="">Tất cả chức vụ</option></select>':screen==='accounts'?'<select id="role" aria-label="Lọc vai trò"><option value="">Tất cả vai trò</option><option value="ADMIN">Quản trị viên</option><option value="QUAN_LY">Quản lý</option><option value="NHAN_VIEN">Nhân viên</option></select>':'';
    const status=screen==='customers'?'':`<select id="status" aria-label="Lọc trạng thái tài khoản"><option value="">Tất cả trạng thái</option><option value="HOAT_DONG">Hoạt động</option><option value="KHONG_HOAT_DONG">Đã khóa</option>${screen==='employees'?'<option value="NONE">Chưa có tài khoản</option>':''}</select>`;
    $('#view').innerHTML=`<small>Nội bộ / ${menuItems[screen][0]}</small><div class="page-head"><div><h1>${pageTitles[screen]}</h1><p class="muted">${c.intro}</p></div>${add}</div><form class="card toolbar" id="filters"><input id="query" type="search" aria-label="Từ khóa tìm kiếm" placeholder="${c.placeholder}">${filters}${status}<button class="btn primary" type="submit">${icon('search')} Tìm kiếm</button>${iconBtn('reload','Đặt lại bộ lọc','id="reload"')}</form><section class="card table-card"><div class="table-scroll" tabindex="0" aria-label="Bảng ${c.name}"><table><thead><tr>${c.head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody id="rows"></tbody></table></div><div id="empty" class="empty" hidden><h2>Không tìm thấy ${c.name} phù hợp</h2><p class="muted">Vui lòng thay đổi từ khóa hoặc bộ lọc.</p></div><div class="pagination"><small id="count">Đang tải dữ liệu…</small><div>${iconBtn('left','Trang trước','id="prev" disabled')}<button class="btn page-number" id="page" disabled>1</button>${iconBtn('right','Trang sau','id="next" disabled')}</div></div></section><dialog id="dialog" aria-labelledby="dialog-title"></dialog>${screen==='customers'?'<p class="muted">Chưa có quy tắc phân hạng thành viên; hiển thị dấu —.</p>':screen==='employees'?'<p class="muted">Thêm/sửa hồ sơ nhân viên đang ở chế độ mẫu, chưa lưu vào hệ thống.</p>':'<p class="muted">Thay đổi vai trò và trạng thái được lưu vào hệ thống.</p>'}`;
    $('#filters').onsubmit=e=>{e.preventDefault();keyword=$('#query').value.trim();page=1;refresh();};
    $('#reload').onclick=async()=>{try{$('#filters').reset();keyword='';page=1;if(screen!=='customers'){rows=await api('/api/quan-tri/'+(screen==='employees'?'nhan-vien':'tai-khoan'));if(screen==='accounts')employees=await api('/api/quan-tri/nhan-vien');}await refresh();}catch(e){notice($('#notice'),e.message);if(e.status===401)goLogin();}};
    $('#filters').querySelectorAll('select').forEach(x=>x.onchange=()=>{page=1;refresh();});
    $('#prev').onclick=()=>{page--;draw();};$('#next').onclick=()=>{page++;draw();};
    $('#rows').onclick=e=>{const b=e.target.closest('[data-act]');if(b)action(b.dataset.act,Number(b.dataset.i),b).catch(err=>{notice($('#notice'),err.message);if(err.status===401)goLogin();});};
    $('#create')?.addEventListener('click',createAccount);
    $('#add-employee')?.addEventListener('click',()=>{location.href=linkedPages.employeeProfile+'?mode=add';});
}
async function load(){
    if(screen==='customers'){
        keyword=params.get('tuKhoa')||sessionStorage.getItem('cinema.customers.keyword')||'';$('#query').value=keyword;
        page=Math.max(1, Math.floor(Number(sessionStorage.getItem('cinema.customers.page')) || 1));await refresh();return;
    }
    rows=await api('/api/quan-tri/'+(screen==='employees'?'nhan-vien':'tai-khoan'));
    if(screen==='employees'){
        $('#job').innerHTML+=[...new Set(rows.map(r=>r.chucVu).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join('');
    }else{
        employees=await api('/api/quan-tri/nhan-vien');
        if(params.has('maNhanVien')){keyword=params.get('maNhanVien');$('#query').value=keyword;}
    }
    await refresh();if(screen==='accounts'&&params.get('tao')==='1')createAccount();
}
async function refresh(){
    const id=++requestId;notice($('#notice'));
    try{
        if(screen==='customers'){
            const data=await api('/api/quan-tri/khach-hang?tuKhoa='+encodeURIComponent(keyword));
            if(id!==requestId)return;rows=data;sessionStorage.setItem('cinema.customers.keyword',keyword);
        }
        const query = norm(keyword);
        shown=rows.map((r,i)=>({r,i})).filter(({r})=>{
            if(screen!=='customers'&&!Object.values(r).some(v=>norm(v).includes(query)))return false;
            if($('#job')?.value&&r.chucVu!==$('#job').value)return false;
            if($('#role')?.value&&r.vaiTro!==$('#role').value)return false;
            if($('#status')?.value&&(r.trangThai||'NONE')!==$('#status').value)return false;
            return true;
        });draw();
    }catch(e){if(id!==requestId)return;shown=[];draw();$('#empty').hidden=true;$('#count').textContent='Không thể tải dữ liệu.';notice($('#notice'),e.message);if(e.status===401)goLogin();}
}
const cell=(v,cls='')=>`<td class="${cls}">${val(v)}</td>`;
const chip=v=>screen==='accounts'?`<td><span class="lock-status ${v==='HOAT_DONG'?'is-active':'is-locked'}">${icon(v==='HOAT_DONG'?'unlock':'lock')} ${esc(labels[v]||'Chưa có tài khoản')}</span></td>`:`<td><span class="chip ${v==='HOAT_DONG'?'active':''}">${esc(labels[v]||'Chưa có tài khoản')}</span></td>`;
const act=(n,t,a,i,disabled=false)=>iconBtn(n,t,`data-act="${a}" data-i="${i}" ${disabled?'disabled':''}`);
function row(r,i){
    let data,actions;
    if(screen==='customers'){
        data=cell(r.maKhachHang,'code')+cell(r.tenDangNhap)+cell(r.hoTen)+cell(r.email,'email')+cell(r.soDienThoai,'phone')+cell('—')+cell(r.diemTichLuy);
        actions=act('user','Xem hồ sơ','profile',i)+(me.vaiTro==='ADMIN'?'':act('history','Lịch sử mua vé','history',i));
    }else if(screen==='employees'){
        data=cell(r.maNhanVien,'code')+cell(r.hoTen)+cell(maskPhone(r.soDienThoai),'phone')+cell(r.chucVu)+cell(r.tenDangNhap)+chip(r.trangThai);
        actions=act('user','Xem hồ sơ','profile',i)+(me.vaiTro==='ADMIN'?act('shield','Quản lý tài khoản','manage',i):act('pencil','Chỉnh sửa hồ sơ','edit',i));
    }else{
        data=cell(r.maTaiKhoan,'code')+cell(r.tenDangNhap)+cell(r.email,'email')+cell(r.maNhanVien,'code')+cell(labels[r.vaiTro]||r.vaiTro)+chip(r.trangThai);
        const protect=r.vaiTro==='ADMIN'||r.maTaiKhoan===me.maTaiKhoan;
        actions=act('shield','Đổi vai trò','role',i,protect)+`<button type="button" class="btn lock-action ${r.trangThai==='HOAT_DONG'?'is-locked':'is-active'}" data-act="lock" data-i="${i}" ${protect?'disabled':''}>${icon(r.trangThai==='HOAT_DONG'?'lock':'unlock')} ${r.trangThai==='HOAT_DONG'?'Khóa':'Mở khóa'}</button>`;
    }
    return `<tr>${data}<td><div class="actions">${actions}</div></td></tr>`;
}
function draw(){
    page=Math.max(1,Math.min(page,Math.ceil(shown.length/pageSize)));const start=(page-1)*pageSize,part=shown.slice(start,start+pageSize);
    $('#rows').innerHTML=part.map(({r,i})=>row(r,i)).join('');$('#empty').hidden=!!shown.length;
    $('#count').textContent=`Hiển thị ${shown.length?(start+1)+'–'+(start+part.length):'0'} / ${shown.length} ${c.name}`;
    $('#page').textContent=page;$('#prev').disabled=page===1;$('#next').disabled=start+pageSize>=shown.length;
    if(screen==='customers')sessionStorage.setItem('cinema.customers.page',String(page));
}
function dialog(title,body,submitText,callback){
    const d=$('#dialog');d.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2>${iconBtn('close','Đóng','id="close"')}</div><div id="dialog-notice" class="notice" role="status" hidden></div><form id="dialog-form" novalidate>${body}<div class="dialog-actions"><button class="btn" type="button" id="cancel">${callback?'Hủy':'Đóng'}</button>${callback?`<button class="btn primary" type="submit">${submitText}</button>`:''}</div></form>`;
    $('#close').onclick=$('#cancel').onclick=()=>d.close();bindEyes(d);
    const form = $('#dialog-form');
    const fields = {
        'Email': 'email', 'Tên đăng nhập': 'username',
        'Vui lòng nhập lại mật khẩu': 'confirm', 'Mật khẩu nhập lại': 'confirm',
        'Vui lòng nhập mật khẩu': 'password', 'Mật khẩu': 'password',
        'Nhân viên': 'employee', 'Vui lòng chọn vai trò': 'role'
    };
    form.oninput = () => { clearFormErrors(form); notice($('#dialog-notice')); };
    form.onsubmit = async e => {
        e.preventDefault();
        if (!callback) return;
        clearFormErrors(form);
        notice($('#dialog-notice'));
        const b = e.submitter || form.querySelector('[type="submit"]');
        if (!b || b.disabled) return;
        b.disabled = true;
        try {
            await callback(Object.fromEntries(new FormData(form)));
        } catch (err) {
            if (err.status === 401) { goLogin(); return; }
            const id = err.field || ([400, 409].includes(err.status)
                ? Object.entries(fields).find(([prefix]) => err.message.startsWith(prefix))?.[1] : null);
            if (id && form.elements.namedItem(id)) formError(form, err, fields);
            else notice($('#dialog-notice'), err.message);
        } finally {
            b.disabled = false;
        }
    };
    d.showModal();
}
const details=entries=>`<div class="details">${entries.map(([k,v])=>`<div><small>${k}</small><p>${val(v)}</p></div>`).join('')}</div>`;
async function action(a,i,button){
    const r=rows[i];if(!r)return;
    if(a==='history'&&me.vaiTro!=='ADMIN'){location.href='lich-su-ve.html?maKhachHang='+encodeURIComponent(r.maKhachHang);return;}
    if(a==='manage'&&me.vaiTro==='ADMIN'){location.href='tai-khoan.html?maNhanVien='+encodeURIComponent(r.maNhanVien)+(r.tenDangNhap?'':'&tao=1');return;}
    if(a==='profile'){
        const target=screen==='customers'?linkedPages.customerProfile:linkedPages.employeeProfile;
        if(target){location.href=target+'?'+(screen==='customers'?'maKhachHang='+encodeURIComponent(r.maKhachHang):'mode=view&maNhanVien='+encodeURIComponent(r.maNhanVien));return;}
    }
    if(a==='edit'){location.href=linkedPages.employeeProfile+'?mode=edit&maNhanVien='+encodeURIComponent(r.maNhanVien);return;}
    if(me.vaiTro!=='ADMIN'||r.vaiTro==='ADMIN'||r.maTaiKhoan===me.maTaiKhoan)return;
    if(a==='lock'){
        const moi=r.trangThai==='HOAT_DONG'?'KHONG_HOAT_DONG':'HOAT_DONG';
        button.disabled=true;
        try{
            await api('/api/quan-tri/tai-khoan/'+encodeURIComponent(r.maTaiKhoan)+'/trang-thai',{cu:r.trangThai,moi});
            rows=await api('/api/quan-tri/tai-khoan');await refresh();
            notice($('#notice'),`${moi==='HOAT_DONG'?'Mở khóa':'Khóa'} tài khoản ${r.tenDangNhap} thành công.`,'success');
        }finally{button.disabled=false;}return;
    }
    if(a==='role'){
        dialog('Thay đổi vai trò',details([['Mã tài khoản',r.maTaiKhoan],['Tên đăng nhập',r.tenDangNhap],['Nhân viên',r.hoTen],['Vai trò hiện tại',labels[r.vaiTro]]])+`<div class="field"><label for="new-role">Vai trò mới</label><select id="new-role" name="role"><option value="NHAN_VIEN">Nhân viên</option><option value="QUAN_LY">Quản lý</option></select></div><p class="muted">Quyền truy cập sẽ thay đổi và nhân viên cần đăng nhập lại.</p>`,'Xác nhận thay đổi',async d=>{
            if(!['NHAN_VIEN','QUAN_LY'].includes(d.role)||d.role===r.vaiTro)invalidField('role','Vui lòng chọn vai trò mới hợp lệ.');
            await api('/api/quan-tri/tai-khoan/'+encodeURIComponent(r.maTaiKhoan)+'/vai-tro',{cu:r.vaiTro,moi:d.role});rows=await api('/api/quan-tri/tai-khoan');$('#dialog').close();await refresh();notice($('#notice'),'Cập nhật vai trò thành công.','success');
        });$('#new-role').value=r.vaiTro;
    }
}
function createAccount(){
    const available=employees.filter(n=>!n.maTaiKhoan&&!rows.some(r=>r.maNhanVien===n.maNhanVien));
    if(!available.length){dialog('Tạo tài khoản nhân viên','<p>Hiện chưa có hồ sơ nhân viên nào chưa được cấp tài khoản. Vui lòng liên hệ người quản lý hồ sơ nhân viên.</p>');return;}
    dialog('Tạo tài khoản nhân viên',`<p class="muted">Cấp tài khoản cho nhân viên đã có hồ sơ.</p><div class="field"><label for="employee">Nhân viên</label><select id="employee" name="employee" required><option value="">Chọn nhân viên</option>${available.map(n=>`<option value="${esc(n.maNhanVien)}">${esc(n.maNhanVien+' – '+n.hoTen)}</option>`).join('')}</select></div>${field('email','Email','email')}${field('username','Tên đăng nhập','text',userHint)}${passField('password','Mật khẩu','Ít nhất 8 ký tự. Nên dùng cụm từ dễ nhớ.')}${passField('confirm','Nhập lại mật khẩu')}${details([['Vai trò mặc định','Nhân viên'],['Trạng thái','Hoạt động']])}`,'Tạo tài khoản',async d=>{
        const emp=available.find(n=>n.maNhanVien===d.employee);
        if(!emp||rows.some(r=>r.maNhanVien===d.employee))invalidField('employee','Nhân viên không hợp lệ hoặc đã có tài khoản.');
        if(!emailOk(d.email.trim()))invalidField('email','Email không hợp lệ.');
        if(!userOk(d.username))invalidField('username','Tên đăng nhập không hợp lệ.');
        if(!d.password)invalidField('password','Vui lòng nhập mật khẩu.');
        if(!d.password.trim())invalidField('password','Mật khẩu không được chỉ chứa khoảng trắng.');
        if(d.password.includes('\0'))invalidField('password','Mật khẩu chứa ký tự không hợp lệ.');
        if([...d.password].length<8)invalidField('password','Mật khẩu phải có ít nhất 8 ký tự.');
        if(new TextEncoder().encode(d.password).length>72)invalidField('password','Mật khẩu quá dài. Vui lòng nhập mật khẩu ngắn hơn.');
        if(!d.confirm)invalidField('confirm','Vui lòng nhập lại mật khẩu.');
        if(d.password!==d.confirm)invalidField('confirm','Mật khẩu nhập lại không khớp với mật khẩu.');
        await api('/api/quan-tri/tai-khoan',{maNhanVien:emp.maNhanVien,tenDangNhap:d.username,email:d.email.trim(),matKhau:d.password,xacNhan:d.confirm});
        rows=await api('/api/quan-tri/tai-khoan');employees=await api('/api/quan-tri/nhan-vien');
        $('#dialog').close();$('#filters').reset();keyword=d.username;$('#query').value=keyword;page=1;await refresh();notice($('#notice'),'Tạo tài khoản nhân viên thành công.','success');
    });if(params.has('maNhanVien')&&available.some(n=>n.maNhanVien===params.get('maNhanVien')))$('#employee').value=params.get('maNhanVien');
}
init().catch(e=>{if(e.status===401)goLogin();else if($('#notice'))notice($('#notice'),e.message);else $('#main').textContent=e.message;});
