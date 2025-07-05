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

// Create registration overlay
function createRegisterOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "register-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <button class="close-overlay">&times;</button>
      <div class="register-form">
        <h2>Create Your Account</h2>
        <form id="registerForm">
          <div class="form-row">
            <div class="form-group">
              <label for="regFirstName">First Name</label>
              <input type="text" id="regFirstName" name="first_name" required>
            </div>
            <div class="form-group">
              <label for="regLastName">Last Name</label>
              <input type="text" id="regLastName" name="last_name" required>
            </div>
          </div>
          <div class="form-group">
            <label for="regEmail">Email</label>
            <input type="email" id="regEmail" name="email" required>
          </div>
          <div class="form-group">
            <label for="regPassword">Password</label>
            <div class="password-container">
              <input type="password" id="regPassword" name="password" required>
              <i class="fas fa-eye password-toggle"></i>
            </div>
          </div>
          <div class="form-group">
            <label for="regConfirmPassword">Confirm Password</label>
            <input type="password" id="regConfirmPassword" name="confirm_password" required>
          </div>
          <button type="submit" class="register-btn">Create Account</button>
        </form>
        <div class="login-link">
          Already have an account? <a href="#" class="switch-to-login">Sign in</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Show login overlay
function showLoginOverlay() {
  hideRegisterOverlay();
  let overlay = document.querySelector(".login-overlay");
  if (!overlay) {
    overlay = createLoginOverlay();
  }
  overlay.classList.add("active");
  overlay.querySelector(".close-overlay").addEventListener("click", hideLoginOverlay);
  overlay.querySelector(".switch-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    hideLoginOverlay();
    showRegisterOverlay();
  });
  setupLoginForm();
}

// Show registration overlay
function showRegisterOverlay() {
  hideLoginOverlay();
  let overlay = document.querySelector(".register-overlay");
  if (!overlay) {
    overlay = createRegisterOverlay();
  }
  overlay.classList.add("active");
  overlay.querySelector(".close-overlay").addEventListener("click", hideRegisterOverlay);
  overlay.querySelector(".switch-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    hideRegisterOverlay();
    showLoginOverlay();
  });
  setupRegisterForm();
  setupPasswordToggle();
}

// Hide registration overlay
function hideRegisterOverlay() {
  const overlay = document.querySelector(".register-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

// Password toggle functionality
function setupPasswordToggle() {
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', function() {
      const passwordInput = document.getElementById('regPassword');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }
}

// Registration form handler
function setupRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    // Show loading state
    const registerBtn = registerForm.querySelector('.register-btn');
    const originalBtnText = registerBtn.textContent;
    registerBtn.textContent = 'Creating account...';
    registerBtn.disabled = true;

    try {
      // Send registration request
      const response = await fetch('http://localhost/ecommerce/user/backend/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          email, 
          password 
        })
      });

      // Handle response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success) {
        // Registration successful - automatically log in
        const user = data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        loggedIn = true;
        updateLoginUI();
        showNotification('Account created successfully! You are now logged in.', 'success');
        hideRegisterOverlay();
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(`Registration failed: ${error.message}`, 'error');
    } finally {
      registerBtn.textContent = originalBtnText;
      registerBtn.disabled = false;
    }
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
      showNotification("Please fill in both email and password", "error");
      return;
    }

    // Show loading state
    const loginBtn = document.querySelector(".login-btn");
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    try {
      // Send login request
      const response = await fetch("http://localhost/ecommerce/user/backend/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
        showNotification(`Welcome back, ${user.first_name || user.email || "User"}!`, "success");

        // Close overlay
        hideLoginOverlay();
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      // Show error message
      console.error("Login error:", error);
      showNotification("Login failed: " + error.message, "error");
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

// Event listeners for login/register button
if (login) {
  login.addEventListener("click", showLoginOverlay);
}
if (register) {
  register.addEventListener("click", showRegisterOverlay);
}

// Utility function to show/hide elements
function showHideElement(element, show) {
  if (element) {
    element.style.display = show ? "block" : "none";
  }
}

// For demo purposes, let's assume we have a loggedIn state
window.loggedIn = false;

// Toggle UI based on login state
window.updateLoginUI = function() {
  showHideElement(login, !window.loggedIn);
  showHideElement(register, !window.loggedIn);
  showHideElement(logout, window.loggedIn);
  showHideElement(loggedUser, window.loggedIn);

  if (window.loggedIn) {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser"));

    // Update user display
    if (user && loggedUser) {
      loggedUser.innerHTML = '<i class="fas fa-user-circle"></i> <span class="username">' + (user.first_name || user.email || "User") + '</span>';
    }
  }
}

// Logout functionality
if (logout) {
  logout.addEventListener("click", async () => {
    showConfirmation("Are you sure you want to log out?", async () => {
      // Call backend logout
      try {
        const response = await fetch("http://localhost/ecommerce/user/backend/logout.php", {
          method: "POST",
          credentials: "include"
        });
        if (response.ok) {
          loggedIn = false;
          localStorage.removeItem("currentUser");
          updateLoginUI();
          showNotification("You have been logged out", "info");
        } else {
          showNotification("Logout failed", "error");
        }
      } catch (err) {
        showNotification("Logout failed: " + err.message, "error");
      }
    });
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


