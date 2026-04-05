// Fade in animation on scroll
const fadeElements = document.querySelectorAll('.fade-in');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeElements.forEach(el => {
    observer.observe(el);
});

// Trigger first hero animation items immediately
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('visible');
    }, 100);
});

// Navigation & Cart interaction logic
const cartBtn = document.getElementById('cart-btn');
const accountBtn = document.getElementById('account-btn');
const searchBtn = document.getElementById('search-btn');
const cartDropdown = document.getElementById('cart-dropdown');
const closeCartBtn = document.getElementById('close-cart');
const cartBadge = document.getElementById('cart-badge');
const cartPriceDisplay = document.getElementById('cart-price');
const cartDropdownTitle = document.getElementById('cart-dropdown-title');
const addToCartBtns = document.querySelectorAll('.btn-add');

const emptyCartState = document.getElementById('empty-cart-state');
const filledCartState = document.getElementById('filled-cart-state');
const cartItemsList = document.getElementById('cart-items-list');
const cartSubtotal = document.getElementById('cart-subtotal');

const searchInput = document.getElementById('search-input');

let cart = [];

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update Header & Badge
    cartBadge.textContent = totalCount;
    cartDropdownTitle.textContent = `Sepetim (${totalCount} Ürün)`;
    const formattedPrice = new Intl.NumberFormat('tr-TR').format(totalPrice);
    cartPriceDisplay.textContent = `₺ ${formattedPrice},00`;
    cartSubtotal.textContent = `₺ ${formattedPrice},00`;
    
    // Toggle States
    if (totalCount > 0) {
        emptyCartState.style.display = 'none';
        filledCartState.style.display = 'flex';
        renderCartItems();
    } else {
        emptyCartState.style.display = 'flex';
        filledCartState.style.display = 'none';
    }
}

function renderCartItems() {
    cartItemsList.innerHTML = '';
    cart.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">₺ ${new Intl.NumberFormat('tr-TR').format(item.price)},00</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-btns">
                        <button class="qty-btn minus" data-index="${index}">−</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item" data-index="${index}" aria-label="Ürünü Sil">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `;
        cartItemsList.appendChild(itemEl);
    });
}

// Add to Cart
addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.product-card');
        const name = card.querySelector('.product-title').textContent;
        const priceStr = card.querySelector('.price').textContent;
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
        const image = card.querySelector('img').src;
        
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        
        updateCartUI();
        
        // Open dropdown for feedback
        cartBtn.classList.add('active');
        
        // Success animation
        const originalText = btn.textContent;
        btn.textContent = 'Eklendi!';
        btn.style.backgroundColor = '#4bb543';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    });
});

// Item controls (delegation)
if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const index = parseInt(btn.dataset.index);
        
        if (btn.classList.contains('plus')) {
            cart[index].quantity++;
        } else if (btn.classList.contains('minus')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
        } else if (btn.classList.contains('remove-item')) {
            cart.splice(index, 1);
        }
        
        updateCartUI();
    });
}

// Toggle Dropdowns Logic
if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartBtn.classList.toggle('active');
        if (accountBtn) accountBtn.classList.remove('active');
        if (searchBtn) searchBtn.classList.remove('active');
    });
}

if (closeCartBtn) {
    closeCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartBtn.classList.remove('active');
    });
}

if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountBtn.classList.toggle('active');
        if (cartBtn) cartBtn.classList.remove('active');
    });
}

// Inline Search Expansion / Swap Logic
const searchInputInline = document.getElementById('search-input-inline');
const headerActions = document.querySelector('.header-actions');
const closeInlineSearch = document.getElementById('close-inline-search');

if (searchBtn && searchInputInline && headerActions) {
    const toggleBtn = searchBtn.querySelector('.search-toggle-btn');
    
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerActions.classList.add('search-mode-active');
        
        // Close other dropdowns
        if (cartBtn) cartBtn.classList.remove('active');
        if (accountBtn) accountBtn.classList.remove('active');
        
        setTimeout(() => {
            searchInputInline.focus();
        }, 400);
    });

    if (closeInlineSearch) {
        closeInlineSearch.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActions.classList.remove('search-mode-active');
        });
    }

    searchInputInline.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Global click to close dropdowns
window.addEventListener('click', (e) => {
    if (cartBtn && !cartBtn.contains(e.target)) cartBtn.classList.remove('active');
    if (accountBtn && !accountBtn.contains(e.target)) accountBtn.classList.remove('active');
    if (headerActions && !headerActions.contains(e.target)) headerActions.classList.remove('search-mode-active');
});

// Key listeners for UX
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (headerActions) headerActions.classList.remove('search-mode-active');
        if (cartBtn) cartBtn.classList.remove('active');
        if (accountBtn) accountBtn.classList.remove('active');
    }
});

// Key listeners for UX
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
        if (cartBtn) cartBtn.classList.remove('active');
        if (accountBtn) accountBtn.classList.remove('active');
    }
});

// Testimonials Slider Logic
const tReviews = [
    {
        text: "Eskiden masamızda uzun süre oturamıyorduk. Sandalyeleri aldıktan sonra misafirlerimizle geçirdiğimiz saatler iki katına çıktı. Eşsiz bir konfor.",
        initials: "EK",
        name: "Elif K.",
        title: "İç Mimar"
    },
    {
        text: "Kalitesi fotoğraflardan bile belli oluyordu ancak ürün eve geldiğinde işçiliğin bu kadar kusursuz olabileceğini tahmin etmemiştim. Lüks dokunuş muazzam.",
        initials: "AB",
        name: "Ahmet B.",
        title: "İş İnsanı"
    },
    {
        text: "Ofisimiz için Leto modelinden sipariş verdik. Hem çok şık duruyor hem de tüm gün masa başında çalışan ekibin duruş bozukluklarına adeta çare oldu.",
        initials: "CB",
        name: "Can B.",
        title: "Şirket Yöneticisi"
    },
    {
        text: "Teslimat sürecindeki profesyonellik baştan başa harikaydı. Özel kırmızı kumaş seçimimizde çok yardımcı oldular, salonumuzun havası tamamen değişti.",
        initials: "SY",
        name: "Selin Y.",
        title: "VIP Müşteri"
    },
    {
        text: "Hem yemek hem de bar sandalyelerini komple Tunçay'dan dizdik. Gelen herkes markasını soruyor, kumaş kalitesi inanılmaz.",
        initials: "MA",
        name: "Murat A.",
        title: "Villa Sahibi"
    }
];

const tCard1 = document.querySelector('.t-card-1');
const tCard2 = document.querySelector('.t-card-2');
const btnPrev = document.getElementById('t-prev');
const btnNext = document.getElementById('t-next');

let tCurrentIndex = 0;

function updateTestimonials(direction = 'next') {
    if (!tCard1 || !tCard2) return;
    
    // Choose classes based on direction
    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const prepClass = direction === 'next' ? 'slide-in-prep-right' : 'slide-in-prep-left';
    
    // 1. Animate out
    tCard1.classList.add(outClass);
    tCard2.classList.add(outClass);
    
    setTimeout(() => {
        // 2. Change Text Data while hidden
        let index1 = tCurrentIndex;
        let index2 = (tCurrentIndex + 1) % tReviews.length;
        
        tCard1.querySelector('.review-text').textContent = `"${tReviews[index1].text}"`;
        tCard1.querySelector('.r-avatar').textContent = tReviews[index1].initials;
        tCard1.querySelector('.r-details strong').textContent = tReviews[index1].name;
        tCard1.querySelector('.r-details span').textContent = tReviews[index1].title;
        
        tCard2.querySelector('.review-text').textContent = `"${tReviews[index2].text}"`;
        tCard2.querySelector('.r-avatar').textContent = tReviews[index2].initials;
        tCard2.querySelector('.r-details strong').textContent = tReviews[index2].name;
        tCard2.querySelector('.r-details span').textContent = tReviews[index2].title;
        
        // 3. Temporarily teleport to the opposite side to slide in from
        tCard1.classList.remove(outClass);
        tCard2.classList.remove(outClass);
        
        tCard1.classList.add(prepClass);
        tCard2.classList.add(prepClass);
        
        // Force reflow so the browser registers the prep position
        void tCard1.offsetWidth;
        
        // 4. Remove prep class to trigger transition (Slide In)
        tCard1.classList.remove(prepClass);
        tCard2.classList.remove(prepClass);
    }, 450); // Matches CSS transition duration
}

if (btnNext) {
    btnNext.addEventListener('click', () => {
        tCurrentIndex = (tCurrentIndex + 1) % tReviews.length;
        updateTestimonials('next');
    });
}

if (btnPrev) {
    btnPrev.addEventListener('click', () => {
        tCurrentIndex = (tCurrentIndex - 1 + tReviews.length) % tReviews.length;
        updateTestimonials('prev');
    });
}

// Favorites Section Carousel (Manual + Auto)
const favTrack = document.getElementById('fav-track');
const favPrev = document.getElementById('fav-prev');
const favNext = document.getElementById('fav-next');
const favDots = document.querySelectorAll('.fav-dot');

let favCurrentIndex = 0;
let favAutoInterval;

function updateFavSlider(index) {
    if (!favTrack) return;
    favCurrentIndex = index;
    
    // Slide to the correct page (-33.333% for page 2, -66.666% for page 3)
    favTrack.style.transform = `translateX(-${favCurrentIndex * 33.333}%)`;
    
    // Update dots
    favDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === favCurrentIndex);
    });
}

function startFavAutoSlide() {
    stopFavAutoSlide(); // Clear any existing
    favAutoInterval = setInterval(() => {
        favCurrentIndex = (favCurrentIndex + 1) % 3; // Toggle between 0, 1, 2
        updateFavSlider(favCurrentIndex);
    }, 5000);
}

function stopFavAutoSlide() {
    clearInterval(favAutoInterval);
}

if (favTrack) {
    // Initial start
    startFavAutoSlide();

    // Next Button
    favNext.addEventListener('click', () => {
        stopFavAutoSlide();
        favCurrentIndex = (favCurrentIndex + 1) % 3;
        updateFavSlider(favCurrentIndex);
        startFavAutoSlide(); // Restart timer after manual click
    });

    // Prev Button
    favPrev.addEventListener('click', () => {
        stopFavAutoSlide();
        favCurrentIndex = (favCurrentIndex - 1 + 3) % 3;
        updateFavSlider(favCurrentIndex);
        startFavAutoSlide();
    });

    // Pagination Dots
    favDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            stopFavAutoSlide();
            updateFavSlider(idx);
            startFavAutoSlide();
        });
    });
}

// ==========================================
// 360 Degree Interactive Chair Viewer
// ==========================================
const chairSection = document.getElementById('chair-360-view');
const canvas = document.getElementById('chair-canvas');
if (chairSection && canvas) {
    const context = canvas.getContext('2d');
    const frameCount = 52;
    const images = [];
    let imagesLoaded = 0;
    
    const loadingOverlay = document.getElementById('loading-360');
    const loadingSpan = loadingOverlay ? loadingOverlay.querySelector('span') : null;

    // Helper to format frame numbers like 01, 02... 52
    const currentFrame = index => (
        `360 derece sandalye/Keynote-Black-${index.toString().padStart(2, '0')}.jpg`
    );

    // Preload all 52 images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            if(loadingSpan) {
                loadingSpan.textContent = `Yüksek Çözünürlüklü Model Yükleniyor (%${Math.floor((imagesLoaded/frameCount)*100)})...`;
            }
            if (imagesLoaded === frameCount) {
                // All loaded
                if(loadingOverlay) loadingOverlay.style.display = 'none';
                
                // Dynamically set canvas native resolution to match the exact size of the photo 
                // This prevents the "squished" (basık) look!
                canvas.width = images[0].naturalWidth;
                canvas.height = images[0].naturalHeight;
                
                // Draw initial frame (Frame 1)
                context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
            }
        };
        img.src = currentFrame(i);
        images.push(img);
    }

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        const sectionTop = chairSection.offsetTop;
        const sectionHeight = chairSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        let scrollFraction = (scrollTop - sectionTop) / (sectionHeight - windowHeight);
        
        // Clamp fraction between 0 and 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));
        
        // Calculate the target frame index (0 to 51)
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        // Use requestAnimationFrame for smooth drawing
        requestAnimationFrame(() => {
            if (images[frameIndex] && images[frameIndex].complete) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
            }
            
            // Update the scroll progress indicator thumb
            const progressThumb = document.getElementById('progress-thumb');
            if (progressThumb) {
                progressThumb.style.top = `${scrollFraction * 100}%`;
            }
        });
    });
}

