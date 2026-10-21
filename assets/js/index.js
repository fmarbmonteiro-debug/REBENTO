import { storage as S } from './db.js';

let db = S.get('ap_db') || { users: [], plants: [] };
const save = () => S.set('ap_db', db);
let me = db.users.find(user => user.id === S.get('ap_sess')) || null;
let tab = 'shelf', q = '';const logoSVG=(s=34)=>`<svg width="${s}" height="${s}" viewBox="0 0 48 48" role="img" aria-label="Rebento"><rect width="48" height="48" rx="14" fill="#1f5c3a"/><path d="M24 39V25" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M24 26C24 17 18 12 10 12c0 9 6 15 14 14Z" fill="#fff"/><path d="M24 29c0-7 4-11 12-11 0 8-4 12-12 11Z" fill="#b7e36a"/></svg>`;
const leaf=st=>`<svg class="leaf" style="${st}" viewBox="0 0 100 200"><path d="M50 0C92 44 92 124 50 200C8 124 8 44 50 0Z"/><path d="M50 14V190"/></svg>`;
const LEAVES=leaf('--r:25deg;width:220px;left:-60px;top:-70px')+leaf('--r:140deg;width:300px;right:-80px;top:-100px')+leaf('--r:-30deg;width:150px;right:26%;bottom:-70px');
const EM=['ðŸŒ¿','ðŸª´','ðŸŒµ','ðŸŒ¸','ðŸ€','ðŸŒ»','ðŸŒº','ðŸŽ','ðŸŒ±','ðŸƒ'];
const AV=['ðŸ§‘â€ðŸŒ¾','ðŸŒ¿','ðŸª´','ðŸŒµ','ðŸŒ»','ðŸ¢','ðŸ¦‹','ðŸ'];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
async function hash(p,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
// ===== Datas =====
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>ymd(new Date());
const dt=s=>new Date(s+'T00:00');
const addDays=(s,n)=>{const d=dt(s);d.setDate(d.getDate()+n);return ymd(d)};
const diff=(a,b)=>Math.round((dt(b)-dt(a))/864e5);
const fmt=s=>dt(s).toLocaleDateString('pt-PT',{day:'numeric',month:'short'});
function info(p){const next=addDays(p.last,p.interval),d=diff(today(),next);
 return{next,d,st:d<0?'late':d===0?'today':'ok',txt:d<0?`Em atraso ${-d} d`:d===0?'Regar hoje':`Rega em ${d} d`}}
const mine=()=>db.plants.filter(p=>p.uid===me.id);
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2200)}
// ===== Vistas =====
function render(){
 if(!me){location.replace('menu-inicial.html');return}
 appView()
}
function appView(){
 const ps=mine(),due=ps.filter(p=>info(p).d<=0).length;
 const head=tab==='shelf'?greet(ps):tab==='water'?`<div class="greet"><h2>Plano de rega</h2><p>${due?`${due} ${due===1?'planta pede':'plantas pedem'} Ã¡gua agora.`:'Nada para regar por agora.'}</p></div>`:'<div class="greet"><h2>O teu perfil</h2><p>Gere os teus dados e a tua conta.</p></div>';
 $('#root').innerHTML=`<div class="band"><div aria-hidden="true">${LEAVES}</div><header><span class="logo">${logoSVG(32)}Rebento</span><button class="chip" data-a="tab" data-id="profile"><span>${esc(me.avatar)}</span>${esc(me.name.split(' ')[0])}</button></header><div class="in"><nav>${[['shelf','ArmÃ¡rio'],['water','Rega'+(due?` (${due})`:'')],['profile','Perfil']].map(([k,l])=>`<button data-a="tab" data-id="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</nav>${head}</div></div><div class="wrap">${tab==='shelf'?shelfView(ps):tab==='water'?waterView(ps):profileView(ps)}</div><footer class="foot">Rebento â€“ o teu armÃ¡rio de plantas</footer>`;
 const s=$('#sq');if(s){s.oninput=e=>{q=e.target.value;const pos=q.length;appView();const n=$('#sq');n.focus();n.setSelectionRange(pos,pos)}}
}
function greet(ps){const h=new Date().getHours(),g=h<12?'Bom dia':h<20?'Boa tarde':'Boa noite',n=esc(me.name.split(' ')[0]);
 const c={ok:0,today:0,late:0};ps.forEach(p=>c[info(p).st]++);const due=c.today+c.late;
 const msg=!ps.length?'Regista a tua primeira planta para comeÃ§ar.':due?(due===1?'HÃ¡ 1 planta Ã  espera de Ã¡gua.':`HÃ¡ ${due} plantas Ã  espera de Ã¡gua.`):'Todas as plantas estÃ£o regadas.';
 const L=[['ok','em dia'],['today','para hoje'],['late','em atraso']];
 return`<div class="greet"><h2>${g}, ${n}. ${msg}</h2>${ps.length?`<div class="bar">${L.filter(x=>c[x[0]]).map(x=>`<i class="c-${x[0]}" style="flex:${c[x[0]]}"></i>`).join('')}</div><div class="legend">${L.map(x=>`<span><i class="dot c-${x[0]}"></i>${c[x[0]]} ${x[1]}</span>`).join('')}</div>`:''}</div>`}
function card(p){const i=info(p);
 return`<div class="card plant s-${i.st}"><div class="top"><div class="em">${p.emoji}</div><div><h3>${esc(p.name)}</h3><small>${esc(p.species||'â€”')}</small></div></div>
 <span class="badge ${i.st}">${i.txt}</span>
 <div class="mut" style="font-size:13px;margin-bottom:10px">â˜€ï¸ ${esc(p.light)} Â· ðŸ’§ a cada ${p.interval} d<br>Ãšltima rega: ${fmt(p.last)}${p.notes?`<br>ðŸ“ ${esc(p.notes)}`:''}</div>
 <div class="row"><button class="b p" data-a="water" data-id="${p.id}">ðŸ’§ Regar</button><button class="b" data-a="edit" data-id="${p.id}">Editar</button></div></div>`}
function shelfView(ps){
 const f=ps.filter(p=>(p.name+p.species+p.shelf).toLowerCase().includes(q.toLowerCase()));
 const by={};f.forEach(p=>(by[p.shelf||'Sem prateleira']??=[]).push(p));
 return`<div class="row tb"><input id="sq" placeholder="Pesquisar plantasâ€¦" value="${esc(q)}" style="flex:1;min-width:140px"><button class="b p" data-a="new">+ Registar planta</button></div>
 ${!ps.length?'<div class="card" style="text-align:center;margin-top:16px"><p style="font-size:40px;margin:0">ðŸŒ±</p><p class="mut">O teu armÃ¡rio estÃ¡ vazio. Regista a primeira planta!</p></div>':''}
 ${Object.keys(by).sort().map(k=>`<div class="shelf">${esc(k)}</div><div class="grid">${by[k].map(card).join('')}</div>`).join('')}`}
function waterView(ps){
 const s=ps.map(p=>({p,...info(p)})).sort((a,b)=>a.d-b.d);
 const due=s.filter(x=>x.d<=0),soon=s.filter(x=>x.d>0&&x.d<=7);
 const hist=ps.flatMap(p=>(p.log||[]).map(d=>({d,n:p.name,e:p.emoji}))).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,10);
 const li=x=>`<div class="li"><span>${x.p.emoji} <b>${esc(x.p.name)}</b> <small class="${x.st}">${x.txt}</small></span><button class="b ${x.d<=0?'p':''}" data-a="water" data-id="${x.p.id}">ðŸ’§ Regar</button></div>`;
 return`<div class="card"><div class="row" style="justify-content:space-between"><h2>Para regar agora</h2>${due.length>1?'<button class="b p" data-a="waterAll">Regar todas</button>':''}</div>
 ${due.length?due.map(li).join(''):'<p class="mut">Tudo regado. ðŸŽ‰</p>'}</div>
 <div class="card" style="margin-top:12px"><h2>PrÃ³ximos 7 dias</h2>${soon.length?soon.map(x=>`<div class="li"><span>${x.p.emoji} ${esc(x.p.name)}</span><small class="mut">${fmt(x.next)} Â· em ${x.d} d</small></div>`).join(''):'<p class="mut">Nada agendado.</p>'}</div>
 <div class="card" style="margin-top:12px"><h2>HistÃ³rico recente</h2>${hist.length?hist.map(h=>`<div class="li"><span>${h.e} ${esc(h.n)}</span><small class="mut">${fmt(h.d)}</small></div>`).join(''):'<p class="mut">Ainda sem regas registadas.</p>'}</div>`}
function profileView(ps){
 const w=ps.reduce((n,p)=>n+(p.log||[]).length,0);
 return`<div class="stats"><div class="card stat"><b>${ps.length}</b><small class="mut">Plantas</small></div><div class="card stat"><b>${w}</b><small class="mut">Regas</small></div><div class="card stat"><b>${fmt(me.created)}</b><small class="mut">Membro desde</small></div></div>
 <div class="card"><h2>Perfil</h2><label>Avatar</label><div class="av">${AV.map(a=>`<button data-a="avatar" data-id="${a}" class="${me.avatar===a?'on':''}">${a}</button>`).join('')}</div>
 <label>Nome</label><input id="pn" value="${esc(me.name)}"><label>Email</label><input value="${esc(me.email)}" disabled>
 <div class="row" style="margin-top:12px"><button class="b p" data-a="saveProfile">Guardar perfil</button></div></div>
 <div class="card" style="margin-top:12px"><h2>Alterar palavra-passe</h2><label>Atual</label><input id="po" type="password" autocomplete="current-password"><label>Nova (mÃ­n. 6)</label><input id="pw" type="password" autocomplete="new-password">
 <div class="row" style="margin-top:12px"><button class="b p" data-a="savePass">Alterar</button></div></div>
 <div class="card" style="margin-top:12px"><div class="row"><button class="b" data-a="logout">Terminar sessÃ£o</button><button class="b d" data-a="delAcc">Eliminar conta</button></div></div>`}
// ===== Modal de planta =====
function plantModal(id){
 const p=id?db.plants.find(x=>x.id===id):{name:'',species:'',shelf:'',light:'Luz indireta',interval:7,last:today(),emoji:'ðŸŒ¿',notes:''};
 const shelves=[...new Set(mine().map(x=>x.shelf).filter(Boolean))];
 $('#modal').innerHTML=`<div class="modal"><div class="card"><h2>${id?'Editar planta':'Registar planta'}</h2>
 <label>Ãcone</label><div class="av" id="ems">${EM.map(e=>`<button type="button" data-a="pickem" data-id="${e}" class="${p.emoji===e?'on':''}">${e}</button>`).join('')}</div>
 <label>Nome</label><input id="fn" value="${esc(p.name)}" placeholder="Ex.: Costela-de-adÃ£o">
 <label>EspÃ©cie</label><input id="fs" value="${esc(p.species)}" placeholder="Ex.: Monstera deliciosa">
 <label>Prateleira / localizaÃ§Ã£o</label><input id="fh" list="shl" value="${esc(p.shelf)}" placeholder="Ex.: Prateleira 1"><datalist id="shl">${shelves.map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
 <div class="two"><div><label>Luz</label><select id="fl">${['Sol direto','Luz indireta','Sombra'].map(l=>`<option${l===p.light?' selected':''}>${l}</option>`).join('')}</select></div>
 <div><label>Regar a cada (dias)</label><input id="fi" type="number" min="1" max="90" value="${p.interval}"></div></div>
 <label>Ãšltima rega</label><input id="fd" type="date" max="${today()}" value="${p.last}">
 <label>Notas</label><textarea id="fo" rows="2">${esc(p.notes)}</textarea>
 <div class="err" id="fe"></div>
 <div class="row" style="margin-top:8px"><button class="b p" data-a="savePlant" data-id="${id||''}">Guardar</button><button class="b" data-a="close">Cancelar</button>${id?`<button class="b d" data-a="delPlant" data-id="${id}" style="margin-left:auto">Eliminar</button>`:''}</div></div></div>`;
 $('#modal').dataset.em=p.emoji}
// ===== AÃ§Ãµes =====
const A={
 sw(){mode=mode==='reg'?'login':'reg';authErr='';render()},
 tab(id){tab=id;appView()},
 new(){plantModal()},edit(id){plantModal(id)},close(){$('#modal').innerHTML=''},
 pickem(id,t){$('#modal').dataset.em=id;document.querySelectorAll('#ems button').forEach(b=>b.classList.toggle('on',b===t))},
 savePlant(id){const name=$('#fn').value.trim(),iv=parseInt($('#fi').value,10);
  if(!name)return $('#fe').textContent='DÃ¡ um nome Ã  planta.';
  if(!(iv>=1))return $('#fe').textContent='Indica um intervalo de rega vÃ¡lido.';
  const d={name,species:$('#fs').value.trim(),shelf:$('#fh').value.trim(),light:$('#fl').value,interval:iv,last:$('#fd').value||today(),notes:$('#fo').value.trim(),emoji:$('#modal').dataset.em||'ðŸŒ¿'};
  if(id){const p=db.plants.find(x=>x.id===id);Object.assign(p,d)}
  else db.plants.push({id:uid(),uid:me.id,log:[d.last],created:today(),...d});
  save();A.close();appView();toast('Planta guardada ðŸŒ¿')},
 delPlant(id){if(!confirm('Eliminar esta planta?'))return;db.plants=db.plants.filter(p=>p.id!==id);save();A.close();appView()},
 water(id){const p=db.plants.find(x=>x.id===id);p.last=today();(p.log??=[]).push(today());save();appView();toast(`ðŸ’§ ${p.name} regada!`)},
 waterAll(){mine().filter(p=>info(p).d<=0).forEach(p=>{p.last=today();(p.log??=[]).push(today())});save();appView();toast('Todas as plantas regadas ðŸ’§')},
 avatar(id){me.avatar=id;save();appView()},
 saveProfile(){const n=$('#pn').value.trim();if(!n)return toast('O nome nÃ£o pode ficar vazio.');me.name=n;save();appView();toast('Perfil guardado')},
 async savePass(){const o=$('#po').value,n=$('#pw').value;
  if(n.length<6)return toast('A nova palavra-passe Ã© demasiado curta.');
  if(await hash(o,me.salt)!==me.hash)return toast('Palavra-passe atual incorreta.');
  me.salt=uid();me.hash=await hash(n,me.salt);save();$('#po').value=$('#pw').value='';toast('Palavra-passe alterada')},
 logout(){S.del('ap_sess');me=null;render()},
 delAcc(){if(!confirm('Eliminar a conta e todas as plantas? Isto nÃ£o pode ser desfeito.'))return;
  db.plants=db.plants.filter(p=>p.uid!==me.id);db.users=db.users.filter(u=>u.id!==me.id);save();A.logout()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;e.preventDefault();A[t.dataset.a]?.(t.dataset.id,t)});
render();

