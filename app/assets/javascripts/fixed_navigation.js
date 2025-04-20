// app/assets/javascripts/fixed_navigation.js

document.addEventListener('turbolinks:load', function() {
  const header = document.getElementById('main-header');
  let lastScrollTop = 0;

  // Add shadow and background opacity based on scroll position
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add more shadow and solid background when scrolling down
    if (scrollTop > 10) {
      header.classList.add('shadow-lg');
      header.classList.add('bg-white/95');
      header.classList.add('backdrop-blur-sm');
      header.classList.remove('shadow-md');
      header.classList.remove('bg-white');
    } else {
      header.classList.remove('shadow-lg');
      header.classList.remove('bg-white/95');
      header.classList.remove('backdrop-blur-sm');
      header.classList.add('shadow-md');
      header.classList.add('bg-white');
    }

    // Optional: Hide header when scrolling down, show when scrolling up
    // Uncomment this section if you want this behavior
    /*
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down and not at the top
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up or at the top
      header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
    */
  });
});
