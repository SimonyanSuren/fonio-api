
import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';



export default class Georouting extends StepsAbstract {

    async prepareCfsData() {
        if (!this.step.georoutingConfig || !this.step.georoutingConfig.branchs) {
            throw new MessageCodeError("step:" + this.index + ":georoutingConfig.branchs:missing");
        }
        for (let steInd in this.step.georoutingConfig.branchs) {
            let branc = this.step.georoutingConfig.branchs[steInd];
            if (!branc || !branc.values || !Array.isArray(branc.values) || branc.values.length < 1) {
                throw new MessageCodeError("step:" + this.index + ":branch:" + steInd + ":values:missingOrEmpty");
            }
        }
        this.cfs.georoutingZip = !!this.step.georoutingZip;
        this.cfs.georoutingConfig = this.step.georoutingConfig;
    }

    async buildXmlData(){
        console.log("STEP GEOROUTING");
    }

    async buildXmlDependencies() {
    }
}
