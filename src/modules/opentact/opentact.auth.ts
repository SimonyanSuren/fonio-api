import {Injectable} from '@nestjs/common';
import axios from 'axios';
var nodeBase64 = require('nodejs-base64-converter');
import * as https from 'https';
import constants from "../../constants"

@Injectable()
export class OpentactAuth {
    private axios;
    private jwtToken: string;

    constructor() {
        this.axios = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            baseURL: `${process.env.OPENTACT_API}`,
            headers: {
                common: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        });

        this.axios.interceptors.request.use(function (config) {
            return config;
        }, function (error) {
            return Promise.reject(error);
        });
        this.axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            return Promise.reject(error);
        });
    }

    async adminLoginGettignToken() {
        const authorization = nodeBase64.encode((process.env.OPENTACT_ADMIN_EMAIL + ':' + process.env.OPENTACT_ADMIN_PASSWORD))
        return await this.axios.get("/auth", {
            headers: {"Authorization": `Basic ${authorization}`},
        })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err, 'err');
                throw err;
            });
    }

    async getToken() {
        const authHeader = Buffer.from(`${constants.OPENTACT_USER}:${constants.OPENTACT_PASSWORD}`).toString('base64')
        const config = {
            headers: {
                Authorization: `Basic ${authHeader}`,
            }
        }
        const response = await this.axios.get("/auth", config)
        if (response.data.payload.token) {
            this.jwtToken = response.data.payload.token
        }
        return response.data;
    }
}