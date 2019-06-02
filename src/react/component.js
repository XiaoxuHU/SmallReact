import { renderComponent } from '../react-dom/render';

//React.Component
class Component{
    constructor(props = {}) {
        this.state = {};
        this.props = props;
    }
    setState(stateChange) {
        //将stateChange的属性全部拷贝到this.state上面
        Object.assign(this.state,stateChange);
        renderComponent(this);
    }
}

export default Component;