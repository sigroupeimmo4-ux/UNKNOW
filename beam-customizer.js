(() => {
 'use strict';
 const container=document.querySelector('#dragon .dragon-preview');
 const image=container?.querySelector('img');
 const outfit=document.getElementById('beamOutfit'),accessory=document.getElementById('beamAccessory');
 if(!image || !outfit || !accessory)return;
 const storage=window.studybeamStorage;
 const key='beam-appearance-v1';
 const initial={outfit:'',accessory:''};
 const icons={Professeur:'📚',Scientifique:'🔬',Astronaute:'🚀',Magicien:'🪄','Super-héros':'🦸',Détective:'🔎',Pirate:'🏴‍☠️',Explorateur:'🧭',Sportif:'🏅',Artiste:'🎨',Lunettes:'👓',Écouteurs:'🎧',Chapeau:'🎩',Couronne:'👑','Sac à dos':'🎒',Écharpe:'🧣',Nœud:'🎀',Science:'🧪',Étoiles:'✨'};
 let saved=initial;
 try {const parsed=JSON.parse(storage?.get(key)||'null');if(parsed && typeof parsed==='object')saved={outfit:Object.hasOwn(icons,parsed.outfit)?parsed.outfit:'',accessory:Object.hasOwn(icons,parsed.accessory)?parsed.accessory:''};}catch{}
 const overlay=document.createElement('div');
 overlay.className='beam-accessory-preview';
 overlay.setAttribute('aria-live','polite');
 container.insertBefore(overlay,image.nextSibling);
 const status=document.getElementById('beamCreatorStatus');
 const update=()=>{overlay.replaceChildren();
  for(const [kind,value] of [['tenue',outfit.value],['accessoire',accessory.value]])if(icons[value]){
   const span=document.createElement('span');span.className='beam-overlay-'+kind;
   span.textContent=icons[value];span.setAttribute('aria-label',value);span.title=value;overlay.append(span);
  }
 };
 const restore=()=>{outfit.value=saved.outfit;accessory.value=saved.accessory;update();};
 outfit.onchange=update;accessory.onchange=update;
 document.getElementById('beamSave').onclick=()=>{saved={outfit:outfit.value,accessory:accessory.value};storage?.set(key,JSON.stringify(saved));status.textContent='Apparence enregistrée sur cet appareil.';};
 document.getElementById('beamCancel').onclick=()=>{restore();status.textContent='Modifications annulées.';};
 document.getElementById('beamReset').onclick=()=>{outfit.value='';accessory.value='';update();status.textContent='Aperçu réinitialisé. Enregistre pour le conserver.';};
 restore();
})();
