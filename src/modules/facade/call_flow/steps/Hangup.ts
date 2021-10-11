
import { StepsAbstract } from "../Steps.abstract";

export default class Hangup extends StepsAbstract {

    async prepareCfsData() {
    }

    async buildXmlData(){
        console.log("STEP HANGUP");
        this.xmlTemplate.tagName = 'Hangup';
    }

    async buildXmlDependencies() {
    }
}
