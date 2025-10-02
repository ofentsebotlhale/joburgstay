// Advanced Search and Filtering for JoburgStay

class AdvancedSearch {
  constructor() {
    this.filters = {
      guests: null,
      priceRange: { min: 0, max: 1000 },
      amenities: [],
      dates: { checkIn: null, checkOut: null },
    };
    this.init();
  }

  init() {
    this.createSearchInterface();
    this.bindEvents();
  }

  createSearchInterface() {
    const searchHTML = `
      <div id="advanced-search" class="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-4xl mx-auto">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Find Your Perfect Stay</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Guests -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Guests</label>
            <select id="guest-filter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Any</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          <!-- Price Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Price Range (per night)</label>
            <div class="flex items-center space-x-2">
              <input type="number" id="price-min" placeholder="Min" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <span>-</span>
              <input type="number" id="price-max" placeholder="Max" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
          </div>

          <!-- Check-in -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
            <input type="date" id="search-checkin" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          </div>

          <!-- Check-out -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
            <input type="date" id="search-checkout" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          </div>
        </div>

        <!-- Amenities Filter -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div class="flex flex-wrap gap-2">
            <label class="flex items-center">
              <input type="checkbox" value="wifi" class="amenity-filter mr-2">
              <span class="text-sm">Wi-Fi</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" value="parking" class="amenity-filter mr-2">
              <span class="text-sm">Parking</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" value="kitchen" class="amenity-filter mr-2">
              <span class="text-sm">Kitchen</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" value="ac" class="amenity-filter mr-2">
              <span class="text-sm">Air Conditioning</span>
            </label>
          </div>
        </div>

        <!-- Search Button -->
        <div class="mt-4 text-center">
          <button id="search-btn" class="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
            Search Properties
          </button>
        </div>
      </div>
    `;

    // Insert after hero section
    const heroSection = document.querySelector("header");
    if (heroSection) {
      heroSection.insertAdjacentHTML("afterend", searchHTML);
    }
  }

  bindEvents() {
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.performSearch());
    }

    // Auto-search on filter changes
    document
      .querySelectorAll("#advanced-search input, #advanced-search select")
      .forEach((input) => {
        input.addEventListener("change", () => this.updateFilters());
      });
  }

  updateFilters() {
    this.filters.guests = document.getElementById("guest-filter").value;
    this.filters.priceRange.min =
      document.getElementById("price-min").value || 0;
    this.filters.priceRange.max =
      document.getElementById("price-max").value || 1000;
    this.filters.dates.checkIn =
      document.getElementById("search-checkin").value;
    this.filters.dates.checkOut =
      document.getElementById("search-checkout").value;

    this.filters.amenities = Array.from(
      document.querySelectorAll(".amenity-filter:checked")
    ).map((cb) => cb.value);
  }

  performSearch() {
    this.updateFilters();

    // Show loading
    const searchBtn = document.getElementById("search-btn");
    const originalText = searchBtn.textContent;
    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;

    // Simulate search (in real app, this would query your database)
    setTimeout(() => {
      this.displayResults();
      searchBtn.textContent = originalText;
      searchBtn.disabled = false;
    }, 1000);
  }

  displayResults() {
    // For demo, always show your property as matching
    const resultsHTML = `
      <div id="search-results" class="max-w-6xl mx-auto px-4 mb-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Search Results (1 property found)</h3>
        <div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <div class="flex items-center mb-2">
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Perfect Match!</span>
            <span class="text-yellow-400">★★★★★</span>
          </div>
          <h4 class="text-xl font-bold text-gray-800 mb-2">Modern Johannesburg Apartment</h4>
          <p class="text-gray-600 mb-4">47 Goldman Street, Florida - Exactly what you're looking for!</p>
          <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-gray-800">R500/night</span>
            <button onclick="document.getElementById('booking').scrollIntoView({behavior: 'smooth'})" 
                    class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Book Now
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing results
    const existingResults = document.getElementById("search-results");
    if (existingResults) {
      existingResults.remove();
    }

    // Insert new results
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.insertAdjacentHTML("beforebegin", resultsHTML);
    }
  }
}

// Initialize advanced search
document.addEventListener("DOMContentLoaded", () => {
  new AdvancedSearch();
});
