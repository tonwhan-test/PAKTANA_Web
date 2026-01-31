window.HeroSlider = {
    currentSlide: 0,
    slideInterval: null,
    touchStartX: 0,
    touchEndX: 0,

    init() {
        this.resetSlideInterval();
        this.setupTouchListeners();
    },

    setupTouchListeners() {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture();
        }, { passive: true });
    },

    handleSwipeGesture() {
        const swipeThreshold = 50;
        if (this.touchEndX < this.touchStartX - swipeThreshold) {
            this.changeSlide(1); // Swipe Left -> Next
        } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
            this.changeSlide(-1); // Swipe Right -> Prev
        }
        // Reset
        this.touchStartX = 0;
        this.touchEndX = 0;
    },

    showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const track = document.getElementById('sliderTrack');

        if (slides.length === 0 || !track) return;

        // Calculate index
        this.currentSlide = (n + slides.length) % slides.length;

        // Update dots
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === this.currentSlide);
        });

        // Apply Sliding Effect
        track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
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
