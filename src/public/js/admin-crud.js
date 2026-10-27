/* admin-crud.js — Motor CRUD genérico: crudScreen, crudForm, saveCRUD, deleteCRUD */
// CRUD Builder
const _crudConfigs={};

// Mapeo de campos: cuando la API devuelve un nombre diferente al del formulario
const _fieldMappings = {
  '/api/paquetes': { 'paquetenombre': 'nombre' },
  '/api/categorias': { 'categorianombre': 'nombre' }
};

function crudScreen(opts){
  const{page,endpoint,entity,fields,titleField,customCols,customRender,onCreated}=opts;
  _crudConfigs[page]={endpoint,entity,fields,onCreated};
  SCREENS[page]=async()=>{
    const ct=$('pageContent');ct.innerHTML=showLoading();
    try{
      const d=await api.get(endpoint);
      if(!d.success){ct.innerHTML=showEmpty('fa-solid fa-database','Sin datos','No se pudieron cargar los datos.');return;}
      const data=d.data||[];
      const cols=customCols||[{label:entity,field:titleField,render:r=>r[titleField]||'-'},{label:'Acciones',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="editCRUD(\''+page+'\','+r[Object.keys(r).find(k=>k.toLowerCase().includes('id'))]+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg transition-all" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCRUD(\''+endpoint+'\','+r[Object.keys(r).find(k=>k.toLowerCase().includes('id'))]+',\''+page+'\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}];
      ct.innerHTML='<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">'+entity+'</h3><div class="flex items-center gap-2"><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+data.length+'</span><button onclick="window[\'openModalCRUD_'+page+'\']()" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1"><i class="fa-solid fa-plus"></i> Agregar</button></div></div><div class="bg-white rounded-2xl shadow-sm border border-[#e8ecf1] overflow-hidden">'+(customRender?customRender(data):renderTable(cols,data))+'</div></div>';
    }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error al cargar.','Reintentar','navigate(\''+page+'\')')}
  };
  window['openModalCRUD_'+page]=()=>crudForm(page,endpoint,entity,fields,null,onCreated);
}

window['editCRUD']=async(p,id)=>{
  const cfg=_crudConfigs[p];if(!cfg)return toast('Configuración no encontrada',false);
  try{
    const d=await api.get(cfg.endpoint+'/'+id);
    if(!d.success)return toast(d.error||'Error',false);
    
    // Aplicar mapeo de campos antes de pasar al formulario
    let editData = d.data;
    if (editData) {
      const mappings = _fieldMappings[cfg.endpoint] || {};
      Object.keys(mappings).forEach(apiField => {
        const formField = mappings[apiField];
        if (editData[apiField] !== undefined && editData[formField] === undefined) {
          editData[formField] = editData[apiField];
        }
      });
    }
    
    crudForm(p,cfg.endpoint,cfg.entity,cfg.fields,editData,cfg.onCreated);
  }catch(e){toast('Error al cargar datos',false)}
};

async function crudForm(page,endpoint,entity,fields,editData,onCreated){
  editId=editData?editData[Object.keys(editData).find(k=>k.toLowerCase().includes('id'))]:null;
  let body='<div class="p-6" style="max-width: 480px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-'+(editData?'pen-to-square':'square-plus')+' text-menta mr-2"></i>'+(editData?'Editar ':'Nuevo ')+entity+'</h3><form id="crudForm" class="space-y-3.5" onsubmit="return false">';
  fields.forEach(f=>{
    const name=f.field||f.name,label=f.label||f.name,type=f.type||'text';
    // Safely get edit value; handle boolean fields
    let val='';
    if(editData){
      const raw=editData[name];
      if(raw!==undefined&&raw!==null) val=raw;
    }
    body+='<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">'+label+(f.required?' *':'')+'</label>';
    if(type==='select'){
      body+='<select name="'+name+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all">'+(f.options?f.options.map(o=>'<option value="'+o.value+'"'+(editData&&String(editData[name])===String(o.value)?' selected':'')+'>'+o.label+'</option>').join(''):'')+'</select>';
    }else if(type==='checkbox'){
      // Proper boolean check: true, 1, 'true', 't' all mean checked
      const isChecked=val===true||val===1||val==='true'||val==='1'||val==='t';
      body+='<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="'+name+'"'+(isChecked?' checked':'')+' class="w-4 h-4 rounded border-[#d1d5db] text-menta focus:ring-menta/30"><span class="text-sm text-[#2c3e50]">Sí</span></label>';
    }else{
      body+='<input type="'+type+'" name="'+name+'" value="'+val+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all"'+(f.required?' required':'')+(f.placeholder?' placeholder="'+f.placeholder+'"':'')+'>';
    }
    body+='</div>';
  });
  body+='</form><div id="crudFormError" class="hidden mt-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100"></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="saveCRUD(\''+endpoint+'\',\''+page+'\')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">'+(editData?'Guardar Cambios':'Crear '+entity)+'</button></div></div>';
  openModal(body,()=>{if(onCreated)setTimeout(onCreated,50);});
}

// Reemplazar la función saveCRUD completa
async function saveCRUD(endpoint,page,hasCallback){
  const form=$('crudForm');if(!form)return;
  const fd=new FormData(form);const data={};
  fd.forEach((v,k)=>{data[k]=v});
  form.querySelectorAll('input[type="checkbox"]').forEach(cb=>{data[cb.name]=cb.checked;});
  
  // Aplicar mapeo inverso: del formulario a la API
  const mappings = _fieldMappings[endpoint] || {};
  Object.keys(mappings).forEach(apiField => {
    const formField = mappings[apiField];
    if (data[formField] !== undefined) {
      data[apiField] = data[formField];
     // delete data[formField];
    }
  });
  
  ['precio','duracion','cantidad','iddistrito','idcategoria','idarea','horastrabajo','duraciontotal'].forEach(k=>{
    if(data[k]!==undefined&&data[k]!=='')data[k]=isNaN(Number(data[k]))?data[k]:Number(data[k]);
  });
  try{
    const d=editId?await api.put(endpoint+'/'+editId,data):await api.post(endpoint,data);
    if(!d.success){toast(d.error||'Error al guardar',false);return;}
    toast(editId?'Actualizado':'Creado exitosamente');closeModal();navigate(page);
  }catch(e){toast(e.message||'Error de conexión',false);}
}

window.deleteCRUD=async(endpoint,id,page)=>{
  openConfirm('Eliminar','¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.',async()=>{
    try{
      const d=await api.del(endpoint+'/'+id);
      if(!d.success){
        const msg=d.error||'';
        if(/foreign key|llave foranea|referenced|constraint|violat|asociad/i.test(msg)){
          toast('No se puede eliminar: este registro está siendo utilizado en otra parte del sistema. Elimina primero los registros relacionados.',false);
        }else{
          toast(msg||'Error al eliminar',false);
        }
        return;
      }
      toast('Eliminado correctamente');navigate(page);
    }catch(e){
      const msg=e.message||'';
      if(/foreign key|constraint|referenced|23503|23000/i.test(msg)){
        toast('No se puede eliminar: tiene registros asociados que deben eliminarse primero.',false);
      }else{
        toast(msg||'Error de conexión',false);
      }
    }
  });
};