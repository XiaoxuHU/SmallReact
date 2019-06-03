import { enqueueSetState } from './setState-queue';

//React.Component
class Component{
    constructor(props = {}) {
        this.state = {};
        this.props = props;
    }
    setState(stateChange) {
        //异步更新setState
        enqueueSetState(stateChange,this);
    }
}

export default Component;