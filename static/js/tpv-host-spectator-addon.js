(() => {
'use strict';
const wait=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('click',fn,true)};
const room=()=>document.getElementById('room')?.value||null;
wait('action-start-game',()=>socket.emit('tpv_spectator_command',{action:'brand_show',room:room()}));
wait('action-start-circle',()=>socket.emit('tpv_spectator_command',{action:'brand_hide',room:room()}));
wait('action-select-random-player',()=>socket.emit('tpv_spectator_command',{action:'select_start',room:room()}));
wait('action-select-player-by-id',()=>socket.emit('tpv_spectator_command',{action:'select_start',room:room()}));
wait('action-bong-author-win',()=>setTimeout(()=>socket.emit('tpv_spectator_command',{action:'author_award',author:document.getElementById('bong-question-author')?.textContent||'',sum:Number(document.getElementById('bong-game-status')?.textContent.replace(/\s/g,''))||0}),50));
const originalRandom=window.choose_player_random;
if(typeof originalRandom==='function')window.choose_player_random=async function(...args){const result=await originalRandom.apply(this,args);const name=typeof result==='string'?result:document.getElementById('display-current-player')?.textContent;socket.emit('tpv_spectator_command',{action:'player_selected',player:name});return result};
const originalId=window.choose_player_id;
if(typeof originalId==='function')window.choose_player_id=async function(...args){const result=await originalId.apply(this,args);const name=typeof result==='string'?result:document.getElementById('display-current-player')?.textContent;socket.emit('tpv_spectator_command',{action:'player_selected',player:name});return result};
})();
