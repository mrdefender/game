(()=>{
"use strict";
const form=document.getElementById("public-application-form");
if(!form)return;

const type=document.getElementById("public-type");
const themeField=document.getElementById("public-theme-field");
const submit=document.getElementById("public-submit");
const result=document.getElementById("public-result");
const unavailable=document.getElementById("application-unavailable");
const ownThemeInfo=document.getElementById("public-own-theme");
let ownTheme="";
const authorInput=document.getElementById("public-author-input");

document.addEventListener("DOMContentLoaded",async()=>{
    type.addEventListener("change",syncType);
    form.addEventListener("submit",sendApplication);
    syncType();

    try{
        const author=authorInput?.value.trim()||"";
        const statusUrl="/api/tpv-question-applications/status"+(author?`?author=${encodeURIComponent(author)}`:"");
        const response=await fetch(statusUrl,{credentials:"same-origin"});
        let data={};
        try{data=await response.json();}catch{data={};}

        if(!response.ok||data.ok===false){
            throw new Error(data.error||data.message||`HTTP ${response.status}`);
        }
        if(data.auth_enabled!==false&&!data.authenticated){
            window.location.href="/auth/yandex?next=/tpv-question";
            return;
        }
        if(!data.table_exists){
            unavailable.hidden=false;
            submit.disabled=true;
            return;
        }

        ownTheme=String(data.own_theme||"").trim();
        if(ownTheme&&ownThemeInfo){
            ownThemeInfo.textContent=`Ваша игровая тема «${ownTheme}» исключена из списка: вопросы по своей теме отправлять нельзя.`;
            ownThemeInfo.hidden=false;
        }
        fillThemes(data.themes||[]);
    }catch(error){
        console.error("TPV question form status failed:",error);
        unavailable.hidden=false;
        submit.disabled=true;
    }
});

if(authorInput){
    let authorTimer=null;
    authorInput.addEventListener("input",()=>{
        clearTimeout(authorTimer);
        authorTimer=setTimeout(refreshManualIdentity,250);
    });
}

async function refreshManualIdentity(){
    const author=authorInput?.value.trim()||"";
    ownTheme="";
    if(ownThemeInfo){ownThemeInfo.hidden=true;ownThemeInfo.textContent="";}
    try{
        const response=await fetch(`/api/tpv-question-applications/status?author=${encodeURIComponent(author)}`,{credentials:"same-origin"});
        const data=await response.json();
        if(!response.ok||data.ok===false)throw new Error(data.error||`HTTP ${response.status}`);
        ownTheme=String(data.own_theme||"").trim();
        if(ownTheme&&ownThemeInfo){
            ownThemeInfo.textContent=`Ваша игровая тема «${ownTheme}» исключена из списка: вопросы по своей теме отправлять нельзя.`;
            ownThemeInfo.hidden=false;
        }
        fillThemes(data.themes||[]);
    }catch(error){console.error("TPV manual identity refresh failed:",error);}
}

function fillThemes(themes){
    const select=document.getElementById("public-theme");
    const empty=document.getElementById("public-theme-empty");
    select.innerHTML='<option value="">Выберите тему</option>'
        +themes.map(theme=>`<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("");
    empty.hidden=themes.length>0;
    select.disabled=themes.length===0;
    syncType();
}

function syncType(){
    const themed=type.value==="themed";
    const select=document.getElementById("public-theme");
    themeField.hidden=!themed;
    select.required=themed;
    if(themed&&select.disabled){submit.disabled=true;}
    else if(unavailable.hidden){submit.disabled=false;}
}

function escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,char=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
}

async function sendApplication(event){
    event.preventDefault();
    const csrf=document.querySelector('meta[name="csrf-token"]')?.content;
    const payload={
        // При выключенной авторизации author берётся из ручного поля.
        ...(authorInput?{author:authorInput.value.trim()}:{}),
        task:document.getElementById("public-task").value.trim(),
        answer:document.getElementById("public-answer").value.trim(),
        comment:document.getElementById("public-comment").value.trim(),
        flip:type.value==="general"?"false":document.getElementById("public-theme").value.trim()
    };

    if(authorInput&&!authorInput.value.trim()){
        result.textContent="Укажите имя или никнейм автора.";
        result.hidden=false;
        authorInput.focus();
        return;
    }

    submit.disabled=true;
    submit.textContent="Отправка…";
    result.hidden=true;

    try{
        const response=await fetch("/api/tpv-question-applications",{
            method:"POST",
            credentials:"same-origin",
            headers:{
                "Content-Type":"application/json",
                "X-Requested-With":"XMLHttpRequest",
                ...(csrf?{"X-CSRFToken":csrf}:{})
            },
            body:JSON.stringify(payload)
        });

        let data={};
        try{data=await response.json();}catch{data={};}

        if(response.status===401){
            window.location.href="/auth/yandex?next=/tpv-question";
            return;
        }
        if(!response.ok||data.ok===false){
            throw new Error(data.error||data.message||`Не удалось отправить заявку. HTTP ${response.status}`);
        }

        form.reset();
        syncType();
        result.textContent=`Заявка №${data.application_id} отправлена на модерацию.`;
        result.hidden=false;
        result.style.borderColor="";
    }catch(error){
        result.textContent=error.message;
        result.hidden=false;
        result.style.borderColor="rgba(255,123,137,.4)";
    }finally{
        submit.disabled=false;
        submit.textContent="Отправить на модерацию";
        syncType();
    }
}
})();
