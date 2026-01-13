import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

declare var $: any;

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    host: { 'ngSkipHydration': 'true' }
})
export class HomeComponent implements AfterViewInit {

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public authService: AuthService
    ) { }

    get user() {
        if (isPlatformBrowser(this.platformId)) {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }

    logout() {
        this.authService.logout();
        if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
        }
    }

    ngAfterViewInit() {
        // Only run in browser, not during SSR
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        // Check if jQuery is available
        if (typeof $ === 'undefined') {
            return;
        }

        // Manually hide preloader if it's stuck
        setTimeout(() => {
            $('#siteLoader').fadeOut(500);
        }, 1000);

        // Initialize Slick Slider with a small delay to ensure Angular has finished rendering
        setTimeout(() => {
            if ($('.home-slider').length > 0) {
                // Remove slick-initialized class if it already exists to avoid re-init issues
                if ($('.home-slider').hasClass('slick-initialized')) {
                    $('.home-slider').slick('unslick');
                }

                $('.home-slider').slick({
                    dots: true,
                    infinite: true,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    speed: 1200,
                    fade: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    adaptiveHeight: false,
                    arrows: true
                });
            }

            // Initialize SlickNav
            if ($.fn.slicknav && $('#navigation').length > 0) {
                $('#navigation').slicknav({
                    duration: 500,
                    closedSymbol: '<i class="fas fa-plus"></i>',
                    openedSymbol: '<i class="fas fa-minus"></i>',
                    prependTo: '.mobile-menu-container',
                    allowParentLinks: true,
                    nestedParentLinks: false,
                    label: 'Menu',
                    closeOnClick: true
                });
            }
        }, 500);
    }
}
