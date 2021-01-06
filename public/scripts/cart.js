let checkoutBtn = document.querySelector('#checkout');

document.addEventListener('DOMContentLoaded', ready);

function ready() {
  console.log('DOM is ready');

  checkoutBtn.addEventListener('click', checkoutCart);
  tapPay();
  checkCart();
  showCart();
}

function showCart() {
  showItems();
  showPrices();
}

function changeItemQty(e) {
  let selector = e.target;
  let qty = selector.options[selector.selectedIndex].innerHTML;
  changeCart(e.target.getAttribute('index'), qty);
  showCart();
}

function showItems() {
  let container = document.querySelector('#cart-list');
  let cart = currentCart;
  let list = cart.list;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<h4 style=\'margin-left:20px;\'>購物車空空的耶</h4>';
  } else {
    list.forEach((item, i) => {
      /* =============================
              Variant Section
      =============================== */

      // create row container div
      let rowContainerDiv = document.createElement('div');
      rowContainerDiv.classList.add('row');

      // create variant div
      let variantDiv = document.createElement('div');
      variantDiv.classList.add('variant');

      // create picture div
      let pictureDiv = document.createElement('div');
      pictureDiv.classList.add('picture');

      // create details div
      let detailsDiv = document.createElement('div');
      detailsDiv.classList.add('details');
      detailsDiv.innerHTML = `${item.name}<br/>${item.id}<br/><br/>顏色:${item.color.name}<br/>尺寸:${item.size}`;

      // create image div
      let imageEl = document.createElement('img');
      imageEl.src = item.main_image;

      pictureDiv.appendChild(imageEl);
      variantDiv.appendChild(pictureDiv);
      variantDiv.appendChild(detailsDiv);
      rowContainerDiv.appendChild(variantDiv);

      /* =============================
              Quantity Section
      =============================== */
      let qtyDiv = document.createElement('div');
      qtyDiv.classList.add('qty');

      let qtySelector = document.createElement('select');
      qtySelector.setAttribute('index', i);
      qtySelector.addEventListener('change', changeItemQty);

      for (let j = 1; j <= item.stock; j++) {
        let optionEl = document.createElement('option');
        optionEl.setAttribute('value', j);
        optionEl.textContent = j;
        qtySelector.add(optionEl);
      }
      qtySelector.selectedIndex = item.qty - 1;

      qtyDiv.appendChild(qtySelector);
      rowContainerDiv.appendChild(qtyDiv);

      /* =============================
              Price Section
      =============================== */
      let priceDiv = document.createElement('div');
      let subtotalDiv = document.createElement('div');
      priceDiv.classList.add('price');
      priceDiv.textContent = `NT. ${item.price}`;

      subtotalDiv.classList.add('subtotal');
      subtotalDiv.textContent = `NT. ${item.price * item.qty}`;

      rowContainerDiv.appendChild(priceDiv);
      rowContainerDiv.appendChild(subtotalDiv);

      /* =============================
              Remove Section
      =============================== */
      let removeIcon = document.createElement('img');
      let removeDiv = document.createElement('div');
      removeIcon.src = './images/cart-remove.png';
      removeIcon.setAttribute('index', i);

      removeDiv.classList.add('remove');
      removeDiv.setAttribute('index', i);
      removeDiv.addEventListener('click', removeItem);

      removeDiv.appendChild(removeIcon);

      rowContainerDiv.appendChild(removeDiv);
      container.appendChild(rowContainerDiv);
    });
  }
}

function showPrices() {
  let enabled = true;
  let cart = currentCart;

  document.querySelector('#subtotal').textContent = cart.subtotal;
  document.querySelector('#freight').textContent = cart.freight;
  document.querySelector('#total').textContent = cart.total;

  enabled = enabled && cart.subtotal > 0;
  // show recipient
  document.querySelector('#recipient-name').value = cart.recipient.name;
  document.querySelector('#recipient-email').value = cart.recipient.email;
  document.querySelector('#recipient-phone').value = cart.recipient.phone;
  document.querySelector('#recipient-address').value = cart.recipient.address;
  let times = document.getElementsByName('recipient-time');
  for (let i = 0; i < times.length; i++) {
    if (times[i].value === cart.recipient.time) {
      times[i].checked = true;
    } else {
      times[i].checked = false;
    }
  }

  // show btn
  checkoutBtn.disabled = !enabled;
}

function removeItem(e) {
  removeCart(e.target.index);
  showCart();
}

function checkoutCart() {
  let errorMessage = '',
    errorStatus = false;
  // let cart = currentCart;
  let recipient = currentCart.recipient;
  const nameEl = document.querySelector('#recipient-name');
  const emailEl = document.querySelector('#recipient-email');
  const phoneEl = document.querySelector('#recipient-phone');
  const addressEl = document.querySelector('#recipient-address');
  const times = document.getElementsByName('recipient-time');
  recipient.name = nameEl.value.trim();
  recipient.email = emailEl.value.trim();
  recipient.phone = phoneEl.value.trim();
  recipient.address = addressEl.value.trim();

  for (let i = 0; i < times.length; i++) {
    if (times[i].checked) {
      recipient.time = times[i].value;
      break;
    }
  }

  function validate() {
    let regName = /^[\u4e00-\u9fa5]{2,5}$/; //中文姓名2-5字
    let regEmail = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/; //電子信箱
    let regPhone = /^[09]{2}\d{8}$/; //手機號碼
    let regAddress = /^([\u4e00-\u9fa5])+\d|([\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341])/; //包含中文+數字or(一二三四五六七八九十)

    if (!regName.test(recipient.name)) {
      errorMessage += '請填寫真實姓名。\n';
      errorStatus = true;
      nameEl.focus();
    } else if (!regEmail.test(recipient.email)) {
      errorMessage += '請正確填寫E-mail。\n';
      errorStatus = true;
      emailEl.focus();
    } else if (!regPhone.test(recipient.phone)) {
      errorMessage += '請正確填寫手機格式09XX000000(共10碼)。\n';
      errorStatus = true;
      phoneEl.focus();
    } else if (!regAddress.test(recipient.address)) {
      errorMessage += '請正確填寫地址。\n';
      errorStatus = true;
      addressEl.focus();
    }
    if (errorStatus) {
      //格式錯誤
      alert(errorMessage);
    } else {
      //格式正確
      alert('基本資料填寫成功!');
      //post data
    }
  }
  validate();

  let creditCart = TPDirect.card.getTappayFieldsStatus();
  if (creditCart.canGetPrime) {
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        console.log('TapPay GetPrime Error');
        return;
      }
      let prime = result.card.prime;
      if (!errorMessage) checkoutPrime(prime);
    });
  } else {
    alert('信用卡資訊填寫錯誤');
    return;
  }
}

/* ==============================================
                TapPay
================================================= */
function tapPay() {
  TPDirect.setupSDK('12348', 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
  TPDirect.card.setup({
    fields: {
      number: {
        element: '#card-number',
        placeholder: '**** **** **** ****',
      },
      expirationDate: {
        element: '#card-expiration-date',
        placeholder: 'MM / YY',
      },
      ccv: {
        element: '#card-ccv',
        placeholder: 'CCV',
      },
    },
  });
}

function checkoutPrime(prime) {
  let url = `${apiURL}order/checkout`;
  let data = {
    prime: prime,
    order: currentCart,
  };

  let options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data),
  };

  if (authState !== null) {
    options.headers['Authorization'] = `Bearer ${authState.accessToken}`;
  }

  showLoading();
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      closedLoading();
      clearCart();
      window.location = `./thankyou.html?number=${data.data.number}`;
    })
    .catch((err) => {
      alert(`交易失敗，請再試一次：${err}`);
    });
}
