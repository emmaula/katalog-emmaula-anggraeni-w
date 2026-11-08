const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const productGrid = document.querySelector('#product-grid');
const cartDialog = document.querySelector('#cart-dialog');
const cartTrigger = document.querySelector('#cart-trigger');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartEmpty = document.querySelector('#cart-empty');
const cartTotal = document.querySelector('#cart-total');
const cartStatus = document.querySelector('#cart-status');
const checkoutButton = document.querySelector('#checkout-btn');
const storePhone = '6285859365744';
const cart = new Map();
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    productCards.forEach((card) => {
      const matchesFilter = button.dataset.filter === 'all'
        || card.dataset.category === button.dataset.filter;
      card.classList.toggle('hidden', !matchesFilter);
    });
  });
});

function renderCart() {
  const items = [...cart.values()];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = itemCount;
  cartTrigger.setAttribute(
    'aria-label',
    `Buka keranjang belanja, ${itemCount} produk`,
  );
  cartItems.replaceChildren();
  cartEmpty.hidden = items.length > 0;
  cartTotal.textContent = rupiah.format(total);
  checkoutButton.setAttribute('aria-disabled', String(items.length === 0));
  checkoutButton.href = `https://wa.me/${storePhone}`;
  cartStatus.textContent = '';

  items.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'cart-item';

    const details = document.createElement('div');
    details.className = 'cart-item-details';

    const name = document.createElement('h3');
    name.textContent = item.name;

    const price = document.createElement('p');
    price.textContent = rupiah.format(item.price);

    details.append(name, price);

    const controls = document.createElement('div');
    controls.className = 'quantity-controls';

    const decrease = document.createElement('button');
    decrease.type = 'button';
    decrease.dataset.cartAction = 'decrease';
    decrease.dataset.product = item.name;
    decrease.setAttribute('aria-label', `Kurangi jumlah ${item.name}`);
    decrease.textContent = '−';

    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;
    quantity.setAttribute('aria-label', 'Jumlah');

    const increase = document.createElement('button');
    increase.type = 'button';
    increase.dataset.cartAction = 'increase';
    increase.dataset.product = item.name;
    increase.setAttribute('aria-label', `Tambah jumlah ${item.name}`);
    increase.textContent = '+';

    controls.append(decrease, quantity, increase);
    row.append(details, controls);
    cartItems.append(row);
  });
}

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.buy-btn');
  if (!button) return;

  const card = button.closest('.product-card');
  const name = card.querySelector('h3').textContent.trim();
  const priceText = card.querySelector('.price').textContent;
  const price = Number(priceText.replace(/\D/g, ''));

  if (!Number.isSafeInteger(price) || price <= 0) {
    console.error(`Harga produk "${name}" tidak valid: ${priceText}`);
    cartStatus.textContent = 'Harga produk tidak valid. Silakan hubungi toko untuk bantuan.';
    return;
  }

  const item = cart.get(name);
  if (item) {
    item.quantity += 1;
  } else {
    cart.set(name, { name, price, quantity: 1 });
  }

  renderCart();
  cartDialog.showModal();
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;

  const item = cart.get(button.dataset.product);
  if (!item) return;

  if (button.dataset.cartAction === 'increase') {
    item.quantity += 1;
  } else if (button.dataset.cartAction === 'decrease') {
    if (item.quantity === 1) {
      cart.delete(item.name);
    } else {
      item.quantity -= 1;
    }
  }

  renderCart();
});

cartTrigger.addEventListener('click', () => {
  renderCart();
  cartDialog.showModal();
});

document.querySelector('#cart-close').addEventListener('click', () => {
  cartDialog.close();
});

cartDialog.addEventListener('click', (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

checkoutButton.addEventListener('click', (event) => {
  if (cart.size === 0) {
    event.preventDefault();
    return;
  }

  const items = [...cart.values()];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderLines = items.map(
    (item) => `- ${item.name} x${item.quantity}: ${rupiah.format(item.price * item.quantity)}`,
  );
  const message = [
    'Halo, saya ingin memesan:',
    '',
    ...orderLines,
    '',
    `Subtotal: ${rupiah.format(total)}`,
    '',
    'Mohon info ketersediaan ukuran dan ongkir. Terima kasih.',
  ].join('\n');

  checkoutButton.href = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
});

renderCart();
