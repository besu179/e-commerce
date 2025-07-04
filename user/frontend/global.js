document.addEventListener("DOMContentLoaded", requestCategories);

function requestCategories() {
  fetch("../backend/menu.php")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const navContainer = document.querySelector('.navigation');
      
      if (data.categories && data.categories.length > 0) {
        let navHTML = '<ul class="menu">';
        data.categories.forEach(cat => {
          navHTML += `<li><a href="/category/${cat.toLowerCase()}">${cat}</a></li>`;
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
        '<div class="error">Menu loading failed</div>';
    });
}