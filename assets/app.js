
"use strict";
document.documentElement.classList.add("js");
const menuButton=document.querySelector(".menu-toggle");
const nav=document.querySelector(".nav");
function closeMenu(){if(!nav||!menuButton)return;nav.classList.remove("is-open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Abrir menú");}
if(menuButton&&nav){menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")!=="true";menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú");nav.classList.toggle("is-open",open);});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menuButton.getAttribute("aria-expanded")==="true"){closeMenu();menuButton.focus();}});window.matchMedia("(min-width:761px)").addEventListener("change",e=>{if(e.matches)closeMenu();});}
document.querySelectorAll("a[data-link]").forEach(a=>{const raw=(window.SITE_LINKS||{})[a.dataset.link];try{const u=new URL(typeof raw==="string"?raw.trim():"");if(!["http:","https:"].includes(u.protocol))return;a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";a.hidden=false;}catch(_){a.hidden=true;a.removeAttribute("href");}});
function downloadText(filename,text){const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function resultLine(label,value){const div=document.createElement("div");div.className="result-line";const dt=document.createElement("dt");dt.textContent=label;const dd=document.createElement("dd");dd.textContent=value;div.append(dt,dd);return div;}
function trimForm(form){form.querySelectorAll("input:not([type=checkbox]):not([type=number]):not([type=date]),textarea").forEach(field=>{field.value=field.value.trim();field.setCustomValidity("");});}
function setStatus(id,message){const node=document.getElementById(id);if(node)node.textContent=message;}
document.querySelectorAll("input,textarea,select").forEach(field=>{field.addEventListener("input",()=>field.setCustomValidity(""));field.addEventListener("change",()=>field.setCustomValidity(""));field.addEventListener("invalid",()=>{if(field.validity.valueMissing)field.setCustomValidity("Completa este campo para continuar.");else if(field.validity.typeMismatch&&field.type==="email")field.setCustomValidity("Escribe un correo válido, por ejemplo nombre@dominio.com.");else if(field.validity.tooShort)field.setCustomValidity("Añade un poco más de detalle para preparar el resultado.");});});
const contactForm=document.getElementById("contact-form");
if(contactForm){contactForm.addEventListener("submit",e=>{e.preventDefault();trimForm(contactForm);if(!contactForm.reportValidity())return;const values=new FormData(contactForm);const body=["Hola,", "", "Mi nombre es "+values.get("nombre")+".",values.get("email")?"Mi correo: "+values.get("email"):"","Tema: "+values.get("tema"),"",values.get("mensaje"),"","Gracias."].filter(x=>x!==null).join("\n");const subject="Consulta · "+values.get("tema");const a=document.getElementById("prepared-email");a.href="mailto:"+contactForm.dataset.email+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);a.hidden=false;setStatus("contact-status","Tu correo está preparado. Pulsa «Abrir mi correo» para revisarlo y enviarlo desde tu aplicación.");a.focus();});}


const taskForm=document.getElementById("task-form");
if(taskForm){const key="cristina-loor-entregas-v1";let tasks=[];let canStore=true;const list=document.getElementById("task-list");const rank={alta:0,media:1,baja:2};function safeTask(t){return t&&typeof t.id==="string"&&typeof t.titulo==="string"&&typeof t.pendiente==="string"&&typeof t.fecha==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(t.fecha)&&Object.hasOwn(rank,t.prioridad)&&typeof t.done==="boolean";}try{const saved=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(saved))tasks=saved.filter(safeTask);}catch(_){canStore=false;document.getElementById("storage-notice").textContent="Este navegador no permite recuperar las entregas guardadas. Puedes trabajar aquí y descargar tu checklist antes de cerrar.";}function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}function formatDate(value){const [y,m,d]=value.split("-").map(Number);return new Date(y,m-1,d,12).toLocaleDateString("es",{day:"numeric",month:"short",year:"numeric"});}function save(){try{localStorage.setItem(key,JSON.stringify(tasks));}catch(_){canStore=false;document.getElementById("storage-notice").textContent="Tus cambios están disponibles en esta sesión, pero este navegador no permite guardarlos. Descarga una copia antes de cerrar.";}}function sorted(){return [...tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.fecha.localeCompare(b.fecha)||rank[a.prioridad]-rank[b.prioridad]);}function render(){list.replaceChildren();for(const t of sorted()){const card=document.createElement("article");card.className="task-card"+(t.done?" is-done":"");const heading=document.createElement("h3");heading.textContent=t.titulo;const p=document.createElement("p");p.textContent=t.pendiente;const meta=document.createElement("div");meta.className="task-meta";const date=document.createElement("span");date.textContent=formatDate(t.fecha);const priority=document.createElement("span");priority.textContent="Prioridad "+t.prioridad;const status=document.createElement("span");status.textContent=t.done?"Completada":t.fecha<today()?"Vencida":t.fecha===today()?"Entrega hoy":"Pendiente";if(!t.done&&t.fecha<today())status.className="overdue";meta.append(date,priority,status);const actions=document.createElement("div");actions.className="task-actions";const label=document.createElement("label");label.className="check-label";const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.checked=t.done;checkbox.setAttribute("aria-label","Marcar como "+(t.done?"pendiente: ":"completada: ")+t.titulo);const span=document.createElement("span");span.textContent=t.done?"Completada":"Marcar completada";label.append(checkbox,span);checkbox.addEventListener("change",()=>{t.done=checkbox.checked;save();render();setStatus("task-status",t.done?"Entrega marcada como completada.":"Entrega marcada como pendiente.");});const remove=document.createElement("button");remove.type="button";remove.className="small-button";remove.textContent="Eliminar";remove.setAttribute("aria-label","Eliminar entrega: "+t.titulo);remove.addEventListener("click",()=>{tasks=tasks.filter(x=>x.id!==t.id);save();render();setStatus("task-status","Entrega eliminada del checklist.");});actions.append(label,remove);card.append(heading,p,meta,actions);list.append(card);}document.getElementById("task-empty").hidden=tasks.length>0;document.getElementById("stat-total").textContent=tasks.length;document.getElementById("stat-pending").textContent=tasks.filter(t=>!t.done).length;document.getElementById("stat-overdue").textContent=tasks.filter(t=>!t.done&&t.fecha<today()).length;document.getElementById("tasks-download").disabled=!tasks.length;document.getElementById("tasks-clear").disabled=!tasks.length;}taskForm.addEventListener("submit",e=>{e.preventDefault();trimForm(taskForm);if(!taskForm.reportValidity())return;const data=new FormData(taskForm);tasks.push({id:String(Date.now())+"-"+Math.random().toString(36).slice(2,8),titulo:String(data.get("titulo")).trim(),fecha:String(data.get("fecha")),prioridad:String(data.get("prioridad")),pendiente:String(data.get("pendiente")).trim(),done:false});save();render();taskForm.reset();setStatus("task-status",canStore?"Entrega añadida y guardada en este navegador.":"Entrega añadida. Descarga tu checklist para conservarlo.");document.getElementById("task-title").focus();});document.getElementById("tasks-download").addEventListener("click",()=>{const text="CRISTINA LOOR · MI CHECKLIST DE ENTREGAS\n"+new Date().toLocaleDateString("es")+"\n\n"+sorted().map(t=>(t.done?"[COMPLETADA] ":"[PENDIENTE] ")+t.titulo+"\nEntrega: "+formatDate(t.fecha)+"\nPrioridad: "+t.prioridad+"\nPróximo ajuste: "+t.pendiente).join("\n\n")+"\n\nContacto: cristinalb2009@hotmail.com\n";downloadText("mi-checklist-de-entregas.txt",text);});document.getElementById("tasks-clear").addEventListener("click",()=>{if(!tasks.length)return;if(window.confirm("¿Borrar todas las entregas de este checklist? Esta acción no se puede deshacer.")){tasks=[];save();render();setStatus("task-status","El checklist está vacío. Se han borrado todas las entregas.");}});render();}

/* Academic workbench: manual coherence matrix, browser-local drafts and accessible tabs. */
(() => {
  const tablist = document.getElementById("tool-tabs");
  if (tablist) {
    const tabs = [document.getElementById("tab-tasks"), document.getElementById("tab-matrix")];
    const panels = [document.getElementById("panel-tasks"), document.getElementById("panel-matrix")];
    function selectTab(index, focus) {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.setAttribute("tabindex", i === index ? "0" : "-1");
        panels[i].hidden = i !== index;
        panels[i].setAttribute("role", "tabpanel");
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(i, false));
      tab.addEventListener("keydown", event => {
        let next = i;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (i + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(next, true);
      });
    });
    tablist.hidden = false;
    selectTab(0, false);
  }

  const form = document.getElementById("matrix-form");
  if (!form) return;
  const key = "cristina-loor-matriz-v1";
  const schema = [
    ["question", "Pregunta de investigación"],
    ["objective", "Objetivo general"],
    ["method", "Método"],
    ["data", "Datos y fuentes"],
    ["results", "Resultados esperados"]
  ];
  const reviewLabels = [
    "La pregunta está delimitada y se puede investigar.",
    "El objetivo responde a la pregunta planteada.",
    "El método permite alcanzar el objetivo.",
    "Los datos previstos son pertinentes y accesibles.",
    "Los resultados esperados se relacionan con el objetivo."
  ];
  const fields = schema.map(([id]) => document.getElementById("matrix-" + id));
  const checks = reviewLabels.map((_, i) => document.getElementById("matrix-check-" + i));
  const result = document.getElementById("matrix-result");
  const summary = document.getElementById("matrix-summary");
  const storageNotice = document.getElementById("matrix-storage-notice");
  let storageAvailable = true;

  function data() {
    return { version: 1, fields: fields.map(field => field.value.trim()), reviewed: checks.map(check => check.checked) };
  }
  function updateReview() {
    const count = checks.filter(check => check.checked).length;
    setStatus("matrix-review-status", count + " de 5 puntos revisados por ti.");
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(data())); }
    catch (_) {
      storageAvailable = false;
      storageNotice.textContent = "Puedes trabajar durante esta sesión, pero el navegador no permite guardar la matriz. Descarga tu borrador antes de cerrar.";
    }
  }
  function render() {
    summary.replaceChildren();
    const draft = data();
    schema.forEach(([, label], i) => summary.append(resultLine(label, draft.fields[i] || "Por desarrollar.")));
  }
  function hasContent() {
    if (fields.some(field => field.value.trim())) return true;
    setStatus("matrix-status", "Escribe al menos una idea para preparar tu matriz.");
    fields[0].focus();
    return false;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved && saved.version === 1 && Array.isArray(saved.fields)) {
      fields.forEach((field, i) => { field.value = typeof saved.fields[i] === "string" ? saved.fields[i].slice(0, 4000) : ""; });
      checks.forEach((check, i) => { check.checked = Array.isArray(saved.reviewed) && saved.reviewed[i] === true; });
    }
  } catch (_) {
    storageNotice.textContent = "No se pudo recuperar un borrador anterior en este navegador. Puedes comenzar uno nuevo y descargarlo para conservarlo.";
  }
  fields.forEach(field => field.addEventListener("input", () => {
    checks.forEach(check => { check.checked = false; });
    updateReview();
    save();
    if (!result.hidden) render();
  }));
  checks.forEach(check => check.addEventListener("change", () => { updateReview(); save(); }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    trimForm(form);
    if (!form.reportValidity() || !hasContent()) return;
    save();
    render();
    result.hidden = false;
    setStatus("matrix-status", "Tu matriz está lista para leer en conjunto. " + (storageAvailable ? "El borrador se ha guardado en este navegador." : "Descarga una copia para conservarla."));
  });
  document.getElementById("matrix-download").addEventListener("click", () => {
    if (!hasContent()) return;
    save();
    const draft = data();
    const text = "CRISTINA LOOR · MI MATRIZ DE COHERENCIA\n" + new Date().toLocaleDateString("es") + "\n\n" +
      schema.map(([, label], i) => label.toUpperCase() + "\n" + (draft.fields[i] || "Por desarrollar.")).join("\n\n") +
      "\n\nMI REVISIÓN MANUAL\n" + reviewLabels.map((label, i) => (draft.reviewed[i] ? "[REVISADO POR MÍ] " : "[POR REVISAR] ") + label).join("\n") +
      "\n\nEsta matriz organiza mis respuestas. No constituye una evaluación automática de la coherencia metodológica.\nContacto: cristinalb2009@hotmail.com\n";
    downloadText("mi-matriz-de-coherencia.txt", text);
    setStatus("matrix-status", "Matriz preparada para descargar en TXT. Incluye tus respuestas y los puntos que marcaste como revisados.");
  });
  document.getElementById("matrix-clear").addEventListener("click", () => {
    if (!window.confirm("¿Borrar el contenido y la revisión de esta matriz? Tu checklist de entregas se conservará.")) return;
    fields.forEach(field => { field.value = ""; field.setCustomValidity(""); });
    checks.forEach(check => { check.checked = false; });
    result.hidden = true;
    summary.replaceChildren();
    save();
    updateReview();
    setStatus("matrix-status", "Se ha borrado la matriz. El checklist de entregas se conserva.");
    fields[0].focus();
  });
  updateReview();
})();

/* Invalidate prepared output when its source fields change. Nothing is sent automatically. */
(() => {
  const contact = document.getElementById("contact-form");
  if (contact) {
    const prepared = document.getElementById("prepared-email");
    const invalidate = () => {
      if (prepared.hidden) return;
      prepared.hidden = true;
      prepared.removeAttribute("href");
      setStatus("contact-status", "Has cambiado el mensaje. Vuelve a preparar el correo para incluir tus cambios.");
    };
    contact.querySelectorAll("input,textarea,select").forEach(field => {
      field.addEventListener("input", invalidate);
      field.addEventListener("change", invalidate);
    });
  }
  const tool = document.getElementById("focus-form") || document.getElementById("learning-form");
  if (!tool) return;
  const prefix = tool.id === "focus-form" ? "focus" : "learning";
  const result = document.getElementById(prefix + "-result");
  const empty = document.getElementById(prefix + "-empty");
  const invalidate = () => {
    if (result.hidden) return;
    result.hidden = true;
    empty.hidden = false;
    const send = document.getElementById("learning-send");
    if (send) send.removeAttribute("href");
    setStatus(prefix + "-status", "Has cambiado tus respuestas. Genera de nuevo el resultado para incluir tus cambios.");
  };
  tool.querySelectorAll("input,textarea,select").forEach(field => {
    field.addEventListener("input", invalidate);
    field.addEventListener("change", invalidate);
  });
})();
