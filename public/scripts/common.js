const url = 'https://api.appworks-school.tw/';
const apiURL = `${url}api/1.0/`;
const productURL = `${apiURL}products/`;
const productDetailsURL = `${productURL}details/`;
const searchURL = `${productURL}search/`;
const campaignURL = `${apiURL}marketing/campaigns/`;

// Get Current URL and Parameters
const parsedUrl = new URL(window.location.href);
let currentURLParam = parsedUrl.searchParams.get('tag');
const currentURLpathname = parsedUrl.pathname.split('/').pop();

let searchParams = null;
let productPaging = null;
let productsData = null;
let campaignsData = null;

let productCategory = 'all';
let categoriesURL = `${productURL}${productCategory}`;

function updateMenuItems(tag) {
  let desktopItems = document.querySelectorAll('header>nav>.item');
  let mobileItems = document.querySelectorAll('nav.mobile>.item');
  if (tag === 'women') {
    desktopItems[0].classList.add('current');
    mobileItems[0].classList.add('current');
  } else if (tag === 'men') {
    desktopItems[1].classList.add('current');
    mobileItems[1].classList.add('current');
  } else if (tag === 'accessories') {
    desktopItems[2].classList.add('current');
    mobileItems[2].classList.add('current');
  }
}

document.addEventListener('DOMContentLoaded', ready);

function ready() {
  checkCart();
  loadFb();
}

/* ==============================================
                Check localStorage
================================================= */
let currentCart;

function checkCart() {
  let storage = window.localStorage;
  let cart = storage.getItem('cart');
  if (cart === null) {
    cart = {
      shipping: 'delivery',
      payment: 'credit_card',
      recipient: {
        name: '',
        phone: '',
        email: '',
        address: '',
        time: 'anytime',
      },
      list: [],
      subtotal: 0,
      freight: 60,
      total: 0,
    };
  } else {
    try {
      cart = JSON.parse(cart);
    } catch (e) {
      storage.removeItem('cart');
      checkCart();
      return;
    }
  }
  currentCart = cart;

  // Refrech UI
  displayCart();
}

function addCart(product, variant, qty) {
  let list = currentCart.list;
  let color = product.colors.find((item) => {
    return item.code === variant.color_code;
  });

  let item = list.find((item) => {
    return item.id === product.id && item.size === variant.size && item.color.code === color.code;
  });

  if (item) {
    item.qty = qty;
  } else {
    list.push({
      id: product.id,
      name: product.title,
      price: product.price,
      main_image: product.main_image,
      size: variant.size,
      color: color,
      qty: qty,
      stock: variant.stock,
    });
  }
  updateCart();
  alert('已加入購物車');
}

function updateCart() {
  let storage = window.localStorage;
  let cart = currentCart;
  let subtotal = 0;

  for (let i in cart.list) {
    subtotal += cart.list[i].price * cart.list[i].qty;
  }

  cart.subtotal = subtotal;
  cart.total = cart.subtotal + cart.freight;

  // save to storage
  storage.setItem('cart', JSON.stringify(cart));
  // refresh UIs
  displayCart();
}

function removeCart(index) {
  let list = currentCart.list;
  list.splice(index, 1);
  updateCart();
  alert('已從購物車中移除');
}

function changeCart(index, qty) {
  let list = currentCart.list;
  list[index].qty = qty;
  updateCart();
}

function clearCart() {
  let storage = window.localStorage;
  storage.removeItem('cart');
}

// display cart
const cartQtyEls = document.querySelectorAll('.cart >.qty');
const addToCartBtn = document.querySelector('#product-add-cart-btn');

function displayCart() {
  let cart = currentCart;
  cartQtyEls.forEach((cartQtyEl) => {
    cartQtyEl.textContent = cart.list.length;
  });
}

function showLoading() {
  document.querySelector('#loading').style.display = 'block';
}

function closedLoading() {
  document.querySelector('#loading').style.display = 'none';
}

/* ==============================================
                    FB login
================================================= */
let authState = null;

window.fbAsyncInit = initFb;

function loadFb() {
  // Load the SDK asynchronously
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
}

function initFb() {
  FB.init({
    appId: '377851770069263',
    cookie: true,
    xfbml: true,
    status: false,
    version: 'v8.0',
  });

  FB.Event.subscribe('auth.login', function (resp) {
    window.location = './profile.html';
  });

  FB.getLoginStatus((response) => {
    fbLoginStatusChange(response);
    // set member click handlers
    let memberIcons = document.querySelectorAll('.member');
    memberIcons.forEach((icon) => {
      icon.addEventListener('click', () => {
        fbClickProfile();
      });
    });
  });
}

function fbLogin() {
  FB.login(
    (response) => {
      fbLoginStatusChange(response);
    },
    { scope: 'public_profile,email' },
  );
}

function fbLoginStatusChange(response) {
  if (response.status === 'connected') {
    authState = response.authResponse;
    fbUpdateLoginToServer();
  } else {
    authState = null;
  }
  if (typeof fbLoginStatusChangeCallback === 'function') {
    fbLoginStatusChangeCallback();
  }
}

function fbUpdateLoginToServer() {
  let url = `${apiURL}user/signin`;
  let data = {
    provider: 'facebook',
    access_token: authState.accessToken,
  };

  let options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data),
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      let userInfo = data.data.user;
    });
}

function fbClickProfile() {
  if (authState === null) {
    fbLogin();
  } else {
    window.location = './profile.html';
  }
}

function fbGetProfile() {
  return new Promise((resolve, reject) => {
    FB.api('/me?fields=picture.width(720).height(720), name, id, email', (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}
