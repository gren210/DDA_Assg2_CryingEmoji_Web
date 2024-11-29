//for highlighting which page the user is on
const currentLocation = window.location.pathname;
const menuLinks = document.querySelectorAll('.navbar .menu li a');

menuLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation.split('/').pop()) {
        link.style.fontWeight = '700';
        link.style.textDecoration = 'underline';
    }
});