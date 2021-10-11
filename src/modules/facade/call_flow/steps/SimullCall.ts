
import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';

export default class SimullCall extends StepsAbstract {

    async prepareCfsData() {
        console.log("STEP SIMULLCALL ");
        if (!this.step.simullCallNumbers || !Array.isArray(this.step.simullCallNumbers) || this.step.simullCallNumbers.length < 1) {
            throw new MessageCodeError("step:" + this.index + ":simullCallNumbers:missing");
        }
        for (let numIndex in this.step.simullCallNumbers) {
            let num = this.step.simullCallNumbers[numIndex];
            if (!num.number) {
                throw new MessageCodeError("step:" + this.index + ":simullcall:" + numIndex + ":number:missing");
            }
        }
        if (!this.step.timeout) {
            throw new MessageCodeError("step:" + this.index + ":timeout:missing");
        }
        this.cfs.simullCallNumbers = this.step.simullCallNumbers;
        this.cfs.simullcallAll = !!this.step.simullcallAll;
        this.cfs.simullcallLastNumber = !!this.step.simullcallLastNumber;
        this.cfs.amd = !!this.step.amd;
        this.cfs.timeout = this.step.timeout;
    }

    async buildXmlData() {
        if (this.cfs.simullcallAll) {
            this.xmlTemplate.tagName = 'Dial';
            this.xmlTemplate.attr = [
                {name:'record', value:this.cfs.callFlow.record ? 'record-from-answer' : 'do-not-record'},
                {name:'timeout', value:this.cfs.timeout}
            ];
            this.xmlTemplate.children = this.cfs.simullCallNumbers.map((nmb)=>{
                return {tagName:'Number', txt:'1' + nmb.number}
            });

        } else {
            this.xmlTemplate = this.cfs.simullCallNumbers.map((nmb)=>{
                return {
                    tagName:'Dial',
                    attr:[
                        {name:'record', value:this.cfs.callFlow.record ? 'record-from-answer' : 'do-not-record'},
                        {name:'timeout', value:this.cfs.timeout}
                    ],
                    children:[
                        {tagName:'Number', txt:'1' + nmb.number}
                    ]
                }
            });
        }
    }

    async buildXmlDependencies() {
    }
}

