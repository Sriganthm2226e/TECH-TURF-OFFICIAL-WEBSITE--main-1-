/**
 * Tech Turf Real-time Client
 * Handles WebSocket connections for live database updates
 */

class RealtimeClient {
  constructor(url = null) {
    this.url = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    this.ws = null;
    this.listeners = new Map();
    this.autoReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to real-time server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✓ Real-time connection established');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve(this);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('✗ Real-time connection closed');
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (!this.autoReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnect();
      });
    }, delay);
  }

  /**
   * Subscribe to table changes
   */
  subscribe(table, callback) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, []);
    }
    
    this.listeners.get(table).push(callback);

    // Send subscription message if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', table });
    }

    return () => this.unsubscribe(table, callback);
  }

  /**
   * Unsubscribe from table
   */
  unsubscribe(table, callback) {
    if (this.listeners.has(table)) {
      const listeners = this.listeners.get(table);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Send message to server
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    if (data.type === 'connected') {
      console.log('Connected to real-time server');
    } else if (data.type === 'subscribed') {
      console.log(`Subscribed to ${data.table} updates`);
      this.emit('subscribed', data);
    } else if (data.type === 'db_change') {
      const { table, event, new: newData, old: oldData } = data;
      
      // Call all listeners for this table
      if (this.listeners.has(table)) {
        this.listeners.get(table).forEach(callback => {
          callback({
            event,
            new: newData,
            old: oldData,
            timestamp: data.timestamp
          });
        });
      }

      this.emit('change', data);
    } else if (data.type === 'error') {
      console.error('Server error:', data.message);
      this.emit('error', data.message);
    }
  }

  /**
   * Emit custom events
   */
  on(event, callback) {
    if (!this.listeners.has(`__event__${event}`)) {
      this.listeners.set(`__event__${event}`, []);
    }
    this.listeners.get(`__event__${event}`).push(callback);
  }

  /**
   * Emit events
   */
  emit(event, data) {
    const key = `__event__${event}`;
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => callback(data));
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.autoReconnect = false;
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Export for use in frontend
if (typeof window !== 'undefined') {
  window.RealtimeClient = RealtimeClient;
}

export default RealtimeClient;
