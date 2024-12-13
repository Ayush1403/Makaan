(function ($) {
    "use strict";

    // Configuration
    const CONFIG = {
        API_BASE_URL: 'https://real-estate-project-y5cm.onrender.com',
        ENDPOINTS: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            LISTINGS: '/listings'
        }
    };

    // Utility function for API requests
    async function apiRequest(endpoint, method = 'GET', data = null, token = null, contentType = 'application/json') {
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': contentType,
            };

            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: data ? JSON.stringify(data) : null
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Something went wrong');
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error.message);
            throw error;
        }
    }

    // Authentication Scripts
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    document.addEventListener('DOMContentLoaded', function () {
        // Retrieve token from localStorage (or sessionStorage if necessary)
        const token = localStorage.getItem('token');
        
        // Check if token exists and update UI accordingly
        if (loginSignupBtn) {
            if (token) {
                loginSignupBtn.innerText = 'Sign Out';
                loginSignupBtn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                });
                logoutBtn.style.display = 'block'; // Show logout button
            } else {
                loginSignupBtn.innerText = 'Sign In';
                loginSignupBtn.setAttribute('href', 'login.html');
                logoutBtn.style.display = 'none'; // Hide logout button
            }
        }

        // Login Event
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('login-username').value;
                const password = document.getElementById('login-password').value;

                try {
                    const formData = new URLSearchParams();
                    formData.append('grant_type', 'password');
                    formData.append('username', username);
                    formData.append('password', password);

                    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        alert(`Error: ${errorData.detail || 'Login failed'}`);
                        return;
                    }

                    const data = await response.json();

                    if (data.access_token) {
                        localStorage.setItem('token', data.access_token);
                        window.location.href = 'property-list.html';
                    } else {
                        alert('Login failed: No access token received');
                    }
                } catch (error) {
                    alert(`An error occurred: ${error.message}`);
                }
            });
        }
        document.getElementById("signOutBtn").addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default navigation
            window.location.href = "index.html"; // Redirect to index.html
        });
        // Signup Event
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;

                const signupData = {
                    name: name,
                    email: email,
                    password: password
                };

                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SIGNUP}`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify(signupData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        alert(`Error: ${errorData.detail || 'Signup failed'}`);
                        return;
                    }

                    alert('Signup successful! Please log in.');
                    window.location.href = 'login.html'; // Redirect to login page after successful signup

                } catch (error) {
                    alert('An error occurred: ' + error.message);
                }
            });
        }

        // Listings Page Scripts
        const listingsContainer = document.getElementById('listings');

        if (listingsContainer) {
            if (token) {
                fetchListings(token);
            } else {
                alert('Please log in to view listings');
                window.location.href = 'login.html';
            }
        }

        async function fetchListings(token) {
            try {
                // Use the API request to fetch the listings
                const listings = await apiRequest(CONFIG.ENDPOINTS.LISTINGS, 'GET', null, token);
                displayListings(listings);
                console.log(listings);  // Log listings for debugging
            } catch (error) {
                console.error('Error fetching listings:', error);
                alert(`Failed to fetch listings: ${error.message || error}`);
            }
        }

        function displayListings(listings) {
            listingsContainer.innerHTML = '';  // Clear the container first

            if (listings.length === 0) {
                listingsContainer.innerHTML = '<p>No properties available at the moment.</p>';
            } else {
                listings.forEach(listing => {
                    const listingCard = document.createElement('div');
                    listingCard.classList.add('col-lg-4', 'col-md-6', 'wow', 'fadeInUp');
                    listingCard.setAttribute('data-wow-delay', '0.1s');
                    listingCard.innerHTML = `
                        <div class="property-item rounded overflow-hidden">
                            <a href="property-detail.html?id=${listing.id}">
                                <img class="img-fluid" src="${listing.image}" alt="${listing.name}">
                                <div class="bg-light p-4">
                                    <h5 class="text-primary mb-3">${listing.price}</h5>
                                    <h6>${listing.name}</h6>
                                    <p><i class="fa fa-map-marker-alt text-primary me-2"></i>${listing.location}</p>
                                    <div class="d-flex border-top pt-2">
                                        <small class="flex-fill"><i class="fa fa-bed text-primary me-2"></i>${listing.bedrooms} Beds</small>
                                        <small class="flex-fill"><i class="fa fa-bath text-primary me-2"></i>${listing.bathrooms} Baths</small>
                                        <small class="flex-fill"><i class="fa fa-expand text-primary me-2"></i>${listing.area}</small>
                                    </div>
                                    ${listing.featured ? '<span class="badge bg-primary">Featured</span>' : ''}
                                </div>
                            </a>
                        </div>
                    `;
                    listingsContainer.appendChild(listingCard);
                });
            }
        }

        // Spinner (if necessary for loading screens)
        var spinner = function () {
            setTimeout(function () {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        };
        spinner();

        // Additional features (e.g., carousel, navbar, etc.)
        $(".header-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            items: 1,
            dots: true,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-chevron-left"></i>',
                '<i class="bi bi-chevron-right"></i>'
            ]
        });
    });

})(jQuery);
