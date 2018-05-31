import WebSocket from 'isomorphic-ws';
import { HancockSocketMessage, HancockSocketKind, HancockSocketBody } from "..";
import { EventEmitter } from "events";
import { normalizeAddressOrAlias, normalizeAddress } from './utils';

export class HancockEthereumSocket extends EventEmitter {

    private ws: WebSocket;
    private consumer: string | undefined;

    constructor(url:string, consumer?: string) {
        super();
        this.ws = new WebSocket(url);
        this.consumer = consumer;
        
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

    private init(consumer?: string){
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

    public addTransfer(addresses: string[]) {
        if (addresses.length > 0) {
            let normalizedAddress: string[] = addresses.map((addr: string) => normalizeAddress(addr));
            this.sendMessage('watch-addresses', addresses); 
        }
    }

    public addContract(contracts: string[]) {
        if (contracts.length > 0) {
            let normalizedAddress: string[] = contracts.map((addr: string) => normalizeAddressOrAlias(addr));
            this.sendMessage('watch-contracts', contracts);
        }
    }

    private sendMessage(kind: HancockSocketKind, body: HancockSocketBody[]) {
        const dataFormated = this.getMessageFormat(kind, body);
        if (this.ws.readyState === WebSocket.OPEN)
            this.ws.send(JSON.stringify(dataFormated));
    }

    private getMessageFormat(kind: HancockSocketKind, body: HancockSocketBody): HancockSocketMessage {
        const message: HancockSocketMessage = {
            kind: kind,
            body: body,
        };

        if (this.consumer) {
            message['consumer'] = this.consumer;
        }

        return message;
    }

}