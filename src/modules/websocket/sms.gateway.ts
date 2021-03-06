import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
    OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JWTHelper } from '../../util/jwt';



@WebSocketGateway({
    handlePreflightRequest: function (req, res) {
        var headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        res.writeHead(200, headers);
        res.end();
    }
})
export class WSGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    usersMap = new Map;
    usersArray:object[] = [];

    @WebSocketServer()
    server: Server;

    private getByValue(array, value) {
        return array.filter(object => object.companyId === value);
    }

    private removeByValue(array, value) {
       const index = array.findIndex(x => x.client.id ===value);
       array.splice(index, 1);
    }


    afterInit(server: Server) {
        console.log('Init');
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id} ${new Date()}`);
        // this.usersMap.delete(client.id)
        this.removeByValue(this.usersArray, client.id);
    }

    async handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id} ${new Date()}`);
        let token:any = client.handshake.headers['authorization'] && (client.handshake.headers['authorization']).split(' ')[1];

        if (!token) return client.disconnect(true);
        const user:any = await JWTHelper.verify(token);
        if (!user) {
            client.disconnect(true);
            throw new Error('authentication error')
        }
        const newObject = {
            companyId: user.companyId,
            client
        }
        this.usersArray.push(newObject)
    }

    async sendMessage(companyId, data) {

        const clientArray = this.getByValue(this.usersArray, companyId)
        if (clientArray?.length>0){
            clientArray.forEach( client =>{
                const response = client.client.emit('sms_incoming', data)
            })
        }
    }

    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
        return data;
    }
}
