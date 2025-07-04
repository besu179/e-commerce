document.addEventListener("DOMContentLoaded", requestCategories);
document.addEventListener("DOMContentLoaded", requestBanners);
document.addEventListener("DOMContentLoaded", requestFeatured);

function requestCategories() {
  // Use correct relative path
  fetch("http://localhost/ecommerce/user/backend/menu.php")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const navContainer = document.querySelector('.navigation');
      
      if (data.categories && data.categories.length > 0) {
        let navHTML = '<ul class="menu">';
        data.categories.forEach(cat => {
          // Create proper navigation links
          navHTML += `
            <li class="menu-item">
              <a href="http://localhost/ecommerce/user/backend/${cat.toLowerCase()}.php" class="nav-link">
                ${cat}
              </a>
            </li>`;
        });
        navHTML += '</ul>';
        navContainer.innerHTML = navHTML;
      } else {
        navContainer.innerHTML = '<div class="error">No categories available</div>';
      }
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      document.querySelector('.navigation').innerHTML = 
        '<div class="error">Menu loading failed: ' + err.message + '</div>';
    });
}

function requestBanners() {
  
  fetch("http://localhost/ecommerce/user/backend/banners.php")
    .then(res => {
      
      if (!res.ok) {
        console.error("HTTP error detected. Full response:", res);
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      return res.json();
    })
    .then(data => {
      
      const swiperWrapper = document.querySelector('.swiper-wrapper');
      const bannerSection = document.querySelector('.banner');
      
      if (data.banners && data.banners.length > 0) {
        
        swiperWrapper.innerHTML = '';
        
        // Create slides for each banner
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
        
        // Initialize Swiper after content is loaded
        const swiper = new Swiper('.swiper', {
          direction: 'horizontal',
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        });
        
        console.log("Swiper initialized with banners");
      } else {
        console.warn("No banners found in response");
        bannerSection.innerHTML = '<div class="error">No banners available</div>';
      }
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      
      const bannerSection = document.querySelector('.banner');
      bannerSection.innerHTML = '<div class="error">Banner loading failed: ' + err.message + '</div>';
    });
}

function requestFeatured() {
  fetch("http://localhost/ecommerce/user/backend/featured.php")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const featuredSection = document.querySelector('.featured-products');
      
      if (data.featured && data.featured.length > 0) {
        featuredSection.innerHTML = `
          <div class="section-header">
            <h2 class="section-title">Premium Collection</h2>
            <p class="section-subtitle">Handpicked luxury items for the discerning shopper</p>
          </div>
          <div class="featured-grid">
            ${data.featured.map(product => `
              <div class="product-card">
                <div class="product-badge">Premium</div>
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
            `).join('')}
          </div>
        `;
      } else {
        featuredSection.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-gem"></i>
            <h3>No Premium Products Available</h3>
            <p>Check back soon for our luxury collection</p>
          </div>
        `;
      }
      
      // Initialize tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(tooltipTriggerEl => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      document.querySelector('.featured-products').innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Failed to Load Products</h3>
          <p>${err.message}</p>
          <button class="retry-btn">Try Again</button>
        </div>
      `;
      
      // Add retry functionality
      document.querySelector('.retry-btn').addEventListener('click', requestFeatured);
    });
}