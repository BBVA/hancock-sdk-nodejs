import { HancockEthereumEventEmitter, HancockEthereumEvent } from "./model";
import WebSocket from 'isomorphic-ws';
import { HancockEventKind, HancockEventEmitter } from "..";
import { EventEmitter } from "events";

export class HancockEthereumSocket extends EventEmitter{

    private ws: WebSocket;
    private onOpen: any;

    constructor(ws:WebSocket, onOpen?: any) {
        super();
        this.ws = ws;

        this.onOpen = onOpen;
        
        this.init();
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
      
              this.ws.addEventListener('open', this.onOpen);
              this.ws.addEventListener('error', this.onWebSocketError);
              this.ws.addEventListener('message', this.onWebSocketMessage.bind(this));
      
            } else {
      
                this.ws.on('open', this.onOpen);
                this.ws.on('error', this.onWebSocketError);
                this.ws.on('message', this.onWebSocketMessage.bind(this));
      
            }
      
            //(this.eventEmitter as any).closeSocket = () => this.ws.close();
      
        } catch (e) {
      
            Promise.resolve().then(() => { this.emit('error', '' + e); });
      
        }
    }

    public send(data: any){
        this.ws.send(data);
    }

    public addContract(contracts: string[]){
        const data = {
            type: "contracts",
            contracts: contracts
        };
        this.ws.send(JSON.stringify(data));
    }

    public addTransfer(addresses: string[]){
        const data = {
            type: "transfer",
            addresses: addresses
        };
        this.ws.send(JSON.stringify(data));
    }

}