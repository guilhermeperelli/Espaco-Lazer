
// ─── SUPABASE CONFIG ───
// ✅ CREDENCIAIS CORRETAS (com aspas)
const SUPABASE_URL = 'https://ertjutgolxarqjqwhggj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WHuOpT2MAQ2emLERC07KoA_o7ulEj3W';
window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── NAV SCROLL ───
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 80) nav.classList.add('visible');
  else nav.classList.remove('visible');
});

// ─── HAMBURGER ───
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }

// ─── SCROLL REVEAL (corrigido: começa visível, anima ao entrar na tela) ───
// Adiciona classe 'hidden' antes de observar para não deixar conteúdo invisível inicialmente
window.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.remove('hidden');
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => {
    // Só esconde se estiver abaixo da dobra da tela
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      el.classList.add('hidden');
    }
    observer.observe(el);
  });
});

// ─── LIGHTBOX ───
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ─── GALLERY TABS ───
let galleryData = [];
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.cat);
  });
});

function renderGallery(cat) {
  const grid = document.getElementById('galeriaFixed');
  const items = cat === 'todos' ? galleryData : galleryData.filter(i => i.categoria === cat);
  grid.innerHTML = items.length ? items.map(item => `
    <div class="gallery-item" onclick="openLightbox('${item.url}')">
      <img src="${item.url}" alt="${item.categoria}" loading="lazy">
      <div class="overlay">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
      </div>
    </div>
  `).join('') : `
    <div class="gallery-placeholder" style="grid-column:1/-1;padding:3rem;text-align:center;border-radius:10px;background:var(--gray-100)">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 1rem"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <p>Nenhuma foto nesta categoria ainda.</p>
    </div>
  `;
}
async function loadGallery() {
  const { data, error } = await window.db
    .from('galeria_fixa')
    .select('*')
    .order('id');

  if (error) {
    console.error('Erro ao carregar galeria:', error);

    galleryData = [];
    renderGallery('todos');
    return;
  }

  if (data && data.length) {
    galleryData = data.map(i => ({
      url: i.url,
      categoria: i.categoria
    }));
  } else {
    galleryData = [];
  }

  renderGallery('todos');
}

// ─── PREÇOS ───
const defaultPrices = [
  { label:'Dias Úteis', valor:380, icon:'📅' },
  { label:'Sábado', valor:480, icon:'🎉' },
  { label:'Domingo', valor:480, icon:'🎊' },
  { label:'Pula-pula', valor:65, icon:'🎪' },
  { label:'Piscina', valor:65, icon:'🏊' },
];

async function loadPrices() {
  const { data } = await window.db.from('precos').select('*').order('ordem');
  const items = (data && data.length) ? data : defaultPrices;
  document.getElementById('pricesGrid').innerHTML = items.map(p => `
    <div class="price-card">
      <div class="price-icon">${p.icon || '💰'}</div>
      <div class="price-label">${p.label}</div>
      <div class="price-value"><sup>R$</sup>${Number(p.valor).toLocaleString('pt-BR')}</div>
    </div>
  `).join('');
}

// ─── REGRAS ───
const defaultRules = [
  { titulo:'⏰ Horário', conteudo:'O horário máximo de uso do espaço é até as 22h em dias úteis e 23h aos finais de semana. Após este horário, podem ser cobradas taxas adicionais.' },
  { titulo:'🏠 Conservação', conteudo:'É de responsabilidade do locatário manter o espaço limpo e organizado. O salão deve ser entregue nas mesmas condições em que foi recebido.' },
  { titulo:'⚠️ Danos', conteudo:'Danos causados ao mobiliário, equipamentos ou estrutura serão cobrados do responsável pela reserva. Recomenda-se uma vistoria antes e após o evento.' },
  { titulo:'🏊 Regras da Piscina', conteudo:'Uso da piscina obrigatoriamente com touca. Crianças menores de 12 anos devem estar sempre acompanhadas por adulto responsável. Proibido alimentos na área da piscina.' },
  { titulo:'👥 Capacidade Máxima', conteudo:'A capacidade máxima do espaço é definida por questões de segurança. O número máximo de pessoas deve ser informado e respeitado durante toda a festa.' },
];

async function loadRules() {
  const { data } = await window.db.from('regras').select('*').order('ordem');
  const items = (data && data.length) ? data : defaultRules;
  document.getElementById('accordionWrap').innerHTML = items.map((r, i) => `
    <div class="accordion-item" id="acc-${i}">
      <button class="accordion-header" onclick="toggleAcc(${i})">
        ${r.titulo}
        <span class="accordion-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      <div class="accordion-body">${r.conteudo}</div>
    </div>
  `).join('');
}

function toggleAcc(i) {
  const el = document.getElementById('acc-' + i);
  el.classList.toggle('open');
}

// ─── WHATSAPP RESERVA ───
function enviarReserva() {
  const nome    = document.getElementById('fNome').value.trim();
  const tel     = document.getElementById('fTel').value.trim();
  const data    = document.getElementById('fData').value;
  const qtd     = document.getElementById('fQtd').value.trim();
  const piscina = document.getElementById('fPiscina').checked ? 'Sim' : 'Não';
  const pula    = document.getElementById('fPulaPula').checked ? 'Sim' : 'Não';
  const obs     = document.getElementById('fObs').value.trim();

  if (!nome || !tel || !data) {
    alert('Por favor, preencha nome, telefone e data.');
    return;
  }

  const dataFmt = data ? new Date(data+'T00:00').toLocaleDateString('pt-BR') : '-';
  const msg = encodeURIComponent(
    `Olá, gostaria de reservar o Espaço & Lazer.\n\n` +
    `Nome: ${nome}\nTelefone: ${tel}\nData: ${dataFmt}\n` +
    `Quantidade: ${qtd || '-'}\nPiscina: ${piscina}\nPula-pula: ${pula}\n` +
    `Observações: ${obs || '-'}`
  );
  window.open(`https://wa.me/5521985691423?text=${msg}`, '_blank');
}

// ─── INIT ───
async function init() {
  await Promise.all([loadGallery(), loadPrices(), loadRules()]);
  // realtime calendar updates
  window.db.channel('calendario-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'calendario' }, loadCalendarStatus).subscribe();
  window.db.channel('evento-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, loadEvento).subscribe();
  window.db.channel('precos-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'precos' }, loadPrices).subscribe();
}

init();
