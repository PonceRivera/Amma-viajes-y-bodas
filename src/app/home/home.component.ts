import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ReservationModalComponent } from '../reservation-modal/reservation-modal.component';

declare var $: any;

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, ReservationModalComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    host: { 'ngSkipHydration': 'true' }
})
export class HomeComponent implements AfterViewInit {

    isModalOpen: boolean = false;
    selectedPackage: any = null; // Used for the modal

    // New Explorer State
    currentCategory: string | null = null;
    currentSubCategory: string | null = null;
    selectedDestination: any = null; // Step 2: Selected Destination
    selectedHotelPackage: any = null; // Step 3: Selected Hotel Package

    explorerData: any = {
        familiar: {
            label: 'Viaje Familiar',
            subCategories: {
                nacional: {
                    label: 'Nacional',
                    destinations: [
                        {
                            name: 'Cancún',
                            image: 'assets/images/img1.jpg',
                            packages: [
                                {
                                    id: 'c1',
                                    name: 'Grand Oasis Cancún',
                                    price: '$12,500',
                                    image: 'assets/images/img2.jpg',
                                    description: 'Disfruta de una experiencia todo incluido frente al mar Caribe. Ideal para familias, con parque acuático y shows nocturnos.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 4D/3N', 'Alimentos y Bebidas Ilimitados', 'Traslados Aeropuerto-Hotel']
                                },
                                {
                                    id: 'c2',
                                    name: 'Hotel Xcaret México',
                                    price: '$25,000',
                                    image: 'assets/images/img3.jpg',
                                    description: 'La mejor experiencia All-Fun Inclusive. Acceso ilimitado a todos los parques de Grupo Xcaret.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 5D/4N', 'Acceso a Parques Xcaret', 'Gastronomía Premium']
                                },
                                {
                                    id: 'c3',
                                    name: 'Riu Caribe',
                                    price: '$15,800',
                                    image: 'assets/images/img4.jpg',
                                    description: 'Diversión garantizada con actividades diarias y una playa espectacular.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 4D/3N', 'Plan Todo Incluido', 'Deportes Acuáticos']
                                }
                            ]
                        },
                        {
                            name: 'Puerto Vallarta',
                            image: 'assets/images/img2.jpg',
                            packages: [
                                {
                                    id: 'pv1',
                                    name: 'Sheraton Buganvilias',
                                    price: '$11,200',
                                    image: 'assets/images/img5.jpg',
                                    description: 'Ubicación privilegiada cerca del malecón y servicios de primera clase.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 4D/3N', 'Desayuno Buffet', 'Vista al Mar']
                                },
                                {
                                    id: 'pv2',
                                    name: 'Velas Vallarta',
                                    price: '$18,500',
                                    image: 'assets/images/img6.jpg',
                                    description: 'Lujo y confort en una de las zonas más exclusivas de Vallarta.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 5D/4N', 'Todo Incluido de Lujo', 'Spa Credit']
                                }
                            ]
                        },
                        {
                            name: 'Mazatlán',
                            image: 'assets/images/img3.jpg',
                            packages: [
                                {
                                    id: 'mz1',
                                    name: 'El Cid Castilla',
                                    price: '$9,800',
                                    image: 'assets/images/img1.jpg',
                                    description: 'Tradición y diversión en la Zona Dorada de Mazatlán.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 4D/3N', 'Plan Todo Incluido', 'Actividades en Alberca']
                                },
                                {
                                    id: 'mz2',
                                    name: 'Pueblo Bonito Emerald Bay',
                                    price: '$14,500',
                                    image: 'assets/images/img2.jpg',
                                    description: 'Elegancia neoclásica y una playa privada exclusiva.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 5D/4N', 'Suite Junior', 'Cena Romántica']
                                }
                            ]
                        },
                        {
                            name: 'Los Cabos',
                            image: 'assets/images/img4.jpg',
                            packages: [
                                {
                                    id: 'lc1',
                                    name: 'Riu Santa Fe',
                                    price: '$16,000',
                                    image: 'assets/images/img3.jpg',
                                    description: 'Fiesta y diversión con vista al famoso Arco de Los Cabos.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 4D/3N', 'Riu Party', 'Snacks 24/7']
                                }
                            ]
                        },
                        {
                            name: 'Otro destino',
                            image: 'assets/images/img5.jpg',
                            packages: [
                                {
                                    id: 'od1',
                                    name: 'Paquete Sorpresa',
                                    price: '$10,000',
                                    image: 'assets/images/img4.jpg',
                                    description: 'Descubre un destino mágico con nuestra selección especial.',
                                    includes: ['Vuelos Redondos', 'Hospedaje 3D/2N', 'Tour Sorpresa']
                                }
                            ]
                        }
                    ]
                },
                internacional: {
                    label: 'Internacional',
                    destinations: [
                        {
                            name: 'Asia',
                            image: 'assets/images/img6.jpg',
                            packages: [
                                { id: 'as1', name: 'Tour Tailandia Mágico', price: '$45,000', image: 'assets/images/img1.jpg', description: 'Visita Bangkok, Chiang Mai y las playas de Phuket.', includes: ['Vuelos Internacionales', 'Hospedaje 10D/9N', 'Desayunos', 'Guía en Español'] }
                            ]
                        },
                        {
                            name: 'África',
                            image: 'assets/images/img1.jpg',
                            packages: [
                                { id: 'af1', name: 'Safari en Kenia', price: '$55,000', image: 'assets/images/img2.jpg', description: 'Vive la aventura de un safari fotográfico en Masai Mara.', includes: ['Vuelos con Escala', 'Hospedaje en Lodge', 'Safari Guiado', 'Todas las Comidas'] }
                            ]
                        },
                        {
                            name: 'Europa',
                            image: 'assets/images/img2.jpg',
                            packages: [
                                { id: 'eu1', name: 'Eurotrip Clásico', price: '$38,000', image: 'assets/images/img3.jpg', description: 'Madrid, París, Roma y Londres en un solo viaje.', includes: ['Vuelos Multidestino', 'Hospedaje 15D/14N', 'Desayunos', 'Traslados en Tren'] }
                            ]
                        }
                    ]
                }
            }
        },
        bodas: {
            label: 'Bodas',
            subCategories: {
                general: {
                    label: 'Destinos de Boda',
                    destinations: [
                        {
                            name: 'Cancún',
                            image: 'assets/images/img3.jpg',
                            packages: [
                                { id: 'bc1', name: 'Boda de Ensueño Cancún', price: '$80,000', image: 'assets/images/img4.jpg', description: 'Paquete completo para 30 invitados frente al mar.', includes: ['Ceremonia Simbólica', 'Banquete Privado', 'Decoración Floral', 'Pastel de Boda'] }
                            ]
                        },
                        {
                            name: 'Riviera Maya',
                            image: 'assets/images/img4.jpg',
                            packages: [
                                { id: 'br1', name: 'Boda Maya Mística', price: '$95,000', image: 'assets/images/img5.jpg', description: 'Ceremonia espiritual en un cenote privado.', includes: ['Ceremonia Maya', 'Montaje Especial', 'Cena Gourmet', 'Música en Vivo'] }
                            ]
                        },
                        {
                            name: 'Mazatlán',
                            image: 'assets/images/img5.jpg',
                            packages: [
                                { id: 'bm1', name: 'Atardecer en Mazatlán', price: '$65,000', image: 'assets/images/img6.jpg', description: 'Celebra tu unión con la mejor puesta de sol del Pacífico.', includes: ['Coordinador de Bodas', 'Montaje en Playa', 'Barra Libre 4 hrs', 'DJ'] }
                            ]
                        },
                        {
                            name: 'Vallarta',
                            image: 'assets/images/img6.jpg',
                            packages: [
                                { id: 'bv1', name: 'Romance en Vallarta', price: '$75,000', image: 'assets/images/img1.jpg', description: 'Elegancia y naturaleza se unen para tu gran día.', includes: ['Gazebo Decorado', 'Ramo de Novia', 'Cena de 3 Tiempos', 'Habitación Nupcial'] }
                            ]
                        }
                    ]
                }
            }
        }
    };

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check if we have a token in the URL (from logic in server.ts or redirect)
        // ... rest of ngOnInit
    }

    selectCategory(cat: string) {
        this.currentCategory = cat;
        this.currentSubCategory = null; // Reset sub
        this.clearSelection(); // Reset destination/package selection
        if (cat === 'bodas') {
            this.currentSubCategory = 'general';
        }
    }

    selectSubCategory(subId: string) {
        this.currentSubCategory = subId;
        this.clearSelection();
    }

    // Step 2: Select a Destination to see its packages
    selectDestination(dest: any) {
        this.selectedDestination = dest;
        this.selectedHotelPackage = null; // Ensure no package is selected
    }

    // Step 3: Select a Package to see details
    selectPackage(pkg: any) {
        this.selectedHotelPackage = pkg;
    }

    // Navigation Back
    clearSelection() {
        if (this.selectedHotelPackage) {
            this.selectedHotelPackage = null; // Go back to package list
        } else {
            this.selectedDestination = null; // Go back to destination list
        }
    }

    get currentDestinations() {
        if (!this.currentCategory || !this.currentSubCategory) return [];
        return this.explorerData[this.currentCategory].subCategories[this.currentSubCategory].destinations;
    }

    openReservationModal(packageName: string, packagePrice: string) {
        this.selectedPackage = { name: packageName, price: packagePrice };
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.selectedPackage = null;
    }

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
