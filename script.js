/****************************************************
 CONFIGURACIÓN DEL FORMULARIO PARA GOOGLE FORMS
*****************************************************/
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse";

const ENTRY = {
  nombre: 'entry.313556667',
  telefono: 'entry.675797328',
  direccion: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.889150100',
  total: 'entry.1238815983'
};


/****************************************************
 INICIO DEL SCRIPT CUANDO SE CARGA LA PÁGINA
*****************************************************/
document.addEventListener('DOMContentLoaded', ()=>{

  /****************************************************
   LISTA COMPLETA DE 20 PRODUCTOS
  *****************************************************/
  const productos = [
    { id:1,nombre:'Sombrero Palma Fina',precio:189,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palma+Fina' },
    { id:2,nombre:'Sombrero Charro Juvenil',precio:249,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Charro+Juvenil' },
    { id:3,nombre:'Sombrero Rancho Premium',precio:329,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Rancho' },
    { id:4,nombre:'Sombrero Palmita Económico',precio:129,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palmita' },
    { id:5,nombre:'Sombrero Vaquero Café',precio:259,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Vaquero+Cafe' },
    { id:6,nombre:'Sombrero Vaquero Negro',precio:279,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Vaquero+Negro' },
    { id:7,nombre:'Sombrero Infantil Modelo 1',precio:149,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Infantil+1' },
    { id:8,nombre:'Sombrero Infantil Modelo 2',precio:159,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Infantil+2' },
    { id:9,nombre:'Sombrero Tradicional Mexicano',precio:199,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Tradicional' },
    { id:10,nombre:'Sombrero de Palma Artesanal',precio:299,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Artesanal' },
    { id:11,nombre:'Sombrero Palmilla Premium',precio:349,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palmilla+Premium' },
    { id:12,nombre:'Sombrero Charro Bordado',precio:399,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Charro+Bordado' },
    { id:13,nombre:'Sombrero Juvenil Palmita',precio:139,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palmita+Juvenil' },
    { id:14,nombre:'Sombrero Adulto Palmita',precio:159,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palmita+Adulto' },
    { id:15,nombre:'Sombrero Vaquero Premium',precio:349,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Vaquero+Premium' },
    { id:16,nombre:'Sombrero Cinto Café',precio:289,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Cinto+Cafe' },
    { id:17,nombre:'Sombrero Cinto Negro',precio:289,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Cinto+Negro' },
    { id:18,nombre:'Sombrero de Palma Dura',precio:219,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palma+Dura' },
    { id:19,nombre:'Sombrero de Palma Suave',precio:209,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Palma+Suave' },
    { id:20,nombre:'Sombrero Elegante Tradición',precio:379,imagen:'https://via.placeholder.com/400x300?text=Sombrero+Elegante' }
  ];


  /****************************************************
   CARRITO (localStorage)
  *****************************************************/
  let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1')||'[]');

  const catalogoEl = document.getElementById('catalogo');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const closeCart = document.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');


  /****************************************************
   RENDER PRODUCTOS
  *****************************************************/
  function renderProductos(){
    catalogoEl.innerHTML = '';
    productos.forEach((p,i)=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <div class="price">$${p.precio} MXN</div>

        <div class="deal">¡Ahorra comprando mayoreo!</div>
        <div class="deal2">A partir de 3 unidades</div>

        <button class="btn" data-index="${i}">Agregar al carrito</button>
      `;
      catalogoEl.appendChild(card);
    });
  }


  function saveCart(){ localStorage.setItem('amat_carrito_v1', JSON.stringify(carrito)); }


  function updateBadge(){
    const cantidad = carrito.reduce((s,i)=>s+i.cantidad,0);
    cartBadge.style.display = cantidad>0 ? 'flex':'none';
    cartBadge.textContent = cantidad;
  }


  function renderCart(){
    cartBody.innerHTML = '';
    if(carrito.length===0){
      cartBody.innerHTML='<div style="padding:18px;color:var(--muted)">Tu carrito está vacío</div>';
      cartTotalEl.textContent='0';
      updateBadge(); return;
    }

    carrito.forEach((item,index)=>{
      const node = document.createElement('div');
      node.className='cart-item';
      node.innerHTML=`
        <img src="${item.imagen}" alt="${item.nombre}">
        <div class="meta">
          <b>${item.nombre}</b>
          <div style="color:var(--muted);font-size:13px">$${item.precio} MXN</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <input class="qty" type="number" min="1" value="${item.cantidad}" data-index="${index}">
          <button class="small-btn" data-remove="${index}" title="Eliminar">Eliminar</button>
        </div>`;
      cartBody.appendChild(node);
    });

    const total = carrito.reduce((s,i)=>s+i.precio*i.cantidad,0);
    cartTotalEl.textContent=total;
    updateBadge();
  }


  /****************************************************
   EVENTOS
  *****************************************************/
  catalogoEl.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-index]');
    if(!btn) return;

    const idx = Number(btn.getAttribute('data-index'));
    const p = productos[idx];
    const existing = carrito.find(x=>x.id===p.id);
    if(existing) existing.cantidad += 1;
    else carrito.push({...p,cantidad:1});

    saveCart(); renderCart();
  });

  cartBody.addEventListener('change', e=>{
    const input = e.target.closest('input.qty');
    if(!input) return;
    const index = Number(input.getAttribute('data-index'));
    carrito[index].cantidad = parseInt(input.value)||1;
    saveCart(); renderCart();
  });

  cartBody.addEventListener('click', e=>{
    const rm = e.target.closest('button[data-remove]');
    if(!rm) return;
    carrito.splice(Number(rm.getAttribute('data-remove')),1);
    saveCart(); renderCart();
  });


  /****************************************************
   MOSTRAR / OCULTAR CARRITO
  *****************************************************/
  function openCart(){ cartPanel.classList.add('open'); overlay.classList.add('show'); }
  function closeCartPanel(){ cartPanel.classList.remove('open'); overlay.classList.remove('show'); }

  cartBtn.addEventListener('click', ()=>{ cartPanel.classList.contains('open')?closeCartPanel():openCart(); });
  closeCart.addEventListener('click', closeCartPanel);
  overlay.addEventListener('click', closeCartPanel);


  /****************************************************
   ENVIAR PEDIDO
  *****************************************************/
  submitBtn.addEventListener('click', ()=>{
    if(carrito.length===0){ alert('El carrito está vacío'); return; }

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const email = document.getElementById('email').value.trim();

    if(!nombre||!telefono||!direccion||!email){
      alert('Completa tus datos'); return;
    }

    const pedidoTexto = carrito.map(i=>`${i.nombre} x${i.cantidad} - $${i.precio*i.cantidad}`).join("\n");
    const total = carrito.reduce((s,i)=>s+i.precio*i.cantidad,0);

    const fd = new FormData();
    fd.append(ENTRY.nombre,nombre);
    fd.append(ENTRY.telefono,telefono);
    fd.append(ENTRY.direccion,direccion);
    fd.append(ENTRY.email,email);
    fd.append(ENTRY.pedido,pedidoTexto);
    fd.append(ENTRY.total,total);

    submitBtn.disabled=true;
    submitBtn.textContent='Enviando...';

    fetch(FORM_URL,{method:'POST',body:fd,mode:'no-cors'})
      .then(()=>{
        alert('Pedido enviado. ¡Gracias!');
        carrito=[]; saveCart(); renderCart();
        ['nombre','telefono','direccion','email'].forEach(id=>document.getElementById(id).value='');
        submitBtn.disabled=false; submitBtn.textContent='Finalizar pedido';
        closeCartPanel();
      })
      .catch(()=>{
        alert('Error al enviar. Intenta de nuevo.');
        submitBtn.disabled=false; submitBtn.textContent='Finalizar pedido';
      });
  });


  /****************************************************
   INICIALIZAR TODO
  *****************************************************/
  renderProductos();
  renderCart();
});


