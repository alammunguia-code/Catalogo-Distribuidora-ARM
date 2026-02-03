/****************************************************
 * CONFIGURACIÓN GOOGLE SHEETS
 ****************************************************/
const SHEET_ID = '1ZYDo3phbc-IhaD-blVlaH7gbYkoyjhhX-I7Dtm06Cuo';
const params = new URLSearchParams(window.location.search);
const catalogoSeleccionado = params.get('catalogo') || 'ClienteA';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/${catalogoSeleccionado}`;

/****************************************************
 * CONFIGURACIÓN GOOGLE FORMS
 ****************************************************/
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse';

const ENTRY = {
  nombre: 'entry.313556667',
  telefono: 'entry.675797328',
  direccion: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.889150100',
  total: 'entry.1238815983'
};

/****************************************************
 * HELPERS
 ****************************************************/
function normalizarCategoria(str) {
  return (str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/****************************************************
 * VARIABLES GLOBALES
 ****************************************************/
let productos = [];
let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1') || '[]');

/****************************************************
 * DOM READY
 ****************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const catalogoEl = document.getElementById('catalogo');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const closeCart = document.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');
  const searchInput = document.getElementById('search');
  const categoryContainer = document.getElementById('category-buttons');

  let activeCategory = 'todos';
  let lastSearch = '';

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      productos = data.map(row => ({
        id: String(row.id || Math.random().toString(36).slice(2, 9)),
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precio: Number(row.precio) || 0,
        precioMayoreo: Number(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo) || 0,
        categoria: (row.categoria || 'Otros').trim(),
        categoriaNorm: normalizarCategoria(row.categoria || 'Otros'),
        colores: row.colores
          ? row.colores.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        imagenes: row.imagen
          ? row.imagen.split(',').map(i => i.trim()).filter(Boolean)
          : []
      }));

      renderCategoryButtons();
      applyFilters();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * CATEGORÍAS AUTOMÁTICAS
   ****************************************************/
  function renderCategoryButtons() {
    if (!categoryContainer) return;

    const categorias = [
      { label: 'Todos', value: 'todos' },
      ...[...new Map(
        productos.map(p => [
          p.categoriaNorm,
          { label: p.categoria, value: p.categoriaNorm }
        ])
      ).values()]
    ];

    categoryContainer.innerHTML = '';

    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      if (cat.value === activeCategory) btn.classList.add('active');

      btn.dataset.filter = cat.value;
      btn.textContent = cat.label;

      btn.addEventListener('click', () => {
        categoryContainer.querySelectorAll('.filter-btn')
          .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');
        activeCategory = cat.value;
        applyFilters();
      });

      categoryContainer.appendChild(btn);
    });
  }

  /****************************************************
   * RENDER PRODUCTOS
   ****************************************************/
  function renderProductos(lista = productos) {
    if (!catalogoEl) return;
    catalogoEl.innerHTML = '';

    if (!lista.length) {
      catalogoEl.innerHTML = '<div style="padding:18px;color:#6b7280">No hay productos</div>';
      return;
    }

    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      const colorHTML =
        p.colores.length > 1
          ? `<select class="color-select" data-id="${p.id}">
              ${p.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>`
          : '';

      const imagenHTML =
        p.imagenes.length > 1
          ? `<div class="carousel" data-id="${p.id}">
              <button class="carousel-btn prev">‹</button>
              <div class="carousel-track">
                ${p.imagenes.map((img, i) =>
                  `<img src="${img}" class="carousel-img ${i === 0 ? 'active' : ''}">`
                ).join('')}
              </div>
              <button class="carousel-btn next">›</button>
            </div>`
          : `<img src="${p.imagenes[0] || ''}">`;

      card.innerHTML = `
        <div class="card-image">${imagenHTML}</div>
        <div class="card-info">
          <h3>${p.nombre}</h3>
          <div class="price">$${p.precio.toFixed(2)} MXN</div>
          <div class="mayoreo">
            Mayoreo: $${p.precioMayoreo.toFixed(2)} desde ${p.minMayoreo} pzas
          </div>
        </div>
        <div class="card-actions">
          ${colorHTML}
          <button class="btn" data-id="${p.id}">Agregar al carrito</button>
        </div>
      `;

      catalogoEl.appendChild(card);
    });
  }

  /****************************************************
   * CARRUSEL
   ****************************************************/
  document.addEventListener('click', e => {
    const btn = e.target.closest('.carousel-btn');
    if (!btn) return;

    const carousel = btn.closest('.carousel');
    const imgs = carousel.querySelectorAll('.carousel-img');
    let idx = [...imgs].findIndex(i => i.classList.contains('active'));
    imgs[idx].classList.remove('active');
    idx = btn.classList.contains('prev')
      ? (idx - 1 + imgs.length) % imgs.length
      : (idx + 1) % imgs.length;
    imgs[idx].classList.add('active');
  });

  /****************************************************
   * FILTROS
   ****************************************************/
  function applyFilters() {
    const q = lastSearch.toLowerCase();

    const filtrados = productos.filter(p => {
      const textMatch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q);

      const catMatch =
        activeCategory === 'todos' ||
        p.categoriaNorm === activeCategory;

      return textMatch && catMatch;
    });

    renderProductos(filtrados);
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      lastSearch = e.target.value;
      applyFilters();
    });
  }

  /****************************************************
   * INIT
   ****************************************************/
  cargarProductos();
});
