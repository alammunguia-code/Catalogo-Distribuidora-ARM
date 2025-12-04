document.addEventListener("DOMContentLoaded", ()=>{
    const productos=[
        {nombre:"Producto 1",precio:199,imagen:"https://via.placeholder.com/300"},
        {nombre:"Producto 2",precio:249,imagen:"https://via.placeholder.com/300"},
        {nombre:"Producto 3",precio:299,imagen:"https://via.placeholder.com/300"},
        {nombre:"Producto 4",precio:349,imagen:"https://via.placeholder.com/300"}
    ];
    let carrito=[];
    const catalogoEl=document.getElementById("catalogo");
    const carritoPanel=document.getElementById("carrito-panel");
    const cartIcon=document.getElementById("cart-icon");
    const cartCount=document.getElementById("cart-count");

    function renderProductos(){
        catalogoEl.innerHTML="";
        productos.forEach((p,i)=>{
            const card=document.createElement("div");
            card.className="card";
            card.innerHTML=`
                <img src="${p.imagen}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <div class="price">$${p.precio} MXN</div>
                <button class="btn" data-index="${i}">Agregar al carrito</button>
            `;
            catalogoEl.appendChild(card);
        });
    }

    catalogoEl.addEventListener("click", e=>{
        const btn=e.target.closest("button[data-index]");
        if(!btn) return;
        const i=Number(btn.getAttribute("data-index"));
        const p=productos[i];
        const existe=carrito.find(x=>x.nombre===p.nombre);
        if(existe) existe.cantidad++;
        else carrito.push({...p,cantidad:1});
        actualizarCarrito();
    });

    function actualizarCarrito(){
        const lista=document.getElementById("carrito-lista");
        const totalEl=document.getElementById("total");
        lista.innerHTML="";
        let total=0;
        let contador=0;
        carrito.forEach(p=>{
            total+=p.precio*p.cantidad;
            contador+=p.cantidad;
            const item=document.createElement("div");
            item.textContent=`${p.nombre} - $${p.precio} x ${p.cantidad}`;
            lista.appendChild(item);
        });
        totalEl.textContent=total;
        cartCount.textContent=contador;
    }

    cartIcon.addEventListener("click", ()=>{
        carritoPanel.classList.toggle("carrito-abierto");
        carritoPanel.classList.toggle("carrito-cerrado");
    });

    window.enviarPedido=()=>{
        const FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse";
        const nombre=document.getElementById("nombre").value;
        const telefono=document.getElementById("telefono").value;
        const direccion=document.getElementById("direccion").value;
        const email=document.getElementById("email").value;

        const pedidoCompleto=carrito.map(p=>`${p.nombre} - $${p.precio} x ${p.cantidad}`).join("\n");
        const total=carrito.reduce((sum,p)=>sum+p.precio*p.cantidad,0);

        const fd=new FormData();
        fd.append("entry.313556667",nombre);
        fd.append("entry.675797328",telefono);
        fd.append("entry.1917704239",direccion);
        fd.append("entry.865391267",email);
        fd.append("entry.1631925112",pedidoCompleto);
        fd.append("entry.1054448594",total);

        fetch(FORM_URL,{method:"POST",body:fd,mode:"no-cors"}).then(()=>alert("Pedido enviado con éxito")).catch(err=>console.error(err));
    };

    renderProductos();
});
