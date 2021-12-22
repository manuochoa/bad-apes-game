jQuery(document).ready(function ($) {
  $(".personage_carousel").owlCarousel({
    items: 2,
    loop: false,
    dots: false,
    nav: true,
    // mouseDrag: false,
    margin: 24,
    // navText: "",
    navText: ["<img src='./img/arrow-left.png' alt=''>","<img src='./img/arrow-right.png' alt=''>"],
    
    
    responsive: {
      0: {
        items: 5,
        margin: 12,
      },
      561: {
        items: 6,
      },
      727: {
        items: 9,
      },
      1000: {
        items:11,
      },
      1200: {
        items: 2,
        margin: 17,
        stagePadding: 00,
      }, 
    }
  });
  $(".status-bord-carousel").owlCarousel({
    loop: false,
    dots: false,
    nav: true,
    margin: 24,
    // navText: "",
    navText: ["<img src='./img/arrow-left.png' alt=''>","<img src='./img/arrow-right.png' alt=''>"],
    items: 4,
    responsive: {
      0: {
        items: 5,
        margin: 9,
      },
      727: {
        items: 6,
      },
      1000: {
        items: 7,
      },
      1200: {
        items: 4,
        margin: 14,
      },
      2000: {
        items: 4,
        margin: 28,
        // stagePadding: 55,
      },
    },
  });
});
