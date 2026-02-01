window.Modals = {
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('overflow-hidden');

            // Reset scroll position of modal content
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.scrollTop = 0;
            }
        }
    },
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
        }
    }
};
window.openModal = (id) => window.Modals.openModal(id);
window.closeModal = (id) => window.Modals.closeModal(id);
