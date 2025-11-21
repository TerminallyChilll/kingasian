// --- CONSTANTS ---
const TEXT_CONTENT = {
    phone: {
        display: '905-555-0123',
        tel: '+19055550123'
    },
    currency: {
        locale: 'en-CA',
        currency: 'CAD'
    },
    messages: {
        emptyCart: 'Your cart is empty',
        searchPlaceholder: "Search for 'Chicken', 'Rice', 'Soup'...",
        totalLabel: 'Total (Cash/Pickup)',
        reviewOrderBtn: 'Review Order',
        orderModalTitle: 'Your Order',
        orderModalNote: 'Note: This is a list to read over the phone.',
        callToOrderBtn: '📞 Call to Order',
        paymentNote: 'We accept Cash & Debit on Pickup.'
    }
};

// --- STATE ---
let cart = {}; // { itemId: quantity }
let menuData = [];
let photosData = [];

// Currency formatter
const formatCurrency = new Intl.NumberFormat(TEXT_CONTENT.currency.locale, {
    style: 'currency',
    currency: TEXT_CONTENT.currency.currency
});

// --- INIT ---
window.addEventListener('DOMContentLoaded', async function() {
    // Load data from JSON files
    try {
        const menuResponse = await fetch('menu-data.json');
        menuData = await menuResponse.json();
        
        const photosResponse = await fetch('gallery-data.json');
        photosData = await photosResponse.json();
        
        // Load cart from localStorage
        loadCartFromStorage();
        
        renderMenu(menuData);
        renderPhotos("All");
        renderPhotoNav();
        
        // Setup event delegation
        setupEventDelegation();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to inline data if JSON files fail to load
        loadFallbackData();
    }
});

// --- FALLBACK DATA ---
function loadFallbackData() {
    menuData = [
        {
            category: "Appetizers & Soup",
            items: [
                { id: 1, name: "Crispy Spring Rolls (2)", desc: "Vegetable filling, golden fried", price: 3.95 },
                { id: 2, name: "Wonton Soup", desc: "Pork dumplings in chicken broth", price: 5.95 },
                { id: 3, name: "Hot & Sour Soup", desc: "Tofu, bamboo shoots, egg, spicy", price: 6.50 },
                { id: 4, name: "BBQ Pork Slices", desc: "Honey glazed roasted pork", price: 9.95 }
            ]
        },
        {
            category: "Chef's Specials",
            items: [
                { id: 5, name: "General Tao Chicken", desc: "Breaded chicken, spicy sweet sauce", price: 13.95 },
                { id: 6, name: "Lemon Chicken", desc: "Crispy breast meat, lemon sauce", price: 13.50 },
                { id: 7, name: "Beef with Broccoli", desc: "Tender beef slices, garlic sauce", price: 14.50 },
                { id: 8, name: "Szechuan Shrimp", desc: "Spicy chili paste, onions, peppers", price: 16.95 }
            ]
        },
        {
            category: "Rice & Noodles",
            items: [
                { id: 9, name: "Chicken Fried Rice", desc: "Wok tossed with egg and peas", price: 10.50 },
                { id: 10, name: "Cantonese Chow Mein", desc: "Crispy noodles, mixed meats & veg", price: 15.50 },
                { id: 11, name: "Shanghai Noodles", desc: "Thick noodles, cabbage, pork", price: 12.95 },
                { id: 12, name: "Steamed Rice", desc: "Jasmine scented", price: 2.50 }
            ]
        }
    ];

    photosData = [
        { url: "https://images.unsplash.com/photo-1626804475297-411dbe917bfd?w=400", cat: "Dishes", label: "Fried Rice", alt: "Delicious Chinese fried rice" },
        { url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400", cat: "Dishes", label: "General Tao", alt: "Crispy General Tao chicken" },
        { url: "https://images.unsplash.com/photo-1541696432-82c6da8ce6d2?w=400", cat: "Interior", label: "Dining Room", alt: "Restaurant interior" },
        { url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", cat: "Dishes", label: "Noodles", alt: "Chinese noodles" },
        { url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400", cat: "Dishes", label: "Dim Sum", alt: "Steamed dim sum" }
    ];

    renderMenu(menuData);
    renderPhotos("All");
    renderPhotoNav();
    setupEventDelegation();
}

// --- LOCALSTORAGE ---
function saveCartToStorage() {
    try {
        localStorage.setItem('kingasian_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('kingasian_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.error('Error loading cart:', e);
        cart = {};
    }
}

// --- EVENT DELEGATION ---
function setupEventDelegation() {
    // Menu quantity buttons
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('qty-btn')) {
                const itemId = parseInt(e.target.dataset.itemId);
                const change = parseInt(e.target.dataset.change);
                updateQty(itemId, change);
            }
        });
    }

    // Photo category buttons
    const photoNav = document.getElementById('photo-categories');
    if (photoNav) {
        photoNav.addEventListener('click', function(e) {
            if (e.target.classList.contains('photo-cat-btn')) {
                const category = e.target.dataset.category;
                document.querySelectorAll('.photo-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderPhotos(category);
            }
        });
    }

    // Search functionality
    const searchBox = document.getElementById('searchBar');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            triggerSearch();
            updateClearButton();
        });
        
        searchBox.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                triggerSearch();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('searchBar').value = '';
            triggerSearch();
            updateClearButton();
            searchBox.focus();
        });
    }

    // Modal close on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('checkout-modal');
        if (event.target === modal) {
            closeCheckout();
        }
    });
}

function updateClearButton() {
    const searchBox = document.getElementById('searchBar');
    const clearBtn = document.getElementById('clearSearchBtn');
    if (searchBox && clearBtn) {
        if (searchBox.value.length > 0) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    }
}

// --- NAVIGATION ---
function showPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button, nav a').forEach(el => el.classList.remove('active'));
    
    // Show target
    const page = document.getElementById(pageId);
    const navBtn = document.getElementById('nav-' + pageId);
    
    if (page) page.classList.add('active');
    if (navBtn) navBtn.classList.add('active');
    
    // Scroll top
    window.scrollTo(0, 0);
}

// --- MENU LOGIC ---
function renderMenu(data) {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    const fragment = document.createDocumentFragment();

    data.forEach(cat => {
        // Create Header
        const header = document.createElement('div');
        header.className = 'menu-cat-header';
        header.innerHTML = `<span>${cat.category}</span>`;
        fragment.appendChild(header);

        // Create Items
        cat.items.forEach(item => {
            const qty = cart[item.id] || 0;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';
            if (qty === 0) {
                itemDiv.classList.add('zero-quantity');
            }
            
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-cat-label">${cat.category}</div>
                    <div class="item-header">
                        <span>${item.name}</span>
                        <span class="item-price">${formatCurrency.format(item.price)}</span>
                    </div>
                    <div class="item-desc">${item.desc}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-item-id="${item.id}" data-change="1" aria-label="Increase quantity of ${item.name}">+</button>
                    <div class="qty-display" id="qty-${item.id}">${qty}</div>
                    <button class="qty-btn" data-item-id="${item.id}" data-change="-1" aria-label="Decrease quantity of ${item.name}">-</button>
                </div>
            `;
            fragment.appendChild(itemDiv);
        });
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function updateQty(id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;
    if (cart[id] < 0) cart[id] = 0;
    
    // Update UI number
    const display = document.getElementById(`qty-${id}`);
    if (display) {
        display.innerText = cart[id];
        
        // Update parent menu-item styling
        const menuItem = display.closest('.menu-item');
        if (menuItem) {
            if (cart[id] === 0) {
                menuItem.classList.add('zero-quantity');
            } else {
                menuItem.classList.remove('zero-quantity');
            }
        }
    }
    
    calculateTotal();
    saveCartToStorage();
}

function calculateTotal() {
    let total = 0;
    menuData.forEach(cat => {
        cat.items.forEach(item => {
            if (cart[item.id]) {
                total += item.price * cart[item.id];
            }
        });
    });
    
    const totalElement = document.getElementById('footer-total');
    if (totalElement) {
        totalElement.innerText = total.toFixed(2);
    }
}

// --- SEARCH ---
function triggerSearch() {
    const searchBox = document.getElementById('searchBar');
    if (!searchBox) return;
    
    const query = searchBox.value.toLowerCase();
    if (!query) {
        renderMenu(menuData);
        return;
    }

    // Filter logic
    const filteredData = menuData.map(cat => {
        const matchingItems = cat.items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.desc.toLowerCase().includes(query)
        );
        if (matchingItems.length > 0) {
            // Highlight matching text
            const highlightedItems = matchingItems.map(item => ({
                ...item,
                name: highlightText(item.name, query),
                desc: highlightText(item.desc, query)
            }));
            return { category: cat.category, items: highlightedItems };
        }
        return null;
    }).filter(item => item !== null);

    renderMenu(filteredData);
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- PHOTOS ---
function renderPhotoNav() {
    const container = document.getElementById('photo-categories');
    if (!container) return;
    
    const cats = ["All", "Dishes", "Interior"];
    const fragment = document.createDocumentFragment();
    
    cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'photo-cat-btn ' + (c === 'All' ? 'active' : '');
        btn.innerText = c;
        btn.dataset.category = c;
        btn.setAttribute('aria-label', `Show ${c} photos`);
        fragment.appendChild(btn);
    });
    
    container.appendChild(fragment);
}

function renderPhotos(filter) {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    
    const fragment = document.createDocumentFragment();
    
    photosData.forEach(p => {
        if (filter === "All" || p.cat === filter) {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${p.url}" 
                     alt="${p.alt || p.label}" 
                     width="150" 
                     height="120"
                     loading="lazy">
                <span>${p.label}</span>
            `;
            fragment.appendChild(card);
        }
    });
    
    grid.innerHTML = '';
    grid.appendChild(fragment);
}

// --- MODAL / CHECKOUT ---
function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const listBody = document.getElementById('modal-cart-items');
    if (!modal || !listBody) return;
    
    listBody.innerHTML = '';
    let total = 0;
    let hasItems = false;

    const fragment = document.createDocumentFragment();

    menuData.forEach(cat => {
        cat.items.forEach(item => {
            const q = cart[item.id];
            if (q > 0) {
                hasItems = true;
                const lineTotal = q * item.price;
                total += lineTotal;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
// --- CONSTANTS ---
const TEXT_CONTENT = {
    currency: { locale: 'en-CA', currency: 'CAD' },
    messages: { emptyCart: 'Your cart is empty' }
};

// --- STATE ---
let cart = {}; 
let menuData = [];
let photosData = [];

const formatCurrency = new Intl.NumberFormat(TEXT_CONTENT.currency.locale, {
    style: 'currency', currency: TEXT_CONTENT.currency.currency
});

// --- INIT ---
window.addEventListener('DOMContentLoaded', async function() {
    try {
        // Try to fetch files (Works on Server)
        const menuRes = await fetch('menu-data.json');
        if (!menuRes.ok) throw new Error("Menu file not found");
        menuData = await menuRes.json();
        
        const photoRes = await fetch('gallery-data.json');
        if (!photoRes.ok) throw new Error("Gallery file not found");
        photosData = await photoRes.json();
        
        initializeSite();
    } catch (error) {
        console.log('Fetching failed (likely running locally). Using fallback data.');
        loadFallbackData();
    }
});

function initializeSite() {
    loadCartFromStorage();
    renderMenu(menuData);
    renderPhotos("All");
    renderPhotoNav();
    setupEventDelegation();
}

// --- FALLBACK DATA (Saves you if fetch fails) ---
function loadFallbackData() {
    // FULL MENU DATA FROM YOUR FILE
    menuData = [
      {
        "category": "Appetizers",
        "items": [
          {"id": 1, "name": "Crispy Spring Rolls (2)", "desc": "Vegetable filling, golden fried", "price": 3.95},
          {"id": 2, "name": "Shrimp Spring Rolls (2)", "desc": "Shrimp and vegetable filling", "price": 4.95},
          {"id": 3, "name": "BBQ Pork Slices", "desc": "Honey glazed roasted pork", "price": 9.95},
          {"id": 4, "name": "Chicken Wings (8)", "desc": "Deep fried, crispy wings", "price": 8.95},
          {"id": 5, "name": "Honey Garlic Wings (8)", "desc": "Sweet and savory glaze", "price": 9.95},
          {"id": 6, "name": "Fried Wontons (10)", "desc": "Crispy pork wontons", "price": 7.50},
          {"id": 7, "name": "Steamed Dumplings (6)", "desc": "Pork and chive dumplings", "price": 6.95},
          {"id": 8, "name": "Pan Fried Dumplings (6)", "desc": "Crispy bottom, juicy filling", "price": 7.50},
          {"id": 9, "name": "Shrimp Dumplings (6)", "desc": "Delicate shrimp filling", "price": 8.50},
          {"id": 10, "name": "Vegetable Dumplings (6)", "desc": "Mixed vegetables", "price": 6.50},
          {"id": 11, "name": "Chicken Lettuce Wraps", "desc": "Minced chicken, water chestnuts", "price": 10.95},
          {"id": 12, "name": "Salt & Pepper Squid", "desc": "Crispy fried calamari", "price": 11.95},
          {"id": 13, "name": "Crispy Shrimp (6)", "desc": "Battered and deep fried", "price": 9.95},
          {"id": 14, "name": "Chicken Skewers (4)", "desc": "Marinated and grilled", "price": 8.95},
          {"id": 15, "name": "BBQ Pork Buns (3)", "desc": "Steamed buns with BBQ pork", "price": 6.95}
        ]
      },
      {
        "category": "Soups",
        "items": [
          {"id": 16, "name": "Wonton Soup", "desc": "Pork dumplings in chicken broth", "price": 5.95},
          {"id": 17, "name": "Hot & Sour Soup", "desc": "Tofu, bamboo shoots, egg, spicy", "price": 6.50},
          {"id": 18, "name": "Egg Drop Soup", "desc": "Silky egg ribbons in broth", "price": 5.50},
          {"id": 19, "name": "Chicken Corn Soup", "desc": "Creamy corn and chicken", "price": 6.50},
          {"id": 20, "name": "Wor Wonton Soup", "desc": "Wontons with mixed vegetables", "price": 8.95},
          {"id": 21, "name": "Seafood Soup", "desc": "Shrimp, scallops, vegetables", "price": 9.95},
          {"id": 22, "name": "West Lake Beef Soup", "desc": "Minced beef, cilantro, egg", "price": 7.50},
          {"id": 23, "name": "Vegetable Tofu Soup", "desc": "Mixed vegetables and tofu", "price": 6.95}
        ]
      },
      {
        "category": "Chef's Specials",
        "items": [
          {"id": 24, "name": "General Tao Chicken", "desc": "Breaded chicken, spicy sweet sauce", "price": 13.95},
          {"id": 25, "name": "Sesame Chicken", "desc": "Sweet sauce, sesame seeds", "price": 13.95},
          {"id": 26, "name": "Orange Chicken", "desc": "Crispy chicken in orange sauce", "price": 13.95},
          {"id": 27, "name": "Lemon Chicken", "desc": "Crispy breast meat, lemon sauce", "price": 13.50},
          {"id": 28, "name": "Honey Garlic Chicken", "desc": "Sweet and savory glazed chicken", "price": 13.95},
          {"id": 29, "name": "Szechuan Shrimp", "desc": "Spicy chili paste, onions, peppers", "price": 16.95},
          {"id": 30, "name": "Kung Pao Chicken", "desc": "Peanuts, dried chilies, Szechuan style", "price": 14.50},
          {"id": 31, "name": "Sweet & Sour Pork", "desc": "Crispy pork, pineapple, peppers", "price": 13.95},
          {"id": 32, "name": "Moo Goo Gai Pan", "desc": "Chicken with mushrooms, vegetables", "price": 13.95},
          {"id": 33, "name": "Mongolian Beef", "desc": "Tender beef, green onions, spicy", "price": 15.95},
          {"id": 34, "name": "Beef with Black Bean Sauce", "desc": "Savory black bean sauce", "price": 14.95},
          {"id": 35, "name": "Pepper Steak", "desc": "Beef with bell peppers, onions", "price": 14.95}
        ]
      },
      {
        "category": "Chicken Dishes",
        "items": [
          {"id": 36, "name": "Chicken with Broccoli", "desc": "Tender chicken, fresh broccoli", "price": 12.95},
          {"id": 37, "name": "Chicken with Mixed Vegetables", "desc": "Assorted fresh vegetables", "price": 12.95},
          {"id": 38, "name": "Chicken with Cashews", "desc": "Diced chicken, cashew nuts", "price": 13.50},
          {"id": 39, "name": "Chicken with Snow Peas", "desc": "Crisp snow peas, white sauce", "price": 12.95},
          {"id": 40, "name": "Chicken with Black Bean Sauce", "desc": "Savory fermented black beans", "price": 12.95},
          {"id": 41, "name": "Chicken with Mushrooms", "desc": "Button and shiitake mushrooms", "price": 12.95},
          {"id": 42, "name": "Chicken with String Beans", "desc": "Tender string beans", "price": 12.95},
          {"id": 43, "name": "Chicken Chop Suey", "desc": "Bean sprouts, mixed vegetables", "price": 12.50},
          {"id": 44, "name": "Szechuan Chicken", "desc": "Hot and spicy Szechuan sauce", "price": 13.50},
          {"id": 45, "name": "Curry Chicken", "desc": "Yellow curry sauce, vegetables", "price": 13.50},
          {"id": 46, "name": "Chicken with Garlic Sauce", "desc": "Spicy garlic sauce", "price": 12.95},
          {"id": 47, "name": "Almond Chicken", "desc": "Breaded chicken, sliced almonds", "price": 13.50}
        ]
      },
      {
        "category": "Beef Dishes",
        "items": [
          {"id": 48, "name": "Beef with Broccoli", "desc": "Tender beef slices, garlic sauce", "price": 14.50},
          {"id": 49, "name": "Beef with Mixed Vegetables", "desc": "Assorted fresh vegetables", "price": 14.50},
          {"id": 50, "name": "Beef with Snow Peas", "desc": "Crisp snow peas, oyster sauce", "price": 14.50},
          {"id": 51, "name": "Beef with Mushrooms", "desc": "Savory mushroom sauce", "price": 14.50},
          {"id": 52, "name": "Beef with Green Peppers", "desc": "Bell peppers, onions", "price": 14.50},
          {"id": 53, "name": "Beef with String Beans", "desc": "Tender string beans", "price": 14.50},
          {"id": 54, "name": "Beef Chop Suey", "desc": "Bean sprouts, vegetables", "price": 14.50},
          {"id": 55, "name": "Szechuan Beef", "desc": "Hot and spicy Szechuan sauce", "price": 15.50},
          {"id": 56, "name": "Curry Beef", "desc": "Yellow curry sauce", "price": 15.50},
          {"id": 57, "name": "Beef with Garlic Sauce", "desc": "Spicy garlic sauce", "price": 14.50},
          {"id": 58, "name": "Beef with Tomato", "desc": "Fresh tomatoes, onions", "price": 14.50},
          {"id": 59, "name": "Ginger Beef", "desc": "Crispy beef, ginger sauce", "price": 15.95}
        ]
      },
      {
        "category": "Pork Dishes",
        "items": [
          {"id": 60, "name": "Sweet & Sour Pork Balls", "desc": "Crispy pork, sweet & sour sauce", "price": 13.50},
          {"id": 61, "name": "BBQ Pork with Mixed Vegetables", "desc": "Char siu pork, vegetables", "price": 13.50},
          {"id": 62, "name": "Pork with Broccoli", "desc": "Tender pork, fresh broccoli", "price": 13.50},
          {"id": 63, "name": "Pork with Mushrooms", "desc": "Savory mushroom sauce", "price": 13.50},
          {"id": 64, "name": "Pork with String Beans", "desc": "Tender string beans", "price": 13.50},
          {"id": 65, "name": "Szechuan Pork", "desc": "Hot and spicy Szechuan sauce", "price": 14.50},
          {"id": 66, "name": "Twice Cooked Pork", "desc": "Traditional Szechuan style", "price": 14.50},
          {"id": 67, "name": "Pork with Garlic Sauce", "desc": "Spicy garlic sauce", "price": 13.50}
        ]
      },
      {
        "category": "Seafood Dishes",
        "items": [
          {"id": 68, "name": "Shrimp with Broccoli", "desc": "Jumbo shrimp, fresh broccoli", "price": 15.95},
          {"id": 69, "name": "Shrimp with Mixed Vegetables", "desc": "Assorted fresh vegetables", "price": 15.95},
          {"id": 70, "name": "Shrimp with Lobster Sauce", "desc": "Creamy egg sauce", "price": 15.95},
          {"id": 71, "name": "Shrimp with Snow Peas", "desc": "Crisp snow peas", "price": 15.95},
          {"id": 72, "name": "Shrimp with Cashews", "desc": "Cashew nuts, vegetables", "price": 16.50},
          {"id": 73, "name": "Shrimp with Black Bean Sauce", "desc": "Savory fermented black beans", "price": 15.95},
          {"id": 74, "name": "Shrimp with Garlic Sauce", "desc": "Spicy garlic sauce", "price": 15.95},
          {"id": 75, "name": "Kung Pao Shrimp", "desc": "Peanuts, dried chilies", "price": 16.50},
          {"id": 76, "name": "Sweet & Sour Shrimp", "desc": "Crispy shrimp, sweet & sour sauce", "price": 15.95},
          {"id": 77, "name": "Curry Shrimp", "desc": "Yellow curry sauce", "price": 16.50},
          {"id": 78, "name": "Szechuan Shrimp", "desc": "Hot and spicy", "price": 16.95},
          {"id": 79, "name": "Scallops with Garlic Sauce", "desc": "Tender scallops, spicy garlic", "price": 17.95},
          {"id": 80, "name": "Scallops with Mixed Vegetables", "desc": "Assorted vegetables", "price": 17.95},
          {"id": 81, "name": "Seafood Delight", "desc": "Shrimp, scallops, mixed vegetables", "price": 18.95}
        ]
      },
      {
        "category": "Fried Rice",
        "items": [
          {"id": 82, "name": "Steamed Rice", "desc": "Jasmine scented", "price": 2.50},
          {"id": 83, "name": "Plain Fried Rice", "desc": "Wok fried with egg", "price": 8.50},
          {"id": 84, "name": "Vegetable Fried Rice", "desc": "Mixed vegetables", "price": 9.50},
          {"id": 85, "name": "Chicken Fried Rice", "desc": "Wok tossed with egg and peas", "price": 10.50},
          {"id": 86, "name": "BBQ Pork Fried Rice", "desc": "Char siu pork", "price": 10.50},
          {"id": 87, "name": "Beef Fried Rice", "desc": "Tender beef slices", "price": 11.50},
          {"id": 88, "name": "Shrimp Fried Rice", "desc": "Jumbo shrimp", "price": 12.50},
          {"id": 89, "name": "House Special Fried Rice", "desc": "Chicken, beef, shrimp", "price": 13.50},
          {"id": 90, "name": "Yang Chow Fried Rice", "desc": "Shrimp, BBQ pork, vegetables", "price": 13.50},
          {"id": 91, "name": "Pineapple Fried Rice", "desc": "Shrimp, pineapple chunks", "price": 13.95}
        ]
      },
      {
        "category": "Chow Mein",
        "items": [
          {"id": 92, "name": "Vegetable Chow Mein", "desc": "Soft noodles, mixed vegetables", "price": 10.50},
          {"id": 93, "name": "Chicken Chow Mein", "desc": "Soft noodles with chicken", "price": 11.50},
          {"id": 94, "name": "BBQ Pork Chow Mein", "desc": "Soft noodles with char siu", "price": 11.50},
          {"id": 95, "name": "Beef Chow Mein", "desc": "Soft noodles with beef", "price": 12.50},
          {"id": 96, "name": "Shrimp Chow Mein", "desc": "Soft noodles with shrimp", "price": 13.50},
          {"id": 97, "name": "House Special Chow Mein", "desc": "Chicken, beef, shrimp", "price": 14.50},
          {"id": 98, "name": "Cantonese Chow Mein", "desc": "Crispy noodles, mixed meats & veg", "price": 15.50},
          {"id": 99, "name": "Singapore Noodles", "desc": "Curry rice noodles", "price": 13.50}
        ]
      },
      {
        "category": "Lo Mein",
        "items": [
          {"id": 100, "name": "Vegetable Lo Mein", "desc": "Soft egg noodles, vegetables", "price": 10.50},
          {"id": 101, "name": "Chicken Lo Mein", "desc": "Soft egg noodles with chicken", "price": 11.50},
          {"id": 102, "name": "BBQ Pork Lo Mein", "desc": "Soft egg noodles with char siu", "price": 11.50},
          {"id": 103, "name": "Beef Lo Mein", "desc": "Soft egg noodles with beef", "price": 12.50},
          {"id": 104, "name": "Shrimp Lo Mein", "desc": "Soft egg noodles with shrimp", "price": 13.50},
          {"id": 105, "name": "House Special Lo Mein", "desc": "Chicken, beef, shrimp", "price": 14.50}
        ]
      },
      {
        "category": "Pad Thai & Other Noodles",
        "items": [
          {"id": 106, "name": "Chicken Pad Thai", "desc": "Thai rice noodles, peanuts", "price": 12.95},
          {"id": 107, "name": "Shrimp Pad Thai", "desc": "Thai rice noodles, jumbo shrimp", "price": 14.95},
          {"id": 108, "name": "Shanghai Noodles", "desc": "Thick noodles, cabbage, pork", "price": 12.95},
          {"id": 109, "name": "Dan Dan Noodles", "desc": "Spicy Szechuan noodles", "price": 11.95},
          {"id": 110, "name": "Beef Chow Fun", "desc": "Wide rice noodles, beef", "price": 13.95},
          {"id": 111, "name": "Seafood Pan Fried Noodles", "desc": "Crispy noodle cake, seafood", "price": 16.95}
        ]
      },
      {
        "category": "Vegetarian Dishes",
        "items": [
          {"id": 112, "name": "Buddha's Delight", "desc": "Mixed vegetables, tofu", "price": 11.95},
          {"id": 113, "name": "Ma Po Tofu", "desc": "Spicy tofu, Szechuan style", "price": 11.95},
          {"id": 114, "name": "Szechuan String Beans", "desc": "Dry fried string beans", "price": 10.95},
          {"id": 115, "name": "Garlic Eggplant", "desc": "Chinese eggplant, garlic sauce", "price": 11.95},
          {"id": 116, "name": "Broccoli with Garlic Sauce", "desc": "Fresh broccoli", "price": 10.95},
          {"id": 117, "name": "Mixed Vegetables", "desc": "Assorted fresh vegetables", "price": 10.95},
          {"id": 118, "name": "Tofu with Mixed Vegetables", "desc": "Firm tofu, vegetables", "price": 11.50},
          {"id": 119, "name": "Kung Pao Tofu", "desc": "Tofu, peanuts, dried chilies", "price": 12.50}
        ]
      },
      {
        "category": "Egg Foo Young",
        "items": [
          {"id": 120, "name": "Vegetable Egg Foo Young", "desc": "Vegetable omelette, gravy", "price": 10.95},
          {"id": 121, "name": "Chicken Egg Foo Young", "desc": "Chicken omelette, gravy", "price": 11.95},
          {"id": 122, "name": "BBQ Pork Egg Foo Young", "desc": "BBQ pork omelette, gravy", "price": 11.95},
          {"id": 123, "name": "Beef Egg Foo Young", "desc": "Beef omelette, gravy", "price": 12.95},
          {"id": 124, "name": "Shrimp Egg Foo Young", "desc": "Shrimp omelette, gravy", "price": 13.95},
          {"id": 125, "name": "House Special Egg Foo Young", "desc": "Mixed meat omelette, gravy", "price": 13.95}
        ]
      },
      {
        "category": "Combination Dinners",
        "items": [
          {"id": 126, "name": "Dinner for 2", "desc": "2 egg rolls, wonton soup, chicken fried rice, General Tao chicken, beef broccoli", "price": 39.95},
          {"id": 127, "name": "Dinner for 3", "desc": "3 egg rolls, wonton soup, chicken fried rice, sweet & sour pork, beef broccoli, kung pao chicken", "price": 54.95},
          {"id": 128, "name": "Dinner for 4", "desc": "4 egg rolls, hot & sour soup, chicken fried rice, shrimp fried rice, General Tao chicken, beef broccoli, kung pao shrimp, lemon chicken", "price": 74.95},
          {"id": 129, "name": "Family Feast", "desc": "6 egg rolls, 2 soups, 2 fried rice, 4 main dishes", "price": 99.95}
        ]
      },
      {
        "category": "Lunch Specials",
        "items": [
          {"id": 130, "name": "L1. Chicken with Broccoli", "desc": "Includes soup, egg roll, fried rice", "price": 9.95},
          {"id": 131, "name": "L2. Sweet & Sour Chicken", "desc": "Includes soup, egg roll, fried rice", "price": 9.95},
          {"id": 132, "name": "L3. General Tao Chicken", "desc": "Includes soup, egg roll, fried rice", "price": 10.95},
          {"id": 133, "name": "L4. Beef with Broccoli", "desc": "Includes soup, egg roll, fried rice", "price": 10.95},
          {"id": 134, "name": "L5. Kung Pao Chicken", "desc": "Includes soup, egg roll, fried rice", "price": 9.95},
          {"id": 135, "name": "L6. Chicken Lo Mein", "desc": "Includes soup, egg roll", "price": 9.95},
          {"id": 136, "name": "L7. Szechuan Beef", "desc": "Includes soup, egg roll, fried rice", "price": 10.95},
          {"id": 137, "name": "L8. Shrimp with Mixed Vegetables", "desc": "Includes soup, egg roll, fried rice", "price": 11.95}
        ]
      },
      {
        "category": "Beverages & Desserts",
        "items": [
          {"id": 138, "name": "Soft Drink", "desc": "Coke, Sprite, Ginger Ale", "price": 2.50},
          {"id": 139, "name": "Bottled Water", "desc": "500ml", "price": 2.00},
          {"id": 140, "name": "Hot Tea", "desc": "Jasmine or green tea", "price": 2.50},
          {"id": 141, "name": "Bubble Tea", "desc": "Various flavors", "price": 5.50},
          {"id": 142, "name": "Deep Fried Ice Cream", "desc": "Vanilla ice cream, crispy coating", "price": 5.95},
          {"id": 143, "name": "Mango Pudding", "desc": "Sweet mango dessert", "price": 4.95},
          {"id": 144, "name": "Fortune Cookies (3)", "desc": "Traditional fortune cookies", "price": 1.50}
        ]
// --- CONSTANTS ---
const TEXT_CONTENT = {
    currency: { locale: 'en-CA', currency: 'CAD' },
    messages: { emptyCart: 'Your cart is empty' }
};

// --- STATE ---
let cart = {}; 
let menuData = [];
let photosData = [];

const formatCurrency = new Intl.NumberFormat(TEXT_CONTENT.currency.locale, {
    style: 'currency', currency: TEXT_CONTENT.currency.currency
});

// --- INIT ---
window.addEventListener('DOMContentLoaded', async function() {
    try {
        // Attempt to load from JSON files (Best for Live Site)
        const menuRes = await fetch('menu-data.json');
        if (!menuRes.ok) throw new Error("Menu file missing");
        menuData = await menuRes.json();
        
        const photoRes = await fetch('gallery-data.json');
        if (!photoRes.ok) throw new Error("Gallery file missing");
        photosData = await photoRes.json();
        
        initializeSite();
    } catch (error) {
        console.error('Error loading JSON files:', error);
        // Use fallback data if files are missing or JSON is bad
        loadFallbackData();
    }
});

function initializeSite() {
    loadCartFromStorage();
    renderMenu(menuData);
    renderPhotos("All");
    renderPhotoNav();
    setupEventDelegation();
}

// --- FALLBACK DATA ---
function loadFallbackData() {
    // If JSON fetch fails, we use this data
    photosData = [
        { url: "comingsoon.jpg", cat: "Dishes", label: "Coming Soon", alt: "Coming Soon" },
        { url: "comingsoon.jpg", cat: "Interior", label: "Coming Soon", alt: "Coming Soon" },
        { url: "comingsoon.jpg", cat: "Dishes", label: "Coming Soon", alt: "Coming Soon" }
    ];
    
    // Note: For the menu, if the JSON fails, this list will be used.
    // If your menu is blank, ensure menu-data.json is uploaded!
    if (!menuData || menuData.length === 0) {
        menuData = [
          {
            category: "Menu Loading Error",
            items: [
              { id: 999, name: "Please check menu-data.json", desc: "Could not load menu file", price: 0.00 }
            ]
          }
        ];
    }

    initializeSite();
}

// --- LOCALSTORAGE ---
function saveCartToStorage() {
    try { localStorage.setItem('kingasian_cart', JSON.stringify(cart)); } 
    catch (e) { console.error('Error saving cart:', e); }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('kingasian_cart');
        if (savedCart) cart = JSON.parse(savedCart);
    } catch (e) { console.error('Error loading cart:', e); cart = {}; }
}

// --- EVENT DELEGATION ---
function setupEventDelegation() {
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('qty-btn')) {
                updateQty(parseInt(e.target.dataset.itemId), parseInt(e.target.dataset.change));
            }
        });
    }

    const photoNav = document.getElementById('photo-categories');
    if (photoNav) {
        photoNav.addEventListener('click', function(e) {
            if (e.target.classList.contains('photo-cat-btn')) {
                document.querySelectorAll('.photo-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderPhotos(e.target.dataset.category);
            }
        });
    }
    
    const searchBox = document.getElementById('searchBar');
    const clearBtn = document.getElementById('clearSearchBtn');
    if (searchBox) {
        searchBox.addEventListener('input', () => { triggerSearch(); updateClearButton(); });
        searchBox.addEventListener('keyup', (e) => { if(e.key === 'Enter') triggerSearch(); });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchBox.value = ''; triggerSearch(); updateClearButton(); searchBox.focus();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('checkout-modal')) closeCheckout();
    });
}

function updateClearButton() {
    const box = document.getElementById('searchBar');
    const btn = document.getElementById('clearSearchBtn');
    if(box && btn) btn.classList.toggle('visible', box.value.length > 0);
}

// --- NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button, nav a').forEach(el => el.classList.remove('active'));
    const page = document.getElementById(pageId);
    const navBtn = document.getElementById('nav-' + pageId);
    if (page) page.classList.add('active');
    if (navBtn) navBtn.classList.add('active');
    window.scrollTo(0, 0);
}

// --- MENU LOGIC ---
function renderMenu(data) {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center">Loading menu...</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(cat => {
        const header = document.createElement('div');
        header.className = 'menu-cat-header';
        header.innerHTML = `<span>${cat.category}</span>`;
        fragment.appendChild(header);

        cat.items.forEach(item => {
            const qty = cart[item.id] || 0;
            const itemDiv = document.createElement('div');
            itemDiv.className = `menu-item ${qty === 0 ? 'zero-quantity' : ''}`;
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-cat-label">${cat.category}</div>
                    <div class="item-header"><span>${item.name}</span><span class="item-price">${formatCurrency.format(item.price)}</span></div>
                    <div class="item-desc">${item.desc}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-item-id="${item.id}" data-change="1">+</button>
                    <div class="qty-display" id="qty-${item.id}">${qty}</div>
                    <button class="qty-btn" data-item-id="${item.id}" data-change="-1">-</button>
                </div>
            `;
            fragment.appendChild(itemDiv);
        });
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
    calculateTotal();
}

function updateQty(id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;
    if (cart[id] < 0) cart[id] = 0;
    
    const display = document.getElementById(`qty-${id}`);
    if (display) {
        display.innerText = cart[id];
        const itemDiv = display.closest('.menu-item');
        if (itemDiv) itemDiv.classList.toggle('zero-quantity', cart[id] === 0);
    }
    calculateTotal();
    saveCartToStorage();
}

function calculateTotal() {
    let total = 0;
    if (menuData && menuData.length > 0) {
        menuData.forEach(cat => {
            cat.items.forEach(item => {
                if (cart[item.id]) total += item.price * cart[item.id];
            });
        });
    }
    const totalEl = document.getElementById('footer-total');
    if (totalEl) totalEl.innerText = total.toFixed(2);
}

// --- SEARCH ---
function triggerSearch() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query) { renderMenu(menuData); return; }

    const filteredData = menuData.map(cat => {
        const matching = cat.items.filter(item => 
            item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
        );
        if (matching.length > 0) {
            return { category: cat.category, items: matching.map(item => ({
                ...item,
                name: item.name.replace(new RegExp(`(${escapeRegex(query)})`, 'gi'), '<span class="highlight">$1</span>'),
                desc: item.desc.replace(new RegExp(`(${escapeRegex(query)})`, 'gi'), '<span class="highlight">$1</span>')
            }))};
        }
        return null;
    }).filter(Boolean);

    renderMenu(filteredData);
}
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// --- PHOTOS ---
function renderPhotoNav() {
    const container = document.getElementById('photo-categories');
    if (!container) return;
    container.innerHTML = '';
    ["All", "Dishes", "Interior"].forEach(c => {
        const btn = document.createElement('button');
        btn.className = `photo-cat-btn ${c === 'All' ? 'active' : ''}`;
        btn.innerText = c;
        btn.dataset.category = c;
        container.appendChild(btn);
    });
}

function renderPhotos(filter) {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    grid.innerHTML = '';
    photosData.forEach(p => {
        if (filter === "All" || p.cat === filter) {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `<img src="${p.url}" alt="${p.alt}" loading="lazy"><span>${p.label}</span>`;
            grid.appendChild(card);
        }
    });
}

// --- MODAL ---
function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const listBody = document.getElementById('modal-cart-items');
    if (!modal || !listBody) return;
    
    listBody.innerHTML = '';
    let total = 0;
    let hasItems = false;

    if (menuData && menuData.length > 0) {
        menuData.forEach(cat => {
            cat.items.forEach(item => {
                if (cart[item.id] > 0) {
                    hasItems = true;
                    const lineTotal = cart[item.id] * item.price;
                    total += lineTotal;
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${item.name}</td><td>x${cart[item.id]}</td><td>${formatCurrency.format(lineTotal)}</td>`;
                    listBody.appendChild(row);
                }
            });
        });
    }

    if (!hasItems) listBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">${TEXT_CONTENT.messages.emptyCart}</td></tr>`;
    
    document.getElementById('modal-total').innerText = total.toFixed(2);
    modal.style.display = 'flex';
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'none';
}

// Global exports
window.showPage = showPage;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.updateQty = updateQty;
window.triggerSearch = triggerSearch;t.classList.contains('photo-cat-btn')) {
                document.querySelectorAll('.photo-cat-btn')
