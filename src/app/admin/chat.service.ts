import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: any = null;

  connect() {
    const token = localStorage.getItem('token');
    this.socket = io('/', { auth: { token } });
  }

  sendMessage(payload: { to: string; text: string }) {
    this.socket?.emit('private_message', payload);
  }

  onMessage(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket?.on('private_message', (msg: any) => subscriber.next(msg));
    });
  }
}
