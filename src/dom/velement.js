/**
 * Created by zpc on 2017/5/18.
 */
define(["../core"],function (Ti) {
    var VElement = function (tagName,props,children,textContent) {
        this.tagName = tagName;
        this.props = (typeof props == "object" && !Ti.isArray(props))?props : {};
        this.children = (children && Ti.isArray(children))?children:[];
        if(textContent){
            this.textContent = Ti.trim(textContent);
        }
    };
    VElement.prototype = {
        getAttr:function (name) {
            return this.props[name] || undefined;
        },
        setAttr:function (name,value) {
            try {
                this.props[name] = value;
            }catch (e){
                console.log(e);
            }
        },
        delAttr:function (name) {
            try{
                if(this.props[name]){
                    var prop = this.props[name];
                    delete this.props[name];
                    return prop;
                }else{
                    return "";
                }

            }catch (e){
                console.log(e);
            }
        },
        hasAttr:function (name) {
            return (name in this.props);
        }
    };
    return VElement;
});