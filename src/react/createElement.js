
//创造虚拟DOM的函数
//tags: h1,div...
//attrs:DOM的attributes,为object
//剩下的参数为子DOM
function createElement(tag,attrs,...children){
    return {
        tag,
        attrs,
        children
    }
}

export default createElement;