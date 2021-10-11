
import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';

export default class Dial extends StepsAbstract {

    async prepareCfsData() {
        if (!this.step.dialNumberType) {
            throw new MessageCodeError("step:" + this.index + ":dialNumberType:missing");
        }
        if (!this.step.dialNumber) {
            throw new MessageCodeError("step:" + this.index + ":dialNumber:missing");
        }
        if (!this.step.timeout) {
            throw new MessageCodeError("step:" + this.index + ":timeout:missing");
        }
        this.cfs.dialNumberType = this.step.dialNumberType;
        this.cfs.dialNumber = this.step.dialNumber;
        this.cfs.amd = !! this.step.amd;
        this.cfs.timeout = this.step.timeout;
    }

    async buildXmlData() {
        console.log("STEP DIAL ");
        this.xmlTemplate.tagName = 'Dial';
        this.xmlTemplate.attr = [
            {name:'timeout', value:this.cfs.timeout},
            {name:'record', value:this.cfs.callFlow.record ? 'record-from-answer' : 'do-not-record'}
        ];
        this.xmlTemplate.children = [
            {tagName:'Number', txt:'1' + this.cfs.dialNumberType + this.cfs.dialNumber}
        ];
    }
    async buildXmlDependencies() {
    }
}
