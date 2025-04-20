// app/assets/javascripts/back_to_top.js

document.addEventListener('turbolinks:load', function() {
  // Create the back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.id = 'back-to-top';
  backToTopButton.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  `;
  backToTopButton.className = 'fixed bottom-4 right-4 p-3 rounded-full bg-primary-600 text-white shadow-lg opacity-0 transition-all duration-300 transform translate-y-10 hover:bg-primary-700 focus:outline-none z-50';
  document.body.appendChild(backToTopButton);
  
  // Show/hide the button based on scroll position
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
      backToTopButton.classList.remove('opacity-0', 'translate-y-10');
      backToTopButton.classList.add('opacity-100', 'translate-y-0');
    } else {
      backToTopButton.classList.add('opacity-0', 'translate-y-10');
      backToTopButton.classList.remove('opacity-100', 'translate-y-0');
    }
  });
  
  // Scroll to top when the button is clicked
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
