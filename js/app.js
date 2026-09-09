let cart = JSON.parse(localStorage.getItem("frontierCart")) || [];

const addToCartButtons = document.querySelectorAll(".add-to-cart");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeoutId);

  showToast.timeoutId = setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

addToCartButtons.forEach(function (button) {
    button.addEventListener("click", function(){
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        const productAlreadyInCart = cart.find(function (product){
            return product.name === name;
        });

        if (productAlreadyInCart){
        productAlreadyInCart.quantity++;
        }else{
        const newProduct = {
            name: name,
            price: price,
            quantity: 1
        };
        
        cart.push(newProduct);
    }

        localStorage.setItem("frontierCart", JSON.stringify(cart));

        showToast(name + " added to your cart!");
    });
});



const cartItemsContainer = document.querySelector("#cart-items");
const subtotalElement = document.querySelector("#subtotal");
const cartSummary = document.querySelector("#cart-summary");

function renderCart(){
    if(!cartItemsContainer){
        return;
    }

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0){
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">
        Ain’t nothing in that saddlebag yet, partner.
      </p>`;

      cartSummary.style.display = "none";
      return;
    }

    cartSummary.style.display = "block";

    let subtotal = 0;

    cart.forEach(function(product){
        const productTotal = product.price * product.quantity;
        subtotal = subtotal + productTotal;

        cartItemsContainer.innerHTML += `
      <article class="cart-item">
  <div>
    <h3>${product.name}</h3>
    <p>Quantity: ${product.quantity}</p>

    <button
      class="remove-button"
      data-name="${product.name}">
      Remove
    </button>
  </div>

  <strong>$${productTotal.toFixed(2)}</strong>
</article>`;
    });
    subtotalElement.textContent = "$" + subtotal.toFixed(2);
}
renderCart();

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-button")) {
      const productName = event.target.dataset.name;

      const productToUpdate = cart.find(function (product) {
        return product.name === productName;
      });

      if (productToUpdate.quantity > 1) {
        productToUpdate.quantity--;
      } else {
        cart = cart.filter(function (product) {
          return product.name !== productName;
        });
      }

      localStorage.setItem("frontierCart", JSON.stringify(cart));

      renderCart();
      showToast("One " + productName + " was removed.");
    }
  });
}


const checkoutButton = document.querySelector("#checkout-button");

if (checkoutButton) {
  checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
      showToast("Your saddlebag is empty, partner.");
      return;
    }

    const orderTotal = cart.reduce(function (total, product) {
      return total + product.price * product.quantity;
    }, 0);

    cart = [];

    localStorage.setItem("frontierCart", JSON.stringify(cart));

    cartItemsContainer.innerHTML = `
      <section class="purchase-message">
        <span>🤠</span>
        <h3>Deal done, partner!</h3>
        <p>
          Your demo purchase of $${orderTotal.toFixed(2)}
          has been confirmed.
        </p>
        <a class="button" href="shop.html">Return to the Trading Post</a>
      </section>
    `;

    cartSummary.style.display = "none";

    showToast("Deal done, partner!");
  });
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name") || "Traveler";
    const email = formData.get("email") || "";
    const reason = formData.get("reason") || "General question";
    const message = formData.get("message") || "";

    const contactInfo = {
      name,
      email,
      reason,
      message
    };

    console.log("Contact form submitted:", contactInfo);

    showToast("Thanks, " + name + "! We’ll be in touch.");
    contactForm.reset();
  });
}