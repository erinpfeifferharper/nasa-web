var navlinks = document.getElementById("navlinks");

var closeIcon; 
var openIcon;

function showMenu() {
  navlinks.style.left = "0";
  openIcon.style.display = "none";
  closeIcon.style.display = "block"; 
}

function hideMenu() {
  navlinks.style.left = "-200px";
  openIcon.style.display = "block";
  closeIcon.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
  closeIcon = document.querySelector('.fa-solid.fa-xmark');
  openIcon = document.querySelector('.fa-solid.fa-bars');

  if(closeIcon) {
    closeIcon.addEventListener('click', hideMenu);
    closeIcon.style.display = "none";  // Ensure "xmark" is hidden on page load
  }

  if(openIcon) {
    openIcon.addEventListener('click', showMenu);
  }
});
