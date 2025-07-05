// Select elements
let login = document.querySelector(".login");
let logout = document.querySelector(".logout");
let register = document.querySelector(".register");
let loggedUser = document.querySelector(".logged-user");

// Create login overlay
function createLoginOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "login-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <button class="close-overlay">&times;</button>
      <div class="login-form">
        <h2>Login to Your Account</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <div class="form-options">
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          <button type="submit" class="login-btn">Sign In</button>
        </form>
        <div class="register-link">
          Don't have an account? <a href="#" class="switch-to-register">Register now</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Show login overlay
function showLoginOverlay() {
  let overlay = document.querySelector(".login-overlay");
  if (!overlay) {
    overlay = createLoginOverlay();
  }

  overlay.classList.add("active");

  // Add event listeners
  overlay
    .querySelector(".close-overlay")
    .addEventListener("click", hideLoginOverlay);
  overlay
    .querySelector(".switch-to-register")
    .addEventListener("click", (e) => {
      e.preventDefault();
      hideLoginOverlay();
      // In a real app, you would show registration form here
      alert("Registration form would appear here");
    });
}

// Login form handler
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Basic validation
    if (!email || !password) {
      alert("Please fill in both email and password");
      return;
    }

    // Show loading state
    const loginBtn = document.querySelector(".login-btn");
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    try {
      // Send login request
      const response = await fetch("backend/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle response errors
      if (!response.ok) {
        let errorMsg = "Login failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `HTTP error! Status: ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Login successful
        const user = data.user;

        // Store user data
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Update UI
        loggedIn = true;
        updateLoginUI();

        // Show welcome message
        alert(`Welcome back, ${user.first_name || user.email || "User"}!`);

        // Close overlay
        hideLoginOverlay();
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      // Show error message
      console.error("Login error:", error);
      alert(`Login failed: ${error.message}`);
      
      // Clear password field
      document.getElementById("password").value = "";
    } finally {
      // Reset button
      loginBtn.textContent = originalBtnText;
      loginBtn.disabled = false;
    }
  });
}

// Hide login overlay
function hideLoginOverlay() {
  const overlay = document.querySelector(".login-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

// Event listeners for login button
if (login) {
  login.addEventListener("click", () => {
    showLoginOverlay();
    // Setup form after overlay is shown
    setTimeout(setupLoginForm, 50);
  });
}

// Utility function to show/hide elements
function showHideElement(element, show) {
  if (element) {
    element.style.display = show ? "block" : "none";
  }
}

// For demo purposes, let's assume we have a loggedIn state
let loggedIn = false;

// Toggle UI based on login state
function updateLoginUI() {
  showHideElement(login, !loggedIn);
  showHideElement(register, !loggedIn);
  showHideElement(logout, loggedIn);
  showHideElement(loggedUser, loggedIn);

  if (loggedIn) {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser"));

    // Update user display
    if (user && loggedUser) {
      loggedUser.innerHTML = `
        <i class="fas fa-user-circle"></i>
        <span class="username">${user.first_name || user.email || "User"}</span>
      `;
    }
  }
}

// Logout functionality
if (logout) {
  logout.addEventListener("click", () => {
    loggedIn = false;
    localStorage.removeItem("currentUser");
    updateLoginUI();
    alert("You have been logged out");
  });
}

// Initialize UI and check login status
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    loggedIn = true;
    updateLoginUI();
  } else {
    updateLoginUI();
  }
});