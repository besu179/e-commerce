document.addEventListener("DOMContentLoaded", requestCategories);
document.addEventListener("DOMContentLoaded", requestBanners);

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
              <a href="/category/${cat.toLowerCase()}" class="nav-link">
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