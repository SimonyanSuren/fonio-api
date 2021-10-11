
import { StepsAbstract } from "../Steps.abstract";

export default class Greeting extends StepsAbstract {

    async prepareCfsData() {
        await this.uploadRecording("greeting_");
    }

    async buildXmlData(){
        console.log("STEP GREETING");
        if (this.cfs.recording) {
            this.xmlTemplate.tagName = 'Play';
            this.xmlTemplate.txt = this.cfs.recordURL;
        } else {
            this.xmlTemplate.tagName = 'Say';
            this.xmlTemplate.txt = this.cfs.recordMessage;
        }
    }

    async setJsonForXml(step){

        return {}
    }

    async buildXmlDependencies() {
    }
}

