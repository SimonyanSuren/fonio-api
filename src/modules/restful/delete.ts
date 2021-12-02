import {ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Controller, Delete, HttpStatus, Param, Req, Res} from "@nestjs/common";
import {Response} from "express";
import {errorResponse} from "../../filters/errorRespone";
import {CompanyFacade, UserFacade} from "../facade";
import constants from "../../constants";
import { HelperClass } from "../../filters/Helper";

@Controller("delete")
@ApiTags("Upload")
@ApiBearerAuth()
export class DeleteUserImage {
    constructor(
        private userFacade: UserFacade,
        private companyFacade: CompanyFacade,
    ) {
    }

    @ApiResponse({status: 202, description: "Successful delete"})
    @Delete('user/image')
    @ApiOperation({description: "delete user image", operationId: "deleteUserImage", summary: "Delete User Image"})
    public async removeUserImage(@Req() req, @Res() res: Response) {
        try {
            let {userUuid} = req.user;
            await this.userFacade.deleteImageFromDistPromise(`${constants.PATH_TO_IMAGE_FOLDER}`, userUuid);
            await this.userFacade.deleteImageFromTable(userUuid);

            return res.status(202).json({response: 'Image was removed'});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({status: 202, description: "Successful delete"})
    @Delete(':companyUuid/user/:userUuid/image')
    @ApiParam({name: "companyUuid", description: "Company Uuid"})
    @ApiParam({name: "userUuid", description: "User Uuid"})
    @ApiOperation({description: "delete user image by company", operationId: "deleteUserImageByCompany", summary: "Delete User Image By Company"})
    public async removeUserImageByCompany(@Req() req, @Res() res: Response,
        @Param('companyUuid') companyUuid: string,
        @Param('userUuid') userUuid: string,
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');
            let user_exist = await this.companyFacade.getUserUuidByCompanyUuid(companyUuid, userUuid);
            if (!user_exist) await HelperClass.throwErrorHelper('company:userWithThisUuidDoesNotExist');

            await this.userFacade.deleteImageFromDistPromise(`${constants.PATH_TO_IMAGE_FOLDER}`, userUuid);
            await this.userFacade.deleteImageFromTable(userUuid);

            return res.status(202).json({response: 'Image was removed'});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}