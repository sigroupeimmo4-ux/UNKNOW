/* Test du mode clair/sombre avec stockage local, sans navigateur externe. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const script=read('theme-mode.js'),css=read('theme-mode.css'),app=read('app.html');
new vm.Script(script,{filename:'theme-mode.js'});
assert.match(css,/html\[data-studybeam-theme="dark"\]/);
assert.match(css,/body\[data-auth-page\]/);
assert.match(css,/body\[data-school-tool\]/);
assert.match(css,/#121D26/);
assert.match(app,/data-theme-choice="light"/);
assert.match(app,/data-theme-choice="dark"/);
assert.match(app,/theme-mode\.js\?v=light-dark-1/);
assert.match(app,/theme-mode\.css\?v=light-dark-1/);
assert.match(read('calendrier.html'),/theme-mode\.js\?v=light-dark-1/);
assert.match(read('mes-notes.html'),/theme-mode\.js\?v=light-dark-1/);
assert.match(read('scripts/build_navigation_pages.py'),/if 'theme-mode\.css' not in s/);
assert.match(read('scripts/build_navigation_pages.py'),/if 'theme-mode\.js' not in s/);

const store=new Map([['sw-color-mode-v1','dark']]);
const listeners=new Map();
const meta={color:'#FAF9F5',setAttribute(key,value){if(key==='content')this.color=value;}};
const rootElement={attrs:{},style:{},setAttribute(key,value){this.attrs[key]=value;}};
const document={
 documentElement:rootElement,readyState:'loading',
 querySelector(q){return q==='meta[name="theme-color"]'?meta:null;},
 querySelectorAll(){return[];},
 getElementById(){return null;},
 addEventListener(name,fn){listeners.set('document:'+name,fn);},
 dispatchEvent(){}
};
const window={
 addEventListener(name,fn){listeners.set('window:'+name,fn);}
};
const localStorage={
 getItem(key){return store.has(key)?store.get(key):null;},
 setItem(key,value){store.set(key,String(value));}
};
class CustomEvent{constructor(type,options){this.type=type;this.detail=options?.detail;}}
vm.runInNewContext(script,{window,document,localStorage,CustomEvent});
assert.equal(rootElement.attrs['data-studybeam-theme'],'dark');
assert.equal(rootElement.style.colorScheme,'dark');
assert.equal(meta.color,'#121D26');
assert.equal(window.studybeamColorMode.get(),'dark');
assert.equal(window.studybeamColorMode.set('light'),true);
assert.equal(localStorage.getItem('sw-color-mode-v1'),'light');
assert.equal(rootElement.attrs['data-studybeam-theme'],'light');
assert.equal(window.studybeamColorMode.set('invalid'),false);
assert.equal(rootElement.attrs['data-studybeam-theme'],'light');
store.set('sw-color-mode-v1','dark');
listeners.get('window:storage')({key:'sw-color-mode-v1'});
assert.equal(rootElement.attrs['data-studybeam-theme'],'dark');
assert.equal(typeof listeners.get('document:DOMContentLoaded'),'function');
listeners.get('document:DOMContentLoaded')();
console.log('StudyBeam theme: modes, persistence, accessibility hooks and linked styles OK.');
