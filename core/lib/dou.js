(function () {
    let f, p;
    p = Object.prototype;
    Object.defineProperties(p, {
        clearAllProperty: {
            value: function () {
                for (let key in this) {
                    delete this[key];
                }
            },
            enumerable: false
        }
    });
    p = String.prototype;
    Object.defineProperties(p, {
        splitNum: {
            value: function (separator, limit) {
                let arr = this.split(separator, limit);
                for (let i = 0, len = arr.length; i < len; i++) {
                    arr[i] = parseFloat(arr[i]);
                }
                return arr;
            },
            enumerable: false
        },
    });
    f = Array;
    f.NORMAL = 0;
    f.CASEINSENSITIVE = 1;
    f.DESCENDING = 2;
    f.RETURNINDEXEDARRAY = 4;
    f.NUMERIC = 8;
    p = Array.prototype;
    Object.defineProperties(p, {
        pushUnique: {
            value: function (...args) {
                for (let v of args) {
                    if (this.indexOf(v) == -1) {
                        this[this.length] = v;
                    }
                }
                return this.length;
            },
            enumerable: false
        },
        sortOn: {
            value: function (fieldNames, options) {
                let array = this;
                if (!Array.isArray(fieldNames)) {
                    fieldNames = [fieldNames];
                }
                if (!Array.isArray(options)) {
                    options = [options];
                }
                if (fieldNames.length !== options.length) {
                    options = new Array(fieldNames.length).fill(0);
                }
                let returnIndexedArray = options[0] & Array.RETURNINDEXEDARRAY;
                if (returnIndexedArray) {
                    array = Array.from(array);
                }
                let functions = fieldNames.map(function (fieldName, index) {
                    return createComparisonFn(fieldName, options[index]);
                });
                let sorted = array.sort(function (a, b) {
                    return functions.reduce(function (result, fn) {
                        return result || fn(a, b);
                    }, 0);
                });
                return returnIndexedArray ? sorted : undefined;
                function createComparisonFn(fieldName, options) {
                    options = options || 0;
                    let transformations = [];
                    if (fieldName) {
                        transformations.push(function () {
                            return this[fieldName];
                        });
                    }
                    transformations.push((options & Array.NUMERIC)
                        ? function () {
                            return parseFloat(this);
                        }
                        : function () {
                            return (typeof this === 'string' && this)
                                || (typeof this === 'number' && '' + this)
                                || (this && this.toString())
                                || this;
                        });
                    if (options & Array.CASEINSENSITIVE) {
                        transformations.push(String.prototype.toLowerCase);
                    }
                    transformations.apply = Array.prototype.reduce.bind(transformations, function (value, transformation) {
                        return transformation.apply(value);
                    });
                    let AGreaterThanB = (options & Array.DESCENDING) ? -1 : 1;
                    let ALessThanB = -AGreaterThanB;
                    return function (a, b) {
                        a = transformations.apply(a);
                        b = transformations.apply(b);
                        if (a > b || (a != null && b == null)) {
                            return AGreaterThanB;
                        }
                        if (a < b || (a == null && b != null)) {
                            return ALessThanB;
                        }
                        return 0;
                    };
                }
            },
            enumerable: false
        },
        remove: {
            value: function (item) {
                let index = this.indexOf(item);
                if (index > -1) {
                    this.splice(index, 1);
                    return true;
                }
                return false;
            },
            enumerable: false
        },
        shuffle: {
            value: function () {
                for (let i = 0, len = this.length; i < len; i++) {
                    let index = Math.round(Math.random() * (len - 1));
                    let t = this[i];
                    this[i] = this[index];
                    this[index] = t;
                }
                return this;
            },
            enumerable: false
        }
    });
    p = Date.prototype;
    Object.defineProperties(p, {
        format: {
            value: function (template) {
                let map = {
                    "M+": this.getMonth() + 1,
                    "d+": this.getDate(),
                    "h+": this.getHours(),
                    "m+": this.getMinutes(),
                    "s+": this.getSeconds(),
                    "q+": Math.floor((this.getMonth() + 3) / 3),
                    "S": this.getMilliseconds()
                };
                if (/(y+)/.test(template)) {
                    template = template.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (let k in map) {
                    if (new RegExp("(" + k + ")").test(template)) {
                        template = template.replace(RegExp.$1, (RegExp.$1.length == 1) ? (map[k]) : (("00" + map[k]).substr(("" + map[k]).length)));
                    }
                }
                return template;
            },
            enumerable: false
        },
    });
})();
var dou;
(function (dou) {
    /**
     * 心跳计时器基类
     * 请使用 requestAnimationFrame 来调用 update 方法, 或者保证每 1/60 秒调用 update 方法 1 次
     * @author wizardc
     */
    class TickerBase {
        constructor() {
            this._lastTimeStamp = 0;
            this._paused = false;
            TickerBase.$startTime = Date.now();
            this._frameRateList = [60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1];
            this.frameRate = 60;
        }
        /**
         * 设置帧率
         * 注意: 只能设置为可以被 60 整除的帧率, 包括 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1
         */
        set frameRate(value) {
            this.setFrameRate(value);
            this._frameCount = 60 / this._frameRate;
            this._lastCount = 0;
        }
        get frameRate() {
            return this._frameRate;
        }
        /**
         * 是否暂停
         */
        get paused() {
            return this._paused;
        }
        setFrameRate(value) {
            value = +value || 0;
            for (let i = 0, len = this._frameRateList.length; i < len; i++) {
                let frameRate = this._frameRateList[i];
                if (value >= frameRate) {
                    this._frameRate = frameRate;
                    return;
                }
            }
            this._frameRate = 1;
        }
        /**
         * 暂停计时器
         */
        pause() {
            this._paused = true;
        }
        /**
         * 恢复计时器
         */
        resume() {
            this._paused = false;
        }
        /**
         * 执行一次更新逻辑
         */
        update() {
            if (this._paused) {
                return;
            }
            this._lastCount++;
            if (this._lastCount >= this._frameCount) {
                this._lastCount = 0;
                let now = dou.getTimer();
                let interval = now - this._lastTimeStamp;
                this._lastTimeStamp = now;
                this.updateLogic(interval);
            }
        }
    }
    TickerBase.$startTime = 0;
    dou.TickerBase = TickerBase;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 事件发送器
     * @author wizardc
     */
    class EventDispatcher {
        constructor(target) {
            this._eventMap = {};
            this._eventTarget = target;
        }
        on(type, listener, thisObj) {
            this.addEventListener(type, listener, thisObj, false);
        }
        once(type, listener, thisObj) {
            this.addEventListener(type, listener, thisObj, true);
        }
        addEventListener(type, listener, thisObj, once) {
            let map = this._eventMap;
            if (!map.hasOwnProperty(type)) {
                map[type] = [];
            }
            let list = map[type];
            for (let i = 0, len = list.length; i < len; i++) {
                let bin = list[i];
                if (bin.listener == listener && bin.thisObj == thisObj) {
                    return false;
                }
            }
            let eventBin = dou.recyclable(EventBin);
            eventBin.listener = listener;
            eventBin.thisObj = thisObj;
            eventBin.once = once;
            list.push(eventBin);
            return true;
        }
        has(type) {
            return this._eventMap.hasOwnProperty(type) && this._eventMap[type].length > 0;
        }
        dispatch(event) {
            event.$setTarget(this._eventTarget || this);
            return this.$notify(event);
        }
        $notify(event) {
            let map = this._eventMap;
            if (!map.hasOwnProperty(event.type)) {
                return true;
            }
            let list = map[event.type];
            if (list.length == 0) {
                return true;
            }
            let currentIndex = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                let bin = list[i];
                if (bin) {
                    let listener = bin.listener;
                    let thisObj = bin.thisObj;
                    if (bin.once) {
                        bin.recycle();
                        list[i] = null;
                    }
                    else {
                        if (currentIndex != i) {
                            list[currentIndex] = bin;
                            list[i] = null;
                        }
                        currentIndex++;
                    }
                    listener.call(thisObj, event);
                }
            }
            if (currentIndex != i) {
                length = list.length;
                while (i < length) {
                    list[currentIndex++] = list[i++];
                }
                list.length = currentIndex;
            }
            event.$setTarget(null);
            return !event.$isDefaultPrevented();
        }
        off(type, listener, thisObj) {
            let map = this._eventMap;
            if (map.hasOwnProperty(type)) {
                let list = map[event.type];
                for (let i = 0, len = list.length; i < len; i++) {
                    let info = list[i];
                    if (info && info.listener == listener && info.thisObj == thisObj) {
                        info.recycle();
                        list[i] = null;
                        break;
                    }
                }
            }
        }
    }
    dou.EventDispatcher = EventDispatcher;
    class EventBin {
        onRecycle() {
            this.listener = this.thisObj = this.once = null;
        }
    }
})(dou || (dou = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchEvent: {
            value: function (type, data, cancelable) {
                let event = dou.recyclable(dou.Event);
                event.$initEvent(type, data, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou;
(function (dou) {
    /**
     * 事件类
     * @author wizardc
     */
    class Event {
        constructor() {
            this._isDefaultPrevented = false;
        }
        get type() {
            return this._type;
        }
        get data() {
            return this._data;
        }
        get cancelable() {
            return this._cancelable;
        }
        get target() {
            return this._target;
        }
        $initEvent(type, data, cancelable) {
            this._type = type;
            this._data = data;
            this._cancelable = cancelable;
        }
        $setTarget(target) {
            this._target = target;
        }
        /**
         * 如果可以取消事件的默认行为, 则取消该行为
         */
        preventDefault() {
            if (this._cancelable) {
                this._isDefaultPrevented = true;
            }
        }
        $isDefaultPrevented() {
            return this._isDefaultPrevented;
        }
        onRecycle() {
            this._type = null;
            this._data = null;
            this._cancelable = null;
            this._isDefaultPrevented = false;
            this._target = null;
        }
    }
    Event.OPEN = "open";
    Event.CHANGE = "change";
    Event.COMPLETE = "complete";
    Event.SOUND_COMPLETE = "soundComplete";
    Event.MESSAGE = "message";
    Event.CLOSE = "close";
    dou.Event = Event;
})(dou || (dou = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchIOErrorEvent: {
            value: function (type, msg, cancelable) {
                let event = dou.recyclable(dou.IOErrorEvent);
                event.$initIOErrorEvent(type, msg, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou;
(function (dou) {
    /**
     * IO 错误事件类
     * @author wizardc
     */
    class IOErrorEvent extends dou.Event {
        get msg() {
            return this._msg;
        }
        $initIOErrorEvent(type, msg, cancelable) {
            this.$initEvent(type, null, cancelable);
            this._msg = msg;
        }
        onRecycle() {
            super.onRecycle();
            this._msg = null;
        }
    }
    IOErrorEvent.IO_ERROR = "ioError";
    dou.IOErrorEvent = IOErrorEvent;
})(dou || (dou = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchProgressEvent: {
            value: function (type, loaded, total, cancelable) {
                let event = dou.recyclable(dou.ProgressEvent);
                event.$initProgressEvent(type, loaded, total, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou;
(function (dou) {
    /**
     * 进度事件类
     * @author wizardc
     */
    class ProgressEvent extends dou.Event {
        get loaded() {
            return this._loaded;
        }
        get total() {
            return this._total;
        }
        $initProgressEvent(type, loaded, total, cancelable) {
            this.$initEvent(type, null, cancelable);
            this._loaded = loaded;
            this._total = total;
        }
        onRecycle() {
            super.onRecycle();
            this._loaded = null;
            this._total = null;
        }
    }
    ProgressEvent.PROGRESS = "progress";
    dou.ProgressEvent = ProgressEvent;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * HTTP 请求加载器基类
     * @author wizardc
     */
    class RequestAnalyzerBase {
        load(url, callback, thisObj) {
            let request = new dou.HttpRequest();
            request.responseType = this.getResponseType();
            request.on(dou.Event.COMPLETE, (event) => {
                callback.call(thisObj, url, this.dataAnalyze(request.response));
            }, this);
            request.on(dou.IOErrorEvent.IO_ERROR, (event) => {
                callback.call(thisObj, url);
            }, this);
            request.open(url, dou.HttpMethod.GET);
            request.send();
        }
        release(data) {
            return true;
        }
    }
    dou.RequestAnalyzerBase = RequestAnalyzerBase;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 文本加载器
     * @author wizardc
     */
    class TextAnalyzer extends dou.RequestAnalyzerBase {
        getResponseType() {
            return dou.HttpResponseType.text;
        }
        dataAnalyze(data) {
            return data;
        }
    }
    dou.TextAnalyzer = TextAnalyzer;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * JSON 加载器
     * @author wizardc
     */
    class JsonAnalyzer extends dou.RequestAnalyzerBase {
        getResponseType() {
            return dou.HttpResponseType.text;
        }
        dataAnalyze(data) {
            return JSON.parse(data);
        }
    }
    dou.JsonAnalyzer = JsonAnalyzer;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 二进制加载器
     * @author wizardc
     */
    class BytesAnalyzer extends dou.RequestAnalyzerBase {
        getResponseType() {
            return dou.HttpResponseType.arraybuffer;
        }
        dataAnalyze(data) {
            return new dou.ByteArray(data);
        }
    }
    dou.BytesAnalyzer = BytesAnalyzer;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 声音加载器
     * @author wizardc
     */
    class SoundAnalyzer {
        load(url, callback, thisObj) {
            let sound = new dou.Sound();
            sound.on(dou.Event.COMPLETE, () => {
                callback.call(thisObj, url, sound);
            });
            sound.on(dou.IOErrorEvent.IO_ERROR, () => {
                callback.call(thisObj, url);
            });
            sound.load(url);
        }
        release(data) {
            if (data) {
                data.close();
                return true;
            }
            return false;
        }
    }
    dou.SoundAnalyzer = SoundAnalyzer;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 加载管理器
     * @author wizardc
     */
    class LoadManager {
        constructor() {
            this._maxLoadingThread = 5;
            this._resourceRoot = "";
            this._nowLoadingThread = 0;
            this._analyzerMap = {};
            this._extensionMap = {};
            this._priorityList = [];
            this._priorityMap = {};
            this._keyMap = {};
            this._loadingMap = {};
            this._cacheTypeMap = {};
            this._cacheDataMap = {};
        }
        static get instance() {
            return LoadManager._instance || (LoadManager._instance = new LoadManager());
        }
        /**
         * 最大的下载线程数
         */
        set maxLoadingThread(value) {
            this._maxLoadingThread = value;
        }
        get maxLoadingThread() {
            return this._maxLoadingThread;
        }
        /**
         * 资源根路径
         */
        set resourceRoot(value) {
            this._resourceRoot = value || "";
        }
        get resourceRoot() {
            return this._resourceRoot;
        }
        /**
         * 注册加载器
         */
        registerAnalyzer(type, analyzer) {
            this._analyzerMap[type] = analyzer;
        }
        /**
         * 注册后缀名和其对应的默认类型
         */
        registerExtension(extension, type) {
            this._extensionMap[extension] = type;
        }
        /**
         * 加载指定项
         */
        load(url, callback, thisObj, type, priority = 0, cache = true) {
            if (this.isLoaded(url)) {
                callback.call(thisObj, this.get(url), url);
                return;
            }
            if (!type) {
                type = this.getDefaultType(url);
            }
            if (!this._analyzerMap[type]) {
                console.error(`Can not find resource type: "${type}"`);
                return;
            }
            let item = { url, type, priority, cache, callback, thisObj };
            if (!this._priorityMap[priority]) {
                this._priorityList.push(priority);
                this._priorityList.sort(this.sortFunc);
                this._priorityMap[priority] = [];
            }
            let list = this._priorityMap[priority];
            list.push(item);
            if (!this._keyMap[item.url]) {
                this._keyMap[item.url] = [];
            }
            this._keyMap[item.url].push(item);
            this.loadNext();
        }
        getDefaultType(url) {
            let suffix;
            let regexp = /\.(\w+)\?|\.(\w+)$/;
            let result = regexp.exec(url);
            if (result) {
                suffix = result[1] || result[2];
            }
            if (this._extensionMap.hasOwnProperty(suffix)) {
                return this._extensionMap[suffix];
            }
            return suffix;
        }
        sortFunc(a, b) {
            return b - a;
        }
        loadNext() {
            if (this._nowLoadingThread >= this._maxLoadingThread) {
                return;
            }
            let item;
            for (let priority of this._priorityList) {
                let list = this._priorityMap[priority];
                if (list.length > 0) {
                    item = list.shift();
                    break;
                }
            }
            if (item) {
                if (this._loadingMap[item.url]) {
                    this.loadNext();
                }
                else {
                    this._nowLoadingThread++;
                    this._loadingMap[item.url] = true;
                    let analyzer = this._analyzerMap[item.type];
                    analyzer.load(this._resourceRoot + item.url, (url, data) => {
                        this._nowLoadingThread--;
                        delete this._loadingMap[url];
                        let items = this._keyMap[url];
                        if (items && items.length > 0) {
                            for (let item of items) {
                                if (this._priorityMap[item.priority]) {
                                    let list = this._priorityMap[item.priority];
                                    let index = list.indexOf(item);
                                    if (index != -1) {
                                        list.splice(index, 1);
                                    }
                                }
                                if (item.cache && data) {
                                    this._cacheTypeMap[item.url] = item.type;
                                    this._cacheDataMap[item.url] = data;
                                }
                                if (item.callback) {
                                    item.callback.call(item.thisObj, data, url);
                                }
                            }
                            delete this._keyMap[url];
                        }
                        this.loadNext();
                    }, this);
                }
            }
        }
        loadAsync(url, type, priority = 0, cache = true) {
            return new Promise((resolve, reject) => {
                this.load(url, (url, data) => {
                    if (data) {
                        resolve(data);
                    }
                    else {
                        reject("Load Error: " + url);
                    }
                }, this, type, priority, cache);
            });
        }
        /**
         * 加载多个指定项
         */
        loadGroup(items, callback, thisObj) {
            let current = 0, total = items.length;
            let itemCallback = (url, data) => {
                current++;
                callback.call(thisObj, current, total, url, data);
            };
            for (let item of items) {
                this.load(item.url, itemCallback, this, item.type, item.priority, item.cache);
            }
        }
        loadGroupAsync(items) {
            return new Promise((resolve, reject) => {
                this.loadGroup(items, (current, total, url, data) => {
                    if (current == total) {
                        resolve();
                    }
                }, this);
            });
        }
        /**
         * 资源是否已经加载并缓存
         */
        isLoaded(url) {
            return this._cacheDataMap.hasOwnProperty(url);
        }
        /**
         * 获取已经加载并缓存的资源
         */
        get(url) {
            return this._cacheDataMap[url];
        }
        /**
         * 释放已经加载并缓存的资源
         */
        release(url) {
            if (this.isLoaded(url)) {
                let type = this._cacheTypeMap[url];
                let analyzer = this._analyzerMap[type];
                if (!analyzer) {
                    return false;
                }
                let data = this._cacheDataMap[url];
                let success = analyzer.release(data);
                if (success) {
                    delete this._cacheTypeMap[url];
                    delete this._cacheDataMap[url];
                }
                return success;
            }
            return false;
        }
    }
    dou.LoadManager = LoadManager;
    /**
     * 加载管理器快速访问
     */
    dou.loader = LoadManager.instance;
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        /**
         * 声音
         * * Audio 标签实现
         * @author wizardc
         */
        class AudioSound extends dou.EventDispatcher {
            constructor(target) {
                super(target);
            }
            static pop(url) {
                let array = AudioSound._audios[url];
                if (array && array.length > 0) {
                    return array.pop();
                }
                return null;
            }
            static recycle(url, audio) {
                if (AudioSound._clearAudios[url]) {
                    return;
                }
                let array = AudioSound._audios[url];
                if (AudioSound._audios[url] == null) {
                    array = AudioSound._audios[url] = [];
                }
                array.push(audio);
            }
            static clear(url) {
                AudioSound._clearAudios[url] = true;
                let array = AudioSound._audios[url];
                if (array) {
                    array.length = 0;
                }
            }
            get length() {
                if (this._originAudio) {
                    return this._originAudio.duration;
                }
                throw new Error("Sound not loaded.");
            }
            load(url) {
                this._url = url;
                let audio = new Audio(url);
                audio.addEventListener("canplaythrough", onAudioLoaded);
                audio.addEventListener("error", onAudioError);
                let ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf("firefox") >= 0) {
                    audio.autoplay = !0;
                    audio.muted = true;
                }
                audio.load();
                this._originAudio = audio;
                if (AudioSound._clearAudios[this._url]) {
                    delete AudioSound._clearAudios[this._url];
                }
                let self = this;
                function onAudioLoaded() {
                    AudioSound.recycle(self._url, audio);
                    removeListeners();
                    if (ua.indexOf("firefox") >= 0) {
                        audio.pause();
                        audio.muted = false;
                    }
                    self._loaded = true;
                    self.dispatchEvent(dou.Event.COMPLETE);
                }
                function onAudioError() {
                    removeListeners();
                    self.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Audio Error: ${self._url}`);
                }
                function removeListeners() {
                    audio.removeEventListener("canplaythrough", onAudioLoaded);
                    audio.removeEventListener("error", onAudioError);
                }
            }
            play(startTime, loops) {
                if (!this._loaded) {
                    console.error("In the absence of sound is not allowed to play after loading.");
                    return;
                }
                let audio = AudioSound.pop(this._url);
                if (!audio) {
                    audio = this._originAudio.cloneNode();
                }
                audio.autoplay = true;
                let channel = new impl.AudioSoundChannel(audio);
                channel.url = this._url;
                channel.loops = loops;
                channel.startTime = startTime;
                channel.play();
                return channel;
            }
            close() {
                if (this._loaded && this._originAudio) {
                    this._originAudio.src = "";
                }
                if (this._originAudio) {
                    this._originAudio = null;
                }
                AudioSound.clear(this._url);
                this._loaded = false;
            }
        }
        AudioSound._audios = {};
        AudioSound._clearAudios = {};
        impl.AudioSound = AudioSound;
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        /**
         * 声音通道
         * * Audio 标签实现
         * @author wizardc
         */
        class AudioSoundChannel extends dou.EventDispatcher {
            constructor(audio) {
                super();
                this.startTime = 0;
                this._isStopped = false;
                this._volume = 1;
                this._canPlay = () => {
                    this._audio.removeEventListener("canplay", this._canPlay);
                    try {
                        this._audio.currentTime = this.startTime;
                    }
                    catch (e) {
                    }
                    finally {
                        this._audio.play();
                    }
                };
                this._onPlayEnd = () => {
                    if (this.loops == 1) {
                        this.stop();
                        this.dispatchEvent(dou.Event.SOUND_COMPLETE);
                        return;
                    }
                    if (this.loops > 0) {
                        this.loops--;
                    }
                    this.play();
                };
                this._audio = audio;
                audio.addEventListener("ended", this._onPlayEnd);
            }
            set volume(value) {
                if (this._isStopped) {
                    console.error("Sound has stopped, please recall Sound.play () to play the sound.");
                    return;
                }
                this._volume = value;
                if (!this._audio) {
                    return;
                }
                this._audio.volume = value;
            }
            get volume() {
                return this._volume;
            }
            get position() {
                if (!this._audio) {
                    return 0;
                }
                return this._audio.currentTime;
            }
            play() {
                if (this._isStopped) {
                    console.error("Sound has stopped, please recall Sound.play () to play the sound.");
                    return;
                }
                try {
                    this._audio.volume = this._volume;
                    this._audio.currentTime = this.startTime;
                }
                catch (error) {
                    this._audio.addEventListener("canplay", this._canPlay);
                    return;
                }
                this._audio.play();
            }
            stop() {
                if (!this._audio) {
                    return;
                }
                this._isStopped = true;
                let audio = this._audio;
                audio.removeEventListener("ended", this._onPlayEnd);
                audio.removeEventListener("canplay", this._canPlay);
                audio.volume = 0;
                this._volume = 0;
                this._audio = null;
                let url = this.url;
                // 延迟一定时间再停止, 规避 chrome 报错
                window.setTimeout(() => {
                    audio.pause();
                    impl.AudioSound.recycle(url, audio);
                }, 200);
            }
        }
        impl.AudioSoundChannel = AudioSoundChannel;
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        /**
         * AudioContext 解码器
         * @author wizardc
         */
        let AudioAPIDecode;
        (function (AudioAPIDecode) {
            let _context;
            let _decodeList;
            let _decoding;
            function init(context) {
                _context = context;
            }
            AudioAPIDecode.init = init;
            function getContext() {
                return this._context;
            }
            AudioAPIDecode.getContext = getContext;
            function addDecode(decode) {
                _decodeList.push(decode);
            }
            AudioAPIDecode.addDecode = addDecode;
            function decode() {
                if (_decodeList.length <= 0) {
                    return;
                }
                if (_decoding) {
                    return;
                }
                _decoding = true;
                let decodeInfo = _decodeList.shift();
                _context.decodeAudioData(decodeInfo.buffer, (audioBuffer) => {
                    decodeInfo.self.audioBuffer = audioBuffer;
                    if (decodeInfo.success) {
                        decodeInfo.success();
                    }
                    _decoding = false;
                    decode();
                }, () => {
                    console.warn("Sound decode error.");
                    if (decodeInfo.fail) {
                        decodeInfo.fail();
                    }
                    _decoding = false;
                    decode();
                });
            }
            AudioAPIDecode.decode = decode;
        })(AudioAPIDecode = impl.AudioAPIDecode || (impl.AudioAPIDecode = {}));
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        /**
         * 声音
         * * Audio API 实现
         * @author wizardc
         */
        class AudioAPISound extends dou.EventDispatcher {
            constructor(target) {
                super(target);
                this._loaded = false;
            }
            get length() {
                if (this._audioBuffer) {
                    return this._audioBuffer.duration;
                }
                throw new Error("sound not loaded!");
            }
            load(url) {
                this._url = url;
                let self = this;
                let request = new XMLHttpRequest();
                request.open("GET", url, true);
                request.responseType = "arraybuffer";
                request.addEventListener("load", function () {
                    let ioError = request.status >= 400;
                    if (ioError) {
                        self.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Audio Error: ${self._url}`);
                    }
                    else {
                        impl.AudioAPIDecode.addDecode({
                            buffer: request.response,
                            success: onAudioLoaded,
                            fail: onAudioError,
                            self: self
                        });
                        impl.AudioAPIDecode.decode();
                    }
                });
                request.addEventListener("error", function () {
                    self.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Audio Error: ${self._url}`);
                });
                request.send();
                function onAudioLoaded() {
                    self._loaded = true;
                    self.dispatchEvent(dou.Event.COMPLETE);
                }
                function onAudioError() {
                    self.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Audio Error: ${self._url}`);
                }
            }
            play(startTime, loops) {
                if (!this._loaded) {
                    console.error("In the absence of sound is not allowed to play after loading.");
                    return;
                }
                let channel = new impl.AudioAPISoundChannel();
                channel.url = this._url;
                channel.loops = loops;
                channel.audioBuffer = this._audioBuffer;
                channel.startTime = startTime;
                channel.play();
                return channel;
            }
            close() {
            }
        }
        impl.AudioAPISound = AudioAPISound;
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        /**
         * 声音通道
         * * Audio API 实现
         * @author wizardc
         */
        class AudioAPISoundChannel extends dou.EventDispatcher {
            constructor() {
                super();
                this.startTime = 0;
                this._isStopped = false;
                this._recordStartTime = 0;
                this._volume = 1;
                this._onPlayEnd = () => {
                    if (this.loops == 1) {
                        this.stop();
                        this.dispatchEvent(dou.Event.SOUND_COMPLETE);
                        return;
                    }
                    if (this.loops > 0) {
                        this.loops--;
                    }
                    this.play();
                };
                this._context = impl.AudioAPIDecode.getContext();
                if (this._context.createGain) {
                    this._gain = this._context.createGain();
                }
                else {
                    this._gain = this._context["createGainNode"]();
                }
            }
            set volume(value) {
                if (this._isStopped) {
                    console.error("Sound has stopped, please recall Sound.play () to play the sound.");
                    return;
                }
                this._volume = value;
                this._gain.gain.value = value;
            }
            get volume() {
                return this._volume;
            }
            get position() {
                if (this._bufferSource) {
                    return (Date.now() - this._recordStartTime) / 1000 + this.startTime;
                }
                return 0;
            }
            play() {
                if (this._isStopped) {
                    console.error("Sound has stopped, please recall Sound.play () to play the sound.");
                    return;
                }
                if (this._bufferSource) {
                    this._bufferSource.onended = null;
                    this._bufferSource = null;
                }
                let context = this._context;
                let gain = this._gain;
                let bufferSource = context.createBufferSource();
                this._bufferSource = bufferSource;
                bufferSource.buffer = this.audioBuffer;
                bufferSource.connect(gain);
                gain.connect(context.destination);
                bufferSource.onended = this._onPlayEnd;
                this._recordStartTime = Date.now();
                this._gain.gain.value = this._volume;
                bufferSource.start(0, this.startTime);
            }
            stop() {
                if (this._bufferSource) {
                    let sourceNode = this._bufferSource;
                    if (sourceNode.stop) {
                        sourceNode.stop(0);
                    }
                    else {
                        sourceNode.noteOff(0);
                    }
                    sourceNode.onended = null;
                    sourceNode.disconnect();
                    this._bufferSource = null;
                    this.audioBuffer = null;
                }
                this._isStopped = true;
            }
        }
        impl.AudioAPISoundChannel = AudioAPISoundChannel;
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    var impl;
    (function (impl) {
        let context;
        try {
            context = new (window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"])();
        }
        catch (error) {
        }
        if (context) {
            impl.AudioAPIDecode.init(context);
            impl.soundImpl = impl.AudioAPISound;
        }
        else {
            impl.soundImpl = impl.AudioSound;
        }
    })(impl = dou.impl || (dou.impl = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 声音
     * @author wizardc
     */
    class Sound {
        constructor() {
            this._impl = new dou.impl.soundImpl(this);
        }
        /**
         * 当前声音的长度, 以秒为单位
         */
        get length() {
            return this._impl.length;
        }
        /**
         * 启动从指定 URL 加载外部音频文件
         */
        load(url) {
            this._impl.load(url);
        }
        /**
         * 生成一个新的 SoundChannel 对象来播放该声音
         * @param startTime 开始播放的时间, 以秒为单位
         * @param loops 循环次数, 0 表示循环播放
         */
        play(startTime, loops) {
            return this._impl.play(startTime, loops);
        }
        /**
         * 关闭该流
         */
        close() {
            return this._impl.close();
        }
        on(type, listener, thisObj) {
            this._impl.on(type, listener, thisObj);
        }
        once(type, listener, thisObj) {
            this._impl.once(type, listener, thisObj);
        }
        has(type) {
            return this._impl.has(type);
        }
        dispatch(event) {
            return this._impl.dispatch(event);
        }
        off(type, listener, thisObj) {
            this._impl.off(type, listener, thisObj);
        }
    }
    dou.Sound = Sound;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * HTTP 请求方法
     * @author wizardc
     */
    let HttpMethod;
    (function (HttpMethod) {
        HttpMethod[HttpMethod["GET"] = 0] = "GET";
        HttpMethod[HttpMethod["POST"] = 1] = "POST";
    })(HttpMethod = dou.HttpMethod || (dou.HttpMethod = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * HTTP 返回值类型
     * @author wizardc
     */
    let HttpResponseType;
    (function (HttpResponseType) {
        HttpResponseType[HttpResponseType["arraybuffer"] = 1] = "arraybuffer";
        HttpResponseType[HttpResponseType["blob"] = 2] = "blob";
        HttpResponseType[HttpResponseType["document"] = 3] = "document";
        HttpResponseType[HttpResponseType["json"] = 4] = "json";
        HttpResponseType[HttpResponseType["text"] = 5] = "text";
    })(HttpResponseType = dou.HttpResponseType || (dou.HttpResponseType = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * HTTP 请求类
     * @author wizardc
     */
    class HttpRequest extends dou.EventDispatcher {
        constructor() {
            super();
        }
        set responseType(value) {
            this._responseType = value;
        }
        get responseType() {
            return this._responseType;
        }
        set withCredentials(value) {
            this._withCredentials = value;
        }
        get withCredentials() {
            return this._withCredentials;
        }
        get response() {
            if (this._xhr) {
                return this._xhr.response;
            }
            return null;
        }
        setRequestHeader(header, value) {
            if (!this._headerMap) {
                this._headerMap = {};
            }
            this._headerMap[header] = value;
        }
        getResponseHeader(header) {
            return this._headerMap[header];
        }
        getAllResponseHeaders() {
            return this._headerMap;
        }
        open(url, method = dou.HttpMethod.GET) {
            this._url = url;
            this._method = method;
            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            this._xhr = new XMLHttpRequest();
            this._xhr.onreadystatechange = this.onReadyStateChange.bind(this);
            this._xhr.onprogress = this.updateProgress.bind(this);
            this._xhr.open(dou.HttpMethod[this._method], this._url, true);
        }
        send(data) {
            if (this._responseType) {
                this._xhr.responseType = dou.HttpResponseType[this._responseType];
            }
            if (this._withCredentials) {
                this._xhr.withCredentials = true;
            }
            if (this._headerMap) {
                for (let key in this._headerMap) {
                    this._xhr.setRequestHeader(key, this._headerMap[key]);
                }
            }
            this._xhr.send(data);
        }
        onReadyStateChange(event) {
            let xhr = this._xhr;
            if (xhr.readyState == 4) {
                let ioError = (xhr.status >= 400 || xhr.status == 0);
                setTimeout(() => {
                    if (ioError) {
                        this.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Request Error: ${this._url}`);
                    }
                    else {
                        this.dispatchEvent(dou.Event.COMPLETE);
                    }
                }, 0);
            }
        }
        updateProgress(event) {
            if (event.lengthComputable) {
                this.dispatchProgressEvent(dou.ProgressEvent.PROGRESS, event.loaded, event.total);
            }
        }
        abort() {
            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            this._url = null;
            this._method = null;
        }
    }
    dou.HttpRequest = HttpRequest;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 图片加载器
     * @author wizardc
     */
    class ImageLoader extends dou.EventDispatcher {
        /**
         * 是否开启跨域访问控制
         */
        set crossOrigin(value) {
            this._crossOrigin = value;
        }
        get crossOrigin() {
            return this._crossOrigin;
        }
        get data() {
            return this._data;
        }
        load(url) {
            this._data = null;
            let image = this._currentImage = new Image();
            if (this._crossOrigin !== null) {
                if (this._crossOrigin) {
                    image.crossOrigin = "anonymous";
                }
            }
            else {
                if (ImageLoader.crossOrigin) {
                    image.crossOrigin = "anonymous";
                }
            }
            image.onload = this.onLoad.bind(this);
            image.onerror = this.onError.bind(this);
            image.src = url;
        }
        getImage(element) {
            element.onload = element.onerror = null;
            if (this._currentImage === element) {
                this._data = element;
                this._currentImage = null;
                return element;
            }
            return null;
        }
        onLoad(event) {
            let image = this.getImage(event.target);
            if (image) {
                setTimeout(() => {
                    this.dispatchEvent(dou.Event.COMPLETE);
                }, 0);
            }
        }
        onError(event) {
            let image = this.getImage(event.target);
            if (image) {
                setTimeout(() => {
                    this.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Image load error: ${image.src}`);
                }, 0);
            }
        }
    }
    /**
     * 默认是否开启跨域访问控制
     */
    ImageLoader.crossOrigin = false;
    dou.ImageLoader = ImageLoader;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 套接字对象
     * @author wizardc
     */
    class Socket extends dou.EventDispatcher {
        constructor(host, port) {
            super();
            this._endian = 1 /* bigEndian */;
            this._connected = false;
            this._cacheInput = true;
            this._addInputPosition = 0;
            if (host && port > 0 && port < 65535) {
                this.connect(host, port);
            }
        }
        set endian(value) {
            this._endian = value;
        }
        get endian() {
            return this._endian;
        }
        get input() {
            return this._input;
        }
        get output() {
            return this._output;
        }
        get url() {
            return this._url;
        }
        get connected() {
            return this._connected;
        }
        /**
         * 是否缓存服务端发送的数据到输入流中
         */
        set cacheInput(value) {
            this._cacheInput = value;
        }
        get cacheInput() {
            return this._cacheInput;
        }
        connect(host, port) {
            let url;
            if (window.location.protocol == "https:") {
                url = "wss://" + host + ":" + port;
            }
            else {
                url = "ws://" + host + ":" + port;
            }
            this.connectByUrl(url);
        }
        connectByUrl(url) {
            if (this._webSocket) {
                this.close();
            }
            this._url = url;
            this._webSocket = new WebSocket(url);
            this._webSocket.binaryType = "arraybuffer";
            this._input = new dou.ByteArray();
            this._input.endian = this.endian;
            this._output = new dou.ByteArray();
            this._output.endian = this.endian;
            this._addInputPosition = 0;
            this._webSocket.onopen = (event) => {
                this.onOpen(event);
            };
            this._webSocket.onmessage = (messageEvent) => {
                this.onMessage(messageEvent);
            };
            this._webSocket.onclose = (event) => {
                this.onClose(event);
            };
            this._webSocket.onerror = (event) => {
                this.onError(event);
            };
        }
        onOpen(event) {
            this._connected = true;
            this.dispatchEvent(dou.Event.OPEN);
        }
        onMessage(messageEvent) {
            if (!messageEvent || !messageEvent.data) {
                return;
            }
            let data = messageEvent.data;
            if (!this._cacheInput && data) {
                this.dispatchEvent(dou.Event.MESSAGE, data);
                return;
            }
            if (this._input.length > 0 && this._input.bytesAvailable < 1) {
                this._input.clear();
                this._addInputPosition = 0;
            }
            let pre = this._input.position;
            if (!this._addInputPosition) {
                this._addInputPosition = 0;
            }
            this._input.position = this._addInputPosition;
            if (data) {
                if ((typeof data == "string")) {
                    this._input.writeUTFBytes(data);
                }
                else {
                    this._input.writeUint8Array(new Uint8Array(data));
                }
                this._addInputPosition = this._input.position;
                this._input.position = pre;
            }
            this.dispatchEvent(dou.Event.MESSAGE, data);
        }
        onClose(event) {
            this._connected = false;
            this.dispatchEvent(dou.Event.CLOSE);
        }
        onError(event) {
            this.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Socket connect error: ${this._url}`);
        }
        send(data) {
            this._webSocket.send(data);
        }
        flush() {
            if (this._output && this._output.length > 0) {
                let error;
                try {
                    if (this._webSocket) {
                        this._webSocket.send(this._output.buffer);
                    }
                }
                catch (e) {
                    error = e;
                }
                this._output.endian = this.endian;
                this._output.clear();
                if (error) {
                    this.dispatchIOErrorEvent(dou.IOErrorEvent.IO_ERROR, `Socket connect error: ${this._url}`);
                }
            }
        }
        close() {
            if (this._webSocket) {
                this.cleanSocket();
            }
        }
        cleanSocket() {
            this._webSocket.close();
            this._connected = false;
            this._webSocket.onopen = null;
            this._webSocket.onmessage = null;
            this._webSocket.onclose = null;
            this._webSocket.onerror = null;
            this._webSocket = null;
            this._url = null;
        }
    }
    dou.Socket = Socket;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 缓动函数集合
     * @author wizardc
     */
    let Ease;
    (function (Ease) {
        function getPowIn(pow) {
            return function (t) {
                return Math.pow(t, pow);
            };
        }
        function getPowOut(pow) {
            return function (t) {
                return 1 - Math.pow(1 - t, pow);
            };
        }
        function getPowInOut(pow) {
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * Math.pow(t, pow);
                return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
            };
        }
        Ease.quadIn = getPowIn(2);
        Ease.quadOut = getPowOut(2);
        Ease.quadInOut = getPowInOut(2);
        Ease.cubicIn = getPowIn(3);
        Ease.cubicOut = getPowOut(3);
        Ease.cubicInOut = getPowInOut(3);
        Ease.quartIn = getPowIn(4);
        Ease.quartOut = getPowOut(4);
        Ease.quartInOut = getPowInOut(4);
        Ease.quintIn = getPowIn(5);
        Ease.quintOut = getPowOut(5);
        Ease.quintInOut = getPowInOut(5);
        function sineIn(t) {
            return 1 - Math.cos(t * Math.PI / 2);
        }
        Ease.sineIn = sineIn;
        function sineOut(t) {
            return Math.sin(t * Math.PI / 2);
        }
        Ease.sineOut = sineOut;
        function sineInOut(t) {
            return -0.5 * (Math.cos(Math.PI * t) - 1);
        }
        Ease.sineInOut = sineInOut;
        function getBackIn(amount) {
            return function (t) {
                return t * t * ((amount + 1) * t - amount);
            };
        }
        Ease.backIn = getBackIn(1.7);
        function getBackOut(amount) {
            return function (t) {
                return (--t * t * ((amount + 1) * t + amount) + 1);
            };
        }
        Ease.backOut = getBackOut(1.7);
        function getBackInOut(amount) {
            amount *= 1.525;
            return function (t) {
                if ((t *= 2) < 1)
                    return 0.5 * (t * t * ((amount + 1) * t - amount));
                return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
            };
        }
        Ease.backInOut = getBackInOut(1.7);
        function circIn(t) {
            return -(Math.sqrt(1 - t * t) - 1);
        }
        Ease.circIn = circIn;
        function circOut(t) {
            return Math.sqrt(1 - (--t) * t);
        }
        Ease.circOut = circOut;
        function circInOut(t) {
            if ((t *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - t * t) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }
        Ease.circInOut = circInOut;
        function bounceIn(t) {
            return 1 - bounceOut(1 - t);
        }
        Ease.bounceIn = bounceIn;
        function bounceOut(t) {
            if (t < 1 / 2.75) {
                return (7.5625 * t * t);
            }
            else if (t < 2 / 2.75) {
                return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
            }
            else if (t < 2.5 / 2.75) {
                return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
            }
            else {
                return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
            }
        }
        Ease.bounceOut = bounceOut;
        function bounceInOut(t) {
            if (t < 0.5)
                return bounceIn(t * 2) * .5;
            return bounceOut(t * 2 - 1) * 0.5 + 0.5;
        }
        Ease.bounceInOut = bounceInOut;
        function getElasticIn(amplitude, period) {
            let pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                let s = period / pi2 * Math.asin(1 / amplitude);
                return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            };
        }
        Ease.elasticIn = getElasticIn(1, 0.3);
        function getElasticOut(amplitude, period) {
            let pi2 = Math.PI * 2;
            return function (t) {
                if (t == 0 || t == 1)
                    return t;
                let s = period / pi2 * Math.asin(1 / amplitude);
                return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
            };
        }
        Ease.elasticOut = getElasticOut(1, 0.3);
        function getElasticInOut(amplitude, period) {
            let pi2 = Math.PI * 2;
            return function (t) {
                let s = period / pi2 * Math.asin(1 / amplitude);
                if ((t *= 2) < 1)
                    return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
                return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
            };
        }
        Ease.elasticInOut = getElasticInOut(1, 0.3 * 1.5);
    })(Ease = dou.Ease || (dou.Ease = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 缓动类
     * @author wizardc
     */
    class Tween extends dou.EventDispatcher {
        constructor(target, props) {
            super();
            this._useTicks = false;
            this._ignoreGlobalPause = false;
            this._loop = false;
            this._paused = false;
            this._duration = 0;
            this._prevPos = -1;
            this._prevPosition = 0;
            this._stepPosition = 0;
            this._passive = false;
            this.initialize(target, props);
        }
        /**
         * 帧循环逻辑, 请在项目的合适地方进行循环调用
         */
        static tick(passedTime, paused = false) {
            let tweens = Tween._tweens.concat();
            for (let i = tweens.length - 1; i >= 0; i--) {
                let tween = tweens[i];
                if ((paused && !tween._ignoreGlobalPause) || tween._paused) {
                    continue;
                }
                tween.$tick(tween._useTicks ? 1 : passedTime);
            }
        }
        /**
         * 激活一个对象, 对其添加 Tween 动画
         * @param target 要激活 Tween 的对象
         * @param props 参数
         * @param override 是否移除对象之前添加的tween
         * @returns 缓动对象
         */
        static get(target, props, override = false) {
            if (override) {
                Tween.removeTweens(target);
            }
            return new Tween(target, props);
        }
        /**
         * 暂停某个对象的所有 Tween 动画
         */
        static pauseTweens(target) {
            if (!target.tween_count) {
                return;
            }
            let tweens = Tween._tweens;
            for (let i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i]._paused = true;
                }
            }
        }
        /**
         * 继续播放某个对象的所有 Tween 动画
         */
        static resumeTweens(target) {
            if (!target.tween_count) {
                return;
            }
            let tweens = Tween._tweens;
            for (let i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i]._paused = false;
                }
            }
        }
        /**
         * 删除一个对象上的全部 Tween 动画
         */
        static removeTweens(target) {
            if (!target.tween_count) {
                return;
            }
            let tweens = Tween._tweens;
            for (let i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    tweens[i]._paused = true;
                    tweens.splice(i, 1);
                }
            }
            target.tween_count = 0;
        }
        /**
         * 删除所有的 Tween 动画
         */
        static removeAllTweens() {
            let tweens = Tween._tweens;
            for (let i = 0, l = tweens.length; i < l; i++) {
                let tween = tweens[i];
                tween._paused = true;
                tween._target.tween_count = 0;
            }
            tweens.length = 0;
        }
        static _register(tween, value) {
            let target = tween._target;
            let tweens = Tween._tweens;
            if (value) {
                if (target) {
                    target.tween_count = target.tween_count > 0 ? target.tween_count + 1 : 1;
                }
                tweens.push(tween);
            }
            else {
                if (target) {
                    target.tween_count--;
                }
                let i = tweens.length;
                while (i--) {
                    if (tweens[i] == tween) {
                        tweens.splice(i, 1);
                        return;
                    }
                }
            }
        }
        initialize(target, props) {
            this._target = target;
            if (props) {
                this._useTicks = props.useTicks;
                this._ignoreGlobalPause = props.ignoreGlobalPause;
                this._loop = props.loop;
                props.onChange && this.on(dou.Event.CHANGE, props.onChange, props.onChangeObj);
                if (props.override) {
                    Tween.removeTweens(target);
                }
            }
            this._curQueueProps = {};
            this._initQueueProps = {};
            this._steps = [];
            if (props && props.paused) {
                this._paused = true;
            }
            else {
                Tween._register(this, true);
            }
            if (props && props.position) {
                this.setPosition(props.position, Tween.NONE);
            }
        }
        /**
         * 设置是否暂停
         */
        setPaused(value) {
            if (this._paused == value) {
                return this;
            }
            this._paused = value;
            Tween._register(this, !value);
            return this;
        }
        /**
         * 等待指定毫秒后执行下一个动画
         * @param duration 要等待的时间, 以毫秒为单位
         * @param passive 等待期间属性是否会更新
         * @returns Tween 对象本身
         */
        wait(duration, passive) {
            if (duration == null || duration <= 0) {
                return this;
            }
            let o = this._cloneProps(this._curQueueProps);
            return this._addStep({ d: duration, p0: o, p1: o, v: passive });
        }
        /**
         * 将指定对象的属性修改为指定值
         * @param props 对象的属性集合
         * @param duration 持续时间
         * @param ease 缓动算法
         * @returns Tween 对象本身
         */
        to(props, duration, ease) {
            if (isNaN(duration) || duration < 0) {
                duration = 0;
            }
            this._addStep({ d: duration || 0, p0: this._cloneProps(this._curQueueProps), e: ease, p1: this._cloneProps(this._appendQueueProps(props)) });
            return this.set(props);
        }
        /**
         * 执行回调函数
         * @param callback 回调方法
         * @param thisObj 回调方法 this 作用域
         * @param params 回调方法参数
         * @returns Tween 对象本身
         */
        call(callback, thisObj, params) {
            return this._addAction({ f: callback, p: params ? params : [], o: thisObj ? thisObj : this._target });
        }
        /**
         * 立即将指定对象的属性修改为指定值
         * @param props 对象的属性集合
         * @param target 要继续播放 Tween 的对象
         * @returns Tween 对象本身
         */
        set(props, target) {
            this._appendQueueProps(props);
            return this._addAction({ f: this._set, o: this, p: [props, target ? target : this._target] });
        }
        /**
         * 播放
         * @param tween 需要操作的 Tween 对象, 默认 this
         * @returns Tween 对象本身
         */
        play(tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [false]);
        }
        /**
         * 暂停
         * @param tween 需要操作的 Tween 对象, 默认 this
         * @returns Tween 对象本身
         */
        pause(tween) {
            if (!tween) {
                tween = this;
            }
            return this.call(tween.setPaused, tween, [true]);
        }
        /**
         * @private
         */
        $tick(delta) {
            if (this._paused) {
                return;
            }
            this.setPosition(this._prevPosition + delta);
        }
        /**
         * @private
         */
        setPosition(value, actionsMode = 1) {
            if (value < 0) {
                value = 0;
            }
            let t = value;
            let end = false;
            if (t >= this._duration) {
                if (this._loop) {
                    var newTime = t % this._duration;
                    if (t > 0 && newTime === 0) {
                        t = this._duration;
                    }
                    else {
                        t = newTime;
                    }
                }
                else {
                    t = this._duration;
                    end = true;
                }
            }
            if (t == this._prevPos) {
                return end;
            }
            if (end) {
                this.setPaused(true);
            }
            let prevPos = this._prevPos;
            this._position = this._prevPos = t;
            this._prevPosition = value;
            if (this._target) {
                if (this._steps.length > 0) {
                    let l = this._steps.length;
                    let stepIndex = -1;
                    for (let i = 0; i < l; i++) {
                        if (this._steps[i].type == "step") {
                            stepIndex = i;
                            if (this._steps[i].t <= t && this._steps[i].t + this._steps[i].d >= t) {
                                break;
                            }
                        }
                    }
                    for (let i = 0; i < l; i++) {
                        if (this._steps[i].type == "action") {
                            if (actionsMode != 0) {
                                if (this._useTicks) {
                                    this._runAction(this._steps[i], t, t);
                                }
                                else if (actionsMode == 1 && t < prevPos) {
                                    if (prevPos != this._duration) {
                                        this._runAction(this._steps[i], prevPos, this._duration);
                                    }
                                    this._runAction(this._steps[i], 0, t, true);
                                }
                                else {
                                    this._runAction(this._steps[i], prevPos, t);
                                }
                            }
                        }
                        else if (this._steps[i].type == "step") {
                            if (stepIndex == i) {
                                let step = this._steps[stepIndex];
                                this._updateTargetProps(step, Math.min((this._stepPosition = t - step.t) / step.d, 1));
                            }
                        }
                    }
                }
            }
            this.dispatchEvent(dou.Event.COMPLETE);
            return end;
        }
        _runAction(action, startPos, endPos, includeStart = false) {
            let sPos = startPos;
            let ePos = endPos;
            if (startPos > endPos) {
                sPos = endPos;
                ePos = startPos;
            }
            let pos = action.t;
            if (pos == ePos || (pos > sPos && pos < ePos) || (includeStart && pos == startPos)) {
                action.f.apply(action.o, action.p);
            }
        }
        _updateTargetProps(step, ratio) {
            let p0, p1, v0, v1, v;
            if (!step && ratio == 1) {
                this._passive = false;
                p0 = p1 = this._curQueueProps;
            }
            else {
                this._passive = !!step.v;
                if (this._passive) {
                    return;
                }
                if (step.e) {
                    ratio = step.e(ratio, 0, 1, 1);
                }
                p0 = step.p0;
                p1 = step.p1;
            }
            for (let n in this._initQueueProps) {
                if ((v0 = p0[n]) == null) {
                    p0[n] = v0 = this._initQueueProps[n];
                }
                if ((v1 = p1[n]) == null) {
                    p1[n] = v1 = v0;
                }
                if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof (v0) != "number")) {
                    v = ratio == 1 ? v1 : v0;
                }
                else {
                    v = v0 + (v1 - v0) * ratio;
                }
                this._target[n] = v;
            }
        }
        _cloneProps(props) {
            let o = {};
            for (let n in props) {
                o[n] = props[n];
            }
            return o;
        }
        _addStep(o) {
            if (o.d > 0) {
                o.type = "step";
                this._steps.push(o);
                o.t = this._duration;
                this._duration += o.d;
            }
            return this;
        }
        _appendQueueProps(o) {
            let oldValue, injectProps;
            for (let n in o) {
                if (this._initQueueProps[n] === undefined) {
                    oldValue = this._target[n];
                    this._initQueueProps[n] = this._curQueueProps[n] = (oldValue === undefined) ? null : oldValue;
                }
                else {
                    oldValue = this._curQueueProps[n];
                }
            }
            for (let n in o) {
                oldValue = this._curQueueProps[n];
                this._curQueueProps[n] = o[n];
            }
            if (injectProps) {
                this._appendQueueProps(injectProps);
            }
            return this._curQueueProps;
        }
        _addAction(o) {
            o.t = this._duration;
            o.type = "action";
            this._steps.push(o);
            return this;
        }
        _set(props, o) {
            for (let n in props) {
                o[n] = props[n];
            }
        }
    }
    /**
     * 不做特殊处理
     */
    Tween.NONE = 0;
    /**
     * 循环
     */
    Tween.LOOP = 1;
    /**
     * 倒序
     */
    Tween.REVERSE = 2;
    Tween._tweens = [];
    dou.Tween = Tween;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 获取引擎启动之后经过的毫秒数
     */
    function getTimer() {
        return Date.now() - dou.TickerBase.$startTime;
    }
    dou.getTimer = getTimer;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 对象池
     * @author wizardc
     */
    class ObjectPool {
        constructor(creator, maxCount = 50) {
            this._creator = creator;
            this._maxCount = maxCount;
            this._list = [];
            this._map = new Map();
        }
        get size() {
            return this._list.length;
        }
        join(obj) {
            if (typeof obj.onRecycle === "function") {
                obj.onRecycle();
            }
            if (this._list.length < this._maxCount) {
                if (!this._map.has(obj)) {
                    this._map.set(obj, true);
                    this._list.push(obj);
                }
            }
        }
        take() {
            let obj;
            if (this._list.length == 0) {
                obj = new this._creator();
            }
            else {
                obj = this._list.pop();
                this._map.delete(obj);
                if (typeof obj.onReuse === "function") {
                    obj.onReuse();
                }
            }
            return obj;
        }
        clear() {
            this._list.length = 0;
            this._map.clear();
        }
    }
    dou.ObjectPool = ObjectPool;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 获取一个可回收的对象
     */
    function recyclable(creator) {
        let pool;
        if (creator.hasOwnProperty("__pool")) {
            pool = creator.__pool;
        }
        else {
            let maxCount = creator.prototype.constructor.__cacheMaxCount || 50;
            pool = new dou.ObjectPool(creator, maxCount);
            let prototype = creator.prototype;
            if (!prototype.hasOwnProperty("recycle")) {
                prototype.recycle = function () {
                    pool.join(this);
                };
            }
            creator.__pool = pool;
        }
        return pool.take();
    }
    dou.recyclable = recyclable;
    /**
     * 对象池配置
     */
    function deployPool(targetClass, maxCount) {
        targetClass.prototype.constructor.__cacheMaxCount = maxCount;
    }
    dou.deployPool = deployPool;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 字节数组
     * @author wizardc
     */
    class ByteArray {
        constructor(buffer, bufferExtSize = 0) {
            this._bufferExtSize = 0;
            this._eofByte = -1;
            this._eofCodePoint = -1;
            if (bufferExtSize < 0) {
                bufferExtSize = 0;
            }
            this._bufferExtSize = bufferExtSize;
            let bytes, wpos = 0;
            if (buffer) {
                let uint8;
                if (buffer instanceof Uint8Array) {
                    uint8 = buffer;
                    wpos = buffer.length;
                }
                else {
                    wpos = buffer.byteLength;
                    uint8 = new Uint8Array(buffer);
                }
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    let multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
            }
            else {
                bytes = new Uint8Array(bufferExtSize);
            }
            this._writePosition = wpos;
            this._position = 0;
            this._bytes = bytes;
            this._data = new DataView(bytes.buffer);
            this._endian = 1 /* bigEndian */;
        }
        set endian(value) {
            this._endian = value;
        }
        get endian() {
            return this._endian;
        }
        get readAvailable() {
            return this._writePosition - this._position;
        }
        get buffer() {
            return this._data.buffer.slice(0, this._writePosition);
        }
        get rawBuffer() {
            return this._data.buffer;
        }
        set buffer(value) {
            let wpos = value.byteLength;
            let uint8 = new Uint8Array(value);
            let bufferExtSize = this._bufferExtSize;
            let bytes;
            if (bufferExtSize == 0) {
                bytes = new Uint8Array(wpos);
            }
            else {
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
            }
            bytes.set(uint8);
            this._writePosition = wpos;
            this._bytes = bytes;
            this._data = new DataView(bytes.buffer);
        }
        get bytes() {
            return this._bytes;
        }
        get dataView() {
            return this._data;
        }
        set dataView(value) {
            this.buffer = value.buffer;
        }
        get bufferOffset() {
            return this._data.byteOffset;
        }
        set position(value) {
            this._position = value;
            if (value > this._writePosition) {
                this._writePosition = value;
            }
        }
        get position() {
            return this._position;
        }
        set length(value) {
            this._writePosition = value;
            if (this._data.byteLength > value) {
                this._position = value;
            }
            this.validateBuffer(value);
        }
        get length() {
            return this._writePosition;
        }
        validateBuffer(value) {
            if (this._data.byteLength < value) {
                let be = this._bufferExtSize;
                let tmp;
                if (be == 0) {
                    tmp = new Uint8Array(value);
                }
                else {
                    let nLen = ((value / be >> 0) + 1) * be;
                    tmp = new Uint8Array(nLen);
                }
                tmp.set(this._bytes);
                this._bytes = tmp;
                this._data = new DataView(tmp.buffer);
            }
        }
        get bytesAvailable() {
            return this._data.byteLength - this._position;
        }
        validate(len) {
            let bl = this._bytes.length;
            if (bl > 0 && this._position + len <= bl) {
                return true;
            }
            else {
                console.error("End of the file");
            }
        }
        validateBuffer2(len) {
            this._writePosition = len > this._writePosition ? len : this._writePosition;
            len += this._position;
            this.validateBuffer(len);
        }
        readBoolean() {
            if (this.validate(1 /* SIZE_OF_BOOLEAN */)) {
                return !!this._bytes[this.position++];
            }
        }
        readByte() {
            if (this.validate(1 /* SIZE_OF_INT8 */)) {
                return this._data.getInt8(this.position++);
            }
        }
        readUnsignedByte() {
            if (this.validate(1 /* SIZE_OF_UINT8 */))
                return this._bytes[this.position++];
        }
        readShort() {
            if (this.validate(2 /* SIZE_OF_INT16 */)) {
                let value = this._data.getInt16(this._position, this._endian == 0 /* littleEndian */);
                this.position += 2 /* SIZE_OF_INT16 */;
                return value;
            }
        }
        readUnsignedShort() {
            if (this.validate(2 /* SIZE_OF_UINT16 */)) {
                let value = this._data.getUint16(this._position, this._endian == 0 /* littleEndian */);
                this.position += 2 /* SIZE_OF_UINT16 */;
                return value;
            }
        }
        readInt() {
            if (this.validate(4 /* SIZE_OF_INT32 */)) {
                let value = this._data.getInt32(this._position, this._endian == 0 /* littleEndian */);
                this.position += 4 /* SIZE_OF_INT32 */;
                return value;
            }
        }
        readUnsignedInt() {
            if (this.validate(4 /* SIZE_OF_UINT32 */)) {
                let value = this._data.getUint32(this._position, this._endian == 0 /* littleEndian */);
                this.position += 4 /* SIZE_OF_UINT32 */;
                return value;
            }
        }
        readFloat() {
            if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
                let value = this._data.getFloat32(this._position, this._endian == 0 /* littleEndian */);
                this.position += 4 /* SIZE_OF_FLOAT32 */;
                return value;
            }
        }
        readDouble() {
            if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
                let value = this._data.getFloat64(this._position, this._endian == 0 /* littleEndian */);
                this.position += 8 /* SIZE_OF_FLOAT64 */;
                return value;
            }
        }
        readBytes(bytes, offset = 0, length = 0) {
            if (!bytes) {
                return;
            }
            let pos = this._position;
            let available = this._writePosition - pos;
            if (available < 0) {
                console.error("End of the file");
                return;
            }
            if (length == 0) {
                length = available;
            }
            else if (length > available) {
                console.error("End of the file");
                return;
            }
            const position = bytes._position;
            bytes._position = 0;
            bytes.validateBuffer2(offset + length);
            bytes._position = position;
            bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
            this.position += length;
        }
        readUTF() {
            let length = this.readUnsignedShort();
            if (length > 0) {
                return this.readUTFBytes(length);
            }
            else {
                return "";
            }
        }
        readUTFBytes(length) {
            if (!this.validate(length)) {
                return;
            }
            let data = this._data;
            let bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
            this.position += length;
            return this.decodeUTF8(bytes);
        }
        decodeUTF8(data) {
            let fatal = false;
            let pos = 0;
            let result = "";
            let code_point;
            let utf8_code_point = 0;
            let utf8_bytes_needed = 0;
            let utf8_bytes_seen = 0;
            let utf8_lower_boundary = 0;
            while (data.length > pos) {
                let byte = data[pos++];
                if (byte == this._eofByte) {
                    if (utf8_bytes_needed != 0) {
                        code_point = this.decoderError(fatal);
                    }
                    else {
                        code_point = this._eofCodePoint;
                    }
                }
                else {
                    if (utf8_bytes_needed == 0) {
                        if (this.inRange(byte, 0x00, 0x7F)) {
                            code_point = byte;
                        }
                        else {
                            if (this.inRange(byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = byte - 0xC0;
                            }
                            else if (this.inRange(byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = byte - 0xE0;
                            }
                            else if (this.inRange(byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = byte - 0xF0;
                            }
                            else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this.inRange(byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, byte);
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            let cp = utf8_code_point;
                            let lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = this.decoderError(fatal, byte);
                            }
                        }
                    }
                }
                if (code_point !== null && code_point !== this._eofCodePoint) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0) {
                            result += String.fromCharCode(code_point);
                        }
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        }
        inRange(a, min, max) {
            return min <= a && a <= max;
        }
        decoderError(fatal, opt_code_point) {
            if (fatal) {
                console.error("Decoding error");
            }
            return opt_code_point || 0xFFFD;
        }
        writeBoolean(value) {
            this.validateBuffer2(1 /* SIZE_OF_BOOLEAN */);
            this._bytes[this.position++] = +value;
        }
        writeByte(value) {
            this.validateBuffer2(1 /* SIZE_OF_INT8 */);
            this._bytes[this.position++] = value & 0xff;
        }
        writeShort(value) {
            this.validateBuffer2(2 /* SIZE_OF_INT16 */);
            this._data.setInt16(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 2 /* SIZE_OF_INT16 */;
        }
        writeUnsignedShort(value) {
            this.validateBuffer2(2 /* SIZE_OF_UINT16 */);
            this._data.setUint16(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 2 /* SIZE_OF_UINT16 */;
        }
        writeInt(value) {
            this.validateBuffer2(4 /* SIZE_OF_INT32 */);
            this._data.setInt32(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 4 /* SIZE_OF_INT32 */;
        }
        writeUnsignedInt(value) {
            this.validateBuffer2(4 /* SIZE_OF_UINT32 */);
            this._data.setUint32(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 4 /* SIZE_OF_UINT32 */;
        }
        writeFloat(value) {
            this.validateBuffer2(4 /* SIZE_OF_FLOAT32 */);
            this._data.setFloat32(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
        }
        writeDouble(value) {
            this.validateBuffer2(8 /* SIZE_OF_FLOAT64 */);
            this._data.setFloat64(this._position, value, this._endian == 0 /* littleEndian */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
        }
        writeBytes(bytes, offset = 0, length = 0) {
            let writeLength;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            }
            else if (length == 0) {
                writeLength = bytes.length - offset;
            }
            else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer2(writeLength);
                this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                this.position = this._position + writeLength;
            }
        }
        writeUTF(value) {
            let utf8bytes = this.encodeUTF8(value);
            let length = utf8bytes.length;
            this.validateBuffer2(2 /* SIZE_OF_UINT16 */ + length);
            this._data.setUint16(this._position, length, this._endian == 0 /* littleEndian */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            this.writeUint8Array(utf8bytes, false);
        }
        writeUTFBytes(value) {
            this.writeUint8Array(this.encodeUTF8(value));
        }
        encodeUTF8(str) {
            let pos = 0;
            let codePoints = this.stringToCodePoints(str);
            let outputBytes = [];
            while (codePoints.length > pos) {
                let code_point = codePoints[pos++];
                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    console.error(`EncodingError The code point ${code_point} could not be encoded`);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                }
                else {
                    let count, offset;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    }
                    else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    }
                    else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }
                    outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                    while (count > 0) {
                        let temp = this.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        }
        stringToCodePoints(string) {
            let cps = [];
            let i = 0, n = string.length;
            while (i < string.length) {
                let c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                }
                else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                }
                else {
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    }
                    else {
                        let d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            let a = c & 0x3FF;
                            let b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        }
                        else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        }
        writeUint8Array(bytes, validateBuffer = true) {
            let pos = this._position;
            let npos = pos + bytes.length;
            if (validateBuffer) {
                this.validateBuffer2(npos);
            }
            this.bytes.set(bytes, pos);
            this.position = npos;
        }
        div(n, d) {
            return Math.floor(n / d);
        }
        clear() {
            let buffer = new ArrayBuffer(this._bufferExtSize);
            this._data = new DataView(buffer);
            this._bytes = new Uint8Array(buffer);
            this._position = 0;
            this._writePosition = 0;
        }
        toString() {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        }
    }
    dou.ByteArray = ByteArray;
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * HTTP 请求工具类
     * @author wizardc
     */
    let HttpUtil;
    (function (HttpUtil) {
        function addParamToUrl(url, data) {
            if (data) {
                for (let key in data) {
                    let value = data[key];
                    url += "&" + key + "=" + value;
                }
                if (url.indexOf("?") == -1) {
                    url = url.replace("&", "?");
                }
            }
            return url;
        }
        HttpUtil.addParamToUrl = addParamToUrl;
        function get(url, callback, thisObj, errorCallback, errorThisObj) {
            request("GET", url, null, callback, thisObj, errorCallback, errorThisObj);
        }
        HttpUtil.get = get;
        function post(url, data, callback, thisObj, errorCallback, errorThisObj) {
            request("POST", url, data, callback, thisObj, errorCallback, errorThisObj);
        }
        HttpUtil.post = post;
        function request(method, url, data, callback, thisObj, errorCallback, errorThisObj) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    let error = (xhr.status >= 400 || xhr.status == 0);
                    if (error) {
                        if (errorCallback) {
                            errorCallback.call(errorThisObj, xhr.status);
                        }
                    }
                    else {
                        if (callback) {
                            callback.call(thisObj, xhr.response);
                        }
                    }
                }
            };
            xhr.open(method, url, true);
            switch (typeof data) {
                case "string":
                    break;
                case "object":
                    data = JSON.stringify(data);
                    break;
                default:
                    data = "" + data;
            }
            xhr.send(data);
        }
    })(HttpUtil = dou.HttpUtil || (dou.HttpUtil = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 脚本工具类
     * @author wizardc
     */
    let ScriptUtil;
    (function (ScriptUtil) {
        /**
         * 同步加载 JS 文件
         */
        function loadJSSync(url) {
            document.write(`<script type="text/javascript" src="${url}"></script>`);
        }
        ScriptUtil.loadJSSync = loadJSSync;
        /**
         * 异步加载 JS 文件, 放在 head 中
         */
        function loadJSAsync(url) {
            let script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", url);
            document.getElementsByTagName("head")[0].appendChild(script);
        }
        ScriptUtil.loadJSAsync = loadJSAsync;
        /**
         * 异步加载 JS 文件, 放在 body 中
         */
        function loadJS(url, cross, callback, thisObj, ...args) {
            let script = document.createElement("script");
            script.async = false;
            script.src = url;
            if (cross) {
                script.crossOrigin = "anonymous";
            }
            script.addEventListener("load", function () {
                script.parentNode.removeChild(script);
                script.removeEventListener("load", arguments.callee, false);
                callback.apply(thisObj, args);
            }, false);
            document.body.appendChild(script);
        }
        ScriptUtil.loadJS = loadJS;
    })(ScriptUtil = dou.ScriptUtil || (dou.ScriptUtil = {}));
})(dou || (dou = {}));
var dou;
(function (dou) {
    /**
     * 位运算工具类
     * @author wizardc
     */
    let BitUtil;
    (function (BitUtil) {
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @param value 设置为 1 (true) 还是 0 (false)
         */
        function setBit(target, position, value) {
            if (value) {
                target |= 1 << position;
            }
            else {
                target &= ~(1 << position);
            }
            return target;
        }
        BitUtil.setBit = setBit;
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @returns 对应的值为 1 (true) 还是 0 (false)
         */
        function getBit(target, position) {
            return target == (target | (1 << position));
        }
        BitUtil.getBit = getBit;
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @returns 对应的值为 1 (true) 还是 0 (false)
         */
        function switchBit32(target, position) {
            target ^= 1 << position;
            return target;
        }
        BitUtil.switchBit32 = switchBit32;
    })(BitUtil = dou.BitUtil || (dou.BitUtil = {}));
})(dou || (dou = {}));
