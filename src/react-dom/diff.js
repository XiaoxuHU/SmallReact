import { Component } from '../react';
import { setAttributes } from './dom';
import { unmountComponent,setComponentProps,createComponent } from './render';

//对比当前真实的DOM和虚拟DOM，在对比过程中直接更新真实DOM
//只对比同一层级的变化

/*  
@param {HTMLELement} dom 真实DOM
@param {vnode} vNode 虚拟DOM
@param {HTMLElement} container 真实容器DOM
@return {HTMLElement} 更新后真实DOM
*/
//对比节点及子节点并连在container节点下面
export function diff(dom,vNode,container) { 
    const result = diffNode(dom,vNode);
    if (container && result.parentNode !== container) {
        container.appendChild(result);
    }
    return result;
}

//@return {HTMLElement}
//对比节点及子节点
//若节点不一样则直接删除旧节点并将子节点全部连在新生成节点上面
export function diffNode(dom,vNode) {
    let newDom = dom;
    if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
        vNode = "";
    }
    if (typeof vNode === "number") {
        vNode = vNode.toString();
    }
    //对比text node
    if (typeof vNode === "string") {
        //dom为文字且与vNode不同
        if (dom && dom.nodeType === 3 && dom.textContent !== vNode) {
            dom.textContent = vNode;    
        } else {
            //若之前DOM不是文字节点则新建一个文字节点并删除旧节点
            newDom = document.createTextNode(vNode);
            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild(newDom,dom);
            }
        }
        return newDom;
    }
    //函数或类型组件
    if (typeof vNode.tag === "function") {
        return diffComponent(dom,vNode);
    }
    //若vNode与dom的类型不一样则生成一个新dom替换原来dom
    if(!dom || !isSameNodeType(dom,vNode)) {
        newDom = document.createElement(vNode.tag);
        if (dom) {
            //把所以子节点(不止底下一层)全部连在newDom上
            let children = [...dom.childNodes];
            children.map(child => newDom.appendChild(child));
            //把dom替换成newDom并移除dom
            if (dom.parentNode) {
                dom.parentNode.replaceChild(newDom,dom);
            }
        }
    }
    if((vNode.children && vNode.children.length > 0) || (newDom.childNodes && newDom.childNodes.length > 0)){
        diffChildren(newDom,vNode);
    }
    diffAttributes(newDom,vNode);
    return newDom;
}

//更新自定义组件 
//@return { HTMLELement }   
function diffComponent(dom,vNode) {
    let compoent = dom && dom._component;
    let oldDom = dom;
    //组件类型无变化,则可以只更新props
    if (compoent && compoent.constructor === vNode.tag) {
        setComponentProps(compoent,vNode.attrs);
        dom = compoent.base;
    //组件类型有变化则移除原组件并渲染新组件
    } else {
        if (compoent) {
            unmountComponent(compoent);
            oldDom = null;
        }
        compoent = createComponent(vNode.tag,vNode.attrs);
        setComponentProps(compoent,vNode.attrs);
        //将重新生成的新dom(component.base)赋给dom
        dom = compoent.base;
        //对比旧dom与新dom,并决定是否移除旧dom
        if (oldDom && oldDom !== dom) {
            oldDom._component = null;
            removeNode(oldDom);
        }
    }
    return dom;
}

//对比并更新dom节点的attributes
function diffAttributes(dom,vNode) {
    const domAttrs = {};
    const vNodeAttrs = vNode.attrs;
    for (let i = 0;i < dom.attributes.length;i++) {
        let attr = dom.attributes[i];
        domAttrs[attr.name] = attr.value;
    }
    for (let name in domAttrs) {
        //若原属性不在vNode中,则置为null
        //若属性值不同则更新为vNode的属性
        if(!(name in vNodeAttrs)) {
            setAttributes(dom,name,null);
        }
    }
    for (let name in vNodeAttrs) {
        if (domAttrs[name] !== vNodeAttrs[name]) {
            setAttributes(dom,name,vNodeAttrs[name]);
        }
    }
}

//更新子节点,子节点为数组有key值
function diffChildren(dom,vNode) {
    const domChildren = dom.childNodes;
    const vNodeChildren = vNode.children;
    const map = {};//有key的节点,{key:childNode}
    const noKey = [];//没有key的节点
    if (domChildren.length > 0) {
        //有key值的放入map中,没有的放入noKey数组中
        for (let i = 0;i < domChildren.length;i++) {
            let child = domChildren[i],key = child.key;
            if (key) {
                map[key] = child;
            } else {
                noKey.push(child);
            }
        }
    }
    if (vNodeChildren && vNodeChildren.length > 0) {
        let min = 0;
        let noKeyLen = noKey.length;
        for (let i = 0;i < vNodeChildren.length;i++) {
            let vChild = vNodeChildren[i],key = vChild.key;
            let child;
            //有key,找到对应map中的实际DOM节点
            if (key) {
                if (map[key]) {
                    child = map[key];
                    map[key] = null;
                }
            //没有key,在noKey数组中找一个相同类型的DOM节点
            } else if (min < noKeyLen) {
                for (let j = min;j < noKeyLen;j++) {
                    let component = noKey[j];
                    if (component && isSameNodeType(component,vChild))  {
                        child = component;
                        noKey[j] = null;
                        if (j === noKeyLen - 1) noKeyLen--;
                        if (j === min) min++;
                        break;
                    } 
                }
            }
            //更新子节点真实DOM
            child = diff(child,vChild);
            let domChild = domChildren[i];
            if (child && child !== dom && child !== domChild) {
                //如果无更新前节点,则此节点为新增
                if (!domChild) {
                    dom.appendChild(child);
                //若更新后节点与更新前下一个节点一样
                } else if (child === domChild.nextSibling) {
                    removeNode(domChild);
                //将更新后节点移动
                } else {
                    dom.insertBefore(child,domChild);
                }
            }
        }
    }
}

//查看真实DOM与虚拟的是否为同类型
//@param {HTMLElement}dom 真实DOM
//@param {vnode} vNode 虚拟DOM
//@return {boolean}
function isSameNodeType(dom,vNode) {
    if (typeof vNode === "string" || typeof vNode === "number") {
        return dom.nodeType === 3;
    }
    //原生组件对比
    if (typeof vNode.tag === "string") {
        return dom.nodeName.toLowerCase() === vNode.tag.toLowerCase();
    }
    //自定义组件对比,dom._component是真实DOM对应的instance
    return dom && dom._component && dom._component.constructor === vNode.tag;
}

//移除实际DOM
function removeNode(dom) {
    if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
    }
}


