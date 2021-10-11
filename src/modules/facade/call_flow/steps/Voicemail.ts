
import { StepsAbstract } from "../Steps.abstract";
export default class Voicemail extends StepsAbstract {
    async prepareCfsData() {
        await this.uploadRecording("voicemail_");
        this.cfs.voicemailTranscribe = !!this.step.voicemailTranscribe;
    }

    async buildXmlData() {
        console.log("STEP VOICEMAIL");

        this.xmlTemplate = this.cfs.recording
                    ? [ {tagName:'Play', txt:this.cfs.recordURL} ]
                    :  [ {tagName:'Say', txt:this.step.recordMessage} ];
        this.xmlTemplate.push({tagName:'Record'});
    }

    async buildXmlDependencies() {
    }
}
