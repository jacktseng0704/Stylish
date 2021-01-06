function ready() {
  currentURLParam = parsedUrl.searchParams.get('number');
  if (!currentURLParam) {
    window.location = './';
  }
  document.querySelector('#number').textContent = currentURLParam;
  console.log(currentURLParam);
  checkCart();
}
window.addEventListener('DOMContentLoaded', ready);
