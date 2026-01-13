import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  me: any = null;
  messages: any[] = [];
  receipts: any[] = [];
  newMessage = '';
  activeTab = 'chat'; // 'chat' | 'receipts'

  newReceipt = {
    clientName: '',
    clientEmail: '',
    items: [{ description: '', amount: 0 }],
    currency: 'MXN'
  };

  constructor(private admin: AdminService, private chat: ChatService) { }

  async ngOnInit() {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      history.replaceState({}, '', window.location.pathname);
    }
    this.me = await this.admin.me();
    this.messages = (await this.admin.getMessages()) || [];
    this.receipts = await this.admin.getReceipts();

    this.chat.connect();
    this.chat.onMessage().subscribe((m) => this.messages.push(m));
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  send() {
    const to = this.messages.length ? this.messages[0].to || this.me._id : this.me._id;
    this.chat.sendMessage({ to, text: this.newMessage });
    this.newMessage = '';
  }

  addItem() {
    this.newReceipt.items.push({ description: '', amount: 0 });
  }

  removeItem(index: number) {
    this.newReceipt.items.splice(index, 1);
  }

  async createReceipt() {
    if (!this.newReceipt.clientName || !this.newReceipt.clientEmail) return;
    await this.admin.createReceipt(this.newReceipt);
    this.receipts = await this.admin.getReceipts();
    this.newReceipt = { clientName: '', clientEmail: '', items: [{ description: '', amount: 0 }], currency: 'MXN' };
  }

  downloadPdf(id: string) {
    this.admin.downloadPdf(id);
  }

  logout() {
    this.admin.logout();
  }
}
