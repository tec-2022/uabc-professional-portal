(() => {
  'use strict';

  const labelMap = new Map(Object.entries({
    'Gallery Albums':'Álbumes de galería',
    'Research Page':'Página de investigación',
    'Researchpage':'Página de investigación',
    'Contacts':'Datos de contacto',
    'Positions':'Posiciones académicas',
    'Education':'Formación académica',
    'More':'Información adicional',
    'Items':'Elementos',
    'Href':'Enlace',
    'Url':'Enlace',
    'URL':'Enlace',
    'Image':'Imagen',
    'Audio':'Audio',
    'Description':'Descripción',
    'Desc':'Descripción',
    'Abstract':'Resumen',
    'Label':'Nombre',
    'Sub':'Detalle',
    'Type':'Tipo',
    'Badge':'Distintivo',
    'Duration':'Duración',
    'Authors':'Autores',
    'Author':'Autor',
    'Objeto vacío':'Sin información todavía',
    'No hay contenido cargado.':'Todavía no hay contenido disponible.',
    'No hay elementos. Usa “Añadir”.':'Aún no hay elementos. Usa “Añadir” para crear uno.',
    'JSON exportado':'Copia descargada',
    'JSON importado':'Copia cargada',
    'Formato no válido':'El archivo seleccionado no corresponde a una copia válida del contenido'
  }));

  const sectionHelp = {
    home:'Edita aquí la información principal del perfil: nombre, presentación, trayectoria y datos que aparecen en Inicio.',
    eventos:'Administra los eventos próximos y pasados que aparecen en el portal.',
    publicaciones:'Agrega o corrige publicaciones académicas, años, autores y enlaces.',
    investigacion:'Organiza proyectos, líneas de investigación y colaboraciones.',
    docencia:'Edita cursos, materiales y experiencia docente.',
    blog:'Administra las entradas y textos del blog académico.',
    galeria:'Organiza imágenes y álbumes de la galería.',
    gallery_albums:'Organiza imágenes y álbumes de la galería.',
    podcast:'Edita episodios, descripciones y enlaces del podcast.',
    contacto:'Actualiza los medios de contacto que se muestran en el portal.'
  };

  function humanizeLabel(node) {
    const raw = node.textContent.trim();
    if (!raw) return;
    const direct = labelMap.get(raw);
    if (direct && direct !== raw) {
      node.textContent = direct;
      return;
    }
    for (const [technical, friendly] of labelMap.entries()) {
      if (raw.startsWith(`${technical} (`)) {
        node.textContent = raw.replace(technical, friendly);
        break;
      }
    }
  }

  function replaceTechnicalUi(root = document) {
    root.querySelectorAll?.('.field > label,.field-label,.object-head strong,.array-head strong,.nav-btn span:first-child').forEach(humanizeLabel);
    root.querySelectorAll?.('.empty').forEach(humanizeLabel);
    const toast = document.getElementById('toast');
    if (toast) humanizeLabel(toast);
  }

  function updateSectionHelp() {
    const editor = document.getElementById('editor');
    if (!editor?.parentElement) return;

    const active = document.querySelector('#sectionNav .nav-btn.active span:first-child')?.textContent.trim().toLowerCase() || '';
    const labels = {
      home:'inicio', eventos:'eventos', publicaciones:'publicaciones', investigacion:'investigación',
      docencia:'docencia', blog:'blog', galeria:'galería', gallery_albums:'álbumes de galería',
      podcast:'podcast', contacto:'contacto'
    };
    const key = Object.keys(sectionHelp).find(k => labels[k] === active);
    const help = sectionHelp[key] || 'Edita los campos de esta sección. Los cambios se guardan como borrador y no modifican el portal público.';

    let p = document.getElementById('sectionFriendlyHelp');
    if (!p) {
      p = document.createElement('p');
      p.id = 'sectionFriendlyHelp';
      p.className = 'editor-intro';
      editor.parentElement.insertBefore(p, editor);
    }
    if (p.textContent !== help) p.textContent = help;
  }

  function polishLanguage() {
    replaceTechnicalUi(document);
    updateSectionHelp();

    const status = document.getElementById('statusText');
    if (status) {
      const friendly = status.textContent
        .replace(/borrador local/gi, 'borrador')
        .replace(/sitio público/gi, 'portal público');
      if (friendly !== status.textContent) status.textContent = friendly;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    polishLanguage();

    const target = document.querySelector('.admin-shell');
    if (target) {
      const observer = new MutationObserver(() => {
        replaceTechnicalUi(target);
        updateSectionHelp();
      });
      observer.observe(target, { childList:true, subtree:true, characterData:true });
    }

    document.querySelectorAll('.admin-advanced button').forEach(button => {
      button.addEventListener('click', () => button.closest('details')?.removeAttribute('open'));
    });
  });
})();
