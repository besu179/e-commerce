document.addEventListener("DOMContentLoaded", requestCategories);

function requestCategories() {
  fetch("http://localhost:8081/user/bakend/menu.php", {
    method: "GET",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);  // Check for HTTP errors
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => console.error("Fetch error:", err)); // More specific error message
}
