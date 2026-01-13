import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var $: any;
declare var FB: any;

@Component({
  selector: 'app-blog',
  imports: [RouterModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
  standalone: true
})
export class Blog implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    // Only run in browser, not during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Initialize SlickNav for mobile menu only if jQuery is available
    if (typeof $ !== 'undefined' && $.fn && $.fn.slicknav && $('#navigation').length > 0) {
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

    // Initialize Facebook SDK
    this.loadFacebookSDK();
  }

  loadFacebookSDK() {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if FB SDK is already loaded
    if (typeof FB !== 'undefined') {
      FB.XFBML.parse();
      return;
    }

    // Load Facebook SDK
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0';

    script.onload = () => {
      if (typeof FB !== 'undefined') {
        FB.XFBML.parse();
      }
    };

    document.body.appendChild(script);
  }
}
