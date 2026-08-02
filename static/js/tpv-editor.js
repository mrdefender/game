(()=>{"use strict";
const s={users:[],themes:[],questions:[],authors:[],current:null,currentQuestion:null,currentTheme:null,themeRows:[],qualityIssues:[],qualityStats:{},statistics:null,importPreview:null,historyItems:[],historyStats:{},builderItems:[],builderPreview:[],currentBuild:null,applications:[],currentApplication:null,tab:"users"},e={};
document.addEventListener("DOMContentLoaded",init);
function init(){
    document.querySelectorAll("[id]").forEach(node=>{
        e[node.id]=node;
    });

    document.querySelectorAll("[data-tab]").forEach(button=>{
        button.addEventListener("click",()=>{
            switchTab(button.dataset.tab);
        });
    });

    bind("search-input","input",renderUsers);
    bind("approve-filter","change",renderUsers);
    bind("sort-select","change",renderUsers);
    bind("reload-button","click",loadUsers);
    bind("new-user-button","click",()=>openUser(null));
    bind("recalculate-all-button","click",recalcAll);
    bind("user-form","submit",saveUser);
    bind("dialog-close","click",closeUser);
    bind("cancel-button","click",closeUser);
    bind("delete-user-button","click",removeUser);
    bind("reset-money-button","click",resetMoney);

    bind("users-table-body","click",event=>{
        const button=event.target.closest("[data-edit]");
        if(!button)return;

        const user=s.users.find(item=>item.id===Number(button.dataset.edit));
        if(user)openUser(user);
    });

    bind("question-search","input",renderQuestions);
    bind("question-theme-filter","change",renderQuestions);
    bind("question-author-filter","change",renderQuestions);
    bind("question-show-filter","change",renderQuestions);
    bind("question-sort","change",renderQuestions);
    bind("questions-reload","click",loadQuestions);
    bind("new-question-button","click",()=>openQuestion(null));
    bind("reset-shown-button","click",resetShown);
    bind("question-form","submit",saveQuestion);
    bind("question-dialog-close","click",closeQuestion);
    bind("question-cancel","click",closeQuestion);
    bind("delete-question-button","click",removeQuestion);
    bind("duplicate-question-button","click",duplicateQuestion);

    bind("questions-table-body","click",event=>{
        const button=event.target.closest("[data-edit-question]");
        if(!button)return;

        const question=s.questions.find(
            item=>item.id===Number(button.dataset.editQuestion)
        );

        if(question)openQuestion(question);
    });

    bind("theme-search","input",renderThemes);
    bind("theme-state-filter","change",renderThemes);
    bind("theme-sort","change",renderThemes);
    bind("themes-reload","click",loadThemes);
    bind("themes-recalculate-button","click",recalcAll);
    bind("theme-form","submit",saveTheme);
    bind("theme-dialog-close","click",closeTheme);
    bind("theme-cancel","click",closeTheme);
    bind("delete-theme-button","click",deleteTheme);

    bind("themes-table-body","click",event=>{
        const button=event.target.closest("[data-edit-theme]");
        if(!button)return;

        const theme=s.themeRows.find(
            item=>item.name===button.dataset.editTheme
        );

        if(theme)openTheme(theme);
    });

    bind("quality-reload","click",loadQuality);
    bind("quality-fix-all","click",fixAllQuality);

    bind("quality-search","input",renderQuality);
    bind("quality-level-filter","change",renderQuality);
    bind("quality-entity-filter","change",renderQuality);
    bind("quality-fix-filter","change",renderQuality);

    bind("statistics-reload","click",loadStatistics);

    bind("import-preview-button","click",previewImport);
    bind("import-apply-button","click",applyImport);
    bind("import-file","change",resetImportPreview);
    bind("import-entity","change",resetImportPreview);
    bind("import-mode","change",resetImportPreview);

    bind("history-reload","click",loadHistory);
    bind("history-create-table","click",createHistoryTable);
    bind("history-search","input",renderHistory);
    bind("history-entity-filter","change",renderHistory);
    bind("history-action-filter","change",renderHistory);
    bind("history-status-filter","change",renderHistory);
    bind("history-table-body","click",event=>{
        const button=event.target.closest("[data-revert-history]");
        if(!button)return;
        revertHistory(Number(button.dataset.revertHistory));
    });

    bind("builder-create-table","click",createBuilderTable);
    bind("builder-reload","click",loadBuilder);
    bind("builder-new","click",resetBuilderForm);
    bind("builder-preview","click",previewBuilder);
    bind("builder-regenerate","click",previewBuilder);
    bind("builder-save","click",saveBuilder);
    bind("builder-activate","click",activateBuilder);
    bind("builder-delete","click",deleteBuilder);
    bind("builder-themes-all","click",()=>setBuilderChecks("theme",true));
    bind("builder-themes-none","click",()=>setBuilderChecks("theme",false));
    bind("builder-authors-none","click",()=>setBuilderChecks("author",false));
    bind("builder-table-body","click",event=>{
        const button=event.target.closest("[data-open-build]");
        if(!button)return;
        openBuilder(Number(button.dataset.openBuild));
    });

    bind("applications-create-table","click",createApplicationsTable);
    bind("applications-reload","click",loadApplications);
    bind("applications-search","input",renderApplications);
    bind("applications-status-filter","change",renderApplications);
    bind("applications-type-filter","change",renderApplications);
    bind("applications-sort","change",renderApplications);
    bind("applications-table-body","click",event=>{
        const button=event.target.closest("[data-open-application]");
        if(!button)return;
        openApplication(Number(button.dataset.openApplication));
    });
    bind("application-dialog-close","click",closeApplication);
    bind("application-cancel","click",closeApplication);
    bind("application-approve","click",approveApplication);
    bind("application-reject","click",rejectApplication);
    bind("application-delete","click",deleteApplication);

    bind("quality-table-body","click",event=>{
        const button=event.target.closest("[data-fix-issue]");
        if(!button)return;

        fixQualityIssue(button.dataset.fixIssue);
    });

    loadAll();
}

function bind(id,eventName,handler){
    const node=e[id];

    if(!node){
        console.warn(`TPV Editor: элемент #${id} не найден.`);
        return;
    }

    node.addEventListener(eventName,handler);
}

async function api(url,o={}){const h=new Headers(o.headers||{}),t=document.querySelector('meta[name="csrf-token"]')?.content;h.set("X-Requested-With","XMLHttpRequest");if(t)h.set("X-CSRFToken",t);let body=o.body;if(body&&typeof body!=="string"){h.set("Content-Type","application/json");body=JSON.stringify(body)}const r=await fetch(url,{credentials:"same-origin",...o,headers:h,body});let d={};try{d=await r.json()}catch{}if(!r.ok||d.ok===false)throw new Error(d.message||`HTTP ${r.status}`);return d}
async function loadAll(){await Promise.all([loadUsers(),loadQuestions(),loadThemes()])}
async function loadUsers(){try{const[u,t]=await Promise.all([api("/tpv_editor/api/users"),api("/tpv_editor/api/themes")]);s.users=u.users||[];s.themes=t.themes||[];fillLists();renderUsers()}catch(x){toast(x.message,true)}}
async function loadQuestions(){try{const r=await api("/tpv_editor/api/questions");s.questions=r.questions||[];s.authors=r.authors||[];s.themes=r.themes||s.themes;fillLists();renderQuestions()}catch(x){toast(x.message,true)}}
async function loadThemes(){try{const r=await api("/tpv_editor/api/themes-dashboard");s.themeRows=r.themes||[];renderThemes()}catch(x){toast(x.message,true)}}
function fillLists(){e["theme-options"].innerHTML=s.themes.map(v=>`<option value="${esc(v)}"></option>`).join("");e["question-theme-options"].innerHTML=["общий",...s.themes].map(v=>`<option value="${esc(v)}"></option>`).join("");e["author-options"].innerHTML=[...new Set([...s.users.map(u=>u.username),...s.authors])].sort((a,b)=>a.localeCompare(b,"ru")).map(v=>`<option value="${esc(v)}"></option>`).join("");
 const themeValue=e["question-theme-filter"].value,authorValue=e["question-author-filter"].value;e["question-theme-filter"].innerHTML='<option value="all">Все темы</option><option value="general">Общие</option>'+s.themes.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");e["question-author-filter"].innerHTML='<option value="all">Все авторы</option>'+s.authors.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");if([...e["question-theme-filter"].options].some(o=>o.value===themeValue))e["question-theme-filter"].value=themeValue;if([...e["question-author-filter"].options].some(o=>o.value===authorValue))e["question-author-filter"].value=authorValue;}
function switchTab(tab){
    const titles={
        users:[
            "Пользователи",
            "Постоянная база игроков и авторов из UsersTpv."
        ],
        questions:[
            "Вопросы",
            "Общие вопросы и темы замены из Questions_tpv."
        ],
        themes:[
            "Темы",
            "Управление темами замены без отдельной таблицы."
        ],
        quality:[
            "Проверка базы",
            "Поиск ошибок и безопасное исправление данных."
        ],
        statistics:[
            "Статистика",
            "Актуальная аналитика пользователей, вопросов, тем и авторов."
        ],
        transfer:[
            "Импорт / экспорт",
            "Резервное копирование, выгрузка и контролируемый импорт данных."
        ],
        history:[
            "История изменений",
            "Журнал действий редактора и безопасный откат поддерживаемых операций."
        ],
        builder:[
            "Конструктор игры",
            "Подготовка и сохранение выборки вопросов для конкретной игры."
        ],
        applications:[
            "Заявки на вопросы",
            "Модерация вопросов, отправленных через отдельную публичную форму."
        ]
    };

    if(!titles[tab]){
        console.error(`TPV Editor: неизвестная вкладка "${tab}".`);
        return;
    }

    s.tab=tab;

    document.querySelectorAll("[data-tab]").forEach(button=>{
        const active=button.dataset.tab===tab;
        button.classList.toggle("is-active",active);
        button.setAttribute("aria-selected",String(active));
    });

    setHidden("users-section",tab!=="users");
    setHidden("questions-section",tab!=="questions");
    setHidden("themes-section",tab!=="themes");
    setHidden("quality-section",tab!=="quality");
    setHidden("statistics-section",tab!=="statistics");
    setHidden("transfer-section",tab!=="transfer");
    setHidden("history-section",tab!=="history");
    setHidden("builder-section",tab!=="builder");
    setHidden("applications-section",tab!=="applications");

    document.querySelectorAll(".users-action").forEach(
        node=>node.hidden=tab!=="users"
    );

    document.querySelectorAll(".questions-action").forEach(
        node=>node.hidden=tab!=="questions"
    );

    document.querySelectorAll(".themes-action").forEach(
        node=>node.hidden=tab!=="themes"
    );

    document.querySelectorAll(".quality-action").forEach(
        node=>node.hidden=tab!=="quality"
    );

    if(e["page-title"]){
        e["page-title"].textContent=titles[tab][0];
    }

    if(e["page-subtitle"]){
        e["page-subtitle"].textContent=titles[tab][1];
    }

    if(tab==="themes"){
        loadThemes();
    }

    if(tab==="quality"){
        loadQuality();
    }

    if(tab==="statistics"){
        loadStatistics();
    }

    if(tab==="history"){
        loadHistory();
    }

    if(tab==="builder"){
        loadBuilder();
    }

    if(tab==="applications"){
        loadApplications();
    }
}

function setHidden(id,hidden){
    if(e[id]){
        e[id].hidden=hidden;
    }
}

function renderUsers(){const q=e["search-input"].value.trim().toLowerCase(),a=e["approve-filter"].value,[f,d]=e["sort-select"].value.split("-");let list=s.users.filter(u=>(!q||(u.username||"").toLowerCase().includes(q)||(u.flip_display||"").toLowerCase().includes(q))&&(a==="all"||u.approve===a));list.sort(sorter(f,d,x=>f==="flip"?x.flip_display:x[f]));e["users-table-body"].innerHTML=list.map(u=>`<tr><td>${u.id}</td><td><strong>${esc(u.username)}</strong></td><td class="money-cell">${money(u.money)}</td><td>${esc(u.flip_display||"Не выбрана")}</td><td>${u.flip_col||0}</td><td><span class="status ${u.approve==="true"?"status-approved":"status-rejected"}">${esc(u.approve_label)}</span></td><td><button class="row-edit" data-edit="${u.id}">Изменить</button></td></tr>`).join("");e["empty-state"].hidden=!!list.length;e["stat-total"].textContent=s.users.length;e["stat-approved"].textContent=s.users.filter(u=>u.approve==="true").length;e["stat-without-theme"].textContent=s.users.filter(u=>!u.flip_display).length;e["stat-money"].textContent=money(s.users.reduce((n,u)=>n+(+u.money||0),0))}
function renderQuestions(){const query=e["question-search"].value.trim().toLowerCase(),theme=e["question-theme-filter"].value,author=e["question-author-filter"].value,show=e["question-show-filter"].value,[f,d]=e["question-sort"].value.split("-");let list=s.questions.filter(q=>{const hay=[q.task,q.answer,q.comment,q.author,q.flip_display].join(" ").toLowerCase();const mt=theme==="all"||(theme==="general"?q.is_general:q.flip_display===theme);return(!query||hay.includes(query))&&mt&&(author==="all"||q.author===author)&&(show==="all"||q.show===show)});list.sort(sorter(f,d,x=>f==="flip"?x.flip_display:x[f]));e["questions-table-body"].innerHTML=list.map(q=>`<tr><td>${q.id}</td><td><div class="question-text">${esc(q.task)}</div>${q.comment?`<small>${esc(q.comment)}</small>`:""}</td><td><div class="answer-text">${esc(q.answer)}</div></td><td>${esc(q.author||"—")}</td><td><span class="tag ${q.is_general?"tag-general":"tag-theme"}">${esc(q.flip_display)}</span></td><td><span class="status ${q.show==="true"?"status-rejected":"status-unused"}">${q.show==="true"?"Использован":"Не использован"}</span></td><td><button class="row-edit" data-edit-question="${q.id}">Изменить</button></td></tr>`).join("");e["questions-empty"].hidden=!!list.length;e["q-stat-total"].textContent=s.questions.length;e["q-stat-general"].textContent=s.questions.filter(q=>q.is_general).length;e["q-stat-themed"].textContent=s.questions.filter(q=>!q.is_general).length;e["q-stat-shown"].textContent=s.questions.filter(q=>q.show==="true").length;e["q-stat-themes"].textContent=new Set(s.questions.filter(q=>!q.is_general).map(q=>q.flip_display.toLowerCase())).size}
function renderThemes(){const query=e["theme-search"].value.trim().toLowerCase(),filter=e["theme-state-filter"].value,[field,dir]=e["theme-sort"].value.split("-");let list=s.themeRows.filter(t=>{const search=!query||t.name.toLowerCase().includes(query)||(t.variants||[]).join(" ").toLowerCase().includes(query);const state=filter==="all"||(filter==="ready"&&t.ready)||(filter==="shortage"&&!t.ready&&t.question_count>0)||(filter==="unused"&&t.user_count===0)||(filter==="empty"&&t.question_count===0);return search&&state});list.sort(sorter(field,dir,x=>field==="questions"?x.question_count:field==="users"?x.user_count:x.name));e["themes-table-body"].innerHTML=list.map(t=>{const status=t.question_count===0?["status-neutral","Нет вопросов"]:t.ready?["status-approved","Готова"]:["status-warning",`Не хватает ${Math.max(0,t.required_questions-t.question_count)}`];return `<tr><td><span class="theme-name">${esc(t.name)}</span>${t.variants?.length>1?`<span class="theme-variants">Варианты: ${esc(t.variants.join(", "))}</span>`:""}</td><td>${t.question_count}</td><td>${t.shown_count}</td><td>${t.user_count}</td><td>${t.approved_count}</td><td><span class="status ${status[0]}">${status[1]}</span></td><td><button class="row-edit" data-edit-theme="${esc(t.name)}">Управление</button></td></tr>`}).join("");e["themes-empty"].hidden=!!list.length;e["t-stat-total"].textContent=s.themeRows.length;e["t-stat-questions"].textContent=s.themeRows.reduce((n,t)=>n+t.question_count,0);e["t-stat-users"].textContent=s.themeRows.reduce((n,t)=>n+t.user_count,0);e["t-stat-ready"].textContent=s.themeRows.filter(t=>t.ready).length;e["t-stat-empty"].textContent=s.themeRows.filter(t=>t.question_count===0).length}
function openTheme(t){s.currentTheme=t;e["theme-dialog-title"].textContent=t.name;e["theme-original-name"].value=t.name;e["theme-new-name"].value=t.name;e["theme-dialog-questions"].textContent=t.question_count;e["theme-dialog-users"].textContent=t.user_count;e["theme-dialog-approved"].textContent=t.approved_count;e["theme-dialog-shown"].textContent=t.shown_count;e["theme-delete-target"].innerHTML='<option value="false">Общие вопросы / тема не выбрана</option>'+s.themeRows.filter(x=>x.name!==t.name).map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join("");e["theme-dialog"].showModal()}
function closeTheme(){if(e["theme-dialog"].open)e["theme-dialog"].close();s.currentTheme=null}
async function saveTheme(x){x.preventDefault();if(!s.currentTheme)return;const name=e["theme-new-name"].value.trim();if(!name){toast("Введите новое название темы.",true);return}const exists=s.themeRows.some(t=>t.name.toLowerCase()===name.toLowerCase()&&t.name.toLowerCase()!==s.currentTheme.name.toLowerCase());const text=exists?`Тема «${name}» уже существует. Объединить с ней «${s.currentTheme.name}»?`:`Переименовать «${s.currentTheme.name}» в «${name}»?`;if(!confirm(text))return;try{const r=await api("/tpv_editor/api/themes/rename",{method:"POST",body:{old_name:s.currentTheme.name,new_name:name}});toast(r.message);closeTheme();await loadAll()}catch(z){toast(z.message,true)}}
async function deleteTheme(){if(!s.currentTheme)return;const target=e["theme-delete-target"].value,targetLabel=target==="false"?"общие вопросы / без темы":`тему «${target}»`;if(!confirm(`Удалить тему «${s.currentTheme.name}» и перенести связанные записи в ${targetLabel}?`))return;try{const r=await api("/tpv_editor/api/themes/delete",{method:"POST",body:{name:s.currentTheme.name,target}});toast(r.message);closeTheme();await loadAll()}catch(z){toast(z.message,true)}}




async function loadApplications(){
    try{
        const response=await api("/tpv_editor/api/question-applications");
        const tableExists=response.table_exists!==false;

        if(e["applications-missing-table"]){
            e["applications-missing-table"].hidden=tableExists;
        }

        if(e["applications-content"]){
            e["applications-content"].hidden=!tableExists;
        }

        s.applications=response.items||[];
        const stats=response.stats||{};
        setText("a-stat-total",stats.total||0);
        setText("a-stat-pending",stats.pending||0);
        setText("a-stat-approved",stats.approved||0);
        setText("a-stat-rejected",stats.rejected||0);
        renderApplications();
    }catch(error){
        toast(error.message,true);
    }
}

async function createApplicationsTable(){
    if(!confirm("Создать таблицу заявок в SQLite?"))return;

    try{
        const response=await api(
            "/tpv_editor/api/question-applications/create-table",
            {method:"POST"}
        );
        toast(response.message);
        await loadApplications();
    }catch(error){
        toast(error.message,true);
    }
}

function renderApplications(){
    const query=(e["applications-search"]?.value||"").trim().toLowerCase();
    const status=e["applications-status-filter"]?.value||"pending";
    const type=e["applications-type-filter"]?.value||"all";
    const sort=e["applications-sort"]?.value||"new-desc";

    let list=s.applications.filter(item=>{
        const hay=[
            item.author,item.task,item.answer,item.comment,item.flip_display,
            item.reject_reason
        ].join(" ").toLowerCase();

        return(
            (!query||hay.includes(query))
            &&(status==="all"||item.status===status)
            &&(
                type==="all"
                ||(type==="general"&&item.is_general)
                ||(type==="themed"&&!item.is_general)
            )
        );
    });

    list.sort((a,b)=>{
        if(sort==="author-asc"){
            return String(a.author||"").localeCompare(String(b.author||""),"ru");
        }
        const delta=Number(a.id)-Number(b.id);
        return sort==="new-asc"?delta:-delta;
    });

    if(e["applications-table-body"]){
        e["applications-table-body"].innerHTML=list.map(item=>`<tr>
            <td>${item.id}</td>
            <td>${esc(item.created_at_label)}</td>
            <td><strong>${esc(item.author||"—")}</strong></td>
            <td class="application-question-preview">
                ${esc(item.task)}
                <small>Ответ: ${esc(item.answer)}</small>
            </td>
            <td><span class="tag ${item.is_general?"tag-general":"tag-theme"}">${esc(item.flip_display)}</span></td>
            <td><span class="application-status application-status-${item.status}">${esc(item.status_label)}</span></td>
            <td><button class="row-edit" type="button" data-open-application="${item.id}">Открыть</button></td>
        </tr>`).join("");
    }

    if(e["applications-empty"]){
        e["applications-empty"].hidden=list.length>0;
    }
}

function openApplication(id){
    const item=s.applications.find(row=>row.id===id);
    if(!item)return;

    s.currentApplication=item;
    e["application-id"].value=item.id;
    e["application-dialog-title"].textContent=`Заявка #${item.id}`;
    e["application-author"].value=item.author||"";
    e["application-task"].value=item.task||"";
    e["application-answer"].value=item.answer||"";
    e["application-comment"].value=item.comment||"";
    e["application-flip"].value=item.flip_display||"общий";
    e["application-reject-reason"].value=item.reject_reason||"";
    e["application-create-user"].checked=false;

    const userText=item.author_exists
        ?"Автор уже есть в UsersTpv."
        :"Автора нет в UsersTpv.";

    e["application-meta"].innerHTML=`
        <strong>Статус:</strong> ${esc(item.status_label)}<br>
        <strong>Отправлено:</strong> ${esc(item.created_at_label)}<br>
        <strong>Автор:</strong> ${esc(userText)}
        ${item.question_id?`<br><strong>Создан вопрос:</strong> #${item.question_id}`:""}
    `;

    const pending=item.status==="pending";
    e["application-approve"].hidden=!pending;
    e["application-reject"].hidden=!pending;
    e["application-dialog"].showModal();
}

function closeApplication(){
    if(e["application-dialog"]?.open)e["application-dialog"].close();
    s.currentApplication=null;
}

function applicationPayload(){
    return{
        author:e["application-author"].value.trim(),
        task:e["application-task"].value.trim(),
        answer:e["application-answer"].value.trim(),
        comment:e["application-comment"].value.trim(),
        flip:e["application-flip"].value.trim(),
        create_user:Boolean(e["application-create-user"].checked),
        reject_reason:e["application-reject-reason"].value.trim()
    };
}

async function approveApplication(){
    if(!s.currentApplication)return;
    const payload=applicationPayload();

    if(!payload.task||!payload.answer||!payload.author){
        toast("Автор, вопрос и ответ обязательны.",true);
        return;
    }

    if(!confirm("Утвердить заявку и добавить вопрос в Questions_tpv?"))return;

    try{
        const response=await api(
            `/tpv_editor/api/question-applications/${s.currentApplication.id}/approve`,
            {method:"POST",body:payload}
        );
        toast(response.message);
        closeApplication();
        await loadAll();
        await loadApplications();
    }catch(error){
        toast(error.message,true);
    }
}

async function rejectApplication(){
    if(!s.currentApplication)return;
    const payload=applicationPayload();

    if(!payload.reject_reason){
        toast("Укажите причину отклонения.",true);
        e["application-reject-reason"].focus();
        return;
    }

    if(!confirm("Отклонить эту заявку?"))return;

    try{
        const response=await api(
            `/tpv_editor/api/question-applications/${s.currentApplication.id}/reject`,
            {method:"POST",body:payload}
        );
        toast(response.message);
        closeApplication();
        await loadApplications();
    }catch(error){
        toast(error.message,true);
    }
}

async function deleteApplication(){
    if(!s.currentApplication)return;

    if(!confirm("Удалить заявку из истории модерации?"))return;

    try{
        const response=await api(
            `/tpv_editor/api/question-applications/${s.currentApplication.id}`,
            {method:"DELETE"}
        );
        toast(response.message);
        closeApplication();
        await loadApplications();
    }catch(error){
        toast(error.message,true);
    }
}

async function loadBuilder(){
    try{
        const response=await api("/tpv_editor/api/game-builder");
        const tableExists=response.table_exists!==false;

        if(e["builder-missing-table"]){
            e["builder-missing-table"].hidden=tableExists;
        }

        if(e["builder-content"]){
            e["builder-content"].hidden=!tableExists;
        }

        s.builderItems=response.items||[];
        renderBuilderOptions(response.themes||s.themes,response.authors||s.authors);
        renderBuilderList();
        updateBuilderStats(response.stats||{});
    }catch(error){
        toast(error.message,true);
    }
}

async function createBuilderTable(){
    if(!confirm("Создать таблицу конструктора игры в SQLite?"))return;

    try{
        const response=await api(
            "/tpv_editor/api/game-builder/create-table",
            {method:"POST"}
        );
        toast(response.message);
        await loadBuilder();
    }catch(error){
        toast(error.message,true);
    }
}

function renderBuilderOptions(themes,authors){
    if(e["builder-themes-list"]){
        const selected=new Set(
            [...e["builder-themes-list"].querySelectorAll("input:checked")]
                .map(node=>node.value)
        );

        e["builder-themes-list"].innerHTML=(themes||[]).map(theme=>`
            <label class="builder-check-item">
                <input type="checkbox" data-builder-check="theme" value="${esc(theme)}" ${selected.has(theme)?"checked":""}>
                <span title="${esc(theme)}">${esc(theme)}</span>
            </label>
        `).join("");
    }

    if(e["builder-authors-list"]){
        const selected=new Set(
            [...e["builder-authors-list"].querySelectorAll("input:checked")]
                .map(node=>node.value)
        );

        e["builder-authors-list"].innerHTML=(authors||[]).map(author=>`
            <label class="builder-check-item">
                <input type="checkbox" data-builder-check="author" value="${esc(author)}" ${selected.has(author)?"checked":""}>
                <span title="${esc(author)}">${esc(author)}</span>
            </label>
        `).join("");
    }
}

function setBuilderChecks(type,checked){
    document.querySelectorAll(`[data-builder-check="${type}"]`).forEach(node=>{
        node.checked=checked;
    });
}

function builderPayload(){
    return{
        name:(e["builder-name"]?.value||"").trim(),
        limit:Number(e["builder-limit"]?.value||30),
        general_mode:e["builder-general"]?.value||"include",
        unused_only:Boolean(e["builder-unused-only"]?.checked),
        randomize:Boolean(e["builder-randomize"]?.checked),
        themes:[
            ...document.querySelectorAll(
                '[data-builder-check="theme"]:checked'
            )
        ].map(node=>node.value),
        excluded_authors:[
            ...document.querySelectorAll(
                '[data-builder-check="author"]:checked'
            )
        ].map(node=>node.value)
    };
}

async function previewBuilder(){
    const payload=builderPayload();

    if(!payload.name){
        payload.name="Новый набор";
    }

    try{
        const response=await api(
            "/tpv_editor/api/game-builder/preview",
            {method:"POST",body:payload}
        );
        s.builderPreview=response.questions||[];
        renderBuilderPreview(response);
        e["builder-regenerate"].disabled=false;
        setText("b-stat-available",response.available_count||0);
        setText("b-stat-selected",s.builderPreview.length);
    }catch(error){
        toast(error.message,true);
    }
}

function renderBuilderPreview(response){
    const list=response.questions||[];

    if(e["builder-preview-body"]){
        e["builder-preview-body"].innerHTML=list.map((question,index)=>`<tr>
            <td>${index+1}</td>
            <td>${question.id}</td>
            <td><div class="question-text">${esc(question.task)}</div></td>
            <td>${esc(question.author||"—")}</td>
            <td><span class="tag ${question.is_general?"tag-general":"tag-theme"}">${esc(question.flip_display)}</span></td>
            <td>${question.show==="true"?"Использован":"Не использован"}</td>
        </tr>`).join("");
    }

    if(e["builder-preview-empty"]){
        e["builder-preview-empty"].hidden=list.length>0;
        if(!list.length){
            e["builder-preview-empty"].textContent="По заданным условиям вопросы не найдены.";
        }
    }

    if(e["builder-preview-summary"]){
        e["builder-preview-summary"].textContent=
            `Доступно: ${response.available_count||0}. Выбрано: ${list.length}.`;
    }
}

async function saveBuilder(){
    const payload=builderPayload();
    payload.question_ids=s.builderPreview.map(question=>question.id);

    if(!payload.name){
        toast("Введите название набора.",true);
        e["builder-name"]?.focus();
        return;
    }

    if(!payload.question_ids.length){
        toast("Сначала сформируйте предпросмотр.",true);
        return;
    }

    const id=Number(e["builder-id"]?.value||0);
    const url=id
        ?`/tpv_editor/api/game-builder/${id}`
        :"/tpv_editor/api/game-builder";
    const method=id?"PUT":"POST";

    try{
        const response=await api(url,{method,body:payload});
        toast(response.message);
        await loadBuilder();
        if(response.item){
            fillBuilderForm(response.item);
        }
    }catch(error){
        toast(error.message,true);
    }
}

function renderBuilderList(){
    const list=s.builderItems||[];

    if(e["builder-table-body"]){
        e["builder-table-body"].innerHTML=list.map(item=>{
            const filters=[];
            if(item.unused_only)filters.push("Только новые");
            if(item.general_mode==="only")filters.push("Только общие");
            if(item.general_mode==="exclude")filters.push("Без общих");
            if(item.themes.length)filters.push(`Тем: ${item.themes.length}`);
            if(item.excluded_authors.length)filters.push(`Исключено авторов: ${item.excluded_authors.length}`);

            return `<tr class="${item.is_active?"builder-active-row":""}">
                <td><strong>${esc(item.name)}</strong></td>
                <td>${item.question_count}</td>
                <td><div class="builder-filter-summary">${filters.map(value=>`<span>${esc(value)}</span>`).join("")||"<span>Без ограничений</span>"}</div></td>
                <td>${esc(item.updated_at_label)}</td>
                <td>${item.is_active?'<span class="builder-status-active">Активен</span>':'<span class="builder-status-draft">Черновик</span>'}</td>
                <td><div class="builder-row-actions"><button class="row-edit" type="button" data-open-build="${item.id}">Открыть</button></div></td>
            </tr>`;
        }).join("");
    }

    if(e["builder-empty"]){
        e["builder-empty"].hidden=list.length>0;
    }
}

function openBuilder(id){
    const item=s.builderItems.find(row=>row.id===id);
    if(!item)return;
    fillBuilderForm(item);
}

function fillBuilderForm(item){
    s.currentBuild=item;
    e["builder-id"].value=item.id;
    e["builder-name"].value=item.name;
    e["builder-limit"].value=item.limit;
    e["builder-general"].value=item.general_mode;
    e["builder-unused-only"].checked=item.unused_only;
    e["builder-randomize"].checked=item.randomize;

    setBuilderChecks("theme",false);
    setBuilderChecks("author",false);

    const themeSet=new Set(item.themes||[]);
    const authorSet=new Set(item.excluded_authors||[]);

    document.querySelectorAll('[data-builder-check="theme"]').forEach(node=>{
        node.checked=themeSet.has(node.value);
    });

    document.querySelectorAll('[data-builder-check="author"]').forEach(node=>{
        node.checked=authorSet.has(node.value);
    });

    s.builderPreview=item.questions||[];
    renderBuilderPreview({
        questions:s.builderPreview,
        available_count:item.available_count??item.question_count
    });

    e["builder-activate"].disabled=false;
    e["builder-delete"].disabled=false;
    e["builder-regenerate"].disabled=false;
    setText("b-stat-selected",s.builderPreview.length);
}

function resetBuilderForm(){
    s.currentBuild=null;
    s.builderPreview=[];
    e["builder-id"].value="";
    e["builder-name"].value="";
    e["builder-limit"].value=30;
    e["builder-general"].value="include";
    e["builder-unused-only"].checked=true;
    e["builder-randomize"].checked=true;
    setBuilderChecks("theme",false);
    setBuilderChecks("author",false);
    renderBuilderPreview({questions:[],available_count:0});
    e["builder-preview-empty"].hidden=false;
    e["builder-preview-empty"].textContent="Предпросмотр ещё не сформирован.";
    e["builder-activate"].disabled=true;
    e["builder-delete"].disabled=true;
    e["builder-regenerate"].disabled=true;
    setText("b-stat-selected",0);
}

async function activateBuilder(){
    const id=Number(e["builder-id"]?.value||0);
    if(!id)return;

    if(!confirm("Сделать этот набор активным для игры?"))return;

    try{
        const response=await api(
            `/tpv_editor/api/game-builder/${id}/activate`,
            {method:"POST"}
        );
        toast(response.message);
        await loadBuilder();
    }catch(error){
        toast(error.message,true);
    }
}

async function deleteBuilder(){
    const id=Number(e["builder-id"]?.value||0);
    if(!id)return;

    if(!confirm("Удалить сохранённый набор? Вопросы из базы удалены не будут."))return;

    try{
        const response=await api(
            `/tpv_editor/api/game-builder/${id}`,
            {method:"DELETE"}
        );
        toast(response.message);
        resetBuilderForm();
        await loadBuilder();
    }catch(error){
        toast(error.message,true);
    }
}

function updateBuilderStats(stats){
    setText("b-stat-total",stats.total||0);
    setText("b-stat-active",stats.active_name||"Нет");
    setText("b-stat-unused",stats.unused_questions||0);

    if(!s.builderPreview.length){
        setText("b-stat-selected",0);
    }
}

async function loadHistory(){
    try{
        const response=await api("/tpv_editor/api/history");
        const tableExists=response.table_exists!==false;

        if(e["history-missing-table"]){
            e["history-missing-table"].hidden=tableExists;
        }

        if(e["history-content"]){
            e["history-content"].hidden=!tableExists;
        }

        s.historyItems=response.items||[];
        s.historyStats=response.stats||{};
        renderHistory();
    }catch(error){
        toast(error.message,true);
    }
}

async function createHistoryTable(){
    if(!confirm("Создать таблицу истории изменений в SQLite?"))return;

    try{
        const response=await api(
            "/tpv_editor/api/history/create-table",
            {method:"POST"}
        );
        toast(response.message);
        await loadHistory();
    }catch(error){
        toast(error.message,true);
    }
}

function renderHistory(){
    const query=(e["history-search"]?.value||"").trim().toLowerCase();
    const entity=e["history-entity-filter"]?.value||"all";
    const action=e["history-action-filter"]?.value||"all";
    const status=e["history-status-filter"]?.value||"all";

    let list=s.historyItems.filter(item=>{
        const hay=[
            item.title,
            item.details,
            item.entity_label,
            item.entity_id,
            item.action_label
        ].join(" ").toLowerCase();

        const matchesStatus=
            status==="all"
            ||(status==="active"&&!item.reverted)
            ||(status==="reverted"&&item.reverted)
            ||(
                status==="revertible"
                &&item.can_revert
                &&!item.reverted
            );

        return(
            (!query||hay.includes(query))
            &&(entity==="all"||item.entity_type===entity)
            &&(action==="all"||item.action===action)
            &&matchesStatus
        );
    });

    if(e["history-table-body"]){
        e["history-table-body"].innerHTML=list.map(item=>{
            const date=new Date(item.created_at);
            const dateText=Number.isNaN(date.getTime())
                ?item.created_at
                :date.toLocaleDateString("ru-RU");
            const timeText=Number.isNaN(date.getTime())
                ?""
                :date.toLocaleTimeString(
                    "ru-RU",
                    {hour:"2-digit",minute:"2-digit",second:"2-digit"}
                );

            const beforeText=item.before
                ?esc(JSON.stringify(item.before,null,2))
                :"Нет";
            const afterText=item.after
                ?esc(JSON.stringify(item.after,null,2))
                :"Нет";

            const changes=`
                <details>
                    <summary>Показать данные</summary>
                    <div class="history-json"><strong>До:</strong>\n${beforeText}\n\n<strong>После:</strong>\n${afterText}</div>
                </details>
            `;

            const revertButton=(
                item.can_revert&&!item.reverted
            )
                ?`<button class="row-edit" type="button" data-revert-history="${item.id}">Откатить</button>`
                :"—";

            return `<tr>
                <td>
                    <span class="history-time">${dateText}<small>${timeText}</small></span>
                </td>
                <td>
                    <span class="history-action-badge history-action-${esc(item.action)}">${esc(item.action_label)}</span>
                </td>
                <td>
                    <span class="history-entity-badge">${esc(item.entity_label)}</span>
                    ${item.entity_id?`<small>#${esc(item.entity_id)}</small>`:""}
                </td>
                <td class="history-description">
                    <strong>${esc(item.title)}</strong>
                    ${item.details?`<small>${esc(item.details)}</small>`:""}
                </td>
                <td class="history-changes">${changes}</td>
                <td class="history-status">
                    ${item.reverted
                        ?'<span class="history-reverted">Отменено</span>'
                        :'<span class="history-active">Активно</span>'}
                </td>
                <td>${revertButton}</td>
            </tr>`;
        }).join("");
    }

    if(e["history-empty"]){
        e["history-empty"].hidden=list.length>0;
    }

    setText("h-stat-total",s.historyStats.total||0);
    setText("h-stat-today",s.historyStats.today||0);
    setText("h-stat-revertible",s.historyStats.revertible||0);
    setText("h-stat-reverted",s.historyStats.reverted||0);
}

async function revertHistory(historyId){
    const item=s.historyItems.find(row=>row.id===historyId);
    if(!item)return;

    if(!confirm(`Отменить операцию «${item.title}»?`))return;

    try{
        const response=await api(
            `/tpv_editor/api/history/${historyId}/revert`,
            {method:"POST"}
        );
        toast(response.message);
        await loadAll();
        await loadHistory();
    }catch(error){
        toast(error.message,true);
    }
}

async function loadStatistics(){
    try{
        const response=await api("/tpv_editor/api/statistics");
        s.statistics=response.statistics||null;
        renderStatistics();
    }catch(error){
        toast(error.message,true);
    }
}

function renderStatistics(){
    const data=s.statistics;
    if(!data)return;

    const summary=data.summary||{};
    const readiness=data.readiness||{};
    const questions=data.questions||{};
    const themes=data.themes||[];
    const authors=data.authors||[];
    const users=data.users||[];

    setText("s-stat-users",summary.users);
    setText("s-stat-questions",summary.questions);
    setText("s-stat-themes",summary.themes);
    setText("s-stat-approved",summary.approved_users);
    setText("s-stat-usage",`${questions.usage_percent||0}%`);

    setText("s-general",questions.general);
    setText("s-themed",questions.themed);
    setText("s-shown",questions.shown);
    setText("s-unused",questions.unused);
    setText("s-usage-label",`${questions.usage_percent||0}%`);

    if(e["s-usage-bar"]){
        e["s-usage-bar"].style.width=`${Math.min(100,Math.max(0,questions.usage_percent||0))}%`;
    }

    const generalQuestions=data.general_questions||{};
    setText("s-general-total",generalQuestions.total);
    setText("s-general-used",generalQuestions.used);
    setText("s-general-unused",generalQuestions.unused);
    setText("s-general-available",generalQuestions.available);
    setText("s-general-usage",`${generalQuestions.usage_percent||0}%`);
    setText("s-general-usage-label",`${generalQuestions.usage_percent||0}%`);
    if(e["s-general-usage-bar"]){
        e["s-general-usage-bar"].style.width=`${Math.min(100,Math.max(0,generalQuestions.usage_percent||0))}%`;
    }

    setText("s-ready-themes",readiness.ready_themes);
    setText("s-shortage-themes",readiness.shortage_themes);
    setText("s-without-theme",readiness.users_without_theme);
    setText("s-not-approved",readiness.users_not_approved);

    if(e["statistics-themes-body"]){
        e["statistics-themes-body"].innerHTML=themes.map(theme=>{
            const status=theme.ready
                ?'<span class="status status-approved">Готова</span>'
                :`<span class="status status-warning">Не хватает ${theme.missing}</span>`;

            return `<tr>
                <td>${esc(theme.name)}</td>
                <td>${theme.question_count}</td>
                <td>${theme.shown_count}</td>
                <td>${theme.user_count}</td>
                <td>${status}</td>
            </tr>`;
        }).join("");
    }

    if(e["statistics-themes-empty"]){
        e["statistics-themes-empty"].hidden=themes.length>0;
    }

    if(e["statistics-authors-body"]){
        e["statistics-authors-body"].innerHTML=authors.map(author=>`<tr>
            <td>${esc(author.name||"Без автора")}</td>
            <td>${author.total}</td>
            <td>${author.general}</td>
            <td>${author.themed}</td>
            <td>${author.shown}</td>
        </tr>`).join("");
    }

    if(e["statistics-authors-empty"]){
        e["statistics-authors-empty"].hidden=authors.length>0;
    }

    if(e["statistics-users-body"]){
        e["statistics-users-body"].innerHTML=users.map(user=>`<tr>
            <td>${esc(user.username)}</td>
            <td class="money-cell">${money(user.money)}</td>
            <td>${esc(user.theme||"Не выбрана")}</td>
            <td>${user.question_count}</td>
            <td><span class="status ${user.approved?"status-approved":"status-rejected"}">
                ${user.approved?"Допущен":"Не допущен"}
            </span></td>
        </tr>`).join("");
    }

    if(e["statistics-users-empty"]){
        e["statistics-users-empty"].hidden=users.length>0;
    }
}

function setText(id,value){
    if(e[id]){
        e[id].textContent=value??0;
    }
}


async function uploadApi(url,formData){
    const headers=new Headers();
    const csrf=document.querySelector('meta[name="csrf-token"]')?.content;
    headers.set("X-Requested-With","XMLHttpRequest");
    if(csrf)headers.set("X-CSRFToken",csrf);

    const response=await fetch(url,{
        method:"POST",
        credentials:"same-origin",
        headers,
        body:formData
    });

    let data={};
    try{data=await response.json()}catch{}

    if(!response.ok||data.ok===false){
        throw new Error(data.message||`HTTP ${response.status}`);
    }

    return data;
}

function importFormData(){
    const file=e["import-file"]?.files?.[0];
    if(!file)throw new Error("Выберите файл для импорта.");

    const formData=new FormData();
    formData.append("file",file);
    formData.append("entity",e["import-entity"].value);
    formData.append("mode",e["import-mode"].value);
    return formData;
}

function resetImportPreview(){
    s.importPreview=null;
    if(e["import-preview"])e["import-preview"].hidden=true;
    if(e["import-apply-button"])e["import-apply-button"].disabled=true;
}

async function previewImport(){
    try{
        const result=await uploadApi("/tpv_editor/api/import-preview",importFormData());
        s.importPreview=result.preview||null;
        renderImportPreview();
        e["import-apply-button"].disabled=!(s.importPreview&&s.importPreview.valid);
    }catch(error){
        resetImportPreview();
        toast(error.message,true);
    }
}

function renderImportPreview(){
    const preview=s.importPreview||{};
    setText("import-users-count",preview.users_count||0);
    setText("import-questions-count",preview.questions_count||0);
    setText("import-errors-count",(preview.errors||[]).length);
    setText("import-warnings-count",(preview.warnings||[]).length);

    const rows=[
        ...(preview.errors||[]).map(message=>({message,type:"error"})),
        ...(preview.warnings||[]).map(message=>({message,type:"warning"}))
    ];

    if(e["import-messages"]){
        e["import-messages"].innerHTML=rows.length
            ?rows.map(row=>`<li class="is-${row.type}">${esc(row.message)}</li>`).join("")
            :"<li>Файл прошёл проверку. Можно применять импорт.</li>";
    }

    if(e["import-preview"])e["import-preview"].hidden=false;
}

async function applyImport(){
    if(!s.importPreview?.valid)return;

    const mode=e["import-mode"].value;
    const warning=mode==="replace"
        ?"Выбран режим полной замены. Текущие записи соответствующего раздела будут удалены. Продолжить?"
        :"Добавить и обновить данные из проверенного файла?";

    if(!confirm(warning))return;

    try{
        e["import-apply-button"].disabled=true;
        const result=await uploadApi("/tpv_editor/api/import",importFormData());
        toast(result.message||"Импорт завершён.");
        resetImportPreview();
        if(e["import-file"])e["import-file"].value="";
        await loadAll();
        if(s.tab==="statistics")await loadStatistics();
    }catch(error){
        toast(error.message,true);
        e["import-apply-button"].disabled=false;
    }
}

async function loadQuality(){try{const r=await api("/tpv_editor/api/quality-report");s.qualityIssues=r.issues||[];s.qualityStats=r.stats||{};renderQuality()}catch(z){toast(z.message,true)}}
function renderQuality(){const query=(e["quality-search"].value||"").trim().toLowerCase(),level=e["quality-level-filter"].value,entity=e["quality-entity-filter"].value,fix=e["quality-fix-filter"].value;const names={question:"Вопрос",user:"Пользователь",theme:"Тема"};let list=s.qualityIssues.filter(i=>{const hay=[i.title,i.details,i.recommendation,i.entity,i.record_id,i.code].join(" ").toLowerCase();return(!query||hay.includes(query))&&(level==="all"||i.level===level)&&(entity==="all"||i.entity===entity)&&(fix==="all"||(fix==="fixable"&&i.fixable)||(fix==="manual"&&!i.fixable))});e["quality-table-body"].innerHTML=list.map(i=>`<tr><td><span class="issue-level issue-${i.level}">${i.level==="critical"?"Критично":i.level==="warning"?"Внимание":"Инфо"}</span></td><td><span class="issue-entity">${names[i.entity]||esc(i.entity)}</span></td><td><strong>${esc(i.title)}</strong><span class="issue-details">${esc(i.details)}</span></td><td><span class="issue-record">#${esc(i.record_id)}</span></td><td>${esc(i.recommendation)}</td><td>${i.fixable?`<button class="row-edit quality-action" data-fix-issue="${esc(i.key)}">Исправить</button>`:"—"}</td></tr>`).join("");e["quality-empty"].hidden=!!list.length;e["c-stat-total"].textContent=s.qualityStats.total||0;e["c-stat-critical"].textContent=s.qualityStats.critical||0;e["c-stat-warning"].textContent=s.qualityStats.warning||0;e["c-stat-fixable"].textContent=s.qualityStats.fixable||0;e["c-stat-scanned"].textContent=s.qualityStats.scanned||0}
async function fixQualityIssue(key){const issue=s.qualityIssues.find(i=>i.key===key);if(!issue)return;if(!confirm(`Исправить: ${issue.title}?`))return;try{const r=await api("/tpv_editor/api/quality/fix",{method:"POST",body:{code:issue.code,entity:issue.entity,record_id:issue.record_id}});toast(r.message);await loadAll();await loadQuality()}catch(z){toast(z.message,true)}}
async function fixAllQuality(){const count=s.qualityIssues.filter(i=>i.fixable).length;if(!count){toast("Безопасных автоматических исправлений нет.");return}if(!confirm(`Выполнить безопасные исправления для найденных проблем?`))return;try{const r=await api("/tpv_editor/api/quality/fix-all-safe",{method:"POST"});toast(r.message);await loadAll();await loadQuality()}catch(z){toast(z.message,true)}}
function sorter(f,d,get){return(a,b)=>{const A=get(a),B=get(b),n=typeof A==="number"||typeof B==="number"?(+A||0)-(+B||0):String(A||"").localeCompare(String(B||""),"ru");return d==="desc"?-n:n}}
function openUser(u){s.current=u;e["user-form"].reset();e["dialog-title"].textContent=u?`Пользователь #${u.id}`:"Новый пользователь";e["user-id"].value=u?.id||"";e["user-username"].value=u?.username||"";e["user-money"].value=u?.money||0;e["user-flip"].value=u?.flip_display||"";e["user-flip-count"].value=u?.flip_col||0;e["user-approve"].value=u?.approve_label||"Будет рассчитан";e["delete-user-button"].hidden=e["reset-money-button"].hidden=!u;e["user-dialog"].showModal()}
function closeUser(){if(e["user-dialog"].open)e["user-dialog"].close();s.current=null}
async function saveUser(x){x.preventDefault();const id=+e["user-id"].value,p={username:e["user-username"].value.trim(),money:+e["user-money"].value||0,flip:e["user-flip"].value.trim()};try{const r=await api(id?`/tpv_editor/api/users/${id}`:"/tpv_editor/api/users",{method:id?"PUT":"POST",body:p});toast(r.message);closeUser();await loadAll()}catch(z){toast(z.message,true)}}
async function removeUser(){if(!s.current||!confirm(`Удалить «${s.current.username}»?`))return;try{const r=await api(`/tpv_editor/api/users/${s.current.id}`,{method:"DELETE"});toast(r.message);closeUser();await loadAll()}catch(z){toast(z.message,true)}}
async function resetMoney(){if(!s.current||!confirm(`Обнулить баланс «${s.current.username}»?`))return;try{const r=await api(`/tpv_editor/api/users/${s.current.id}/reset-money`,{method:"POST"});toast(r.message);closeUser();await loadAll()}catch(z){toast(z.message,true)}}
async function recalcAll(){if(!confirm("Пересчитать допуски у всех пользователей?"))return;try{const r=await api("/tpv_editor/api/users/recalculate-all",{method:"POST"});toast(r.message);await loadAll()}catch(z){toast(z.message,true)}}
function openQuestion(q){s.currentQuestion=q;e["question-form"].reset();e["question-dialog-title"].textContent=q?`Вопрос #${q.id}`:"Новый вопрос";e["question-id"].value=q?.id||"";e["question-task"].value=q?.task||"";e["question-answer"].value=q?.answer||"";e["question-comment"].value=q?.comment||"";e["question-author"].value=q?.author||"";e["question-flip"].value=q?.flip_display||"общий";e["question-show"].value=q?.show||"false";e["delete-question-button"].hidden=e["duplicate-question-button"].hidden=!q;e["question-dialog"].showModal()}
function closeQuestion(){if(e["question-dialog"].open)e["question-dialog"].close();s.currentQuestion=null}
function questionPayload(){return{task:e["question-task"].value.trim(),answer:e["question-answer"].value.trim(),comment:e["question-comment"].value.trim(),author:e["question-author"].value.trim(),flip:e["question-flip"].value.trim(),show:e["question-show"].value}}
async function saveQuestion(x){x.preventDefault();const id=+e["question-id"].value;try{const r=await api(id?`/tpv_editor/api/questions/${id}`:"/tpv_editor/api/questions",{method:id?"PUT":"POST",body:questionPayload()});toast(r.message);closeQuestion();await loadAll()}catch(z){toast(z.message,true)}}
async function removeQuestion(){if(!s.currentQuestion||!confirm(`Удалить вопрос #${s.currentQuestion.id}?`))return;try{const r=await api(`/tpv_editor/api/questions/${s.currentQuestion.id}`,{method:"DELETE"});toast(r.message);closeQuestion();await loadAll()}catch(z){toast(z.message,true)}}
async function duplicateQuestion(){if(!s.currentQuestion)return;try{const r=await api(`/tpv_editor/api/questions/${s.currentQuestion.id}/duplicate`,{method:"POST"});toast(r.message);closeQuestion();await loadAll()}catch(z){toast(z.message,true)}}
async function resetShown(){const count=s.questions.filter(q=>q.show==="true").length;if(!count){toast("Использованных вопросов нет.");return}if(!confirm(`Сбросить признак использования у ${count} вопросов?`))return;try{const r=await api("/tpv_editor/api/questions/reset-shown",{method:"POST"});toast(r.message);await loadQuestions()}catch(z){toast(z.message,true)}}
function money(v){return Number(v||0).toLocaleString("ru-RU")}function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function toast(m,err=false){const d=document.createElement("div");d.className=`toast${err?" toast-error":""}`;d.textContent=m;e["toast-region"].append(d);setTimeout(()=>d.remove(),4000)}})();