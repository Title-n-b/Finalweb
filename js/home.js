document.addEventListener('DOMContentLoaded', function() {
    // Initialize the carousel
    var myCarousel = new bootstrap.Carousel(document.getElementById('carouselExampleCaptions'), {
      interval: 3000, // Change slide every 3 seconds
      wrap: true // Continue from the last slide to the first one
    });
  
    // Start auto-sliding
    myCarousel.cycle();
});