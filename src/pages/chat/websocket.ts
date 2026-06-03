export class NativeStompClient {
    private socket: WebSocket | null = null;
    private subscriptions: Map<string, (msg: any) => void> = new Map();
    private isConnected: boolean = false;
    private onConnectCallback: () => void = () => {};
    private pendingSubscriptions: string[] = [];

    constructor(private url: string) {}

    connect(onConnect?: () => void) {
        if (onConnect) this.onConnectCallback = onConnect;
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            // Gửi khung CONNECT STOMP
            const frame = "CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\n\n\0";
            this.socket?.send(frame);
        };

        this.socket.onmessage = (event) => {
            let data = event.data as string;
            console.log("STOMP Received raw:", data);
            
            // Chuẩn hóa line endings từ CRLF (\r\n) sang LF (\n) để tương thích trên mọi OS (Windows/Linux)
            data = data.replace(/\r\n/g, "\n");

            if (data.startsWith("CONNECTED")) {
                this.isConnected = true;
                this.onConnectCallback();
                // Đăng ký lại các kênh đăng ký đang chờ
                this.pendingSubscriptions.forEach(dest => {
                    const callback = this.subscriptions.get(dest);
                    if (callback) {
                        this.sendSubscribeFrame(dest);
                    }
                });
                this.pendingSubscriptions = [];
            } else if (data.startsWith("MESSAGE")) {
                // Phân tích khung MESSAGE STOMP bằng indexOf để hỗ trợ tin nhắn chứa dấu xuống dòng trống (\n\n)
                const separatorIndex = data.indexOf("\n\n");
                if (separatorIndex !== -1) {
                    const headerPart = data.substring(0, separatorIndex);
                    let bodyPart = data.substring(separatorIndex + 2);
                    
                    // Loại bỏ ký tự null (\0) và mọi dữ liệu thừa phía sau (như dấu xuống dòng dư thừa)
                    const nullIndex = bodyPart.indexOf("\0");
                    if (nullIndex !== -1) {
                        bodyPart = bodyPart.substring(0, nullIndex);
                    }
                    bodyPart = bodyPart.trim();

                    // Tìm thuộc tính destination trong header (cho phép khoảng trắng sau dấu hai chấm)
                    const destMatch = headerPart.match(/destination:\s*([^\s]+)/);
                    if (destMatch) {
                        const destination = destMatch[1];
                        const callback = this.subscriptions.get(destination);
                        if (callback) {
                            try {
                                const parsed = JSON.parse(bodyPart);
                                callback(parsed);
                            } catch (e) {
                                callback(bodyPart);
                            }
                        }
                    }
                }
            }
        };

        this.socket.onclose = () => {
            this.isConnected = false;
        };

        this.socket.onerror = (error) => {
            console.error("STOMP connection error:", error);
        };
    }

    private sendSubscribeFrame(destination: string) {
        const frame = `SUBSCRIBE\nid:${destination}\ndestination:${destination}\nack:auto\n\n\0`;
        this.socket?.send(frame);
    }

    subscribe(destination: string, callback: (msg: any) => void) {
        this.subscriptions.set(destination, callback);
        if (this.isConnected) {
            this.sendSubscribeFrame(destination);
        } else {
            this.pendingSubscriptions.push(destination);
        }
    }

    send(destination: string, body: any) {
        if (this.isConnected) {
            const payload = JSON.stringify(body);
            // Loại bỏ header content-length để tránh lỗi bất đồng bộ byte/character khi gửi ký tự Unicode (tiếng Việt có dấu)
            const frame = `SEND\ndestination:${destination}\ncontent-type:application/json\n\n${payload}\0`;
            console.log("STOMP Sending raw:", frame);
            this.socket?.send(frame);
        } else {
            console.warn("Cannot send message: STOMP is not connected.");
        }
    }

    disconnect() {
        this.socket?.close();
        this.isConnected = false;
        this.subscriptions.clear();
        this.pendingSubscriptions = [];
    }
}

export const getWsUrl = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    if (backendUrl.startsWith("http")) {
        return backendUrl.replace(/^http/, "ws") + "/ws";
    } else {
        return `${wsProto}//${window.location.host}/ws`;
    }
};
