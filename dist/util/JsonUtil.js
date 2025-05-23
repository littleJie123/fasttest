"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let keyMap = {
    $toArray: function (key) {
        return function (obj) {
            return ArrayUtil_1.ArrayUtil.toArray(obj, key);
        };
    }
};
function acqFunByKey(key) {
    let keyArray = key.split('|');
    let funGeter = keyMap[keyArray[0]];
    if (funGeter)
        return funGeter.apply(null, keyArray.slice(1));
}
function init(obj, keys) {
    for (var i = 0; i < keys.length - 1; i++) {
        var key = keys[i];
        if (obj[key] == null) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    return obj;
}
function setKey(obj, key, param) {
    if (key instanceof Function) {
        key(obj, param);
    }
    else {
        obj[key] = param;
    }
    return param;
}
class JsonUtil {
    static parseJson(json, opt) {
        if (json == null || opt == null) {
            return json;
        }
        if (json instanceof Array) {
            let array = [];
            for (let e of json) {
                array.push(this.changeVal(e, opt));
            }
            return array;
        }
        else {
            let ret = {};
            for (let e in json) {
                ret[e] = this.changeVal(json[e], opt);
            }
            return ret;
        }
    }
    static changeVal(val, opt) {
        if (val instanceof Array) {
            let array = [];
            for (let e of val) {
                array.push(this.changeVal(e, opt));
            }
            return array;
        }
        if (NumUtil_1.default.isNum(val)) {
            return val;
        }
        if (val instanceof Date) {
            return val;
        }
        if (StrUtil_1.StrUtil.isStr(val)) {
            return this.parseStr(val, opt);
        }
        let ret = {};
        for (let e in val) {
            ret[e] = this.changeVal(val[e], opt);
        }
        return ret;
    }
    static parseStr(val, opt) {
        if (val.startsWith('${') && val.endsWith('}')) {
            let key = val.substring(2, val.length - 1);
            key = key.trim();
            let ret = this.getByKeys(opt, key);
            if (ret == null) {
                throw new Error('找不到变量:' + key);
            }
            return ret;
        }
        else {
            return val;
        }
    }
    /**
     * 为Pojo写的copy方法
     */
    static copyPojo(clazzName, srcPojo, targetPojo) {
        let pk = StrUtil_1.StrUtil.firstLower(clazzName) + 'Id';
        let notCols = [pk, 'contextId', 'sysAddTime', 'sysModifyTime', 'addUser', 'modifyUser'];
        for (let e in srcPojo) {
            if (!notCols.includes(e) && !e.startsWith('__')) {
                targetPojo[e] = srcPojo[e];
            }
        }
    }
    static adds(obj, keys, param) {
        if (keys == null) {
            return;
        }
        if (!(keys instanceof Array)) {
            keys = [keys];
        }
        if (keys.length == 0 ||
            obj == null ||
            param == null) {
            return;
        }
        var obj = init(obj, keys);
        var key = keys[keys.length - 1];
        if (key) {
            if (obj[key] == null) {
                obj[key] = [];
            }
        }
        if (!(param instanceof Array))
            param = [param];
        for (let data of param)
            obj[key].push(data);
        return obj;
    }
    /**
     * 和set 的区别，是支持用aaa.bbb.cc的格式表示多级
     * @param obj
     * @param keyStr
     * @param value
     */
    static setByKeys(obj, keyStr, value) {
        let keys = keyStr.split('.');
        this.set(obj, keys, value);
    }
    /**
     * 只保留某些字段，支持多级
     * @param obj
     * @param keyStrArray
     * @returns
     */
    static onlyKeys(obj, keyStrArray) {
        let newObj = {};
        for (let keyStr of keyStrArray) {
            this.setByKeys(newObj, keyStr, this.getByKeys(obj, keyStr));
        }
        return newObj;
    }
    /**
     * 对数组的每个元素进行onlyKeys的操作
     * @param obj
     * @param keyStrArray
     */
    static onlyKeys4List(objs, keyStrArray) {
        if (keyStrArray == null) {
            return objs;
        }
        let array = [];
        for (let obj of objs) {
            array.push(this.onlyKeys(obj, keyStrArray));
        }
        return array;
    }
    /**
     * 和get 的区别，是支持用aaa.bbb.cc的格式表示多级
     * @param obj
     * @param keyStr
     * @returns
     */
    static getByKeys(obj, keyStr) {
        if (keyStr == null || keyStr == '') {
            return obj;
        }
        let keyArray = keyStr.split('.');
        for (var key of keyArray) {
            if (obj == null) {
                return null;
            }
            let fun = acqFunByKey(key);
            if (fun != null) {
                obj = fun(obj);
            }
            else {
                obj = obj[key];
            }
        }
        return obj;
    }
    /**
      把一个值加到数组中
      
     obj 目标
     keys 设置的key列表
     param 设置值
    */
    static add(obj, keys, param) {
        if (keys == null) {
            return;
        }
        if (!(keys instanceof Array)) {
            keys = [keys];
        }
        if (keys.length == 0 ||
            obj == null ||
            param == null) {
            return;
        }
        var obj = init(obj, keys);
        var key = keys[keys.length - 1];
        if (key) {
            if (obj[key] == null) {
                obj[key] = [];
            }
        }
        obj[key].push(param);
        return obj;
    }
    /**
     设置一个值
     obj 目标
     keys 设置的key列表
     param 设置值
    */
    static set(obj, keys, param) {
        if (keys == null) {
            return;
        }
        if (!(keys instanceof Array)) {
            keys = [keys];
        }
        if (keys.length == 0 ||
            obj == null ||
            param == null) {
            return;
        }
        var obj = init(obj, keys);
        var key = keys[keys.length - 1];
        if (key) {
            setKey(obj, key, param);
        }
        return param;
    }
    /**
     * 取值
     * @param obj
     * @param keys
     */
    static get(obj, keys) {
        if (keys == null) {
            return null;
        }
        if (!(keys instanceof Array)) {
            keys = [keys];
        }
        for (var key of keys) {
            if (obj == null) {
                return null;
            }
            obj = obj[key];
        }
        return obj;
    }
}
exports.default = JsonUtil;
const ArrayUtil_1 = require("./ArrayUtil");
const StrUtil_1 = require("./StrUtil");
const NumUtil_1 = __importDefault(require("./NumUtil"));
