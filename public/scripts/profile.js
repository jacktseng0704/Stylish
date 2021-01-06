document.addEventListener('DOMContentLoaded', ready);

function ready() {
  checkCart();
  fbLoginStatusChangeCallback = initProfile;
  logout();
}

function initProfile() {
  if (authState === null) {
    window.location = './';
  }
  fbGetProfile()
    .then((data) => {
      showProfile(data);
    })
    .catch((error) => {
      console.log('Facebook Error', error);
    });
}

function showProfile(data) {
  let pictureURL = data.picture.data.url;
  document.querySelector('#profile-picture').src = pictureURL;

  let detailsDiv = document.querySelector('#profile-details');
  let nameDiv = document.createElement('div');
  nameDiv.classList.add('name');
  nameDiv.textContent = data.name;

  let emailDiv = document.createElement('div');
  emailDiv.classList.add('email');
  emailDiv.textContent = data.email;

  detailsDiv.appendChild(nameDiv);
  detailsDiv.appendChild(emailDiv);
}

function logout() {
  document.querySelector('.logout-btn').addEventListener('click', () => {
    FB.logout(() => {
      alert('hi');
      console.log(authState);
      window.location = './';
    });
  });
}
