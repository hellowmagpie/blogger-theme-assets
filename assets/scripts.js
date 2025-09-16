/* JAVASCRIPT FUNCTIONALITY */
/* Vanilla JS implementation for Blogger compatibility */

(function() {
  'use strict';

  // DOM ready utility
  function domReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  // Mobile navigation toggle
  function initMobileNavigation() {
    const navToggle = document.createElement('button');
    navToggle.className = 'bashoClone-nav-toggle';
    navToggle.innerHTML = '☰';
    navToggle.setAttribute('aria-label', 'Toggle navigation');
    
    const nav = document.querySelector('.bashoClone-nav-links');
    const navContainer = document.querySelector('.bashoClone-nav-container');
    
    if (nav && navContainer) {
      navContainer.insertBefore(navToggle, nav);
      
      navToggle.addEventListener('click', function() {
        nav.classList.toggle('bashoClone-nav-open');
        navToggle.innerHTML = nav.classList.contains('bashoClone-nav-open') ? '✕' : '☰';
      });
    }
  }

  // Enhanced search functionality
  function initSearch() {
    const searchInput = document.querySelector('.bashoClone-search-input');
    const searchResults = document.createElement('div');
    searchResults.className = 'bashoClone-search-results';
    
    if (searchInput) {
      searchInput.parentNode.appendChild(searchResults);
      
      let searchIndex = [];
      
      // Build search index from post cards
      function buildSearchIndex() {
        const cards = document.querySelectorAll('.bashoClone-card');
        searchIndex = Array.from(cards).map(card => {
          const title = card.querySelector('.bashoClone-card-title')?.textContent || '';
          const excerpt = card.querySelector('.bashoClone-excerpt')?.textContent || '';
          const link = card.querySelector('.bashoClone-card-title a')?.href || '';
          const tags = Array.from(card.querySelectorAll('.bashoClone-tag')).map(tag => tag.textContent);
          
          return {
            title,
            excerpt,
            link,
            tags,
            searchText: (title + ' ' + excerpt + ' ' + tags.join(' ')).toLowerCase()
          };
        });
      }
      
      // Perform search
      function performSearch(query) {
        if (!query || query.length < 2) {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
          return;
        }
        
        const normalizedQuery = query.toLowerCase();
        const matches = searchIndex.filter(item => 
          item.searchText.includes(normalizedQuery)
        ).slice(0, 5);
        
        if (matches.length > 0) {
          searchResults.innerHTML = `
            <div class="bashoClone-search-results-header">Search Results:</div>
            ${matches.map(match => `
              <a href="${match.link}" class="bashoClone-search-result">
                <div class="bashoClone-search-result-title">${match.title}</div>
                <div class="bashoClone-search-result-excerpt">${match.excerpt.substring(0, 100)}...</div>
              </a>
            `).join('')}
          `;
          searchResults.style.display = 'block';
        } else {
          searchResults.innerHTML = '<div class="bashoClone-search-no-results">No results found</div>';
          searchResults.style.display = 'block';
        }
      }
      
      // Initialize search
      buildSearchIndex();
      
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          performSearch(this.value);
        }, 300);
      });
      
      // Hide results when clicking outside
      document.addEventListener('click', function(e) {
        if (!searchInput.parentNode.contains(e.target)) {
          searchResults.style.display = 'none';
        }
      });
    }
  }

  // Lazy loading for images
  function initLazyLoading() {
    const images = document.querySelectorAll('.bashoClone-card-image[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('bashoClone-loaded');
            observer.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('bashoClone-loaded');
      });
    }
  }

  // Reading progress indicator
  function initReadingProgress() {
    const postContent = document.querySelector('.bashoClone-post-content');
    
    if (postContent) {
      const progressBar = document.createElement('div');
      progressBar.className = 'bashoClone-reading-progress';
      document.body.appendChild(progressBar);
      
      function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = Math.min(progress, 100) + '%';
      }
      
      window.addEventListener('scroll', updateProgress);
      updateProgress();
    }
  }

  // Copy link functionality
  function initCopyLink() {
    const shareButtons = document.querySelectorAll('.bashoClone-share-btn');
    
    shareButtons.forEach(btn => {
      if (btn.textContent.includes('Copy')) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          
          navigator.clipboard.writeText(window.location.href).then(function() {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            
            setTimeout(() => {
              btn.textContent = originalText;
            }, 2000);
          }).catch(function(err) {
            console.error('Failed to copy link: ', err);
          });
        });
      }
    });
  }

  // Subscribe modal functionality
  function initSubscribeModal() {
    const subscribeButtons = document.querySelectorAll('[data-subscribe]');
    
    if (subscribeButtons.length > 0) {
      // Create modal HTML
      const modal = document.createElement('div');
      modal.className = 'bashoClone-subscribe-modal';
      modal.innerHTML = `
        <div class="bashoClone-modal-content">
          <div class="bashoClone-modal-header">
            <h3>Subscribe to our newsletter</h3>
            <button class="bashoClone-modal-close">&times;</button>
          </div>
          <div class="bashoClone-modal-body">
            <p>Get the latest posts delivered right to your inbox</p>
            <form class="bashoClone-subscribe-form" action="#" method="post">
              <input type="email" name="email" placeholder="Enter your email" required>
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const closeModal = () => modal.classList.remove('bashoClone-modal-open');
      
      // Open modal
      subscribeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          modal.classList.add('bashoClone-modal-open');
        });
      });
      
      // Close modal
      modal.querySelector('.bashoClone-modal-close').addEventListener('click', closeModal);
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
      });
      
      // Handle form submission (placeholder)
      modal.querySelector('.bashoClone-subscribe-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your subscription logic here
        alert('Subscription functionality needs to be implemented with your email service');
        closeModal();
      });
    }
  }

  // Smooth scrolling for anchor links
  function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Load more posts functionality
  function initLoadMore() {
    const loadMoreBtn = document.querySelector('.bashoClone-load-more');
    
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // This would need to be integrated with Blogger's pagination
        // For now, just hide the button as a placeholder
        this.textContent = 'Loading...';
        this.disabled = true;
        
        setTimeout(() => {
          this.style.display = 'none';
          // Add logic here to load more posts via AJAX
        }, 1000);
      });
    }
  }

  // Initialize all functionality
  domReady(function() {
    initMobileNavigation();
    initSearch();
    initLazyLoading();
    initReadingProgress();
    initCopyLink();
    initSubscribeModal();
    initSmoothScrolling();
    initLoadMore();
  });

  // Performance monitoring (optional)
  if ('performance' in window) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      }, 0);
    });
  }

})();
