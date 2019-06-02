import Component from '../react/component';
import { setAttributes } from './dom';

//虚拟DOM => 实际DOM
//{return:HTMLDom}
function _render(vNode) {
    if (vNode === undefined || vNode === null ||typeof vNode === "boolean") {
        vNode = "";
    }
    //tag为字符串则此虚拟DOM为原生HTML组件
    if (typeof vNode === "string" || typeof vNode === "number") {
        let textNode = document.createTextNode(vNode);
        return textNode;
    }
    //component.base保存的是组件的dom对象
    //tag为函数则此虚拟DOM为自造组件
    if(typeof vNode.tag === "function") {
        let component = createComponent(vNode.tag,vNode.attrs);
        setComponentProps(component,vNode.attrs);
        return component.base;
    }
    let dom = document.createElement(vNode.tag);
    //对于原生组件直接用setAttributes把所有属性全部设置好
    //若虚拟DOM有attrs则将每个attrs属性都绑到实际DOM上
    if (vNode.attrs) {
        Object.keys(vNode.attrs).forEach(key => {
            setAttributes(dom,key,vNode.attrs[key]);    
        });
    }
    //每个自定义组件最外层为<div></div>所以可以进行递归渲染
    //递归渲染子节点
    vNode.children.forEach(child => render(child,dom));
    return dom;
}


//返回类组件或函数型组件扩展为类组件的实例
//{return:React.Component}
function createComponent(component,props) {
    let instance;
    //若为类组件则可以直接返回实例,且有render方法
    if(component.prototype && component.prototype.render) {
        instance = new component(props);
    } else {
        //函数组件则扩展定义为类组件
        //增加render方法
        instance = new Component( props );
        instance.constructor = component;
        instance.render = function() {
            //this -> instance
            //返回vNode(tag,attr,children)
            return this.constructor(props);
        }
    }
    //返回instance(base,render方法,props属性)
    console.log(instance);
    return instance;
}

//更新props
//实现componentWillMount和componentWillReceiveProps方法
function setComponentProps(component,props) {
    //生成实际DOM前触发componentWilMount方法
    if(!component.base) {
        if (component.componentWillMount) {
            component.componentWillMount();
        }
    }else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(props);
    }
    component.props = props;
    renderComponent(component);
}

//用于渲染组件,输入为类组件
//component.base保存的是实际DOM，
//反过来base._component保存的是dom对象所对应的instance实例，为了把他们关联起来
//可实现componentWillUpdate,componentDidUpdate,componentDidMount
export function renderComponent(component) {
    let base;
    let render = component.render();//返回instance,虚拟DOM
    //有实际DOM时才可出发componentWillUpdate
    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate();
    }
    base = _render(render);//用虚拟dom生成实际DOM
    //更新实际DOM之后触发componentDidXXXX事件
    if(component.base) {
        if (component.componentDidUpdate) {
            component.componentDidUpdate();
        }
    }else if (component.componentDidMount) {
        component.componentDidMount();    
    }
    if (component.base && component.base.parentNode) {
        //将component.base替换成base
        //更新此节点为重新渲染后的节点base,并重新绑定
        component.base.parentNode.replaceChild(base,component.base);
    }
    component.base = base;
    base._component = component;
}

function unmountComponent(component) {
    if (component.componentWillUnmount) {
        component.componentWillUnmount();
    }
    removeNode(component.base);
}

//将_render函数后返回的实际DOM再绑到container DOM下面
//并返回实际DOM container节点
export function render(vNode,container) {
    //mount rendered dom to container
    return container.appendChild(_render(vNode));
}