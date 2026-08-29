const fallbackProducts = [
  { id: 1, name: 'Arc Table Lamp', price: 168, categoryName: 'Living', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Ribbed Vessel', price: 42, categoryName: 'Home', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Quiet Morning Set', price: 64, categoryName: 'Ritual', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Oak Side Table', price: 224, categoryName: 'Living', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' }
];
let products = fallbackProducts, cart = [];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const cleanCategory = product => (product.categoryName || 'All').toLowerCase();
function renderProducts(filter = 'all') {
  const selected = filter === 'all' ? products : products.filter(p => cleanCategory(p) === filter);
  const grid = document.querySelector('#productGrid');
  grid.innerHTML = selected.map(p => `<article class="product-card"><div class="product-image"><img src="${p.imageUrl || fallbackProducts[(p.id - 1) % fallbackProducts.length].imageUrl}" alt="${p.name}" loading="lazy" /><button class="quick-add" data-id="${p.id}">Add to bag</button></div><div class="product-info"><div><p>${p.categoryName || 'Arden collection'}</p><h3>${p.name}</h3></div><strong>${money(p.price)}</strong></div></article>`).join('') || '<p class="no-products">Nothing found in this collection.</p>';
}
function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0), total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('#cartCount').textContent = itemCount;
  document.querySelector('#drawerCount').textContent = `(${itemCount})`;
  document.querySelector('#cartTotal').textContent = money(total);
  document.querySelector('#cartItems').innerHTML = cart.length ? cart.map(item => `<div class="cart-item"><img src="${item.imageUrl}" alt="" /><div><h3>${item.name}</h3><p>${money(item.price)} · Qty ${item.quantity}</p><button data-remove="${item.id}">Remove</button></div></div>`).join('') : '<p class="empty-bag">Your bag is waiting for something good.</p>';
}
function addItem(id) { const product = products.find(p => p.id === Number(id)); if (!product) return; const existing = cart.find(i => i.id === product.id); if (existing) existing.quantity++; else cart.push({ ...product, quantity: 1, imageUrl: product.imageUrl || fallbackProducts[0].imageUrl }); renderCart(); openCart(); }
function openCart() { document.body.classList.add('drawer-open'); document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'false'); }
function closeCart() { document.body.classList.remove('drawer-open'); document.querySelector('#cartDrawer').setAttribute('aria-hidden', 'true'); }
async function loadProducts() { try { const response = await fetch('/api/Product'); if (!response.ok) throw new Error(); const data = await response.json(); if (Array.isArray(data) && data.length) products = data.filter(p => p.isActive !== false); } catch { /* API may be offline during storefront preview; curated products remain available. */ } renderProducts(); }
document.querySelector('#productGrid').addEventListener('click', e => { const button = e.target.closest('[data-id]'); if (button) addItem(button.dataset.id); });
document.querySelector('#cartItems').addEventListener('click', e => { const id = e.target.dataset.remove; if (id) { cart = cart.filter(item => item.id !== Number(id)); renderCart(); } });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); renderProducts(button.dataset.filter); }));
document.querySelector('#cartButton').addEventListener('click', openCart); document.querySelector('#closeCart').addEventListener('click', closeCart); document.querySelector('#overlay').addEventListener('click', closeCart);
document.querySelector('.menu-button').addEventListener('click', e => { document.querySelector('nav').classList.toggle('show'); e.currentTarget.setAttribute('aria-expanded', document.querySelector('nav').classList.contains('show')); });
document.querySelector('#newsletterForm').addEventListener('submit', e => { e.preventDefault(); document.querySelector('#formMessage').textContent = 'You’re on the list. Welcome to Arden.'; e.target.reset(); });
document.querySelector('#searchButton').addEventListener('click', () => document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' }));
loadProducts(); renderCart();
