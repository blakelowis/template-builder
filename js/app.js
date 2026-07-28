/* ═══════════════════════════════════════════════════════════════
   Birds Store Visit — Standalone PWA
   Full parity with Sales Hub Template Builder / Form Filler
   v2 — 3-panel editor, scoring attachment, rich summary, PDF
   ═══════════════════════════════════════════════════════════════ */
(function(){ 'use strict';

/* ─── Config ──────────────────────────────────────────── */
var TPL_KEY = 'sv_templates', VISIT_KEY = 'sv_visits';

/* ─── Store List ─────────────────────────────────────── */
var STORE_LIST = [
  'Albert Street','Alfreton','Allenton','Alvaston','Anstey','Arnold','Ashbourne','Ashby',
  'Bakery Shop','Beeston','Belper','Bingham','Borrowash','Branston Retail Park','Bulwell',
  'Burton Station Street','Chaddesden','Chellaston','Chilwell','Clifton','Coalville',
  'Crown Walk (Derbion)','Duffield','East Leake','Eastwood','Heanor','Hucknall','Ilkeston',
  'Keyworth','Lansdowne Drive','Lichfield','Lister Gate','Littleover','Long Eaton',
  'Loughborough','Mackworth','Mansfield','Mapperley','Matlock','Melbourne','Melton Road',
  'Mickleover','Newark','Oakwood','Park Farm','Radcliffe','Ripley','Ruddington','Sherwood',
  'Sinfin','Southwell','Spondon','Stretton','Sutton','Sutton Lakeside Point','Swadlincote',
  'Tamworth','Teal Park','Uttoxeter','Victoria Centre','West Bridgford','Wollaton'
];
function loadTemplates() { try { return JSON.parse(localStorage.getItem(TPL_KEY)) || []; } catch(e) { return []; } }
function saveTemplates(t) { localStorage.setItem(TPL_KEY, JSON.stringify(t)); }
function loadVisits() { try { return JSON.parse(localStorage.getItem(VISIT_KEY)) || []; } catch(e) { return []; } }
function saveVisits(v) { localStorage.setItem(VISIT_KEY, JSON.stringify(v)); }
function uid(prefix) { return (prefix || 'fld-') + Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function now() { return new Date().toISOString(); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){return d||'';} }
function fmtDateTime(d) { try { var dt=new Date(d); return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+' '+dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); } catch(e){return d||'';} }

/* ─── Edwardian Theme Constants ──────────────────────── */
var EDW = {
  sage:'#879d82', sageDark:'#60755f', sagePale:'#e8eee5',
  paper:'#faf9f5', ink:'#20231f', rule:'#d5ddd0', rose:'#a47772'
};

/* ─── Field & Scoring Definitions ────────────────────── */
var TPL_OBJECTS = [
  {type:'docheader',label:'Document Header',icon:'📋',desc:'Title + name, date, job title etc.'},
  {type:'section',  label:'Section',        icon:'■',  desc:'Section divider with name'},
  {type:'pagebreak', label:'Page Breaker',  icon:'—',  desc:'Visual page break'},
  {type:'signoff',  label:'Sign Off',       icon:'✎',  desc:'Signature, name & date block'}
];
var TPL_QUESTION_TYPES = [
  {type:'smalltext',  label:'Small Text',   icon:'Aa', desc:'Short single-line answer'},
  {type:'longtext',   label:'Long Text',    icon:'¶',  desc:'Multi-line text area'},
  {type:'number',     label:'Number',       icon:'#',  desc:'Numeric input'},
  {type:'date',       label:'Date',         icon:'📅', desc:'Date picker'},
  {type:'yesno',      label:'Yes / No',     icon:'✓',  desc:'Two-button toggle'},
  {type:'multichoice',label:'Multi-choice',  icon:'◉',  desc:'Single selection from options'},
  {type:'checkbox',   label:'Multi-Select', icon:'☑',  desc:'Tick multiple options'},
  {type:'table',      label:'Table',        icon:'▦',  desc:'Rows and columns data grid'},
  {type:'photo',      label:'Photo Upload', icon:'📷', desc:'Camera or file upload'},
  {type:'passfail',   label:'Pass / Fail',  icon:'✓',  desc:'Dedicated pass/fail toggle'},
  {type:'score',      label:'Score (1-5)',  icon:'★',  desc:'Star rating 1-5'},
  {type:'dropdown',   label:'Dropdown',     icon:'▼',  desc:'Select from options'},
  {type:'signature',  label:'Signature Pad', icon:'✎',  desc:'Canvas signature capture'}
];
var TPL_SCORING_TYPES = [
  {value:'none',      label:'No scoring',     icon:'',  desc:'No score applied'},
  {value:'rag',       label:'RAG Rating',     icon:'🚦', desc:'Red / Amber / Green'},
  {value:'score_1_10',label:'Score (1–10)',   icon:'★',  desc:'Numerical score 1-10'},
  {value:'passfail',  label:'Pass / Fail',    icon:'✓',  desc:'Pass or Fail'}
];

function _answerTypeMap(type) {
  var m = {
    docheader:'header', section:'section', pagebreak:'divider', signoff:'signoff',
    smalltext:'text', longtext:'textarea', number:'number', date:'date',
    yesno:'yesno', multichoice:'multichoice', checkbox:'checkbox',
    table:'table', photo:'image', passfail:'passfail', score:'score',
    dropdown:'dropdown', signature:'signature'
  };
  return m[type]||'text';
}
function _typeLabel(at) {
  var all = TPL_OBJECTS.concat(TPL_QUESTION_TYPES);
  var m = all.find(function(o){return o.type===at;});
  return m?m.label:at;
}
function _answerTypeLabel(at) {
  var m = {header:'Document Header', section:'Section', divider:'Page Breaker', signoff:'Sign Off',
    text:'Small Text', textarea:'Long Text', number:'Number', date:'Date',
    yesno:'Yes/No', multichoice:'Multi-choice', checkbox:'Multi-Select',
    table:'Table', image:'Photo Upload', passfail:'Pass/Fail',
    score:'Score (1-5)', dropdown:'Dropdown', signature:'Signature'};
  return m[at]||at;
}

/* ─── Navigation ─────────────────────────────────────── */
var _view = 'home', _bld = null, _fill = null;

function navigate(view, data) {
  _view = view;
  var b = document.body;
  b.classList.toggle('builder-view', view === 'builder');
  b.classList.toggle('fill-view', view === 'fill');
  b.classList.toggle('report-view', view === 'report');
  document.querySelectorAll('nav button').forEach(function(bn){bn.classList.toggle('active',bn.getAttribute('data-view')===view);});
  renderView(data);
}

function renderView(data) {
  var el = document.getElementById('app');
  switch(_view) {
    case 'home': return renderHome(el);
    case 'library': return renderLibrary(el);
    case 'builder': return renderBuilder(el);
    case 'fill': return renderFillPage(el,data);
    case 'report': return renderReportPage(el,data);
  }
}

/* ═══════════════════════════════════════════════════════════════
   HOME / LIBRARY
   ═══════════════════════════════════════════════════════════════ */
function renderHome(el) {
  var templates = loadTemplates(), visits = loadVisits();
  el.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin-bottom:16px">'+
    '<div class="sum-stat"><div class="sum-val" style="color:'+EDW.sage+'">'+templates.length+'</div><div class="sum-lbl">Templates</div></div>'+
    '<div class="sum-stat"><div class="sum-val">'+visits.length+'</div><div class="sum-lbl">Visits Done</div></div>'+
    '</div>'+
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:10px">'+
    '<h3 style="font-size:14px;font-weight:800">Templates</h3>'+
    '<div class="flex-row gap-2"><button onclick="App.builder()" class="btn btn-primary">+ New Form</button>'+
    '<button onclick="App.navigate(\'library\')" class="btn btn-secondary">📂 Library</button></div></div>'+
    (templates.length?templates.map(function(t){
      var fc=(t.fields||[]).length;
      var sc=t.fields?t.fields.filter(function(f){return f.scoringType&&f.scoringType!=='none';}).length:0;
      return '<div class="card card-accent" style="cursor:pointer" onclick="App.startFill(\''+t.id+'\')">'+
        '<div class="flex-row" style="justify-content:space-between">'+
        '<div><h3>'+esc(t.name)+'</h3><p class="text-xs text-muted">'+fc+' items'+(sc?' · '+sc+' scored':'')+'</p></div>'+
        '<div class="flex-row gap-2">'+
        '<button onclick="event.stopPropagation();App.editTpl(\''+t.id+'\')" class="btn btn-secondary btn-sm">Edit</button>'+
        '<button onclick="event.stopPropagation();App.exportTpl(\''+t.id+'\')" class="btn btn-secondary btn-sm">Export</button>'+
        '<button onclick="event.stopPropagation();App.delTpl(\''+t.id+'\')" class="btn btn-danger btn-sm">✕</button>'+
        '</div></div></div>';
    }).join(''):'<div class="empty-state"><div class="icon">📋</div><p>No templates yet.<br>Create one with the button above.</p></div>')+
    (visits.length?'<h3 style="margin:16px 0 10px;font-size:14px;font-weight:800">Recent Visits</h3>'+
      visits.slice(0,10).map(function(v){
        var t=templates.find(function(t){return t.id===v.templateId;});
        var s=getVisitStats(v);
        return '<div class="card" style="cursor:pointer;padding:14px 18px" onclick="App.report(\''+v.id+'\')">'+
          '<div class="flex-row" style="justify-content:space-between">'+
          '<div><h3 style="font-size:14px;margin:0">'+esc(v.storeName||'Unnamed')+'</h3>'+
          '<p class="text-xs text-muted">'+(t?esc(t.name):'Unknown')+' · '+fmtDate(v.date||v.createdAt)+'</p></div>'+
          '<div class="flex-row gap-2">'+
          (s.total?'<span class="badge badge-green">'+s.pass+'/'+s.total+'</span>':'')+
          (s.fail?'<span class="badge badge-red">'+s.fail+' Fail</span>':'')+
          (s.ragRed+s.ragAmber+s.ragGreen?'<span class="badge badge-amber">'+s.ragGreen+'G '+s.ragAmber+'A '+s.ragRed+'R</span>':'')+
          '<button onclick="event.stopPropagation();App.delVisit(\''+v.id+'\')" class="btn btn-danger btn-sm">✕</button>'+
          '</div></div></div>';
      }).join(''):'');
}

function renderLibrary(el) {
  var templates = loadTemplates();
  el.innerHTML =
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:16px">'+
    '<div><h3 style="font-size:16px;font-weight:800">Form Library</h3><p class="text-xs text-muted">'+templates.length+' forms</p></div>'+
    '<div class="flex-row gap-2">'+
    '<button onclick="App.builder()" class="btn btn-primary">+ New Form</button>'+
    '<button onclick="App.home()" class="btn btn-secondary">← Back</button></div></div>'+
    (templates.length?'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">'+
      templates.map(function(t){
        var fc=t.fields?t.fields.length:0;
        var sc=t.fields?t.fields.filter(function(f){return f.scoringType&&f.scoringType!=='none';}).length:0;
        var rc=t.fields?t.fields.filter(function(f){return f.scoringType==='rag';}).length:0;
        var pc=t.fields?t.fields.filter(function(f){return f.scoringType==='passfail';}).length:0;
        var sb='';
        if(sc)sb+='<span class="badge badge-amber" style="margin:2px">'+sc+' Scored</span>';
        if(rc)sb+='<span class="badge badge-red" style="margin:2px">'+rc+' RAG</span>';
        if(pc)sb+='<span class="badge badge-green" style="margin:2px">'+pc+' PF</span>';
        return '<div class="card" style="cursor:pointer;border-top:3px solid '+EDW.sage+'" onclick="App.startFill(\''+t.id+'\')">'+
          '<div class="flex-row" style="justify-content:space-between;margin-bottom:6px">'+
          '<h3>'+esc(t.name)+'</h3></div>'+
          '<p class="text-xs text-muted mb-2">'+(t.description||'')+'</p>'+
          '<div class="flex-row flex-wrap" style="gap:4px;margin-bottom:8px">'+
          '<span class="badge badge-blue">'+fc+' items</span>'+sb+'</div>'+
          '<div class="flex-row" style="gap:6px">'+
          '<button onclick="event.stopPropagation();App.startFill(\''+t.id+'\')" class="btn btn-primary btn-sm">▶ Fill</button>'+
        '<button onclick="event.stopPropagation();App.editTpl(\''+t.id+'\')" class="btn btn-secondary btn-sm">Edit</button>'+
        '<button onclick="event.stopPropagation();App.exportTpl(\''+t.id+'\')" class="btn btn-secondary btn-sm">Export</button>'+
        '<button onclick="event.stopPropagation();App.delTpl(\''+t.id+'\')" class="btn btn-danger btn-sm">✕</button>'+
        '</div></div>';
      }).join('')+'</div>':'<div class="empty-state"><div class="icon">📋</div><p>No forms yet. Click + New Form to create one.</p></div>');
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE BUILDER — 3-panel editor
   ═══════════════════════════════════════════════════════════════ */
function renderBuilder(el) {
  if(!_bld) {
    var existing=null;
    if(arguments[1]&&arguments[1].templateId) {
      var all=loadTemplates();
      existing=all.find(function(t){return t.id===arguments[1].templateId;});
    }
    _bld={
      tmpl:existing||{id:uid('FTPL-'),name:'',description:'',fields:[],createdAt:now()},
      sel:-1,preview:false,dragIdx:-1,undoStack:[]
    };
    if(!existing)_bld.tmpl.fields.push({
      id:uid('hdr-'),label:'Store Visit Report',answerType:'header',scoringType:'none',subLabel:'',
      headerConfig:{showName:true,showJobTitle:true,showDate:true,showStore:true,showDocRef:true,showDocId:false,showLogo:true,showTraining:false,defaultJobTitle:'Area Manager'}
    });
  }
  _bldRender();
}

function _bldRender() {
  var b=_bld, tmpl=b.tmpl, el=document.getElementById('app');
  var isNew=!b.isExisting;

  /* Canvas */
  var canvasHtml='';
  if(b.preview) canvasHtml=_bldPreviewHtml(tmpl);
  else if(!tmpl.fields.length) canvasHtml='<div class="empty-state" style="padding:40px"><div class="icon">📝</div><p class="text-muted">No questions yet — click a type on the left</p></div>';
  else canvasHtml=tmpl.fields.map(function(f,i){
    var active=b.sel===i;
    var at=f.answerType||'text';
    var tl=_answerTypeLabel(at);
    var sb='';
    if(f.scoringType&&f.scoringType!=='none'){var st=TPL_SCORING_TYPES.find(function(s){return s.value===f.scoringType;});sb='<span class="scored-badge">'+(st?st.icon+' '+st.label:'Scored')+'</span>';}
    var preview=_bldFieldPreview(f);
    return '<div class="bld-field'+(active?' bld-field-active':'')+'" '+
      'onclick="App.bldSelect('+i+')" '+
      'draggable="true" ondragstart="App.bldDragStart(event,'+i+')" ondragover="event.preventDefault()" ondrop="App.bldDrop(event,'+i+')" ondragend="App.bldDragEnd()">'+
      '<div class="bld-field-left"><span class="bld-drag" title="Drag">⠿</span>'+
      '<button onclick="event.stopPropagation();App.bldMove('+i+',-1)" class="bld-move">▲</button>'+
      '<button onclick="event.stopPropagation();App.bldMove('+i+',1)" class="bld-move">▼</button></div>'+
      '<div class="bld-field-body">'+
      '<div class="bld-field-hdr">'+
      '<span class="bld-qnum">'+(['header','section','divider','signoff'].indexOf(at)===-1?'Q'+(i+1):'')+'</span>'+
      '<span class="bld-field-label">'+esc(f.label||_typeLabel(at))+'</span>'+sb+
      '<span class="bld-field-type">'+tl+'</span></div>'+preview+'</div>'+
      '<button onclick="event.stopPropagation();App.bldRemove('+i+')" class="bld-remove">✕</button></div>';
  }).join('');

  /* Properties */
  var propsHtml='';
  if(b.sel>=0&&tmpl.fields[b.sel]&&!b.preview) propsHtml=_bldProps(tmpl.fields[b.sel]);

  el.innerHTML=
    '<div class="bld-topbar">'+
    '<button onclick="App.cancelBuilder()" class="btn btn-secondary btn-sm">← Library</button>'+
    '<input id="bld-name" value="'+esc(tmpl.name)+'" placeholder="Form name" class="bld-input" onchange="App.bldUpdateMeta()">'+
    '<input id="bld-desc" value="'+esc(tmpl.description||'')+'" placeholder="Description" class="bld-input bld-input-wide" onchange="App.bldUpdateMeta()">'+
    '<span class="bld-count">'+tmpl.fields.length+' items</span>'+
    '<button onclick="App.bldTogglePreview()" class="btn '+(b.preview?'btn-primary':'btn-secondary')+' btn-sm">'+(b.preview?'← Edit':'Preview')+'</button>'+
    '<button onclick="App.bldExport()" class="btn btn-secondary btn-sm">Export JSON</button>'+
    '<button onclick="App.bldSave(false)" class="btn btn-secondary btn-sm">Save & Stay</button>'+
    '<button onclick="App.bldSave(true)" class="btn btn-primary btn-sm">Save & Exit</button>'+
    '</div>'+
    '<div class="bld-main">'+
    (!b.preview?'<div class="bld-sidebar">'+
      '<div class="bld-sidebar-group"><div class="bld-sidebar-title">Sections</div>'+
      TPL_OBJECTS.map(function(o){return '<button onclick="App.bldAdd(\''+o.type+'\')" class="bld-sidebar-btn">'+o.icon+' '+o.label+'</button>';}).join('')+
      '</div><div class="bld-sidebar-group"><div class="bld-sidebar-title">Add a Question</div>'+
      TPL_QUESTION_TYPES.map(function(q){return '<button onclick="App.bldAdd(\''+q.type+'\')" class="bld-sidebar-btn">'+q.icon+' '+q.label+'</button>';}).join('')+
      '</div></div>':'')+
    '<div id="bld-canvas" class="bld-canvas"'+
    (!b.preview?' ondragover="event.preventDefault()" ondrop="App.bldCanvasDrop(event)"':'')+
    '><div class="bld-canvas-inner">'+canvasHtml+'</div></div>'+
    (!b.preview?'<div class="bld-props">'+
      '<div class="bld-props-title">Properties</div>'+propsHtml+'</div>':'')+
    '</div>';
}

function _bldFieldPreview(f) {
  var at=f.answerType||'text';
  if(at==='header'){
    var hc=f.headerConfig||{};
    var h='<div class="bld-preview-hdr"><h4>'+esc(f.label||'Header')+'</h4>';
    if(f.subLabel)h+='<p class="text-xs text-muted">'+esc(f.subLabel)+'</p>';
    var tags=[];
    if(hc.showName)tags.push('Store Mgr');if(hc.showStore)tags.push('Store');
    tags.push('Auditor');if(hc.showJobTitle)tags.push('Title');if(hc.showDate)tags.push('Date');
    if(hc.showDocRef)tags.push('Ref');if(hc.showDocId)tags.push('ID');if(hc.showLogo)tags.push('Logo');
    if(hc.showTraining)tags.push('Training');
    if(tags.length)h+='<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">'+tags.map(function(t){return'<span class="bld-tag">'+t+'</span>';}).join('')+'</div>';
    h+='</div>';return h;
  }
  if(at==='section') return '<div class="bld-preview-section"><h4>'+esc(f.label||'Section')+'</h4></div>';
  if(at==='divider') return '<hr class="bld-preview-hr">';
  if(at==='signoff') return '<div class="bld-preview-sig">Block: '+esc(f.signoffRole||'Manager')+'</div>';
  if(at==='text') return '<div class="bld-preview-input">Text answer...</div>';
  if(at==='textarea') return '<div class="bld-preview-input bld-preview-textarea">Long text...</div>';
  if(at==='number') return '<div class="bld-preview-input"># Number...</div>';
  if(at==='date') return '<div class="bld-preview-input">📅 Date picker...</div>';
  if(at==='yesno') return '<div class="bld-preview-yn"><span class="bld-yn-pill">Yes</span><span class="bld-yn-pill">No</span></div>';
  if(at==='multichoice'){
    var mc=(f.options||[]).slice(0,3).map(function(o){return'<span class="bld-opt-pill">'+esc(o)+'</span>';}).join('');
    return '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">'+(mc||'<span class="text-muted text-xs">No options</span>')+'</div>';
  }
  if(at==='checkbox'){
    var cb=(f.options||[]).slice(0,3).map(function(o){return'<span class="bld-opt-pill">'+esc(o)+'</span>';}).join('');
    return cb?'<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">'+cb+'</div>':'<span class="text-muted text-xs">No options</span>';
  }
  if(at==='image'||at==='photo') return '<div class="bld-preview-photo">📷 Photo upload</div>';
  if(at==='passfail') return '<div class="bld-preview-yn"><span class="bld-yn-pill" style="background:#dcfce7">Pass</span><span class="bld-yn-pill" style="background:#fee2e2">Fail</span></div>';
  if(at==='score') return '<div class="bld-preview-yn">'+[1,2,3,4,5].map(function(s){return'<span class="bld-yn-pill">'+s+'</span>';}).join('')+'</div>';
  if(at==='dropdown'){
    var dop=(f.options||[]).slice(0,2).map(function(o){return esc(o);}).join(', ');
    return '<div class="text-xs text-muted" style="margin-top:4px">▼ '+(dop||'No options')+'</div>';
  }
  if(at==='signature') return '<div class="bld-preview-sig">✎ Signature pad</div>';
  if(at==='table'){
    var rows=f.tableRows||3, cols=f.tableCols||3;
    var hdrs='<th class="bld-tbl-th">'+esc(f.tableRowHeaderLabel||'Item')+'</th>'+(f.tableHeaders||[]).slice(0,cols).map(function(h){return'<th class="bld-tbl-th">'+esc(h)+'</th>';}).join('');
    var cells='';
    for(var r=0;r<Math.min(rows,2);r++){
      var lbl=(f.tableRowHeaders||[])[r]?'<th class="bld-tbl-th" style="text-align:left;background:'+EDW.paper+'">'+esc((f.tableRowHeaders||[])[r])+'</th>':'';
      cells+='<tr>'+lbl+Array(cols).fill('<td class="bld-tbl-td">...</td>').join('')+'</tr>';
    }
    return '<div class="bld-table-preview"><table class="bld-table"><thead><tr>'+hdrs+'</tr></thead><tbody>'+cells+'</tbody></table></div>';
  }
  return '';
}

function _bldProps(f) {
  var at=f.answerType||'text';
  var html='<div class="bld-props-inner">';

  if(at!=='divider'&&at!=='signoff'){
    html+='<div class="bld-prop-group"><label>Question Text</label>'+
      '<textarea id="prop-label" class="bld-prop-input bld-prop-textarea" oninput="App.bldUpdateField(true)">'+esc(f.label||'')+'</textarea></div>';
  }

  if(at==='header'){
    var hc=f.headerConfig||{};
    html+='<div class="bld-prop-group"><label>Subtitle</label><input id="prop-sublabel" value="'+esc(f.subLabel||'')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div>';
    html+='<div class="bld-prop-box"><div style="font-size:10px;font-weight:800;text-transform:uppercase;color:'+EDW.sageDark+';margin-bottom:6px">Header Fields</div>';
    [['showName','👤 Name'],['showJobTitle','📋 Job Title'],['showDate','📅 Date'],['showStore','🏪 Store'],
     ['showDocRef','📄 Doc Ref'],['showDocId','🔑 Doc ID'],['showLogo','🖼 Logo'],['showTraining','🎓 Training']].forEach(function(hf){
      html+='<label class="bld-check"><input type="checkbox" class="prop-hdr" data-key="'+hf[0]+'" '+(hc[hf[0]]?'checked':'')+' onchange="App.bldUpdateField()"> '+hf[1]+'</label>';
    });
    html+='<div style="margin-top:6px"><label style="font-size:10px;font-weight:700;color:'+EDW.sageDark+'">Default Job Title</label>'+
      '<input id="prop-hdr-job" value="'+esc(hc.defaultJobTitle||'Area Manager')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div></div>';
  }

  if(at==='signoff'){
    html+='<div class="bld-prop-group"><label>Role Name</label><input id="prop-signoff-role" value="'+esc(f.signoffRole||'Manager')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div>';
  }

  if(at==='number'){
    html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'+
      '<div><label>Min</label><input id="prop-num-min" type="number" value="'+(f.numberMin!==undefined?f.numberMin:'')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div>'+
      '<div><label>Max</label><input id="prop-num-max" type="number" value="'+(f.numberMax!==undefined?f.numberMax:'')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div>'+
      '<div><label>Step</label><input id="prop-num-step" type="number" value="'+(f.numberStep||'1')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div></div>';
  }

  if(at==='multichoice'||at==='checkbox'){
    html+='<div class="bld-prop-group"><label>Options (one per line)</label>'+
      '<textarea id="prop-options" class="bld-prop-input bld-prop-textarea" oninput="App.bldUpdateField(true)">'+esc((f.options||[]).join('\n'))+'</textarea></div>';
  }

  if(at==='table'){
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'+
      '<div><label>Cols</label><input id="prop-tbl-cols" type="number" value="'+(f.tableCols||3)+'" min="1" max="10" class="bld-prop-input" onchange="App.bldUpdateField()"></div>'+
      '<div><label>Rows</label><input id="prop-tbl-rows" type="number" value="'+(f.tableRows||3)+'" min="1" max="20" class="bld-prop-input" onchange="App.bldUpdateField()"></div></div>';
    html+='<div class="bld-prop-group"><label>Row Header Label</label><input id="prop-tbl-rhl" value="'+esc(f.tableRowHeaderLabel||'Item')+'" class="bld-prop-input" onchange="App.bldUpdateField()"></div>';
    html+='<div class="bld-prop-group"><label>Column Headers (one/line)</label><textarea id="prop-tbl-hdrs" class="bld-prop-input bld-prop-textarea" onchange="App.bldUpdateField()">'+esc((f.tableHeaders||[]).join('\n'))+'</textarea></div>';
    html+='<div class="bld-prop-group"><label>Row Labels (one/line)</label><textarea id="prop-tbl-rows-lbl" class="bld-prop-input bld-prop-textarea" onchange="App.bldUpdateField()">'+esc((f.tableRowHeaders||[]).join('\n'))+'</textarea></div>';
    if(f.scoringType&&f.scoringType!=='none'){
      html+='<div class="bld-prop-box" style="background:#fef3c7;border-color:#f59e0b">';
      html+='<div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#92400e;margin-bottom:6px">Score These Rows</div>';
      for(var tr=0;tr<(f.tableRows||3);tr++){
        var rl=(f.tableRowHeaders||[])[tr]||'Row '+(tr+1);
        html+='<label class="bld-check"><input type="checkbox" class="prop-tbl-scored-row" data-row="'+tr+'" '+((f.tableScoredRows||[]).indexOf(tr)!==-1?'checked':'')+' onchange="App.bldUpdateField()"> '+esc(rl)+'</label>';
      }
      html+='</div>';
    }
  }

  if(at==='dropdown'){
    html+='<div class="bld-prop-group"><label>Options (one per line)</label>'+
      '<textarea id="prop-options" class="bld-prop-input bld-prop-textarea" oninput="App.bldUpdateField(true)">'+esc((f.options||[]).join('\n'))+'</textarea></div>';
  }

  /* Scoring attachment */
  if(at!=='header'&&at!=='section'&&at!=='divider'&&at!=='signoff'){
    html+='<div class="bld-prop-box" style="background:#fef3c7;border-color:#f59e0b">'+
      '<div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#92400e;margin-bottom:6px">Score This Question?</div>'+
      '<p style="font-size:10px;color:#b45309;margin-bottom:6px">Add scoring so this counts towards the total.</p>';
    TPL_SCORING_TYPES.forEach(function(st){
      html+='<label class="bld-check"><input type="radio" name="prop-scoring" value="'+st.value+'" '+((f.scoringType||'none')===st.value?'checked':'')+' onchange="App.bldUpdateField()">'+
        (st.icon?st.icon+' ':'')+st.label+'</label>';
    });
    html+='</div>';
    if(f.scoringType&&f.scoringType!=='none'){
      html+='<div class="bld-prop-box" style="background:#fef3c7;border-color:#f59e0b">'+
        '<div style="font-size:10px;font-weight:800;color:#92400e;margin-bottom:4px">Importance (weight)</div>'+
        '<p style="font-size:9px;color:#b45309;margin-bottom:4px">1=normal, 2=double, 0.5=half</p>'+
        '<input id="prop-weight" type="number" value="'+(f.scoreWeight||1)+'" min="0.1" max="10" step="0.5" class="bld-prop-input" onchange="App.bldUpdateField()"></div>';
    }
  }

  if(at!=='divider'&&at!=='pagebreak'){
    html+='<div class="bld-prop-box"><label class="bld-check"><input type="checkbox" id="prop-required" '+(f.required?'checked':'')+' onchange="App.bldUpdateField()"> Required field</label></div>';
  }

  html+='</div>';
  return html;
}

/* ─── Builder Actions ─────────────────────────────────── */
function _bldAdd(type) {
  var f = {id:uid('field-'),label:'',answerType:_answerTypeMap(type),scoringType:'none',required:false,scoreWeight:1};
  switch(type){
    case 'docheader':
      f.label='Document Header';f.answerType='header';
      f.headerConfig={showName:true,showJobTitle:true,showDate:true,showStore:true,showDocRef:true,showDocId:false,showLogo:true,showTraining:false,defaultJobTitle:'Area Manager'};
      break;
    case 'section':f.label='Section';break;
    case 'signoff':f.label='';f.signoffRole='Manager';break;
    case 'smalltext':f.label='Text Question';break;
    case 'longtext':f.label='Long Text Question';break;
    case 'number':f.label='Number Question';break;
    case 'date':f.label='Date';break;
    case 'yesno':f.label='Yes / No Question';break;
    case 'multichoice':f.label='Choose one';f.options=['Option 1','Option 2','Option 3'];break;
    case 'checkbox':f.label='Select all that apply';f.options=['Option 1','Option 2'];break;
    case 'table':f.label='Table';f.tableCols=2;f.tableRows=3;f.tableHeaders=['Col 1','Col 2'];f.tableRowHeaders=['Row 1','Row 2','Row 3'];f.tableRowHeaderLabel='Item';f.tableScoredRows=[];f.tableScoredCols=[];break;
    case 'photo':f.label='Photo';break;
    case 'passfail':f.label='Pass / Fail';f.answerType='passfail';break;
    case 'score':f.label='Score';f.maxScore=5;break;
    case 'dropdown':f.label='Select';f.options=['Option 1','Option 2'];break;
    case 'signature':f.label='Signature';f.answerType='signature';break;
  }
  _bld.tmpl.fields.push(f);
  _bld.sel=_bld.tmpl.fields.length-1;
  _bldRender();
}

function _bldSelect(i){_bld.sel=i;_bldRender();}

function _bldMove(i,dir){
  var f=_bld.tmpl.fields;var ni=i+dir;
  if(ni<0||ni>=f.length)return;
  var t=f[i];f[i]=f[ni];f[ni]=t;
  _bld.sel=ni;_bldRender();
}

function _bldRemove(i){
  if(!confirm('Remove this field?'))return;
  _bld.tmpl.fields.splice(i,1);
  _bld.sel=Math.min(i,_bld.tmpl.fields.length-1);
  _bldRender();
}

function _bldUpdateField(staySelected) {
  var b=_bld;if(!b||b.sel<0)return;
  var f=b.tmpl.fields[b.sel];
  var lbl=document.getElementById('prop-label');
  if(lbl)f.label=lbl.value;

  if(f.answerType==='header'){
    var sub=document.getElementById('prop-sublabel');if(sub)f.subLabel=sub.value;
    var job=document.getElementById('prop-hdr-job');if(job){if(!f.headerConfig)f.headerConfig={};f.headerConfig.defaultJobTitle=job.value;}
    document.querySelectorAll('.prop-hdr').forEach(function(cb){
      if(!f.headerConfig)f.headerConfig={};
      f.headerConfig[cb.getAttribute('data-key')]=cb.checked;
    });
  }

  if(f.answerType==='signoff'){
    var sr=document.getElementById('prop-signoff-role');if(sr)f.signoffRole=sr.value;
  }

  if(f.answerType==='number'){
    var nmn=document.getElementById('prop-num-min');if(nmn)f.numberMin=nmn.value?parseFloat(nmn.value):undefined;
    var nmx=document.getElementById('prop-num-max');if(nmx)f.numberMax=nmx.value?parseFloat(nmx.value):undefined;
    var nst=document.getElementById('prop-num-step');if(nst)f.numberStep=parseFloat(nst.value)||1;
  }

  if(f.answerType==='multichoice'||f.answerType==='checkbox'||f.answerType==='dropdown'){
    var opts=document.getElementById('prop-options');if(opts)f.options=opts.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);
  }

  if(f.answerType==='table'){
    var tc=document.getElementById('prop-tbl-cols');if(tc){f.tableCols=parseInt(tc.value)||3;tc.value=f.tableCols;}
    var tr=document.getElementById('prop-tbl-rows');if(tr){f.tableRows=parseInt(tr.value)||3;tr.value=f.tableRows;}
    var rhl=document.getElementById('prop-tbl-rhl');if(rhl)f.tableRowHeaderLabel=rhl.value;
    var th=document.getElementById('prop-tbl-hdrs');if(th)f.tableHeaders=th.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);
    var rl=document.getElementById('prop-tbl-rows-lbl');if(rl)f.tableRowHeaders=rl.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);
    f.tableScoredRows=[];
    document.querySelectorAll('.prop-tbl-scored-row').forEach(function(cb){if(cb.checked)f.tableScoredRows.push(parseInt(cb.getAttribute('data-row')));});
  }

  /* Scoring */
  var sc=document.querySelector('input[name="prop-scoring"]:checked');
  if(sc)f.scoringType=sc.value;
  var wt=document.getElementById('prop-weight');
  if(wt)f.scoreWeight=parseFloat(wt.value)||1;

  var rq=document.getElementById('prop-required');
  if(rq)f.required=rq.checked;

  if(staySelected) return; /* typing — don't re-render, would destroy focus */
  _bldRender();
}

function _bldTogglePreview(){_bld.preview=!_bld.preview;_bld.sel=-1;_bldRender();}

function _bldPreviewHtml(tmpl){
  return tmpl.fields.map(function(f){
    var at=f.answerType||'text';
    if(at==='header') return '<div class="card" style="text-align:center;background:'+EDW.paper+';border:1px solid '+EDW.rule+'"><h3 style="color:'+EDW.sageDark+'">'+esc(f.label||'Header')+'</h3></div>';
    if(at==='section') return '<div style="font-size:14px;font-weight:800;color:'+EDW.sageDark+';border-bottom:2px solid '+EDW.sagePale+';margin:16px 0 8px;padding-bottom:4px">'+esc(f.label||'Section')+'</div>';
    if(at==='divider') return '<hr style="border:0;border-top:1px dashed '+EDW.rule+';margin:16px 0">';
    if(at==='signoff') return '<div class="bld-preview-sig-block">Sign-off: '+esc(f.signoffRole||'Manager')+'</div>';
    return '<div class="card" style="padding:12px;font-size:13px"><strong>'+esc(f.label||'Question')+'</strong>'+
    (f.required?' <span style="color:'+EDW.rose+'">*</span>':'')+
    '<div style="color:#6b7280;font-size:11px;margin-top:4px">['+_answerTypeLabel(at)+']</div></div>';
  }).join('');
}

function _bldDragStart(e,i){_bld.dragIdx=i;e.dataTransfer.effectAllowed='move';}
function _bldDrop(e,i){if(_bld.dragIdx<0)return;var f=_bld.tmpl.fields;var t=f[_bld.dragIdx];f.splice(_bld.dragIdx,1);f.splice(i,0,t);_bld.sel=i;_bld.dragIdx=-1;_bldRender();}
function _bldDragEnd(){_bld.dragIdx=-1;}
function _bldCanvasDrop(e){if(_bld.dragIdx<0)return;var f=_bld.tmpl.fields;var t=f[_bld.dragIdx];f.splice(_bld.dragIdx,1);f.push(t);_bld.sel=f.length-1;_bld.dragIdx=-1;_bldRender();}
function _bldUpdateMeta(){if(!_bld)return;var n=document.getElementById('bld-name');if(n)_bld.tmpl.name=n.value;var d=document.getElementById('bld-desc');if(d)_bld.tmpl.description=d.value;}

function _bldSave(exit){
  if(!_bld)return;
  _bldUpdateMeta();
  if(!_bld.tmpl.name.trim()){toast('Enter a form name','error');return;}
  var templates=loadTemplates();
  var idx=templates.findIndex(function(t){return t.id===_bld.tmpl.id;});
  if(idx>=0)templates[idx]=_bld.tmpl;else templates.push(_bld.tmpl);
  saveTemplates(templates);
  toast('Form saved!');
  if(exit){_bld=null;navigate('home');}
}

function _bldExport(){
  if(!_bld)return; _bldUpdateMeta();
  var blob=new Blob([JSON.stringify(_bld.tmpl,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=(_bld.tmpl.name||'template').replace(/\s+/g,'_')+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);toast('Template exported!');
}

function exportTpl(id){
  var all=loadTemplates();var t=all.find(function(t){return t.id===id;});
  if(!t)return;
  var blob=new Blob([JSON.stringify(t,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=(t.name||'template').replace(/\s+/g,'_')+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);toast('Template exported!');
}

function _upload(){
  var el=document.getElementById('app');
  el.innerHTML=
    '<div class="card card-accent">'+
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:12px">'+
    '<h3>Import Template</h3>'+
    '<button onclick="App.home()" class="btn btn-secondary btn-sm">← Back</button></div>'+
    '<p class="text-sm text-muted mb-2">Select a JSON template file exported from the Form Builder.</p>'+
    '<input type="file" id="import-file" accept=".json" style="margin-bottom:12px" onchange="App.importFile(event)">'+
    '<div id="import-preview"></div></div>';
}

function _importFile(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var t=JSON.parse(ev.target.result);
      if(!t.fields||!Array.isArray(t.fields)){toast('Invalid template file','error');return;}
      t.id=t.id||uid('FTPL-');
      if(!t.createdAt)t.createdAt=now();
      if(!t.name)t.name='Imported Template';
      var templates=loadTemplates();
      templates.push(t);
      saveTemplates(templates);
      document.getElementById('import-preview').innerHTML=
        '<div class="card" style="border-top:3px solid '+EDW.sage+';margin-top:12px">'+
        '<h3>'+esc(t.name)+'</h3>'+
        '<p class="text-xs text-muted">'+(t.description||'')+'</p>'+
        '<p class="text-xs text-muted">'+(t.fields||[]).length+' items</p>'+
        '<button onclick="App.startFill(\''+t.id+'\')" class="btn btn-primary btn-sm" style="margin-top:8px">▶ Open & Fill</button></div>';
      toast('Template imported!');
    }catch(err){toast('Failed to parse file','error');}
  };
  reader.readAsText(file);
}

function cancelBuilder(){_bld=null;navigate('home');}
function editTpl(id){
  var all=loadTemplates();var t=all.find(function(t){return t.id===id;});
  if(!t)return;
  _bld={tmpl:JSON.parse(JSON.stringify(t)),sel:-1,preview:false,dragIdx:-1,isExisting:true};
  navigate('builder');
}
function delTpl(id){if(!confirm('Delete this template?'))return;saveTemplates(loadTemplates().filter(function(t){return t.id!==id;}));toast('Deleted');navigate('home');}

/* ═══════════════════════════════════════════════════════════════
   FORM FILLER
   ═══════════════════════════════════════════════════════════════ */
function renderFillPage(el,data){
  var tid=(data&&data.templateId)||(_fill&&_fill.templateId);
  if(!tid){navigate('home');return;}
  var templates=loadTemplates();
  var tpl=templates.find(function(t){return t.id===tid;});
  if(!tpl){toast('Template not found','error');navigate('home');return;}

  if(!_fill)_fill={id:uid('VIS-'),templateId:tpl.id,templateName:tpl.name,storeName:'',auditor:'',date:now().slice(0,10),values:{}};

  var fieldsHtml=tpl.fields.map(function(f){return _fillField(f);}).join('');

  el.innerHTML=
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
    '<button onclick="App.cancelFill()" class="btn btn-secondary btn-sm">← Back</button>'+
    '<datalist id="store-list">'+STORE_LIST.map(function(s){return '<option value="'+esc(s)+'">';}).join('')+'</datalist>'+
    '</div>'+
    '<div class="card">'+fieldsHtml+'</div>'+
    '<div style="display:flex;gap:10px;margin-top:12px">'+
    '<button onclick="App.fillSave()" class="btn btn-primary" style="flex:1">💾 Save Visit</button></div>';

  tpl.fields.forEach(function(f){
    if(f.answerType==='signature'||f.answerType==='signoff')_initSig(f.id);
  });
}

function _fillField(f){
  var at=f.answerType||'text', fid=f.id, val=_fill.values[fid];

  if(at==='header'){
    var hc=f.headerConfig||{};
    var h='<div class="fill-hdr">';
    h+='<h2 class="fill-hdr-title">'+esc(f.label||'Document')+'</h2>';
    if(f.subLabel)h+='<p class="fill-hdr-sub">'+esc(f.subLabel)+'</p>';
    var items=[];
    if(hc.showName)items.push({label:'Store Manager',key:fid+'_name',val:_fill.values[fid+'_name']||''});
    if(hc.showStore)items.push({label:'Store',key:fid+'_store',val:_fill.values[fid+'_store']||_fill.storeName||''});
    items.push({label:'Auditor',key:fid+'_auditor',val:_fill.values[fid+'_auditor']||_fill.auditor||''});
    if(hc.showJobTitle)items.push({label:'Job Title',key:fid+'_jt',val:_fill.values[fid+'_jt']||hc.defaultJobTitle||'Area Manager'});
    if(hc.showDate)items.push({label:'Date',key:fid+'_date',val:_fill.values[fid+'_date']||_fill.date||''});
    if(hc.showDocRef)items.push({label:'Doc Ref',key:fid+'_ref',val:_fill.values[fid+'_ref']||_fill.docRef||''});
    if(items.length)h+='<div class="fill-hdr-grid">'+items.map(function(i){
      if(i.label==='Store') return '<div><label class="field-label">Store</label><input list="store-list" value="'+esc(i.val)+'" class="fill-input" onchange="App.fill.hdrVal(\''+i.key+'\',this.value)" placeholder="Select or type store..."></div>';
      return '<div><label class="field-label">'+i.label+'</label><input value="'+esc(i.val)+'" class="fill-input" onchange="App.fill.hdrVal(\''+i.key+'\',this.value)"></div>';
    }).join('')+'</div>';
    h+='</div>';return h;
  }

  if(at==='section') return '<div class="fill-section">'+esc(f.label||'Section')+'</div>';
  if(at==='divider') return '<hr class="fill-hr">';
  if(at==='signoff'){
    var sv=val||'';
    return '<div class="fill-signoff"><div class="fill-signoff-role">'+esc(f.signoffRole||'Signer')+'</div>'+
      '<canvas class="sig-pad" id="sig_'+fid+'"></canvas>'+
      '<div class="sig-actions"><button onclick="App.sigClear(\''+fid+'\')" class="btn btn-secondary btn-sm">Clear</button>'+
      '<button onclick="App.sigSave(\''+fid+'\')" class="btn btn-primary btn-sm">Save</button></div>'+
      (sv?'<p style="color:'+EDW.sageDark+';font-size:11px;margin-top:4px">✓ Signed</p>':'')+'</div>';
  }

  var rh=f.required?' <span style="color:'+EDW.rose+'">*</span>':'';
  var base='<div class="fill-field"><label class="field-label">'+esc(f.label||'')+rh+'</label>';

  switch(at){
    case 'text':
      return base+'<input type="text" data-fid="'+fid+'" value="'+esc(val||'')+'" class="fill-input" onchange="App.fill.set(fid,this.value)">'+_fillScoring(f)+'</div>';
    case 'textarea':
      return base+'<textarea data-fid="'+fid+'" class="fill-textarea" onchange="App.fill.set(\''+fid+'\',this.value)">'+esc(val||'')+'</textarea>'+_fillScoring(f)+'</div>';
    case 'number':
      return base+'<input type="number" data-fid="'+fid+'" value="'+esc(val||'')+'" class="fill-input"'+
        (f.numberMin!==undefined?' min="'+f.numberMin+'"':'')+(f.numberMax!==undefined?' max="'+f.numberMax+'"':'')+
        ' onchange="App.fill.set(\''+fid+'\',this.value)"></div>';
    case 'date':
      return base+'<input type="date" data-fid="'+fid+'" value="'+esc(val||'')+'" class="fill-input" onchange="App.fill.set(\''+fid+'\',this.value)"></div>';
    case 'yesno':{
      var ynv=val||'';
      return base+'<div class="fill-yn"><button onclick="App.fill.set(\''+fid+'\',\'Yes\');App.renderFill()" class="fill-yn-btn'+(ynv==='Yes'?' yn-active yn-yes':'')+'">✓ Yes</button>'+
        '<button onclick="App.fill.set(\''+fid+'\',\'No\');App.renderFill()" class="fill-yn-btn'+(ynv==='No'?' yn-active yn-no':'')+'">✕ No</button></div></div>';
    }
    case 'multichoice':{
      return base+'<div class="fill-choices">'+((f.options||[]).map(function(o){return'<label class="fill-choice"><input type="radio" name="mc-'+fid+'" value="'+esc(o)+'" '+(val===o?'checked':'')+' onchange="App.fill.set(\''+fid+'\',this.value)"> '+esc(o)+'</label>';}).join(''))+'</div></div>';
    }
    case 'checkbox':{
      var cbv=val?val.split(', '):[];
      return base+'<div class="fill-choices">'+((f.options||[]).map(function(o){return'<label class="fill-choice"><input type="checkbox" value="'+esc(o)+'" '+(cbv.indexOf(o)!==-1?'checked':'')+' onchange="App.fill.cbToggle(\''+fid+'\',\''+esc(o)+'\',this)"> '+esc(o)+'</label>';}).join(''))+'</div></div>';
    }
    case 'passfail':{
      var pfv=val||'';
      return base+'<div class="fill-yn"><button onclick="App.fill.set(\''+fid+'\',\'Pass\');App.renderFill()" class="fill-yn-btn'+(pfv==='Pass'?' yn-active yn-yes':'')+'">✓ Pass</button>'+
        '<button onclick="App.fill.set(\''+fid+'\',\'Fail\');App.renderFill()" class="fill-yn-btn'+(pfv==='Fail'?' yn-active yn-no':'')+'">✕ Fail</button></div></div>';
    }
    case 'score':{
      var scv=parseInt(val)||0, max=f.maxScore||5;
      return base+'<div class="fill-stars">'+Array(max).fill(0).map(function(_,s){return'<button onclick="App.fill.set(\''+fid+'\','+(s+1)+');App.renderFill()" class="star-btn'+(s<scv?' star-active':'')+'">'+(s<scv?'★':'☆')+'</button>';}).join('')+'</div></div>';
    }
    case 'dropdown':{
      var dopts=(f.options||[]).map(function(o){return'<option value="'+esc(o)+'"'+(val===o?' selected':'')+'>'+esc(o)+'</option>';}).join('');
      return base+'<select class="fill-input" onchange="App.fill.set(\''+fid+'\',this.value)"><option value="">Select...</option>'+dopts+'</select></div>';
    }
    case 'signature':
      return '<div class="fill-field"><label class="field-label">'+esc(f.label||'Signature')+'</label>'+
        '<canvas class="sig-pad" id="sig_'+fid+'"></canvas>'+
        '<div class="sig-actions"><button onclick="App.sigClear(\''+fid+'\')" class="btn btn-secondary btn-sm">Clear</button>'+
        '<button onclick="App.sigSave(\''+fid+'\')" class="btn btn-primary btn-sm">Save</button></div>'+
        (val?'<p style="color:'+EDW.sageDark+';font-size:11px;margin-top:4px">✓ Saved</p>':'')+'</div>';
    case 'photo': case 'image':
      var photos=val||[];
      return base+'<div class="photo-zone" onclick="document.getElementById(\'photo_'+fid+'\').click()">'+
        '<input type="file" id="photo_'+fid+'" accept="image/*" multiple onchange="App.fill.photos(\''+fid+'\',this.files)">'+
        '<p class="text-xs text-muted">Tap to take photo</p></div>'+
        (photos.length?'<div class="photo-preview">'+photos.map(function(s,i){return'<div style="position:relative;display:inline-block"><img src="'+s+'"><button onclick="App.fill.rmPhoto(\''+fid+'\','+i+')" class="photo-del">×</button></div>';}).join('')+'</div>':'')+'</div>';
    case 'table':
      return _fillTable(f);
  }
  return base+'<input type="text" class="fill-input" onchange="App.fill.set(\''+fid+'\',this.value)"></div>';
}

function _fillScoring(f){
  if(!f.scoringType||f.scoringType==='none')return '';
  var sk=f.id+'_score', sv=_fill.values[sk]||'', tid=_fill.templateId;
  if(f.scoringType==='rag'){
    return '<div class="scoring-inline"><button onclick="App.fill.set(\''+sk+'\',\'Red\');App.renderFill()" class="sc-btn sc-red'+(sv==='Red'?' active':'')+'">R</button>'+
      '<button onclick="App.fill.set(\''+sk+'\',\'Amber\');App.renderFill()" class="sc-btn sc-amber'+(sv==='Amber'?' active':'')+'">A</button>'+
      '<button onclick="App.fill.set(\''+sk+'\',\'Green\');App.renderFill()" class="sc-btn sc-green'+(sv==='Green'?' active':'')+'">G</button></div>';
  }
  if(f.scoringType==='passfail'){
    return '<div class="scoring-inline"><button onclick="App.fill.set(\''+sk+'\',\'Pass\');App.renderFill()" class="sc-btn sc-pass'+(sv==='Pass'?' active':'')+'">✓</button>'+
      '<button onclick="App.fill.set(\''+sk+'\',\'Fail\');App.renderFill()" class="sc-btn sc-fail'+(sv==='Fail'?' active':'')+'">✕</button></div>';
  }
  if(f.scoringType==='score_1_10'){
    return '<div class="scoring-inline">'+Array(10).fill(0).map(function(_,s){return'<button onclick="App.fill.set(\''+sk+'\','+(s+1)+');App.renderFill()" class="sc-btn sc-num'+(parseInt(sv)===(s+1)?' active':'')+'">'+(s+1)+'</button>';}).join('')+'</div>';
  }
  return '';
}

function _fillTable(f){
  var val=_fill.values[f.id]||{};
  var rows=f.tableRows||3, cols=f.tableCols||3;
  var rh=f.tableRowHeaders||[], ch=f.tableHeaders||[];
  var scRows=f.tableScoredRows||[], scType=f.scoringType||'none';
  var h='<div class="fill-field"><label class="field-label">'+esc(f.label||'Table')+(f.required?' <span style="color:'+EDW.rose+'">*</span>':'')+'</label>';
  h+='<div class="tbl-wrap"><table class="fill-tbl"><thead><tr><th class="tbl-rh">'+esc(f.tableRowHeaderLabel||'Item')+'</th>';
  for(var c=0;c<cols;c++)h+='<th>'+esc(ch[c]||'Col '+(c+1))+'</th>';
  if(scType!=='none')h+='<th class="tbl-sc">Score</th>';
  h+='</tr></thead><tbody>';
  for(var r=0;r<rows;r++){
    var isSc=scRows.indexOf(r)!==-1;
    h+='<tr'+(isSc?' class="tbl-scored-row"':'')+'>';
    h+='<td class="tbl-rh">'+esc(rh[r]||'Row '+(r+1))+'</td>';
    for(var c2=0;c2<cols;c2++){
      h+='<td><input class="tbl-cell" value="'+esc(val[r+'_'+c2]||'')+'" onchange="App.fill.tblVal(\''+f.id+'\',\''+r+'_'+c2+'\',this.value)"></td>';
    }
    if(scType!=='none'){
      var rv=val['score_'+r]||'';
      h+='<td class="tbl-sc">';
      if(isSc){
        if(scType==='rag')h+='<div class="tbl-rag"><button onclick="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',\'Red\');App.renderFill()" class="sc-btn sc-red'+(rv==='Red'?' active':'')+'">R</button>'+
          '<button onclick="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',\'Amber\');App.renderFill()" class="sc-btn sc-amber'+(rv==='Amber'?' active':'')+'">A</button>'+
          '<button onclick="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',\'Green\');App.renderFill()" class="sc-btn sc-green'+(rv==='Green'?' active':'')+'">G</button></div>';
        else if(scType==='passfail')h+='<div class="tbl-rag"><button onclick="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',\'Pass\');App.renderFill()" class="sc-btn sc-pass'+(rv==='Pass'?' active':'')+'">P</button>'+
          '<button onclick="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',\'Fail\');App.renderFill()" class="sc-btn sc-fail'+(rv==='Fail'?' active':'')+'">F</button></div>';
        else h+='<input class="tbl-cell" style="width:50px" value="'+esc(rv)+'" onchange="App.fill.tblVal(\''+f.id+'\',\'score_'+r+'\',this.value)">';
      }
      h+='</td>';
    }
    h+='</tr>';
  }
  h+='</tbody></table></div></div>';
  return h;
}

/* ─── Fill Actions ────────────────────────────────────── */
function _fillSet(fid,val){_fill.values[fid]=val;}
function _fillMeta(el,k){_fill[k]=el.value;}
function _fillHdrVal(k,v){_fill.values[k]=v;if(k.slice(-9)==='_auditor')_fill.auditor=v;if(k.slice(-6)==='_store')_fill.storeName=v;}
function _fillCbToggle(fid,opt,el){
  var arr=_fill.values[fid]?(_fill.values[fid]+'').split(', ').filter(Boolean):[];
  if(el.checked){if(arr.indexOf(opt)===-1)arr.push(opt);}
  else{var i=arr.indexOf(opt);if(i>=0)arr.splice(i,1);}
  _fill.values[fid]=arr.join(', ');
}
function _fillPhotos(fid,files){
  if(!files||!files.length)return;
  var existing=_fill.values[fid]||[];
  var reader=new FileReader(),idx=0;
  function loadNext(){
    if(idx>=files.length||existing.length>=5){_fill.values[fid]=existing;renderView();return;}
    reader.onload=function(e){existing.push(e.target.result);idx++;loadNext();};
    reader.readAsDataURL(files[idx]);
  }
  loadNext();
}
function _fillRmPhoto(fid,i){var arr=_fill.values[fid]||[];arr.splice(i,1);_fill.values[fid]=arr;renderView();}
function _fillTblVal(fid,key,val){if(!_fill.values[fid])_fill.values[fid]={};_fill.values[fid][key]=val;}

function _fillSave(){
  if(!_fill||!_fill.storeName.trim()){toast('Enter a store name','error');return;}
  var visits=loadVisits();
  var idx=visits.findIndex(function(v){return v.id===_fill.id;});
  _fill.updatedAt=now();
  if(idx>=0)visits[idx]=_fill;else visits.unshift(_fill);
  saveVisits(visits);
  var saved=JSON.parse(JSON.stringify(_fill));
  _fill=null;
  toast('Visit saved!');
  navigate('report',{visitId:saved.id});
}

function cancelFill(){_fill=null;navigate('home');}

/* ═══════════════════════════════════════════════════════════════
   REPORT + SUMMARY + PDF
   ═══════════════════════════════════════════════════════════════ */
function renderReportPage(el,data){
  var vid=data&&data.visitId;
  if(!vid){navigate('home');return;}
  var visits=loadVisits(), visit=visits.find(function(v){return v.id===vid;});
  if(!visit){toast('Visit not found','error');navigate('home');return;}
  var tpl=loadTemplates().find(function(t){return t.id===visit.templateId;});
  if(!tpl){el.innerHTML='<div class="card"><p>Template not found.</p></div>';return;}

  var summary=_calcSummary(tpl,visit.values);
  var html='<div class="rpt"><div class="report-header">'+
    '<div class="rh-title">Overall Rating</div>'+
    '<div class="rh-rating">'+(summary.overallRating||'-')+'</div>'+
    '<div class="rh-meta">'+(visit.auditor||'Unnamed Auditor')+(visit.storeName?', '+esc(visit.storeName):'')+(visit.date?' &middot; '+fmtDate(visit.date):'')+'</div></div>'+
    '<div class="report-rating">';

  if(summary.maxScore>0){
    var pct=summary.scorePercent;
    var barClr=pct>=80?'background:'+EDW.sage:pct>=40?'background:#f59e0b':'background:#ef4444';
    var txtClr=pct>=80?'color:'+EDW.sageDark:pct>=40?'color:#92400e':'color:#991b1b';
    html+='<div class="report-score" style="'+txtClr+';'+barClr+'">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-size:11px;font-weight:800;text-transform:uppercase;opacity:0.8;font-family:\'Merriweather\',Georgia,serif">Score</span>'+
      '<span style="font-size:18px;font-weight:800">'+summary.totalScore+' / '+summary.maxScore+' ('+pct+'%)</span></div>'+
      '<div style="width:100%;height:8px;background:rgba(255,255,255,0.4);border-radius:99px;overflow:hidden;margin-top:8px">'+
      '<div style="height:100%;border-radius:99px;background:#fff;width:'+pct+'%"></div></div></div>';
  }

  var statBoxes=[];
  if(summary.yesCount+summary.noCount>0)statBoxes.push('<div class="card" style="text-align:center;padding:12px"><div style="font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Yes / No</div>'+
    '<span style="color:'+EDW.sageDark+';font-weight:800;font-size:16px">'+summary.yesCount+' Yes</span> <span style="color:#dc2626;font-weight:800;font-size:16px">'+summary.noCount+' No</span></div>');
  if(summary.passCount+summary.failCount>0)statBoxes.push('<div class="card" style="text-align:center;padding:12px"><div style="font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Pass / Fail</div>'+
    '<span style="color:'+EDW.sageDark+';font-weight:800;font-size:16px">'+summary.passCount+' Pass</span> <span style="color:#dc2626;font-weight:800;font-size:16px">'+summary.failCount+' Fail</span></div>');
  if(summary.ragRedCount+summary.ragAmberCount+summary.ragGreenCount>0){
    var ragTot=summary.ragRedCount+summary.ragAmberCount+summary.ragGreenCount;
    statBoxes.push('<div class="card" style="text-align:center;padding:16px"><div style="font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px">RAG Rating</div>'+
      '<span class="rag-badge" style="background:#16a34a">'+summary.ragGreenCount+'</span> '+
      '<span class="rag-badge" style="background:#d97706">'+summary.ragAmberCount+'</span> '+
      '<span class="rag-badge" style="background:#dc2626">'+summary.ragRedCount+'</span>'+
      '<div style="font-size:11px;color:var(--text-muted);margin-top:6px">'+ragTot+' total</div></div>');
  }
  if(statBoxes.length>0){
    var cols=Math.min(statBoxes.length,2);
    html+='<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:10px;margin-bottom:14px;'+(cols<2?'max-width:320px;margin-left:auto;margin-right:auto':'')+'">'+
      statBoxes.join('')+'</div>';
  }

    if(summary.categories.length>0){
    html+='<div class="card"><div style="font-size:11px;font-weight:900;color:#6b7280;text-transform:uppercase;margin-bottom:12px;letter-spacing:0.5px;font-family:\'Merriweather\',Georgia,serif">Section Scores</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    summary.categories.forEach(function(cat){
      if(cat.maxScore===0)return;
      var cp=cat.percent;
      var pctClr=cp>=80?'color:#166534':cp>=40?'color:#92400e':'color:#991b1b';
      html+='<div class="section-score-card">'+
        '<div class="ssc-name">'+esc(cat.name)+'</div>'+
        '<div class="ssc-pct" style="'+pctClr+'">'+cp+'%</div>'+
        '<div class="ssc-pct-sm">'+cat.totalScore+' / '+cat.maxScore+'</div>'+
        '</div>';
    });
    html+='</div></div>';
  }

  html+='</div>'; // close report-rating

  var fieldsHtml=tpl.fields.map(function(f){
    var val=visit.values[f.id], sv=visit.values[f.id+'_score'], at=f.answerType||'text';
    if(at==='header') return '<div class="fill-hdr" style="margin-bottom:12px"><h2 style="color:'+EDW.sageDark+'">'+esc(f.label||'')+'</h2></div>';
    if(at==='section') return '<div class="fill-section">'+esc(f.label||'Section')+'</div>';
    if(at==='divider') return '<hr class="fill-hr">';
    if(at==='signoff') return '<div class="mb-4"><label class="field-label">'+esc(f.signoffRole||'Signer')+'</label>'+
      (val?'<img src="'+val+'" style="max-width:250px;border:1px solid #eee;border-radius:6px">':'<span class="text-muted">Not signed</span>')+'</div>';
    if(at==='table') return _reportTable(f,val);

    var display='';
    if(val===undefined||val===null||val==='') display='<span class="text-muted">Not filled</span>';
    else switch(at){
      case 'yesno': display='<span class="badge '+(val==='Yes'?'badge-green':'badge-red')+'">'+esc(val)+'</span>';break;
      case 'passfail': display='<span class="badge '+(val==='Pass'?'badge-green':'badge-red')+'">'+esc(val)+'</span>';break;
      case 'score': display=Array(f.maxScore||5).fill(0).map(function(_,s){return s<parseInt(val)?'★':'☆';}).join('')+' ('+val+'/'+(f.maxScore||5)+')';break;
      case 'multichoice': display=esc(val);break;
      case 'checkbox': display=esc(val);break;
      case 'dropdown': display=esc(val);break;
      case 'signature': display=val?'<img src="'+val+'" style="max-width:250px;border:1px solid #eee;border-radius:6px">':'<span class="text-muted">Not signed</span>';break;
      case 'photo': case 'image': display=Array.isArray(val)&&val.length?val.map(function(s){return'<img src="'+s+'" style="max-width:240px;max-height:180px;border-radius:6px;margin:4px;border:1px solid var(--border)">';}).join(' '):'<span class="text-muted">No photos</span>';break;
      default: display=esc(String(val));
    }

    var sb='';
    if(sv&&f.scoringType!=='none'){
      if(f.scoringType==='rag'){var rc=sv==='Green'?'badge-green':sv==='Amber'?'badge-amber':'badge-red';sb='<span class="badge '+rc+'" style="margin-left:8px">'+esc(sv)+'</span>';}
      else if(f.scoringType==='passfail'){var pf=sv==='Pass'?'badge-green':'badge-red';sb='<span class="badge '+pf+'" style="margin-left:8px">'+esc(sv)+'</span>';}
      else if(f.scoringType==='score_1_10'){sb='<span class="badge badge-amber" style="margin-left:8px">'+(parseInt(sv)||0)+'/10</span>';}
    }
    return '<div class="mb-4"><label class="field-label">'+esc(f.label||'')+(f.required?' <span style="color:'+EDW.rose+'">*</span>':'')+'</label><div style="padding:8px 0;font-size:13px">'+display+sb+'</div></div>';
  }).join('');

  html+='<div class="card">'+fieldsHtml+'</div>'+
    '<div class="flex-row gap-2" style="margin-top:12px">'+
    '<button onclick="App.editVisit(\''+visit.id+'\')" class="btn btn-secondary btn-full">✎ Edit Visit</button>'+
    '<button onclick="App.exportPDF(\''+visit.id+'\')" class="btn btn-primary btn-full">📄 Export PDF</button></div></div>';

  el.innerHTML=html;
}

function _reportTable(f,val){
  if(!val)val={};
  var rows=f.tableRows||3, cols=f.tableCols||3, rh=f.tableRowHeaders||[], ch=f.tableHeaders||[];
  var scRows=f.tableScoredRows||[], scType=f.scoringType||'none';
  var h='<div class="mb-4"><label class="field-label">'+esc(f.label||'Table')+'</label>';
  h+='<div class="tbl-wrap"><table class="fill-tbl report-table"><thead><tr><th class="tbl-rh">'+esc(f.tableRowHeaderLabel||'Item')+'</th>';
  for(var c=0;c<cols;c++)h+='<th>'+esc(ch[c]||'')+'</th>';
  if(scType!=='none')h+='<th class="tbl-sc">Score</th>';
  h+='</tr></thead><tbody>';
  for(var r=0;r<rows;r++){
    h+='<tr'+(scRows.indexOf(r)!==-1?' class="tbl-scored-row"':'')+'>';
    h+='<td class="tbl-rh">'+esc(rh[r]||'Row '+(r+1))+'</td>';
    for(var c2=0;c2<cols;c2++)h+='<td>'+esc(val[r+'_'+c2]||'')+'</td>';
    if(scType!=='none'){
      var scv=val['score_'+r]||'';
      h+='<td>'+(scv?'<span class="badge '+(scType==='passfail'?(scv==='Pass'?'badge-green':'badge-red'):scv==='Green'?'badge-green':scv==='Amber'?'badge-amber':'badge-red')+'">'+esc(scv)+'</span>':'<span class="text-muted">-</span>')+'</td>';
    }
    h+='</tr>';
  }
  h+='</tbody></table></div></div>';
  return h;
}

/* ─── Summary Calculation ─────────────────────────────── */
function _calcSummary(tpl, values) {
  var sum={totalScore:0, maxScore:0, yesCount:0, noCount:0, passCount:0, failCount:0,
    ragRedCount:0, ragAmberCount:0, ragGreenCount:0,
    categories:[], fieldResults:[], overallRating:'', scorePercent:0};
  var catMap={}, catOrder=[];
  function getCat(name){
    if(!catMap[name]){catMap[name]={name:name,totalScore:0,maxScore:0,fieldResults:[]};catOrder.push(name);}
    return catMap[name];
  }

  var catName='General';
  tpl.fields.forEach(function(f){
    var at=f.answerType||'text', sc=f.scoringType||'none';
    var val=values[f.id], scoreVal=values[f.id+'_score'];

    if(at==='section'){catName=f.label||'General';getCat(catName);return;}

    if(at==='yesno'&&sc!=='none'){
      if(val==='Yes')sum.yesCount++;else if(val==='No')sum.noCount++;
      return;
    }

    var weight=f.scoreWeight||1;
    var max=10, rawVal=0;

    if(at==='table'){
      var scRows=f.tableScoredRows||[];
      scRows.forEach(function(ri){
        var rv=values[f.id+'_score_'+ri]||'';
        if(!rv)return;
        if(sc==='rag'){rawVal=rv==='Green'?max:rv==='Amber'?Math.round(max*0.5):0;}
        else if(sc==='passfail'){rawVal=rv==='Pass'?max:0;if(rv==='Pass')sum.passCount++;else sum.failCount++;}
        else rawVal=parseFloat(rv)||0;
        var wv=rawVal*weight, wm=max*weight;
        sum.totalScore+=wv;sum.maxScore+=wm;
        var cat=getCat(catName);
        cat.totalScore+=wv;cat.maxScore+=wm;
        var tr={label:(f.tableRowHeaders||[])[ri]||'Row '+(ri+1),type:'table_row',scoringType:sc,
          rawValue:rv,value:rawVal,max:max,weight:weight,percent:max>0?Math.round((rawVal/max)*100):0};
        sum.fieldResults.push(tr);cat.fieldResults.push(tr);
        if(rv==='Red')sum.ragRedCount++;else if(rv==='Amber')sum.ragAmberCount++;else if(rv==='Green')sum.ragGreenCount++;
      });
      return;
    }

    if(sc==='none')return;

    if(sc==='rag'){
      if(scoreVal==='Green'){rawVal=max;sum.ragGreenCount++;}
      else if(scoreVal==='Amber'){rawVal=Math.round(max*0.5);sum.ragAmberCount++;}
      else if(scoreVal==='Red'){rawVal=0;sum.ragRedCount++;}
      else return;
    }else if(sc==='passfail'){
      if(scoreVal==='Pass'){rawVal=max;sum.passCount++;}
      else if(scoreVal==='Fail'){rawVal=0;sum.failCount++;}
      else return;
    }else if(sc==='score_1_10'){
      rawVal=parseInt(scoreVal)||0;
    }else return;

    var wv=rawVal*weight, wm=max*weight;
    sum.totalScore+=wv;sum.maxScore+=wm;
    var cat=getCat(catName);
    cat.totalScore+=wv;cat.maxScore+=wm;
    var fr={label:f.label||'',type:'field',scoringType:sc,rawValue:scoreVal,value:rawVal,
      max:max,weight:weight,percent:max>0?Math.round((rawVal/max)*100):0};
    sum.fieldResults.push(fr);cat.fieldResults.push(fr);
  });

  catOrder.forEach(function(n){
    var c=catMap[n];if(c.maxScore>0)c.percent=Math.round((c.totalScore/c.maxScore)*100);
    sum.categories.push(c);
  });

  if(sum.maxScore>0)sum.scorePercent=Math.round((sum.totalScore/sum.maxScore)*100);
  if(sum.scorePercent>=90)sum.overallRating='Excellent';
  else if(sum.scorePercent>=75)sum.overallRating='Good';
  else if(sum.scorePercent>=50)sum.overallRating='Needs Improvement';
  else if(sum.scorePercent>0)sum.overallRating='Poor';

  var hasRag=sum.ragRedCount+sum.ragAmberCount+sum.ragGreenCount>0;
  if(hasRag){
    var tr=sum.ragRedCount+sum.ragAmberCount+sum.ragGreenCount;
    var rr=sum.ragRedCount/tr;
    if(rr>0.5)sum.overallRating='Fail';
    else if(rr>0.25||sum.ragAmberCount>sum.ragGreenCount)sum.overallRating='Needs Improvement';
  }

  var hasYN=sum.yesCount+sum.noCount>0;
  if(hasYN&&sum.yesCount/sum.yesCount+sum.noCount>0.5)sum.overallRating='Needs Improvement';

  return sum;
}

/* ═══════════════════════════════════════════════════════════════
   PRINT / PDF — uses browser print so it matches exactly
   ═══════════════════════════════════════════════════════════════ */
function exportPDF(visitId) {
  toast('Opening print dialog...');
  setTimeout(function(){ window.print(); }, 300);
}

/* ─── Signature Pad ─────────────────────────────────────── */
var _sigCtxs={};
function _initSig(fid){
  setTimeout(function(){
    var c=document.getElementById('sig_'+fid);if(!c)return;
    var rect=c.getBoundingClientRect();
    c.width=Math.round(rect.width);
    c.height=Math.round(rect.height);
    var ctx=c.getContext('2d');ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.lineCap='round';
    _sigCtxs[fid]={ctx:ctx,canvas:c,drawing:false};

    function gp(e){var r=c.getBoundingClientRect();
      return{x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,y:(e.touches?e.touches[0].clientY:e.clientY)-r.top};}
    function sd(e){e.preventDefault();_sigCtxs[fid].drawing=true;var p=gp(e);ctx.beginPath();ctx.moveTo(p.x,p.y);}
    function dr(e){e.preventDefault();if(!_sigCtxs[fid].drawing)return;var p=gp(e);ctx.lineTo(p.x,p.y);ctx.stroke();}
    function stp(){_sigCtxs[fid].drawing=false;}
    c.addEventListener('mousedown',sd);c.addEventListener('mousemove',dr);
    c.addEventListener('mouseup',stp);c.addEventListener('mouseleave',stp);
    c.addEventListener('touchstart',sd,{passive:false});c.addEventListener('touchmove',dr,{passive:false});
    c.addEventListener('touchend',stp);
  },100);
}

function _sigClear(fid){
  var p=_sigCtxs[fid];if(!p)return;
  p.ctx.clearRect(0,0,p.canvas.width,p.canvas.height);
  if(_fill)delete _fill.values[fid];
  renderView();
}

function _sigSave(fid){
  var p=_sigCtxs[fid];if(!p)return;
  _fill.values[fid]=p.canvas.toDataURL('image/png');
  toast('Signature saved');renderView();
}

function editVisit(id){
  var visits=loadVisits();_fill=JSON.parse(JSON.stringify(visits.find(function(v){return v.id===id;})));
  if(!_fill)return;navigate('fill',{templateId:_fill.templateId});
}

function delVisit(id){
  if(!confirm('Delete this visit?'))return;
  saveVisits(loadVisits().filter(function(v){return v.id!==id;}));
  toast('Visit deleted');navigate('home');
}

function getVisitStats(visit){
  var tpl=loadTemplates().find(function(t){return t.id===visit.templateId;});
  if(!tpl)return{pass:0,fail:0,na:0,scoreAvg:'-',scoreCount:0,total:0,ragRed:0,ragAmber:0,ragGreen:0};
  var p=0,f=0,na=0,st=0,sc=0,rg=0,ra=0,rr=0;
  tpl.fields.forEach(function(f){
    var v=visit.values[f.id], sv=visit.values[f.id+'_score'];
    if(f.answerType==='passfail'&&v){if(v==='Pass')p++;else if(v==='Fail')f++;else if(v==='N/A')na++;}
    if(f.scoringType&&f.scoringType!=='none'&&f.answerType!=='table'&&f.answerType!=='yesno'){
      if(sv==='Pass')p++;else if(sv==='Fail')f++;else if(sv==='N/A')na++;
      if(sv==='Green')rg++;else if(sv==='Amber')ra++;else if(sv==='Red')rr++;
    }
    if(f.answerType==='score'&&v){st+=parseInt(v)||0;sc++;}
    if(f.answerType==='table'&&v&&typeof v==='object'){
      (f.tableScoredRows||[]).forEach(function(r){
        var sv2=v['score_'+r];
        if(!sv2)return;
        if(f.scoringType==='passfail'){if(sv2==='Pass')p++;else if(sv2==='Fail')f++;else if(sv2==='N/A')na++;}
        if(f.scoringType==='rag'){if(sv2==='Green')rg++;else if(sv2==='Amber')ra++;else if(sv2==='Red')rr++;}
      });
    }
  });
  return{pass:p,fail:f,na:na,scoreAvg:sc?(st/sc).toFixed(1):'-',scoreCount:sc,total:p+f,ragRed:rr,ragAmber:ra,ragGreen:rg};
}

/* ─── Toast ────────────────────────────────────────────── */
function toast(msg,type){
  var el=document.getElementById('toast');
  el.textContent=msg;el.className='toast show';
  el.style.background=type==='error'?'#dc2626':'#1f2937';
  clearTimeout(el._t);el._t=setTimeout(function(){el.className='toast';},2500);
}

/* ─── Init ─────────────────────────────────────────────── */
(function seed(){
  var verKey='sv_seed_ver';
  var savedVer=localStorage.getItem(verKey);
  var curVer=window.__SEED_VERSION__||0;
  if((!savedVer||parseInt(savedVer)!==curVer)&&window.__SEED_TEMPLATES__&&window.__SEED_TEMPLATES__.length){
    saveTemplates(window.__SEED_TEMPLATES__);
    localStorage.setItem(verKey,String(curVer));
  }
})();

(function init(){
  if('caches' in window) caches.keys().then(function(ks){ ks.filter(function(k){return k!=='birds-store-visit-v4';}).forEach(function(k){caches.delete(k);}); });
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  navigate('home');
})();

window.App = {
  navigate:navigate, home:function(){navigate('home');},
  library:function(){navigate('library');},
  builder:function(t){_bld=null;navigate('builder');},
  editTpl:editTpl, delTpl:delTpl,

  /* Builder */
  bldSelect:_bldSelect, bldMove:_bldMove, bldRemove:_bldRemove,
  bldAdd:_bldAdd, bldUpdateMeta:_bldUpdateMeta, bldUpdateField:_bldUpdateField,
  bldTogglePreview:_bldTogglePreview, bldSave:_bldSave, bldExport:_bldExport,
  bldDragStart:_bldDragStart, bldDrop:_bldDrop, bldDragEnd:_bldDragEnd,
  bldCanvasDrop:_bldCanvasDrop,
  cancelBuilder:cancelBuilder, exportTpl:exportTpl,
  upload:_upload, importFile:_importFile,

  /* Fill */
  startFill:function(tid){_fill=null;navigate('fill',{templateId:tid});},
  fill:{
    set:_fillSet, meta:_fillMeta, hdrVal:_fillHdrVal,
    cbToggle:_fillCbToggle, photos:_fillPhotos, rmPhoto:_fillRmPhoto,
    tblVal:_fillTblVal
  },
  fillSave:_fillSave, cancelFill:cancelFill,
  renderFill:function(){if(_fill)navigate('fill',{templateId:_fill.templateId});},

  /* Report */
  report:function(vid){navigate('report',{visitId:vid});},
  editVisit:editVisit, delVisit:delVisit,
  exportPDF:exportPDF,

  /* Sig */
  sigClear:_sigClear, sigSave:_sigSave
};

})();
