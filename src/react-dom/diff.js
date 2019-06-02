import { Component } from '../react';
import { setAttributes } from './dom';

//对比当前真实的DOM和虚拟DOM，在对比过程中直接更新真实DOM
//只对比同一层级的变化

/*  
@param {HTMLELement} dom 真实DOM
@param {vnode} vNode 虚拟DOM
@param {HTMLElement} container 真实容器DOM
@return {HTMLElement} 更新后真实DOM
*/
export function diff(dom,vNode,container) {

}

//@return {HTMLElement}
function diffNode(dom,vNode) {
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
            //若之前DOM不是文字节点则新建一个文字节点并删除之前的
            newDom = document.createTextNode(vNode);
            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild(newDom,dom);
            }
        }
        return newDom;
    }
    //函数或类型组件
    if (typeof vNode.tag === "function") {

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
        diffChildren(dom,vNode);
    }
    diffAttributes(newDom,vNode);
    return newDom
}

//更新子节点
function diffChildren(dom,vNode) {

}

//对比并更新dom节点的attributes
function diffAttributes(dom,vNode) {

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