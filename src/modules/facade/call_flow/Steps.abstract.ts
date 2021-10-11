
import { CallFlowStep, Data, User, CallFlow } from "../../../models";
import { MessageCodeError } from '../../../util/error';
import { OpentactService } from "../../opentact";
import { TagFacade } from "../tag.facade";


export abstract class StepsAbstract {

    private _user: User;
    private _callFlow: CallFlow;
    private _currentCallFlowTypes;
    private _currentUser: any;
    private _steps: any;
    private _separateChild: string;

    protected index: Number;
    protected cfs: CallFlowStep;
    protected step: any;
    protected xmlTemplate: any = {};
    protected isXmlBuildingIgnore: boolean = false;

    constructor(
        private opentactService: OpentactService,
        private tagFacade: TagFacade
    ) { }

    setCurrentCallFlowTypes(_currentCallFlowTypes) {
        this._currentCallFlowTypes = _currentCallFlowTypes;
    }

    setUser(_user: User) {
        this._user = _user;
    }

    setCurrentUser(_currentUser: any) {
        this._currentUser = _currentUser;
    }

    setIndex(_index) {
        this.index = _index;
    }

    setCallFlow(_callFlow: CallFlow) {
        this._callFlow = _callFlow;
    }

    async setStep(_step: any) {
        this.step = _step;
        this.cfs = new CallFlowStep();
        this.cfs.user = this._user;
        this.cfs.order = Number(this.index);
        this.cfs.callFlow = this._callFlow;
        this.cfs.uniqueId = _step.uniqueId;
        let type = new Data();
        type.id = _step.type.id;
        this.cfs.type = type;
    }

    async setJsonForXml(step) {
        return {}
    }

    protected async uploadRecording(prefix: string) {
        if (!this.step.recordMessage && (!this.step.recording || !this.step.recording.id)) {
            throw new MessageCodeError("step:" + this.index + ":recordMessage_or_recording:Missing");
        }
        if (this.step.recording) {
            this.cfs.recording = this.step.recording;
        } else {
            try {
                this.cfs.recordMessage = this.step.recordMessage;
            } catch (error) {
                console.log("error tts ", error);
                throw new MessageCodeError(error.response.data.message);
            }
        }
    }

    protected async checkIsTagExists(tagId) {
        return await this.tagFacade.findById(this._currentUser.accountId, tagId);
    }

    protected async setItemToIgnore(chPosition) {
        this._currentCallFlowTypes[chPosition].xmlBuildingIgnore()
    }

    protected async setItemAsSeparateChild(chPosition, parentId, digit) {
        if (this._currentCallFlowTypes[chPosition]) {
            this._currentCallFlowTypes[chPosition].setSeparateXmlSubname(parentId + '-' + digit)
        }
    }

    protected async getChildXmlTemplate(chPosition) {
        if (this._currentCallFlowTypes[chPosition]) {
            return this._currentCallFlowTypes[chPosition].getXmlTemplate();

        }
    }

    xmlBuildingIgnore() {
        this.isXmlBuildingIgnore = true;
    }

    setSeparateXmlSubname(name) {
        this._separateChild = name;
    }

    getSeparateXmlSubname() {
        return this._separateChild || '';
    }

    isSeparateXml() {
        return this._separateChild && '' != this._separateChild;
    }

    async saveCfs(tEM) {
        await tEM.save(this.cfs);
    }

    getXmlTemplate() {
        return this.isXmlBuildingIgnore ? [] : this.xmlTemplate;
    }

    abstract prepareCfsData();
    abstract buildXmlData();
    abstract buildXmlDependencies();
}





