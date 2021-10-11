
import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';

export default class Tags extends StepsAbstract {
    async prepareCfsData() {
        console.log("STEP TAGS");
        if (!this.step.tags && !Array.isArray(this.step.tags) && this.step.tags.length < 1) {
            throw new MessageCodeError("step:" + this.index + ":tags:missing");
        }
        for (const tag of this.step.tags) {
            if (!tag || !tag.id) {
                throw new MessageCodeError("step:" + this.index + ":tags:id:missing");
            }

            if (!this.checkIsTagExists(tag.id)) {
                throw new MessageCodeError("tag:NotFound");
            }
        }
        this.cfs.tags = this.step.tags;
    }

    async buildXmlData(){
        console.log("STEP TAGS");
    }

    async buildXmlDependencies() {
    }
}
