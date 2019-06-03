import { renderComponent } from '../react-dom/render';

//异步进行setState,使得setState不至于太过频繁
const queue = [];
const renderQueue = [];//渲染组件队列,不会有重复组件

//延迟执行fn
function defer(fn) {
    return Promise.resolve().then(fn);
}

export function enqueueSetState (stateChange,component){
    if (queue.length === 0) {
        defer(flush);
    }
    queue.push({stateChange,component});
    //若renderQueue中没有component才将其放入renderQueue
    if (!renderQueue.some(item => item === component)) {
        renderQueue.push(component);
    }
}


function flush() {
    let component;
    //将queue中的setState整合起来
    while (queue.length !== 0) {
        const { stateChange,component } = queue.shift();
        //若没有prevState则初始化prevState为当前state
        if (!component.prevState) {
            component.prevState = Object.assign({},component.state);
        }
        //若setState传入为函数
        if (typeof stateChange === "function") {
            Object.assign(component.state,stateChange(component.prevState,component.state));
        //若setState传入为对象
        } else {
            Object.assign(component.state,stateChange);
        }
        component.prevState = component.state;
    }
    //依次渲染component
    while (renderQueue.length !== 0) {
        component = renderComponent.shift();
        renderComponent(component);
    }
}