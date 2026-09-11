/**
 * Lightweight, zero-dependency Socket.IO v4 WebSocket Client
 * Specifically tuned for MessPro real-time dining & attendance events.
 */

type SocketEventListener = (data: any) => void;

class AppSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<SocketEventListener>> = new Map();
  private pingTimeoutTimer: any = null;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private isExplicitlyClosed = false;
  private currentToken: string | null = null;
  public isConnected = false;

  private getSocketUrl(token: string): string {
    const rawUrl = import.meta.env.VITE_SOCKET_URL || 'https://messpro.duckdns.org';
    const cleanUrl = rawUrl.replace(/\/$/, '');
    const wsProto = cleanUrl.startsWith('https') ? 'wss' : 'ws';
    const host = cleanUrl.replace(/^https?:\/\//, '');
    return `${wsProto}://${host}/socket.io/?EIO=4&transport=websocket&token=${encodeURIComponent(token)}`;
  }

  public connect(tokenOverride?: string): void {
    if (typeof window === 'undefined') return;

    const token =
      tokenOverride ||
      localStorage.getItem('token') ||
      '';

    if (!token) {
      this.disconnect();
      return;
    }

    // If already connected or currently connecting with identical token, do not recreate
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) &&
      this.currentToken === token
    ) {
      return;
    }

    this.disconnect();
    this.isExplicitlyClosed = false;
    this.currentToken = token;

    try {
      const url = this.getSocketUrl(token);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('🔌 WebSocket connection error:', err);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.warn('🔌 Error creating WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  private handleMessage(raw: any): void {
    if (typeof raw !== 'string') return;

    // 0: Engine.IO Open Handshake packet
    if (raw.startsWith('0')) {
      try {
        const handshake = JSON.parse(raw.slice(1));
        const pingInterval = handshake.pingInterval || 25000;
        this.resetPingWatchdog(pingInterval + 10000);
        // Send Socket.IO connect packet with auth token
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(`40{"token":"${this.currentToken || ''}"}`);
        }
      } catch (e) {
        console.warn('Failed parsing handshake', e);
      }
      return;
    }

    // 40: Socket.IO connected
    if (raw.startsWith('40')) {
      this.isConnected = true;
      this.emitInternal('connect', null);
      return;
    }

    // 2: Engine.IO Ping from server -> reply with 3 (Pong)
    if (raw === '2') {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('3');
      }
      return;
    }

    // 3: Pong
    if (raw === '3') {
      return;
    }

    // 42: Socket.IO Event Packet -> 42["eventName", payload]
    if (raw.startsWith('42')) {
      try {
        const payloadStr = raw.slice(2);
        const parsed = JSON.parse(payloadStr);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          const [eventName, eventData] = parsed;
          this.emitInternal(eventName, eventData);
        }
      } catch (err) {
        console.warn('Failed parsing Socket.IO message:', raw, err);
      }
      return;
    }

    // 41: Socket.IO Disconnect
    if (raw.startsWith('41')) {
      this.isConnected = false;
      this.emitInternal('disconnect', null);
    }
  }

  private resetPingWatchdog(timeoutMs: number): void {
    clearTimeout(this.pingTimeoutTimer);
    this.pingTimeoutTimer = setTimeout(() => {
      // If no ping received in time, force reconnect
      if (this.ws) {
        this.ws.close();
      }
    }, timeoutMs);
  }

  private scheduleReconnect(): void {
    clearTimeout(this.reconnectTimer);
    if (this.isExplicitlyClosed) return;

    // Exponential backoff up to 10 seconds
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentToken || undefined);
    }, delay);
  }

  public on(event: string, callback: SocketEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unbind function
    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: SocketEventListener): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emitInternal(event: string, data: any): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for ${event}:`, e);
        }
      });
    }
  }

  public emit(event: string, data?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const packet = data !== undefined ? `42${JSON.stringify([event, data])}` : `42${JSON.stringify([event])}`;
      this.ws.send(packet);
    } else {
      console.warn(`Cannot emit '${event}': WebSocket is not open.`);
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.isConnected = false;
    clearTimeout(this.pingTimeoutTimer);
    clearTimeout(this.reconnectTimer);

    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.OPEN) {
        socket.onopen = null;
        socket.close();
      } else if (socket.readyState === WebSocket.CONNECTING) {
        // Prevent browser error: wait for open before closing cleanly
        socket.onopen = () => {
          try {
            socket.close();
          } catch {}
        };
      } else {
        socket.onopen = null;
      }
    }
  }
}

// Export singleton instance
export const socketClient = new AppSocketClient();
