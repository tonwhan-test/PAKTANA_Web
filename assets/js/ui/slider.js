window.HeroSlider = {
    currentSlide: 0,
    slideInterval: null,
    touchStartX: 0,
    touchEndX: 0,

    listenersSet: false,

    init() {
        this.currentSlide = 0; // Reset to first slide
        this.resetSlideInterval();
        this.setupTouchListeners();
        this.showSlide(0); // Ensure first slide is shown
    },

    reset() {
        // Clear any existing interval
        clearInterval(this.slideInterval);
        // Reset to first slide
        this.currentSlide = 0;
        // Re-initialize
        this.init();
    },

    setupTouchListeners() {
        if (this.listenersSet) return; // Prevent multiple listeners

        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipeGesture();
        }, { passive: true });

        this.listenersSet = true;
    },

    handleSwipeGesture() {
        const swipeThreshold = 40; // Slightly more sensitive
        const deltaX = this.touchEndX - this.touchStartX;

        if (deltaX < -swipeThreshold) {
            // Swipe Left (<-) -> Show Next
            this.changeSlide(1);
        } else if (deltaX > swipeThreshold) {
            // Swipe Right (->) -> Show Previous
            this.changeSlide(-1);
        }

        // Reset values
        this.touchStartX = 0;
        this.touchEndX = 0;
    },

    showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const track = document.getElementById('sliderTrack');

        if (slides.length === 0 || !track) return;

        // Calculate index (True modulo for infinite loop in both directions)
        this.currentSlide = ((n % slides.length) + slides.length) % slides.length;

        // Update dots
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === this.currentSlide);
        });

        // Apply Fade Effect (Toggle active class)
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === this.currentSlide);
        });
    },

    changeSlide(direction) {
        this.showSlide(this.currentSlide + direction);
        this.resetSlideInterval();
    },

    goToSlide(n) {
        this.showSlide(n);
        this.resetSlideInterval();
    },

    resetSlideInterval() {
        clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => this.changeSlide(1), 5000);
    }
};

window.changeSlide = (dir) => window.HeroSlider.changeSlide(dir);
window.goToSlide = (n) => window.HeroSlider.goToSlide(n);
