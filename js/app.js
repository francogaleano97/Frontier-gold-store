let cart = JSON.parse(localStorage.getItem("frontierCart")) || [];
let currentUser = localStorage.getItem("frontierCurrentUser");

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

        showToast(name + " se agreg&oacute; a tu carrito.");
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
        Todav&iacute;a no hay nada en tu alforja.
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
    <p>Cantidad: ${product.quantity}</p>

    <button
      class="remove-button"
      data-name="${product.name}">
      Quitar
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
      showToast("Se quit&oacute; una unidad de " + productName + ".");
    }
  });
}


const checkoutButton = document.querySelector("#checkout-button");

if (checkoutButton) {
  checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
      showToast("Tu alforja est&aacute; vac&iacute;a.");
      return;
    }

    if (!currentUser) {
      showToast("Inici&aacute; sesi&oacute;n antes de completar la compra.");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);
      return;
    }

    const orderTotal = cart.reduce(function (total, product) {
      return total + product.price * product.quantity;
    }, 0);

    const purchases = JSON.parse(localStorage.getItem("frontierPurchases")) || {};
    const userPurchases = purchases[currentUser] || [];
    userPurchases.push({
      date: new Date().toLocaleString(),
      items: cart,
      total: orderTotal
    });
    purchases[currentUser] = userPurchases;
    localStorage.setItem("frontierPurchases", JSON.stringify(purchases));

    cart = [];

    localStorage.setItem("frontierCart", JSON.stringify(cart));

    cartItemsContainer.innerHTML = `
      <section class="purchase-message">
        <span>🤠</span>
        <h3>&iexcl;Compra realizada!</h3>
        <p>
          Tu compra de demostraci&oacute;n por $${orderTotal.toFixed(2)}
          fue confirmada.
        </p>
        <a class="button" href="shop.html">Volver a la tienda</a>
      </section>
    `;

    cartSummary.style.display = "none";

    showToast("&iexcl;Compra realizada!");
  });
}

const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const accountHistory = document.querySelector("#account-history");
const purchaseList = document.querySelector("#purchase-list");
const logoutButton = document.querySelector("#logout-button");

function renderPurchaseHistory() {
  if (!purchaseList || !currentUser) {
    return;
  }

  const purchases = JSON.parse(localStorage.getItem("frontierPurchases")) || {};
  const userPurchases = purchases[currentUser] || [];

  if (userPurchases.length === 0) {
    purchaseList.innerHTML = "<p>No purchases recorded yet.</p>";
    return;
  }

  purchaseList.innerHTML = userPurchases.map(function (purchase) {
    const items = purchase.items.map(function (item) {
      return item.name + " x" + item.quantity;
    }).join(", ");

    return `<article class="purchase-record">
      <strong>${purchase.date}</strong>
      <p>${items}</p>
      <strong>Total: $${purchase.total.toFixed(2)}</strong>
    </article>`;
  }).join("");
}

if (loginForm) {
  if (currentUser) {
    loginForm.hidden = true;
    accountHistory.hidden = false;
    loginMessage.textContent = "Signed in as " + currentUser + ".";
    renderPurchaseHistory();
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get("username").trim();
    const password = formData.get("password");
    const users = JSON.parse(localStorage.getItem("frontierUsers")) || {};

    if (users[username] && users[username] !== password) {
      loginMessage.textContent = "That password does not match this account.";
      return;
    }

    users[username] = password;
    localStorage.setItem("frontierUsers", JSON.stringify(users));
    localStorage.setItem("frontierCurrentUser", username);
    currentUser = username;
    loginForm.hidden = true;
    accountHistory.hidden = false;
    loginMessage.textContent = "Signed in as " + currentUser + ".";
    renderPurchaseHistory();
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("frontierCurrentUser");
    currentUser = null;
    accountHistory.hidden = true;
    loginForm.hidden = false;
    loginForm.reset();
    loginMessage.textContent = "You have been signed out.";
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

    showToast("&iexcl;Gracias, " + name + "! Nos pondremos en contacto.");
    contactForm.reset();
  });
}
