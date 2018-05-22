import { HancockEthereumEventEmitter, HancockEthereumEvent } from "./model";
import WebSocket from 'isomorphic-ws';
import { HancockEventKind, HancockEventEmitter } from "..";

export class HancockEthereumSocket{

    private eventEmitter: HancockEthereumEventEmitter;
    private ws: WebSocket;
    private onOpen: any;

    constructor(ws:WebSocket, eventEmitter: HancockEthereumEventEmitter, onOpen?: any) {
        this.ws = ws;
        this.eventEmitter = eventEmitter;
        this.onOpen = onOpen;
        
        this.init();
    }

    private onWebSocketMessage(msg: any) {

        try {

            const rawData: string = msg.data ? msg.data: msg          
            const data: any = JSON.parse(rawData);
            console.log(data)
            this.eventEmitter.emit(data.kind, data);

        } catch(e) {
            
        }

    }

    private onWebSocketError(e: any) {
        this.eventEmitter.emit('error', e);
    }

    private init(){
        try {
      
            if (process.browser) {
      
              this.ws.addEventListener('open', this.onOpen);
              this.ws.addEventListener('error', this.onWebSocketError);
              this.ws.addEventListener('message', this.onWebSocketMessage);
      
            } else {
      
                this.ws.on('open', this.onOpen);
                this.ws.on('error', this.onWebSocketError);
                this.ws.on('message', this.onWebSocketMessage);
      
            }
      
            (this.eventEmitter as any).closeSocket = () => this.ws.close();
      
        } catch (e) {
      
            Promise.resolve().then(() => { this.eventEmitter.emit('error', '' + e); });
      
        }
    }

    public on(event: HancockEventKind, fn: (payload: HancockEthereumEvent) => void, context?: any): HancockEventEmitter{
        return this.eventEmitter.on(event, fn, context);
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