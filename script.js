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
                    <td>x${q}</td>
                    <td>${formatCurrency.format(lineTotal)}</td>
                `;
                fragment.appendChild(row);
            }
        });
    });

    if (!hasItems) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" style="text-align:center; padding:20px;">${TEXT_CONTENT.messages.emptyCart}</td>`;
        fragment.appendChild(row);
    }

    listBody.appendChild(fragment);

    const modalTotal = document.getElementById('modal-total');
    if (modalTotal) {
        modalTotal.innerText = total.toFixed(2);
    }
    
    modal.style.display = 'flex';
    
    // Set focus to close button for accessibility
    const closeBtn = modal.querySelector('.close-modal-x');
    if (closeBtn) {
        setTimeout(() => closeBtn.focus(), 100);
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions available globally for inline onclick handlers (backwards compatibility)
window.showPage = showPage;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.updateQty = updateQty;
window.triggerSearch = triggerSearch;
