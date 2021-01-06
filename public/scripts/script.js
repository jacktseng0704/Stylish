let productId = null;

let visualEl = null;
let circleEl = null;

const productsDiv = document.querySelector('.products');
const womenItemArray = document.querySelectorAll('.womenItem > a');
const menItemArray = document.querySelectorAll('.menItem > a');
const accessoriesItemArray = document.querySelectorAll('.accessoriesItem > a');

const searchInput = document.querySelector('.search');

const keyvisualEl = document.querySelector('.keyvisual');

/* =====================
          AJAX
======================= */

document.addEventListener('DOMContentLoaded', ready);

womenItemArray.forEach((womenItem) => {
  womenItem.addEventListener('click', updateWomenItem);
});

menItemArray.forEach((menItem) => {
  menItem.addEventListener('click', updateMenItem);
});

accessoriesItemArray.forEach((accessoriesItem) => {
  accessoriesItem.addEventListener('click', updateAccessories);
});

function ready() {
  console.log('DOM is ready');
  fetchCampaignsData(campaignURL);

  // update menu items
  updateMenuItems(currentURLParam);

  if (currentURLParam === 'women') {
    updateWomenItem();
  } else if (currentURLParam === 'men') {
    updateMenItem();
  } else if (currentURLParam === 'accessories') {
    updateAccessories();
  } else if (currentURLParam) {
    fetchProductsData(`${searchURL}?keyword=${currentURLParam}`);
    deleteElement(productsDiv);
  } else {
    fetchProductsData(categoriesURL);
  }
}

function fetchProductsData(targetURL) {
  fetch(targetURL)
    .then((response) => response.json())
    .then((data) => {
      productsData = data.data;
      productPaging = data.next_paging;

      displayMainSection(productsData);
    })
    .catch((error) => console.log(error));
}

function displayMainSection(data) {
  if (data.length === 0) {
    let h2 = document.createElement('h2');
    h2.innerHTML = '沒有搜尋到任何產品哦';
    deleteElement(productsDiv);
    productsDiv.appendChild(h2);
  } else {
    data.forEach((productData, i) => {
      let productId = productData.id;

      let productImgURL = productData.main_image;
      let productColors = productData.colors;
      let productName = productData.title;
      let productPrice = productData.price;

      let containerA = document.createElement('a');
      let newImg = document.createElement('img');
      let colorsDiv = document.createElement('div');
      let nameDiv = document.createElement('div');
      let priceDiv = document.createElement('div');

      containerA.classList.add('product');
      containerA.href = `./product.html?id=${productId}`;
      newImg.src = productImgURL;
      newImg.setAttribute('alt', 'product-link');

      colorsDiv.classList.add('colors');
      nameDiv.classList.add('name');
      nameDiv.innerHTML = productName;
      priceDiv.classList.add('price');
      priceDiv.innerHTML = `TWD.${productPrice}`;

      productColors.forEach((productColor) => {
        let colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = `#${productColor.code}`;
        colorDiv.classList.add('color');
        colorsDiv.appendChild(colorDiv);
      });

      containerA.appendChild(newImg);
      containerA.appendChild(colorsDiv);
      containerA.appendChild(nameDiv);
      containerA.appendChild(priceDiv);
      productsDiv.appendChild(containerA);
    });
  }
}

function updateCategory(category) {
  productCategory = category;
  categoriesURL = `${productURL}${category}`;
}

function deleteElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function updateWomenItem() {
  updateCategory('women');
  deleteElement(productsDiv);
  fetchProductsData(categoriesURL);
}

function updateMenItem() {
  updateCategory('men');
  deleteElement(productsDiv);
  fetchProductsData(categoriesURL);
}

function updateAccessories() {
  updateCategory('accessories');
  deleteElement(productsDiv);
  fetchProductsData(categoriesURL);
}

/* =====================
      Scroll Event
======================= */

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;

  if (scrolled === scrollable) {
    if (productPaging) {
      fetchProductsData(`${categoriesURL}?paging=${productPaging}`);
    }
  }
});

/* ===========================
      Get Marketing Campaigns
============================== */
function fetchCampaignsData(productURL) {
  fetch(productURL)
    .then((response) => response.json())
    .then((data) => {
      campaignsData = data.data;

      let circleDiv = document.createElement('div');
      circleDiv.classList.add('step');

      campaignsData.forEach((campaignData, i) => {
        let productPicturePath = campaignData.picture;
        let productStory = campaignData.story;
        let productId = campaignData.product_id;

        let containerA = document.createElement('a');
        let storyDiv = document.createElement('div');
        let circleA = document.createElement('a');

        containerA.classList.add('visual');
        containerA.style.backgroundImage = `url("${productPicturePath}")`;
        containerA.href = `./product.html?id=${productId}`;
        storyDiv.classList.add('story');
        storyDiv.innerHTML = productStory;
        circleA.classList.add('circle');

        circleDiv.appendChild(circleA);
        containerA.appendChild(storyDiv);
        keyvisualEl.appendChild(containerA);
        keyvisualEl.appendChild(circleDiv);
      });
      visualEl = document.querySelectorAll('.visual');
      circleEl = document.querySelectorAll('.circle');

      visualEl[0].classList.add('current');
      circleEl[0].classList.add('current');

      //  Click EventListener
      circleEl.forEach((element, i) => {
        element.addEventListener('click', (e) => {
          count = i;
          circleEl.forEach((el, j) => {
            visualEl[j].classList.remove('current');
            circleEl[j].classList.remove('current');
          });
          window.clearInterval(animation);

          visualEl[i].classList.add('current');
          circleEl[i].classList.add('current');
        });
      });
    });
}

/* ===========================
          Slide Effect
============================== */
let count = 0;

function slideEffect() {
  visualEl[count].classList.remove('current');
  circleEl[count].classList.remove('current');
  count += 1;
  if (count >= campaignsData.length) count = 0; // if it is last image then show the first image.
  visualEl[count].classList.add('current');
  circleEl[count].classList.add('current');
}

let animation = setInterval(function () {
  slideEffect();
}, 5000);

/* =================================
    Stop Slide Effect when hovered
==================================== */
keyvisualEl.addEventListener('mouseover', () => {
  window.clearInterval(animation);
});

keyvisualEl.addEventListener('mouseleave', () => {
  animation = window.setInterval(function () {
    slideEffect();
  }, 5000);
});

console.log(firebase);
