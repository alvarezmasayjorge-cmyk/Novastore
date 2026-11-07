'use strict';
// Estado compartido: colecciones de productos y de líneas del carrito.
let products = [];
let cart = [];
let category = 'Todo';
let toastTimer;
const $ = (selector) => document.querySelector(selector);
const money = (value) => `Bs ${value.toFixed(2)}`;
const photo = (product, width = 650) => `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=${width}&q=80`;
const dialog = $('#cart-dialog');

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

function saveCart() {
  try { localStorage.setItem('nova-cart', JSON.stringify(cart)); }
  catch { notify('El navegador no permite guardar la bolsa al cerrar.'); }
}

// Los datos se cargan mediante una petición HTTP y se convierten desde JSON.
async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('No se pudo cargar la colección');
    products = await response.json();
    try {
      const saved = JSON.parse(localStorage.getItem('nova-cart') || '[]');
      if (Array.isArray(saved)) {
        const seen = new Set();
        cart = saved.filter((line) => {
          if (!line || typeof line !== 'object') return false;
          const product = products.find((item) => item.id === line.id);
          const key = `${line.id}-${line.size}`;
          if (!product || !product.sizes.includes(line.size) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10 || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    } catch { cart = []; }
    renderProducts();
    renderCart();
  } catch {
    $('#result-count').textContent = 'Colección no disponible';
    $('#products').innerHTML = '<p class="empty">No pudimos cargar los productos. Comprueba tu conexión y <button id="retry" class="button light">Vuelve a intentarlo ↗</button></p>';
    $('#retry').addEventListener('click', loadProducts);
  }
}

function renderProducts() {
  const query = $('#search').value.trim().toLocaleLowerCase('es');
  const visible = products.filter((product) => (category === 'Todo' || product.category === category) && `${product.name} ${product.category} ${product.color}`.toLocaleLowerCase('es').includes(query));
  if ($('#sort').value === 'asc') visible.sort((a, b) => a.price - b.price);
  if ($('#sort').value === 'desc') visible.sort((a, b) => b.price - a.price);
  $('#result-count').textContent = `${visible.length} prendas para ti`;
  $('#products').innerHTML = visible.length ? visible.map((product) => `<article class="product">
    <div class="product-photo"><img src="${photo(product)}" alt="${product.name}, fotografía de referencia" loading="lazy">${product.tag ? `<span class="tag">${product.tag}</span>` : ''}</div>
    <div class="product-info"><div><h3>${product.name}</h3><p>${product.color}</p></div><span class="price">${money(product.price)}</span></div>
    <div class="product-actions"><select id="size-${product.id}" aria-label="Talla para ${product.name}"><option value="">Talla</option>${product.sizes.map((size) => `<option>${size}</option>`).join('')}</select><button class="add-button" data-add="${product.id}" aria-label="Agregar ${product.name} a la bolsa">Agregar a la bolsa +</button></div>
    </article>`).join('') : '<p class="empty">No encontramos prendas. Prueba otra búsqueda o categoría.</p>';
}

function renderCart() {
  $('#cart-count').textContent = cart.reduce((sum, line) => sum + line.quantity, 0);
  $('#cart-items').innerHTML = cart.length ? cart.map((line, index) => {
    const product = products.find((item) => item.id === line.id);
    return `<article class="cart-line"><img src="${photo(product, 150)}" alt="${product.name}"><div><h3>${product.name}</h3><p>Talla ${line.size} · ${money(product.price)}</p><div class="quantity"><button data-quantity="${index}" data-delta="-1" aria-label="Restar una unidad de ${product.name}" ${line.quantity === 1 ? 'disabled' : ''}>−</button><span>${line.quantity}</span><button data-quantity="${index}" data-delta="1" aria-label="Sumar una unidad de ${product.name}" ${line.quantity === 10 ? 'disabled' : ''}>+</button></div><button class="remove" data-remove="${index}" aria-label="Quitar ${product.name}, talla ${line.size}">Quitar</button></div><strong class="price">${money(product.price * line.quantity)}</strong></article>`;
  }).join('') : '<div class="empty">Tu bolsa está esperando tu estilo.<button id="keep-shopping" class="button light">Explorar colección ↗</button></div>';
  $('#cart-summary').hidden = cart.length === 0;
  $('#cart-total').textContent = money(cart.reduce((sum, line) => sum + products.find((item) => item.id === line.id).price * line.quantity, 0));
}

// Delegación de eventos para elementos generados mediante el DOM.
$('#products').addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const id = Number(button.dataset.add);
  const sizeInput = $(`#size-${id}`);
  if (!sizeInput.value) { notify('Primero elige tu talla.'); sizeInput.focus(); return; }
  const line = cart.find((item) => item.id === id && item.size === sizeInput.value);
  if (line && line.quantity >= 10) { notify('Máximo 10 unidades por prenda y talla.'); return; }
  if (line) line.quantity += 1;
  else cart.push({ id, size: sizeInput.value, quantity: 1 });
  $('#checkout-status').textContent = '';
  saveCart();
  renderCart();
  notify('Agregado a tu bolsa. Buen estilo.');
});

$('.filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach((item) => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  renderProducts();
});
$('#search').addEventListener('input', renderProducts);
$('#sort').addEventListener('change', renderProducts);
$('#open-cart').addEventListener('click', () => { dialog.showModal(); document.body.style.overflow = 'hidden'; });
$('#close-cart').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
$('#cart-items').addEventListener('click', (event) => {
  const quantity = event.target.closest('[data-quantity]');
  const remove = event.target.closest('[data-remove]');
  if (quantity) {
    const line = cart[Number(quantity.dataset.quantity)];
    line.quantity = Math.min(10, Math.max(1, line.quantity + Number(quantity.dataset.delta)));
  } else if (remove) cart.splice(Number(remove.dataset.remove), 1);
  else if (event.target.closest('#keep-shopping')) { dialog.close(); location.hash = 'coleccion'; return; }
  else return;
  saveCart();
  renderCart();
  if (quantity) {
    const replacement = $(`[data-quantity="${quantity.dataset.quantity}"][data-delta="${quantity.dataset.delta}"]`);
    if (replacement && !replacement.disabled) replacement.focus();
    else $('#close-cart').focus();
  } else $('#close-cart').focus();
});
$('#checkout').addEventListener('click', () => {
  if (!cart.length) return;
  const total = $('#cart-total').textContent;
  cart = [];
  saveCart();
  renderCart();
  $('#checkout-status').textContent = `¡Pedido de prueba completado! Total simulado: ${total}. No se realizó ningún cobro ni se enviará un pedido.`;
});
$('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (!String(data.get('name')).trim() || String(data.get('message')).trim().length < 10) {
    $('#form-status').textContent = 'Escribe tu nombre y un mensaje de al menos 10 caracteres.';
    return;
  }
  $('#form-status').textContent = `Gracias, ${String(data.get('name')).trim()}. El formulario se validó correctamente. Esta es una demostración: no se envió el mensaje.`;
  event.currentTarget.reset();
});
loadProducts();
