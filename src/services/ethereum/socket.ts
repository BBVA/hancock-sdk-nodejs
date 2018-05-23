import WebSocket from 'isomorphic-ws';
import { HancockSocketMessage, HancockSocketKind, HancockSocketBody } from "..";
import { EventEmitter } from "events";

export class HancockEthereumSocket extends EventEmitter{

    private ws: WebSocket;

    constructor(url:string) {
        super();
        this.ws  = new WebSocket(url);
        
        this.init();    
    }

    private onWebSocketOpen() {
        console.log("Hancock socket open");
        this.emit('opened');
    }

    private onWebSocketMessage(msg: any) {

        try {

            const rawData: string = msg.data ? msg.data: msg          
            const data: any = JSON.parse(rawData);

            this.emit(data.kind, data);

        } catch(e) {
            
        }

    }

    private onWebSocketError(e: any) {
        this.emit('error', e);
    }

    private init(){
        try {
      
            if (process.browser) {
      
              this.ws.addEventListener('open', this.onWebSocketOpen);
              this.ws.addEventListener('error', this.onWebSocketError);
              this.ws.addEventListener('message', this.onWebSocketMessage.bind(this));
      
            } else {
      
                this.ws.on('open', this.onWebSocketOpen);
                this.ws.on('error', this.onWebSocketError);
                this.ws.on('message', this.onWebSocketMessage.bind(this));
      
            }
            
        } catch (e) {
      
            Promise.resolve().then(() => { this.emit('error', '' + e); });
      
        }
    }

    public closeSocket(){
        this.ws.close();
    }

    public send(data: any){
        this.ws.send(data);
    }

    public addTransfer(addresses: string[]){
        this.sendMessage('watch-addresses', addresses);
    }

    public addContract(contracts: string[]){
        this.sendMessage('watch-contracts', contracts);
    }

    private sendMessage(kind:HancockSocketKind, body: HancockSocketBody[]){
        const dataFormated = this.getMessageFormat(kind, body);
        if(this.ws.readyState === WebSocket.OPEN)
            this.ws.send(JSON.stringify(dataFormated));
    }

    private getMessageFormat(kind:HancockSocketKind, body: HancockSocketBody){
        const message:HancockSocketMessage = {
            kind: kind,
            body: body
        }
        return message;
    }

}