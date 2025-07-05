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

// Show registration overlay
function showRegisterOverlay() {
  hideLoginOverlay();
  let overlay = document.querySelector(".register-overlay");
  if (!overlay) {
    overlay = createRegisterOverlay();
  }

  overlay.classList.add("active");
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

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
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
        
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        loggedIn = true;
        updateLoginUI();
        
        // Show success message
        showNotification('Account created successfully! You are now logged in.', 'success');
        
        // Close overlay
        hideRegisterOverlay();
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      // Show error message
      console.error('Registration error:', error);
      showNotification(`Registration failed: ${error.message}`, 'error');
    } finally {
      // Reset button
      registerBtn.textContent = originalBtnText;
      registerBtn.disabled = false;
    }
  });
}

// Add this to your existing DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  
  // Add event listeners for switching between login and register
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('switch-to-register')) {
      e.preventDefault();
      hideLoginOverlay();
      showRegisterOverlay();
    }
    
    if (e.target.classList.contains('switch-to-login')) {
      e.preventDefault();
      hideRegisterOverlay();
      showLoginOverlay();
    }
  });
  
  // Add event listener for register button
  if (register) {
    register.addEventListener('click', showRegisterOverlay);
  }
});