export function setAttributes(dom,key,value) {
    //替换className为class
    if (key === "className") {
        key = "class";
    }
    //key为onXXXX的为事件
    if (/on\w+/.test(key)) {
        key = key.toLowerCase();//onClick => onclick
        dom[key] = value || "";
    } else if (key === "style") {//更新style
        if (!value || typeof value === "string") {
            dom.style.cssText = value || "";
        }else if (value && typeof value === "object") {
            for (let name in value) {
                dom.style[name] = typeof value[name] === "number" ? value[name] + "px":value[name];
            }
        }
    }else {//普通属性,可以直接更新 
        if (key in dom) {
            dom[key] = value;
        }
        if (value) {
            dom.setAttribute(key,value);//real dom api
        } else {
            dom.removeAttribute(name);
        }
    }
}