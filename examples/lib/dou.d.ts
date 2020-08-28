interface Object {
    /**
     * 清除所有属性
     */
    clearAllProperty(): void;
}
interface String {
    /**
     * 根据分割符拆分字符串为数组且元素转换为数字
     */
    splitNum(separator: string, limit?: number): number[];
    splitNum(separator: RegExp, limit?: number): number[];
}
interface ArrayConstructor {
    /**
     * 默认的排序规则
     */
    readonly NORMAL: number;
    /**
     * 排序时字符串不区分大小写
     */
    readonly CASEINSENSITIVE: number;
    /**
     * 降序
     */
    readonly DESCENDING: number;
    /**
     * 返回包含已经排序完毕的索引数组
     */
    readonly RETURNINDEXEDARRAY: number;
    /**
     * 按数字而非字符串排序
     */
    readonly NUMERIC: number;
}
interface Array<T> {
    /**
     * 添加唯一数据
     */
    pushUnique(...args: T[]): number;
    /**
     * 按数组元素的字段进行排序, 支持多字段
     */
    sortOn(fieldNames: string | string[], options?: number | number[]): void | this;
    /**
     * 移除指定元素
     */
    remove(item: T): boolean;
    /**
     * 洗牌, 随机打乱当前数组
     */
    shuffle(): this;
}
interface Date {
    /**
     * 格式化当前日期
     * * 月(M), 日(d), 小时(h), 分(m), 秒(s), 季度(q)可以用 1-2 个占位符, 年(y)可以用 1-4 个占位符, 毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     */
    format(template: string): string;
}
declare type globalEvent = Event;
declare namespace dou {
    /**
     * 心跳计时器基类
     * 请使用 requestAnimationFrame 来调用 update 方法, 或者保证每 1/60 秒调用 update 方法 1 次
     * @author wizardc
     */
    abstract class TickerBase {
        static $startTime: number;
        protected _frameRateList: number[];
        protected _frameRate: number;
        protected _frameCount: number;
        protected _lastCount: number;
        protected _immediateUpdate: boolean;
        protected _lastTimeStamp: number;
        protected _paused: boolean;
        constructor();
        /**
         * 设置帧率
         * 注意: 只能设置为可以被 60 整除的帧率, 包括 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1
         */
        set frameRate(value: number);
        get frameRate(): number;
        /**
         * 是否暂停
         */
        get paused(): boolean;
        protected setFrameRate(value: number): void;
        /**
         * 请求立即刷新
         */
        requestImmediateUpdate(): void;
        /**
         * 暂停计时器
         */
        pause(): void;
        /**
         * 恢复计时器
         */
        resume(): void;
        /**
         * 执行一次更新逻辑
         */
        update(): void;
        protected abstract updateLogic(passedTime: number): void;
    }
}
declare namespace dou {
    /**
     * 事件发送器接口
     * @author wizardc
     */
    interface IEventDispatcher {
        on(type: string, listener: Function, thisObj?: any): void;
        once(type: string, listener: Function, thisObj?: any): void;
        has(type: string): boolean;
        dispatch(event: Event): boolean;
        off(type: string, listener: Function, thisObj?: any): void;
    }
}
declare namespace dou {
    /**
     * 事件发送器
     * @author wizardc
     */
    class EventDispatcher implements IEventDispatcher {
        private _eventMap;
        private _eventTarget;
        constructor(target?: any);
        on(type: string, listener: Function, thisObj?: any): void;
        once(type: string, listener: Function, thisObj?: any): void;
        protected addEventListener(type: string, listener: Function, thisObj: any, once: boolean): boolean;
        has(type: string): boolean;
        dispatch(event: Event): boolean;
        $notify(event: Event): boolean;
        off(type: string, listener: Function, thisObj?: any): void;
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出事件
         */
        dispatchEvent(type: string, data?: any, cancelable?: boolean): boolean;
    }
}
declare namespace dou {
    /**
     * 事件类
     * @author wizardc
     */
    class Event implements ICacheable {
        static OPEN: string;
        static CHANGE: string;
        static COMPLETE: string;
        static SOUND_COMPLETE: string;
        static MESSAGE: string;
        static CLOSE: string;
        private _type;
        private _data;
        private _cancelable;
        private _isDefaultPrevented;
        private _target;
        get type(): string;
        get data(): any;
        get cancelable(): boolean;
        get target(): IEventDispatcher;
        $initEvent(type: string, data?: any, cancelable?: boolean): void;
        $setTarget(target: IEventDispatcher): void;
        /**
         * 如果可以取消事件的默认行为, 则取消该行为
         */
        preventDefault(): void;
        $isDefaultPrevented(): boolean;
        onRecycle(): void;
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出 IO 错误事件
         */
        dispatchIOErrorEvent(type: string, msg: string, cancelable?: boolean): boolean;
    }
}
declare namespace dou {
    /**
     * IO 错误事件类
     * @author wizardc
     */
    class IOErrorEvent extends Event {
        static IO_ERROR: string;
        private _msg;
        get msg(): string;
        $initIOErrorEvent(type: string, msg: string, cancelable?: boolean): void;
        onRecycle(): void;
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出进度事件
         */
        dispatchProgressEvent(type: string, loaded: number, total: number, cancelable?: boolean): boolean;
    }
}
declare namespace dou {
    /**
     * 进度事件类
     * @author wizardc
     */
    class ProgressEvent extends Event {
        static PROGRESS: string;
        private _loaded;
        private _total;
        get loaded(): number;
        get total(): number;
        $initProgressEvent(type: string, loaded: number, total: number, cancelable?: boolean): void;
        onRecycle(): void;
    }
}
declare namespace dou {
    /**
     * 资源加载解析器接口
     * @author wizardc
     */
    interface IAnalyzer {
        load(url: string, callback: (url: string, data: any) => void, thisObj: any): void;
        release(url: string, data: any): boolean;
    }
}
declare namespace dou {
    /**
     * HTTP 请求加载器基类
     * @author wizardc
     */
    abstract class RequestAnalyzerBase implements IAnalyzer {
        protected abstract getResponseType(): HttpResponseType;
        protected abstract dataAnalyze(data: any): any;
        load(url: string, callback: (url: string, data: any) => void, thisObj: any): void;
        release(url: string, data: any): boolean;
    }
}
declare namespace dou {
    /**
     * 文本加载器
     * @author wizardc
     */
    class TextAnalyzer extends RequestAnalyzerBase {
        protected getResponseType(): HttpResponseType;
        protected dataAnalyze(data: any): any;
    }
}
declare namespace dou {
    /**
     * JSON 加载器
     * @author wizardc
     */
    class JsonAnalyzer extends RequestAnalyzerBase {
        protected getResponseType(): HttpResponseType;
        protected dataAnalyze(data: any): any;
    }
}
declare namespace dou {
    /**
     * 二进制加载器
     * @author wizardc
     */
    class BytesAnalyzer extends RequestAnalyzerBase {
        protected getResponseType(): HttpResponseType;
        protected dataAnalyze(data: any): any;
    }
}
declare namespace dou {
    /**
     * 声音加载器
     * @author wizardc
     */
    class SoundAnalyzer implements IAnalyzer {
        load(url: string, callback: (url: string, data: any) => void, thisObj: any): void;
        release(url: string, data: Sound): boolean;
    }
}
declare namespace dou {
    /**
     * 实际地址控制器
     * @author wizardc
     */
    interface IPathController {
        /**
         * 获取实际的 URL 地址
         */
        getVirtualUrl(url: string): string;
    }
}
declare namespace dou {
    /**
     * 加载管理器
     * @author wizardc
     */
    class LoadManager {
        private static _instance;
        static get instance(): LoadManager;
        private _maxLoadingThread;
        private _resourceRoot;
        private _analyzerMap;
        private _extensionMap;
        private _pathController;
        private _priorityList;
        private _priorityMap;
        private _keyMap;
        private _loadingMap;
        private _cacheTypeMap;
        private _cacheDataMap;
        private _nowLoadingThread;
        private constructor();
        /**
         * 最大的下载线程数
         */
        set maxLoadingThread(value: number);
        get maxLoadingThread(): number;
        /**
         * 资源根路径
         */
        set resourceRoot(value: string);
        get resourceRoot(): string;
        /**
         * 注册加载器
         */
        registerAnalyzer(type: string, analyzer: IAnalyzer): void;
        /**
         * 注册后缀名和其对应的默认类型
         */
        registerExtension(extension: string, type: string): void;
        /**
         * 注册实际地址控制器
         */
        registerPathController(controller: IPathController): void;
        /**
         * 加载指定项
         */
        load(url: string, callback?: (data: any, url: string) => void, thisObj?: any, type?: string, priority?: number, cache?: boolean): void;
        private getDefaultType;
        private sortFunc;
        private loadNext;
        loadAsync(url: string, type?: string, priority?: number, cache?: boolean): Promise<any>;
        /**
         * 加载多个指定项
         */
        loadGroup(items: {
            url: string;
            type?: string;
            priority?: number;
            cache?: boolean;
        }[], callback?: (current: number, total: number, data: any, url: string) => void, thisObj?: any): void;
        loadGroupAsync(items: {
            url: string;
            type?: string;
            priority?: number;
            cache?: boolean;
        }[]): Promise<void>;
        /**
         * 资源是否已经加载并缓存
         */
        isLoaded(url: string): boolean;
        /**
         * 获取已经加载并缓存的资源
         */
        get(url: string): any;
        /**
         * 释放已经加载并缓存的资源
         */
        release(url: string): boolean;
    }
    /**
     * 加载管理器快速访问
     */
    const loader: LoadManager;
}
declare namespace dou.impl {
    /**
     * 声音
     * * Audio 标签实现
     * @author wizardc
     */
    class AudioSound extends EventDispatcher implements ISound {
        private static _audios;
        private static _clearAudios;
        static pop(url: string): HTMLAudioElement;
        static recycle(url: string, audio: HTMLAudioElement): void;
        static clear(url: string): void;
        private _url;
        private _originAudio;
        private _loaded;
        constructor(target: any);
        get length(): number;
        load(url: string): void;
        play(startTime?: number, loops?: number): AudioSoundChannel;
        close(): void;
    }
}
declare namespace dou.impl {
    /**
     * 声音通道
     * * Audio 标签实现
     * @author wizardc
     */
    class AudioSoundChannel extends EventDispatcher {
        url: string;
        loops: number;
        startTime: number;
        private _audio;
        private _isStopped;
        private _volume;
        private _canPlay;
        private _onPlayEnd;
        constructor(audio: HTMLAudioElement);
        set volume(value: number);
        get volume(): number;
        get position(): number;
        play(): void;
        stop(): void;
    }
}
declare namespace dou.impl {
    /**
     * AudioContext 解码器
     * @author wizardc
     */
    namespace AudioAPIDecode {
        function init(context: AudioContext): void;
        function getContext(): AudioContext;
        function addDecode(decode: {
            buffer: any;
            success: Function;
            fail: Function;
            self: any;
        }): void;
        function decode(): void;
    }
}
declare namespace dou.impl {
    /**
     * 声音
     * * Audio API 实现
     * @author wizardc
     */
    class AudioAPISound extends EventDispatcher implements ISound {
        private _url;
        private _loaded;
        private _audioBuffer;
        constructor(target: any);
        get length(): number;
        load(url: string): void;
        play(startTime?: number, loops?: number): AudioAPISoundChannel;
        close(): void;
    }
}
declare namespace dou.impl {
    /**
     * 声音通道
     * * Audio API 实现
     * @author wizardc
     */
    class AudioAPISoundChannel extends EventDispatcher {
        url: string;
        loops: number;
        startTime: number;
        audioBuffer: AudioBuffer;
        private _context;
        private _gain;
        private _bufferSource;
        private _isStopped;
        private _recordStartTime;
        private _volume;
        private _onPlayEnd;
        constructor();
        set volume(value: number);
        get volume(): number;
        get position(): number;
        play(): void;
        stop(): void;
    }
}
declare namespace dou.impl {
    /**
     * 声音接口
     * @author wizardc
     */
    interface ISound extends IEventDispatcher {
        readonly length: number;
        load(url: string): void;
        play(startTime?: number, loops?: number): SoundChannel;
        close(): void;
    }
    let soundImpl: {
        new (target: any): ISound;
    };
}
declare namespace dou {
    /**
     * 声音
     * @author wizardc
     */
    class Sound implements IEventDispatcher {
        private _impl;
        constructor();
        /**
         * 当前声音的长度, 以秒为单位
         */
        get length(): number;
        /**
         * 启动从指定 URL 加载外部音频文件
         */
        load(url: string): void;
        /**
         * 生成一个新的 SoundChannel 对象来播放该声音
         * @param startTime 开始播放的时间, 以秒为单位
         * @param loops 循环次数, 0 表示循环播放
         */
        play(startTime?: number, loops?: number): SoundChannel;
        /**
         * 关闭该流
         */
        close(): void;
        on(type: string, listener: Function, thisObj?: any): void;
        once(type: string, listener: Function, thisObj?: any): void;
        has(type: string): boolean;
        dispatch(event: Event): boolean;
        off(type: string, listener: Function, thisObj?: any): void;
    }
}
declare namespace dou {
    /**
     * 声音通道
     * @author wizardc
     */
    interface SoundChannel extends IEventDispatcher {
        /**
         * 音量范围, [0-1]
         */
        volume: number;
        /**
         * 当播放声音时, 表示声音文件中当前播放的位置, 以秒为单位
         */
        readonly position: number;
        /**
         * 停止在该声道中播放声音
         */
        stop(): void;
    }
}
declare namespace dou {
    /**
     * HTTP 请求方法
     * @author wizardc
     */
    enum HttpMethod {
        GET = 0,
        POST = 1
    }
}
declare namespace dou {
    /**
     * HTTP 返回值类型
     * @author wizardc
     */
    enum HttpResponseType {
        arraybuffer = 1,
        blob = 2,
        document = 3,
        json = 4,
        text = 5
    }
}
declare namespace dou {
    /**
     * HTTP 请求类
     * @author wizardc
     */
    class HttpRequest extends EventDispatcher {
        private _xhr;
        private _responseType;
        private _withCredentials;
        private _headerMap;
        private _url;
        private _method;
        constructor();
        set responseType(value: HttpResponseType);
        get responseType(): HttpResponseType;
        set withCredentials(value: boolean);
        get withCredentials(): boolean;
        get response(): any;
        setRequestHeader(header: string, value: string): void;
        getResponseHeader(header: string): string;
        getAllResponseHeaders(): {
            [key: string]: string;
        };
        open(url: string, method?: HttpMethod): void;
        send(data?: any): void;
        private onReadyStateChange;
        private updateProgress;
        abort(): void;
    }
}
declare namespace dou {
    /**
     * 图片加载器
     * @author wizardc
     */
    class ImageLoader extends EventDispatcher {
        /**
         * 默认是否开启跨域访问控制
         */
        static crossOrigin: boolean;
        private _data;
        private _crossOrigin;
        private _currentImage;
        /**
         * 是否开启跨域访问控制
         */
        set crossOrigin(value: boolean);
        get crossOrigin(): boolean;
        get data(): HTMLImageElement;
        load(url: string): void;
        private getImage;
        private onLoad;
        private onError;
    }
}
declare namespace dou {
    /**
     * 套接字对象
     * @author wizardc
     */
    class Socket extends EventDispatcher {
        private _webSocket;
        private _endian;
        private _input;
        private _output;
        private _url;
        private _connected;
        private _cacheInput;
        private _addInputPosition;
        constructor(host?: string, port?: number);
        set endian(value: Endian);
        get endian(): Endian;
        get input(): ByteArray;
        get output(): ByteArray;
        get url(): string;
        get connected(): boolean;
        /**
         * 是否缓存服务端发送的数据到输入流中
         */
        set cacheInput(value: boolean);
        get cacheInput(): boolean;
        connect(host: string, port: number): void;
        connectByUrl(url: string): void;
        private onOpen;
        private onMessage;
        private onClose;
        private onError;
        send(data: string | ArrayBuffer): void;
        flush(): void;
        close(): void;
        private cleanSocket;
    }
}
declare namespace dou {
    /**
     * 缓动函数集合
     * @author wizardc
     */
    namespace Ease {
        const quadIn: (t: number) => number;
        const quadOut: (t: number) => number;
        const quadInOut: (t: number) => number;
        const cubicIn: (t: number) => number;
        const cubicOut: (t: number) => number;
        const cubicInOut: (t: number) => number;
        const quartIn: (t: number) => number;
        const quartOut: (t: number) => number;
        const quartInOut: (t: number) => number;
        const quintIn: (t: number) => number;
        const quintOut: (t: number) => number;
        const quintInOut: (t: number) => number;
        function sineIn(t: number): number;
        function sineOut(t: number): number;
        function sineInOut(t: number): number;
        const backIn: (t: number) => number;
        const backOut: (t: number) => number;
        const backInOut: (t: number) => number;
        function circIn(t: number): number;
        function circOut(t: number): number;
        function circInOut(t: number): number;
        function bounceIn(t: number): number;
        function bounceOut(t: number): number;
        function bounceInOut(t: number): number;
        const elasticIn: (t: number) => number;
        const elasticOut: (t: number) => number;
        const elasticInOut: (t: number) => number;
    }
}
declare namespace dou {
    /**
     * 缓动类
     * @author wizardc
     */
    class Tween extends EventDispatcher {
        /**
         * 不做特殊处理
         */
        private static NONE;
        /**
         * 循环
         */
        private static LOOP;
        /**
         * 倒序
         */
        private static REVERSE;
        private static _tweens;
        /**
         * 帧循环逻辑, 请在项目的合适地方进行循环调用
         */
        static tick(passedTime: number, paused?: boolean): void;
        /**
         * 激活一个对象, 对其添加 Tween 动画
         * @param target 要激活 Tween 的对象
         * @param props 参数
         * @param override 是否移除对象之前添加的tween
         * @returns 缓动对象
         */
        static get(target: any, props?: {
            loop?: boolean;
            onChange?: Function;
            onChangeObj?: any;
        }, override?: boolean): Tween;
        /**
         * 暂停某个对象的所有 Tween 动画
         */
        static pauseTweens(target: any): void;
        /**
         * 继续播放某个对象的所有 Tween 动画
         */
        static resumeTweens(target: any): void;
        /**
         * 删除一个对象上的全部 Tween 动画
         */
        static removeTweens(target: any): void;
        /**
         * 删除所有的 Tween 动画
         */
        static removeAllTweens(): void;
        private static _register;
        private _target;
        private _useTicks;
        private _ignoreGlobalPause;
        private _loop;
        private _curQueueProps;
        private _initQueueProps;
        private _steps;
        private _paused;
        private _duration;
        private _prevPos;
        private _position;
        private _prevPosition;
        private _stepPosition;
        private _passive;
        constructor(target: any, props: any);
        private initialize;
        /**
         * 设置是否暂停
         */
        setPaused(value: boolean): Tween;
        /**
         * 等待指定毫秒后执行下一个动画
         * @param duration 要等待的时间, 以毫秒为单位
         * @param passive 等待期间属性是否会更新
         * @returns Tween 对象本身
         */
        wait(duration: number, passive?: boolean): Tween;
        /**
         * 将指定对象的属性修改为指定值
         * @param props 对象的属性集合
         * @param duration 持续时间
         * @param ease 缓动算法
         * @returns Tween 对象本身
         */
        to(props: any, duration?: number, ease?: Function): Tween;
        /**
         * 执行回调函数
         * @param callback 回调方法
         * @param thisObj 回调方法 this 作用域
         * @param params 回调方法参数
         * @returns Tween 对象本身
         */
        call(callback: Function, thisObj?: any, params?: any[]): Tween;
        /**
         * 立即将指定对象的属性修改为指定值
         * @param props 对象的属性集合
         * @param target 要继续播放 Tween 的对象
         * @returns Tween 对象本身
         */
        set(props: any, target?: any): Tween;
        /**
         * 播放
         * @param tween 需要操作的 Tween 对象, 默认 this
         * @returns Tween 对象本身
         */
        play(tween?: Tween): Tween;
        /**
         * 暂停
         * @param tween 需要操作的 Tween 对象, 默认 this
         * @returns Tween 对象本身
         */
        pause(tween?: Tween): Tween;
        /**
         * @private
         */
        $tick(delta: number): void;
        /**
         * @private
         */
        setPosition(value: number, actionsMode?: number): boolean;
        private _runAction;
        private _updateTargetProps;
        private _cloneProps;
        private _addStep;
        private _appendQueueProps;
        private _addAction;
        private _set;
    }
}
declare namespace dou {
    /**
     * 获取引擎启动之后经过的毫秒数
     */
    function getTimer(): number;
}
declare namespace dou {
    /**
     * 通过对象池进行缓存的对象类型
     * @author wizardc
     */
    interface ICacheable {
        /**
         * 加入对象池时调用
         */
        onRecycle?(): void;
        /**
         * 从对象池中取出时调用
         */
        onReuse?(): void;
    }
}
declare namespace dou {
    type Creator<T> = {
        new (): T;
    };
    /**
     * 对象池
     * @author wizardc
     */
    class ObjectPool<T> {
        private _creator;
        private _maxCount;
        private _list;
        private _map;
        constructor(creator: Creator<T>, maxCount?: number);
        get size(): number;
        join(obj: T): void;
        take(): T;
        clear(): void;
    }
}
declare namespace dou {
    type Recyclable<T> = T & {
        recycle(): void;
    };
    /**
     * 获取一个可回收的对象
     */
    function recyclable<T>(creator: Creator<T> & {
        __pool?: ObjectPool<T>;
    }): Recyclable<T>;
    /**
     * 对象池配置
     */
    function DeployPool(maxCount: number): (constructor: Function) => void;
    /**
     * 对象池配置
     */
    function deployPool(creator: Creator<any> & {
        __pool?: ObjectPool<any>;
    }, maxCount: number): void;
    /**
     * 获取对象池中的对象数量
     */
    function getPoolSize(creator: Creator<any> & {
        __pool?: ObjectPool<any>;
    }): number;
    /**
     * 清空对象池
     */
    function clearPool(creator: Creator<any> & {
        __pool?: ObjectPool<any>;
    }): void;
}
declare namespace dou {
    /**
     * 字节顺序
     * @author wizardc
     */
    const enum Endian {
        littleEndian = 0,
        bigEndian = 1
    }
}
declare namespace dou {
    /**
     * 字节数组
     * @author wizardc
     */
    class ByteArray {
        protected _bufferExtSize: number;
        protected _data: DataView;
        protected _bytes: Uint8Array;
        protected _position: number;
        protected _writePosition: number;
        protected _endian: Endian;
        private _eofByte;
        private _eofCodePoint;
        constructor(buffer?: ArrayBuffer | Uint8Array, bufferExtSize?: number);
        set endian(value: Endian);
        get endian(): Endian;
        get readAvailable(): number;
        get buffer(): ArrayBuffer;
        get rawBuffer(): ArrayBuffer;
        set buffer(value: ArrayBuffer);
        get bytes(): Uint8Array;
        get dataView(): DataView;
        set dataView(value: DataView);
        get bufferOffset(): number;
        set position(value: number);
        get position(): number;
        set length(value: number);
        get length(): number;
        protected validateBuffer(value: number): void;
        get bytesAvailable(): number;
        validate(len: number): boolean;
        protected validateBuffer2(len: number): void;
        readBoolean(): boolean;
        readByte(): number;
        readUnsignedByte(): number;
        readShort(): number;
        readUnsignedShort(): number;
        readInt(): number;
        readUnsignedInt(): number;
        readFloat(): number;
        readDouble(): number;
        readBytes(bytes: ByteArray, offset?: number, length?: number): void;
        readUTF(): string;
        readUTFBytes(length: number): string;
        private decodeUTF8;
        private inRange;
        private decoderError;
        writeBoolean(value: boolean): void;
        writeByte(value: number): void;
        writeShort(value: number): void;
        writeUnsignedShort(value: number): void;
        writeInt(value: number): void;
        writeUnsignedInt(value: number): void;
        writeFloat(value: number): void;
        writeDouble(value: number): void;
        writeBytes(bytes: ByteArray, offset?: number, length?: number): void;
        writeUTF(value: string): void;
        writeUTFBytes(value: string): void;
        private encodeUTF8;
        private stringToCodePoints;
        writeUint8Array(bytes: Uint8Array | ArrayLike<number>, validateBuffer?: boolean): void;
        private div;
        clear(): void;
        toString(): string;
    }
}
declare namespace dou {
    /**
     * HTTP 请求工具类
     * @author wizardc
     */
    namespace HttpUtil {
        function addParamToUrl(url: string, data: Object): string;
        function get(url: string, callback?: (response: any) => void, thisObj?: any, errorCallback?: (status: number) => void, errorThisObj?: any): void;
        function post(url: string, data?: any, callback?: (response: any) => void, thisObj?: any, errorCallback?: (status: number) => void, errorThisObj?: any): void;
    }
}
declare namespace dou {
    /**
     * 脚本工具类
     * @author wizardc
     */
    namespace ScriptUtil {
        /**
         * 同步加载 JS 文件
         */
        function loadJSSync(url: string): void;
        /**
         * 异步加载 JS 文件, 放在 head 中
         */
        function loadJSAsync(url: string): void;
        /**
         * 异步加载 JS 文件, 放在 body 中
         */
        function loadJS(url: string, cross?: boolean, callback?: Function, thisObj?: any, ...args: any[]): void;
    }
}
declare namespace dou {
    /**
     * 位运算工具类
     * @author wizardc
     */
    namespace BitUtil {
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @param value 设置为 1 (true) 还是 0 (false)
         */
        function setBit(target: number, position: number, value: boolean): number;
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @returns 对应的值为 1 (true) 还是 0 (false)
         */
        function getBit(target: number, position: number): boolean;
        /**
         * @param position 指定的位的位置, 从低位开始, 范围为 [0-64)
         * @returns 对应的值为 1 (true) 还是 0 (false)
         */
        function switchBit32(target: number, position: number): number;
    }
}
declare namespace dou {
    /**
     * 字符串工具类
     * @author wizardc
     */
    namespace StringUtil {
        /**
         * 使用参数替换模板字符串
         */
        function substitute(str: string, ...rest: string[]): string;
        /**
         * 字符串是否全是空白字符
         */
        function isAllWhitespace(str: string): boolean;
    }
}
declare namespace dou {
    /**
     * 调用父类 getter 方法, 类似其他语言的 xxx = super.getter; 这样的写法
     * @param currentClass 当前的类
     * @param thisObj 当前的对象
     * @param type 要调用的属性名
     * @returns 返回的值
     */
    function superGetter(currentClass: any, thisObj: any, type: string): any;
}
declare namespace dou {
    /**
     * 调用父类 setter 方法, 类似其他语言的 super.setter = xxx; 这样的写法
     * @param currentClass 当前的类
     * @param thisObj 当前的对象
     * @param type 要调用的属性名
     * @param values 传递的参数
     */
    function superSetter(currentClass: any, thisObj: any, type: string, ...values: any[]): any;
}
