document.addEventListener("DOMContentLoaded", function() {

    // Global cart object; keys are product names, values are objects { image, price, quantity }
    let cart = {};
  
    // Bootstrap modal instances
    const productModalEl = document.getElementById("productModal");
    const productModal = new bootstrap.Modal(productModalEl);
    const cartModalEl = document.getElementById("cartModal");
    const cartModal = new bootstrap.Modal(cartModalEl);
    const checkoutModalEl = document.getElementById("checkoutModal");
    const checkoutModal = new bootstrap.Modal(checkoutModalEl);
  
    // Elements within the product modal
    const modalTitle = document.getElementById("productModalLabel");
    const modalImage = document.getElementById("modalProductImage");
    const modalDescription = document.getElementById("modalProductDescription");
    const modalFooter = document.getElementById("productModalFooter");
  
    // Cart icon and counter in the header
    const cartIconContainer = document.getElementById("cartIconContainer");
    const cartCount = document.getElementById("cartCount");
    updateCheckoutButtonState()
  
    // --- PRODUCT MODAL LOGIC ---
    document.querySelectorAll(".product").forEach(productCard => {
      productCard.addEventListener("click", function() {
        const productName = productCard.getAttribute("data-product");
        const productImage = productCard.getAttribute("data-image");
        const productPrice = productCard.getAttribute("data-price");
  
        modalTitle.textContent = productName;
        modalImage.src = "images/" + productImage;
        modalImage.alt = productName;
        modalDescription.textContent = `More details about the ${productName}. Price: $${productPrice}`;
        
        // Reset modal footer to initial "Add to Cart" button
        modalFooter.innerHTML = `<button class="btn btn-primary" id="modalAddToCart">Add to Cart</button>`;
        
        // Attach event listener for Add to Cart
        document.getElementById("modalAddToCart").addEventListener("click", function addToCartHandler() {
          // Replace footer with the quantity interface: trash (cancel), numeric input, and check (confirm)
          modalFooter.innerHTML = `
            <div class="quantity-interface d-flex align-items-center w-100 justify-content-center">
              <button class="btn btn-danger me-2" id="cancelCartAction" title="Cancel">
                <i class="bi bi-trash"></i>
              </button>
              <input type="number" id="quantityInput" value="1" min="1" class="form-control me-2" style="max-width: 80px;">
              <button class="btn btn-success" id="confirmCartAction" title="Confirm">
                <i class="bi bi-check-lg"></i>
              </button>
            </div>
          `;
          
          // Cancel action: revert back to Add to Cart interface without modifying the cart
          document.getElementById("cancelCartAction").addEventListener("click", function() {
            modalFooter.innerHTML = `<button class="btn btn-primary" id="modalAddToCart">Add to Cart</button>`;
            // Reattach this same addToCartHandler if needed
            document.getElementById("modalAddToCart").addEventListener("click", addToCartHandler);
          });
          
          // Confirm action: update the cart with the quantity specified (no cumulative math, direct assignment)
          document.getElementById("confirmCartAction").addEventListener("click", function() {
            const quantity = parseInt(document.getElementById("quantityInput").value, 10);
            if (isNaN(quantity) || quantity < 1) {
              alert("Please enter a valid quantity (minimum 1).");
              return;
            }
            // Use product name as unique key; update with the new quantity
            cart[modalTitle.textContent] = {
              image: modalImage.src,
              price: productCard.getAttribute("data-price"),
              quantity: quantity
            };
            updateCartCounter();
            productModal.hide();
          });
        });
        
        productModal.show();
      });
    });

    // --- Button state ---
    function updateCheckoutButtonState() {
        const checkoutButton = document.getElementById("checkoutButton");
        // Disable the button if there are no unique items in the cart
        if (Object.keys(cart).length === 0) {
          checkoutButton.setAttribute("disabled", "true");
          checkoutButton.classList.add("btn-secondary"); // optional: change styling to indicate disabled state
          checkoutButton.classList.remove("btn-primary");
        } else {
          checkoutButton.removeAttribute("disabled");
          checkoutButton.classList.add("btn-primary");
          checkoutButton.classList.remove("btn-secondary");
        }
      }
      
  
    // --- CART MODAL LOGIC ---
    // When the cart icon is clicked, open the cart modal
    cartIconContainer.addEventListener("click", function() {
      renderCartItems();
      cartModal.show();
    });
  
    // Update the cart counter badge (number of unique items)
    function updateCartCounter() {
      const count = Object.keys(cart).length;
      cartCount.textContent = count;
      updateCheckoutButtonState();
    }
  
    // Render the cart items in the cart modal
    function renderCartItems() {
      const cartItemsList = document.getElementById("cartItemsList");
      const emptyCartMessage = document.getElementById("emptyCartMessage");
      cartItemsList.innerHTML = "";
      const cartKeys = Object.keys(cart);
      
      if (cartKeys.length === 0) {
        emptyCartMessage.style.display = "block";
        cartItemsList.style.display = "none";
      } else {
        emptyCartMessage.style.display = "none";
        cartItemsList.style.display = "block";
        
        cartKeys.forEach(productName => {
          const item = cart[productName];
          const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between align-items-center";
          li.innerHTML = `
            <div>
              <strong>${productName}</strong><br>
              Price: $${item.price} | Quantity: ${item.quantity}<br>
              <small>Subtotal: $${subtotal}</small>
            </div>
            <div class="d-flex align-items-center">
              <img src="${item.image}" alt="${productName}" style="width:50px; height:50px; object-fit:cover;" class="me-2">
              <button class="btn btn-danger btn-sm remove-cart-item" data-product="${productName}" title="Remove Item">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `;
          cartItemsList.appendChild(li);
        });
        
        // Attach event listeners to trash buttons to remove items completely
        document.querySelectorAll(".remove-cart-item").forEach(btn => {
          btn.addEventListener("click", function() {
            const productName = btn.getAttribute("data-product");
            delete cart[productName];
            updateCartCounter();
            renderCartItems();
          });
        });
      }
    }
  
    // --- CHECKOUT & PAYMENT MODAL LOGIC ---
    // When the Checkout button in the Cart Modal is clicked
    document.getElementById("checkoutButton").addEventListener("click", function() {
      // Calculate the total amount
      let total = 0;
      for (let key in cart) {
        total += parseFloat(cart[key].price) * cart[key].quantity;
      }
      // Display the total in the checkout modal
      document.getElementById("checkoutTotal").textContent = "Total: $" + total.toFixed(2);
      // Clear any previous payment form content
      document.getElementById("paymentFormContainer").innerHTML = "";
      // Hide the cart modal and show the checkout modal
      cartModal.hide();
      checkoutModal.show();
    });
    
  
    // --- Payment Method: Credit/Debit Card ---
    document.getElementById("cardPaymentButton").addEventListener("click", function() {
      // Load the card payment form inside the container
      document.getElementById("paymentFormContainer").innerHTML = `
        <form id="cardPaymentForm">
          <div class="mb-3">
            <label for="cardNumber" class="form-label">Card Number (12 digits)</label>
            <input type="text" class="form-control" id="cardNumber" maxlength="12" placeholder="Enter 12-digit card number" required>
          </div>
          <div class="mb-3">
            <label for="cardPin" class="form-label">PIN</label>
            <input type="password" class="form-control" id="cardPin" placeholder="Enter PIN" required>
          </div>
          <div class="mb-3">
            <label for="cardExpiry" class="form-label">Expiry Date</label>
            <input type="text" class="form-control" id="cardExpiry" placeholder="MM/YY" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit Payment</button>
        </form>
      `;
      
      // Handle the card form submission
      document.getElementById("cardPaymentForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const cardNumber = document.getElementById("cardNumber").value;
        if (cardNumber.length !== 12) {
          alert("Card number must be exactly 12 digits.");
          return;
        }
                // Show a loading spinner
        const paymentContainer = document.getElementById("paymentFormContainer");
        paymentContainer.innerHTML = `
            <div class="text-center my-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            </div>
        `;
        // After 1 second, display the success message
        setTimeout(function() {
            paymentContainer.innerHTML = `
            <div class="text-center text-success">
                <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
                <p class="fs-4">Payment made successfully.</p>
            </div>
            `;
        }, 1000);
      });
    });
  
    // --- Payment Method: PayPal ---
    document.getElementById("paypalPaymentButton").addEventListener("click", function() {
      // Load the PayPal payment form inside the container
      document.getElementById("paymentFormContainer").innerHTML = `
        <form id="paypalPaymentForm">
          <div class="mb-3">
            <label for="paypalEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="paypalEmail" placeholder="Enter your email" required>
          </div>
          <div class="mb-3">
            <label for="paypalPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="paypalPassword" placeholder="Enter your password" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit Payment</button>
        </form>
      `;
      
      // Handle the PayPal form submission
      document.getElementById("paypalPaymentForm").addEventListener("submit", function(e) {
        e.preventDefault();
                // Show a loading spinner
        const paymentContainer = document.getElementById("paymentFormContainer");
        paymentContainer.innerHTML = `
            <div class="text-center my-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            </div>
        `;
        // After 1 second, display the success message
        setTimeout(function() {
            paymentContainer.innerHTML = `
            <div class="text-center text-success">
                <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
                <p class="fs-4">Payment made successfully.</p>
            </div>
            `;
        }, 1000);
      });
    });
  });