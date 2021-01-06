// Get Current URL and Parameters
const currentProductId = parsedUrl.searchParams.get('id');

let productData = null;
let productVariants = null;

let selectedColor = null;
let selectedSize = null;
let selectedVariant = null;
let productQty = null;

const containerViewDivEl = document.querySelector('.view');
const mainImageEl = document.querySelector('.main-image');

const nameEl = document.querySelector('.name');
const idEl = document.querySelector('.id');
const priceEl = document.querySelector('.price');
const colorsEl = document.querySelector('.colors');
const sizesEl = document.querySelector('.sizes');
const valueEl = document.querySelector('.value');
const opsEl = document.querySelectorAll('.op');
const summaryEl = document.querySelector('.summary');

const storyEl = document.querySelector('.story');
const imagesEl = document.querySelector('.images');

const searchInput = document.querySelector('.search');

/* =====================
          AJAX
======================= */

document.addEventListener('DOMContentLoaded', ready);

function ready() {
  console.log('DOM is ready');

  if (currentURLpathname === 'product.html' && currentProductId) {
    fetchProductDetailsData(`${productDetailsURL}?id=${currentProductId}`);
  } else if (!currentProductId) window.location = './';
}

function fetchProductDetailsData(product_url) {
  fetch(product_url)
    .then((response) => response.json())
    .then((data) => {
      productData = data.data;
      productVariants = productData.variants;
      productQty = 1;

      handleVariants(productVariants);
      updateDOM(productData);
    })
    .catch((error) => console.log(error));
}

function updateDOM(data) {
  // update menu items
  updateMenuItems(data.category);

  // create image element
  let newImage = document.createElement('img');
  newImage.src = productData.main_image;
  newImage.setAttribute('alt', 'product-image');
  mainImageEl.appendChild(newImage);

  // Dynamically inject product detail informations
  nameEl.innerHTML = data.title;
  idEl.innerHTML = data.id;
  priceEl.innerHTML = `TWD.${data.price}`;

  // Create color divs
  data.colors.forEach((color, i) => {
    let newColorDiv = document.createElement('div');
    newColorDiv.classList.add('color');
    if (selectedVariant.color_code === color.code) newColorDiv.classList.add('current');
    newColorDiv.style.backgroundColor = `#${color.code}`;

    colorsEl.appendChild(newColorDiv);

    if (i === data.colors.length - 1) {
      colorEl = document.querySelectorAll('.color');
    }

    // Add click EventListener
    newColorDiv.addEventListener('click', clickColor);
  });

  // Create size divs
  data.sizes.forEach((size, i) => {
    let newSizeDiv = document.createElement('div');
    let variant = findVariant(selectedVariant.color_code, size);
    let outStock = variant.stock === 0;

    newSizeDiv.classList.add('size');
    if (selectedVariant.size === size) newSizeDiv.classList.add('current');
    if (outStock) newSizeDiv.classList.add('disabled');

    newSizeDiv.innerHTML = size;
    sizesEl.appendChild(newSizeDiv);

    if (i === data.sizes.length - 1) {
      sizeEl = document.querySelectorAll('.size');
    }

    // Add click EventListener
    newSizeDiv.addEventListener('click', clickSize);
  });

  // qty
  valueEl.textContent = productQty;
  opsEl.forEach((opEl) => {
    opEl.addEventListener('click', clickQty);
  });

  summaryEl.innerHTML = data.note + '<br><br>' + data.texture + '<br>' + data.description + '<br><br>' + '清洗：' + data.wash + '<br>' + '產地：' + data.place;

  storyEl.innerHTML = data.story;
  data.images.forEach((image, i) => {
    if (i < 2) {
      let newImage = document.createElement('img');
      newImage.src = image;
      newImage.setAttribute('alt', 'product-image');
      imagesEl.appendChild(newImage);
    }
  });
}

function clickColor(e) {
  let clickedColor = RGBToHex(e.target.style.backgroundColor).toUpperCase();
  let variants = productVariants;
  selectedVariant = findVariant(clickedColor, selectedVariant.size);

  if (selectedVariant.stock === 0) {
    let sizes = productData.sizes;
    let variant;
    sizes.some((size) => {
      variant = findVariant(clickedColor, size);
      if (variant.stock > 0) {
        selectedVariant = variant;
        return true;
      }
    });
  }
  productQty = 1;
  refreshProductVariants();

  colorEl.forEach((el) => {
    el.classList.remove('current');
  });
  e.target.classList.add('current');
}

function clickSize(e) {
  if (e.target.classList.contains('disabled')) return;
  let size = e.target.textContent;
  let variants = productVariants;

  selectedVariant = findVariant(selectedVariant.color_code, size);
  productQty = 1;
  refreshProductVariants();

  sizeEl.forEach((el) => {
    el.classList.remove('current');
  });
  e.target.classList.add('current');
}

function clickQty(e) {
  let value = parseInt(e.target.getAttribute('data-value'));
  let qty = productQty;
  qty += value;
  if (qty > 0 && qty <= selectedVariant.stock) {
    productQty = qty;
    valueEl.textContent = productQty;
  }
}

function findVariant(colorCode, size) {
  return productData.variants.find((item) => {
    return item.color_code === colorCode && item.size === size;
  });
}

function refreshProductVariants() {
  let variants = productVariants;
  let variant = selectedVariant;
  let colors = document.querySelectorAll('.color');

  colors.forEach((color, i) => {
    let rgb = color.style.backgroundColor;
    let hexColor = RGBToHex(rgb).toUpperCase();
    if (hexColor === variant.color_code) {
      color.classList.add('current');
    } else {
      color.classList.remove('current');
    }
  });

  let sizes = document.querySelectorAll('.size');
  let outStock;

  sizes.forEach((size, i) => {
    if (size.innerHTML === variant.size) {
      size.classList.add('current');
    } else {
      size.classList.remove('current');
    }
    outStock = findVariant(variant.color_code, size.innerHTML).stock === 0;

    // control disabled
    if (outStock) {
      size.classList.add('disabled');
    } else {
      size.classList.remove('disabled');
    }
  });
  valueEl.textContent = productQty;
}

function handleVariants(variants) {
  // Find first chosen variant available

  variants.some((variant) => {
    if (variant.stock > 0) {
      selectedVariant = variant;
      return true;
    }
  });
}

function RGBToHex(rgb) {
  // Choose correct separator
  let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = rgb.substr(4).split(')')[0].split(sep);

  let r = (+rgb[0]).toString(16),
    g = (+rgb[1]).toString(16),
    b = (+rgb[2]).toString(16);

  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;

  return r + g + b;
}

/* ==============================================
                  Add to Cart
================================================= */

addToCartBtn.addEventListener('click', () => {
  addCart(productData, selectedVariant, productQty);
});
