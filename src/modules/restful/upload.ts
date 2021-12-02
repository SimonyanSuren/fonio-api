'use strict';

import {
    Controller,
    HttpStatus,
    Req,
    Res,
    Post,
    UseInterceptors,
    //FileInterceptor,
    UploadedFile,
    Param
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
    ApiResponse,
    ApiConsumes,
    ApiParam,
    ApiBody,
    // ApiImplicitFile,
    ApiOperation
} from '@nestjs/swagger';
import { errorResponse } from '../../filters/errorRespone';
import { Response } from "express";
import { CompanyFacade, UserFacade } from "../facade/";
import { diskStorage } from 'multer';
import { HelperClass } from "../../filters/Helper";
import { FileInterceptor } from '@nestjs/platform-express';
import constants from '../../constants';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Controller("upload")
@ApiTags("Upload")
@ApiBearerAuth()
@UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file, cb) => {
                if (!existsSync(constants.PATH_TO_IMAGE_FOLDER)){
                    mkdirSync(constants.PATH_TO_IMAGE_FOLDER);
                }
                return cb(null, `${constants.PATH_TO_IMAGE_FOLDER}`);
            },
            filename: (req: any, file, cb) => {
                if (existsSync(`${constants.PATH_TO_IMAGE_FOLDER}/${req.user.userUuid}.jpeg`)){
                    unlinkSync(`${constants.PATH_TO_IMAGE_FOLDER}/${req.user.userUuid}.jpeg`);
                }
                return cb(null, `${req.user.userUuid}.jpeg`);
            }
        }),
        fileFilter: async (req, file: any, cb) => {
            let prefix = file.mimetype.substring(0, 5);
            // if (!file.mimetype.match(/(image)\/(jpeg)$/)) {
            if (prefix != 'image') {
                return cb(null, false);
            }
            return cb(null, file);
        }
    }))
export class UploadUserImage {
    constructor(
        private userFacade: UserFacade,
        private companyFacade: CompanyFacade,
    ) {
    }

    @ApiResponse({ status: 202, description: "Successful image uploading" })
    @Post('user/image')
    @ApiConsumes("multipart/form-data")
    // @ApiParam({name: "file", description: "User Image File"})
    // @ApiImplicitFile({name: "file", description: "JPEG file", required: true})
    @ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    // required: true,
                    type: "file",
                    description: "The file to upload.",
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        description: "multipart/form-data. upload UserImageFile",
        operationId: "uploadUserImageFile",
        summary: "Upload UserImageFile "
    })
    public async uploadImageForUser(@Req() req, @Res() res: Response, @UploadedFile() file) {
        try {
            if (!req.file) await HelperClass.throwErrorHelper('upload:fileFormatWrong');
            let link = `${process.env.CURRENT_SERVER}/user/image/${req.user.userUuid}.jpeg`;
            await this.userFacade.uploadedImageLinkToUserTable(link, req.user.userUuid);

            return res.status(202).json({ response: 'Successful image uploading' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({ status: 202, description: "Successful image uploading" })
    @Post(':companyUuid/user/:userUuid/image')
    @ApiConsumes("multipart/form-data")
    @ApiParam({name: "companyUuid", description: "Company Uuid"})
    @ApiParam({name: "userUuid", description: "User Uuid"})
    @ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    // required: true,
                    type: "file",
                    description: "The file to upload.",
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        description: "multipart/form-data. upload UserImageFile by company",
        operationId: "uploadUserImageFileByCompany",
        summary: "Upload UserImageFile By Company"
    })
    public async uploadImageForUserByCompany(@Req() req, @Res() res: Response, 
        @UploadedFile() file,
        @Param('companyUuid') companyUuid: string,
        @Param('userUuid') userUuid: string,
    ) {
        try {
            if (!req.file) await HelperClass.throwErrorHelper('upload:fileFormatWrong');
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');
            let user_exist = await this.companyFacade.getUserUuidByCompanyUuid(companyUuid, userUuid);
            if (!user_exist) await HelperClass.throwErrorHelper('company:userWithThisUuidDoesNotExist');

            let link = `${process.env.CURRENT_SERVER}/user/image/${req.user.userUuid}.jpeg`;
            await this.userFacade.uploadedImageLinkToUserTable(link, userUuid);

            return res.status(202).json({ response: 'Successful image uploading' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

}
