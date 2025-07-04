document.addEventListener("DOMContentLoaded", requestCategories);

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