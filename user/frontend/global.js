document.addEventListener("DOMContentLoaded", requestCategories);
document.addEventListener("DOMContentLoaded", requestBanners);
document.addEventListener("DOMContentLoaded", requestFeatured);

// Generic fetch helper
function fetchJSON(url) {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    });
}

// Product card generator
function generateProductCard(product, badgeText = "Premium") {
  return `
    <div class="product-card">
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
        <button class="add-to-cart">Add to Cart</button>
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
  sectionElement.querySelector('.retry-btn').addEventListener('click', retryFunction);
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
  
  if (products && products.length > 0) {
    sectionElement.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">${sectionHeader.title}</h2>
        <p class="section-subtitle">${sectionHeader.subtitle}</p>
      </div>
      <div class="featured-grid">
        ${products.map(product => generateProductCard(product, badgeText)).join('')}
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

function requestCategories() {
  fetchJSON("http://localhost/ecommerce/user/backend/menu.php")
    .then(data => {
      const navContainer = document.querySelector('.navigation');
      if (data.categories?.length > 0) {
        let navHTML = '<ul class="menu">';
        data.categories.forEach(cat => {
          navHTML += `
            <li class="menu-item">
              <a href="#items-section" class="nav-link" data-category="${cat.toLowerCase()}">
                ${cat}
              </a>
            </li>`;
        });
        navHTML += '</ul>';
        navContainer.innerHTML = navHTML;
        
        document.querySelectorAll('.nav-link[data-category]').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            requestCategoryName(category);
            document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
          });
        });
      } else {
        navContainer.innerHTML = '<div class="error">No categories available</div>';
      }
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      document.querySelector('.navigation').innerHTML = 
        `<div class="error">Menu loading failed: ${err.message}</div>`;
    });
}

function requestCategoryName(category) {
  const endpoints = {
    electronics: {
      url: "http://localhost/ecommerce/user/backend/electronics.php",
      key: 'electronics',
      emptyState: {
        icon: 'fas fa-bolt',
        title: 'No Electronics Available',
        message: 'Check back soon for new electronics.'
      }
    },
    food: {
      url: "http://localhost/ecommerce/user/backend/food.php",
      key: 'food',
      emptyState: {
        icon: 'fas fa-apple-alt',
        title: 'No Food Products Available',
        message: 'Check back soon for tasty additions.'
      }
    },
    men: {
      url: "http://localhost/ecommerce/user/backend/men.php",
      key: 'men',
      emptyState: {
        icon: 'fas fa-male',
        title: 'No Men\'s Products Available',
        message: 'Check back soon for more men\'s items.'
      }
    },
    women: {
      url: "http://localhost/ecommerce/user/backend/women.php",
      key: 'women',
      emptyState: {
        icon: 'fas fa-female',
        title: 'No Women\'s Products Available',
        message: 'Check back soon for more women\'s items.'
      }
    },
    children: {
      url: "http://localhost/ecommerce/user/backend/children.php",
      key: 'children',
      emptyState: {
        icon: 'fas fa-child',
        title: 'No Children\'s Products Available',
        message: 'Check back soon for more children\'s items.'
      }
    }
  };

  const config = endpoints[category];
  if (!config) return;

  fetchJSON(config.url)
    .then(data => {
      const featuredSection = document.getElementById('items-section');
      renderProducts(data[config.key], {
        sectionElement: featuredSection,
        badgeText: category.charAt(0).toUpperCase() + category.slice(1),
        sectionHeader: {
          title: "Products Collection",
          subtitle: "Handpicked items for the discerning shopper"
        },
        emptyState: config.emptyState
      });
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      const featuredSection = document.getElementById('items-section');
      showErrorState(featuredSection, err, () => requestCategoryName(category));
    });
}

function requestBanners() {
  fetchJSON("http://localhost/ecommerce/user/backend/banners.php")
    .then(data => {
      const swiperWrapper = document.querySelector('.swiper-wrapper');
      const bannerSection = document.querySelector('.banner');
      
      if (data.banners?.length > 0) {
        swiperWrapper.innerHTML = '';
        data.banners.forEach((banner) => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.innerHTML = `
            <div class="slide-content">
              <h2>${banner.name}</h2>
              <p>${banner.description}</p>
            </div>
            <img src="${banner.image}" alt="${banner.name}" class="banner-image">
          `;
          swiperWrapper.appendChild(slide);
        });

        new Swiper('.swiper', {
          direction: 'horizontal',
          loop: true,
          autoplay: { delay: 5000, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        });
      } else {
        bannerSection.innerHTML = '<div class="error">No banners available</div>';
      }
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      document.querySelector('.banner').innerHTML = 
        `<div class="error">Banner loading failed: ${err.message}</div>`;
    });
}

function requestFeatured() {
  fetchJSON("http://localhost/ecommerce/user/backend/featured.php")
    .then(data => {
      const featuredSection = document.getElementById('items-section');
      renderProducts(data.featured, {
        sectionElement: featuredSection,
        badgeText: "Premium",
        sectionHeader: {
          title: "Premium Collection",
          subtitle: "Handpicked luxury items for the discerning shopper"
        },
        emptyState: {
          icon: 'fas fa-gem',
          title: 'No Premium Products Available',
          message: 'Check back soon for our luxury collection'
        }
      });
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      const featuredSection = document.getElementById('items-section');
      showErrorState(featuredSection, err, requestFeatured);
    });
}