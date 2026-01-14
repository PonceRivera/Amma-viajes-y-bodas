import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-reservation-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reservation-modal.component.html',
    styleUrl: './reservation-modal.component.css'
})
export class ReservationModalComponent {
    @Input() packageInfo: any;
    @Output() close = new EventEmitter<void>();

    customerName: string = '';
    customerEmail: string = '';
    cardNumber: string = '';
    cardExpiry: string = '';
    cardCvv: string = '';

    isSubmitting: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService) { }

    onSubmit() {
        this.isSubmitting = true;
        this.errorMessage = '';

        const reservationData = {
            packageName: this.packageInfo.name,
            packagePrice: this.packageInfo.price,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            cardLast4: this.cardNumber.slice(-4),
            status: 'pending'
        };

        this.authService.createReservation(reservationData).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.successMessage = '¡Reserva completada con éxito!';
                setTimeout(() => {
                    this.close.emit();
                }, 2000);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = 'Hubo un error al procesar tu reserva. Intenta de nuevo.';
                console.error(err);
            }
        });
    }

    onClose() {
        this.close.emit();
    }
}
