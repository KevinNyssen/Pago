document.addEventListener("DOMContentLoaded", function() {
    // Global cart object: keys are product names; values are objects { image, price, quantity }
    let cart = {};
  
    // Bootstrap modal instances
    const productModalEl = document.getElementById("productModal");
    const productModal = new bootstrap.Modal(productModalEl);
    const cartModalEl = document.getElementById("cartModal");
    const cartModal = new bootstrap.Modal(cartModalEl);
  
    // Elements within the product modal
    const modalTitle = document.getElementById("productModalLabel");
    const modalImage = document.getElementById("modalProductImage");
    const modalDescription = document.getElementById("modalProductDescription");
    const modalFooter = document.getElementById("productModalFooter");
  
    // Cart icon and counter in the header
    const cartIconContainer = document.getElementById("cartIconContainer");
    const cartCount = document.getElementById("cartCount");
  
    // When a product card is clicked, open the product modal with its details.
    document.querySelectorAll(".product").forEach(productCard => {
      productCard.addEventListener("click", function() {
        // Retrieve product info from data attributes
        const productName = productCard.getAttribute("data-product");
        const productImage = productCard.getAttribute("data-image");
        const productPrice = productCard.getAttribute("data-price");
  
        // Set up the modal with product details
        modalTitle.textContent = productName;
        modalImage.src = "images/" + productImage;
        modalImage.alt = productName;
        modalDescription.textContent = `More details about the ${productName}. Price: $${productPrice}`;
        
        // Set modal footer to the initial "Add to Cart" interface
        modalFooter.innerHTML = `<button class="btn btn-primary" id="modalAddToCart">Add to Cart</button>`;
        
        // Attach event listener to the Add to Cart button
        document.getElementById("modalAddToCart").addEventListener("click", function() {
          // Switch to quantity interface: trash, numeric input, check button.
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
          
          // Cancel (trash) event: revert footer to initial Add to Cart.
          document.getElementById("cancelCartAction").addEventListener("click", function() {
            modalFooter.innerHTML = `<button class="btn btn-primary" id="modalAddToCart">Add to Cart</button>`;
            // Reattach listener for Add to Cart (if needed)
            document.getElementById("modalAddToCart").addEventListener("click", arguments.callee);
          });
          
          // Confirm event: update the cart with the entered quantity.
          document.getElementById("confirmCartAction").addEventListener("click", function() {
            // Get the quantity directly from the input; no addition or subtraction.
            const quantity = parseInt(document.getElementById("quantityInput").value, 10);
            if (isNaN(quantity) || quantity < 1) {
              alert("Please enter a valid quantity (minimum 1).");
              return;
            }
            // Use product name as key (unique); update quantity directly.
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
  
    // When the cart icon is clicked, open the cart modal and display items.
    cartIconContainer.addEventListener("click", function() {
      renderCartItems();
      cartModal.show();
    });
  
    // Function to update the cart counter (number of unique items).
    function updateCartCounter() {
      const count = Object.keys(cart).length;
      cartCount.textContent = count;
    }
  
    function renderCartItems() {
        const cartItemsList = document.getElementById("cartItemsList");
        const emptyCartMessage = document.getElementById("emptyCartMessage");
        
        // Clear the list first.
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
            // Calculate subtotal; ensure the price is treated as a number.
            const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            
            // Create a list item for each product.
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
          
          // Attach event listeners to the trash buttons for each list item.
          document.querySelectorAll(".remove-cart-item").forEach(btn => {
            btn.addEventListener("click", function() {
              const productName = btn.getAttribute("data-product");
              // Remove the product from the cart completely.
              delete cart[productName];
              updateCartCounter();
              renderCartItems();
            });
          });
        }
      }
    });