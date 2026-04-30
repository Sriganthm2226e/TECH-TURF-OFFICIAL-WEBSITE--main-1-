// Newsletter Subscription Widget
// Add this to layout.js or as a separate component

class NewsletterWidget {
    constructor() {
        this.init();
    }

    init() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const newsletterHTML = `
            <div class="newsletter-section bg-gradient-to-r from-[#0B3C8C] to-[#F26522] py-12 px-4 rounded-2xl my-8">
                <div class="max-w-4xl mx-auto text-center">
                    <h3 class="text-3xl font-bold text-white mb-4">
                        <i data-lucide="mail" class="inline w-8 h-8 mr-2"></i>
                        Stay Updated
                    </h3>
                    <p class="text-white/80 mb-6">
                        Subscribe to our newsletter for exclusive updates, new product launches, and special offers.
                    </p>
                    <form id="newsletter-form" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input 
                            type="email" 
                            id="newsletter-email" 
                            placeholder="Enter your email" 
                            required
                            class="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                        <button 
                            type="submit" 
                            class="px-8 py-3 bg-white text-[#0B3C8C] font-bold rounded-lg hover:bg-gray-100 transition-all"
                        >
                            Subscribe
                        </button>
                    </form>
                    <div id="newsletter-message" class="mt-4 text-sm"></div>
                    <div class="mt-6 flex justify-center gap-4 text-sm text-white/60">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" checked class="rounded">
                            <span>Product Updates</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" checked class="rounded">
                            <span>Promotions</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Insert before footer content
        const footerContent = footer.querySelector('.max-w-7xl') || footer;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newsletterHTML;
        footerContent.insertBefore(tempDiv.firstElementChild, footerContent.firstChild);

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Add event listener
        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubscribe();
        });
    }

    async handleSubscribe() {
        const emailInput = document.getElementById('newsletter-email');
        const messageDiv = document.getElementById('newsletter-message');
        const email = emailInput.value.trim();

        if (!email) {
            this.showMessage('Please enter a valid email', 'error');
            return;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    preferences: {
                        productUpdates: true,
                        promotions: true,
                        newsletter: true
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('✅ Successfully subscribed! Check your email.', 'success');
                emailInput.value = '';
            } else {
                this.showMessage(data.message || 'Subscription failed', 'error');
            }
        } catch (error) {
            console.error('Newsletter error:', error);
            this.showMessage('An error occurred. Please try again.', 'error');
        }
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('newsletter-message');
        if (!messageDiv) return;

        messageDiv.textContent = text;
        messageDiv.className = `mt-4 text-sm ${type === 'success' ? 'text-green-300' : 'text-red-300'}`;

        setTimeout(() => {
            messageDiv.textContent = '';
        }, 5000);
    }
}

// Initialize newsletter widget when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NewsletterWidget();
    });
} else {
    new NewsletterWidget();
}

export default NewsletterWidget;
