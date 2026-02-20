import { createContext } from "react";
import openSocket from "socket.io-client";
import jwt from "jsonwebtoken";

class ManagedSocket {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.rawSocket = socketManager.currentSocket;
    this.callbacks = [];
    this.joins = [];

    this.rawSocket.on("connect", () => {
      if (!this.rawSocket.recovered) {
        const refreshJoinsOnReady = () => {
          for (const j of this.joins) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug("refreshing join", j);
            }
            this.rawSocket.emit(`join${j.event}`, ...j.params);
          }
          this.rawSocket.off("ready", refreshJoinsOnReady);
        };
        for (const j of this.callbacks) {
          this.rawSocket.off(j.event, j.callback);
          this.rawSocket.on(j.event, j.callback);
        }
        
        this.rawSocket.on("ready", refreshJoinsOnReady);
      }
    });
  }
  
  on(event, callback) {
    if (event === "ready" || event === "connect") {
      return this.socketManager.onReady(callback);
    }
    this.callbacks.push({event, callback});
    return this.rawSocket.on(event, callback);
  }
  
  off(event, callback) {
    const i = this.callbacks.findIndex((c) => c.event === event && c.callback === callback);
    this.callbacks.splice(i, 1);
    return this.rawSocket.off(event, callback);
  }
  
  emit(event, ...params) {
    if (event.startsWith("join")) {
      this.joins.push({ event: event.substring(4), params });
      if (process.env.NODE_ENV !== 'production') {
        console.log("Joining", { event: event.substring(4), params});
      }
    }
    return this.rawSocket.emit(event, ...params);
  }
  
  disconnect() {
    for (const j of this.joins) {
      this.rawSocket.emit(`leave${j.event}`, ...j.params);
    }
    this.joins = [];
    for (const c of this.callbacks) {
      this.rawSocket.off(c.event, c.callback);
    }
    this.callbacks = [];
  }
}

class DummySocket {
  on(..._) {}
  off(..._) {}
  emit(..._) {}
  disconnect() {}
}

const SocketManager = {
  currentCompanyId: -1,
  currentUserId: -1,
  currentSocket: null,
  socketReady: false,

  getSocket: function(companyId) {
    let userId = null;
    if (localStorage.getItem("userId")) {
      userId = localStorage.getItem("userId");
    }

    if (!companyId && !this.currentSocket) {
      return new DummySocket();
    }

    if (companyId && typeof companyId !== "string") {
      companyId = `${companyId}`;
    }

    if (companyId !== this.currentCompanyId || userId !== this.currentUserId) {
      if (this.currentSocket) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn("closing old socket - company or user changed");
        }
        this.currentSocket.removeAllListeners();
        this.currentSocket.disconnect();
        this.currentSocket = null;
      }

      let token = JSON.parse(localStorage.getItem("token"));
      const { exp } = jwt.decode(token) ?? {};

      if ( Date.now() >= exp*1000) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn("Expired token, reload after refresh");
        }
        setTimeout(() => {
          window.location.reload();
        },1000);
        return new DummySocket();
      }

      this.currentCompanyId = companyId;
      this.currentUserId = userId;
      
      if (!token) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("❌ [Socket] Token não encontrado no localStorage");
        }
        return new DummySocket();
      }
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (process.env.NODE_ENV !== 'production') {
        console.log("🔌 [Socket] Tentando conectar ao backend:", {
          backendUrl: backendUrl,
          companyId: companyId,
          userId: userId,
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          currentOrigin: window.location.origin
        });
      }
      
      this.currentSocket = openSocket(backendUrl, {
        transports: ["polling"],
        pingTimeout: 18000,
        pingInterval: 18000,
        query: { token },
      });
      
      this.currentSocket.on("connect", (...params) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log("✅ [Socket] Conectado com sucesso:", {
            socketId: this.currentSocket.id,
            params: params,
            backendUrl: backendUrl
          });
        }
      });
      
      this.currentSocket.on("connect_error", (error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error("❌ [Socket] Erro ao conectar:", {
            error: error.message,
            type: error.type,
            description: error.description,
            backendUrl: backendUrl,
            currentOrigin: window.location.origin
          });
        }
      });
      
      this.currentSocket.on("disconnect", (reason) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`⚠️ [Socket] Desconectado:`, {
            reason: reason,
            socketId: this.currentSocket?.id,
            backendUrl: backendUrl
          });
        }
        
        if (reason.startsWith("io ")) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn("🔄 [Socket] Tentando reconectar...", this.currentSocket);
          }
          
          const { exp } = jwt.decode(token);
          if ( Date.now()-180 >= exp*1000) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn("⏰ [Socket] Token expirado, recarregando app");
            }
            window.location.reload();
            return;
          }

          this.currentSocket.connect();
        }        
      });
      
      this.currentSocket.onAny((event, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug("📨 [Socket] Evento recebido:", { 
            event: event, 
            args: args,
            socketId: this.currentSocket?.id 
          });
        }
      });
      
      this.onReady(() => {
        this.socketReady = true;
      });

    }
    
    return new ManagedSocket(this);
  },
  
  onReady: function( callbackReady ) {
    if (this.socketReady) {
      callbackReady();
      return
    }
    
    this.currentSocket.once("ready", () => {
      callbackReady();
    });
  },

};

const SocketContext = createContext()

export { SocketContext, SocketManager };
