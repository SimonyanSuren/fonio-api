import { Injectable } from '@nestjs/common';
import { BaseService} from './base.service'
import {Parser, Builder} from 'xml2js'
import { promises as fsPromises } from 'fs';


@Injectable()
export class CallFlowService extends BaseService {

    constructor() { super() }

    public async xmlToJson() {
        const filename = "/test.xml";
        const fullpath = __dirname + filename;
        const xmlString = await fsPromises.readFile('test.xml')
        const parser = new Parser();
        parser.parseStringPromise(xmlString)
        .then(function (result) {
            console.dir(result);
            console.log('Done');
        })
            .catch(function (err) {
                console.error(err);
            });
    }

    public async jsonToXml() {
        var builder = new Builder();
        var xml = builder.buildObject(Response);
        return xml
    }
    
}

const Response = {
    "Response": {
        "Say": [
            {
                "_": "Привет, спасибо что позвонили. 4",
                "$": {
                    "lang": "ru-RU"
                }
            }
        ],
        "Hangup": [
            ""
        ]
    }
}