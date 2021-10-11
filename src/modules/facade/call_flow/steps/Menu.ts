
import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';
import { Config } from "../../../../util/config";

export default class Menu extends StepsAbstract {
    async prepareCfsData() {
        if (!this.step.menuKeys || !Array.isArray(this.step.menuKeys) || this.step.menuKeys.length < 1) {
            throw new MessageCodeError("step:" + this.index + ":menuKeys:missing");
        }
        await this.uploadRecording("menu_");
        for (let keyIndex in this.step.menuKeys) {
            let keyM = this.step.menuKeys[keyIndex];
            console.log("MENU STEP ", keyIndex, keyM);
            if (!keyM || !keyM.key) {
                throw new MessageCodeError("step:" + this.index + ":keyIndex:" + keyIndex + ":key:missing");
            }
            console.log("MENU step ", keyM.step);
            if (!keyM.step || keyM.step.order === undefined || keyM.step.order < 0) {
                throw new MessageCodeError("step:" + this.index + ":keyIndex:" + keyIndex + ":order:invalid");
            }
        }
        this.cfs.menuKeys = this.step.menuKeys;
        await this.uploadRecording("menu_");
    }

    async buildXmlData() {
        console.log("STEP MENU");
        this.xmlTemplate.tagName = 'Gather';

        this.xmlTemplate.attr = [
            {name:'numDigits', value:1},
            {name:'attempts', value:2},
            {name:'timeout', value:10000},
            {name:'finishOnKey', value:'*'}
        ];

        if (this.cfs.recording) {
            this.xmlTemplate.children = [
                { tagName: 'Play', txt: this.cfs.recordURL, }
            ];
        } else {
            this.xmlTemplate.children = [
                { tagName: 'Say', txt: this.cfs.recordMessage, }
            ];
        }
    }

    async buildXmlDependencies() {
        let caseArray:any=[]
        for (let i in this.cfs.menuKeys) {
           const childTemplate = await this.getChildXmlTemplate(this.cfs.menuKeys[i].step.order);
            const newCase = {
                tagName: 'Case',
                attr: [{
                    name: 'dtmf',
                    value: this.cfs.menuKeys[i].key
                }],
                children:[childTemplate]
            }
            caseArray.push(newCase)


            await this.setItemAsSeparateChild(this.cfs.menuKeys[i].step.order, this.cfs.id, this.cfs.menuKeys[i].key);
        }
        const defaultEl ={
            tagName: 'Default',
            children: { tagName: 'Say', txt: `Hi, we don't have such command`, }
        }
        caseArray.push(defaultEl)
        const errorEl ={
            tagName: 'Error',
            children: { tagName: 'Say', txt: `No any DTMF Code entered.`, }
        }
        caseArray.push(errorEl)
        const switchEl = {
            tagName: 'Switch',
            children: caseArray
        }
        this.xmlTemplate.children.push(switchEl)
    }
}
