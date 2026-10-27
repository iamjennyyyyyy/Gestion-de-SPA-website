/* admin-screens.js — Pantallas administrador: Tratamientos, Paquetes, Empleados,
   Clientes, Materiales, Categorías, Distritos, Áreas, Reportes, Informes */
// Admin: Tratamientos (w/ expandible panel for materiales/empleados)
let tratFilterCategoria='';
SCREENS['admin-tratamientos']=async()=>{
  const ct=$('pageContent');ct.innerHTML=showLoading();
  try{
    const[r,cat]=await Promise.all([api.get('/api/tratamientos'),api.get('/api/categorias')]);
    if(!r.success){ct.innerHTML=showEmpty(' fa-spa','Sin datos','No hay tratamientos registrados.','Agregar','crudTratamientoForm(null)');return;}
    const data=(r.data||[]).filter(t=>!tratFilterCategoria||t.idcategoria==tratFilterCategoria);
    const catData=cat.success?cat.data||[]:[];
    ct.innerHTML='<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Tratamientos</h3><div class="flex items-center gap-2"><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+data.length+'</span><select id="tratFiltroCat" class="px-3 py-1.5 border border-[#d1d5db] rounded-lg text-xs" onchange="tratFilterCategoria=this.value;navigate(\'admin-tratamientos\')"><option value="">Todas las categorías</option>'+(catData.map(c=>'<option value="'+c.idcategoria+'"'+(tratFilterCategoria==c.idcategoria?' selected':'')+'>'+(c.categorianombre||c.nombre||'')+'</option>').join(''))+'</select><button onclick="crudTratamientoForm(null)" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1"><i class="fa-solid fa-plus"></i> Agregar</button></div></div><div class="space-y-3">'+data.map(t=>'<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition-colors" onclick="toggleTratamiento('+t.idtratamiento+')"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-spa text-spa text-sm"></i></div><div><h4 class="font-medium text-[#2c3e50]">'+t.nombre+'</h4><p class="text-xs text-[#6b7280]">'+$$(t.precio)+' | '+t.duracion+' min</p></div></div><div class="flex items-center gap-2"><div class="flex gap-1"><button onclick="event.stopPropagation();editTratamiento('+t.idtratamiento+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="event.stopPropagation();deleteTratamiento('+t.idtratamiento+',\''+t.nombre.replace(/'/g,"\\'")+'\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class=" fa-trash-can"></i></button></div><i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform '+(expandedTratamiento===t.idtratamiento?'rotate-180':'')+'"></i></div></div><div id="tratPanel_'+t.idtratamiento+'" class="'+(expandedTratamiento===t.idtratamiento?'':'hidden')+' border-t border-[#e8ecf1] bg-[#f8fafc]"><div class="p-4" id="tratContent_'+t.idtratamiento+'">'+showLoading()+'</div></div></div>').join('')+'</div></div>';
    if(expandedTratamiento)loadTratamientoPanel(expandedTratamiento);
  }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error.','Reintentar','navigate(\'admin-tratamientos\')')}
};
async function deleteTratamiento(id, nombre) {
  try {
    // Verificar si el tratamiento tiene citas asociadas
    const citasRes = await api.get('/api/citas/tratamiento/' + id);
    const citas = citasRes.success ? (citasRes.data || []) : [];
    
    if (citas.length > 0) {
      // Si tiene citas, preguntar si desea moverlas a otra categoría/tratamiento
      const [cats, trats] = await Promise.all([
        api.get('/api/categorias'),
        api.get('/api/tratamientos')
      ]);
      
      const categoriasDisponibles = cats.success ? (cats.data || []) : [];
      const tratamientosDisponibles = trats.success ? (trats.data || []).filter(t => t.idtratamiento !== id) : [];
      
      let modalHtml = '<div class="p-6" style="max-width:500px">';
      modalHtml += '<h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Eliminar Tratamiento</h3>';
      modalHtml += '<p class="text-sm text-[#6b7280] mb-4">El tratamiento <strong>"' + nombre + '"</strong> tiene ' + citas.length + ' cita(s) asociada(s).</p>';
      
      if (tratamientosDisponibles.length > 0) {
        modalHtml += '<div class="mb-4">';
        modalHtml += '<label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Mover citas a otro tratamiento</label>';
        modalHtml += '<select id="tratDestinoSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
        modalHtml += '<option value="">Seleccionar tratamiento destino...</option>';
        modalHtml += tratamientosDisponibles.map(t => '<option value="' + t.idtratamiento + '">' + t.nombre + '</option>').join('');
        modalHtml += '</select></div>';
      }
      
      modalHtml += '<div class="flex gap-2">';
      modalHtml += '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>';
      modalHtml += '<button onclick="confirmarDeleteTratamiento(' + id + ')" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-red-600">Eliminar</button>';
      modalHtml += '</div></div>';
      
      openModal(modalHtml);
    } else {
      // Si no tiene citas, eliminar directamente
      openConfirm('Eliminar Tratamiento', '¿Eliminar "' + nombre + '"?', async () => {
        try {
          const d = await api.del('/api/tratamientos/' + id);
          if (!d.success) throw new Error(d.error);
          toast('Tratamiento eliminado');
          navigate('admin-tratamientos');
        } catch(e) {
          toast(e.message || 'Error al eliminar', false);
        }
      });
    }
  } catch(e) {
    toast(e.message || 'Error de conexión', false);
  }
}

// Función para confirmar eliminación de tratamiento con movimiento de citas
async function confirmarDeleteTratamiento(idTrat) {
  const destinoSelect = document.getElementById('tratDestinoSelect');
  const idDestino = destinoSelect ? destinoSelect.value : null;
  
  try {
    if (idDestino) {
      // Mover citas al tratamiento destino
      const moveRes = await api.put('/api/categorias/' + idCat + '/tratamientos/mover', {
        idCategoriaDestino: parseInt(idDestino)
      });
      if (!moveRes.success) {
        toast(moveRes.error || 'Error al mover citas', false);
        return;
      }
    }
    
    // Eliminar el tratamiento
    const delRes = await api.del('/api/tratamientos/' + idTrat);
    if (!delRes.success) throw new Error(delRes.error);
    
    toast('Tratamiento eliminado exitosamente');
    closeModal();
    navigate('admin-tratamientos');
  } catch(e) {
    toast(e.message || 'Error al eliminar', false);
  }
}
async function loadTratamientoPanel(id){
  const ct=$('tratContent_'+id);if(!ct)return;
  try{
    const[m,emps]=await Promise.all([
      api.get('/api/tratamientos/'+id+'/materiales'),
      api.get('/api/tratamientos/'+id+'/empleados-fijos')
    ]);
    let html='<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    html+='<div><div class="flex items-center justify-between mb-2"><h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider"><i class="fa-solid fa-oil-can text-menta mr-1"></i>Materiales</h5><button onclick="agregarMaterialTratamiento('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium"><i class="fa-solid fa-plus"></i> Agregar</button></div>';
    if(m.success && m.data.length){
      html+='<div class="space-y-1.5">'+m.data.map(function(mat){
        return '<div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm"><span class="text-[#2c3e50]">'+mat.nombrematerial+'</span><div class="flex items-center gap-2"><span class="text-xs text-[#6b7280]">Cant: '+mat.cantidad+'</span><button onclick="eliminarMaterialTratamiento('+id+','+mat.idmaterial+',\''+mat.nombrematerial+'\')" class="p-1 text-red-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div></div>';
      }).join('')+'</div>';
    } else {
      html+='<p class="text-xs text-[#9ca3af] py-2">Sin materiales asignados</p>';
    }
    html+='</div>';
    html+='<div><div class="flex items-center justify-between mb-2"><h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider"><i class="fa-solid fa-user-tie text-menta mr-1"></i>Empleados Fijos</h5><button onclick="agregarEmpleadoTratamiento('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium"><i class="fa-solid fa-plus"></i> Agregar</button></div>';
    if(emps.success && emps.data.length){
      html+='<div class="space-y-1.5">'+emps.data.map(function(e){
        return '<div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm"><span class="text-[#2c3e50]">'+e.nombre+'</span><button onclick="eliminarEmpleadoFijoTratamiento('+id+','+e.idempleado+',\''+e.nombre+'\')" class="p-1 text-red-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>';
      }).join('')+'</div>';
    } else {
      html+='<p class="text-xs text-[#9ca3af] py-2">Sin empleados asignados</p>';
    }
    html+='</div></div>';
    ct.innerHTML=html;
  }catch(e){ct.innerHTML='<p class="text-xs text-red-400">Error al cargar panel</p>'}
}

async function eliminarMaterialTratamiento(idTrat, idMat, nombre){
  openConfirm('Eliminar Material', '¿Quitar "'+nombre+'" del tratamiento?', async function(){
    try{
      const d=await api.del('/api/tratamientos/'+idTrat+'/materiales/'+idMat);
      if(!d.success) throw new Error(d.error);
      toast('Material eliminado del tratamiento');
      loadTratamientoPanel(idTrat);
    }catch(e){
      toast(e.message||'Error',false);
    }
  });
}

async function eliminarEmpleadoFijoTratamiento(idTrat, idEmp, nombre){
  openConfirm('Eliminar Empleado', '¿Quitar a "'+nombre+'" como empleado fijo del tratamiento?', async function(){
    try{
      const d=await api.del('/api/tratamientos/'+idTrat+'/empleados-fijos/'+idEmp);
      if(!d.success) throw new Error(d.error);
      toast('Empleado removido del tratamiento');
      loadTratamientoPanel(idTrat);
    }catch(e){
      toast(e.message||'Error',false);
    }
  });
}


function toggleTratamiento(id){
  const panel=$(('tratPanel_'+id));
  if(expandedTratamiento===id){expandedTratamiento=null;panel.classList.add('hidden');return;}
  if(expandedTratamiento){const old=$(('tratPanel_'+expandedTratamiento));if(old)old.classList.add('hidden')}
  expandedTratamiento=id;panel.classList.remove('hidden');loadTratamientoPanel(id);
}
async function editTratamiento(id){
  try{
    const d=await api.get('/api/tratamientos/'+id);
    if(!d.success)return toast(d.error,false);
    crudTratamientoForm(d.data);
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function crudTratamientoForm(editData){
  editId=editData?.idtratamiento||null;
  try{
    const[cat,area]=await Promise.all([api.get('/api/categorias'),api.get('/api/areas')]);
    let body='<div class="p-6" style="max-width: 480px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-spa text-menta mr-2"></i>'+(editData?'Editar':'Nuevo')+' Tratamiento</h3><form id="crudForm" class="space-y-3.5" onsubmit="return false"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Nombre *</label><input type="text" name="nombre" value="'+(editData?.nombre||'')+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" required></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Descripción</label><textarea name="descripcion" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all">'+(editData?.descripcion||'')+'</textarea></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Precio *</label><input type="number" step="0.01" name="precio" value="'+(editData?.precio||'')+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" required></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Duración (min) *</label><input type="number" name="duracion" value="'+(editData?.duracion||'')+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" required></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Categoría *</label><select name="idcategoria" required class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all"><option value="">Seleccionar categoría</option>'+(cat.success?cat.data.map(c=>'<option value="'+c.idcategoria+'"'+(editData?.idcategoria==c.idcategoria?' selected':'')+'>'+(c.categorianombre||c.nombre||'Sin nombre')+'</option>').join(''):'')+'</select></div></form><div id="tratFormError" class="hidden mt-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100"></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="saveCRUDTratamiento()" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">'+(editData?'Guardar Cambios':'Crear')+'</button></div></div>';
    openModal(body);
  }catch(e){toast('Error al cargar formulario',false)}
}
async function saveCRUDTratamiento(){
  const form=$('crudForm');if(!form)return;
  const fd=new FormData(form);const data={};
  fd.forEach((v,k)=>{if(v!==''&&v!==undefined)data[k]=v});
  // Convert to numbers where needed
  if(data.precio)data.precio=Number(data.precio);
  if(data.duracion)data.duracion=Number(data.duracion);
  if(data.idcategoria)data.idcategoria=Number(data.idcategoria);
  if(!data.nombre)return toast('El nombre es requerido',false);
  if(!data.precio)return toast('El precio es requerido',false);
  if(!data.duracion)return toast('La duración es requerida',false);
  if(!data.idcategoria)return toast('Selecciona una categoría',false);
  try{
    const d=editId?await api.put('/api/tratamientos/'+editId,data):await api.post('/api/tratamientos',data);
    if(!d.success){toast(d.error||'Error al guardar',false);return;} // keep modal open
    toast(editId?'Actualizado':'Creado exitosamente');closeModal();navigate('admin-tratamientos');
  }catch(e){toast(e.message||'Error de conexión',false);} // keep modal open
}
async function agregarMaterialTratamiento(idTrat){
  try{
    const mats=await api.get('/api/materiales');
    if(!mats.success)return toast('Error al cargar materiales',false);
    if(!mats.data||!mats.data.length)return toast('No hay materiales registrados',false);
    openModal('<div class="p-6" style="max-width: 420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-oil-can text-menta mr-2"></i>Agregar Material</h3><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Material *</label><select id="matSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"><option value="">Seleccionar material...</option>'+mats.data.map(m=>'<option value="'+m.idmaterial+'">'+m.nombre+'</option>').join('')+'</select></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Cantidad *</label><input type="number" id="matCantidad" value="1" min="1" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarMatTrat('+idTrat+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Agregar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function guardarMatTrat(idTrat){
  const idmaterial=$('matSelect')?.value,cantidad=$('matCantidad')?.value;
  if(!idmaterial||idmaterial==='')return toast('Selecciona un material',false);
  if(!cantidad||Number(cantidad)<1)return toast('Ingresa una cantidad válida',false);
  try{
    const d=await api.post('/api/tratamientos/'+idTrat+'/materiales/'+idmaterial,{cantidad:Number(cantidad)});
    if(!d.success){toast(d.error||'Error',false);return;}
    toast('Material agregado');closeModal();loadTratamientoPanel(idTrat);
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function agregarEmpleadoTratamiento(idTrat){
  try{
    const emps=await api.get('/api/tratamientos/'+idTrat+'/empleados-fijos');
    // Get all fixed employees and filter out already assigned ones
    const todosEmps=await api.get('/api/empleados');
    if(!todosEmps.success)return toast('Error al cargar empleados',false);
    const yaAsignados=(emps.success?(emps.data||[]):[]).map(e=>e.idempleado);
    const disponibles=(todosEmps.data||[]).filter(e=>!yaAsignados.includes(e.idempleado));
    if(!disponibles.length)return toast('No hay empleados fijos disponibles para asignar',false);
    openModal('<div class="p-6" style="max-width: 420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-user-tie text-menta mr-2"></i>Agregar Empleado Fijo</h3><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Empleado *</label><select id="empSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"><option value="">Seleccionar empleado...</option>'+disponibles.map(e=>'<option value="'+e.idempleado+'">'+e.nombre+'</option>').join('')+'</select></div></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarEmpTrat('+idTrat+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Agregar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function guardarEmpTrat(idTrat){
  const idempleado=$('empSelect')?.value;
  if(!idempleado||idempleado==='')return toast('Selecciona un empleado',false);
  try{
    const d=await api.post('/api/tratamientos/'+idTrat+'/empleados-fijos/'+idempleado);
    if(!d.success){toast(d.error||'Error',false);return;}
    toast('Empleado agregado');closeModal();loadTratamientoPanel(idTrat);
  }catch(e){toast(e.message||'Error de conexión',false)}
}



// Admin: Paquetes
crudScreen({page:'admin-paquetes',endpoint:'/api/paquetes',entity:'Paquetes',fields:[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'precio',label:'Precio',type:'number',required:true},{name:'duraciontotal',label:'Duración Total (min)',type:'number'}],titleField:'paquetenombre',customCols:[{label:'Nombre',render:r=>r.paquetenombre||r.nombre||'-'},{label:'Precio',render:r=>$$(r.precio)},{label:'Duración',render:r=>r.duraciontotal?r.duraciontotal+' min':'-'},{label:'',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="window.verPaqueteAdmin('+r.idpaquete+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Contenido"><i class="fa-solid fa-list"></i></button><button onclick="editCRUD(\'admin-paquetes\','+r.idpaquete+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCRUD(\'/api/paquetes\','+r.idpaquete+',\'admin-paquetes\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}]});
window.verPaqueteAdmin=async(id)=>{
  try{
    const[pkg,trat]=await Promise.all([api.get('/api/paquetes/'+id),api.get('/api/paquetes/'+id+'/tratamientos')]);
    if(!pkg.success)return toast(pkg.error,false);
    const p=pkg.data;const tratList=trat.success?trat.data:[];
    openModal('<div class="p-6" style="max-width: 500px"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-gift text-amber-500 mr-2"></i>'+p.paquetenombre+'</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+$$(p.precio)+'</span></div><div class="mb-4"><div class="flex items-center justify-between mb-2"><p class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Tratamientos incluidos</p><button onclick="agregarTratamientoPaquete('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium"><i class="fa-solid fa-plus"></i> Agregar</button></div>'+(tratList.length?'<div class="space-y-1.5">'+tratList.map(t=>'<div class="flex items-center justify-between px-3 py-2.5 bg-lavender-50 rounded-xl text-sm"><span>'+t.tratamientonombre+' <span class="text-xs text-[#6b7280]">'+$$(t.precio)+'</span></span><button onclick="quitarTratamientoPaquete('+id+','+t.idtratamiento+',\''+t.tratamientonombre.replace(/'/g,"\\'")+'\')" class="text-xs text-red-400 hover:text-red-500"><i class="fa-solid fa-circle-xmark"></i></button></div>').join('')+'</div>':'<p class="text-xs text-[#9ca3af] py-2">Sin tratamientos asignados</p>')+'</div><div class="flex gap-2 mt-4"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cerrar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
};
async function agregarTratamientoPaquete(idPaq){
  try{
    const tr=await api.get('/api/tratamientos');
    if(!tr.success)return toast('Error al cargar tratamientos',false);
    openModal('<div class="p-6" style="max-width: 420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-spa text-menta mr-2"></i>Agregar Tratamiento</h3><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Tratamiento *</label><select id="paqTratSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm">'+tr.data.map(t=>'<option value="'+t.idtratamiento+'">'+t.nombre+' - '+$$(t.precio)+'</option>').join('')+'</select></div></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarTratPaquete('+idPaq+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Agregar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function guardarTratPaquete(idPaq){
  const idtratamiento=$('paqTratSelect')?.value;
  if(!idtratamiento)return toast('Selecciona un tratamiento',false);
  try{
    const d=await api.post('/api/paquetes/'+idPaq+'/tratamientos/'+idtratamiento);
    if(!d.success)return toast(d.error||'Error',false);
    toast('Tratamiento agregado');closeModal();window.verPaqueteAdmin(idPaq);
  }catch(e){toast(e.message||'Error de conexión',false);closeModal();}
}
async function quitarTratamientoPaquete(idPaq,idTrat,nombre){
  openConfirm('Quitar tratamiento','¿Quitar "'+nombre+'" del paquete?',async()=>{
    try{
      const d=await api.del('/api/paquetes/'+idPaq+'/tratamientos/'+idTrat);
      if(!d.success)return toast(d.error||'Error',false);
      toast('Tratamiento quitado');closeModal();window.verPaqueteAdmin(idPaq);
    }catch(e){toast(e.message||'Error de conexión',false)}
  });
}





// Admin: Empleados
const _empleadoFieldsWithWarning=[
  {name:'nombre',label:'Nombre',type:'text',required:true},
  {name:'dni',label:'DNI',type:'text',required:true},
  {name:'telefono',label:'Teléfono',type:'text'},
  {name:'especialidad',label:'Especialidad',type:'text'},
  {name:'direccion',label:'Dirección',type:'text'},
  {name:'iddistrito',label:'Distrito',type:'select',options:[]},
];

crudScreen({page:'admin-empleados',endpoint:'/api/empleados',entity:'Empleados',titleField:'nombre',customCols:[{label:'Nombre',render:r=>r.nombre||'-'},{label:'DNI',render:r=>r.dni||'-'},{label:'Teléfono',render:r=>r.telefono||'-'},{label:'Especialidad',render:r=>r.especialidad||'-'},{label:'Fijo',render:r=>{const esFijo=r.esfijo===true||r.esfijo===1||r.esfijo==='true'||r.esfijo==='t';return esFijo?'<span class="text-menta"><i class="fa-solid fa-check"></i></span>':'<span class="text-[#d1d5db]"><i class="fa-solid fa-xmark"></i></span>'}},{label:'Distrito',render:r=>r.distritonombre||'-'},{label:'Horas',render:r=>r.horastrabajo!=null?r.horastrabajo+' h':'-'},{label:'',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="editCRUD(\'admin-empleados\','+r.idempleado+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCRUD(\'/api/empleados\','+r.idempleado+',\'admin-empleados\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}],fields:_empleadoFieldsWithWarning});

// Custom modal for empleados to load distrito options and handle esfijo warning
const _empleadoFields=[
  {name:'nombre',label:'Nombre',type:'text',required:true},
  {name:'dni',label:'DNI',type:'text',required:true},
  {name:'telefono',label:'Teléfono',type:'text'},
  {name:'especialidad',label:'Especialidad',type:'text'},
  {name:'direccion',label:'Dirección',type:'text'},
  {name:'iddistrito',label:'Distrito',type:'select',options:[]},
  
];

async function _loadDistritoSelect(fields){
  try{
    const d=await api.get('/api/distritos');
    if(d.success&&d.data)return fields.map(f=>f.name==='iddistrito'?{...f,options:d.data.map(r=>({value:r.iddistrito,label:r.nombre}))}:f);
  }catch(e){}
  return fields;
}

async function _loadAreaSelect(fields){
  try{
    const d=await api.get('/api/areas');
    if(d.success&&d.data)return fields.map(f=>f.name==='idarea'?{...f,options:d.data.map(r=>({value:r.idarea,label:r.nombre}))}:f);
  }catch(e){}
  return fields;
}

const _origEditCRUD=window.editCRUD;
window.editCRUD=async(p,id)=>{
  const cfg=_crudConfigs[p];
  if(!cfg)return toast('Configuración no encontrada',false);
  try{
    const d=await api.get(cfg.endpoint+'/'+id);
    if(!d.success)return toast(d.error||'Error',false);
    let fields=cfg.fields;
    if(p==='admin-empleados')fields=await _loadDistritoSelect(fields);
    if(p==='admin-categorias')fields=await _loadAreaSelect(fields);
    
  
        // Apply field mappings (paquetenombre→nombre, categorianombre→nombre)
    let editData = d.data;
    if (editData) {
      const mappings = (_fieldMappings[cfg.endpoint] || {});
      Object.keys(mappings).forEach(apiField => {
        const formField = mappings[apiField];
        if (editData[apiField] !== undefined && editData[formField] === undefined) {
          editData[formField] = editData[apiField];
        }
      });
    }
    crudForm(p,cfg.endpoint,cfg.entity,fields,editData,cfg.onCreated);
  }catch(e){toast(e.message||'Error al cargar datos',false)}
};





// Admin: Clientes
const _origOpenEmpleados=window['openModalCRUD_admin-empleados'];
window['openModalCRUD_admin-empleados']=async()=>{
  try{
    const d=await api.get('/api/distritos');
    if(d.success&&d.data){
      const fields=_empleadoFields.map(f=>f.name==='iddistrito'?{...f,options:d.data.map(r=>({value:r.iddistrito,label:r.nombre}))}:f);
      crudForm('admin-empleados','/api/empleados','Empleados',fields,null);
    }else _origOpenEmpleados();
  }catch(e){_origOpenEmpleados()}
};

// Admin: Clientes - ELIMINADO {label:'Gasto Total',render:r=>$$(r.total_gastado||0)}
crudScreen({page:'admin-clientes',endpoint:'/api/clientes',entity:'Cliente',fields:[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'ci',label:'CI',type:'text',required:true},{name:'telefono',label:'Teléfono',type:'text'},{name:'email',label:'Email',type:'email'}],titleField:'nombre'});
let clientesSearch='';
SCREENS['admin-clientes']=async()=>{
  const ct=$('pageContent');ct.innerHTML=showLoading();
  try{
    const d=await api.get('/api/clientes');
    if(!d.success){ct.innerHTML=showEmpty('fa-solid fa-users','Sin datos','No hay clientes registrados.');return;}
    const data=(d.data||[]).filter(c=>!clientesSearch||(c.nombre||'').toLowerCase().includes(clientesSearch.toLowerCase())||(c.ci||'').includes(clientesSearch));
    ct.innerHTML='<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Clientes</h3><div class="flex items-center gap-2"><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+data.length+'</span><button onclick="window[\'openModalCRUD_admin-clientes\']()" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1"><i class="fa-solid fa-plus"></i> Agregar</button></div></div><div class="mb-3"><input type="text" id="clienteSearch" placeholder="Buscar por nombre o CI..." value="'+clientesSearch+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" oninput="clientesSearch=this.value;clearTimeout(window._clienteSearchTimer);window._clienteSearchTimer=setTimeout(function(){const prevFocus=document.activeElement?.id;SCREENS[\'admin-clientes\']().then(function(){if(prevFocus){const el=document.getElementById(prevFocus);if(el){el.focus();const v=el.value;el.value=\'\';el.value=v;}}})},400)"></div><div class="bg-white rounded-2xl shadow-sm border border-[#e8ecf1] overflow-hidden">'+renderTable([
      {label:'Nombre',render:r=>r.nombre},
      {label:'CI',render:r=>r.ci||'-'},
      {label:'Teléfono',field:'telefono'},
      {label:'Email',field:'email'},
      {label:'',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="editCRUD(\'admin-clientes\','+r.idcliente+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCRUD(\'/api/clientes\','+r.idcliente+',\'admin-clientes\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}],data,'No hay clientes registrados.')+'</div></div>';
  }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error.','Reintentar','navigate(\'admin-clientes\')')}
};
async function verHistorialCliente(id){
  try{
    const d=await api.get('/api/clientes/'+id);
    if(!d.success)return toast(d.error,false);
    const c=d.data;const citas=c.citas||[];
    openModal('<div class="p-6" style="max-width: 520px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-clock text-menta mr-2"></i>Historial: '+c.nombre+'</h3>'+(citas.length?'<div class="space-y-2">'+citas.map(ci=>'<div class="flex items-center justify-between px-3 py-2.5 bg-[#f8fafc] rounded-xl border border-[#e8ecf1]"><div><p class="text-sm font-medium text-[#2c3e50]">'+ci.tratamientonombre+'</p><p class="text-xs text-[#6b7280]">'+formatDateShort(ci.fecha)+' a las '+formatTime(ci.hora)+'</p></div><span class="px-2 py-0.5 text-xs font-semibold rounded-full border '+sc(ci.estado)+'">'+cap(ci.estado)+'</span></div>').join('')+'</div>':'<p class="text-sm text-[#6b7280] py-4 text-center">Sin citas registradas</p>')+'<button onclick="closeModal()" class="mt-4 w-full px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">Cerrar</button></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
// Admin: Materiales
crudScreen({page:'admin-materiales',endpoint:'/api/materiales',entity:'Materiales',fields:[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'cantidad',label:'Stock Inicial',type:'number',required:true}],titleField:'nombre',customCols:[{label:'Nombre',render:r=>r.nombre||'-'},{label:'Stock',render:r=>'<span class="font-semibold '+(Number(r.cantidad||0)<=5?'text-red-500':'text-[#2c3e50]')+'">'+(r.cantidad||0)+'</span>'},{label:'',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="editCRUD(\'admin-materiales\','+r.idmaterial+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCRUD(\'/api/materiales\','+r.idmaterial+',\'admin-materiales\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}]});




// Admin: Categorías (with area select)
const _catFields=[
  {name:'nombre',label:'Nombre',type:'text',required:true},
  {name:'idarea',label:'Área',type:'select',required:true,options:[]}
];
crudScreen({page:'admin-categorias',endpoint:'/api/categorias',entity:'Categoría',fields:_catFields,titleField:'nombre',customCols:[{label:'Nombre',render:r=>r.categorianombre||r.nombre||'-'},{label:'Área',render:r=>r.areanombre||'-'},{label:'',render:r=>'<div class="flex gap-1.5 justify-end"><button onclick="editCRUD(\'admin-categorias\','+r.idcategoria+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deleteCategoriaConTratamientos('+r.idcategoria+',\''+(r.categorianombre||r.nombre||'').replace(/'/g,"\\'")+'\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>'}]});

// Función personalizada para eliminar categoría con manejo de tratamientos
async function deleteCategoriaConTratamientos(idCategoria, nombre) {
  try {
    // Verificar si la categoría tiene tratamientos
    const todas = await api.get('/api/tratamientos');
    const tratamientos = todas.success ? (todas.data || []).filter(t => t.idcategoria == idCategoria) : [];
    
    if (tratamientos.length > 0) {
      // Si tiene tratamientos, preguntar a qué categoría moverlos
      const catsRes = await api.get('/api/categorias');
      const categorias = catsRes.success ? (catsRes.data || []).filter(c => c.idcategoria !== idCategoria) : [];
      
      if (categorias.length === 0) {
        toast('No hay otras categorías disponibles para mover los tratamientos', false);
        return;
      }
      
      let modalHtml = '<div class="p-6" style="max-width:500px">';
      modalHtml += '<h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Eliminar Categoría</h3>';
      modalHtml += '<p class="text-sm text-[#6b7280] mb-4">La categoría <strong>"' + nombre + '"</strong> tiene ' + tratamientos.length + ' tratamiento(s). Selecciona a qué categoría moverlos:</p>';
      modalHtml += '<select id="catDestinoSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm mb-4">';
      modalHtml += '<option value="">Seleccionar categoría destino...</option>';
      modalHtml += categorias.map(c => '<option value="' + c.idcategoria + '">' + (c.categorianombre || c.nombre || '') + '</option>').join('');
      modalHtml += '</select>';
      modalHtml += '<div class="flex gap-2">';
      modalHtml += '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>';
      modalHtml += '<button onclick="confirmarDeleteCategoria(' + idCategoria + ')" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-red-600">Eliminar y Mover</button>';
      modalHtml += '</div></div>';
      
      openModal(modalHtml);
    } else {
      // Si no tiene tratamientos, eliminar directamente
      openConfirm('Eliminar Categoría', '¿Eliminar "' + nombre + '"?', async () => {
        try {
          const d = await api.del('/api/categorias/' + idCategoria);
          if (!d.success) throw new Error(d.error);
          toast('Categoría eliminada');
          navigate('admin-categorias');
        } catch(e) {
          toast(e.message || 'Error al eliminar', false);
        }
      });
    }
  } catch(e) {
    toast(e.message || 'Error de conexión', false);
  }
}

// Función para confirmar eliminación de categoría con movimiento de tratamientos
async function confirmarDeleteCategoria(idCat) {
  const destinoSelect = document.getElementById('catDestinoSelect');
  const idDestino = destinoSelect ? destinoSelect.value : null;
  
  if (!idDestino) {
    toast('Selecciona una categoría destino', false);
    return;
  }
  
  try {
    // Primero mover los tratamientos a la nueva categoría
    const moveRes = await api.put('/api/categorias/' + idCat + '/tratamientos/mover', { 
      idcategoria_destino: parseInt(idDestino) 
    });
    
    if (!moveRes.success) {
      // Si hay error en el movimiento, puede que algunos tratamientos no se hayan movido
      toast(moveRes.error || 'Error al mover tratamientos', false);
      return;
    }
    
    // Luego eliminar la categoría
    const delRes = await api.del('/api/categorias/' + idCat);
    if (!delRes.success) throw new Error(delRes.error);
    
    toast('Categoría eliminada y tratamientos movidos exitosamente');
    closeModal();
    navigate('admin-categorias');
  } catch(e) {
    toast(e.message || 'Error al eliminar', false);
  }
}

const _origOpenCats=window['openModalCRUD_admin-categorias'];
window['openModalCRUD_admin-categorias']=async()=>{
  try{
    const d=await api.get('/api/areas');
    if(d.success&&d.data){
      const fields=_catFields.map(f=>f.name==='idarea'?{...f,options:d.data.map(r=>({value:r.idarea,label:r.nombre}))}:f);
      crudForm('admin-categorias','/api/categorias','Categoría',fields,null);
    }else _origOpenCats();
  }catch(e){_origOpenCats()}
};





// Admin: Distritos
crudScreen({page:'admin-distritos',endpoint:'/api/distritos',entity:'Distrito',fields:[{name:'nombre',label:'Nombre',type:'text',required:true}],titleField:'nombre'});
let distritosSearch='';
SCREENS['admin-distritos']=async()=>{
  const ct=$('pageContent');ct.innerHTML=showLoading();
  try{
    const d=await api.get('/api/distritos');
    if(!d.success){ct.innerHTML=showEmpty('fa-solid fa-map-pin','Sin datos','No hay distritos registrados.','Agregar','window[\'openModalCRUD_admin-distritos\']()');return;}
    const allData=d.data||[];
    const data=allData.filter(di=>!distritosSearch||(di.nombre||'').toLowerCase().includes(distritosSearch.toLowerCase()));
    ct.innerHTML='<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Distritos</h3><div class="flex items-center gap-2"><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+data.length+'</span><button onclick="window[\'openModalCRUD_admin-distritos\']()" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1"><i class="fa-solid fa-plus"></i> Agregar</button></div></div><div class="mb-3"><input type="text" placeholder="Buscar distrito..." value="'+distritosSearch+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" oninput="distritosSearch=this.value;navigate(\'admin-distritos\')"></div><div class="space-y-2">'+data.map(di=>'<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition-colors" onclick="toggleDistrito('+di.iddistrito+')"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><i class="fa-solid fa-map-pin text-red-400"></i></div><div><h4 class="font-medium text-[#2c3e50]">'+di.nombre+'</h4><p class="text-xs text-[#6b7280]" id="distEmpCount_'+di.iddistrito+'">'+di.empleados+' empleados</p></div></div><div class="flex items-center gap-2"><div class="flex gap-1"><button onclick="event.stopPropagation();editCRUD(\'admin-distritos\','+di.iddistrito+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="event.stopPropagation();eliminarDistritoConEmpleados('+di.iddistrito+',\''+di.nombre+'\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div><i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform '+(expandedDistrito===di.iddistrito?'rotate-180':'')+'"></i></div></div><div id="distPanel_'+di.iddistrito+'" class="'+(expandedDistrito===di.iddistrito?'':'hidden')+' border-t border-[#e8ecf1] bg-[#f8fafc]"><div class="p-4" id="distContent_'+di.iddistrito+'">'+(expandedDistrito===di.iddistrito?showLoading():'')+'</div></div></div>').join('')+'</div></div>';
    if(expandedDistrito) loadDistritoPanel(expandedDistrito);
  }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error.','Reintentar','navigate(\'admin-distritos\')')}
};


// ============================================
// FUNCIONES PARA DISTRITOS
// ============================================
async function loadDistritoPanel(id){
  const ct=$('distContent_'+id);
  if(!ct) return;
  try{
    const[empleadosRes, otrosDistritos]=await Promise.all([
      api.get('/api/distritos/'+id+'/empleados'),
      api.get('/api/distritos')
    ]);
    
    const empleados=empleadosRes.success?empleadosRes.data||[]:[];
    const otros=(otrosDistritos.success?otrosDistritos.data||[]:[]).filter(d=>d.iddistrito!==id);
    
    if(empleados.length===0){
      ct.innerHTML='<p class="text-sm text-[#9ca3af] text-center py-4">No hay empleados en este distrito</p>';
      return;
    }
    
    ct.innerHTML='<div class="space-y-3"><div class="flex items-center justify-between mb-2"><h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider"><i class="fa-solid fa-users text-menta mr-1"></i>Empleados ('+empleados.length+')</h5>'+(otros.length?'<button onclick="moverTodosEmpleadosDistrito('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium px-2 py-1 rounded-lg bg-menta-50"><i class="fa-solid fa-arrow-right"></i> Mover todos</button>':'')+'</div><div class="space-y-2 max-h-96 overflow-y-auto">'+empleados.map(function(emp){
      return '<div class="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-[#e8ecf1]"><div><p class="text-sm font-medium text-[#2c3e50]">'+emp.nombre+'</p><p class="text-xs text-[#6b7280]">'+(emp.especialidad||'Sin especialidad')+'</p></div>'+(otros.length?'<div class="flex items-center gap-2"><select id="moverEmp_'+emp.idempleado+'" class="px-2 py-1 border border-[#d1d5db] rounded-lg text-xs">'+otros.map(function(o){return '<option value="'+o.iddistrito+'">'+o.nombre+'</option>';}).join('')+'</select><button onclick="moverEmpleadoDistrito('+emp.idempleado+','+id+')" class="px-2 py-1 bg-menta text-white text-xs rounded-lg hover:bg-menta-600"><i class="fa-solid fa-arrow-right"></i></button></div>':'<span class="text-xs text-[#9ca3af]">No hay otros distritos</span>')+'</div>';
    }).join('')+'</div></div>';
  } catch(e){
    ct.innerHTML='<p class="text-sm text-red-400">Error al cargar empleados</p>';
  }
}

async function moverEmpleadoDistrito(idEmpleado, idDistritoOrigen){
  const select=document.getElementById('moverEmp_'+idEmpleado);
  const idDistritoDestino=select?.value;
  if(!idDistritoDestino){
    toast('Selecciona un distrito destino',false);
    return;
  }
  try{
    const res=await api.put('/api/empleados/'+idEmpleado,{iddistrito:parseInt(idDistritoDestino)});
    if(!res.success) throw new Error(res.error);
    toast('Empleado movido correctamente');
    loadDistritoPanel(idDistritoOrigen);
    const badge=document.getElementById('distEmpCount_'+idDistritoOrigen);
    if(badge){
      var newCount=parseInt(badge.textContent)-1;
      badge.textContent=newCount+' empleados';
    }
  } catch(e){
    toast(e.message||'Error al mover empleado',false);
  }
}

async function moverTodosEmpleadosDistrito(idDistritoOrigen){
  try{
    const otros=await api.get('/api/distritos');
    const otrosData=(otros.success?otros.data||[]:[]).filter(d=>d.iddistrito!==idDistritoOrigen);
    if(otrosData.length===0){
      toast('No hay otros distritos para mover los empleados',false);
      return;
    }
    openModal('<div class="p-6" style="max-width:420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-people-arrows text-menta mr-2"></i>Mover todos los empleados</h3><p class="text-sm text-[#6b7280] mb-4">Selecciona el distrito destino para todos los empleados:</p><select id="moverTodosDestino" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm mb-4">'+otrosData.map(function(d){return '<option value="'+d.iddistrito+'">'+d.nombre+'</option>';}).join('')+'</select><div class="flex gap-2"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl">Cancelar</button><button onclick="confirmarMoverTodosEmpleados('+idDistritoOrigen+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl shadow-sm">Mover todos</button></div></div>');
  } catch(e){
    toast('Error al cargar distritos',false);
  }
}


async function confirmarMoverTodosEmpleados(idDistritoOrigen){
  const idDestino=document.getElementById('moverTodosDestino')?.value;
  if(!idDestino) return;
  try{
    const res=await api.post('/api/distritos/'+idDistritoOrigen+'/empleados/mover',{iddistritoDestino:parseInt(idDestino)});
    if(!res.success) throw new Error(res.error);
    toast('Todos los empleados fueron movidos');
    closeModal();
    navigate('admin-distritos');
  } catch(e){
    toast(e.message||'Error al mover empleados',false);
  }
}

// MODIFICADO: eliminarDistritoConEmpleados con dos opciones
function eliminarDistritoConEmpleados(id, nombre){
  openModal('<div class="p-6" style="max-width:420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Eliminar Distrito: '+nombre+'</h3><p class="text-sm text-[#6b7280] mb-4">Este distrito tiene empleados asignados. ¿Qué deseas hacer?</p><div class="space-y-3"><button onclick="eliminarDistritoConMover('+id+',\'todos\')" class="w-full px-4 py-3 bg-menta text-white rounded-xl text-left flex items-center gap-3"><i class="fa-solid fa-arrow-right"></i><div><p class="font-medium">Mover todos a otro distrito</p><p class="text-xs text-white/80">Todos los empleados serán reasignados a un distrito destino</p></div></button><button onclick="eliminarDistritoConMover('+id+',\'individual\')" class="w-full px-4 py-3 bg-amber-500 text-white rounded-xl text-left flex items-center gap-3"><i class="fa-solid fa-list-check"></i><div><p class="font-medium">Mover uno a uno</p><p class="text-xs text-white/80">Abrir el panel y mover empleados individualmente</p></div></button><button onclick="eliminarDistritoConMover('+id+',\'vacio\')" class="w-full px-4 py-3 bg-red-500 text-white rounded-xl text-left flex items-center gap-3"><i class="fa-solid fa-trash"></i><div><p class="font-medium">Eliminar solo si no hay empleados</p><p class="text-xs text-white/80">Solo si el distrito está vacío</p></div></button></div><button onclick="closeModal()" class="mt-4 w-full px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl">Cancelar</button></div>');
}

// MODIFICADO: eliminarDistritoConMover con opciones múltiples
async function eliminarDistritoConMover(id, modo){
  closeModal();
  
  if (modo === 'todos') {
    // Mover todos a otro distrito
    try{
      const otros=await api.get('/api/distritos');
      const otrosData=(otros.success?otros.data||[]:[]).filter(d=>d.iddistrito!==id);
      if(otrosData.length===0){
        toast('No hay otros distritos para mover los empleados',false);
        return;
      }
      openModal('<div class="p-6" style="max-width:420px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-4">Mover empleados antes de eliminar</h3><select id="moverDestinoDistrito" class="w-full px-4 py-2.5 border rounded-xl mb-4">'+otrosData.map(function(d){return '<option value="'+d.iddistrito+'">'+d.nombre+'</option>';}).join('')+'</select><div class="flex gap-2"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl">Cancelar</button><button onclick="confirmarEliminarDistrito('+id+')" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl">Eliminar y mover</button></div></div>');
    } catch(e){ toast('Error',false); }
  } else if (modo === 'individual') {
    // Abrir el panel y mostrar botones individuales
    closeModal();
    
    // Expandir el distrito para mostrar el panel
    if (expandedDistrito !== id) {
      toggleDistrito(id);
    }
    
    // Mostrar mensaje
    toast('Mueve los empleados individualmente antes de eliminar el distrito', true);
    
    // Esperar a que se cargue el panel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Agregar un banner informativo en el panel
    const panelContent = document.getElementById('distContent_' + id);
    if (panelContent) {
      const banner = document.createElement('div');
      banner.className = 'mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700';
      banner.innerHTML = '<i class="fa-solid fa-info-circle mr-1"></i> Mueve los empleados a otros distritos usando los selectores. Cuando el distrito esté vacío, podrás eliminarlo.';
      panelContent.insertBefore(banner, panelContent.firstChild);
    }
  } else if (modo === 'vacio') {
    // Eliminar solo si no hay empleados
    try{
      const res=await api.del('/api/distritos/'+id);
      if(!res.success) throw new Error(res.error);
      toast('Distrito eliminado');
      navigate('admin-distritos');
    } catch(e){
      toast(e.message||'No se puede eliminar: tiene empleados asignados',false);
    }
  }
}

async function confirmarEliminarDistrito(id){
  const destino=document.getElementById('moverDestinoDistrito')?.value;
  if(!destino) return;
  try{
    const res=await api.del('/api/distritos/'+id+'?migrarA='+destino);
    if(!res.success) throw new Error(res.error);
    toast('Distrito eliminado y empleados reasignados');
    closeModal();
    navigate('admin-distritos');
  } catch(e){
    toast(e.message||'Error',false);
  }
}


function toggleDistrito(id){
  const p=document.getElementById('distPanel_'+id);
  if(expandedDistrito===id){
    expandedDistrito=null;
    if(p) p.classList.add('hidden');
    return;
  }
  if(expandedDistrito){
    const old=document.getElementById('distPanel_'+expandedDistrito);
    if(old) old.classList.add('hidden');
  }
  expandedDistrito=id;
  if(p) p.classList.remove('hidden');
  loadDistritoPanel(id);
}


// Admin: Áreas
// Admin: Áreas — solo nombre, cantidadpersonalfijo es automático
crudScreen({page:'admin-areas',endpoint:'/api/areas',entity:'Área',fields:[{name:'nombre',label:'Nombre',type:'text',required:true}],titleField:'nombre'});
let areasSearch='';
SCREENS['admin-areas']=async()=>{
  const ct=$('pageContent');ct.innerHTML=showLoading();
  try{
    const d=await api.get('/api/areas');
    if(!d.success){ct.innerHTML=showEmpty('fa-solid fa-building','Sin datos','No hay áreas registradas.','Agregar','window[\'openModalCRUD_admin-areas\']()');return;}
    const allData=d.data||[];
    const data=allData.filter(a=>!areasSearch||(a.nombre||'').toLowerCase().includes(areasSearch.toLowerCase()));
    ct.innerHTML='<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Áreas</h3><div class="flex items-center gap-2"><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+data.length+'</span><button onclick="window[\'openModalCRUD_admin-areas\']()" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1"><i class="fa-solid fa-plus"></i> Agregar</button></div></div><div class="mb-3"><input type="text" placeholder="Buscar área..." value="'+areasSearch+'" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm focus:ring-2 focus:ring-menta/30 focus:border-menta outline-none transition-all" oninput="areasSearch=this.value;navigate(\'admin-areas\')"></div><div class="space-y-2">'+data.map(a=>'<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition-colors" onclick="toggleArea('+a.idarea+')"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-building text-spa"></i></div><div><h4 class="font-medium text-[#2c3e50]">'+a.nombre+'</h4><p class="text-xs text-[#6b7280]" id="areaEmpCount_'+a.idarea+'">'+(a.cantidadpersonalfijo!=null?a.cantidadpersonalfijo+' empleados fijos':'')+'</p></div></div><div class="flex items-center gap-2"><div class="flex gap-1"><button onclick="event.stopPropagation();editCRUD(\'admin-areas\','+a.idarea+')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="event.stopPropagation();deleteAreaConCategorias('+a.idarea+',\''+a.nombre.replace(/'/g,"\\'")+'\')" class="p-1.5 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div><i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform '+(expandedArea===a.idarea?'rotate-180':'')+'"></i></div></div><div id="areaPanel_'+a.idarea+'" class="'+(expandedArea===a.idarea?'':'hidden')+' border-t border-[#e8ecf1] bg-[#f8fafc]"><div class="p-4" id="areaContent_'+a.idarea+'">'+(expandedArea===a.idarea?showLoading():'')+'</div></div></div>').join('')+'</div></div>';
    if(expandedArea)loadAreaPanel(expandedArea);
  }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error.','Reintentar','navigate(\'admin-areas\')')}
};

async function deleteAreaConCategorias(idArea, nombre) {
  try {
    // Verificar si el área tiene categorías
    const catsRes = await api.get('/api/categorias/area/' + idArea);
    const categorias = catsRes.success ? (catsRes.data || []) : [];
    
    if (categorias.length > 0) {
      // Si tiene categorías, preguntar a qué área moverlas
      const areasRes = await api.get('/api/areas');
      const areas = areasRes.success ? (areasRes.data || []).filter(a => a.idarea !== idArea) : [];
      
      if (areas.length === 0) {
        toast('No hay otras áreas disponibles para mover las categorías', false);
        return;
      }
      
      let modalHtml = '<div class="p-6" style="max-width:500px">';
      modalHtml += '<h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Eliminar Área</h3>';
      modalHtml += '<p class="text-sm text-[#6b7280] mb-4">El área <strong>"' + nombre + '"</strong> tiene ' + categorias.length + ' categoría(s). Selecciona a qué área moverlas:</p>';
      
      // Mostrar lista de categorías que se moverán
      modalHtml += '<div class="mb-3 text-xs text-[#6b7280] bg-[#f8fafc] rounded-xl p-3 max-h-32 overflow-y-auto">';
      modalHtml += '<p class="font-semibold mb-1">Categorías a mover:</p>';
      modalHtml += categorias.map(c => '<div class="py-0.5">• ' + (c.categorianombre || c.nombre || 'Sin nombre') + '</div>').join('');
      modalHtml += '</div>';
      
      modalHtml += '<select id="areaDestinoSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm mb-4">';
      modalHtml += '<option value="">Seleccionar área destino...</option>';
      modalHtml += areas.map(a => '<option value="' + a.idarea + '">' + a.nombre + '</option>').join('');
      modalHtml += '</select>';
      
      // También preguntar por empleados
      modalHtml += '<div class="mb-4">';
      modalHtml += '<label class="block text-xs font-semibold text-[#6b7280] mb-1.5">¿Qué hacer con los empleados del área?</label>';
      modalHtml += '<select id="empAreaDestinoSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm">';
      modalHtml += '<option value="0">Dejar sin área (desasignar)</option>';
      modalHtml += areas.map(a => '<option value="' + a.idarea + '">Mover a: ' + a.nombre + '</option>').join('');
      modalHtml += '</select></div>';
      
      modalHtml += '<div class="flex gap-2">';
      modalHtml += '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>';
      modalHtml += '<button onclick="confirmarDeleteArea(' + idArea + ')" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-red-600">Eliminar y Mover</button>';
      modalHtml += '</div></div>';
      
      openModal(modalHtml);
    } else {
      // Si no tiene categorías, verificar empleados
      const empsRes = await api.get('/api/areas/' + idArea + '/empleados-todos');
      const empleados = empsRes.success ? (empsRes.data || []) : [];
      
      if (empleados.length > 0) {
        // Tiene empleados pero no categorías
        const areasRes = await api.get('/api/areas');
        const areas = areasRes.success ? (areasRes.data || []).filter(a => a.idarea !== idArea) : [];
        
        let modalHtml = '<div class="p-6" style="max-width:500px">';
        modalHtml += '<h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Eliminar Área</h3>';
        modalHtml += '<p class="text-sm text-[#6b7280] mb-4">El área <strong>"' + nombre + '"</strong> tiene ' + empleados.length + ' empleado(s). ¿Deseas moverlos?</p>';
        modalHtml += '<select id="empAreaDestinoSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm mb-4">';
        modalHtml += '<option value="0">Dejar sin área (desasignar)</option>';
        modalHtml += areas.map(a => '<option value="' + a.idarea + '">Mover a: ' + a.nombre + '</option>').join('');
        modalHtml += '</select>';
        modalHtml += '<div class="flex gap-2">';
        modalHtml += '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl">Cancelar</button>';
        modalHtml += '<button onclick="confirmarDeleteAreaSimple(' + idArea + ')" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl">Eliminar</button>';
        modalHtml += '</div></div>';
        
        openModal(modalHtml);
      } else {
        // Sin categorías ni empleados, eliminar directamente
        openConfirm('Eliminar Área', '¿Eliminar "' + nombre + '"?', async () => {
          try {
            const d = await api.del('/api/areas/' + idArea);
            if (!d.success) throw new Error(d.error);
            toast('Área eliminada');
            navigate('admin-areas');
          } catch(e) {
            toast(e.message || 'Error al eliminar', false);
          }
        });
      }
    }
  } catch(e) {
    toast(e.message || 'Error de conexión', false);
  }
}

// Confirmar eliminación de área con categorías y empleados
async function confirmarDeleteArea(idArea) {
  const areaDestinoSelect = document.getElementById('areaDestinoSelect');
  const empDestinoSelect = document.getElementById('empAreaDestinoSelect');
  
  const idAreaDestino = areaDestinoSelect ? areaDestinoSelect.value : null;
  const idEmpDestino = empDestinoSelect ? empDestinoSelect.value : '0';
  
  if (!idAreaDestino) {
    toast('Selecciona un área destino para las categorías', false);
    return;
  }
  
  try {
    // Mover categorías al área destino
    const catsRes = await api.get('/api/categorias/area/' + idArea);
    const categorias = catsRes.success ? (catsRes.data || []) : [];
    
    for (const cat of categorias) {
      await api.put('/api/categorias/' + cat.idcategoria, { idarea: parseInt(idAreaDestino) });
    }
    
    // Mover empleados si se seleccionó un destino
    if (idEmpDestino !== '0') {
      const empsRes = await api.get('/api/areas/' + idArea + '/empleados-todos');
      const empleados = empsRes.success ? (empsRes.data || []) : [];
      
      for (const emp of empleados) {
        await api.post('/api/areas/' + parseInt(idEmpDestino) + '/empleados/' + emp.idempleado);
      }
    }
    
    // Eliminar el área
    const delRes = await api.del('/api/areas/' + idArea);
    if (!delRes.success) throw new Error(delRes.error);
    
    toast('Área eliminada y recursos reasignados');
    closeModal();
    navigate('admin-areas');
  } catch(e) {
    toast(e.message || 'Error al eliminar', false);
  }
}

// Confirmar eliminación simple de área (solo empleados)
async function confirmarDeleteAreaSimple(idArea) {
  const empDestinoSelect = document.getElementById('empAreaDestinoSelect');
  const idEmpDestino = empDestinoSelect ? empDestinoSelect.value : '0';
  
  try {
    // Mover empleados si se seleccionó un destino
    if (idEmpDestino !== '0') {
      const empsRes = await api.get('/api/areas/' + idArea + '/empleados-todos');
      const empleados = empsRes.success ? (empsRes.data || []) : [];
      
      for (const emp of empleados) {
        await api.post('/api/areas/' + parseInt(idEmpDestino) + '/empleados/' + emp.idempleado);
      }
    }
    
    // Eliminar el área
    const delRes = await api.del('/api/areas/' + idArea);
    if (!delRes.success) throw new Error(delRes.error);
    
    toast('Área eliminada');
    closeModal();
    navigate('admin-areas');
  } catch(e) {
    toast(e.message || 'Error al eliminar', false);
  }
}

async function loadAreaPanel(id){
  const ct=$('areaContent_'+id);if(!ct)return;
  try{
    const[empsTodos,cat]=await Promise.all([
      api.get('/api/areas/'+id+'/empleados-todos'),
      api.get('/api/categorias/area/'+id)
    ]);
    const empList=empsTodos.success?empsTodos.data||[]:[];
    const catList=cat.success?cat.data||[]:[];
    
    const badge=$('areaEmpCount_'+id);
    if(badge) badge.textContent=empList.length+' empleados totales';
    
    var empHtml=empList.length?'<div class="space-y-1.5">'+empList.map(function(e){
      var esFijo=e.esfijo===true||e.esfijo===1||e.esfijo==='true';
      var fijoBadge=esFijo?'<span class="text-xs text-menta ml-2"><i class="fa-solid fa-check-circle"></i> Fijo</span>':'<span class="text-xs text-amber-500 ml-2"><i class="fa-solid fa-clock"></i> Suplente</span>';
      return '<div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm"><div><span class="font-medium">'+e.nombre+'</span>'+fijoBadge+'</div><button onclick="quitarEmpleadoArea('+id+','+e.idempleado+',\''+e.nombre.replace(/'/g,"\\'")+'\')" class="text-xs text-red-400 hover:text-red-500"><i class="fa-solid fa-circle-xmark"></i></button></div>';
    }).join('')+'</div>':'<p class="text-xs text-[#9ca3af] py-2">Sin empleados asignados</p>';
    
    var catHtml=catList.length?'<div class="space-y-1.5">'+catList.map(function(c){
      return '<div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm"><span>'+(c.categorianombre||c.nombre||'')+'</span><button onclick="eliminarCategoria('+c.idcategoria+',\''+((c.categorianombre||c.nombre||'')).replace(/'/g,"\\'")+'\')" class="text-xs text-red-400 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button></div>';
    }).join('')+'</div>':'<p class="text-xs text-[#9ca3af] py-2">Sin categorías</p>';
    
    ct.innerHTML='<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><div class="flex items-center justify-between mb-2"><h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider"><i class="fa-solid fa-user-tie text-menta mr-1"></i>Empleados</h5><button onclick="agregarEmpleadoArea('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium"><i class="fa-solid fa-plus"></i> Agregar</button></div>'+empHtml+'</div><div><div class="flex items-center justify-between mb-2"><h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider"><i class="fa-solid fa-tags text-menta mr-1"></i>Categorías</h5><button onclick="agregarCategoriaArea('+id+')" class="text-xs text-menta hover:text-menta-600 font-medium"><i class="fa-solid fa-plus"></i> Agregar</button></div>'+catHtml+'</div></div>';
  }catch(e){ct.innerHTML='<p class="text-xs text-red-400">Error al cargar panel</p>'}
}
function toggleArea(id){const p=$(('areaPanel_'+id));if(expandedArea===id){expandedArea=null;p.classList.add('hidden');return;}if(expandedArea){const old=$(('areaPanel_'+expandedArea));if(old)old.classList.add('hidden')}expandedArea=id;p.classList.remove('hidden');loadAreaPanel(id);}
async function agregarCategoriaArea(idArea){
  try{
    const cats=await api.get('/api/categorias');
    if(!cats.success)return toast('Error al cargar categorías',false);
    const existentes=cats.data||[];
    openModal('<div class="p-6" style="max-width: 380px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-tag text-menta mr-2"></i>Agregar Categoría</h3><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Categoría *</label><select id="catSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"><option value="">Seleccionar categoría</option>'+(existentes.length?existentes.map(c=>'<option value="'+c.idcategoria+'">'+(c.categorianombre||c.nombre||'')+'</option>').join(''):'')+'</select></div></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarCategoriaArea('+idArea+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Agregar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function guardarCategoriaArea(idArea){
  const idcategoria=$('catSelect')?.value;
  if(!idcategoria)return toast('Selecciona una categoría',false);
  try{
    const d=await api.put('/api/categorias/'+idcategoria,{idarea:idArea});
    if(!d.success)return toast(d.error||'Error',false);
    toast('Categoría asignada al área');closeModal();loadAreaPanel(idArea);
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function eliminarCategoria(id,nombre){
  // Usar la nueva función que maneja el movimiento de tratamientos
  deleteCategoriaConTratamientos(id, nombre);
}
async function agregarEmpleadoArea(idArea){
  try{
    const[todosR,yaR]=await Promise.all([api.get('/api/empleados'),api.get('/api/areas/'+idArea+'/empleados')]);
    if(!todosR.success)return toast('Error al cargar empleados',false);
    const yaIds=(yaR.success?(yaR.data||[]):[]).map(e=>e.idempleado);
    const disponibles=(todosR.data||[]).filter(e=>!yaIds.includes(e.idempleado));
    if(!disponibles.length)return toast('Todos los empleados ya están asignados a esta área',false);
    openModal('<div class="p-6" style="max-width:380px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-5"><i class="fa-solid fa-user-tie text-menta mr-2"></i>Agregar Empleado</h3><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Empleado *</label><select id="empAreaSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"><option value="">Seleccionar empleado...</option>'+disponibles.map(function(e){return '<option value="'+e.idempleado+'">'+e.nombre+'</option>'}).join('')+'</select></div></div><div class="flex gap-2 mt-6"><button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarEmpleadoArea('+idArea+')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Agregar</button></div></div>');
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function guardarEmpleadoArea(idArea){
  var idempleado=$('empAreaSelect')?.value;
  if(!idempleado)return toast('Selecciona un empleado',false);
  try{
    var d=await api.post('/api/areas/'+idArea+'/empleados/'+idempleado);
    if(!d.success)return toast(d.error||'Error',false);
    toast('Empleado asignado al área');closeModal();loadAreaPanel(idArea);
  }catch(e){toast(e.message||'Error de conexión',false)}
}
async function quitarEmpleadoArea(idArea, idEmpleado, nombre) {
  try {
    const areasRes = await api.get('/api/areas');
    const otrasAreas = areasRes.success ? (areasRes.data || []).filter(a => a.idarea !== idArea) : [];

    let modalHtml = '<div class="p-6" style="max-width:450px">';
    modalHtml += '<h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-user-tie text-menta mr-2"></i>' + nombre + '</h3>';
    modalHtml += '<p class="text-sm text-[#6b7280] mb-4">¿Qué deseas hacer con este empleado?</p>';

    if (otrasAreas.length > 0) {
      modalHtml += '<div class="mb-4 p-4 bg-menta-50 rounded-xl border border-menta/20">';
      modalHtml += '<label class="flex items-center gap-3 cursor-pointer">';
      modalHtml += '<input type="radio" name="accionEmpleado" value="mover" class="w-4 h-4 text-menta focus:ring-menta/30" checked>';
      modalHtml += '<div><p class="font-medium text-sm text-[#2c3e50]">Mover a otra área</p></div></label>';
      modalHtml += '<select id="moverEmpAreaSelect" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm mt-2">';
      modalHtml += '<option value="">Seleccionar área destino...</option>';
      modalHtml += otrasAreas.map(a => '<option value="' + a.idarea + '">' + a.nombre + '</option>').join('');
      modalHtml += '</select></div>';
    }

    modalHtml += '<div class="mb-4 p-4 bg-red-50 rounded-xl border border-red-100">';
    modalHtml += '<label class="flex items-center gap-3 cursor-pointer">';
    modalHtml += '<input type="radio" name="accionEmpleado" value="quitar"' + (otrasAreas.length === 0 ? ' checked' : '') + ' class="w-4 h-4 text-red-500 focus:ring-red/30">';
    modalHtml += '<div><p class="font-medium text-sm text-[#2c3e50]">Solo quitar del área</p>';
    modalHtml += '<p class="text-xs text-[#6b7280]">El empleado dejará de pertenecer a esta área</p></div></label>';
    modalHtml += '</div>';

    modalHtml += '<div class="flex gap-2">';
    modalHtml += '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>';
    modalHtml += '<button onclick="confirmarAccionEmpleadoArea(' + idArea + ',' + idEmpleado + ',\'' + nombre.replace(/'/g, "\\'") + '\')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Confirmar</button>';
    modalHtml += '</div></div>';

    openModal(modalHtml);
  } catch (e) {
    toast(e.message || 'Error de conexión', false);
  }
}

async function confirmarAccionEmpleadoArea(idArea, idEmpleado, nombre) {
  const seleccion = document.querySelector('input[name="accionEmpleado"]:checked');
  if (!seleccion) return toast('Selecciona una opción', false);

  if (seleccion.value === 'mover') {
    const idAreaDestino = document.getElementById('moverEmpAreaSelect')?.value;
    if (!idAreaDestino) return toast('Selecciona un área destino', false);
    try {
      await api.post('/api/areas/' + parseInt(idAreaDestino) + '/empleados/' + idEmpleado);
      await api.del('/api/areas/' + idArea + '/empleados/' + idEmpleado);
      toast('Empleado movido a nueva área');
      closeModal();
      loadAreaPanel(idArea);
    } catch (e) {
      toast(e.message || 'Error al mover', false);
    }
  } else {
    try {
      const d = await api.del('/api/areas/' + idArea + '/empleados/' + idEmpleado);
      if (!d.success) throw new Error(d.error);
      toast('Empleado quitado del área');
      closeModal();
      loadAreaPanel(idArea);
    } catch (e) {
      toast(e.message || 'Error al quitar', false);
    }
  }
}

// Función para mover empleado a otra área
async function moverEmpleadoAOtraArea(idAreaOrigen, idEmpleado) {
  const areaDestinoSelect = document.getElementById('moverEmpAreaSelect');
  const idAreaDestino = areaDestinoSelect ? areaDestinoSelect.value : null;
  
  if (!idAreaDestino) {
    toast('Selecciona un área destino', false);
    return;
  }
  
  try {
    const d = await api.post('/api/areas/' + parseInt(idAreaDestino) + '/empleados/' + idEmpleado);
    if (!d.success) throw new Error(d.error);
    
    toast('Empleado movido a la nueva área');
    closeModal();
    loadAreaPanel(idAreaOrigen);
  } catch(e) {
    toast(e.message || 'Error al mover empleado', false);
  }
}




// Admin: Reportes hub — acceso a informes + reportes generales
SCREENS['admin-reportes'] = async () => {
  const ct = $('pageContent');
  ct.innerHTML = `
    <div class="fade-in">
      <h3 class="text-lg font-semibold text-[#2c3e50] mb-5">
        <i class="fa-solid fa-chart-pie text-menta mr-2"></i>Reportes
      </h3>
      <div class="flex flex-col gap-4">

        <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
             onclick="_renderReporteScreen($('pageContent'))">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-lavender-100 flex items-center justify-center">
              <i class="fa-solid fa-chart-bar text-spa text-2xl"></i>
            </div>
            <div>
              <h4 class="font-semibold text-[#2c3e50]">Reportes Generales</h4>
              <p class="text-sm text-[#6b7280] mt-0.5">Top tratamientos, historial de clientes, estadísticas del día</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
             onclick="navigate('admin-informe-ingresos')">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-menta-50 flex items-center justify-center">
              <i class="fa-solid fa-dollar-sign text-menta text-2xl"></i>
            </div>
            <div>
              <h4 class="font-semibold text-[#2c3e50]">Informe de Ingresos</h4>
              <p class="text-sm text-[#6b7280] mt-0.5">Ingresos por mes, paquetes vendidos y tratamientos individuales</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
             onclick="navigate('admin-informe-discrepancia')">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-amber-500 text-2xl"></i>
            </div>
            <div>
              <h4 class="font-semibold text-[#2c3e50]">Informe de Discrepancias</h4>
              <p class="text-sm text-[#6b7280] mt-0.5">Comparación entre tratamientos planificados y realizados por mes</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
};
// Admin: Informe Ingresos — MODIFICADO: muestra todos los meses con detalle expandible
SCREENS['admin-informe-ingresos']=async()=>{
  const ct=$('pageContent');ct.innerHTML=showLoading('Generando informe de ingresos...');
  try{
    const mesesNom=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    
    // Obtener todos los meses disponibles desde marzo 2026
    const fechaInicio = dayjs('2026-03-01');
    const fechaFin = dayjs();
    const mesesDisponibles = [];
    let fechaActual = fechaInicio;
    
    while (fechaActual.isBefore(fechaFin) || fechaActual.isSame(fechaFin, 'month')) {
      mesesDisponibles.push({
        valor: fechaActual.format('YYYY-MM'),
        anio: fechaActual.year(),
        mes: fechaActual.month() + 1,
        label: mesesNom[fechaActual.month()] + ' ' + fechaActual.format('YYYY')
      });
      fechaActual = fechaActual.add(1, 'month');
    }
    
    // Intentar obtener datos del endpoint real
    let ingData = [];
    let topData = [];
    let totalGeneral = 0;
    
    try {
      const [ingRes, topRes] = await Promise.all([
        api.get('/api/reportes/ingresos'),
        api.get('/api/reportes/top-tratamientos')
      ]);
      
      ingData = ingRes.success ? ingRes.data || [] : [];
      topData = topRes.success ? topRes.data || [] : [];
      totalGeneral = ingData.reduce((s, m) => s + Number(m.total || m.ingresos || 0), 0);
    } catch(e) {
      // Si falla el endpoint, generar datos desde las citas y paquetes
      const [citas, pqv] = await Promise.all([
        api.get('/api/citas'),
        api.get('/api/paquetes-vendidos')
      ]);
      
      const realizadas = (citas.success ? (citas.data || []) : []).filter(c => c.estado === 'realizada');
      const paqVend = pqv.success ? pqv.data || [] : [];
      
      // Procesar datos por mes
      const mesesData = {};
      mesesDisponibles.forEach(m => {
        mesesData[m.valor] = {
          ...m,
          cantidad_paquetes_vendidos: 0,
          ingresos_paquete: 0,
          cantidad_tratamientos_individuales: 0,
          ingresos_tratamientos: 0,
          ingresos_totales: 0
        };
      });
      
      realizadas.forEach(c => {
        if (!c.fecha) return;
        const key = dayjs(c.fecha).format('YYYY-MM');
        if (mesesData[key]) {
          mesesData[key].cantidad_tratamientos_individuales++;
          mesesData[key].ingresos_tratamientos += Number(c.precio || 0);
        }
      });
      
      paqVend.forEach(p => {
        if (!p.fechacompra) return;
        const key = dayjs(p.fechacompra).format('YYYY-MM');
        if (mesesData[key]) {
          mesesData[key].cantidad_paquetes_vendidos++;
          mesesData[key].ingresos_paquete += Number(p.precio || 0);
        }
      });
      
      // Calcular totales
      Object.values(mesesData).forEach(m => {
        m.ingresos_totales = m.ingresos_tratamientos + m.ingresos_paquete;
      });
      
      ingData = Object.values(mesesData).sort((a, b) => b.valor.localeCompare(a.valor));
      totalGeneral = ingData.reduce((s, m) => s + m.ingresos_totales, 0);
    }
    
    // Construir tarjetas expandibles por mes
    let mesCards = '';
    
    if (ingData.length > 0) {
      const sortedData = [...ingData].sort((a, b) => {
        const ka = (a.anio || a.year || 0) + '-' + String(a.mes || a.month || 0).padStart(2, '0');
        const kb = (b.anio || b.year || 0) + '-' + String(b.mes || b.month || 0).padStart(2, '0');
        return kb.localeCompare(ka);
      });
      
      mesCards = sortedData.map((m, index) => {
        const mesKey = m.valor || (m.anio + '-' + String(m.mes).padStart(2, '0'));
        const label = m.label || (mesesNom[(m.mes || 1) - 1] + ' ' + (m.anio || ''));
        const tot = Number(m.total || m.ingresos || m.ingresos_totales || 0);
        const citasCnt = Number(m.citas || m.totalcitas || m.cantidad_tratamientos_individuales || 0);
        const paqCnt = Number(m.paquetes || m.totalpaquetes || m.cantidad_paquetes_vendidos || 0);
        const ingresosTrat = Number(m.ingresos_tratamientos || 0);
        const ingresosPaq = Number(m.ingresos_paquete || 0);
        
        return `<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden">
          <div class="p-5 cursor-pointer hover:bg-[#f8fafc] transition-colors" onclick="toggleMesDetalle('mesDetalle_${index}')">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-[#2c3e50] text-sm">${label}</h4>
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-menta">${$$(tot)}</span>
                <i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform mesChevron_${index}"></i>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between">
                <span class="text-[#6b7280]">Tratamientos</span>
                <span class="font-medium">${citasCnt} (${$$(ingresosTrat)})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#6b7280]">Paquetes</span>
                <span class="font-medium">${paqCnt} (${$$(ingresosPaq)})</span>
              </div>
            </div>
          </div>
          <div id="mesDetalle_${index}" class="hidden border-t border-[#e8ecf1] bg-[#f8fafc] p-5">
            <div class="space-y-3">
              <div class="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#e8ecf1]">
                <div>
                  <p class="text-sm font-medium text-[#2c3e50]">Tratamientos Individuales</p>
                  <p class="text-xs text-[#6b7280]">Cantidad de citas realizadas</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-menta">${citasCnt}</p>
                  <p class="text-xs text-[#6b7280]">${$$(ingresosTrat)}</p>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#e8ecf1]">
                <div>
                  <p class="text-sm font-medium text-[#2c3e50]">Paquetes Vendidos</p>
                  <p class="text-xs text-[#6b7280]">Cantidad de paquetes vendidos</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-amber-600">${paqCnt}</p>
                  <p class="text-xs text-[#6b7280]">${$$(ingresosPaq)}</p>
                </div>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-menta-50 to-menta-100 rounded-xl border border-menta-200">
                <div>
                  <p class="text-sm font-semibold text-[#2c3e50]">Total del Mes</p>
                  <p class="text-xs text-[#6b7280]">Ingresos totales</p>
                </div>
                <p class="text-xl font-bold text-menta">${$$(tot)}</p>
              </div>
            </div>
          </div>
        </div>`;
      }).join('');
    } else {
      mesCards = '<p class="text-sm text-[#9ca3af] text-center py-8">No hay datos de ingresos disponibles</p>';
    }
    
    // Top tratamientos
    const topColors = ['bg-amber-100 text-amber-600', 'bg-gray-100 text-gray-500', 'bg-orange-50 text-orange-400'];
    const topHtml = topData.length ? '<div class="space-y-2">' + topData.map((t, i) => 
      '<div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e8ecf1]">' +
      '<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ' + topColors[i] + '">' + (i + 1) + '</div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="text-sm font-medium text-[#2c3e50] truncate">' + (t.tratamientonombre || t.nombre || '-') + '</p>' +
      '<p class="text-xs text-[#6b7280]">' + (t.totalcitas || t.cantidad || 0) + ' citas</p>' +
      '</div>' +
      '<span class="text-sm font-semibold text-menta">' + $$(t.ingresos || t.total || 0) + '</span>' +
      '</div>'
    ).join('') + '</div>' : '<p class="text-sm text-[#9ca3af] py-3 text-center">Sin datos de top tratamientos</p>';
    
    ct.innerHTML = '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-file-invoice-dollar text-menta mr-2"></i>Informe de Ingresos</h3><span class="px-3 py-1.5 bg-menta-50 text-menta-700 text-sm font-semibold rounded-full">Total General: ' + $$(totalGeneral) + '</span></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6"><div class="lg:col-span-2"><h4 class="font-semibold text-[#2c3e50] mb-3 text-sm"><i class="fa-solid fa-calendar-alt text-menta mr-1.5"></i>Ingresos por Mes</h4><div class="space-y-3">' + mesCards + '</div></div><div><h4 class="font-semibold text-[#2c3e50] mb-3 text-sm"><i class="fa-solid fa-trophy text-amber-500 mr-1.5"></i>Top 3 Tratamientos</h4>' + topHtml + '</div></div></div>';
  } catch(e) {
    ct.innerHTML = showEmpty('fa-solid fa-circle-exclamation', 'Error', 'Ocurrió un error al generar el informe.', 'Reintentar', "navigate('admin-informe-ingresos')");
  }
};
function toggleMesDetalle(id) {
  const detalle = document.getElementById(id);
  if (!detalle) return;
  
  const index = id.replace('mesDetalle_', '');
  const chevron = document.querySelector('.mesChevron_' + index);
  
  if (detalle.classList.contains('hidden')) {
    detalle.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    detalle.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}





SCREENS['admin-ventas'] = async () => {
  const ct = $('pageContent');
  ct.innerHTML = showLoading('Cargando ventas...');
  try{
    const citasRes = await api.get('/api/citas');
    const paquetesRes = await api.get('/api/paquetes-vendidos');
    
    const citas = (citasRes.success ? citasRes.data || [] : []).filter(c => c.estado === 'realizada');
    const paquetes = paquetesRes.success ? paquetesRes.data || [] : [];
    
    const totalCitas = citas.reduce((sum, c) => {
      const precio = parseFloat(c.precio) || parseFloat(c.monto) || parseFloat(c.total) || 0;
      return sum + precio;
    }, 0);
    
    const totalPaquetes = paquetes.reduce((sum, p) => {
      const precio = parseFloat(p.precio) || parseFloat(p.monto) || parseFloat(p.total) || 0;
      return sum + precio;
    }, 0);
    const totalGeneral = totalCitas + totalPaquetes;
    
    ct.innerHTML = '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-chart-line text-menta mr-2"></i>Ventas - Resumen General</h3></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><div class="bg-gradient-to-br from-menta-50 to-menta-100 rounded-2xl p-5 shadow-sm"><div class="flex items-center justify-between"><div><p class="text-xs text-menta-700 font-medium">Tratamientos Individuales</p><p class="text-2xl font-bold text-menta-800 mt-1">'+$$(totalCitas)+'</p><p class="text-xs text-menta-600 mt-1">'+citas.length+' citas realizadas</p></div><div class="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center"><i class="fa-solid fa-spa text-menta text-xl"></i></div></div></div><div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 shadow-sm"><div class="flex items-center justify-between"><div><p class="text-xs text-amber-700 font-medium">Paquetes Vendidos</p><p class="text-2xl font-bold text-amber-800 mt-1">'+$$(totalPaquetes)+'</p><p class="text-xs text-amber-600 mt-1">'+paquetes.length+' paquetes</p></div><div class="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center"><i class="fa-solid fa-gift text-amber-500 text-xl"></i></div></div></div><div class="bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-2xl p-5 shadow-sm"><div class="flex items-center justify-between"><div><p class="text-xs text-white/70 font-medium">Total General</p><p class="text-2xl font-bold text-white mt-1">'+$$(totalGeneral)+'</p><p class="text-xs text-white/50 mt-1">Ingresos totales</p></div><div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid fa-coins text-white text-xl"></i></div></div></div></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="border-b border-[#e8ecf1]"><div class="flex gap-1 p-2"><button onclick="mostrarVentasTab(\'tratamientos\')" id="tabTratamientosBtn" class="px-4 py-2 text-sm font-medium rounded-lg bg-menta text-white shadow-sm">Tratamientos Individuales</button><button onclick="mostrarVentasTab(\'paquetes\')" id="tabPaquetesBtn" class="px-4 py-2 text-sm font-medium rounded-lg text-[#6b7280] hover:bg-gray-50">Paquetes Vendidos</button></div></div><div id="ventasTabContent" class="p-5">'+renderVentasTratamientos(citas)+'</div></div></div>';
  } catch(e){
    ct.innerHTML = showEmpty('fa-solid fa-circle-exclamation', 'Error', 'Ocurrió un error al cargar las ventas.');
  }
};

function renderVentasTratamientos(citas){
  if(!citas.length){
    return '<div class="text-center py-12"><i class="fa-solid fa-calendar-xmark text-4xl text-[#d1d5db] mb-3 block"></i><p class="text-[#6b7280]">No hay tratamientos individuales realizados</p></div>';
  }
  return '<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b-2 border-[#e8ecf1]"><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Fecha</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Cliente</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Tratamiento</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Empleado</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Precio</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Estado</th></tr></thead><tbody class="divide-y divide-[#f1f5f9]">'+citas.map(function(c){
    return '<tr class="hover:bg-[#f8fafc] transition-colors"><td class="py-3 px-4 text-[#2c3e50]">'+formatDateShort(c.fecha)+'</td><td class="py-3 px-4 text-[#2c3e50]">'+(c.clientenombre||'-')+'</td><td class="py-3 px-4 text-[#2c3e50]">'+(c.tratamientonombre||'-')+'</td><td class="py-3 px-4 text-[#2c3e50]">'+(c.empleadonombre||'-')+'</td><td class="py-3 px-4 text-[#2c3e50]">'+$$(c.precio)+'</td><td class="py-3 px-4"><span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-menta-50 text-menta-700">Realizada</span></td></tr>';
  }).join('')+'</tbody></table></div>';
}

function renderVentasPaquetes(paquetes){
  if(!paquetes.length){
    return '<div class="text-center py-12"><i class="fa-solid fa-gift text-4xl text-[#d1d5db] mb-3 block"></i><p class="text-[#6b7280]">No hay paquetes vendidos</p></div>';
  }
  return '<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b-2 border-[#e8ecf1]"><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Fecha Compra</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Cliente</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Paquete</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Precio</th><th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">Estado</th></tr></thead><tbody class="divide-y divide-[#f1f5f9]">'+paquetes.map(function(p){
    var hoy=dayjs().format('YYYY-MM-DD');
    var activo=dayjs(p.fechainicio).format('YYYY-MM-DD')<=hoy&&dayjs(p.fechafin).format('YYYY-MM-DD')>=hoy;
    return '<tr class="hover:bg-[#f8fafc] transition-colors"><td class="py-3 px-4 text-[#2c3e50]">'+formatDateShort(p.fechacompra)+'</td><td class="py-3 px-4 text-[#2c3e50]">'+(p.clientenombre||'-')+'</td><td class="py-3 px-4 text-[#2c3e50]">'+(p.paquetenombre||'-')+'</td><td class="py-3 px-4 text-[#2c3e50]">'+$$(p.precio)+'</td><td class="py-3 px-4"><span class="px-2 py-0.5 text-xs font-semibold rounded-full '+(activo?'bg-menta-50 text-menta-700':'bg-gray-100 text-gray-500')+'">'+(activo?'Activo':'Vencido')+'</span></td></tr>';
  }).join('')+'</tbody></table></div>';
}

async function mostrarVentasTab(tab){
  var tabTrat=document.getElementById('tabTratamientosBtn');
  var tabPaq=document.getElementById('tabPaquetesBtn');
  var content=document.getElementById('ventasTabContent');
  if(tab==='tratamientos'){
    tabTrat.classList.add('bg-menta','text-white');
    tabTrat.classList.remove('text-[#6b7280]','hover:bg-gray-50');
    tabPaq.classList.remove('bg-menta','text-white');
    tabPaq.classList.add('text-[#6b7280]','hover:bg-gray-50');
    content.innerHTML='<div class="flex justify-center py-8"><div class="w-8 h-8 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
    var citasRes=await api.get('/api/citas');
    var citas=(citasRes.success?citasRes.data||[]:[]).filter(function(c){return c.estado==='realizada';});
    content.innerHTML=renderVentasTratamientos(citas);
  } else {
    tabPaq.classList.add('bg-menta','text-white');
    tabPaq.classList.remove('text-[#6b7280]','hover:bg-gray-50');
    tabTrat.classList.remove('bg-menta','text-white');
    tabTrat.classList.add('text-[#6b7280]','hover:bg-gray-50');
    content.innerHTML='<div class="flex justify-center py-8"><div class="w-8 h-8 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
    var paqRes=await api.get('/api/paquetes-vendidos');
    var paquetes=paqRes.success?paqRes.data||[]:[];
    content.innerHTML=renderVentasPaquetes(paquetes);
  }
}

SCREENS['admin-informe-discrepancia'] = async () => {
  const ct = $('pageContent');
  ct.innerHTML = showLoading('Cargando informe de discrepancia...');
  try {
    const mesesNom = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const fechaInicio = dayjs('2026-03-01');
    const fechaFin = dayjs();
    const mesesOp = [];
    let fechaActual = fechaInicio;

    while (fechaActual.isBefore(fechaFin) || fechaActual.isSame(fechaFin, 'month')) {
      mesesOp.push({
        anio: fechaActual.year(),
        mes: fechaActual.month() + 1,
        label: mesesNom[fechaActual.month()] + ' ' + fechaActual.format('YYYY')
      });
      fechaActual = fechaActual.add(1, 'month');
    }
    mesesOp.reverse();

    ct.innerHTML = `
      <div class="fade-in">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-[#2c3e50]">
            <i class="fa-solid fa-file-excel text-menta mr-2"></i>Informe de Discrepancia
          </h3>
        </div>
        <p class="text-sm text-[#6b7280] mb-4">Selecciona un mes para ver el informe detallado:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${mesesOp.map(m => `
            <button onclick="verResumenDiscrepancias(${m.anio}, ${m.mes}, '${m.label}')"
              class="flex items-center gap-3 bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-4 hover:shadow-md hover:border-menta/30 transition-all text-left group">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-menta-50 transition-colors">
                <i class="fa-solid fa-calendar text-amber-500 group-hover:text-menta transition-colors"></i>
              </div>
              <div class="flex-1">
                <p class="font-medium text-[#2c3e50] text-sm">${m.label}</p>
                <p class="text-xs text-[#6b7280]">Ver discrepancias</p>
              </div>
              <i class="fa-solid fa-chevron-right text-[#9ca3af] text-xs"></i>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    ct.innerHTML = showEmpty('fa-solid fa-circle-exclamation', 'Error', 'Ocurrió un error.', 'Reintentar', "navigate('admin-informe-discrepancia')");
  }
};

async function verResumenDiscrepancias(anio, mes, label) {
  const ct = $('pageContent');
  ct.innerHTML = showLoading('Cargando resumen de tratamientos...');
  try {
    const d = await api.get(`/api/reportes/discrepancias/resumen/${anio}/${mes}`);
    if (!d.success) throw new Error(d.error || 'Error al cargar resumen');
    renderResumenDiscrepancias(ct, d.data || [], anio, mes, label);
  } catch (e) {
    ct.innerHTML = `
      <div class="fade-in">
        <div class="flex items-center gap-3 mb-5">
          <button onclick="navigate('admin-informe-discrepancia')" class="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-menta px-3 py-1.5 rounded-xl hover:bg-menta-50 transition-colors">
            <i class="fa-solid fa-arrow-left"></i> Volver
          </button>
          <span class="text-[#9ca3af]">/</span>
          <h3 class="text-lg font-semibold text-[#2c3e50]">${label}</h3>
        </div>
        <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-8 text-center">
          <i class="fa-solid fa-circle-exclamation text-red-400 text-4xl mb-3 block"></i>
          <p class="text-red-500">${e.message || 'Error al cargar los datos'}</p>
          <button onclick="navigate('admin-informe-discrepancia')" class="mt-4 px-4 py-2 bg-menta text-white rounded-xl text-sm">Volver</button>
        </div>
      </div>
    `;
  }
}

function renderResumenDiscrepancias(ct, data, anio, mes, label) {
  const MESES_NOM = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesLabel = MESES_NOM[mes - 1] + ' ' + anio;
 const colorDisc = (d) => d < 0 ? 'text-amber-500 font-semibold' : 'text-menta font-semibold';
const badgeDisc = (d) => d < 0
  ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-100">Exceso</span>'
  : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-menta-50 text-menta-700">OK</span>';
  const hayDiscrep = data.some(r => Number(r.discrepancia_citas || r.discrepancia || r.diferencia || 0) !== 0);

  const filas = data.length
    ? data.map(r => {
        const cantPlan = Number(r.total_citas_planificadas || r.citas_planificadas || r.cantidad_planificada || r.planificados || 0);
        const cantReal = Number(r.total_citas_realizadas  || r.citas_realizadas  || r.cantidad_realizada  || r.realizados  || 0);
        const discTrat = Number(r.discrepancia_citas || r.discrepancia || r.diferencia || 0) || (cantReal - cantPlan);
        const matPlan  = Number(r.total_material_planificado || r.materiales_planificados || r.mat_planificado || 0);
        const matReal  = Number(r.total_material_utilizado || r.materiales_usados || r.materiales_utilizados || r.mat_utilizado || 0);
        const discMat  = Number(r.discrepancia_material || r.discrepancia_materiales || 0) || (matReal - matPlan);
        const idTrat   = r.id_tratamiento || r.idtratamiento || r.id || '';
        const nomTrat  = (r.nombre_tratamiento || r.tratamiento || r.nombre || '—').replace(/'/g, "\\'");

        return `
          <tr class="hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9]">
            <td class="py-3 px-3 text-sm font-medium text-[#2c3e50]">${nomTrat}</td>
            <td class="py-3 px-3 text-center text-sm">${cantPlan}</td>
            <td class="py-3 px-3 text-center text-sm">${cantReal}</td>
            <td class="py-3 px-3 text-center"><span class="${colorDisc(discTrat)}">${discTrat > 0 ? '+' : ''}${discTrat}</span></td>
            <td class="py-3 px-3 text-center text-sm">${matPlan}</td>
            <td class="py-3 px-3 text-center text-sm">${matReal}</td>
            <td class="py-3 px-3 text-center"><span class="${colorDisc(discMat)}">${discMat > 0 ? '+' : ''}${discMat}</span></td>
            <td class="py-3 px-3 text-center">${badgeDisc(discTrat)}</td>
            <td class="py-3 px-3 text-center">
              ${idTrat
                ? `<button onclick="verDetalleDiscrepanciasTratamiento(${anio}, ${mes}, ${idTrat}, '${nomTrat}')"
                    class="px-3 py-1.5 bg-lavender-100 text-spa text-xs font-medium rounded-lg hover:bg-lavender-200 transition-colors whitespace-nowrap">
                    <i class="fa-solid fa-layer-group mr-1"></i>Ver materiales
                  </button>`
                : '-'}
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="9" class="py-12 text-center text-[#6b7280] text-sm">No hay datos para este mes</td></tr>';

  ct.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('admin-informe-discrepancia')" class="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-menta px-3 py-1.5 rounded-xl hover:bg-menta-50 transition-colors">
          <i class="fa-solid fa-arrow-left"></i> Volver
        </button>
        <span class="text-[#9ca3af]">/</span>
        <h3 class="text-lg font-semibold text-[#2c3e50]">${mesLabel}</h3>
        ${hayDiscrep
          ? '<span class="px-2.5 py-0.5 bg-red-50 text-red-500 text-xs font-semibold rounded-full border border-red-100 ml-1"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Con discrepancias</span>'
          : '<span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full ml-1"><i class="fa-solid fa-check mr-1"></i>Sin discrepancias</span>'}
      </div>
      <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#f8fafc] border-b-2 border-[#e8ecf1]">
                <th class="text-left py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Tratamiento</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase whitespace-nowrap">C. Planif.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase whitespace-nowrap">C. Realiz.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase">Disc.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase whitespace-nowrap">Mat. Plan.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase whitespace-nowrap">Mat. Util.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase whitespace-nowrap">Disc. Mat.</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase">Estado</th>
                <th class="text-center py-3 px-3 text-xs font-semibold text-[#6b7280] uppercase">Detalle</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function verDetalleDiscrepanciasTratamiento(anio, mes, idTratamiento, nomTrat) {
  openModal(showLoading('Cargando materiales...'));
  try {
    const d = await api.get(`/api/reportes/discrepancias/${anio}/${mes}`);
    if (!d.success) throw new Error(d.error || 'Error al cargar detalle');
    const materiales = (d.data || []).filter(r => Number(r.id_tratamiento || r.idtratamiento) === Number(idTratamiento));
    const MESES_NOM = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const mesLabel = MESES_NOM[mes - 1] + ' ' + anio;
   const colorD = (d) => d < 0 ? 'text-amber-500 font-semibold' : 'text-menta font-semibold';
const badgeD = (d) => d < 0
  ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-100">Exceso</span>'
  : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-menta-50 text-menta-700">OK</span>';
  
    const filasMat = materiales.length
      ? materiales.map(r => {
          const plan  = Number(r.cantidad_planificada_material || r.cantidad_planificada || r.planificado || 0);
          const usada = Number(r.cantidad_utilizada_material   || r.cantidad_utilizada   || r.utilizado   || 0);
          const diff  = Number(r.discrepancia_material || r.discrepancia || r.diferencia || 0) || (usada - plan);
          return `
            <tr class="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
              <td class="py-2.5 px-4 text-sm font-medium text-[#2c3e50]">${r.nombre_material || r.nombrematerial || r.material || r.nombre || '—'}</td>
              <td class="py-2.5 px-4 text-center text-sm">${plan}</td>
              <td class="py-2.5 px-4 text-center text-sm">${usada}</td>
              <td class="py-2.5 px-4 text-center"><span class="${colorD(diff)}">${diff > 0 ? '+' : ''}${diff}</span></td>
              <td class="py-2.5 px-4 text-center">${badgeD(diff)}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="5" class="py-8 text-center text-[#6b7280] text-sm">Sin datos de materiales</td></tr>';

    const modalContent = `
      <div class="p-6" style="max-width:560px">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[#2c3e50]">
            <i class="fa-solid fa-layer-group text-menta mr-2"></i>${nomTrat}
          </h3>
          <button onclick="closeModal()" class="text-[#9ca3af] hover:text-[#2c3e50] p-1 rounded-lg hover:bg-gray-100">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        <p class="text-xs text-[#9ca3af] mb-4">Detalle por material — ${mesLabel}</p>
        <div class="overflow-x-auto rounded-xl border border-[#e8ecf1]">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#f8fafc] border-b border-[#e8ecf1]">
                <th class="text-left py-2.5 px-4 text-xs font-semibold text-[#6b7280] uppercase">Material</th>
                <th class="text-center py-2.5 px-4 text-xs font-semibold text-[#6b7280] uppercase">Planificado</th>
                <th class="text-center py-2.5 px-4 text-xs font-semibold text-[#6b7280] uppercase">Utilizado</th>
                <th class="text-center py-2.5 px-4 text-xs font-semibold text-[#6b7280] uppercase">Diferencia</th>
                <th class="text-center py-2.5 px-4 text-xs font-semibold text-[#6b7280] uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>${filasMat}</tbody>
          </table>
        </div>
        <button onclick="closeModal()" class="mt-4 w-full px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cerrar</button>
      </div>
    `;

    const mb = document.getElementById('modalBody');
    if (mb) mb.innerHTML = modalContent;
    else openModal(modalContent);

  } catch (e) {
    closeModal();
    toast(e.message || 'Error al cargar materiales', false);
  }
}


SCREENS.inicio=async()=>{
  const ct=$('pageContent');
  ct.innerHTML=showLoading();
  try{
    const d=await api.get('/api/citas');
    if(!d.success){ct.innerHTML=showEmpty('fa-solid fa-calendar-xmark','Sin datos','No se pudieron cargar las citas.');return;}
    const hoy=dayjs().format('YYYY-MM-DD'),hoyCitas = d.data.filter(c => dayjs(c.fecha).format('YYYY-MM-DD') === hoy),pendientes=hoyCitas.filter(c=>c.estado==='pendiente'),realizadasHoy=hoyCitas.filter(c=>c.estado==='realizada');
    const ventasHoy=realizadasHoy.reduce((s,c)=>s+Number(c.precio||c.costo||0),0);
    const frases=['"El cuidado personal es la forma más profunda de amor propio." —','"Donde la calma y la belleza se encuentran." —','"Cada día es una oportunidad para renovarte." —','"Tu bienestar es nuestra inspiración." —'];
    const frase=frases[dayjs().day()%frases.length];
    ct.innerHTML='<div class="fade-in"><div class="bg-gradient-to-br from-menta via-menta-600 to-menta-700 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-md"><div class="absolute inset-0 pointer-events-none"><div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div><div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div><div class="absolute top-1/2 left-1/4 w-32 h-32 bg-spa-300/10 rounded-full blur-xl"></div></div><div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div class="flex items-center gap-3 mb-2"><div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><i class="fa-solid fa-spa text-white text-lg"></i></div><h2 class="text-white font-semibold text-lg">Bienvenido/a, '+(user?.username||'Usuario')+'</h2></div><p class="text-white/80 text-sm">Hoy es '+today()+'</p></div><div class="flex gap-3"><div class="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center"><p class="text-xs text-white/70">Citas Hoy</p><p class="text-xl font-bold text-white">'+hoyCitas.length+'</p></div><div class="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center"><p class="text-xs text-white/70">Ventas Hoy</p><p class="text-xl font-bold text-white">'+$$(ventasHoy)+'</p></div></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-menta-50 flex items-center justify-center"><i class="fa-solid fa-calendar-day text-menta"></i></div><div><p class="text-xs text-[#6b7280]">Citas Hoy</p><p class="text-2xl font-bold text-[#2c3e50]">'+hoyCitas.length+'</p></div></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><i class="fa-solid fa-hourglass-half text-amber-500"></i></div><div><p class="text-xs text-[#6b7280]">Pendientes</p><p class="text-2xl font-bold text-[#2c3e50]">'+pendientes.length+'</p></div></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-spa text-spa"></i></div><div><p class="text-xs text-[#6b7280]">Hoy</p><p class="text-lg font-semibold text-[#2c3e50]">'+today()+'</p></div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="lg:col-span-2 bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="px-5 py-4 border-b border-[#e8ecf1] flex items-center justify-between"><h3 class="font-semibold text-[#2c3e50]"><i class="fa-solid fa-clock text-menta mr-2"></i>Citas de Hoy</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">'+hoyCitas.length+'</span></div>'+(hoyCitas.length?renderTable([{label:'Hora',render:c=>formatTime(c.hora)},{label:'Cliente',render:c=>c.clientenombre||'-'},{label:'Tratamiento',render:c=>c.tratamientonombre||'-'},{label:'Estado',render:c=>'<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border '+sc(c.estado)+'">'+cap(c.estado)+'</span>'}],hoyCitas):'<div class="p-12 flex flex-col items-center gap-2 text-[#9ca3af]"><i class="fa-solid fa-calendar-check text-3xl"></i><p class="text-sm font-medium">¡Sin citas hoy!</p><p class="text-xs">Un día libre para ti y tu equipo.</p></div>')+'</div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-leaf text-menta"></i></div><h3 class="font-semibold text-[#2c3e50] text-sm">Ambiente del Día</h3></div><p class="text-sm text-[#6b7280] italic leading-relaxed">'+frase+'</p><p class="text-xs text-[#9ca3af] mt-2">Un espacio de calma y bienestar.</p><div class="flex gap-2 mt-4"><span class="w-2 h-2 rounded-full bg-menta"></span><span class="w-2 h-2 rounded-full bg-spa-300"></span><span class="w-2 h-2 rounded-full bg-blush"></span><span class="w-2 h-2 rounded-full bg-turquesa"></span></div></div></div></div>';
  }catch(e){ct.innerHTML=showEmpty('fa-solid fa-circle-exclamation','Error','Ocurrió un error al cargar el resumen.','Reintentar','navigate(\'inicio\')')}
};
// ============================================================
// SUB-MODAL: second layer on top of the main modal
// Used for "Agregar cliente" while cita modal stays open
// ============================================================
function openSubModal(html, cb) {
  let sm = document.getElementById('subModalContainer');
  if (!sm) {
    sm = document.createElement('div');
    sm.id = 'subModalContainer';
    sm.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4';
    sm.style.cssText = 'background:rgba(0,0,0,0.45);backdrop-filter:blur(2px)';
    sm.addEventListener('click', function(e){ if(e.target===sm) closeSubModal(); });
    document.body.appendChild(sm);
  }
  sm.innerHTML = '<div id="subModalBody" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in" onclick="event.stopPropagation()">' + html + '</div>';
  sm.style.display = 'flex';
  if (cb) setTimeout(cb, 50);
}
function closeSubModal() {
  const sm = document.getElementById('subModalContainer');
  if (sm) sm.style.display = 'none';
}

// ============================================================
// CANCELAR CITA
// ============================================================
function cancelarCita(id) {
  openConfirm(
    'Cancelar Cita',
    '¿Confirmas la cancelación de esta cita? Solo podrás reactivarla editándola.',
    async function() {
      try {
        const d = await api.put('/api/citas/' + id, { estado: 'cancelada' });
        if (!d.success) return toast(d.error || 'Error al cancelar', false);
        toast('Cita cancelada');
        SCREENS.citas();
      } catch(e) { toast(e.message || 'Error de conexión', false); }
    },
    true
  );
}

// ============================================================
// REALIZAR CITA — opens materials screen
// ============================================================
let _realizarMateriales = []; // working list of materials for this realization

async function realizarCita(idCita) {
  try {
    // Load cita details
    const citaRes = await api.get('/api/citas/' + idCita);
    if (!citaRes.success) { 
      toast('Error al cargar la cita', false); 
      return; 
    }
    const cita = citaRes.data;

    // Get treatment materials from the database using the correct endpoint
    const tratMatRes = await api.get('/api/tratamientos/' + cita.idtratamiento + '/materiales');
    
    // Get all available materials (for adding new ones)
    const allMatRes = await api.get('/api/materiales');

    // Build working materials list - set cantidad to 0 initially
    _realizarMateriales = [];
    if (tratMatRes.success && tratMatRes.data && tratMatRes.data.length) {
      tratMatRes.data.forEach(function(m) {
        _realizarMateriales.push({
          idmaterial: m.idmaterial,
          // ✅ CORREGIDO: usar 'nombrematerial' en lugar de 'nombre'
          nombre: m.nombrematerial || m.nombre || 'Material',
          cantidad: 0,
          cantidadPredeterminada: m.cantidad || 0,
          esPredeterminado: true
        });
      });
    } else {
      toast('Este tratamiento no tiene materiales asignados', false);
    }

    const todosLosMat = (allMatRes.success && allMatRes.data) ? allMatRes.data : [];

    _renderRealizarModal(idCita, cita, todosLosMat);
  } catch(e) {
    console.error('Error al cargar materiales:', e);
    toast(e.message || 'Error al cargar materiales', false);
  }
}

function _renderRealizarModal(idCita, cita, todosLosMat) {
  const matUsados = new Set(_realizarMateriales.map(m => m.idmaterial));
  const matDisponibles = todosLosMat.filter(m => !matUsados.has(m.idmaterial));

  const matListHtml = _realizarMateriales.length
    ? _realizarMateriales.map(function(m, i) {
        // Show default quantity in a small badge
        const defaultBadge = m.cantidadPredeterminada ? 
          `<span class="text-xs text-gray-400 ml-1">(default: ${m.cantidadPredeterminada})</span>` : '';
        
        return '<div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e8ecf1] mb-2">'
          + '<div class="flex-1 min-w-0">'
          + '<p class="text-sm font-medium text-[#2c3e50] truncate">' + m.nombre + defaultBadge + '</p>'
          + (m.esPredeterminado ? '<span class="text-xs text-menta font-medium">Material del tratamiento</span>' : '<span class="text-xs text-[#9ca3af]">Agregado</span>')
          + '</div>'
          + '<div class="flex items-center gap-2 flex-shrink-0">'
          + '<label class="text-xs text-[#6b7280]">Cant.:</label>'
          + '<input type="number" min="0" step="0.01" value="' + m.cantidad + '" class="w-20 px-2 py-1.5 border border-[#d1d5db] rounded-lg text-sm text-center" onchange="window._realizarCantidad(' + i + ',this.value)">'
          + '<button onclick="window._realizarQuitarMat(' + i + ')" class="p-1.5 text-[#d1d5db] hover:text-red-400 transition-colors" title="Quitar"><i class="fa-solid fa-xmark"></i></button>'
          + '</div></div>';
      }).join('')
    : '<p class="text-sm text-[#9ca3af] py-2 text-center">No hay materiales asignados a este tratamiento</p>';

  const addSelectHtml = matDisponibles.length
    ? '<select id="realizarAddSelect" class="flex-1 px-3 py-2 border border-[#d1d5db] rounded-xl text-sm">'
        + '<option value="">Seleccionar material a agregar...</option>'
        + matDisponibles.map(m => '<option value="' + m.idmaterial + '">' + m.nombre + '</option>').join('')
        + '</select>'
        + '<button onclick="window._realizarAgregarMat(' + idCita + ')" class="px-3 py-2 bg-menta text-white rounded-xl text-sm font-medium hover:bg-menta-600 flex-shrink-0"><i class="fa-solid fa-plus mr-1"></i>Agregar</button>'
    : '<p class="text-xs text-[#9ca3af]">No hay más materiales disponibles</p>';

  const html = '<div class="p-6" style="max-width:600px">'
    + '<div class="flex items-center justify-between mb-5">'
    + '<div><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-check-circle text-menta mr-2"></i>Realizar Cita</h3>'
    + '<p class="text-xs text-[#6b7280] mt-1">' + (cita.clientenombre || '') + ' — ' + (cita.tratamientonombre || '') + '</p></div>'
    + '<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-100 text-amber-700 border-amber-200">Pendiente</span>'
    + '</div>'
    + '<div class="mb-4">'
    + '<h4 class="text-sm font-semibold text-[#2c3e50] mb-2"><i class="fa-solid fa-box-open text-menta mr-1.5"></i>Materiales utilizados</h4>'
    + '<div class="text-xs text-[#6b7280] mb-2">Ingresa las cantidades utilizadas para cada material:</div>'
    + matListHtml
    + '</div>'
    + '<div class="border-t border-[#e8ecf1] pt-4 mb-4">'
    + '<h4 class="text-sm font-semibold text-[#2c3e50] mb-2"><i class="fa-solid fa-plus text-mentaverde-500 mr-1.5"></i>Agregar material extra</h4>'
    + '<div class="flex gap-2 items-center">' + addSelectHtml + '</div>'
    + '</div>'
    + '<div class="flex gap-2 mt-6">'
    + '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>'
    + '<button onclick="window._confirmarRealizarCita(' + idCita + ')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600 flex items-center justify-center gap-2"><i class="fa-solid fa-check"></i>Confirmar Realizada</button>'
    + '</div></div>';

  openModal(html);

  // Store data for later use
  window._todosLosMat = todosLosMat;
  window._realizarCitaId = idCita;
  window._realizarCitaData = cita;
}

// Update quantity for a material in the working list
window._realizarCantidad = function(idx, val) {
  if (_realizarMateriales[idx]) _realizarMateriales[idx].cantidad = parseFloat(val) || 0;
};

// Remove a material from working list and re-render
window._realizarQuitarMat = function(idx) {
  _realizarMateriales.splice(idx, 1);
  _renderRealizarModal(window._realizarCitaId, window._realizarCitaData, window._todosLosMat);
};

// Add a material from the dropdown
window._realizarAgregarMat = function(idCita) {
  const sel = document.getElementById('realizarAddSelect');
  if (!sel || !sel.value) { 
    toast('Selecciona un material', false); 
    return; 
  }
  const idm = parseInt(sel.value);
  const mat = window._todosLosMat.find(function(m){ return m.idmaterial === idm; });
  if (!mat) return;
  
  _realizarMateriales.push({ 
    idmaterial: mat.idmaterial, 
    nombre: mat.nombre, 
    cantidad: 0, // Start with 0
    cantidadPredeterminada: 0,
    esPredeterminado: false 
  });
  _renderRealizarModal(window._realizarCitaId, window._realizarCitaData, window._todosLosMat);
};

// Confirm: assign materials to cita and mark as realizada
// Confirm: assign materials to cita and mark as realizada
window._confirmarRealizarCita = async function(idCita) {
  console.log('=== INICIANDO CONFIRMACIÓN ===');
  console.log('ID Cita:', idCita);
  
  const citaId = Number(idCita);
  
  const hasMaterialsWithQuantity = _realizarMateriales.some(m => m.cantidad > 0);
  
  if (!hasMaterialsWithQuantity) {
    const userConfirmed = confirm('⚠️ No has registrado ningún material.\n¿Deseas continuar?');
    if (!userConfirmed) return;
  }

  try {
    const btn = document.querySelector('button[onclick*="_confirmarRealizarCita"]');
    if (btn) { 
      btn.disabled = true; 
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Guardando...'; 
    }

    // PASO 1: Marcar cita como realizada
    console.log('Paso 1: Actualizando estado de la cita...');
    const updateRes = await api.put(`/api/citas/${citaId}`, { estado: 'realizada' });
    
    if (!updateRes.success) {
      toast(updateRes.error || 'Error al actualizar cita', false);
      if (btn) btn.disabled = false;
      return;
    }
    console.log('✅ Cita actualizada a realizada');

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 200));

    // PASO 2: Insertar materiales con el campo correcto: 'cantidadutilizada'
    let assignedCount = 0;
    for (const m of _realizarMateriales) {
      if (m.cantidad > 0) {
        try {
          console.log(`Registrando material: ${m.nombre}, cantidad: ${m.cantidad}`);
          
          // ✅ CAMBIO IMPORTANTE: usar 'cantidadutilizada' en lugar de 'cantidad'
          const matRes = await api.post(`/api/citas/${citaId}/materiales/${m.idmaterial}`, {
            cantidadutilizada: m.cantidad
          });
          
          if (matRes.success) {
            assignedCount++;
            console.log(`✅ ${m.nombre} registrado`);
          } else {
            console.error(`Error con ${m.nombre}:`, matRes.error);
            toast(`Error: ${matRes.error}`, false);
          }
        } catch(e) {
          console.error(`Excepción con ${m.nombre}:`, e);
          toast(`Error al registrar ${m.nombre}: ${e.message}`, false);
        }
      }
    }

    toast(`✅ Cita realizada. ${assignedCount} material(es) registrado(s).`);
    closeModal();
    SCREENS.citas();
    
  } catch(e) {
    console.error('Error general:', e);
    toast(e.message || 'Error de conexión', false);
    const btn = document.querySelector('button[onclick*="_confirmarRealizarCita"]');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>Confirmar Realizada';
    }
  }
};


async function _renderPaqVendidosScreen(ct) {
  ct.innerHTML = showLoading('Cargando paquetes vendidos...');
  try {
    const d = await api.get('/api/paquetes-vendidos');
    if (!d.success) { ct.innerHTML = showEmpty('fa-solid fa-receipt', 'Sin datos', 'No se pudieron cargar los paquetes vendidos.'); return; }
    const paqList = d.data || [];
    ct.innerHTML = '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-receipt text-menta mr-2"></i>Paquetes Vendidos</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">' + paqList.length + '</span></div>'
      + (paqList.length ? '<div class="space-y-3">' + paqList.map(pv => {
         const hoy = dayjs().format('YYYY-MM-DD');
const inicio = dayjs(pv.fechainicio).format('YYYY-MM-DD');
const fin = dayjs(pv.fechafin).format('YYYY-MM-DD');
const esActivo = inicio <= hoy && fin >= hoy;
const estadoBadge = !esActivo
  ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Inactivo</span>'
  : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-menta-50 text-menta-700">Activo</span>';
          return '<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden">'
            + '<div class="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition-colors" onclick="togglePaqVendidoPanel(' + pv.idpaquetevendido + ')">'
            + '<div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><i class="fa-solid fa-box text-amber-500 text-sm"></i></div>'
            + '<div><h4 class="font-medium text-[#2c3e50]">' + (pv.paquetenombre || pv.nombre || 'Paquete #' + pv.idpaquetevendido) + '</h4>'
            + '<p class="text-xs text-[#6b7280]">' + (pv.clientenombre || 'Cliente') + ' &bull; Compra: ' + formatDateShort(pv.fechacompra) + '</p></div></div>'
            + '<div class="flex items-center gap-2">' + estadoBadge
            + '<span class="text-base font-bold text-menta">' + $$(pv.precio || 0) + '</span>'
            + '<i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform" id="paqVChev_' + pv.idpaquetevendido + '"></i></div></div>'
            + '<div id="paqVPanel_' + pv.idpaquetevendido + '" class="hidden border-t border-[#e8ecf1] bg-[#f8fafc]"><div class="p-4" id="paqVContent_' + pv.idpaquetevendido + '">' + showLoading() + '</div></div>'
            + '</div>';
        }).join('') + '</div>'
      : showEmpty('fa-solid fa-receipt', 'Sin paquetes vendidos', 'Aun no se han vendido paquetes.'))
      + '</div>';
  } catch(e) { ct.innerHTML = showEmpty('fa-solid fa-circle-exclamation', 'Error', 'Ocurrio un error.', 'Reintentar', "navigate('paquetes-vendidos')"); }
}
SCREENS['paquetes-vendidos'] = async () => _renderPaqVendidosScreen($('pageContent'));
SCREENS['admin-paquetes-vendidos'] = async () => _renderPaqVendidosScreen($('pageContent'));

let _expandedPaqV = null;
function togglePaqVendidoPanel(id) {
  const panel = $('paqVPanel_' + id);
  const chev = $('paqVChev_' + id);
  if (_expandedPaqV === id) {
    _expandedPaqV = null;
    if (panel) panel.classList.add('hidden');
    if (chev) chev.classList.remove('rotate-180');
    return;
  }
  if (_expandedPaqV) {
    const oldPanel = $('paqVPanel_' + _expandedPaqV);
    const oldChev = $('paqVChev_' + _expandedPaqV);
    if (oldPanel) oldPanel.classList.add('hidden');
    if (oldChev) oldChev.classList.remove('rotate-180');
  }
  _expandedPaqV = id;
  if (panel) panel.classList.remove('hidden');
  if (chev) chev.classList.add('rotate-180');
  loadPaqVendidoDetalle(id);
}
async function loadPaqVendidoDetalle(id) {
  const ct = $(`paqVContent_${id}`);
  if (!ct) return;
  
  try {
    // Obtener detalle del paquete vendido
    const d = await api.get('/api/paquetes-vendidos/' + id);
    if (!d.success) {
      ct.innerHTML = '<p class="text-xs text-red-400">Error al cargar detalle</p>';
      return;
    }
    
    const pv = d.data;
    
    // ✅ CORREGIDO: usar el endpoint correcto /paquete-vendido/
    let citasHtml = '<p class="text-xs text-[#9ca3af] py-2">Cargando citas...</p>';
    try {
      const cRes = await api.get('/api/citas/paquete-vendido/' + id);
      const citas = cRes.success ? (cRes.data || []) : [];
      
      console.log('Citas encontradas:', citas);
      
      citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      citasHtml = citas.length ? `
        <div class="space-y-2">
          <p class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Citas del paquete</p>
          ${citas.map(c => `
            <div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm">
              <div>
                <p class="font-medium text-[#2c3e50]">${c.tratamientonombre || '-'}</p>
                <p class="text-xs text-[#6b7280]">${formatDateShort(c.fecha)} ${formatTime(c.hora)}</p>
              </div>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full border ${sc(c.estado)}">${cap(c.estado)}</span>
            </div>
          `).join('')}
        </div>
      ` : '<p class="text-xs text-[#9ca3af] py-2">Sin citas registradas para este paquete</p>';
    } catch(e2) {
      console.error('Error al cargar citas:', e2);
      citasHtml = '<p class="text-xs text-red-300">Error al cargar citas: ' + (e2.message || '') + '</p>';
    }
    
    ct.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
            <i class="fa-solid fa-circle-info text-menta mr-1"></i>Información
          </h5>
          <div class="space-y-1.5">
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Paquete</span>
              <span class="font-medium">${pv.paquetenombre || '-'}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Cliente</span>
              <span class="font-medium">${pv.clientenombre || '-'}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Precio</span>
              <span class="font-bold text-menta">${$$(pv.precio || 0)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Compra</span>
              <span class="font-medium">${formatDateShort(pv.fechacompra)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Inicio</span>
              <span class="font-medium">${formatDateShort(pv.fechainicio)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Fin</span>
              <span class="font-medium">${formatDateShort(pv.fechafin)}</span>
            </div>
          </div>
        </div>
        <div>
          ${citasHtml}
        </div>
      </div>
    `;
  } catch(e) {
    console.error('Error:', e);
    ct.innerHTML = '<p class="text-xs text-red-400">Error al cargar detalle: ' + (e.message || '') + '</p>';
  }
}

// ============================================================
// REPORTES — Funciones auxiliares: autocomplete cliente + acciones
// ============================================================
async function rptAutocomplete() {
  const q = $('rptClienteInput')?.value; if (!q || q.length < 2) { $('rptClienteAC')?.classList.add('hidden'); return; }
  try {
    const d = await api.get('/api/clientes?q=' + encodeURIComponent(q));
    if (!d.success) return;
    const ac = $('rptClienteAC'); if (!ac) return;
    let html = '<div class="p-2 space-y-1">';
    if (d.data.length) {
      html += d.data.map(c => '<div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-[#2c3e50] flex items-center justify-between" onclick="rptSelCliente(' + c.idcliente + ',\'' + c.nombre.replace(/'/g, "\\'") + '\')"><span>' + c.nombre + '</span><span class="text-xs text-[#6b7280]">' + (c.telefono || '') + '</span></div>').join('');
    } else { html += '<div class="px-3 py-2 text-sm text-[#9ca3af]">Sin resultados</div>'; }
    html += '</div>';
    ac.innerHTML = html; ac.classList.remove('hidden');
  } catch(e) {}
}
function rptSelCliente(id, nombre) {
  const hi = $('rptClienteId'); const inp = $('rptClienteInput'); const ac = $('rptClienteAC');
  if (hi) hi.value = id; if (inp) inp.value = nombre; if (ac) ac.classList.add('hidden');
}
async function rptEmpleadosPorCliente() {
  const idcliente = $('rptClienteId')?.value;
  if (!idcliente) return toast('Selecciona un cliente primero', false);
  const res = $('rptClienteResultado'); if (!res) return;
  res.innerHTML = '<div class="flex justify-center py-3"><div class="w-5 h-5 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
  try {
    const d = await api.get('/api/reportes/empleados-por-cliente/' + idcliente);
    if (!d.success) { res.innerHTML = '<p class="text-xs text-red-400 text-center py-2">' + (d.error || 'Error') + '</p>'; return; }
    const emps = d.data || [];
    res.innerHTML = emps.length
      ? '<div class="mt-1"><p class="text-xs font-semibold text-[#6b7280] mb-1.5">Empleados que atendieron a este cliente:</p><div class="space-y-1">'
        + emps.map(e => '<div class="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e8ecf1]"><div class="w-6 h-6 rounded-full bg-menta-50 flex items-center justify-center"><i class="fa-solid fa-user-tie text-menta text-xs"></i></div><span class="text-xs font-medium text-[#2c3e50]">' + (e.nombre || '-') + '</span><span class="ml-auto text-xs text-[#6b7280]">' + (e.totalcitas || e.citas || '') + ' cita(s)</span></div>').join('')
        + '</div></div>'
      : '<p class="text-xs text-[#9ca3af] text-center py-2">No hay empleados registrados para este cliente</p>';
  } catch(e) { res.innerHTML = '<p class="text-xs text-red-400 text-center py-2">Error: ' + (e.message || '') + '</p>'; }
}
async function rptServiciosCliente() {
  const idcliente = $('rptClienteId')?.value;
  if (!idcliente) return toast('Selecciona un cliente primero', false);
  const desde = $('rptFechaDesde')?.value; const hasta = $('rptFechaHasta')?.value;
  if (!desde || !hasta) return toast('Selecciona las fechas de inicio y fin', false);
  const res = $('rptClienteResultado'); if (!res) return;
  res.innerHTML = '<div class="flex justify-center py-3"><div class="w-5 h-5 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
  try {
    const d = await api.get('/api/reportes/servicios-cliente/' + idcliente + '?fechaInicio=' + desde + '&fechaFin=' + hasta);
    if (!d.success) { res.innerHTML = '<p class="text-xs text-red-400 text-center py-2">' + (d.error || 'Error') + '</p>'; return; }
    const svcs = d.data || [];
    res.innerHTML = svcs.length
      ? '<div class="mt-1"><p class="text-xs font-semibold text-[#6b7280] mb-1.5">Servicios de ' + formatDateShort(desde) + ' a ' + formatDateShort(hasta) + ':</p><div class="space-y-1">'
        +svcs.map(s => '<div class="flex items-center justify-between px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e8ecf1]"><div><p class="text-xs font-medium text-[#2c3e50]">' + (s.nombre_servicio || '-') + '</p><p class="text-xs text-[#6b7280]">' + formatDateShort(s.fecha_servicio) + '</p></div><span class="text-xs font-semibold text-menta">' + (s.tipo_servicio || '') + '</span></div>').join('')
        + '</div></div>'
      : '<p class="text-xs text-[#9ca3af] text-center py-2">Sin servicios en el intervalo seleccionado</p>';
  } catch(e) { res.innerHTML = '<p class="text-xs text-red-400 text-center py-2">Error: ' + (e.message || '') + '</p>'; }
}
