/* ═══════════════════════════════════════════════════
   KANBANFLOW — app.js
   Lógica completa: CRUD, Subtarefas, Comentários,
   Tags inteligentes, D&D, Perfil do usuário, Toast
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── SVG ICONS ─── */
const ICONS = {
  gripVertical: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`,
  moreVertical: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13" aria-hidden="true"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" width="11" height="11" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>`,
  messageCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  checkSquare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12" aria-hidden="true"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13" aria-hidden="true"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="13" height="13" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
};

/* ─── HELPERS ─── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function initials(name) {
  if (!name || !name.trim()) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function isOverdue(iso) {
  if (!iso) return false;
  return new Date(iso + 'T23:59:59') < new Date();
}

function isUrgent(iso) {
  if (!iso) return false;
  const diff = new Date(iso + 'T23:59:59') - new Date();
  return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
}

function escape(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'agora';
  if (s < 3600) return `${Math.floor(s/60)}m atrás`;
  if (s < 86400) return `${Math.floor(s/3600)}h atrás`;
  return `${Math.floor(s/86400)}d atrás`;
}

/* ─── STATE ─── */
const Store = {
  STORAGE_KEY: 'kanban_tasks_v2',
  PROFILE_KEY: 'kanban_profile',
  FILTER_KEY: 'kanban_filters',

  tasks: [],
  profile: { name: '', role: '' },
  filters: { search: '', priority: 'all', statuses: ['todo','doing','done'], tags: [] },
  editingId: null,
  dragId: null,
  confirmAction: null,

  load() {
    try {
      this.tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      this.profile = JSON.parse(localStorage.getItem(this.PROFILE_KEY) || '{"name":"","role":""}');
    } catch { this.tasks = []; this.profile = { name: '', role: '' }; }
    // Seed demo data if empty
    if (!this.tasks.length) this._seed();
  },

  save() {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks)); } catch {}
  },

  saveProfile() {
    try { localStorage.setItem(this.PROFILE_KEY, JSON.stringify(this.profile)); } catch {}
  },

  getTask(id) { return this.tasks.find(t => String(t.id) === String(id)); },

  addTask(data) {
    const task = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
    this.tasks.push(task);
    this.save();
    return task;
  },

  updateTask(id, data) {
    const idx = this.tasks.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() };
    this.save();
    return this.tasks[idx];
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => String(t.id) !== String(id));
    this.save();
  },

  clearDone() {
    this.tasks = this.tasks.filter(t => t.status !== 'done');
    this.save();
  },

  filteredTasks() {
    const f = this.filters;
    return this.tasks.filter(t => {
      if (!f.statuses.includes(t.status)) return false;
      if (f.priority !== 'all' && t.priority !== f.priority) return false;
      if (f.tags.length && !f.tags.every(ft => (t.tags||[]).includes(ft))) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        const haystack = `${t.title} ${t.description||''} ${(t.tags||[]).join(' ')} ${t.assignee||''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  },

  allTags() {
    const set = new Set();
    this.tasks.forEach(t => (t.tags||[]).forEach(tag => set.add(tag)));
    return [...set].sort();
  },

  taskProgress(task) {
    const subs = task.subtasks || [];
    if (!subs.length) return 0;
    return Math.round(subs.filter(s => s.done).length / subs.length * 100);
  },

  _seed() {
    const now = new Date();
    const fu = d => { const r = new Date(now); r.setDate(r.getDate()+d); return r.toISOString().slice(0,10); };
    this.tasks = [
      { id: 1, createdAt: new Date().toISOString(), title: 'Redesenhar tela de login', description: 'Atualizar com nova identidade visual e suporte a tema escuro.', status: 'todo', priority: 'high', tags: ['design','frontend'], due: fu(5), assignee: 'Ana Lima', subtasks: [{ id: 1, text: 'Criar wireframe', done: true }, { id: 2, text: 'Implementar componentes', done: false }, { id: 3, text: 'Testes de usabilidade', done: false }], comments: [] },
      { id: 2, createdAt: new Date().toISOString(), title: 'Documentar API de usuários', description: 'Escrever documentação dos endpoints no Swagger.', status: 'todo', priority: 'medium', tags: ['docs'], due: fu(12), assignee: 'Carlos Souza', subtasks: [{ id: 1, text: 'Listar todos endpoints', done: false }, { id: 2, text: 'Escrever exemplos', done: false }], comments: [] },
      { id: 3, createdAt: new Date().toISOString(), title: 'Criar página de onboarding', description: 'Fluxo de boas-vindas para novos usuários.', status: 'todo', priority: 'low', tags: ['feature'], due: fu(20), assignee: 'Beatriz Melo', subtasks: [], comments: [] },
      { id: 4, createdAt: new Date().toISOString(), title: 'Integrar pagamento via PIX', description: 'Implementar gerador de QR Code estático e dinâmico.', status: 'doing', priority: 'high', tags: ['backend','feature'], due: fu(-2), assignee: 'Diego Rios', subtasks: [{ id: 1, text: 'Estudar API do banco', done: true }, { id: 2, text: 'Gerar QR Code', done: true }, { id: 3, text: 'Validar callbacks', done: false }, { id: 4, text: 'Testar em staging', done: false }, { id: 5, text: 'Deploy para produção', done: false }], comments: [{ id: 1, author: 'Ana Lima', text: 'A documentação do banco está em /docs/pix', createdAt: new Date(Date.now()-7200000).toISOString() }] },
      { id: 5, createdAt: new Date().toISOString(), title: 'Corrigir overflow em tabelas', description: 'Bug de quebra de layout em telas menores que 768px.', status: 'doing', priority: 'medium', tags: ['frontend','bug'], due: fu(7), assignee: 'Fernanda Costa', subtasks: [{ id: 1, text: 'Reproduzir o bug', done: true }, { id: 2, text: 'Corrigir CSS', done: false }], comments: [] },
      { id: 6, createdAt: new Date().toISOString(), title: 'Configurar banco de dados de produção', description: 'Setup PostgreSQL com replicação e backups automáticos.', status: 'done', priority: 'high', tags: ['backend'], due: fu(-3), assignee: 'Ana Lima', subtasks: [{ id: 1, text: 'Configurar PostgreSQL', done: true }, { id: 2, text: 'Configurar replicação', done: true }, { id: 3, text: 'Testar backups', done: true }], comments: [] },
      { id: 7, createdAt: new Date().toISOString(), title: 'Definir paleta de cores e tipografia', description: 'Design system com tokens de cor e escala tipográfica.', status: 'done', priority: 'low', tags: ['design'], due: fu(-6), assignee: 'Beatriz Melo', subtasks: [{ id: 1, text: 'Definir cores primárias', done: true }, { id: 2, text: 'Definir tipografia', done: true }], comments: [] },
    ];
    this.save();
  }
};

/* ─── MODAL CONTROLLER ─── */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.showModal();
    el.focus();
    document.body.style.overflow = 'hidden';
  },
  close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.close();
    document.body.style.overflow = '';
  },
  closeAll() {
    $$('dialog[open]').forEach(d => { d.close(); });
    document.body.style.overflow = '';
  }
};

/* ─── TOAST ─── */
function toast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span style="flex:1">${escape(msg)}</span>`;
  el.addEventListener('click', () => el.remove());
  c.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateX(32px) scale(0.95)';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

/* ─── RENDER BOARD ─── */
function render(notify = false) {
  const all = Store.filteredTasks();
  const statuses = ['todo', 'doing', 'done'];
  const hasSearch = !!Store.filters.search;

  // Empty search indicator
  const emptySearch = document.getElementById('empty-search');
  const term = document.getElementById('empty-search-term');
  if (emptySearch) emptySearch.hidden = !(hasSearch && !all.length);
  if (term) term.textContent = Store.filters.search;

  statuses.forEach(status => {
    const zone = document.getElementById(`dropzone-${status}`);
    const empty = document.getElementById(`empty-${status}`);
    const counter = document.getElementById(`count-${status}`);
    if (!zone) return;

    const cards = all.filter(t => t.status === status);
    // Remove existing cards
    $$('.card', zone).forEach(c => c.remove());

    if (counter) {
      counter.textContent = cards.length;
      counter.setAttribute('aria-label', `${cards.length} ${cards.length === 1 ? 'tarefa' : 'tarefas'}`);
    }

    if (empty) empty.hidden = cards.length > 0;

    cards.forEach(task => {
      const el = createCard(task);
      zone.insertBefore(el, empty);
    });

    setupDropzone(zone);
  });

  // Footer
  const total = Store.tasks.length;
  const fc = document.getElementById('footer-task-count');
  if (fc) fc.textContent = `${total} ${total === 1 ? 'tarefa' : 'tarefas'}`;
  const fu = document.getElementById('footer-updated');
  if (fu) {
    const d = new Date();
    fu.textContent = d.toLocaleDateString('pt-BR');
    fu.setAttribute('datetime', d.toISOString().slice(0,10));
  }

  // Sidebar tags
  renderSidebarTags();

  if (notify) updateBodyClass();
}

function renderSidebarTags() {
  const cloud = document.getElementById('sidebar-tags-list');
  if (!cloud) return;
  const tags = Store.allTags();
  cloud.innerHTML = tags.length
    ? tags.map(t => `<button type="button" class="tag--filter${Store.filters.tags.includes(t) ? ' tag--active' : ''}" data-tag="${escape(t)}">${escape(t)}</button>`).join('')
    : '<span style="font-size:12px;color:var(--text-dim)">Nenhuma tag criada</span>';
  $$('.tag--filter', cloud).forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (Store.filters.tags.includes(tag)) Store.filters.tags = Store.filters.tags.filter(x => x !== tag);
      else Store.filters.tags.push(tag);
      btn.classList.toggle('tag--active');
      render();
    });
  });
}

function updateBodyClass() {}

/* ─── CREATE CARD HTML ─── */
function createCard(task) {
  const article = document.createElement('article');
  const progress = Store.taskProgress(task);
  const subs = task.subtasks || [];
  const comments = task.comments || [];
  const subsDone = subs.filter(s => s.done).length;

  const dueCls = isOverdue(task.due) ? 'card-due--overdue' : isUrgent(task.due) ? 'card-due--urgent' : '';
  const duePrefix = task.status === 'done' ? ICONS.check : (isOverdue(task.due) ? '!' : '');
  const pLabel = task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA';
  const tags = (task.tags || []).slice(0, 3);

  article.className = `card${task.status === 'done' ? ' card--done' : ''}`;
  article.setAttribute('role', 'listitem');
  article.setAttribute('draggable', 'true');
  article.dataset.id = task.id;
  article.dataset.status = task.status;
  article.dataset.priority = task.priority;
  article.tabIndex = 0;
  article.setAttribute('aria-label', `${task.title}, prioridade ${task.priority}`);

  // Portal handles the menu items; buildMoveOptions() is called in openCardPortal()

  article.innerHTML = `
    <header class="card-header">
      <span class="priority-badge priority-badge--${task.priority}">${pLabel}</span>
      <div class="card-header-actions">
        <span class="card-drag-handle" aria-hidden="true">${ICONS.gripVertical}</span>
        <button type="button" class="btn btn--icon btn--xs card-menu-btn"
          aria-label="Menu da tarefa" aria-haspopup="menu" aria-expanded="false"
          data-card-id="${task.id}">${ICONS.moreVertical}</button>
      </div>
    </header>

    <h3 class="card-title">${escape(task.title)}</h3>
    ${task.description ? `<p class="card-description">${escape(task.description)}</p>` : ''}

    ${subs.length ? `
    <div class="card-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <span class="progress-label">${progress}%</span>
    </div>` : ''}

    <footer class="card-footer">
      <div class="card-tags">${tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>
      <div class="card-meta">
        ${subs.length ? `<span class="card-stat" title="Subtarefas">${ICONS.checkSquare} ${subsDone}/${subs.length}</span>` : ''}
        ${comments.length ? `<span class="card-stat" title="Comentários">${ICONS.messageCircle} ${comments.length}</span>` : ''}
        ${task.due ? `<span class="card-due ${dueCls}">${ICONS.calendar} ${formatDate(task.due)}</span>` : ''}
        ${task.assignee ? `<span class="avatar" title="${escape(task.assignee)}">${initials(task.assignee)}</span>` : ''}
      </div>
    </footer>
  `;

  // Card events — portal dropdown
  const menuBtn = $('.card-menu-btn', article);
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (_portal) { closePortal(); return; } // toggle: click again closes
    openCardPortal(menuBtn, task);
  });

  // Note: all card actions handled in portal via openCardPortal()

  // Drag
  article.addEventListener('dragstart', e => {
    Store.dragId = String(task.id);
    article.classList.add('card--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(task.id));
  });
  article.addEventListener('dragend', () => {
    article.classList.remove('card--dragging');
    $$('.column-body--drop-active').forEach(z => z.classList.remove('column-body--drop-active'));
  });

  return article;
}

function buildMoveOptions(status, id) {
  const map = { todo: 'Em Andamento', doing: 'Concluído' };
  const back = { doing: 'A Fazer', done: 'Em Andamento' };
  let html = '';
  if (back[status]) html += `<li role="none"><button type="button" role="menuitem" class="dropdown-item" data-action="move-prev" data-card-id="${id}">${ICONS.arrowLeft} Voltar para ${back[status]}</button></li>`;
  if (map[status]) html += `<li role="none"><button type="button" role="menuitem" class="dropdown-item" data-action="move-next" data-card-id="${id}">${ICONS.arrowRight} Mover para ${map[status]}</button></li>`;
  if (status === 'done') html += `<li role="none"><button type="button" role="menuitem" class="dropdown-item" data-action="move-prev" data-card-id="${id}">${ICONS.undo} Reabrir</button></li>`;
  return html;
}

/* ─── CARD ACTIONS ─── */
function handleCardAction(action, id) {
  $$('.card-dropdown').forEach(m => m.hidden = true);
  if (action === 'edit') { openTaskModal(id); return; }
  if (action === 'delete') { openConfirm('delete', id); return; }
  if (action === 'move-next' || action === 'move-prev') {
    const task = Store.getTask(id);
    if (!task) return;
    const order = ['todo', 'doing', 'done'];
    const idx = order.indexOf(task.status);
    const next = action === 'move-next' ? order[idx + 1] : order[idx - 1];
    if (!next) return;
    Store.updateTask(id, { status: next });
    render();
    toast(`Movido para "${next === 'todo' ? 'A Fazer' : next === 'doing' ? 'Em Andamento' : 'Concluído'}"`, 'info');
  }
}

/* ─── CONFIRMATION MODAL ─── */
function openConfirm(action, id) {
  const descEl = document.getElementById('modal-confirm-desc');
  const actionBtn = document.getElementById('btn-confirm-action');
  if (!descEl || !actionBtn) return;

  if (action === 'delete') {
    const task = Store.getTask(id);
    descEl.textContent = `Excluir "${task?.title || 'tarefa'}"? Esta ação não pode ser desfeita.`;
    actionBtn.textContent = 'Excluir';
    Store.confirmAction = () => { Store.deleteTask(id); render(); toast('Tarefa excluída', 'error'); };
  } else if (action === 'clear-done') {
    descEl.textContent = 'Remover todas as tarefas concluídas? Esta ação não pode ser desfeita.';
    actionBtn.textContent = 'Limpar tudo';
    Store.confirmAction = () => { Store.clearDone(); render(); toast('Tarefas concluídas removidas', 'info'); };
  }
  Modal.open('modal-confirm');
}

/* ─── TASK MODAL ─── */
let _currentTags = [];
let _currentSubtasks = [];
let _currentComments = [];

function openTaskModal(editId = null, presetStatus = null) {
  Store.editingId = editId;
  _currentTags = [];
  _currentSubtasks = [];
  _currentComments = [];

  const form = document.getElementById('form-task');
  const badge = document.getElementById('modal-mode-badge');
  const title = document.getElementById('modal-create-title');
  const saveLabel = document.getElementById('btn-save-label');
  if (form) form.reset();

  // Hidden fields reset
  const statusHidden = document.getElementById('task-status-hidden');
  const priorityHidden = document.getElementById('task-priority-hidden');

  if (editId) {
    const task = Store.getTask(editId);
    if (!task) return;
    _currentTags = [...(task.tags || [])];
    _currentSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
    _currentComments = JSON.parse(JSON.stringify(task.comments || []));

    if (badge) { badge.textContent = 'Editar'; badge.className = 'modal-mode-badge modal-mode-badge--edit'; }
    if (title) title.textContent = 'Editar Tarefa';
    if (saveLabel) saveLabel.textContent = 'Salvar Alterações';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-assignee').value = task.assignee || '';
    document.getElementById('task-due').value = task.due || '';

    setStatus(task.status || 'todo');
    setPriority(task.priority || 'medium');
    if (statusHidden) statusHidden.value = task.status || 'todo';
    if (priorityHidden) priorityHidden.value = task.priority || 'medium';
  } else {
    if (badge) { badge.textContent = 'Nova'; badge.className = 'modal-mode-badge'; }
    if (title) title.textContent = 'Nova Tarefa';
    if (saveLabel) saveLabel.textContent = 'Salvar Tarefa';
    document.getElementById('task-id').value = '';
    setStatus(presetStatus || 'todo');
    setPriority('medium');
    if (statusHidden) statusHidden.value = presetStatus || 'todo';
    if (priorityHidden) priorityHidden.value = 'medium';

    // Auto-fill assignee with profile name
    const assigneeInput = document.getElementById('task-assignee');
    if (assigneeInput && Store.profile.name) assigneeInput.value = Store.profile.name;
  }

  renderTagsSelected();
  renderExistingTagsCloud();
  renderSubtasks();
  renderComments();
  updateProgress();
  updateCharCounts();
  updateAssigneePreview();

  Modal.open('modal-create');
}

function setStatus(status) {
  $$('.status-btn').forEach(btn => {
    const active = btn.dataset.status === status;
    btn.classList.toggle('status-btn--active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  const h = document.getElementById('task-status-hidden');
  if (h) h.value = status;
}

function setPriority(priority) {
  $$('.priority-card').forEach(btn => {
    const active = btn.dataset.priority === priority;
    btn.classList.toggle('priority-card--active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  const h = document.getElementById('task-priority-hidden');
  if (h) h.value = priority;
}

/* ── TAGS IN MODAL ── */
function renderTagsSelected() {
  const area = document.getElementById('tags-selected');
  const placeholder = document.getElementById('tags-placeholder');
  if (!area) return;

  // Remove old chips
  $$('.tag--selected', area).forEach(t => t.remove());
  if (placeholder) placeholder.hidden = _currentTags.length > 0;

  _currentTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag--selected';
    chip.innerHTML = `${escape(tag)}<button type="button" class="tag-remove" aria-label="Remover tag ${escape(tag)}">&times;</button>`;
    chip.querySelector('.tag-remove').addEventListener('click', () => removeTag(tag));
    area.appendChild(chip);
  });
  renderExistingTagsCloud();
}

function renderExistingTagsCloud() {
  const cloud = document.getElementById('tags-existing-cloud');
  if (!cloud) return;
  const boardTags = Store.allTags();
  const tagsInInput = _currentTags;

  // Also include tags that are currently selected but might not be on board
  const allKnown = [...new Set([...boardTags, ...tagsInInput])];

  if (!allKnown.length) {
    cloud.innerHTML = '<span style="font-size:11.5px;color:var(--text-dim);font-style:italic">Nenhuma tag no board ainda</span>';
    return;
  }
  cloud.innerHTML = allKnown.map(tag => {
    const selected = tagsInInput.includes(tag);
    const isNew = !boardTags.includes(tag);
    return `<button type="button"
      class="tag--board-chip${selected ? ' tag--board-chip--selected' : ''}${isNew ? ' tag--board-chip--new' : ''}"
      data-tag="${escape(tag)}"
      title="${isNew ? 'Nova tag (não existe no board ainda)' : 'Tag existente no board'}"
    >${selected ? ICONS.check + ' ' : ''}${escape(tag)}${isNew ? ' <span style="opacity:0.5;font-size:9px">nova</span>' : ''}</button>`;
  }).join('');

  $$('.tag--board-chip', cloud).forEach(btn => {
    btn.addEventListener('click', () => toggleTagFromCloud(btn.dataset.tag));
  });
}

function toggleTagFromCloud(tag) {
  if (_currentTags.includes(tag)) removeTag(tag);
  else addTag(tag);
}

function addTag(rawTag) {
  const tag = rawTag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  if (!tag || _currentTags.includes(tag)) return;
  _currentTags.push(tag);
  renderTagsSelected();
}

function removeTag(tag) {
  _currentTags = _currentTags.filter(t => t !== tag);
  renderTagsSelected();
}

/* ── SUBTASKS IN MODAL ── */
function renderSubtasks() {
  const list = document.getElementById('subtasks-list');
  if (!list) return;
  list.innerHTML = '';
  _currentSubtasks.forEach((sub, i) => {
    const item = document.createElement('div');
    item.className = 'subtask-item';
    item.innerHTML = `
      <button type="button" class="subtask-checkbox${sub.done ? ' subtask-checkbox--done' : ''}"
        aria-label="Marcar como ${sub.done ? 'pendente' : 'concluída'}" data-idx="${i}">
        ${ICONS.check}
      </button>
      <span class="subtask-text${sub.done ? ' subtask-text--done' : ''}">${escape(sub.text)}</span>
      <button type="button" class="btn btn--icon btn--xs subtask-delete" aria-label="Remover subtarefa" data-idx="${i}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    item.querySelector('.subtask-checkbox').addEventListener('click', () => {
      _currentSubtasks[i].done = !_currentSubtasks[i].done;
      renderSubtasks();
      updateProgress();
    });
    item.querySelector('.subtask-delete').addEventListener('click', () => {
      _currentSubtasks.splice(i, 1);
      renderSubtasks();
      updateProgress();
    });
    list.appendChild(item);
  });
  updateProgress();
}

function updateProgress() {
  const total = _currentSubtasks.length;
  const done = _currentSubtasks.filter(s => s.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const progressText = document.getElementById('subtasks-progress-text');
  const progressFill = document.getElementById('subtasks-progress-fill');
  const summaryPct = document.getElementById('progress-summary-pct');
  const summaryFill = document.getElementById('progress-summary-fill');

  if (progressText) progressText.textContent = `${done} de ${total}`;
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (summaryPct) summaryPct.textContent = `${pct}%`;
  if (summaryFill) summaryFill.style.width = `${pct}%`;
}

function addSubtask(text) {
  const clean = text.trim();
  if (!clean) return;
  _currentSubtasks.push({ id: Date.now(), text: clean, done: false });
  renderSubtasks();
  const input = document.getElementById('subtask-input');
  if (input) input.value = '';
}

/* ── COMMENTS IN MODAL ── */
function renderComments() {
  const list = document.getElementById('comments-list');
  const empty = document.getElementById('comments-empty');
  const badge = document.getElementById('comments-count-badge');
  if (!list) return;

  // Remove old comments
  $$('.comment-item', list).forEach(c => c.remove());
  if (empty) empty.hidden = _currentComments.length > 0;
  if (badge) { badge.textContent = _currentComments.length; badge.hidden = !_currentComments.length; }

  // Update comment author avatar
  const avatar = document.getElementById('comment-author-avatar');
  if (avatar) avatar.textContent = initials(Store.profile.name) || '?';

  _currentComments.forEach((c, i) => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
      <span class="comment-avatar">${initials(c.author)}</span>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">${escape(c.author || 'Anônimo')}</span>
          <span class="comment-time">${timeAgo(c.createdAt)}</span>
          <button type="button" class="btn btn--icon btn--xs comment-delete" aria-label="Excluir comentário" data-idx="${i}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p class="comment-text">${escape(c.text)}</p>
      </div>
    `;
    item.querySelector('.comment-delete').addEventListener('click', () => {
      _currentComments.splice(i, 1);
      renderComments();
    });
    list.insertBefore(item, empty);
  });
}

function addComment(text) {
  const clean = text.trim();
  if (!clean) return;
  const author = Store.profile.name || 'Você';
  _currentComments.push({ id: Date.now(), author, text: clean, createdAt: new Date().toISOString() });
  renderComments();
  const input = document.getElementById('comment-input');
  if (input) input.value = '';
}

/* ── ASSIGNEE PREVIEW ── */
function updateAssigneePreview() {
  const input = document.getElementById('task-assignee');
  const preview = document.getElementById('assignee-preview-avatar');
  if (preview && input) preview.textContent = initials(input.value) || '?';
}

/* ── CHAR COUNTS ── */
function updateCharCounts() {
  const titleInput = document.getElementById('task-title');
  const titleCount = document.getElementById('title-char-count');
  const descInput = document.getElementById('task-description');
  const descCount = document.getElementById('desc-char-count');
  if (titleInput && titleCount) titleCount.textContent = `${titleInput.value.length}/80`;
  if (descInput && descCount) descCount.textContent = descInput.value.length;
}

/* ─── FORM SUBMIT ─── */
function handleTaskSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('task-title')?.value?.trim();
  if (!title) { toast('O título é obrigatório', 'error'); document.getElementById('task-title')?.focus(); return; }

  const data = {
    title,
    description: document.getElementById('task-description')?.value?.trim() || '',
    status: document.getElementById('task-status-hidden')?.value || 'todo',
    priority: document.getElementById('task-priority-hidden')?.value || 'medium',
    assignee: document.getElementById('task-assignee')?.value?.trim() || '',
    due: document.getElementById('task-due')?.value || '',
    tags: [..._currentTags],
    subtasks: JSON.parse(JSON.stringify(_currentSubtasks)),
    comments: JSON.parse(JSON.stringify(_currentComments)),
  };

  const editId = document.getElementById('task-id')?.value;
  if (editId) {
    Store.updateTask(editId, data);
    toast('Tarefa atualizada', 'info');
  } else {
    Store.addTask(data);
    toast('Tarefa criada com sucesso!', 'success');
  }
  Modal.close('modal-create');
  render();
}

/* ─── DRAG & DROP ─── */
function setupDropzone(zone) {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    zone.classList.add('column-body--drop-active');
  });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('column-body--drop-active');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('column-body--drop-active');
    const id = e.dataTransfer.getData('text/plain') || Store.dragId;
    if (!id) return;
    const newStatus = zone.dataset.dropzone;
    const task = Store.getTask(id);
    if (!task || task.status === newStatus) return;
    Store.updateTask(id, { status: newStatus });
    render();
    toast(`Movido para "${newStatus === 'todo' ? 'A Fazer' : newStatus === 'doing' ? 'Em Andamento' : 'Concluído'}"`, 'info');
  });
}

/* ─── PROFILE ─── */
function openProfileModal() {
  document.getElementById('profile-name').value = Store.profile.name || '';
  document.getElementById('profile-role').value = Store.profile.role || '';
  updateProfileAvatarPreview();
  Modal.open('modal-profile');
}

function updateProfileAvatarPreview() {
  const name = document.getElementById('profile-name')?.value || '';
  const preview = document.getElementById('profile-avatar-preview');
  if (preview) preview.textContent = initials(name) || '?';
}

function saveProfile() {
  const name = document.getElementById('profile-name')?.value?.trim() || '';
  const role = document.getElementById('profile-role')?.value?.trim() || '';
  Store.profile = { name, role };
  Store.saveProfile();
  updateHeaderProfile();
  Modal.close('modal-profile');
  toast('Perfil salvo', 'success');
}

function updateHeaderProfile() {
  const avatar = document.getElementById('header-user-avatar');
  const label = document.getElementById('header-user-name');
  if (avatar) avatar.textContent = initials(Store.profile.name) || '?';
  if (label) label.textContent = Store.profile.name || 'Meu Perfil';
}

/* ─── THEME ─── */
function initTheme() {
  const saved = localStorage.getItem('kanban_theme') || 'dark';
  document.body.dataset.theme = saved;
}

function toggleTheme() {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('kanban_theme', next);
}

/* ─── SIDEBAR ─── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-filters');
  const btn = document.getElementById('btn-toggle-sidebar');
  if (!sidebar) return;
  const isOpen = sidebar.dataset.open === 'true';
  sidebar.dataset.open = String(!isOpen);
  if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
}

/* ─── DROPDOWN PORTAL ─── */
let _portal = null;

function closePortal() {
  if (_portal) { _portal.remove(); _portal = null; }
}

function openCardPortal(menuBtn, task) {
  closePortal();
  const rect = menuBtn.getBoundingClientRect();
  const status = task.status;
  const id = task.id;

  const moveOpts = buildMoveOptions(status, id);
  const portal = document.createElement('ul');
  portal.className = 'card-dropdown-portal';
  portal.setAttribute('role', 'menu');
  portal.innerHTML = `
    ${moveOpts}
    ${moveOpts ? '<li role="separator"></li>' : ''}
    <li role="none">
      <button type="button" role="menuitem" class="dropdown-item" data-action="edit" data-card-id="${id}">
        ${ICONS.edit} Editar
      </button>
    </li>
    <li role="none">
      <button type="button" role="menuitem" class="dropdown-item dropdown-item--danger" data-action="delete" data-card-id="${id}">
        ${ICONS.trash} Excluir
      </button>
    </li>
  `;

  document.body.appendChild(portal);
  _portal = portal;

  // Position below the button, aligned right
  const menuW = 214;
  let left = rect.right - menuW;
  if (left < 8) left = 8;
  let top = rect.bottom + 6;
  portal.style.top = `${top}px`;
  portal.style.left = `${left}px`;

  // Bind item actions
  portal.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const cardId = btn.dataset.cardId;
      closePortal();
      handleCardAction(action, cardId);
    });
  });
}

/* ─── MAIN INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  initTheme();
  updateHeaderProfile();
  render();

  /* Header */
  document.getElementById('btn-toggle-theme')?.addEventListener('click', toggleTheme);
  document.getElementById('btn-toggle-sidebar')?.addEventListener('click', toggleSidebar);
  document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleSidebar);
  document.getElementById('btn-user-profile')?.addEventListener('click', openProfileModal);
  document.getElementById('btn-new-task')?.addEventListener('click', () => openTaskModal());

  /* Column add buttons */
  $$('[data-preset-status]').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal(null, btn.dataset.presetStatus));
  });

  /* Filters sidebar submit */
  document.getElementById('form-filters')?.addEventListener('submit', e => {
    e.preventDefault();
    toggleSidebar();
    render();
  });
  document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    Store.filters.tags = [];
    Store.filters.statuses = ['todo', 'doing', 'done'];
    render();
  });
  document.getElementById('btn-apply-filters')?.addEventListener('click', () => {
    const checked = $$('#form-filters input[name="status"]:checked');
    Store.filters.statuses = checked.map(c => c.value);
    toggleSidebar();
    render();
  });

  /* Search */
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', () => {
    Store.filters.search = searchInput.value;
    render();
  });
  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    Store.filters.search = '';
    if (searchInput) searchInput.value = '';
    render();
  });

  /* Priority filter chips */
  $$('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip[data-filter]').forEach(c => { c.classList.remove('chip--active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('chip--active');
      chip.setAttribute('aria-pressed', 'true');
      Store.filters.priority = chip.dataset.filter;
      render();
    });
  });

  /* Confirm modal */
  document.getElementById('btn-confirm-action')?.addEventListener('click', () => {
    Store.confirmAction?.();
    Store.confirmAction = null;
    Modal.close('modal-confirm');
  });

  /* Clear done button */
  document.getElementById('btn-clear-done')?.addEventListener('click', () => openConfirm('clear-done'));

  /* Modal form */
  document.getElementById('form-task')?.addEventListener('submit', handleTaskSubmit);

  /* Status buttons */
  $$('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => setStatus(btn.dataset.status));
  });

  /* Priority cards */
  $$('.priority-card').forEach(card => {
    card.addEventListener('click', () => setPriority(card.dataset.priority));
  });

  /* Tag input */
  const tagInput = document.getElementById('task-tags-input');
  tagInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.value); tagInput.value = ''; }
  });
  document.getElementById('btn-add-tag')?.addEventListener('click', () => {
    addTag(tagInput?.value || ''); if (tagInput) tagInput.value = '';
  });

  /* Subtask input */
  const subtaskInput = document.getElementById('subtask-input');
  subtaskInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addSubtask(subtaskInput.value); }
  });
  document.getElementById('btn-add-subtask')?.addEventListener('click', () => addSubtask(subtaskInput?.value || ''));

  /* Comment input */
  const commentInput = document.getElementById('comment-input');
  commentInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) addComment(commentInput.value);
  });
  document.getElementById('btn-add-comment')?.addEventListener('click', () => addComment(commentInput?.value || ''));

  /* Title char count */
  document.getElementById('task-title')?.addEventListener('input', updateCharCounts);
  document.getElementById('task-description')?.addEventListener('input', updateCharCounts);

  /* Assignee preview */
  document.getElementById('task-assignee')?.addEventListener('input', updateAssigneePreview);

  /* Profile modal */
  document.getElementById('profile-name')?.addEventListener('input', updateProfileAvatarPreview);
  document.getElementById('btn-save-profile')?.addEventListener('click', saveProfile);

  /* Close portal on outside click; close modals on overlay/data-modal-close clicks */
  document.addEventListener('click', e => {
    if (_portal && !e.target.closest('.card-menu-btn') && !e.target.closest('.card-dropdown-portal')) {
      closePortal();
    }
    const closeTarget = e.target.closest('[data-modal-close]');
    if (closeTarget) Modal.close(closeTarget.dataset.modalClose);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePortal(); Modal.closeAll(); }
  });
});
