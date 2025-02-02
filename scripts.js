// Create a Bootstrap modal instance using the modal element
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const productModalLabel = document.getElementById('productModalLabel');
const productDescription = document.getElementById('productDescription');

// Add click event listeners to each product div
document.querySelectorAll('.product').forEach(product => {
  product.addEventListener('click', () => {
    // Retrieve the product name from a data attribute
    const productName = product.getAttribute('data-product');
    
    // Update the modal title and description dynamically
    productModalLabel.textContent = productName;
    productDescription.textContent = `More details about the ${productName} will go here. This is just a simulation for the demo.`;
    
    // Display the modal
    productModal.show();
  });
});
