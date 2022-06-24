'use strict';

import {
    Controller,
    HttpStatus,
    Req,
    Res,
    Post,
    UseInterceptors,
    UploadedFile,
    Param,
    Query
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';
import { errorResponse } from '../../filters/errorRespone';
import { Response, Express } from "express";
import {  } from "../facade";
import { diskStorage } from 'multer';
import { HelperClass } from "../../filters/Helper";
import { FileInterceptor } from '@nestjs/platform-express';
import constants from '../../constants';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { EmailService } from '../email';
const voicemail_types = ['sms', 'email'];

@Controller("voicemail")
@ApiTags("Voicemail")
@ApiBearerAuth()
export class VoiceMail {
    constructor(
        private emailService: EmailService,
    ) {
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file, cb) => {
                if (!existsSync( constants.PATH_TO_VOICEMAIL_FOLDER)){
                    mkdirSync(constants.PATH_TO_VOICEMAIL_FOLDER);
                }
                 cb(null, `${constants.PATH_TO_VOICEMAIL_FOLDER}`);
            },
            filename: (req: any, file, cb) => {
					console.log(" \x1b[41m ", req.user.userUuid , " [0m " )
					cb(null, `${req.user.userUuid +'_'+ new Date().toISOString().split('T')[0]}.wav`);
            }
        }),
        fileFilter: async (req, file: any, cb) => {
            let prefix = file.mimetype.substring(0, 5);
            if (prefix !== 'audio' || !file.mimetype.includes('wav')) {
                return cb(null, false); 
            }
            return cb(null, file);
        },
        limits: { fileSize: 1024*1024*5 }, // 5MB
    }))
    @ApiResponse({ status: 202, description: "Successful voicemail uploading" })
    @Post('user')
    // @Post('user/:type')
    @ApiQuery({ name: 'email', description: 'Email address for sending voicemail to.' })
    // @ApiParam({ name: 'type', description: 'How should voicemail bee send', enum: voicemail_types })
    // @ApiQuery({ name: 'email', description: 'Email address for sending voicemail to. Required for type "email"', required: false })
    // @ApiQuery({ name: 'from', description: 'From number for sending voicemail from. Required for type "sms"', required: false })
    // @ApiQuery({ name: 'to', description: 'To number for sending voicemail to. Required for type "sms"', required: false })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: "file",
                    description: "The file to upload.",
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        description: "multipart/form-data. send UserVoiceMailFile",
        operationId: "sendUserVoiceMailFile",
        summary: "Send UserVoiceMailFile "
    })
    public async sendVoiceMailForUser(@Req() req, @Res() res: Response, 
        @UploadedFile() file:Express.Multer.File,
        // @Param('type') type: string,
        @Query('email') email: string,
        // @Query('from') from: string,
        // @Query('to') to: string,
    ) {
        try {
			console.log(" \x1b[41m ", req.file, " [0m " )
            // if (!voicemail_types.includes(type)) await HelperClass.throwErrorHelper('send:wrongSendVoicemailType');
            if (!req.file){ await HelperClass.throwErrorHelper('upload:fileFormatWrong')};

            let link = `${process.env.CURRENT_SERVER}/public/voicemail/${file.filename}`;

            // if (type === 'sms') {
            //     if (!from) await HelperClass.throwErrorHelper('sms:fromNumberIsMissing');
            //     if (!to) await HelperClass.throwErrorHelper('sms:toNumberIsMissing');
            //     // let message = link;
            //     // let message = `<audio controls>
            //     //                     <source src="${link}" type="audio/wav">
            //     //                 </audio>`;
            //     // const sms = await this.opentactService.sendSms(token, from, to, message);
            // } else if (type === 'email') {
                if (!email) await HelperClass.throwErrorHelper('email:emailAddressIsMissing');
                await this.emailService.sendMail("mail:voicemail", email, {
                    FIRST_NAME: req.user.userFirstName, 
                    LAST_NAME: req.user.userLastName,
                    LOGO: `${process.env.BASE_URL||process.env.FONIO_URL}/public/assets/logo.png`,
                    AUDIO_LINK: link,
                    AUDIO_NAME: file.filename
                });
            // }

            return res.status(202).json({ response: 'Successful voicemail uploading and sending' });
        } catch (err) {
            if (existsSync(`${constants.PATH_TO_VOICEMAIL_FOLDER}/${file?.filename}`)){
                unlinkSync(`${constants.PATH_TO_VOICEMAIL_FOLDER}/${file?.filename}`);
            }
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}