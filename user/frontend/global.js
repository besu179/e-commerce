document.addEventListener("DOMContentLoaded", () => {
  requestCategories();
  requestBanners();
  requestFeatured();
  requestNewArrivals();
  setupEventDelegation();

  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    loggedIn = true;
    updateLoginUI();
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
function showProductDetails(product) {
  let overlay = document.querySelector(".product-overlay");
  if (!overlay) {
    overlay = createProductOverlay();
  }

  overlay.querySelector(".overlay-image").src = product.image;
  overlay.querySelector(".overlay-title").textContent = product.name;
  overlay.querySelector(".overlay-price").textContent = `$${product.price}`;

  // Set stock information
  const stockElement = overlay.querySelector(".overlay-stock");
  if (product.stock > 0) {
    stockElement.textContent = `${product.stock} left in stock`;
    stockElement.className = "overlay-stock in-stock";
  } else {
    stockElement.textContent = "Out of stock";
    stockElement.className = "overlay-stock out-of-stock";
  }

  overlay.querySelector(".overlay-description").textContent =
    product.description;

  // Add event listeners
  overlay
    .querySelector(".close-overlay")
    .addEventListener("click", hideOverlay);
  overlay.querySelector(".close-btn").addEventListener("click", hideOverlay);
  overlay.querySelector(".add-to-cart-btn").addEventListener("click", () => {
    if (product.stock > 0) {
      showNotification(`${product.name} added to cart!`, "success");
      hideOverlay();
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
          name: card.dataset.name,
          image: card.dataset.image,
          description: card.dataset.description,
          price: card.dataset.price,
          stock: parseInt(card.dataset.stock),
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
function generateProductCard(product, badgeText = "Premium") {
  return `
    <div class="product-card"
         data-name="${escapeHtml(product.name)}"
         data-image="${escapeHtml(product.image)}"
         data-description="${escapeHtml(product.description)}"
         data-price="${escapeHtml(product.price)}">
      <div class="product-badge">${badgeText}</div>
      <div class="product-image-container">
        <img src="${product.image}" alt="${
    product.name
  }" class="featured-image">
        <div class="product-actions">
          <button class="quick-view"><i class="fas fa-eye"></i></button>
          <button class="add-to-wishlist"><i class="fas fa-heart"></i></button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description.substring(
          0,
          80
        )}...</p>
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
  fetchJSON("http://localhost/ecommerce/user/backend/menu.php")
    .then((data) => {
      const navContainer = document.querySelector(".navigation");
      if (!data.categories?.length) {
        navContainer.innerHTML =
          '<div class="error">No categories available</div>';
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

      navContainer
        .querySelectorAll(".nav-link[data-category]")
        .forEach((link) => {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            requestCategoryName(this.dataset.category);
            document
              .getElementById("items-section")
              ?.scrollIntoView({ behavior: "smooth" });
          });
        });
    })
    .catch((err) => {
      console.error("Fetch failed:", err);
      document.querySelector(
        ".navigation"
      ).innerHTML = `<div class="error">Menu loading failed: ${err.message}</div>`;
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
  fetchJSON("http://localhost/ecommerce/user/backend/banners.php")
    .then((data) => {
      const swiperWrapper = document.querySelector(".swiper-wrapper");
      const bannerSection = document.querySelector(".banner");

      if (!data.banners?.length) {
        bannerSection.innerHTML =
          '<div class="error">No banners available</div>';
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
    })
    .catch((err) => {
      console.error("Fetch failed:", err);
      document.querySelector(
        ".banner"
      ).innerHTML = `<div class="error">Banner loading failed: ${err.message}</div>`;
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
