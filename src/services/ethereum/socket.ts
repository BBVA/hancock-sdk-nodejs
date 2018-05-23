import { HancockEthereumEventEmitter, HancockEthereumEvent } from "./model";
import WebSocket from 'isomorphic-ws';
import { HancockEventKind, HancockEventEmitter, HancockSocketMessage } from "..";
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

    private onWebSocketOpen() {
        console.log("Hancock socket open");
        if(this.onOpen)
            this.onOpen();
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
      
              this.ws.addEventListener('open', this.onWebSocketOpen.bind(this));
              this.ws.addEventListener('error', this.onWebSocketError);
              this.ws.addEventListener('message', this.onWebSocketMessage.bind(this));
      
            } else {
      
                this.ws.on('open', this.onWebSocketOpen.bind(this));
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
        this.sendMessage('transfer', addresses);
    }

    public addContract(contracts: string[]){
        this.sendMessage('contract', contracts);
    }

    private sendMessage(type:string, data: string[]){
        const dataFormated = this.getMessageFormat(type, data);
        if(this.ws.readyState === WebSocket.OPEN)
            this.ws.send(JSON.stringify(dataFormated));
    }

    private getMessageFormat(type:string, data: string[]){
        return {
            type: type,
            data: data
        }
    }

}