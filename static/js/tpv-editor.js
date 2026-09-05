
const PARTICIPATION_APPLICATION_STATUS_LABELS = Object.freeze({
  new: "Новая",
  reviewing: "На рассмотрении",
  accepted: "Принята",
  confirmed: "Подтверждена",
  rejected: "Отклонена"
});
function participationApplicationStatusLabel(status){
  return PARTICIPATION_APPLICATION_STATUS_LABELS[status] || status || "—";
}
(()=>{"use strict";
const s={users:[],themes:[],questions:[],authors:[],current:null,currentQuestion:null,currentTheme:null,themeRows:[],qualityIssues:[],qualityStats:{},statistics:null,importPreview:null,historyItems:[],historyStats:{},builderItems:[],builderPreview:[],currentBuild:null,applications:[],currentApplication:null,dashboard:null,games:[],gameStats:{},currentGame:null,gamesView:"archive",tab:"dashboard",replayEvents:[],replayIndex:0,replayTimer:null,replayPlaying:false,replaySpeed:1,records:null},e={};
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

    bind("dashboard-refresh","click",loadDashboard);
    bind("maintenance-clear-history","click",clearHistoryFromDashboard);
    bind("maintenance-clear-applications","click",clearApplicationsFromDashboard);
    bind("dashboard-backup","click",createDashboardBackup);
    bind("maintenance-backup","click",createDashboardBackup);
    bind("dashboard-recalculate","click",recalculateDashboardApprovals);
    bind("maintenance-vacuum","click",()=>runMaintenanceAction("vacuum"));
    bind("maintenance-analyze","click",()=>runMaintenanceAction("analyze"));
    bind("maintenance-integrity","click",()=>runMaintenanceAction("integrity"));
    bind("maintenance-full","click",runFullMaintenance);
    bind("games-create-table","click",createGamesTables);
    bind("games-reload","click",loadGames);
    bind("records-reload","click",loadRecords);
    bind("operational-settings-form","submit",saveOperationalSettings);
    bind("operational-settings-reload","click",loadOperationalSettings);
    bind("yandex-auth-enabled","change",renderOperationalSwitches);
    bind("participation-form-enabled","change",renderOperationalSwitches);
    bind("question-form-enabled","change",renderOperationalSwitches);
    bind("participation-form-enabled","change",renderOperationalSwitches);
    bind("question-form-enabled","change",renderOperationalSwitches);
    bind("games-export-all","click",exportGamesArchive);
    bind("games-clear-all","click",clearGamesArchive);
    bind("games-import","click",()=>e["games-import-file"]?.click());
    bind("games-import-file","change",importGamesArchive);
    bind("games-new","click",()=>openGame(null));
    bind("games-welcome-new","click",()=>openGame(null));
    bind("games-search","input",renderGames);
    bind("games-season-filter","change",renderGames);
    bind("games-status-filter","change",renderGames);
    bind("games-sort","change",renderGames);
    bind("games-table-body","click",event=>{const button=event.target.closest("[data-open-game]");if(button)openGame(Number(button.dataset.openGame));});
    bind("game-dialog-close","click",closeGame);
    bind("game-edit","click",()=>setGameEditMode(true));
    bind("game-cancel-edit","click",()=>setGameEditMode(false));
    document.querySelectorAll("[data-game-card-tab]").forEach(button=>{
        button.addEventListener("click",()=>switchGameCardTab(button.dataset.gameCardTab));
    });
    bind("game-replay-play","click",toggleGameReplay);
    bind("game-replay-prev","click",()=>stepGameReplay(-1));
    bind("game-replay-next","click",()=>stepGameReplay(1));
    bind("game-replay-first","click",()=>setGameReplayIndex(0));
    bind("game-replay-last","click",()=>setGameReplayIndex(Math.max(0,s.replayEvents.length-1)));
    bind("game-replay-progress","input",event=>{
        setGameReplayIndex(Number(event.target.value||0),false);
    });
    bind("game-replay-speed","change",event=>{
        s.replaySpeed=Number(event.target.value||1);
        if(s.replayPlaying){
            stopGameReplayTimer();
            startGameReplayTimer();
        }
    });
    bind("game-cancel","click",closeGame);
    bind("game-save","click",saveGame);
    bind("game-delete","click",deleteGame);
    bind("game-export-json","click",exportGameJson);
    document.querySelectorAll("[data-games-view]").forEach(button=>button.addEventListener("click",()=>switchGamesView(button.dataset.gamesView)));
    document.querySelectorAll("[data-analytics-tab]").forEach(button=>button.addEventListener("click",()=>switchGamesAnalyticsTab(button.dataset.analyticsTab)));

    document.querySelectorAll("[data-dashboard-tab]").forEach(button=>{
        button.addEventListener("click",()=>{
            const tab=button.dataset.dashboardTab;
            const action=button.dataset.dashboardAction;
            switchTab(tab);
            if(action==="new-question")setTimeout(()=>openQuestion(null),0);
            if(action==="new-user")setTimeout(()=>openUser(null),0);
        });
    });

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

async function api(url,o={}){const h=new Headers(o.headers||{}),t=document.querySelector('meta[name="csrf-token"]')?.content;h.set("X-Requested-With","XMLHttpRequest");if(t)h.set("X-CSRFToken",t);let body=o.body;if(body&&typeof body!=="string"){h.set("Content-Type","application/json");body=JSON.stringify(body)}const r=await fetch(url,{credentials:"same-origin",...o,headers:h,body});let d={};try{d=await r.json()}catch{}if(!r.ok||d.ok===false)throw new Error(d.error||d.message||`HTTP ${r.status}`);return d}
async function loadAll(){await Promise.all([loadUsers(),loadQuestions(),loadThemes()]);if(s.tab==="dashboard")await loadDashboard()}
async function loadUsers(){try{const[u,t]=await Promise.all([api("/tpv_editor/api/users"),api("/tpv_editor/api/themes")]);s.users=u.users||[];s.themes=t.themes||[];fillLists();renderUsers()}catch(x){toast(x.message,true)}}
async function loadQuestions(){try{const r=await api("/tpv_editor/api/questions");s.questions=r.questions||[];s.authors=r.authors||[];s.themes=r.themes||s.themes;fillLists();renderQuestions()}catch(x){toast(x.message,true)}}
async function loadThemes(){try{const r=await api("/tpv_editor/api/themes-dashboard");s.themeRows=r.themes||[];renderThemes()}catch(x){toast(x.message,true)}}
function fillLists(){e["theme-options"].innerHTML=s.themes.map(v=>`<option value="${esc(v)}"></option>`).join("");e["question-theme-options"].innerHTML=["общий",...s.themes].map(v=>`<option value="${esc(v)}"></option>`).join("");e["author-options"].innerHTML=[...new Set([...s.users.map(u=>u.username),...s.authors])].sort((a,b)=>a.localeCompare(b,"ru")).map(v=>`<option value="${esc(v)}"></option>`).join("");
 const themeValue=e["question-theme-filter"].value,authorValue=e["question-author-filter"].value;e["question-theme-filter"].innerHTML='<option value="all">Все темы</option><option value="general">Общие</option>'+s.themes.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");e["question-author-filter"].innerHTML='<option value="all">Все авторы</option>'+s.authors.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");if([...e["question-theme-filter"].options].some(o=>o.value===themeValue))e["question-theme-filter"].value=themeValue;if([...e["question-author-filter"].options].some(o=>o.value===authorValue))e["question-author-filter"].value=authorValue;}
function switchTab(tab){
    const titles={
        dashboard:[
            "Центр управления",
            "Сводка состояния базы, готовности игры и быстрые действия."
        ],
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
        ],
        games:[
            "Игры",
            "Архив проведённых игр, рекорды и аналитика."
        ],
        settings:[
            "Настройки",
            "Допуск игроков и управление публичными формами TPV."
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

    setHidden("dashboard-section",tab!=="dashboard");
    setHidden("users-section",tab!=="users");
    setHidden("questions-section",tab!=="questions");
    setHidden("themes-section",tab!=="themes");
    setHidden("quality-section",tab!=="quality");
    setHidden("statistics-section",tab!=="statistics");
    setHidden("transfer-section",tab!=="transfer");
    setHidden("history-section",tab!=="history");
    setHidden("builder-section",tab!=="builder");
    setHidden("applications-section",tab!=="applications");
    setHidden("games-section",tab!=="games");
    setHidden("settings-section",tab!=="settings");

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

    if(tab==="dashboard"){
        loadDashboard();
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

    if(tab==="games"){
        loadGames();
    }
    if(tab==="settings"){
        loadOperationalSettings();
    }
}
function updateFormStatusVisual(inputId, labelId) {

    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);

    if (!input || !label) {
        return;
    }


    const container = label.closest(".operational-status-button");

    if (!container) {
        return;
    }


    if (input.checked) {

        container.classList.remove("status-closed");
        container.classList.add("status-open");

        label.innerHTML = "🟢 Форма открыта";

    } else {

        container.classList.remove("status-open");
        container.classList.add("status-closed");

        label.innerHTML = "🔴 Приём закрыт";

    }
}

function renderOperationalSwitches(){
    const participation=!!e["participation-form-enabled"]?.checked;
    const questions=!!e["question-form-enabled"]?.checked;
    const yandex=!!e["yandex-auth-enabled"]?.checked;
    if(e["participation-form-label"]){
        updateFormStatusVisual("participation-form-enabled","participation-form-label");
    }
    if(e["question-form-label"]){
        updateFormStatusVisual("question-form-enabled","question-form-label");
    }
    if(e["yandex-auth-label"]){
        const label=e["yandex-auth-label"];
        const box=label.closest(".operational-status-button");
        label.textContent=yandex?"🟢 Авторизация включена":"🔴 Авторизация отключена";
        box?.classList.toggle("status-open",yandex);
        box?.classList.toggle("status-closed",!yandex);
    }
}

async function loadOperationalSettings(){
    try{
        const response=await api("/tpv_editor/api/operational-settings");
        const settings=response.settings||{};
        if(e["required-flip-questions"])e["required-flip-questions"].value=settings.required_flip_questions??5;
        if(e["participation-form-enabled"])e["participation-form-enabled"].checked=!!settings.public_participation_form_enabled;
        if(e["question-form-enabled"])e["question-form-enabled"].checked=!!settings.public_question_form_enabled;
        if(e["yandex-auth-enabled"])e["yandex-auth-enabled"].checked=settings.yandex_auth_enabled!==false;
        if(e["operational-settings-state"]){
            e["operational-settings-state"].textContent="Настройки загружены";
            e["operational-settings-state"].className="status status-approved";
        }
        renderOperationalSwitches();
    }catch(error){
        if(e["operational-settings-state"]){
            e["operational-settings-state"].textContent="Ошибка загрузки";
            e["operational-settings-state"].className="status status-rejected";
        }
        toast(error.message,true);
    }
}

async function saveOperationalSettings(event){
    event.preventDefault();
    const required=Number(e["required-flip-questions"]?.value);
    if(!Number.isInteger(required)||required<1||required>100){
        toast("Количество вопросов должно быть от 1 до 100.",true);
        return;
    }
    try{
        const response=await api("/tpv_editor/api/operational-settings",{
            method:"PUT",
            body:{
                required_flip_questions:required,
                public_participation_form_enabled:!!e["participation-form-enabled"]?.checked,
                public_question_form_enabled:!!e["question-form-enabled"]?.checked,
                yandex_auth_enabled:!!e["yandex-auth-enabled"]?.checked
            }
        });
        if(e["operational-settings-state"]){
            e["operational-settings-state"].textContent="Сохранено";
            e["operational-settings-state"].className="status status-approved";
        }
        renderOperationalSwitches();
        toast(response.message||"Настройки сохранены.");
        await Promise.allSettled([loadUsers(),loadThemes(),loadDashboard()]);
    }catch(error){
        toast(error.message,true);
    }
}

function setHidden(id,hidden){
    if(e[id]){
        e[id].hidden=hidden;
    }
}


function applyAppearanceTheme(theme){
    if(!theme?.variables)return;
    Object.entries(theme.variables).forEach(([name,value])=>{
        document.documentElement.style.setProperty(name,String(value));
    });
    s.appearanceTheme=theme;
    if(e["appearance-current-name"]){
        e["appearance-current-name"].textContent=theme.name||"TPV Dark";
    }
    renderAppearanceThemes();
    openAppearanceDesigner(theme);
}

async function loadCurrentAppearanceTheme(){
    try{
        const response=await api("/tpv_editor/api/interface-themes/current");
        applyAppearanceTheme(response.theme);
    }catch(error){
        console.warn("Theme Engine:",error.message);
    }
}

async function loadAppearanceThemes(){
    try{
        const response=await api("/tpv_editor/api/interface-themes");
        const ready=response.table_exists!==false;
        if(e["appearance-missing"])e["appearance-missing"].hidden=ready;
        if(e["appearance-content"])e["appearance-content"].hidden=!ready;
        s.appearanceThemes=response.themes||[];
        if(response.theme)applyAppearanceTheme(response.theme);
        renderAppearanceThemes();
    }catch(error){
        toast(error.message,true);
    }
}

async function createAppearanceEngine(){
    try{
        const response=await api(
            "/tpv_editor/api/interface-themes/create-tables",
            {method:"POST"}
        );
        toast(response.message);
        applyAppearanceTheme(response.theme);
        await loadAppearanceThemes();
    }catch(error){
        toast(error.message,true);
    }
}

function renderAppearanceThemes(){
    if(!e["appearance-theme-grid"])return;
    const current=s.appearanceTheme?.slug;
    e["appearance-theme-grid"].innerHTML=(s.appearanceThemes||[]).map(theme=>{
        const colors=Object.values(theme.variables||{}).slice(0,7);
        return `<article
            class="appearance-theme-card ${theme.slug===current?"is-active":""} ${theme.is_system?"":"is-custom"}"
            data-appearance-theme="${esc(theme.slug)}"
        >
            <div>
                <h4>${esc(theme.name)}</h4>
                <p>${esc(theme.description||"")}</p>
            </div>
            <div class="appearance-palette">
                ${colors.map(color=>`<span style="background:${esc(color)}"></span>`).join("")}
            </div>
            <button class="button ${theme.slug===current?"button-secondary":"button-muted"}" type="button">
                ${theme.slug===current?"Выбрана":"Применить"}
            </button>
        </article>`;
    }).join("");
}

async function selectAppearanceTheme(slug){
    if(!slug||slug===s.appearanceTheme?.slug)return;
    try{
        const response=await api(
            "/tpv_editor/api/interface-themes/select",
            {method:"POST",body:{slug}}
        );
        applyAppearanceTheme(response.theme);
        toast(response.message);
    }catch(error){
        toast(error.message,true);
    }
}

async function resetAppearanceTheme(){
    if(!confirm("Вернуть стандартную тему TPV Dark?"))return;
    try{
        const response=await api(
            "/tpv_editor/api/interface-themes/reset",
            {method:"POST"}
        );
        applyAppearanceTheme(response.theme);
        toast(response.message);
    }catch(error){
        toast(error.message,true);
    }
}


const APPEARANCE_VARIABLES=[
    ["--bg","Основной фон"],
    ["--panel","Фон панелей"],
    ["--line","Границы"],
    ["--text","Основной текст"],
    ["--muted","Вторичный текст"],
    ["--cyan","Главный акцент"],
    ["--green","Успех"],
    ["--red","Ошибка"]
];

function cssColorForPicker(value){
    const text=String(value||"").trim();
    if(/^#[0-9a-f]{6}$/i.test(text))return text;
    if(/^#[0-9a-f]{3}$/i.test(text)){
        return "#"+text.slice(1).split("").map(char=>char+char).join("");
    }
    const canvas=document.createElement("canvas");
    const context=canvas.getContext("2d");
    context.fillStyle="#000000";
    context.fillStyle=text;
    return /^#[0-9a-f]{6}$/i.test(context.fillStyle)
        ?context.fillStyle
        :"#000000";
}

function setAppearanceDesignerStatus(text,state=""){
    if(!e["appearance-designer-status"])return;
    e["appearance-designer-status"].textContent=text;
    e["appearance-designer-status"].className=
        `appearance-designer-status ${state?`is-${state}`:""}`;
}

function openAppearanceDesigner(theme){
    if(!e["appearance-designer"]||!theme)return;

    e["appearance-designer"].hidden=false;
    e["appearance-theme-name"].value=theme.name||"";
    e["appearance-theme-slug"].value=theme.slug||"";
    e["appearance-theme-description"].value=theme.description||"";

    s.appearanceDraft=JSON.parse(JSON.stringify(theme));
    s.appearanceSavedVariables={...(theme.variables||{})};
    s.appearancePreviewDirty=false;

    e["appearance-color-fields"].innerHTML=APPEARANCE_VARIABLES.map(
        ([variable,label])=>{
            const value=theme.variables?.[variable]||"";
            return `<article class="appearance-color-field">
                <label>
                    <span>${esc(label)} · ${esc(variable)}</span>
                    <input
                        type="text"
                        data-theme-variable="${esc(variable)}"
                        value="${esc(value)}"
                    >
                </label>
                <input
                    type="color"
                    data-theme-color="${esc(variable)}"
                    value="${cssColorForPicker(value)}"
                    title="${esc(label)}"
                >
            </article>`;
        }
    ).join("");

    const editable=!theme.is_system;
    [
        "appearance-theme-name",
        "appearance-theme-slug",
        "appearance-theme-description"
    ].forEach(id=>{
        if(e[id])e[id].disabled=!editable;
    });

    e["appearance-save-theme"].hidden=!editable;
    e["appearance-delete-theme"].hidden=!editable;
    e["appearance-export-theme"].hidden=false;
    e["appearance-cancel-preview"].hidden=false;

    setAppearanceDesignerStatus(
        editable?"Пользовательская тема":"Системная тема — только просмотр",
        editable?"saved":""
    );
}

function markAppearanceDraftDirty(){
    if(!s.appearanceDraft||s.appearanceDraft.is_system)return;
    s.appearancePreviewDirty=true;
    setAppearanceDesignerStatus("Изменения не сохранены","dirty");
}

function handleAppearanceDesignerInput(event){
    const textInput=event.target.closest("[data-theme-variable]");
    const colorInput=event.target.closest("[data-theme-color]");
    const variable=textInput?.dataset.themeVariable||colorInput?.dataset.themeColor;
    if(!variable||!s.appearanceDraft)return;

    let value;
    if(colorInput){
        value=colorInput.value;
        const related=e["appearance-color-fields"].querySelector(
            `[data-theme-variable="${CSS.escape(variable)}"]`
        );
        if(related)related.value=value;
    }else{
        value=textInput.value.trim();
        const related=e["appearance-color-fields"].querySelector(
            `[data-theme-color="${CSS.escape(variable)}"]`
        );
        if(related)related.value=cssColorForPicker(value);
    }

    s.appearanceDraft.variables[variable]=value;
    document.documentElement.style.setProperty(variable,value);
    markAppearanceDraftDirty();
}

async function copyAppearanceTheme(){
    const source=s.appearanceTheme;
    if(!source)return;

    const name=prompt(
        "Название пользовательской темы:",
        `${source.name} — копия`
    );
    if(!name?.trim())return;

    try{
        const response=await api(
            "/tpv_editor/api/interface-themes/copy",
            {
                method:"POST",
                body:{
                    source_slug:source.slug,
                    name:name.trim()
                }
            }
        );
        applyAppearanceTheme(response.theme);
        toast(response.message);
        await loadAppearanceThemes();
    }catch(error){
        toast(error.message,true);
    }
}

function appearanceDesignerPayload(){
    return {
        id:s.appearanceDraft?.id,
        name:e["appearance-theme-name"].value.trim(),
        slug:e["appearance-theme-slug"].value.trim(),
        description:e["appearance-theme-description"].value.trim(),
        variables:{...(s.appearanceDraft?.variables||{})}
    };
}

async function saveAppearanceTheme(){
    if(!s.appearanceDraft||s.appearanceDraft.is_system){
        toast("Сначала создайте копию системной темы.",true);
        return;
    }

    try{
        const response=await api(
            "/tpv_editor/api/interface-themes/save",
            {
                method:"POST",
                body:appearanceDesignerPayload()
            }
        );
        applyAppearanceTheme(response.theme);
        s.appearancePreviewDirty=false;
        setAppearanceDesignerStatus("Тема сохранена","saved");
        toast(response.message);
        await loadAppearanceThemes();
    }catch(error){
        toast(error.message,true);
    }
}

function cancelAppearancePreview(){
    if(!s.appearanceSavedVariables)return;
    Object.entries(s.appearanceSavedVariables).forEach(([name,value])=>{
        document.documentElement.style.setProperty(name,String(value));
    });
    if(s.appearanceTheme)openAppearanceDesigner(s.appearanceTheme);
    toast("Предпросмотр отменён.");
}

function downloadAppearanceJson(data,filename){
    const blob=new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json;charset=utf-8"}
    );
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

async function exportAppearanceTheme(){
    const theme=s.appearanceTheme;
    if(!theme?.id){
        toast("Сначала создайте Theme Engine.",true);
        return;
    }
    try{
        const response=await api(
            `/tpv_editor/api/interface-themes/${theme.id}/export`
        );
        downloadAppearanceJson(
            response.document,
            `tpv_editor_theme_${theme.slug||theme.id}.json`
        );
        toast("Тема экспортирована.");
    }catch(error){
        toast(error.message,true);
    }
}

async function importAppearanceTheme(event){
    const input=event.currentTarget;
    const file=input.files?.[0];
    input.value="";
    if(!file)return;

    if(file.size>1024*1024){
        toast("Файл темы не должен превышать 1 МБ.",true);
        return;
    }

    try{
        const document=JSON.parse(await file.text());
        const response=await api(
            "/tpv_editor/api/interface-themes/import",
            {method:"POST",body:document}
        );
        applyAppearanceTheme(response.theme);
        toast(response.message);
        await loadAppearanceThemes();
    }catch(error){
        toast(
            error instanceof SyntaxError
                ?"Файл содержит некорректный JSON."
                :error.message,
            true
        );
    }
}

async function deleteAppearanceTheme(){
    const theme=s.appearanceTheme;
    if(!theme||theme.is_system)return;
    if(!confirm(`Удалить тему «${theme.name}»?`))return;

    try{
        const response=await api(
            `/tpv_editor/api/interface-themes/${theme.id}`,
            {method:"DELETE"}
        );
        applyAppearanceTheme(response.theme);
        toast(response.message);
        await loadAppearanceThemes();
    }catch(error){
        toast(error.message,true);
    }
}

function renderUsers(){const q=e["search-input"].value.trim().toLowerCase(),a=e["approve-filter"].value,[f,d]=e["sort-select"].value.split("-");let list=s.users.filter(u=>(!q||(u.username||"").toLowerCase().includes(q)||(u.flip_display||"").toLowerCase().includes(q))&&(a==="all"||u.approve===a));list.sort(sorter(f,d,x=>f==="flip"?x.flip_display:x[f]));e["users-table-body"].innerHTML=list.map(u=>`<tr><td>${u.id}</td><td><strong>${esc(u.username)}</strong></td><td class="money-cell">${money(u.money)}</td><td>${esc(u.flip_display||"Не выбрана")}</td><td>${u.flip_col||0}</td><td><span class="status ${u.approve==="true"?"status-approved":"status-rejected"}">${esc(u.approve_label)}</span></td><td><button class="row-edit" data-edit="${u.id}">Изменить</button></td></tr>`).join("");e["empty-state"].hidden=!!list.length;e["stat-total"].textContent=s.users.length;e["stat-approved"].textContent=s.users.filter(u=>u.approve==="true").length;e["stat-without-theme"].textContent=s.users.filter(u=>!u.flip_display).length;e["stat-money"].textContent=money(s.users.reduce((n,u)=>n+(+u.money||0),0))}
function renderQuestions(){const query=e["question-search"].value.trim().toLowerCase(),theme=e["question-theme-filter"].value,author=e["question-author-filter"].value,show=e["question-show-filter"].value,[f,d]=e["question-sort"].value.split("-");let list=s.questions.filter(q=>{const hay=[q.task,q.answer,q.comment,q.author,q.flip_display].join(" ").toLowerCase();const mt=theme==="all"||(theme==="general"?q.is_general:q.flip_display===theme);return(!query||hay.includes(query))&&mt&&(author==="all"||q.author===author)&&(show==="all"||q.show===show)});list.sort(sorter(f,d,x=>f==="flip"?x.flip_display:x[f]));e["questions-table-body"].innerHTML=list.map(q=>`<tr><td>${q.id}</td><td><div class="question-text">${esc(q.task)}</div>${q.comment?`<small>${esc(q.comment)}</small>`:""}</td><td><div class="answer-text">${esc(q.answer)}</div></td><td>${esc(q.author||"—")}</td><td><span class="tag ${q.is_general?"tag-general":"tag-theme"}">${esc(q.flip_display)}</span></td><td><span class="status ${q.show==="true"?"status-rejected":"status-unused"}">${q.show==="true"?"Использован":"Не использован"}</span></td><td><button class="row-edit" data-edit-question="${q.id}">Изменить</button></td></tr>`).join("");e["questions-empty"].hidden=!!list.length;if(e["question-filter-count"])e["question-filter-count"].textContent=list.length;if(e["question-filter-total"])e["question-filter-total"].textContent=`из ${s.questions.length}`;e["q-stat-total"].textContent=s.questions.length;e["q-stat-general"].textContent=s.questions.filter(q=>q.is_general).length;e["q-stat-themed"].textContent=s.questions.filter(q=>!q.is_general).length;e["q-stat-shown"].textContent=s.questions.filter(q=>q.show==="true").length;e["q-stat-themes"].textContent=new Set(s.questions.filter(q=>!q.is_general).map(q=>q.flip_display.toLowerCase())).size}
function renderThemes(){const query=e["theme-search"].value.trim().toLowerCase(),filter=e["theme-state-filter"].value,[field,dir]=e["theme-sort"].value.split("-");let list=s.themeRows.filter(t=>{const search=!query||t.name.toLowerCase().includes(query)||(t.variants||[]).join(" ").toLowerCase().includes(query);const state=filter==="all"||(filter==="ready"&&t.ready)||(filter==="shortage"&&!t.ready&&t.question_count>0)||(filter==="unused"&&t.user_count===0)||(filter==="empty"&&t.question_count===0);return search&&state});list.sort(sorter(field,dir,x=>field==="questions"?x.question_count:field==="users"?x.user_count:x.name));e["themes-table-body"].innerHTML=list.map(t=>{const status=t.question_count===0?["status-neutral","Нет вопросов"]:t.ready?["status-approved","Готова"]:["status-warning",`Не хватает ${Math.max(0,t.required_questions-t.question_count)}`];return `<tr><td><span class="theme-name">${esc(t.name)}</span>${t.variants?.length>1?`<span class="theme-variants">Варианты: ${esc(t.variants.join(", "))}</span>`:""}</td><td>${t.question_count}</td><td>${t.shown_count}</td><td>${t.user_count}</td><td>${t.approved_count}</td><td><span class="status ${status[0]}">${status[1]}</span></td><td><button class="row-edit" data-edit-theme="${esc(t.name)}">Управление</button></td></tr>`}).join("");e["themes-empty"].hidden=!!list.length;e["t-stat-total"].textContent=s.themeRows.length;e["t-stat-questions"].textContent=s.themeRows.reduce((n,t)=>n+t.question_count,0);e["t-stat-users"].textContent=s.themeRows.reduce((n,t)=>n+t.user_count,0);e["t-stat-ready"].textContent=s.themeRows.filter(t=>t.ready).length;e["t-stat-empty"].textContent=s.themeRows.filter(t=>t.question_count===0).length}
function openTheme(t){s.currentTheme=t;e["theme-dialog-title"].textContent=t.name;e["theme-original-name"].value=t.name;e["theme-new-name"].value=t.name;e["theme-dialog-questions"].textContent=t.question_count;e["theme-dialog-users"].textContent=t.user_count;e["theme-dialog-approved"].textContent=t.approved_count;e["theme-dialog-shown"].textContent=t.shown_count;e["theme-delete-target"].innerHTML='<option value="false">Общие вопросы / тема не выбрана</option>'+s.themeRows.filter(x=>x.name!==t.name).map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join("");e["theme-dialog"].showModal()}
function closeTheme(){if(e["theme-dialog"].open)e["theme-dialog"].close();s.currentTheme=null}
async function saveTheme(x){x.preventDefault();if(!s.currentTheme)return;const name=e["theme-new-name"].value.trim();if(!name){toast("Введите новое название темы.",true);return}const exists=s.themeRows.some(t=>t.name.toLowerCase()===name.toLowerCase()&&t.name.toLowerCase()!==s.currentTheme.name.toLowerCase());const text=exists?`Тема «${name}» уже существует. Объединить с ней «${s.currentTheme.name}»?`:`Переименовать «${s.currentTheme.name}» в «${name}»?`;if(!confirm(text))return;try{const r=await api("/tpv_editor/api/themes/rename",{method:"POST",body:{old_name:s.currentTheme.name,new_name:name}});toast(r.message);closeTheme();await loadAll()}catch(z){toast(z.message,true)}}
async function deleteTheme(){if(!s.currentTheme)return;const target=e["theme-delete-target"].value,targetLabel=target==="false"?"общие вопросы / без темы":`тему «${target}»`;if(!confirm(`Удалить тему «${s.currentTheme.name}» и перенести связанные записи в ${targetLabel}?`))return;try{const r=await api("/tpv_editor/api/themes/delete",{method:"POST",body:{name:s.currentTheme.name,target}});toast(r.message);closeTheme();await loadAll()}catch(z){toast(z.message,true)}}





async function loadDashboard(){
    try{
        const data=await api("/tpv_editor/api/dashboard");
        s.dashboard=data;

        setText("d-users",data.users.total||0);
        setText("d-users-note",`${data.users.approved||0} допущено · ${data.users.without_theme||0} без темы`);
        setText("d-general",data.questions.general_total||0);
        setText("d-general-note",`${data.questions.general_available||0} доступно · ${data.questions.general_used||0} использовано`);
        setText("d-themes",data.themes.total||0);
        setText("d-themes-note",`${data.themes.ready||0} готовы · ${data.themes.shortage||0} требуют внимания`);
        setText("d-applications",data.applications.pending||0);
        setText("d-applications-note",`${data.applications.approved||0} утверждено · ${data.applications.rejected||0} отклонено`);
        setText("d-builder",data.builder.active_name||"Вся база");
        setText("d-builder-note",data.builder.active_name?`${data.builder.question_count||0} вопросов`:"Активный набор не выбран");
        setText("d-history",data.history.total||0);
        setText("d-history-note",`${data.history.today||0} сегодня`);

        setText("maintenance-history-count",`${data.history.total||0} записей`);
        setText("maintenance-applications-count",`${data.applications.total||0} записей`);

        setText("dashboard-readiness-score",`${data.readiness.score||0}%`);
        setText("dashboard-health-score",`${data.health.score||0}%`);
        setText("dashboard-health-text",`${data.readiness.label||""}. ${data.health.label||""}`);
        setText("dashboard-last-check",`Последняя проверка: ${data.generated_at_label||"—"}`);
        setText("dashboard-response-time",`Ответ сервера: ${data.performance.response_ms||0} мс`);

        setText("d-reserve-general",`${data.reserve.general_games||0} игр`);
        setText("d-reserve-general-note",`${data.reserve.general_available||0} доступно`);
        setText("d-reserve-theme-average",`${data.reserve.theme_average_games||0} игр`);
        setText("d-reserve-theme-min",`${data.reserve.theme_min_games||0} игр`);

        setText("d-resource-games",`${data.resource.games||0} игр`);
        setText("d-resource-limit",data.resource.limiting_label||"—");
        setText("d-resource-general-rate",`${data.reserve.general_per_game||0} вопросов`);
        setText("d-resource-theme",data.resource.limiting_theme||"—");

        setText("d-builder-large",data.builder.active_name||"Вся база");
        setText("d-builder-count",data.builder.active_name?(data.builder.question_count||0):data.questions.total||0);
        setText("d-builder-updated",data.builder.updated_at_label||"—");
        setText("d-builder-mode",data.builder.active_name?"Активный набор":"Полная база");

        setText("d-database-size",data.database.size_label||"—");
        setText("d-database-integrity",data.database.integrity_label||"—");
        setText("d-last-backup",data.database.last_backup_label||"Нет");
        setText("d-database-name",data.database.filename||"—");

        setText("d-growth-today",`+${data.growth.today||0}`);
        setText("d-growth-week",`+${data.growth.week||0}`);
        setText("d-growth-month",`+${data.growth.month||0}`);

        setText("status-db",`SQLite: ${data.database.integrity_label||"—"}`);
        setText("status-api","API: OK");
        setText("status-builder",`Источник вопросов: ${data.builder.active_name||"вся база"}`);
        setText("status-checked",`Проверено: ${data.generated_at_label||"—"}`);

        renderDashboardAlerts(data.alerts||[]);
        renderDashboardEvents(data.events||[]);
        renderDashboardTopAuthors(data.top_authors||[]);
        renderDashboardReadiness(data.readiness.components||[]);
    }catch(error){
        toast(error.message,true);
        setText("dashboard-health-text","Не удалось загрузить сводку.");
    }
}

function renderDashboardAlerts(alerts){
    if(e["dashboard-alerts"]){
        e["dashboard-alerts"].innerHTML=alerts.map(item=>`
            <div class="dashboard-alert ${item.level==="critical"?"is-critical":item.level==="info"?"is-info":""}">
                <div>
                    <strong>${esc(item.title)}</strong>
                    <small>${esc(item.details||"")}</small>
                </div>
                <button class="row-edit" type="button" data-alert-tab="${esc(item.tab||"quality")}">Открыть</button>
            </div>
        `).join("");
        e["dashboard-alerts"].querySelectorAll("[data-alert-tab]").forEach(button=>{
            button.addEventListener("click",()=>switchTab(button.dataset.alertTab));
        });
    }
    if(e["dashboard-alerts-empty"])e["dashboard-alerts-empty"].hidden=alerts.length>0;
}

function renderDashboardEvents(items){
    if(e["dashboard-events"]){
        e["dashboard-events"].innerHTML=items.map(item=>`
            <div class="dashboard-compact-item">
                <div><strong>${esc(item.title)}</strong><small>${esc(item.created_at_label||"")}</small></div>
                <b>${esc(item.action_label||"")}</b>
            </div>
        `).join("");
    }
    if(e["dashboard-events-empty"])e["dashboard-events-empty"].hidden=items.length>0;
}

function renderDashboardTopAuthors(items){
    if(e["dashboard-top-authors"]){
        e["dashboard-top-authors"].innerHTML=items.map((item,index)=>`
            <div class="dashboard-compact-item">
                <div><strong>${index+1}. ${esc(item.author)}</strong><small>Автор вопросов</small></div>
                <b>${item.count}</b>
            </div>
        `).join("");
    }
    if(e["dashboard-top-authors-empty"])e["dashboard-top-authors-empty"].hidden=items.length>0;
}

function renderDashboardReadiness(items){
    if(!e["dashboard-readiness-components"])return;
    e["dashboard-readiness-components"].innerHTML=items.map(item=>`
        <article class="readiness-component">
            <header><span>${esc(item.label)}</span><strong>${item.score}%</strong></header>
            <div class="readiness-track"><span style="width:${Math.max(0,Math.min(100,item.score))}%"></span></div>
        </article>
    `).join("");
}

function showMaintenanceReport(lines){
    const node=e["maintenance-report"];
    if(!node)return;
    node.textContent=Array.isArray(lines)?lines.join("\n"):String(lines||"");
    node.hidden=false;
}

async function createDashboardBackup(){
    if(!confirm("Создать резервную копию текущей базы SQLite?"))return;
    try{
        const response=await api("/tpv_editor/api/maintenance/backup",{method:"POST"});
        toast(response.message);
        showMaintenanceReport([`✔ ${response.message}`,`Файл: ${response.filename||"—"}`]);
        await loadDashboard();
    }catch(error){toast(error.message,true)}
}

async function recalculateDashboardApprovals(){
    if(!confirm("Пересчитать количество вопросов и допуски всех пользователей?"))return;
    try{
        const response=await api("/tpv_editor/api/recalculate",{method:"POST"});
        toast(response.message||"Допуски пересчитаны.");
        await loadAll();
    }catch(error){toast(error.message,true)}
}

async function runMaintenanceAction(action){
    const labels={vacuum:"Выполнить VACUUM SQLite?",analyze:"Выполнить ANALYZE SQLite?",integrity:"Проверить целостность SQLite?"};
    if(!confirm(labels[action]||"Выполнить операцию?"))return;
    try{
        const response=await api(`/tpv_editor/api/maintenance/${action}`,{method:"POST"});
        toast(response.message);
        showMaintenanceReport(response.report||[response.message]);
        await loadDashboard();
    }catch(error){toast(error.message,true)}
}

async function runFullMaintenance(){
    if(!confirm("Выполнить полное обслуживание: backup, очистка обработанных заявок, очистка истории старше года, ANALYZE, VACUUM и проверка целостности?"))return;
    if(!confirm("Подтвердите полное обслуживание TPV ещё раз."))return;
    try{
        const response=await api("/tpv_editor/api/maintenance/full",{method:"POST"});
        toast(response.message);
        showMaintenanceReport(response.report||[response.message]);
        await loadAll();
    }catch(error){toast(error.message,true)}
}

async function clearHistoryFromDashboard(){
    const mode=e["maintenance-history-mode"]?.value||"older30";
    const labels={older30:"историю старше 30 дней",older365:"историю старше года",all:"ВСЮ историю изменений"};
    if(!confirm(`Удалить ${labels[mode]}? Откат удалённых записей станет невозможен.`))return;
    if(mode==="all"&&!confirm("Подтвердите полную очистку истории ещё раз."))return;
    try{const response=await api("/tpv_editor/api/history/clear",{method:"POST",body:{mode}});toast(response.message);await loadDashboard();if(s.tab==="history")await loadHistory()}catch(error){toast(error.message,true)}
}
async function clearApplicationsFromDashboard(){
    const mode=e["maintenance-applications-mode"]?.value||"processed";
    const labels={processed:"все обработанные заявки",approved:"все утверждённые заявки",rejected:"все отклонённые заявки",all:"ВСЕ заявки, включая ожидающие"};
    if(!confirm(`Удалить ${labels[mode]}?`))return;
    if(mode==="all"&&!confirm("Внимание: ожидающие заявки также будут удалены. Подтвердите ещё раз."))return;
    try{const response=await api("/tpv_editor/api/question-applications/clear",{method:"POST",body:{mode}});toast(response.message);await loadDashboard();if(s.tab==="applications")await loadApplications()}catch(error){toast(error.message,true)}
}

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
        throw new Error(data.error||data.message||`HTTP ${response.status}`);
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
function money(v){return Number(v||0).toLocaleString("ru-RU")}function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function toast(m,err=false){const d=document.createElement("div");d.className=`toast${err?" toast-error":""}`;d.textContent=m;e["toast-region"].append(d);setTimeout(()=>d.remove(),4000)}
async function loadGames(){
 try{const data=await api("/tpv_editor/api/games");const exists=data.table_exists!==false;if(e["games-missing-table"])e["games-missing-table"].hidden=exists;if(e["games-content"])e["games-content"].hidden=!exists;s.games=data.items||[];s.gameStats=data.stats||{};fillGameFilters(data.seasons||[]);renderGames();renderGameViews(data)}catch(error){toast(error.message,true)}
}
async function createGamesTables(){if(!confirm("Создать таблицы архива игр?"))return;try{const r=await api("/tpv_editor/api/games/create-tables",{method:"POST"});toast(r.message);await loadGames()}catch(error){toast(error.message,true)}}
function fillGameFilters(seasons){const current=e["games-season-filter"]?.value||"all";if(e["games-season-filter"]){e["games-season-filter"].innerHTML='<option value="all">Все сезоны</option>'+seasons.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");if([...e["games-season-filter"].options].some(o=>o.value===current))e["games-season-filter"].value=current}}
function renderGames(){
    const q=(e["games-search"]?.value||"").trim().toLowerCase();
    const season=e["games-season-filter"]?.value||"all";
    const status=e["games-status-filter"]?.value||"all";
    const sort=e["games-sort"]?.value||"new-desc";

    let list=s.games.filter(g=>
        (!q||[g.title,g.winner,g.players_text].join(" ").toLowerCase().includes(q))&&
        (season==="all"||g.season===season)&&
        (status==="all"||g.status===status)
    );

    list.sort((a,b)=>
        sort==="new-asc"?a.id-b.id:
        sort==="prize-desc"?(b.winner_money||b.prize||0)-(a.winner_money||a.prize||0):
        b.id-a.id
    );

    if(e["games-welcome"])e["games-welcome"].hidden=s.games.length>0;
    if(e["games-table-body"])e["games-table-body"].innerHTML=list.map(g=>`
        <tr>
            <td>${g.id}</td>
            <td>${esc(g.started_at_label)}</td>
            <td>${esc(g.season||"—")}</td>
            <td><strong>${esc(g.title)}</strong><small>Builder ID: ${g.builder_id??"—"}</small></td>
            <td>${g.players_count??g.player_count??0}</td>
            <td>${esc(g.winner||"—")}</td>
            <td>${Number(g.winner_money??g.prize??0).toLocaleString("ru-RU")}</td>
            <td>${esc(g.duration_label||"—")}</td>
            <td><button class="row-edit" type="button" data-open-game="${g.id}">Открыть</button></td>
        </tr>
    `).join("");

    if(e["games-empty"])e["games-empty"].hidden=list.length>0||s.games.length===0;
}

async function loadRecords(){
    try{
        const response=await api("/tpv_editor/api/games/records");
        s.records=response.records||null;
        renderRecords();
    }catch(error){
        toast(error.message,true);
    }
}

function recordDuration(seconds){
    const value=Number(seconds||0);
    if(!value)return "—";
    const hours=Math.floor(value/3600);
    const minutes=Math.floor((value%3600)/60);
    return hours?`${hours}:${String(minutes).padStart(2,"0")}`:`${minutes} мин`;
}

function renderRecords(){
    const data=s.records;
    if(!data)return;

    const project=data.project||{};
    const projectCards=[
        ["Завершённых игр",project.games_completed||0],
        ["Уникальных игроков",project.players_unique||0],
        ["Вопросов задано",project.questions_total||0],
        ["Событий Replay",project.events_total||0],
        ["Правильных ответов",project.correct_total||0],
        ["Ошибок",project.wrong_total||0],
        ["Общий выигрыш",money(project.prize_total||0)],
        ["Средняя длительность",project.average_duration_label||"—"],
        ["Средняя точность",`${project.average_accuracy||0}%`],
        ["Средний выигрыш",money(project.average_prize||0)],
        ["Авторов",project.authors_unique||0],
        ["Тем",project.themes_unique||0]
    ];
    e["records-project-grid"].innerHTML=projectCards.map(([label,value])=>`
        <article class="records-project-card">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
        </article>
    `).join("");

    const labels={
        longest:["Самая длинная игра",v=>recordDuration(v)],
        shortest:["Самая короткая игра",v=>recordDuration(v)],
        largest_prize:["Самый большой выигрыш",v=>money(v)],
        smallest_prize:["Минимальный выигрыш победителя",v=>money(v)],
        highest_accuracy:["Максимальная точность",v=>`${v||0}%`],
        lowest_accuracy:["Минимальная точность",v=>`${v||0}%`],
        most_players:["Максимум игроков",v=>String(v||0)],
        most_questions:["Максимум вопросов",v=>String(v||0)],
        most_theme_questions:["Максимум тем замены",v=>String(v||0)],
        most_correct:["Максимум правильных",v=>String(v||0)],
        most_wrong:["Максимум ошибок",v=>String(v||0)]
    };
    const gameRecords=Object.entries(data.games||{})
        .filter(([,item])=>item&&item.game_id);
    e["records-games-grid"].innerHTML=gameRecords.map(([key,item])=>{
        const [label,formatter]=labels[key]||[key,v=>v];
        return `<article class="record-game-card" data-record-game="${item.game_id}">
            <small>${esc(label)}</small>
            <strong>${esc(formatter(item.value))}</strong>
            <span>${esc(item.title||`Игра #${item.game_id}`)}</span>
        </article>`;
    }).join("");
    e["records-games-empty"].hidden=gameRecords.length>0;
    e["records-games-grid"].querySelectorAll("[data-record-game]").forEach(card=>{
        card.addEventListener("click",()=>openGame(Number(card.dataset.recordGame)));
    });

    const players=data.players||[];
    e["records-players-body"].innerHTML=players.map((item,index)=>`
        <tr>
            <td>${index+1}</td>
            <td><strong>${esc(item.name)}</strong></td>
            <td>${item.games}</td>
            <td>${item.wins}</td>
            <td>${item.win_percent}%</td>
            <td>${money(item.total_money)}</td>
            <td>${money(item.average_money)}</td>
            <td>${money(item.best_money)}</td>
            <td>${item.best_win_streak}</td>
        </tr>
    `).join("");
    e["records-players-empty"].hidden=players.length>0;

    const authors=data.authors||[];
    e["records-authors-list"].innerHTML=authors.slice(0,20).map((item,index)=>`
        <article class="records-list-item">
            <div>
                <strong>${index+1}. ${esc(item.name)}</strong>
                <small>${item.used} вопросов · ${item.correct} верно · ${item.wrong} ошибок</small>
            </div>
            <div class="records-list-value">${item.accuracy}%</div>
        </article>
    `).join("");
    e["records-authors-empty"].hidden=authors.length>0;

    const themes=data.themes||[];
    e["records-themes-list"].innerHTML=themes.slice(0,20).map((item,index)=>`
        <article class="records-list-item">
            <div>
                <strong>${index+1}. ${esc(item.name)}</strong>
                <small>${item.used} использований · сложность ${item.difficulty}%</small>
            </div>
            <div class="records-list-value">${item.accuracy}%</div>
        </article>
    `).join("");
    e["records-themes-empty"].hidden=themes.length>0;

    const icons={
        first_game:"🎯",ten_games:"🎮",hundred_games:"🏆",
        thousand_questions:"❓",first_million:"💰",
        hundred_players:"👥",hundred_themes:"🎭",hundred_replays:"🎬"
    };
    e["records-achievements-grid"].innerHTML=(data.achievements||[]).map(item=>`
        <article class="record-achievement ${item.unlocked?"is-unlocked":""}">
            <div class="record-achievement-icon">${icons[item.code]||"⭐"}</div>
            <strong>${esc(item.title)}</strong>
            <small>${esc(item.progress||"")}</small>
        </article>
    `).join("");
}

function renderGameViews(data){
    const st=data.stats||{};
    setText("g-stat-total",st.total||0);
    setText("g-stat-players",st.average_players||0);
    setText("g-stat-general",st.average_general||0);
    setText("g-stat-duration",st.average_duration_label||"—");
    renderGamesAnalytics(data.analytics||{});

    if(s.gamesView==="records"&&!s.records)loadRecords();
}

function switchGamesAnalyticsTab(tab){
    const valid=["games","players","questions","themes","authors"];
    if(!valid.includes(tab))tab="games";
    document.querySelectorAll("[data-analytics-tab]").forEach(button=>{
        button.classList.toggle("is-active",button.dataset.analyticsTab===tab);
    });
    valid.forEach(name=>setHidden(`games-analytics-${name}`,name!==tab));
}

function analyticsPercent(value){
    return `<span class="games-analytics-percent">${Number(value||0)}%</span>`;
}

function renderGamesAnalytics(analytics){
    const summary=analytics.summary||{};
    const hasData=analytics.has_data===true;
    if(e["games-analytics-empty"])e["games-analytics-empty"].hidden=hasData;
    if(e["games-analytics-content"])e["games-analytics-content"].hidden=!hasData;

    setText("ga-completed",summary.completed_games||0);
    setText("ga-unique-players",summary.unique_players||0);
    setText("ga-correct-percent",`${summary.correct_percent||0}%`);
    setText("ga-duration",summary.average_duration_label||"—");
    setText("ga-average-questions",summary.average_questions||0);
    setText("ga-average-prize",money(summary.average_prize||0));
    setText("ga-all-games",summary.all_games||0);
    setText("ga-status-completed",summary.completed_games||0);
    setText("ga-status-draft",summary.draft_games||0);
    setText("ga-status-cancelled",summary.cancelled_games||0);
    setText("ga-average-players",summary.average_players||0);
    setText("ga-average-general",summary.average_general||0);
    setText("ga-average-themes",summary.average_themes||0);
    setText("ga-total-questions",summary.total_questions||0);
    setText("ga-total-correct",summary.total_correct||0);
    setText("ga-total-wrong",summary.total_wrong||0);

    const games=analytics.games||[];
    if(e["ga-games-body"])e["ga-games-body"].innerHTML=games.map(item=>`
        <tr>
            <td><strong>${esc(item.title)}</strong><small>#${item.id}</small></td>
            <td>${esc(item.date)}</td>
            <td>${item.players||0}</td>
            <td>${item.questions||0}</td>
            <td>${analyticsPercent(item.correct_percent)}</td>
            <td>${money(item.prize||0)}</td>
            <td>${esc(item.duration_label||"—")}</td>
        </tr>
    `).join("");

    const players=analytics.players||[];
    if(e["ga-players-body"])e["ga-players-body"].innerHTML=players.map(item=>`
        <tr>
            <td><strong>${esc(item.name)}</strong></td>
            <td>${item.games||0}</td>
            <td>${item.wins||0}</td>
            <td>${analyticsPercent(item.win_percent)}</td>
            <td>${money(item.total||0)}</td>
            <td>${money(item.average||0)}</td>
            <td>${money(item.best||0)}</td>
            <td>${analyticsPercent(item.correct_percent)}</td>
        </tr>
    `).join("");
    if(e["ga-players-empty"])e["ga-players-empty"].hidden=players.length>0;

    const questions=analytics.questions||[];
    if(e["ga-questions-body"])e["ga-questions-body"].innerHTML=questions.map(item=>`
        <tr>
            <td>${item.question_id??"—"}</td>
            <td>${item.type==="theme"?"Тема замены":"Общий"}</td>
            <td>${esc(item.theme||"—")}</td>
            <td>${esc(item.author||"—")}</td>
            <td>${item.used||0}</td>
            <td>${item.correct||0}</td>
            <td>${item.wrong||0}</td>
            <td>${analyticsPercent(item.correct_percent)}</td>
            <td>${esc(item.last_used_label||"—")}</td>
        </tr>
    `).join("");
    if(e["ga-questions-empty"])e["ga-questions-empty"].hidden=questions.length>0;

    const themes=analytics.themes||[];
    if(e["ga-themes-grid"])e["ga-themes-grid"].innerHTML=themes.map(item=>`
        <article class="games-analytics-card">
            <h3>${esc(item.name)}</h3>
            <dl>
                <div><dt>Игр</dt><dd>${item.games||0}</dd></div>
                <div><dt>Использовано</dt><dd>${item.used||0}</dd></div>
                <div><dt>Правильных</dt><dd>${item.correct||0}</dd></div>
                <div><dt>Ошибок</dt><dd>${item.wrong||0}</dd></div>
                <div><dt>Точность</dt><dd>${item.correct_percent||0}%</dd></div>
            </dl>
        </article>
    `).join("");
    if(e["ga-themes-empty"])e["ga-themes-empty"].hidden=themes.length>0;

    const authors=analytics.authors||[];
    if(e["ga-authors-body"])e["ga-authors-body"].innerHTML=authors.map(item=>`
        <tr>
            <td><strong>${esc(item.name)}</strong></td>
            <td>${item.games||0}</td>
            <td>${item.used||0}</td>
            <td>${item.correct||0}</td>
            <td>${item.wrong||0}</td>
            <td>${analyticsPercent(item.correct_percent)}</td>
        </tr>
    `).join("");
    if(e["ga-authors-empty"])e["ga-authors-empty"].hidden=authors.length>0;

    switchGamesAnalyticsTab("games");
}

function renderCompact(id,items,mapper){if(!e[id])return;e[id].innerHTML=items.map(x=>{const [a,b]=mapper(x);return `<div class="dashboard-compact-item"><div><strong>${esc(a)}</strong><small>${esc(b)}</small></div></div>`}).join("")}
function switchGamesView(view){s.gamesView=view;document.querySelectorAll("[data-games-view]").forEach(b=>b.classList.toggle("is-active",b.dataset.gamesView===view));["archive","records","analytics"].forEach(v=>setHidden(`games-${v}-view`,v!==view))}
function parsePipeLines(value,keys){return String(value||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).map(line=>{const parts=line.split("|").map(v=>v.trim()),obj={};keys.forEach((k,i)=>obj[k]=parts[i]||"");return obj})}
function gamePayload(){
    return{
        title:e["game-title"].value.trim(),
        season:e["game-season"].value.trim(),
        started_at:e["game-started-at"].value,
        ended_at:e["game-ended-at"].value,
        status:e["game-status"].value,
        winner:e["game-winner"].value.trim(),
        winner_money:Number(e["game-prize"].value||0),
        general_questions:Number(e["game-general-count"].value||0),
        theme_questions:Number(e["game-themed-count"].value||0),
        correct_answers:Number(e["game-correct-count"].value||0),
        wrong_answers:Number(e["game-wrong-count"].value||0),
        ended_normally:e["game-status"].value==="completed",
        editor_version:"10.2.1",
        players:parsePipeLines(
            e["game-players"].value,
            ["username","money","correct_answers","wrong_answers","theme"]
        ),
        themes:parsePipeLines(
            e["game-themes"].value,
            ["theme","used_count","correct_count","wrong_count"]
        ),
        questions:String(e["game-question-ids"].value||"")
            .split(/[,\s]+/)
            .filter(v=>/^\d+$/.test(v))
            .map(v=>({question_id:Number(v),question_type:"general"})),
        events:parsePipeLines(
            e["game-events"].value,
            ["time","event_type","description"]
        ),
        notes:e["game-notes"].value.trim()
    }
}
function toLocalInput(value){return value?String(value).slice(0,16):""}
function gameStatusLabel(status){
    return status==="completed"?"Завершена":status==="cancelled"?"Отменена":"Черновик";
}

function setGameEditMode(editing){
    const exists=!!s.currentGame;
    if(e["game-card-view"])e["game-card-view"].hidden=editing||!exists;
    if(e["game-edit-view"])e["game-edit-view"].hidden=!editing;
    if(e["game-edit"])e["game-edit"].hidden=editing||!exists;
    if(e["game-save"])e["game-save"].hidden=!editing;
    if(e["game-cancel-edit"])e["game-cancel-edit"].hidden=!editing||!exists;
    if(e["game-delete"])e["game-delete"].hidden=!exists;
    if(e["game-export-json"])e["game-export-json"].hidden=!exists;
    if(e["game-cancel"])e["game-cancel"].textContent=editing&&!exists?"Отмена":"Закрыть";
}

function switchGameCardTab(tab){
    const valid=["overview","players","questions","themes","events","replay","snapshot"];
    if(!valid.includes(tab))tab="overview";
    document.querySelectorAll("[data-game-card-tab]").forEach(button=>{
        button.classList.toggle("is-active",button.dataset.gameCardTab===tab);
    });
    valid.forEach(name=>{
        const node=e[`game-card-${name}`];
        if(node)node.hidden=name!==tab;
    });
    if(tab!=="replay")pauseGameReplay();
}

function fillGameForm(g){
    e["game-id"].value=g?.id||"";
    e["game-title"].value=g?.title||"";
    e["game-season"].value=g?.season||new Date().getFullYear();
    e["game-started-at"].value=toLocalInput(g?.started_at);
    e["game-ended-at"].value=toLocalInput(g?.ended_at);
    e["game-builder-name"].value=g?.builder_id??"";
    e["game-status"].value=g?.status||"completed";
    e["game-winner"].value=g?.winner||"";
    e["game-prize"].value=g?.winner_money??g?.prize??0;
    e["game-general-count"].value=g?.general_questions??g?.general_count??0;
    e["game-themed-count"].value=g?.theme_questions??g?.themed_count??0;
    e["game-correct-count"].value=g?.correct_answers??g?.correct_count??0;
    e["game-wrong-count"].value=g?.wrong_answers??g?.wrong_count??0;
    e["game-players"].value=(g?.players||[]).map(x=>[
        x.username||x.name,
        x.money??x.result??0,
        x.correct_answers??x.correct??0,
        x.wrong_answers??x.wrong??0,
        x.theme||""
    ].join(" | ")).join("\n");
    e["game-themes"].value=(g?.themes||[]).map(x=>[
        x.theme||x.name,
        x.used_count??x.used??0,
        x.correct_count??x.correct??0,
        x.wrong_count??x.wrong??0
    ].join(" | ")).join("\n");
    e["game-question-ids"].value=(g?.question_ids||[]).join(", ");
    e["game-events"].value=(g?.events||[]).map(x=>[
        x.time,
        x.event_type||x.type,
        x.description||""
    ].join(" | ")).join("\n");
    e["game-notes"].value=g?.notes||"";
    e["game-detail-summary"].textContent=g
        ?`${g.players_count??g.player_count??0} игроков · ${g.total_questions||0} вопросов · ${g.duration_label||"—"}`
        :"Запись можно заполнить вручную.";
}


function stopGameReplayTimer(){
    if(s.replayTimer){
        clearInterval(s.replayTimer);
        s.replayTimer=null;
    }
}

function pauseGameReplay(){
    stopGameReplayTimer();
    s.replayPlaying=false;
    if(e["game-replay-play"])e["game-replay-play"].textContent="▶ Старт";
}

function replayDelay(){
    const current=s.replayEvents[s.replayIndex];
    const next=s.replayEvents[s.replayIndex+1];
    if(!current||!next)return 1200;
    const delta=Math.max(1,Number(next.event_time||0)-Number(current.event_time||0));
    return Math.max(350,Math.min(2500,(delta*1000)/Math.max(.5,s.replaySpeed)));
}

function startGameReplayTimer(){
    if(!s.replayEvents.length)return;
    stopGameReplayTimer();
    s.replayPlaying=true;
    if(e["game-replay-play"])e["game-replay-play"].textContent="⏸ Пауза";

    const schedule=()=>{
        stopGameReplayTimer();
        if(!s.replayPlaying)return;
        s.replayTimer=setTimeout(()=>{
            if(s.replayIndex>=s.replayEvents.length-1){
                pauseGameReplay();
                return;
            }
            setGameReplayIndex(s.replayIndex+1,false);
            schedule();
        },replayDelay());
    };
    schedule();
}

function toggleGameReplay(){
    if(!s.replayEvents.length)return;
    if(s.replayPlaying){
        pauseGameReplay();
        return;
    }
    if(s.replayIndex>=s.replayEvents.length-1)setGameReplayIndex(0,false);
    startGameReplayTimer();
}

function stepGameReplay(delta){
    pauseGameReplay();
    setGameReplayIndex(s.replayIndex+delta);
}

function replayEventTitle(event){
    const labels={
        game_start:"Игра началась",
        question:"Выбран вопрос",
        answer_correct:"Правильный ответ",
        answer_wrong:"Неправильный ответ",
        answer_pass:"Вопрос пропущен",
        answer_flip:"Переход к теме замены",
        player_result:"Результат игрока",
        author_result:"Результат автора",
        game_end:"Игра завершена",
        game_cancel:"Игра отменена"
    };
    return labels[event?.event_type||event?.type]||event?.description||"Событие";
}

function replayPayloadEntries(event){
    const payload=event?.payload&&typeof event.payload==="object"?event.payload:{};
    return Object.entries(payload)
        .filter(([key,value])=>key!=="description"&&value!==null&&value!=="")
        .map(([key,value])=>[
            key,
            typeof value==="object"?JSON.stringify(value):String(value)
        ]);
}

function setGameReplayIndex(index,scroll=true){
    if(!s.replayEvents.length){
        s.replayIndex=0;
        renderGameReplay();
        return;
    }
    const max=s.replayEvents.length-1;
    s.replayIndex=Math.max(0,Math.min(max,Number(index||0)));
    renderGameReplay();

    if(scroll){
        const active=e["game-replay-timeline"]?.querySelector(".is-active");
        active?.scrollIntoView({block:"nearest",behavior:"smooth"});
    }
}

function renderGameReplay(){
    const events=s.replayEvents||[];
    const current=events[s.replayIndex]||null;
    const totalTime=events.length
        ?Number(events[events.length-1].event_time||0)
        :0;

    if(e["game-replay-empty"])e["game-replay-empty"].hidden=events.length>0;
    if(e["game-replay-player"])e["game-replay-player"].hidden=events.length===0;
    if(!events.length)return;

    setText("game-replay-step-label",`Шаг ${s.replayIndex+1} из ${events.length}`);
    setText("game-replay-title",replayEventTitle(current));
    setText("game-replay-time",current.time||"00:00");
    setText(
        "game-replay-description",
        current.description||
        current.payload?.description||
        "Событие без дополнительного описания."
    );

    e["game-replay-details"].innerHTML=replayPayloadEntries(current)
        .map(([key,value])=>`
            <span class="game-replay-detail">
                ${esc(key)}: ${esc(value)}
            </span>
        `).join("");

    const progress=e["game-replay-progress"];
    progress.max=Math.max(0,events.length-1);
    progress.value=s.replayIndex;

    setText("game-replay-current",current.time||"00:00");
    setText("game-replay-total",formatReplaySeconds(totalTime));

    e["game-replay-timeline"].innerHTML=events.map((event,index)=>`
        <article
            class="game-replay-timeline-item ${index===s.replayIndex?"is-active":""}"
            data-replay-index="${index}"
        >
            <div class="game-replay-timeline-time">${esc(event.time||"00:00")}</div>
            <div class="game-replay-timeline-type">${esc(event.event_type||event.type||"event")}</div>
            <div class="game-replay-timeline-description">${esc(
                event.description||
                event.payload?.description||
                replayEventTitle(event)
            )}</div>
        </article>
    `).join("");

    e["game-replay-timeline"]
        .querySelectorAll("[data-replay-index]")
        .forEach(node=>{
            node.addEventListener("click",()=>{
                pauseGameReplay();
                setGameReplayIndex(Number(node.dataset.replayIndex||0));
            });
        });
}

function formatReplaySeconds(seconds){
    const value=Math.max(0,Number(seconds||0));
    const hours=Math.floor(value/3600);
    const minutes=Math.floor((value%3600)/60);
    const secs=Math.floor(value%60);
    return hours
        ?`${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`
        :`${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

function initializeGameReplay(events){
    pauseGameReplay();
    s.replayEvents=[...(events||[])].sort((a,b)=>
        Number(a.event_time||0)-Number(b.event_time||0)
    );
    s.replayIndex=0;
    s.replaySpeed=Number(e["game-replay-speed"]?.value||1);
    renderGameReplay();
}

function renderGameCard(g){
    const players=g.players||[];
    const questions=g.questions||[];
    const themes=g.themes||[];
    const events=g.events||[];
    const snapshot=g.snapshot||null;
    initializeGameReplay(events);

    e["game-card-name"].textContent=g.title||`Игра #${g.id}`;
    e["game-card-meta"].textContent=[
        g.started_at_label||"Дата не указана",
        g.season?`сезон ${g.season}`:"",
        `игра #${g.id}`
    ].filter(Boolean).join(" · ");
    e["game-card-winner"].textContent=g.winner||"Победитель не определён";
    e["game-card-prize"].textContent=`${money(g.winner_money??g.prize??0)} очков`;

    const badge=e["game-card-status"];
    badge.textContent=gameStatusLabel(g.status);
    badge.className=`game-status-badge is-${g.status||"draft"}`;

    setText("game-tab-players-count",players.length);
    setText("game-tab-questions-count",questions.length);
    setText("game-tab-themes-count",themes.length);
    setText("game-tab-events-count",events.length);

    setText("game-view-players",g.players_count??g.player_count??players.length);
    setText("game-view-duration",g.duration_label||"—");
    setText("game-view-general",g.general_questions??g.general_count??0);
    setText("game-view-themed",g.theme_questions??g.themed_count??0);
    setText("game-view-correct",g.correct_answers??g.correct_count??0);
    setText("game-view-wrong",g.wrong_answers??g.wrong_count??0);
    setText("game-view-percent",`${g.correct_percent||0}%`);
    setText("game-view-builder",g.builder_id??"—");
    setText("game-view-season",g.season||"—");
    setText("game-view-started",g.started_at_label||g.started_at||"—");
    setText("game-view-ended",g.ended_at?String(g.ended_at).replace("T"," "):"—");
    setText("game-view-normal",g.ended_normally?"Да":"Нет");
    setText("game-view-tpv-version",g.tpv_version||"—");
    setText("game-view-editor-version",g.editor_version||"—");
    setText("game-view-notes",g.notes||"Примечание отсутствует.");

    e["game-view-players-body"].innerHTML=players.map((item,index)=>`
        <tr>
            <td>${item.place??index+1}</td>
            <td><strong>${esc(item.username||item.name||"—")}</strong></td>
            <td>${esc(item.theme||"—")}</td>
            <td>${money(item.money??item.result??0)}</td>
            <td>${item.correct_answers??item.correct??0}</td>
            <td>${item.wrong_answers??item.wrong??0}</td>
        </tr>
    `).join("");
    e["game-view-players-empty"].hidden=players.length>0;

    e["game-view-questions-body"].innerHTML=questions.map((item,index)=>{
        const result=item.correct===true
            ?'<span class="game-result-correct">Верно</span>'
            :item.correct===false
                ?'<span class="game-result-wrong">Ошибка</span>'
                :'<span class="game-result-empty">Не зафиксирован</span>';
        return `<tr>
            <td>${index+1}</td>
            <td>${item.question_id??"—"}</td>
            <td>${item.question_type==="theme"?"Тема замены":"Общий"}</td>
            <td>${esc(item.theme||"—")}</td>
            <td>${esc(item.author||"—")}</td>
            <td>${result}</td>
        </tr>`;
    }).join("");
    e["game-view-questions-empty"].hidden=questions.length>0;

    e["game-view-themes-grid"].innerHTML=themes.map(item=>{
        const used=Number(item.used_count??item.used??0);
        const correct=Number(item.correct_count??item.correct??0);
        const wrong=Number(item.wrong_count??item.wrong??0);
        const percent=correct+wrong?Math.round(correct*100/(correct+wrong)):0;
        return `<article class="game-theme-card">
            <h4>${esc(item.theme||item.name||"Без темы")}</h4>
            <dl>
                <div><dt>Использовано</dt><dd>${used}</dd></div>
                <div><dt>Правильных</dt><dd>${correct}</dd></div>
                <div><dt>Ошибок</dt><dd>${wrong}</dd></div>
                <div><dt>Точность</dt><dd>${percent}%</dd></div>
            </dl>
        </article>`;
    }).join("");
    e["game-view-themes-empty"].hidden=themes.length>0;

    e["game-view-events-list"].innerHTML=events.map(item=>{
        const payload=item.payload&&typeof item.payload==="object"?item.payload:{};
        const details=Object.entries(payload)
            .filter(([key,value])=>key!=="description"&&value!==null&&value!=="")
            .map(([key,value])=>`${key}: ${typeof value==="object"?JSON.stringify(value):value}`)
            .join(" · ");
        return `<article class="game-event-item">
            <div class="game-event-time">${esc(item.time||"00:00")}</div>
            <div class="game-event-type">${esc(item.event_type||item.type||"event")}</div>
            <div>
                <div class="game-event-description">${esc(item.description||payload.description||"Событие")}</div>
                ${details?`<div class="game-event-payload">${esc(details)}</div>`:""}
            </div>
        </article>`;
    }).join("");
    e["game-view-events-empty"].hidden=events.length>0;

    const snapshotItems=snapshot?[
        ["Вопросов в базе",snapshot.questions_total||0],
        ["Тем в базе",snapshot.themes_total||0],
        ["Размер БД",formatBytes(snapshot.database_size||0)],
        ["Ресурс базы",`${snapshot.resource_games||0} игр`],
        ["Builder ID",snapshot.builder_id??"—"]
    ]:[];
    e["game-view-snapshot"].innerHTML=snapshotItems.map(([label,value])=>`
        <article class="game-snapshot-card">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
        </article>
    `).join("");
    e["game-view-snapshot-empty"].hidden=!!snapshot;

    switchGameCardTab("overview");
}

function formatBytes(value){
    const bytes=Number(value||0);
    if(bytes>=1024*1024)return `${(bytes/(1024*1024)).toFixed(1)} МБ`;
    if(bytes>=1024)return `${(bytes/1024).toFixed(1)} КБ`;
    return `${bytes} Б`;
}

async function openGame(id){
    if(!id){
        s.currentGame=null;
        fillGameForm(null);
        e["game-dialog-title"].textContent="Новая запись игры";
        setGameEditMode(true);
        e["game-dialog"].showModal();
        return;
    }

    try{
        const response=await api(`/tpv_editor/api/games/${id}`);
        const g=response.game;
        s.currentGame=g;
        e["game-dialog-title"].textContent=`Игра #${g.id}`;
        fillGameForm(g);
        renderGameCard(g);
        setGameEditMode(false);
        e["game-dialog"].showModal();
    }catch(error){
        toast(error.message,true);
    }
}

function closeGame(){
    pauseGameReplay();
    if(e["game-dialog"]?.open)e["game-dialog"].close();
    s.currentGame=null;
}

async function saveGame(){
    const payload=gamePayload();
    if(!payload.title){
        toast("Укажите название игры.",true);
        return;
    }
    try{
        const url=s.currentGame
            ?`/tpv_editor/api/games/${s.currentGame.id}`
            :"/tpv_editor/api/games";
        const response=await api(url,{
            method:s.currentGame?"PUT":"POST",
            body:payload
        });
        toast(response.message);
        await loadGames();
        await loadDashboard();

        if(response.game){
            s.currentGame=response.game;
            fillGameForm(response.game);
            renderGameCard(response.game);
            e["game-dialog-title"].textContent=`Игра #${response.game.id}`;
            setGameEditMode(false);
        }else{
            closeGame();
        }
    }catch(error){
        toast(error.message,true);
    }
}

async function deleteGame(){
    if(!s.currentGame||!confirm(`Удалить игру #${s.currentGame.id}?`))return;
    try{
        const response=await api(`/tpv_editor/api/games/${s.currentGame.id}`,{
            method:"DELETE"
        });
        toast(response.message);
        closeGame();
        await loadGames();
        await loadDashboard();
    }catch(error){
        toast(error.message,true);
    }
}

function downloadJsonFile(data,filename){
    const blob=new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json;charset=utf-8"}
    );
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function archiveFileStamp(){
    const now=new Date();
    const part=value=>String(value).padStart(2,"0");
    return [
        now.getFullYear(),
        part(now.getMonth()+1),
        part(now.getDate()),
        "_",
        part(now.getHours()),
        part(now.getMinutes())
    ].join("");
}

async function exportGameJson(){
    if(!s.currentGame)return;
    try{
        const response=await api(
            `/tpv_editor/api/games/${s.currentGame.id}/export`
        );
        downloadJsonFile(
            response.archive,
            `tpv_game_${s.currentGame.id}_${archiveFileStamp()}.json`
        );
        toast("Игра экспортирована.");
    }catch(error){
        toast(error.message,true);
    }
}

async function clearGamesArchive(){
    const games=Array.isArray(s.games)?s.games:[];
    if(!games.length){toast("Архив игр уже пуст.");return;}
    const count=games.length;
    if(!confirm(`Полностью очистить архив игр?\n\nБудут удалены все ${count} игр и связанные архивные данные.`))return;
    if(!confirm("Подтвердите ещё раз: удалить ВЕСЬ архив игр? Это действие нельзя отменить."))return;
    const button=e["games-clear-all"];
    if(button){button.disabled=true;button.textContent="Очистка…";}
    try{
        let deleted=0;
        for(const id of games.map(x=>Number(x.id)).filter(Number.isFinite)){
            await api(`/tpv_editor/api/games/${id}`,{method:"DELETE"});
            deleted++;
        }
        toast(`Архив очищен. Удалено игр: ${deleted}.`);
        await loadGames();
        if(s.gamesView==="records")await loadRecords();
    }catch(error){
        toast(`Очистка архива остановлена: ${error.message}`,true);
        await loadGames();
    }finally{
        if(button){button.disabled=false;button.textContent="Очистить архив";}
    }
}

async function exportGamesArchive(){
    try{
        const response=await api("/tpv_editor/api/games/export-all");
        const archive=response.archive;
        downloadJsonFile(
            archive,
            `tpv_games_archive_${archiveFileStamp()}.json`
        );
        toast(`Экспортировано игр: ${archive.count||0}.`);
    }catch(error){
        toast(error.message,true);
    }
}

async function importGamesArchive(event){
    const input=event.currentTarget;
    const file=input.files?.[0];
    input.value="";
    if(!file)return;

    if(file.size>25*1024*1024){
        toast("JSON-файл превышает допустимый размер 25 МБ.",true);
        return;
    }

    try{
        const text=await file.text();
        let document;
        try{
            document=JSON.parse(text);
        }catch{
            throw new Error("Выбранный файл содержит некорректный JSON.");
        }

        const possibleCount=Array.isArray(document)
            ?document.length
            :Array.isArray(document?.games)
                ?document.games.length
                :1;

        if(!confirm(
            `Импортировать записей: ${possibleCount}?\n\n`+
            "Существующие игры не будут перезаписаны. "+
            "Импортированные записи получат новые ID."
        ))return;

        const response=await api("/tpv_editor/api/games/import",{
            method:"POST",
            body:document
        });

        toast(response.message);
        await loadGames();
        await loadDashboard();
    }catch(error){
        toast(error.message||"Не удалось импортировать архив.",true);
    }
}


})();

/* TPV 15.1.3.7.3 PARTICIPATION CARD HARD SYNC */
(() => {
    "use strict";
    const STATUSES = [
        ["new", "Новая"],
        ["reviewing", "На рассмотрении"],
        ["accepted", "Принята"],
        ["confirmed", "Подтверждена"],
        ["rejected", "Отклонена"],
    ];
    function normText(value){
        return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
    }
    function isParticipationDialog(dialog){
        if(!dialog) return false;
        const text=normText(dialog.textContent);
        return text.includes("модерация заявки на участие")
            || (text.includes("статус заявки")
                && text.includes("проверка темы")
                && text.includes("создать игрока"));
    }
    function findStatusSelect(dialog){
        for(const label of dialog.querySelectorAll("label")){
            const caption=label.querySelector("span");
            if(normText(caption?.textContent)==="статус заявки"){
                return label.querySelector("select");
            }
        }
        return null;
    }
    function syncSelect(select){
        if(!select) return;
        const legacy={pending:"reviewing",approved:"accepted",completed:"confirmed"};
        const wanted=legacy[select.value] || select.value || "new";
        const signature=STATUSES.map(([v,t])=>`${v}:${t}`).join("|");
        if(select.dataset.tpvParticipationStatuses!==signature){
            select.replaceChildren(...STATUSES.map(([value,label])=>{
                const option=document.createElement("option");
                option.value=value;
                option.textContent=label;
                return option;
            }));
            select.dataset.tpvParticipationStatuses=signature;
        }
        if(STATUSES.some(([value])=>value===wanted)) select.value=wanted;
    }
    function syncBadges(scope=document){
        scope.querySelectorAll(".application-status").forEach(badge=>{
            const text=normText(badge.textContent);
            if(text==="принята") badge.classList.add("application-status-accepted");
            if(text==="подтверждена") badge.classList.add("application-status-confirmed");
        });
    }
    function syncParticipationCards(){
        document.querySelectorAll("dialog").forEach(dialog=>{
            if(!isParticipationDialog(dialog)) return;
            syncSelect(findStatusSelect(dialog));
            syncBadges(dialog);
        });
        syncBadges(document);
    }
    document.addEventListener("DOMContentLoaded", syncParticipationCards);
    document.addEventListener("click", ()=>setTimeout(syncParticipationCards,0), true);
    document.addEventListener("change", event=>{
        const dialog=event.target?.closest?.("dialog");
        if(dialog && isParticipationDialog(dialog)) setTimeout(syncParticipationCards,0);
    }, true);
    new MutationObserver(syncParticipationCards).observe(document.documentElement,{
        childList:true, subtree:true
    });
})();

/* TPV 15.1.3.7.4.1 STATUS COLOR HARD FIX */
(() => {
  "use strict";
  function norm(v){ return String(v||"").replace(/\s+/g," ").trim().toLowerCase(); }
  function paint(el, kind){
    if(!el) return;
    if(kind==="accepted"){
      el.classList.add("tpv-status-accepted-hard");
      el.style.setProperty("color","#67e8f9","important");
      el.style.setProperty("border-color","rgba(34,211,238,.78)","important");
      el.style.setProperty("background","rgba(8,145,178,.22)","important");
    } else if(kind==="confirmed"){
      el.classList.add("tpv-status-confirmed-hard");
      el.style.setProperty("color","#86efac","important");
      el.style.setProperty("border-color","rgba(34,197,94,.78)","important");
      el.style.setProperty("background","rgba(22,163,74,.22)","important");
    }
  }
  function refresh(){
    document.querySelectorAll(".application-status,.status,.status-badge,.badge,[data-status],[class*='status']").forEach(el=>{
      const t=norm(el.textContent), d=norm(el.getAttribute("data-status"));
      if(t==="принята" || d==="accepted") paint(el,"accepted");
      if(t==="подтверждена" || d==="confirmed") paint(el,"confirmed");
    });
  }
  document.addEventListener("DOMContentLoaded",refresh);
  document.addEventListener("click",()=>setTimeout(refresh,0),true);
  document.addEventListener("change",()=>setTimeout(refresh,0),true);
  new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
