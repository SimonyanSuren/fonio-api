
import { Constants } from '../../../util/constants';
import { User, CallFlow } from "../../../models";
import { MessageCodeError } from '../../../util/error';
import { EntityManager } from "typeorm";
import { OpentactService } from "../../opentact";
import { RecordingFacade } from "../recording.facade";
import { TagFacade } from "../tag.facade";
import * as builder from 'xmlbuilder';

import Dial from "./steps/Dial";
import Georouting from "./steps/Georouting";
import Greeting from "./steps/Greeting";
import Hangup from "./steps/Hangup";
import Menu from "./steps/Menu";
import Schedule from "./steps/Schedule";
import SimullCall from "./steps/SimullCall";
import Tags from "./steps/Tags";
import Voicemail from "./steps/Voicemail";


const types = {
    [Constants.CALL_FLOW_TYPE_DIAL]: Dial,
/**/[Constants.CALL_FLOW_TYPE_GEOROUTING]: Georouting,
    [Constants.CALL_FLOW_TYPE_GREETING]: Greeting,
    [Constants.CALL_FLOW_TYPE_HANGUP]: Hangup,
    [Constants.CALL_FLOW_TYPE_MENU]: Menu,
/**/[Constants.CALL_FLOW_TYPE_SCHEDULE]: Schedule,
    [Constants.CALL_FLOW_TYPE_SIMULLCALL]: SimullCall,
/**/[Constants.CALL_FLOW_TYPE_TAGS]: Tags,
    [Constants.CALL_FLOW_TYPE_VOICEMAIL]: Voicemail,
};


export default class CallFlowProcessor {
    private _callFlow: any;
    private currentCallFlowTypes = {};

    constructor(
        steps,
        callFlow: CallFlow,
        user: User,
        currentUser: any,
        private tEM: EntityManager,
        private recordingFacade: RecordingFacade,
        private opentactService: OpentactService,
        private tagFacade: TagFacade
    ) {
        this._callFlow = callFlow;
        for (let index in steps) {
            let step = steps[index];
            if (!step.type || !step.type.id || !types[step.type.id]) {
                continue;
            }
            if (!types[step.type.id]) {
                throw new MessageCodeError(`Invalid id "${step.type.id}" in step at index ${index}`);
            }

            const flowType = new types[step.type.id](this.recordingFacade, this.opentactService, this.tagFacade);
            flowType.setUser(user);
            flowType.setCurrentUser(currentUser);
            flowType.setIndex(index);
            flowType.setCallFlow(callFlow);
            flowType.setCurrentCallFlowTypes(this.currentCallFlowTypes);
            flowType.setStep(step);
            this.currentCallFlowTypes[index] = flowType;

        }
    }

    private async buildXml(xmlData, xmlTemplate) {
        if (Array.isArray(xmlTemplate)) {
            for (let i in xmlTemplate) {
                await this.buildXml(xmlData, xmlTemplate[i]);
            }
            return xmlData;
        }

        if (!xmlTemplate.tagName) {
            return xmlData;
        }

        let el = xmlData.ele(xmlTemplate.tagName)

        if (xmlTemplate.txt) {
            el.txt(xmlTemplate.txt);
        }

        if (xmlTemplate.attr) {
            for (let i in xmlTemplate.attr) {
                el.att(xmlTemplate.attr[i].name, xmlTemplate.attr[i].value);
            }
        }

        if (xmlTemplate.children) {
            await this.buildXml(el, xmlTemplate.children);
        }

        return el.end({ pretty: true });
    }

    private getXmlBasis() {
        let xml_data = builder.create('Response', { doctype: "dialplan/xml", encoding: 'UTF-8' })
        if (this._callFlow.record) {
            xml_data = xml_data.ele('Record')
        }
        return xml_data;
    }

    async save() {
        for (let i in this.currentCallFlowTypes) {
            await this.currentCallFlowTypes[i].prepareCfsData();
            await this.currentCallFlowTypes[i].saveCfs(this.tEM);
        }
    };

    async prepareXML() {
        let xmls = {};
        let xmlData = this.getXmlBasis();

        for (let i in this.currentCallFlowTypes) {
            await this.currentCallFlowTypes[i].buildXmlData();
        }

        for (let i in this.currentCallFlowTypes) {
            await this.currentCallFlowTypes[i].buildXmlDependencies();
        }

        for (let i in this.currentCallFlowTypes) {
            let xmlTpl = this.currentCallFlowTypes[i].getXmlTemplate();
            if (this.currentCallFlowTypes[i].isSeparateXml()) {
                let name = this._callFlow.id + '-' + this.currentCallFlowTypes[i].getSeparateXmlSubname();
                let xmlDataSeparate = this.getXmlBasis();
                await this.buildXml(xmlDataSeparate, xmlTpl);
                xmls[name] = xmlDataSeparate.end({ pretty: true });
            } else {
                await this.buildXml(xmlData, xmlTpl);
            }
        }

        xmls[this._callFlow.id] = xmlData.end({ pretty: true });
        return xmls;
    }



}

