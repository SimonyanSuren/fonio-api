

import { StepsAbstract } from "../Steps.abstract";
import { MessageCodeError } from '../../../../util/error';


export default class Schedule extends StepsAbstract {

    async prepareCfsData() {
        if (!this.step.scheduleHours) {
            throw new MessageCodeError("step:" + this.index + ":scheduleHours:missing");
        }
        if (!Array.isArray(this.step.scheduleHours.branchs) || this.step.scheduleHours.branchs.length < 1) {
            throw new MessageCodeError("step:" + this.index + ":scheduleHours.branchs:missing");
        }
        if (
            !this.step.scheduleHours.defaultBranch
            || !this.step.scheduleHours.defaultBranch
            || !this.step.scheduleHours.defaultBranch.step
            || !this.step.scheduleHours.defaultBranch.step.hasOwnProperty("order")
        ) {
            throw new MessageCodeError("step:" + this.index + ":scheduleHours.defaultBranch.step.order:missing");
        }
        for (let steInd in this.step.scheduleHours.branchs) {
            let branc = this.step.scheduleHours.branchs[steInd];
            if (!branc || !branc.step || !branc.step.hasOwnProperty("order")) {
                throw new MessageCodeError("step:" + this.index + ":branch:" + steInd + ":step.order:missing");
            }
            if (!branc.allDay && (!Array.isArray(branc.times) || branc.times.length < 1)) {
                throw new MessageCodeError("step:" + this.index + ":branchs:" + steInd + ":times:missing");
            }
            if (!branc.allDay) {
                for (let timeInd in branc.times) {
                    let tim = branc.times[timeInd];
                    if (!tim.hasOwnProperty("hourIni") || !tim.hasOwnProperty("hourEnd") || !tim.hasOwnProperty("minIni") || !tim.hasOwnProperty("minEnd")) {
                        throw new MessageCodeError("step:" + this.index + ":branch:" + steInd + ":time:" + timeInd + ":dateInvalid:missing");
                    }
                }
            }
        }
        this.cfs.scheduleHours = this.step.scheduleHours;
    }

    async buildXmlData(){
        console.log("STEP SCHEDULE");
    }

    async buildXmlDependencies() {
    }

}
