(()=>{'use strict';
 const $=id=>document.getElementById(id),names={p1:'ARK Melts',p2:'Leaving already'};
 const count=n=>new Intl.NumberFormat('en-US').format(n),safe=n=>Number.isSafeInteger(n)&&n>=0;
 let selected='p1',device='desktop',step='email',lang='en',channel='email',manifest=null,data=null,period=null,loaded=false,resetCount=0;
 function nav(view){if(!['performance','popups','changes'].includes(view))view='performance';for(const v of document.querySelectorAll('.view'))v.hidden=v.id!==view;for(const b of document.querySelectorAll('[data-nav]')){if(b.dataset.nav===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}$('breadcrumb').textContent='Overview / '+({performance:'Performance',popups:'Popups',changes:'Changes & learning'}[view]);history.replaceState(null,'','#'+view);if(view==='popups')renderPreview();}
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
 $('mobileLock').onclick=()=>$('logout').click();
 document.querySelector('.wordmark').onclick=e=>{e.preventDefault();nav('performance');};
 function size(){const w=device==='mobile'?390:1100,h=device==='mobile'?844:800,area=$('stage');if(area.hidden||$('popups').hidden)return;const pad=parseFloat(getComputedStyle(area).paddingLeft)*2,scale=Math.min(1,Math.max(0.1,(area.clientWidth-pad)/w));const frame=$('preview');frame.style.width=w+'px';frame.style.height=h+'px';frame.style.transform=`scale(${scale})`;$('frameSizer').style.width=(w*scale)+'px';$('frameSizer').style.height=(h*scale)+'px';$('dimensions').textContent=`${w} × ${h}${scale<1?' · scaled to fit':''}`;}
 function renderPreview(reset=false){
  for(const b of document.querySelectorAll('[data-popup]'))b.setAttribute('aria-pressed',String(b.dataset.popup===selected));
  for(const b of document.querySelectorAll('[data-device]'))b.setAttribute('aria-pressed',String(b.dataset.device===device));
  for(const b of document.querySelectorAll('[data-step]'))b.setAttribute('aria-pressed',String(b.dataset.step===step));
  $('channelControl').hidden=step!=='success';
  const frame=$('preview'),url=`preview-${lang}.html?v=6#popup=${selected}&step=${step}&channel=${channel}`;
  if(!loaded||frame.dataset.url!==url||reset){frame.src=reset?url.replace('?v=6','?v=6&reset='+(++resetCount)):url;frame.dataset.url=url;loaded=true;}
  frame.title=names[selected]+' '+device+' '+step+' preview';
  $('previewRule').textContent=selected==='p1'?'10 active seconds · eligible pages · desktop + mobile':device==='mobile'?'Mobile design preview · automatic mobile exit is OFF':'Desktop exit backup · 5 active seconds · before another offer';size();
 }
 document.querySelectorAll('[data-popup]').forEach(b=>b.onclick=()=>{selected=b.dataset.popup;step='email';renderPreview();});
 document.querySelectorAll('[data-device]').forEach(b=>b.onclick=()=>{device=b.dataset.device;renderPreview();});
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=b.dataset.step;renderPreview();});
 $('successChannel').onchange=()=>{channel=$('successChannel').value;renderPreview();};
 $('language').onchange=()=>{lang=$('language').value;renderPreview();};$('reopen').onclick=()=>renderPreview(true);
 new ResizeObserver(size).observe($('stage'));
 window.addEventListener('message',e=>{if(e.source!==$('preview').contentWindow||e.data?.type!=='ark-preview-step'||!['email','phone','success'].includes(e.data.step))return;step=e.data.step;channel=e.data.channel==='sms'?'sms':'email';$('successChannel').value=channel;$('channelControl').hidden=step!=='success';for(const b of document.querySelectorAll('[data-step]'))b.setAttribute('aria-pressed',String(b.dataset.step===step));$('preview').dataset.url=`preview-${lang}.html?v=6#popup=${selected}&step=${step}&channel=${channel}`;});
 fetch('preview-manifest.json?v=6',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(m=>{if(!/^[a-f0-9]{64}$/.test(m.sourceSHA256)||!Number.isFinite(Date.parse(m.capturedAt)))throw Error();manifest=m;$('snapshot').textContent='Captured '+new Date(m.capturedAt).toLocaleString('en-GB',{timeZone:'UTC'})+' UTC · Theme '+m.themeId+' · '+m.formVersion+' · source '+m.sourceSHA256.slice(0,12)+'. Preview actions are simulated and never write to Shopify or Klaviyo.';$('p1Status').textContent=m.popups.p1.enabled?'Enabled · 10-second welcome':'Disabled in captured settings';$('p2Status').textContent=m.popups.p2.enabled?'Enabled · desktop exit backup':'Disabled in captured settings';}).catch(()=>{$('snapshot').textContent='Snapshot metadata unavailable. Do not assume this preview is current.';$('p1Status').textContent=$('p2Status').textContent='Status unavailable';});
 function cell(tr,text,cls){const td=document.createElement('td');td.textContent=text;if(cls)td.className=cls;tr.append(td);return td;}
 function rate(a,v,covered=true){return covered&&safe(a)&&safe(v)&&v>0&&a<=v?(a/v*100).toFixed(1)+'%':'—';}
 function render(d,r){
  data=d;period=r;$('versionPeriod').textContent=r.start+' – '+r.displayEnd+' · UTC';$('versionRows').replaceChildren();
  const versions=(Array.isArray(d.versions)?d.versions:[]).filter(v=>['p1','p2'].includes(v.popup)&&typeof v.form_version==='string'&&v.form_version.length<160&&safe(v.views)&&safe(v.accepted)&&Number.isFinite(Date.parse(v.first_seen))&&Number.isFinite(Date.parse(v.last_seen))).sort((a,b)=>a.popup.localeCompare(b.popup)||a.first_seen.localeCompare(b.first_seen));
  for(const v of versions){const tr=document.createElement('tr'),td=cell(tr,names[v.popup]+' · '+v.form_version,'version-label'),sm=document.createElement('small');sm.textContent=v.first_seen.slice(0,10)+' → '+v.last_seen.slice(0,10);td.append(sm);cell(tr,count(v.views));cell(tr,count(v.accepted));cell(tr,rate(v.accepted,v.views,!d.partial_telemetry));cell(tr,v.views<100||v.accepted<10?'Small sample':'Descriptive only',v.views<100||v.accepted<10?'sample-small':'');$('versionRows').append(tr);}
  if(!versions.length){const tr=document.createElement('tr');cell(tr,'No version events recorded for this period.').colSpan=5;$('versionRows').append(tr);}
  $('versionNote').textContent=d.partial_telemetry?'Rates unavailable: no complete tracking window.':(d.range_clipped?'Only the available tracked period is included. ':'')+'Compare the rates, not just signup totals. Different dates, audiences and traffic mix can change results. No causal winner is inferred.';
  const unknown=versions.some(v=>manifest&&v.form_version!==manifest.formVersion&&v.last_seen>manifest.capturedAt);if(unknown)$('snapshot').textContent='A newer or different version has been observed since this snapshot. Preview needs recapture before design approval.';
  $('dailyRows').replaceChildren();const days=d.data_through?d.daily.filter(x=>safe(x.views)&&safe(x.email)&&Date.parse(x.date)<Date.parse(d.data_through)&&Date.parse(x.date)+86400000>Date.parse(d.data_from)):[];
  for(const day of days){const tr=document.createElement('tr');cell(tr,day.date);const partial=Date.parse(day.date+'T00:00:00Z')<Date.parse(d.data_from);if(partial)tr.firstChild.textContent+=' · tracked part';cell(tr,count(day.views));cell(tr,count(day.email));$('dailyRows').append(tr);}
  const ranked=days.filter(x=>x.email>0).sort((a,b)=>b.email-a.email),best=ranked[0];
  $('observations').textContent=!d.data_through?'Signup verification pending.':best?`${best.date} recorded the most email signups in this range: ${count(best.email)} (${count(best.views)} tracked views). This is a volume observation, not proof that a change caused a spike.`:'No verified email signups recorded in this range yet. No improvement claim.';
 }
 $('export').onclick=()=>{if(!data){$('observations').textContent='Open Performance and load a report first.';return;}const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),period,snapshot:manifest,report:data,interpretation:'Observed counts; submission rate is requests/views, not confirmed subscriber conversion or causal attribution. No ROI/ROAS.'},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ark-popup-report-'+period.start+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 window.ARKDashboardUI={render,openPopup(id){selected=id;step='email';nav('popups');}};
 nav(['performance','popups','changes'].includes(location.hash.slice(1))?location.hash.slice(1):'performance');
})();
