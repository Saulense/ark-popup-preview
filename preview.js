(()=>{'use strict';
 const params=()=>new URLSearchParams(location.hash.slice(1));
 let popup=params().get('popup')==='p2'?'p2':'p1',step=['email','phone','success'].includes(params().get('step'))?params().get('step'):'email',channel=params().get('channel')==='sms'?'sms':'email';
 const overlays=[...document.querySelectorAll('.arkp-overlay')];
 let closeTimer=null;const exitClose=document.querySelector('#arkpOvL [data-arkp-close]');
 function resetClose(){if(closeTimer!==null)clearTimeout(closeTimer);closeTimer=null;exitClose.disabled=false;exitClose.classList.remove('arkp-close-wait');}
 function closeAll(){resetClose();overlays.forEach(x=>x.classList.remove('on'));}
 function show(){for(const ov of overlays){const active=ov.id===(popup==='p1'?'arkpOvP':'arkpOvL'),opening=active&&!ov.classList.contains('on');ov.classList.toggle('on',active);ov.setAttribute('aria-hidden',String(!active));if(ov.id==='arkpOvL'){if(!active)resetClose();else if(opening){resetClose();exitClose.disabled=true;exitClose.classList.add('arkp-close-wait');closeTimer=setTimeout(()=>{closeTimer=null;exitClose.disabled=false;exitClose.classList.remove('arkp-close-wait');},1500);}}ov.querySelectorAll('[data-state]').forEach(s=>s.classList.toggle('on',s.dataset.state===step));const copy=ov.querySelector('[data-email-copy]');copy.textContent=channel==='sms'?copy.dataset.smsCopy:copy.dataset.emailCopy;}parent.postMessage({type:'ark-preview-step',step,channel},'*');}
 document.addEventListener('submit',e=>{e.preventDefault();step=step==='email'?'phone':'success';show();});
 document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.matches('[data-arkp-close],[data-arkp-go]')||b.querySelector('[data-i="p1_success_btn"]')||b.matches('[data-i="p1_success_btn"]')){e.preventDefault();closeAll();return;}if(b.id==='arkpSkip1'||b.id==='arkpSkip2'){e.preventDefault();channel='email';step='success';show();return;}if(b.type==='submit'){e.preventDefault();if(step==='phone')channel='sms';step=step==='email'?'phone':'success';show();return;}if(b.matches('a'))e.preventDefault();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
 overlays.forEach(ov=>ov.addEventListener('click',e=>{if(e.target===ov)closeAll();}));
 document.querySelectorAll('select.arkp-country').forEach(s=>s.addEventListener('change',()=>{const label=s.parentElement.querySelector('.arkp-country-display');if(label)label.textContent=s.value?s.value.replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)))+' '+(s.selectedOptions[0]?.dataset.dial||''):'';}));
 window.addEventListener('hashchange',()=>{const p=params();popup=p.get('popup')==='p2'?'p2':'p1';step=['email','phone','success'].includes(p.get('step'))?p.get('step'):'email';channel=p.get('channel')==='sms'?'sms':'email';show();});show();
})();
