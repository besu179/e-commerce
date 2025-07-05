
// --- Cart logic ---
// Initialize cart array
window.cart = JSON.parse(localStorage.getItem("cart") || "[]");

function handleCheckout() {
  const cart = window.cart;
  if (cart.length === 0) {
    showNotification("Your cart is empty", "error");
    return;
  }

  // Get user info
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    showNotification("Please login to proceed with checkout", "error");
    return;
  }

  // Validate cart items
  const invalidItems = cart.filter(item => !item.id || !item.price || !item.quantity || item.quantity <= 0);
  if (invalidItems.length > 0) {
    showNotification("Some items in your cart are invalid. Please refresh the page and try again.", "error");
    return;
  }

  // Prepare purchase data
  const purchaseData = {
    userId: user.id,
    items: cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    })),
    total: cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  };

  // Send purchase request to backend
  fetch("http://localhost/ecommerce/user/backend/purchase.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(purchaseData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Clear cart after successful purchase
      localStorage.removeItem("cart");
      window.cart = [];
      renderCart();
      showNotification("Purchase successful! Your order has been placed.", "success");
    } else {
      showNotification(`Purchase failed: ${data.message || "Unknown error"}`, "error");
    }
  })
  .catch(error => {
    console.error("Error during purchase:", error);
    showNotification("An error occurred during purchase. Please try again later.", "error");
  });
}

function addToCart(item) {
  const idx = window.cart.findIndex((p) => p.id === item.id);
  if (idx > -1) {
    window.cart[idx].quantity = Number(window.cart[idx].quantity) + Number(item.quantity);
  } else {
    window.cart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(window.cart));
  renderCart();
  showNotification(`Added ${item.quantity} ${item.name} to cart`, "success");
}

function renderCart() {
  const cartDiv = document.querySelector(".cart");
  if (!cartDiv) return;
  let summary = cartDiv.querySelector('.cart-summary');
  if (!summary) {
    summary = document.createElement('span');
    summary.className = 'cart-summary';
    cartDiv.innerHTML = '';
    cartDiv.appendChild(summary);
  }
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  
  if (cart.length === 0) {
    summary.textContent = 'Cart (0)';
    removeCartDetails();
    return;
  }

  // Calculate total value
  const totalQuantity = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalValue = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  
  // Update summary
  summary.textContent = `Cart (${totalQuantity}) - $${totalValue.toFixed(2)}`;
  
  // Update cart details if visible
  const cartDetails = document.querySelector(".cart-details");
  if (cartDetails) {
    let html = '<ul class="cart-list">';
    cart.forEach(item => {
      html += `
        <li>
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
            <span class="cart-item-quantity">x${item.quantity}</span>
          </div>
          <button class="remove-from-cart" data-id="${item.id}">&times;</button>
        </li>
      `;
    });
    html += '</ul>';
    
    // Add total section
    html += `
      <div class="cart-total">
        <span>Total: $${totalValue.toFixed(2)}</span>
        <button class="checkout-btn">Proceed to Checkout</button>
      </div>
    `;
    
    cartDetails.innerHTML = html;
    
    // Add event listeners for remove buttons
    cartDetails.querySelectorAll('.remove-from-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = e.target.dataset.id;
        const updatedCart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        renderCart();
      });
    });
    
    // Add checkout button handler
    const checkoutBtn = cartDetails.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', handleCheckout);
    }
  }
}

function toggleCartDetails() {
  const cartDiv = document.querySelector(".cart");
  if (!cartDiv) return;

  let details = document.querySelector(".cart-details");
  if (details) {
    details.remove();
    return;
  }

  const cart = window.cart || [];
  if (cart.length === 0) {
    showNotification("Your cart is empty", "info");
    return;
  }

  details = document.createElement("div");
  details.className = "cart-details";
  
  // Create cart items list
  let html = '<div class="cart-items">';
  html += '<ul class="cart-list">';
  
  cart.forEach(item => {
    html += `
      <li class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <div class="cart-item-info">
            <span class="cart-item-price">$${item.price}</span>
            <span class="cart-item-quantity">Quantity: ${item.quantity}</span>
            <span class="cart-item-subtotal">Subtotal: $${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
          </div>
          <button class="remove-item" data-id="${item.id}">Remove</button>
        </div>
      </li>
    `;
  });
  
  html += '</ul>';
  
  // Calculate totals
  const totalQuantity = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalValue = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  
  // Add totals section
  html += `
    <div class="cart-totals">
      <div class="cart-total-row">
        <span>Total Items:</span>
        <span>${totalQuantity}</span>
      </div>
      <div class="cart-total-row">
        <span>Subtotal:</span>
        <span>$${totalValue.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span>Tax (15%):</span>
        <span>$${(totalValue * 0.15).toFixed(2)}</span>
      </div>
      <div class="cart-total-row total">
        <span>Total:</span>
        <span>$${(totalValue * 1.15).toFixed(2)}</span>
      </div>
    </div>
    <button class="checkout-btn">Proceed to Checkout</button>
  </div>`;
  
  details.innerHTML = html;
  
  // Position below cart icon
  const rect = cartDiv.getBoundingClientRect();
  details.style.position = 'absolute';
  details.style.top = `${rect.bottom + window.scrollY}px`;
  details.style.left = `${rect.left + window.scrollX}px`;
  details.style.zIndex = 1000;
  
  // Add event listeners for remove buttons
  details.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = e.target.dataset.id;
      const updatedCart = cart.filter(item => item.id !== itemId);
      window.cart = updatedCart;
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      renderCart();
      showNotification(`Removed item from cart`, "success");
      if (updatedCart.length === 0) {
        details.remove();
      }
    });
  });
  
  // Add checkout button handler
  const checkoutBtn = details.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
  
  document.body.appendChild(details);
}

function removeCartDetails() {
  const details = document.querySelector(".cart-details");
  if (details) details.remove();
}

// --- End cart logic ---

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize all components
    requestCategories();
    requestBanners();
    requestFeatured();
    requestNewArrivals();
    
    // Setup event delegation for product actions
    setupEventDelegation();
    
    // Add cart click event listener
    const cartElement = document.querySelector('.cart');
    if (cartElement) {
      cartElement.addEventListener('click', (e) => {
        // Prevent click if clicking on the cart summary (number)
        if (e.target.classList.contains('cart-summary')) {
          return;
        }
        toggleCartDetails();
      });
    }
  } catch (error) {
    console.error('Error initializing components:', error);
  }
});

// Create product overlay
function createProductOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "product-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <button class="close-overlay">&times;</button>
      <div class="overlay-grid">
        <div class="overlay-image-container">
          <img src="" alt="Product Image" class="overlay-image">
        </div>
        <div class="overlay-details">
          <h2 class="overlay-title"></h2>
          <div class="overlay-price"></div>
          <div class="overlay-stock"></div>
          <label for="overlay-quantity">Quantity:</label>
          <select id="overlay-quantity" class="overlay-quantity"></select>
          <p class="overlay-description"></p>
          <div class="overlay-actions">
            <button class="add-to-cart-btn">Add to Cart</button>
            <button class="close-btn">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Show product details in overlay
async function showProductDetails(product) {
  let overlay = document.querySelector(".product-overlay");
  if (!overlay) {
    overlay = createProductOverlay();
  }

  overlay.querySelector(".overlay-image").src = product.image;
  overlay.querySelector(".overlay-title").textContent = product.name;
  overlay.querySelector(".overlay-price").textContent = `$${product.price}`;

  // Set stock information
  const stockElement = overlay.querySelector(".overlay-stock");
  const stock = Number(product.stock);
  const quantitySelect = overlay.querySelector(".overlay-quantity");
  quantitySelect.innerHTML = "";
  if (!isNaN(stock) && stock > 0) {
    stockElement.textContent = `${stock} left in stock`;
    stockElement.className = "overlay-stock in-stock";
    // Populate quantity dropdown
    for (let i = 1; i <= stock; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      quantitySelect.appendChild(option);
    }
    quantitySelect.disabled = false;
  } else {
    stockElement.textContent = "Out of stock";
    stockElement.className = "overlay-stock out-of-stock";
    // Disable quantity dropdown
    const option = document.createElement("option");
    option.value = 0;
    option.textContent = "0";
    quantitySelect.appendChild(option);
    quantitySelect.disabled = true;
  }

  overlay.querySelector(".overlay-description").textContent = product.description;

  // Remove previous event listeners by cloning
  const closeBtn = overlay.querySelector(".close-overlay");
  const continueBtn = overlay.querySelector(".close-btn");
  const addToCartBtn = overlay.querySelector(".add-to-cart-btn");
  closeBtn.replaceWith(closeBtn.cloneNode(true));
  continueBtn.replaceWith(continueBtn.cloneNode(true));
  addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));

  overlay.querySelector(".close-overlay").addEventListener("click", hideOverlay);
  overlay.querySelector(".close-btn").addEventListener("click", hideOverlay);

  overlay.querySelector(".add-to-cart-btn").addEventListener("click", async () => {
    const stock = Number(product.stock);
    const quantity = Number(quantitySelect.value);
    if (!isNaN(stock) && stock > 0 && quantity > 0) {
      // Check login status
      let user = localStorage.getItem("currentUser");
      if (!user) {
        showNotification("Please login to add items to cart", "error");
        return;
      }

      // Add item to cart
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        stock: stock
      });
      
      // Close overlay
      hideOverlay();
      if (!user) {
        showNotification("Please log in to purchase.", "error");
        return;
      }
      // Call purchase endpoint
      try {
        const response = await fetch("http://localhost/ecommerce/user/backend/purchase.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product_id: product.id, quantity })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          showNotification(`${product.name} purchased!`, "success");
          // Add to cart and update UI
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
          });
          hideOverlay();
        } else {
          showNotification(data.error || "Purchase failed", "error");
        }
      } catch (err) {
        showNotification("Purchase failed: " + err.message, "error");
      }
    } else {
      showNotification("This product is out of stock", "error");
    }
  });

  overlay.classList.add("active");
}

function hideOverlay() {
  const overlay = document.querySelector(".product-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

// Setup event delegation for product actions
function setupEventDelegation() {
  document.body.addEventListener("click", (e) => {
    // Handle Add to Cart clicks
    if (e.target.closest(".add-to-cart")) {
      const button = e.target.closest(".add-to-cart");
      const card = button.closest(".product-card");
      if (card) {
        const product = {
          id: card.dataset.id,
          name: card.dataset.name,
          image: card.dataset.image,
          description: card.dataset.description,
          price: card.dataset.price,
          stock: card.dataset.stock,
        };
        showProductDetails(product);
      }
    }

    // Handle Quick View clicks
    if (e.target.closest(".quick-view")) {
      const button = e.target.closest(".quick-view");
      const card = button.closest(".product-card");
      if (card) {
        const product = {
          name: card.dataset.name,
          image: card.dataset.image,
          description: card.dataset.description,
          price: card.dataset.price,
          stock: parseInt(card.dataset.stock),
        };
        showProductDetails(product);
      }
    }
  });
}
// Generic fetch helper
function fetchJSON(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  });
}

// Escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Product card generator
// Product card generator
function generateProductCard(product, badgeText = "Premium") {
  return `
    <div class="product-card"
         data-id="${product.id || ''}"
         data-name="${escapeHtml(product.name)}"
         data-image="${escapeHtml(product.image)}"
         data-description="${escapeHtml(product.description)}"
         data-price="${escapeHtml(product.price)}"
         data-stock="${escapeHtml(String(product.stock))}">
      <div class="product-badge">${badgeText}</div>
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="featured-image">
        <div class="product-actions">
          <button class="quick-view"><i class="fas fa-eye"></i></button>
          <button class="add-to-wishlist"><i class="fas fa-heart"></i></button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description.substring(0, 80)}...</p>
        <div class="product-meta">
          <div class="product-price">$${product.price}</div>
          <div class="product-rating">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
            <span class="rating-count">(42)</span>
          </div>
        </div>
        <button class="add-to-cart">Show Detail</button>
      </div>
    </div>
  `;
}

// Error state generator
function showErrorState(sectionElement, error, retryFunction) {
  sectionElement.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Failed to Load Products</h3>
      <p>${error.message}</p>
      <button class="retry-btn">Try Again</button>
    </div>
  `;
  sectionElement
    .querySelector(".retry-btn")
    .addEventListener("click", retryFunction);
}

// Empty state generator
function showEmptyState(icon, title, message) {
  return `
    <div class="empty-state">
      <i class="${icon}"></i>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

// Render products grid
function renderProducts(products, options) {
  const { sectionElement, badgeText, sectionHeader, emptyState } = options;

  if (products?.length > 0) {
    sectionElement.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${sectionHeader.title}</h2>
        <p class="section-subtitle">${sectionHeader.subtitle}</p>
      </div>
      <div class="featured-grid">
        ${products
          .map((product) => generateProductCard(product, badgeText))
          .join("")}
      </div>
    `;
  } else {
    sectionElement.innerHTML = showEmptyState(
      emptyState.icon,
      emptyState.title,
      emptyState.message
    );
  }
}

// Generic product fetcher and renderer
function fetchAndRenderProducts(options) {
  const { url, dataKey, sectionElement, ...renderOptions } = options;

  fetchJSON(url)
    .then((data) => {
      renderProducts(data[dataKey], {
        sectionElement,
        ...renderOptions,
      });
    })
    .catch((err) => {
      showErrorState(sectionElement, err, () =>
        fetchAndRenderProducts(options)
      );
    });
}

function requestCategories() {
  const navContainer = document.querySelector(".navigation");
  if (!navContainer) {
    console.error("Navigation container not found");
    return;
  }

  fetchJSON("http://localhost/ecommerce/user/backend/menu.php")
    .then((data) => {
      if (!data?.categories?.length) {
        showErrorState(navContainer, "No categories available", () => requestCategories());
        return;
      }

      navContainer.innerHTML = `
        <ul class="menu">
          ${data.categories
            .map(
              (cat) => `
            <li class="menu-item">
              <a href="#items-section" class="nav-link" data-category="${cat.toLowerCase()}">
                ${cat}
              </a>
            </li>`
            )
            .join("")}
        </ul>
      `;

      const links = navContainer.querySelectorAll(".nav-link[data-category]");
      if (links.length > 0) {
        links.forEach((link) => {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            requestCategoryName(this.dataset.category);
            document
              .getElementById("items-section")
              ?.scrollIntoView({ behavior: "smooth" });
          });
        });
      }
    })
    .catch((err) => {
      console.error("Fetch failed:", err);
      showErrorState(navContainer, `Menu loading failed: ${err.message}`, () => requestCategories());
    });
}

// Category configuration
const CATEGORY_CONFIG = {
  electronics: {
    url: "http://localhost/ecommerce/user/backend/electronics.php",
    dataKey: "electronics",
    emptyState: {
      icon: "fas fa-bolt",
      title: "No Electronics Available",
      message: "Check back soon for new electronics.",
    },
  },
  food: {
    url: "http://localhost/ecommerce/user/backend/food.php",
    dataKey: "food",
    emptyState: {
      icon: "fas fa-apple-alt",
      title: "No Food Products Available",
      message: "Check back soon for tasty additions.",
    },
  },
  men: {
    url: "http://localhost/ecommerce/user/backend/men.php",
    dataKey: "men",
    emptyState: {
      icon: "fas fa-male",
      title: "No Men's Products Available",
      message: "Check back soon for more men's items.",
    },
  },
  women: {
    url: "http://localhost/ecommerce/user/backend/women.php",
    dataKey: "women",
    emptyState: {
      icon: "fas fa-female",
      title: "No Women's Products Available",
      message: "Check back soon for more women's items.",
    },
  },
  children: {
    url: "http://localhost/ecommerce/user/backend/children.php",
    dataKey: "children",
    emptyState: {
      icon: "fas fa-child",
      title: "No Children's Products Available",
      message: "Check back soon for more children's items.",
    },
  },
};

function requestCategoryName(category) {
  const config = CATEGORY_CONFIG[category];
  if (!config) return;

  fetchAndRenderProducts({
    url: config.url,
    dataKey: config.dataKey,
    sectionElement: document.getElementById("items-section"),
    badgeText: category.charAt(0).toUpperCase() + category.slice(1),
    sectionHeader: {
      title: "Products Collection",
      subtitle: "Handpicked items for the discerning shopper",
    },
    emptyState: config.emptyState,
  });
}

function requestBanners() {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  const bannerSection = document.querySelector(".banner");
  
  if (!swiperWrapper || !bannerSection) {
    console.error("Banner container elements not found");
    return;
  }

  fetchJSON("http://localhost/ecommerce/user/backend/banners.php")
    .then((data) => {
      if (!data?.banners?.length) {
        showErrorState(bannerSection, "No banners available", () => requestBanners());
        return;
      }

      swiperWrapper.innerHTML = data.banners
        .map(
          (banner) => `
        <div class="swiper-slide">
          <div class="slide-content">
            <h2>${banner.name}</h2>
            <p>${banner.description}</p>
          </div>
          <img src="${banner.image}" alt="${banner.name}" class="banner-image">
        </div>`
        )
        .join("");

      try {
        new Swiper(".swiper", {
          direction: "horizontal",
          loop: true,
          autoplay: { delay: 5000, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
        });
      } catch (swiperError) {
        console.error("Swiper initialization failed:", swiperError);
        showErrorState(bannerSection, "Banner slider initialization failed", () => requestBanners());
      }
    })
    .catch((err) => {
      console.error("Fetch failed:", err);
      showErrorState(bannerSection, `Banner loading failed: ${err.message}`, () => requestBanners());
    });
}

function requestFeatured() {
  fetchAndRenderProducts({
    url: "http://localhost/ecommerce/user/backend/featured.php",
    dataKey: "featured",
    sectionElement: document.getElementById("items-section"),
    badgeText: "Premium",
    sectionHeader: {
      title: "Premium Collection",
      subtitle: "Handpicked luxury items for the discerning shopper",
    },
    emptyState: {
      icon: "fas fa-gem",
      title: "No Premium Products Available",
      message: "Check back soon for our luxury collection",
    },
  });
}

function requestNewArrivals() {
  fetchAndRenderProducts({
    url: "http://localhost/ecommerce/user/backend/random.php",
    dataKey: "random",
    sectionElement: document.querySelector(".new-arrivals"),
    badgeText: "New",
    sectionHeader: {
      title: "New Arrivals",
      subtitle: "Discover the latest additions to our store",
    },
    emptyState: {
      icon: "fas fa-box-open",
      title: "No New Arrivals",
      message: "Check back soon for new products!",
    },
  });
}
