(()=>{"use strict";
const API="/tpv_editor/api/participation-applications";let items=[],current=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const token=()=>document.querySelector('meta[name="csrf-token"]')?.content||"";
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{Accept:"application/json","Content-Type":"application/json","X-CSRFToken":token(),...(opt.headers||{})},credentials:"same-origin",body:opt.body&&typeof opt.body!=="string"?JSON.stringify(opt.body):opt.body});const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{d={error:t}}if(!r.ok||d.ok===false)throw new Error(d.error||d.message||`Ошибка ${r.status}`);return d}
function mount(){const section=document.getElementById("applications-section");const question=document.getElementById("applications-content");if(!section||!question||document.getElementById("participation-applications-content"))return;
const switcher=document.createElement("div");switcher.className="participation-switcher editor-panel";switcher.innerHTML='<button class="button button-primary is-active" data-app-kind="questions">На вопросы</button><button class="button button-muted" data-app-kind="participation">На участие</button><a class="button button-muted" href="/tpv-apply" target="_blank">Публичная форма</a><a class="button button-muted" href="/tpv-apply/status" target="_blank">Проверка статуса</a>';question.before(switcher);
const box=document.createElement("section");box.id="participation-applications-content";box.hidden=true;box.innerHTML=`<section class="stats-grid stats-grid-four"><article><span>Всего</span><strong id="pa-total">0</strong></article><article><span>Новые</span><strong id="pa-new">0</strong></article><article><span>На рассмотрении</span><strong id="pa-review">0</strong></article><article><span>Одобрено</span><strong id="pa-approved">0</strong></article></section><section class="editor-panel"><div class="toolbar participation-toolbar"><label><span>Поиск</span><input id="pa-search" type="search" placeholder="№, имя или тема"></label><label><span>Статус</span><select id="pa-status"><option value="all">Все</option><option value="new">Новые</option><option value="in_review">На рассмотрении</option><option value="needs_clarification">Требуется уточнение</option><option value="approved">Одобрено</option><option value="completed">Завершено</option><option value="rejected">Отклонено</option></select></label><label><span>Проверка темы</span><select id="pa-theme-status"><option value="all">Все</option><option value="unchecked">Не проверена</option><option value="unique">Такой темы нет</option><option value="similar">Есть похожая</option><option value="exists">Уже существует</option></select></label><button id="pa-reload" class="button button-muted">Обновить</button><button id="pa-clear-processed" class="button button-muted">Удалить обработанные</button><button id="pa-clear-all" class="button button-danger">Очистить все</button></div><div class="table-wrap"><table class="applications-table"><thead><tr><th>№</th><th>Имя / Никнейм</th><th>Тема</th><th>Статус</th><th>Проверка темы</th><th>Возраст</th><th></th></tr></thead><tbody id="pa-body"></tbody></table><div id="pa-empty" class="empty-state" hidden>Заявки не найдены.</div></div></section>`;switcher.after(box);document.body.insertAdjacentHTML("beforeend",modalHtml());
switcher.addEventListener("click",e=>{const b=e.target.closest("[data-app-kind]");if(!b)return;const p=b.dataset.appKind==="participation";question.hidden=p;box.hidden=!p;switcher.querySelectorAll("[data-app-kind]").forEach(x=>{x.classList.toggle("button-primary",x===b);x.classList.toggle("button-muted",x!==b);x.classList.toggle("is-active",x===b)});if(p)load()});
document.getElementById("pa-reload").onclick=load;document.getElementById("pa-clear-processed").onclick=()=>clearApplications("processed");document.getElementById("pa-clear-all").onclick=()=>clearApplications("all");["pa-search","pa-status","pa-theme-status"].forEach(id=>document.getElementById(id).addEventListener(id==="pa-search"?"input":"change",debounce(load,250)));document.getElementById("pa-body").onclick=e=>{const b=e.target.closest("[data-pa-open]");if(b)openItem(Number(b.dataset.paOpen))};bindModal();}
function modalHtml(){return `<dialog id="pa-modal" class="editor-dialog application-dialog participation-application-dialog">
<form id="pa-form" method="dialog">
<div class="dialog-header">
<div>
<div class="eyebrow">МОДЕРАЦИЯ ЗАЯВКИ НА УЧАСТИЕ</div>
<h2 id="pa-modal-title">Заявка</h2>
</div>
<button class="icon-button" type="button" data-pa-close>×</button>
</div>

<input id="pa-application-id" type="hidden">

<div class="form-grid">
<label>
<span>Имя / Никнейм</span>
<input id="pa-name" type="text" readonly>
</label>

<label>
<span>Тема</span>
<input id="pa-theme" type="text" readonly>
</label>

<label>
<span>Статус заявки</span>
<select id="pa-edit-status">
<option value="new">Новая</option>
<option value="in_review">На рассмотрении</option>
<option value="needs_clarification">Требуется уточнение</option>
<option value="approved">Одобрена</option>
<option value="completed">Завершена</option>
<option value="rejected">Отклонена</option>
</select>
</label>

<label>
<span>Проверка темы</span>
<select id="pa-edit-theme-status">
<option value="unchecked">Не проверена</option>
<option value="unique">Такой темы нет</option>
<option value="similar">Есть похожая тема</option>
<option value="exists">Такая тема уже существует</option>
</select>
</label>

<label class="field-wide">
<span>Комментарий участнику</span>
<textarea id="pa-public-comment" rows="4" maxlength="2000"></textarea>
</label>

<label class="field-wide">
<span>Внутренний комментарий</span>
<textarea id="pa-editor-comment" rows="5" maxlength="4000"></textarea>
</label>
</div>

<div id="pa-application-meta" class="dialog-note"></div>
<p id="pa-modal-error" class="form-error"></p>

<div class="dialog-actions">
<button id="pa-delete" class="button button-danger" type="button">Удалить заявку</button>
<button id="pa-create-player" class="button button-secondary" type="button">Создать игрока</button>
<span class="spacer"></span>
<button class="button button-muted" type="button" data-pa-close>Закрыть</button>
<button id="pa-save" class="button button-primary" type="button">Сохранить</button>
</div>
</form>
</dialog>`}
function bindModal(){
const dialog=document.getElementById("pa-modal");
dialog.querySelectorAll("[data-pa-close]").forEach(x=>x.onclick=closeModal);
document.getElementById("pa-save").onclick=save;
document.getElementById("pa-create-player").onclick=createPlayer;
document.getElementById("pa-delete").onclick=deleteApplication;
dialog.addEventListener("cancel",event=>{
event.preventDefault();
closeModal();
});
dialog.addEventListener("click",event=>{
if(event.target===dialog)closeModal();
});
}
async function load(){const q=new URLSearchParams({q:document.getElementById("pa-search")?.value||"",status:document.getElementById("pa-status")?.value||"all",theme_status:document.getElementById("pa-theme-status")?.value||"all"});try{const d=await api(`${API}?${q}`);items=d.items;document.getElementById("pa-total").textContent=d.stats.total;document.getElementById("pa-new").textContent=d.stats.new;document.getElementById("pa-review").textContent=d.stats.in_review;document.getElementById("pa-approved").textContent=d.stats.approved;render()}catch(e){alert(e.message)}}
function render(){const body=document.getElementById("pa-body"),empty=document.getElementById("pa-empty");body.innerHTML=items.map(x=>`<tr><td>${x.id}</td><td><strong>${esc(x.display_name)}</strong></td><td class="pa-theme-cell">${esc(x.theme)}</td><td><span class="status status-${esc(x.status)}">${esc(x.status_label)}</span></td><td><span class="status theme-${esc(x.theme_status)}">${esc(x.theme_status_label)}</span></td><td title="${esc(x.created_at_label)}">${esc(x.age_label)}</td><td><button class="button button-muted button-small" data-pa-open="${x.id}">Открыть</button></td></tr>`).join("");empty.hidden=items.length>0}
function openItem(id){
current=items.find(x=>x.id===id);
if(!current)return;

document.getElementById("pa-application-id").value=current.id;
document.getElementById("pa-modal-title").textContent=`Заявка #${current.id}`;
document.getElementById("pa-name").value=current.display_name||"";
document.getElementById("pa-theme").value=current.theme||"";
document.getElementById("pa-edit-status").value=current.status;
document.getElementById("pa-edit-theme-status").value=current.theme_status;
document.getElementById("pa-public-comment").value=current.public_comment||"";
document.getElementById("pa-editor-comment").value=current.editor_comment||"";
document.getElementById("pa-create-player").hidden=current.status!=="approved";
document.getElementById("pa-modal-error").textContent="";
document.getElementById("pa-application-meta").innerHTML=`
<strong>Статус:</strong> ${esc(current.status_label)}<br>
<strong>Проверка темы:</strong> ${esc(current.theme_status_label)}<br>
<strong>Отправлено:</strong> ${esc(current.created_at_label)}
`;

const dialog=document.getElementById("pa-modal");
if(!dialog.open)dialog.showModal();
}
function closeModal(){
const dialog=document.getElementById("pa-modal");
if(dialog?.open)dialog.close();
current=null;
}
async function save(){if(!current)return;try{const d=await api(`${API}/${current.id}`,{method:"PUT",body:{status:document.getElementById("pa-edit-status").value,theme_status:document.getElementById("pa-edit-theme-status").value,public_comment:document.getElementById("pa-public-comment").value,editor_comment:document.getElementById("pa-editor-comment").value}});closeModal();await load()}catch(e){document.getElementById("pa-modal-error").textContent=e.message}}
async function createPlayer(){if(!current||!confirm(`Создать игрока «${current.display_name}» с темой «${current.theme}»?`))return;try{const d=await api(`${API}/${current.id}/create-player`,{method:"POST",body:{}});alert(d.message);closeModal();await load()}catch(e){document.getElementById("pa-modal-error").textContent=e.message}}
async function deleteApplication(){if(!current||!confirm(`Удалить заявку №${current.id}? Созданный игрок, если он уже существует, удалён не будет.`))return;try{const d=await api(`${API}/${current.id}`,{method:"DELETE"});alert(d.message);closeModal();await load()}catch(e){document.getElementById("pa-modal-error").textContent=e.message}}
async function clearApplications(mode){const processed=mode==="processed";const message=processed?"Удалить все обработанные заявки на участие? Новые заявки и заявки на рассмотрении останутся.":"Удалить ВСЕ заявки на участие? Созданные игроки удалены не будут.";if(!confirm(message))return;if(mode==="all"&&!confirm("Подтвердите полную очистку заявок ещё раз."))return;try{const d=await api(`${API}/clear`,{method:"POST",body:{mode}});alert(d.message);closeModal();await load()}catch(e){alert(e.message)}}
function debounce(fn,ms){let t;return()=>{clearTimeout(t);t=setTimeout(fn,ms)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();})();
