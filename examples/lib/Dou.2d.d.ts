declare namespace Dou.sys {
    /**
     * 渲染上下文
     */
    const glContext = "glContext";
    /**
     * 是否预乘 Alpha
     */
    const unpackPremultiplyAlphaWebgl = "unpackPremultiplyAlphaWebgl";
    /**
     * 引擎默认空白贴图
     */
    const engineDefaultEmptyTexture = "engineDefaultEmptyTexture";
    /**
     * 是否抗锯齿
     */
    const smoothing = "smoothing";
}
declare namespace Dou.sys {
    /**
     * 标记指定属性不可用
     */
    function markCannotUse(instance: any, property: string, defaultValue: any): void;
}
declare namespace Dou.sys {
    /**
     * 画布
     */
    let canvas: HTMLCanvasElement;
    /**
     * 心跳计时器
     */
    let ticker: Ticker;
    /**
     * 播放器
     */
    let player: Player;
    /**
     * 舞台
     */
    let stage: Stage;
    /**
     * 屏幕适配器
     */
    let screenAdapter: IScreenAdapter;
    /**
     * 2D 渲染上下文
     */
    let context2D: CanvasRenderingContext2D;
    /**
     * 渲染对象
     */
    let renderer: rendering.Renderer;
    /**
     * 用于碰撞检测的渲染缓冲
     */
    let hitTestBuffer: rendering.RenderBuffer;
    /**
     * 贴图缩放系数
     * * 为了解决图片和字体发虚所引入的机制, 它底层实现的原理是创建更大的画布去绘制
     * * 之所以出现发虚这个问题, 是因为普通屏幕的 1 个像素点就是 1 个物理像素点, 而高清屏的 1 个像素点是 4 个物理像素点, 仅高清手机屏会出现该问题
     */
    let textureScaleFactor: number;
    /**
     * 文本输入管理
     */
    let inputManager: input.InputManager;
    /**
     * 性能统计
     */
    let stat: Stat;
    /**
     * 进入帧回调对象列表
     */
    let enterFrameCallBackList: DisplayObject[];
    /**
     * 仅一次进入帧回调对象列表
     */
    let enterFrameOnceCallBackList: DisplayObject[];
    /**
     * 固定频率进入帧回调对象列表
     */
    let fixedEnterFrameCallBackList: DisplayObject[];
    /**
     * 仅一次固定频率进入帧回调对象列表
     */
    let fixedEnterFrameOnceCallBackList: DisplayObject[];
    /**
     * 是否派发 Event.RENDER 事件
     */
    let invalidateRenderFlag: boolean;
    /**
     * 渲染回调对象列表
     */
    let renderCallBackList: DisplayObject[];
    /**
     * 仅一次渲染回调对象列表
     */
    let renderOnceCallBackList: DisplayObject[];
}
declare namespace Dou {
    /**
     * 3x3 矩阵
     * 表示一个转换矩阵, 该矩阵确定二维显示对象的位置和方向
     * 该矩阵可以执行转换功能, 包括平移 (沿 x 和 y 轴重新定位), 倾斜, 旋转和缩放 (调整大小)
     * ```
     *  ---                            ---
     *  |     a         c         tx     |   x轴
     *  |     b         d         ty     |   y轴
     *  |     u         v         w      |
     *  ---                            ---
     * ```
     * 在二维中不需要使用到额外的 u, v, w 这 3 个数据, 我们使用如下的默认值即可:
     * ```
     *  ---                            ---
     *  |     a         c         tx     |   x轴
     *  |     b         d         ty     |   y轴
     *  |     0         0         1      |
     *  ---                            ---
     * ```
     * @author wizardc
     */
    class Matrix implements Dou.ICacheable {
        /**
         * 缩放或旋转图像时影响像素沿 x 轴定位的值
         */
        a: number;
        /**
         * 旋转或倾斜图像时影响像素沿 y 轴定位的值
         */
        b: number;
        /**
         * 旋转或倾斜图像时影响像素沿 x 轴定位的值
         */
        c: number;
        /**
         * 缩放或旋转图像时影响像素沿 y 轴定位的值
         */
        d: number;
        /**
         * 沿 x 轴平移每个点的距离
         */
        tx: number;
        /**
         * 沿 y 轴平移每个点的距离
         */
        ty: number;
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
        get scaleX(): number;
        get scaleY(): number;
        get skewX(): number;
        get skewY(): number;
        private getDeterminant;
        set(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix;
        /**
         * 将该矩阵乘以一个矩阵或将两个矩阵相乘的结果写入该矩阵
         * - v *= matrix
         * - v = matrixA * matrixB
         */
        multiply(matrixA: Matrix, matrixB?: Matrix): this;
        /**
         * 一个矩阵或将两个矩阵乘以该矩阵的结果写入该矩阵
         * - v = matrix * v
         * - v = matrixB * matrixA
         */
        premultiply(matrixA: Matrix, matrixB?: Matrix): this;
        /**
         * 反转当前矩阵或传入的矩阵
         */
        inverse(input?: Matrix): this;
        /**
         * 后置矩阵
         * - v *= matrix
         */
        append(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
        /**
         * 前置矩阵
         * - v = matrix * v
         */
        prepend(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
        /**
         * 应用旋转
         * @param angle 以弧度为单位的旋转角度
         */
        rotate(angle: number): void;
        /**
         * 应用缩放
         */
        scale(sx: number, sy: number): void;
        /**
         * 应用平移
         */
        translate(dx: number, dy: number): void;
        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         */
        transformPoint(pointX: number, pointY: number, result?: Point): Point;
        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         * 与 transformPoint 不同的地方是该方法的转换不考虑转换参数 tx 和 ty
         */
        deltaTransformPoint(point: Point, result?: Point): Point;
        /**
         * 如果给定预转换坐标空间中的矩形, 则此方法返回发生转换后的矩形
         */
        transformBounds(bounds: Rectangle, result?: Rectangle): Rectangle;
        /**
         * 更新当前矩阵的缩放和旋转
         */
        updateScaleAndRotation(scaleX: number, scaleY: number, skewX: number, skewY: number): void;
        equals(other: Matrix): boolean;
        copy(matrix: Matrix): Matrix;
        clone(): Matrix;
        identity(): void;
        onRecycle(): void;
    }
}
declare namespace Dou {
    /**
     * 点接口
     * @author wizardc
     */
    interface IPoint {
        x: number;
        y: number;
    }
    /**
     * 点对象
     * @author wizardc
     */
    class Point implements Dou.ICacheable {
        static readonly ZERO: Readonly<Point>;
        static readonly ONE: Readonly<Point>;
        static readonly MINUS_ONE: Readonly<Point>;
        /**
         * 获取距离
         */
        static distance(v1: IPoint, v2: IPoint): number;
        /**
         * 根据长度和角度获取一个向量
         * - 弧度制
         */
        static polar(length: number, angle: number, result?: IPoint): IPoint;
        /**
         * 判断两条直线是否相交
         * @param line1Point1 直线 1 上的任意一点
         * @param line1Point2 直线 1 上的任意一点
         * @param line2Point1 直线 2 上的任意一点
         * @param line2Point2 直线 2 上的任意一点
         * @param intersectionPoint 如果传入且相交则会保存交点的位置
         * @returns 是否相交
         * @tutorial https://github.com/thelonious/js-intersections/blob/master/src/intersection/Intersection.js
         */
        static intersection(line1Point1: IPoint, line1Point2: IPoint, line2Point1: IPoint, line2Point2: IPoint, intersectionPoint?: IPoint): boolean;
        /**
         * 线性插值
         */
        static lerp(from: IPoint, to: IPoint, t: number, result?: IPoint): IPoint;
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        get sqrtLength(): number;
        get length(): number;
        set(x: number, y: number): this;
        /**
         * 将该向量加上一个向量或将两个向量相加的结果写入该向量
         * - v += v1
         * - v = v1 + v2
         */
        add(p1: IPoint, p2?: IPoint): this;
        /**
         * 将该向量减去一个向量或将两个向量相减的结果写入该向量
         * - v -= v1
         * - v = v1 - v2
         */
        subtract(p1: IPoint, p2?: IPoint): this;
        /**
         * 将该向量乘上一个向量或将两个向量相乘的结果写入该向量
         * - v *= v1
         * - v = v1 * v2
         */
        multiply(p1: IPoint, p2?: IPoint): this;
        /**
         * 将该向量加上一个标量或将输入向量与标量相加的结果写入该向量
         * - v += scalar
         * - v = input + scalar
         */
        addScalar(scalar: number, input?: IPoint): this;
        /**
         * 将该向量乘上一个标量或将输入向量与标量相乘的结果写入该向量
         * - v *= scalar
         * - v = input * scalar
         */
        multiplyScalar(scalar: number, input?: IPoint): this;
        /**
         * 计算该向量与另一个向量的点积
         * - v · vector
         */
        dot(point: IPoint): number;
        /**
         * 获取一个向量和该向量的夹角
         * - 弧度制
         */
        getAngle(point: IPoint): number;
        /**
         * 叉乘
         */
        cross(point: IPoint): number;
        /**
         * 归一化该向量或传入的向量
         * - v /= v.length
         */
        normalize(input?: IPoint): this;
        equal(point: IPoint): boolean;
        copy(value: IPoint): this;
        clone(): IPoint;
        clear(): this;
        onRecycle(): void;
    }
}
declare namespace Dou {
    /**
     * 矩形对象
     * @author wizardc
     */
    class Rectangle implements Dou.ICacheable {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        set top(value: number);
        get top(): number;
        set bottom(value: number);
        get bottom(): number;
        set left(value: number);
        get left(): number;
        set right(value: number);
        get right(): number;
        set topLeft(value: Point);
        get topLeft(): Point;
        set bottomRight(value: Point);
        get bottomRight(): Point;
        set(x: number, y: number, width: number, height: number): this;
        /**
         * 尺寸是否为空
         */
        isEmpty(): boolean;
        /**
         * 是否包含指定的点
         */
        contains(x: number, y: number): boolean;
        /**
         * 判断是否包含指定的点
         */
        containsPoint(point: IPoint): boolean;
        /**
         * 判断是否包含指定的矩形
         */
        containsRect(rect: Rectangle): boolean;
        /**
         * 判断是否和指定的对象相交
         */
        intersects(rect: Rectangle): boolean;
        /**
         * 判断是否和指定的对象相交, 返回相交区域, 如果不相交则返回的相交区域的 x, y, width 和 height 都为 0
         */
        intersection(rect: Rectangle, result?: Rectangle): Rectangle;
        /**
         * 合并两个矩形为一个新矩形
         */
        union(rect: Rectangle, result?: Rectangle): Rectangle;
        equals(rect: Rectangle): boolean;
        copy(rect: Rectangle): this;
        clone(): Rectangle;
        clear(): this;
        onRecycle(): void;
    }
}
declare namespace Dou.sys {
    /**
     * 心跳计时器
     * @author wizardc
     */
    class Ticker extends Dou.TickerBase {
        private _tickList;
        constructor();
        /**
         * 添加自定义心跳计时器
         */
        startTick(method: (passedTime: number) => void, thisObj: any): void;
        private getTickIndex;
        private concatTick;
        /**
         * 移除自定义心跳计时器
         */
        stopTick(method: (passedTime: number) => void, thisObj: any): void;
        updateLogic(passedTime: number): void;
        private broadcastDelay;
        private broadcastTick;
        private broadcastRender;
        private broadcastEnterFrame;
        private broadcastFixedEnterFrame;
    }
}
declare namespace Dou.sys {
    /**
     * 播放器
     * @author wizardc
     */
    class Player {
        private _screenDisplayList;
        private _stage;
        private _rootClass;
        private _root;
        private _isPlaying;
        constructor(buffer: rendering.RenderBuffer, stage: Stage, rootClass: any);
        private createDisplayList;
        start(): void;
        private initialize;
        pause(): void;
        /**
         * 渲染
         */
        render(passedTime: number): number;
        /**
         * 更新舞台尺寸
         */
        updateStageSize(stageWidth: number, stageHeight: number): void;
    }
}
declare namespace Dou {
    /**
     * 资源管理器
     * * 提供资源配置文件, 通过该文件可以方便的使用一个简单的名称来指定特定的资源而不使用资源的路径
     * * 使用该管理器需要保证资源名称的唯一性
     * * 支持获取图集中的某个图片资源
     * @author wizardc
     */
    class AssetManager {
        private static _instance;
        static get instance(): AssetManager;
        private _itemMap;
        private _sheetLoadingMap;
        private constructor();
        $init(): void;
        /**
         * 加载配置
         */
        loadConfig(url: string, resourceRoot?: string, callback?: (success: boolean) => void, thisObj?: any): void;
        /**
         * 加载配置
         */
        loadConfigAsync(url: string, resourceRoot?: string): Promise<void>;
        /**
         * 添加配置
         */
        addConfig(config: AssetConfigItem[], resourceRoot?: string): void;
        /**
         * 资源是否存在
         */
        hasRes(source: string): boolean;
        /**
         * 资源是否已经加载
         */
        isLoaded(source: string): boolean;
        private getItem;
        private getRealPath;
        /**
         * 加载资源
         */
        loadRes(source: string, priority?: number, callBack?: (data: any, source: string) => void, thisObject?: any): void;
        private getSheetInfo;
        private onSheetLoaded;
        /**
         * 加载资源
         */
        loadResAsync(source: string, priority?: number): Promise<any>;
        /**
         * 获取已经加载的资源项
         */
        getRes(source: string): any;
        /**
         * 加载资源组
         */
        loadGroup(sources: string[], priority?: number, callback?: (current: number, total: number, data: any, source: string) => void, thisObj?: any): void;
        /**
         * 加载资源组
         */
        loadGroupAsync(sources: string[], priority?: number): Promise<void>;
        /**
         * 销毁资源
         */
        destroyRes(source: string): boolean;
    }
    /**
     * 资源管理器快速访问
     */
    const asset: AssetManager;
}
declare namespace Dou {
    /**
     * 资源配置项
     * @author wizardc
     */
    interface AssetConfigItem {
        name: string;
        type: AssetType;
        url: string;
        subkeys?: string[];
    }
    /**
     * 图集配置
     * @author wizardc
     */
    interface SheetConfig {
        file: string;
        frames: {
            [name: string]: {
                x: number;
                y: number;
                w: number;
                h: number;
                offX: number;
                offY: number;
                sourceW: number;
                sourceH: number;
            };
        };
    }
}
declare namespace Dou {
    /**
     * 资源类型
     * @author wizardc
     */
    const enum AssetType {
        text = "text",
        json = "json",
        binary = "binary",
        image = "image",
        sheet = "sheet",
        sound = "sound"
    }
}
declare namespace Dou {
    /**
     * 显示对象
     * @author wizardc
     */
    class DisplayObject extends Dou.EventDispatcher {
        /**
         * 显示对象默认的 touchEnabled 属性
         */
        static defaultTouchEnabled: boolean;
        $useTranslate: boolean;
        $displayList: rendering.DisplayList;
        $cacheDirty: boolean;
        $maskedObject: DisplayObject;
        $mask: DisplayObject;
        $maskRect: Rectangle;
        $renderNode: rendering.RenderNode;
        $renderDirty: boolean;
        $renderMode: rendering.RenderMode;
        $tintRGB: number;
        $sortDirty: boolean;
        $lastSortedIndex: number;
        /**
         * 这个对象在显示列表中的嵌套深度, 舞台为 1, 它的子项为 2, 子项的子项为 3, 以此类推, 当对象不在显示列表中时此属性值为 0
         */
        $nestLevel: number;
        protected _children: DisplayObject[];
        protected _parent: DisplayObjectContainer;
        protected _stage: Stage;
        protected _name: string;
        protected _matrix: Matrix;
        protected _matrixDirty: boolean;
        protected _concatenatedMatrix: Matrix;
        protected _invertedConcatenatedMatrix: Matrix;
        protected _x: number;
        protected _y: number;
        protected _scaleX: number;
        protected _scaleY: number;
        protected _rotation: number;
        protected _skewX: number;
        protected _skewXdeg: number;
        protected _skewY: number;
        protected _skewYdeg: number;
        protected _explicitWidth: number;
        protected _explicitHeight: number;
        protected _anchorOffsetX: number;
        protected _anchorOffsetY: number;
        protected _visible: boolean;
        protected _invisible: boolean;
        protected _finalVisible: boolean;
        protected _alpha: number;
        protected _tint: number;
        protected _blendMode: BlendMode;
        protected _scrollRect: Rectangle;
        protected _filters: (Filter | CustomFilter)[];
        protected _filterClip: Rectangle;
        protected _cacheAsBitmap: boolean;
        protected _touchEnabled: boolean;
        protected _hitArea: Rectangle;
        protected _dropEnabled: boolean;
        protected _zIndex: number;
        protected _sortableChildren: boolean;
        constructor();
        /**
         * 父容器
         */
        get parent(): DisplayObjectContainer;
        /**
         * 设置父级显示对象
         */
        $setParent(parent: DisplayObjectContainer): void;
        /**
         * 子项列表
         */
        get $children(): DisplayObject[];
        /**
         * 舞台
         */
        get stage(): Stage;
        /**
         * 名称
         */
        set name(value: string);
        get name(): string;
        /**
         * 当前显示对象的矩阵
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         */
        set matrix(value: Matrix);
        get matrix(): Matrix;
        /**
         * 设置矩阵
         */
        $setMatrix(matrix: Matrix, needUpdateProperties?: boolean): void;
        /**
         * 获取矩阵
         */
        $getMatrix(): Matrix;
        /**
         * 获得这个显示对象以及它所有父级对象的连接矩阵
         */
        $getConcatenatedMatrix(): Matrix;
        /**
         * 获取链接矩阵
         */
        $getInvertedConcatenatedMatrix(): Matrix;
        /**
         * x 轴坐标
         */
        set x(value: number);
        get x(): number;
        $setX(value: number): boolean;
        $getX(): number;
        /**
         * y 轴坐标
         */
        set y(value: number);
        get y(): number;
        $setY(value: number): boolean;
        $getY(): number;
        /**
         * 水平缩放值
         */
        set scaleX(value: number);
        get scaleX(): number;
        $setScaleX(value: number): void;
        $getScaleX(): number;
        /**
         * 垂直缩放值
         */
        set scaleY(value: number);
        get scaleY(): number;
        $setScaleY(value: number): void;
        $getScaleY(): number;
        /**
         * 旋转值
         */
        set rotation(value: number);
        get rotation(): number;
        $setRotation(value: number): void;
        $getRotation(): number;
        /**
         * 水平方向斜切
         */
        set skewX(value: number);
        get skewX(): number;
        $setSkewX(value: number): void;
        $getSkewX(): number;
        /**
         * 垂直方向斜切
         */
        set skewY(value: number);
        get skewY(): number;
        $setSkewY(value: number): void;
        $getSkewY(): number;
        /**
         * 宽度
         */
        set width(value: number);
        get width(): number;
        $setWidth(value: number): void;
        $getWidth(): number;
        /**
         * 高度
         */
        set height(value: number);
        get height(): number;
        $setHeight(value: number): void;
        $getHeight(): number;
        /**
         * 测量宽度
         */
        get measuredWidth(): number;
        /**
         * 测量高度
         */
        get measuredHeight(): number;
        /**
         * x 轴锚点
         */
        set anchorOffsetX(value: number);
        get anchorOffsetX(): number;
        $setAnchorOffsetX(value: number): void;
        $getAnchorOffsetX(): number;
        /**
         * y 轴锚点
         */
        set anchorOffsetY(value: number);
        get anchorOffsetY(): number;
        $setAnchorOffsetY(value: number): void;
        $getAnchorOffsetY(): number;
        /**
         * 是否可见
         */
        set visible(value: boolean);
        get visible(): boolean;
        /**
         * 是否不可见
         */
        set invisible(value: boolean);
        get invisible(): boolean;
        /**
         * 最终是否可见
         */
        get finalVisible(): boolean;
        $setVisible(value: boolean): void;
        $getVisible(): boolean;
        /**
         * 透明度
         */
        set alpha(value: number);
        get alpha(): number;
        $setAlpha(value: number): void;
        $getAlpha(): number;
        /**
         * 给当前对象设置填充色
         */
        set tint(value: number);
        get tint(): number;
        /**
         * 混合模式
         */
        set blendMode(value: BlendMode);
        get blendMode(): BlendMode;
        $setBlendMode(value: BlendMode): void;
        $getBlendMode(): BlendMode;
        /**
         * 显示对象的滚动矩形范围
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 显示对象被裁切为矩形定义的大小, 当您更改 scrollRect 对象的 x 和 y 属性时, 它会在矩形内滚动
         */
        set scrollRect(value: Rectangle);
        get scrollRect(): Rectangle;
        $setScrollRect(value: Rectangle): void;
        $getScrollRect(): Rectangle;
        /**
         * 当前对象的遮罩
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 如果遮罩是一个显示对象, 遮罩对象添加到舞台中不会进行绘制
         * * 如果遮罩是一个显示对象, 要确保当舞台缩放时蒙版仍然有效需要将该遮罩添加到显示列表中
         * * 如果遮罩是一个显示对象, 该遮罩对象不能用于遮罩多个执行调用的显示对象, 将其分配给第二个显示对象时, 会撤消其作为第一个对象的遮罩
         */
        set mask(value: DisplayObject | Rectangle);
        get mask(): DisplayObject | Rectangle;
        $setMask(value: DisplayObject | Rectangle): void;
        $getMask(): DisplayObject | Rectangle;
        /**
         * 包含当前与显示对象关联的每个滤镜对象的索引数组
         */
        set filters(value: (Filter | CustomFilter)[]);
        get filters(): (Filter | CustomFilter)[];
        $setFilters(value: (Filter | CustomFilter)[]): void;
        $getFilters(): (Filter | CustomFilter)[];
        /**
         * 当前对象的滤镜裁剪区域
         * * 注意: 设定后仅渲染设定了裁剪区域内的图像, 同时滤镜也按照该区域进行处理, 不设定按照默认尺寸进行渲染
         */
        set filterClip(value: Rectangle);
        get filterClip(): Rectangle;
        $setFilterClip(value: Rectangle): void;
        $getFilterClip(): Rectangle;
        /**
         * 是否将当前的显示对象缓存为位图
         */
        set cacheAsBitmap(value: boolean);
        get cacheAsBitmap(): boolean;
        $setHasDisplayList(value: boolean): void;
        /**
         * 是否接收触摸事件
         */
        set touchEnabled(value: boolean);
        get touchEnabled(): boolean;
        $setTouchEnabled(value: boolean): void;
        $getTouchEnabled(): boolean;
        /**
         * 指定的点击区域
         */
        set hitArea(value: Rectangle);
        get hitArea(): Rectangle;
        $setHitArea(value: Rectangle): void;
        $getHitArea(): Rectangle;
        /**
         * 是否接受其它对象拖入
         */
        set dropEnabled(value: boolean);
        get dropEnabled(): boolean;
        $setDropEnabled(value: boolean): void;
        $getDropEnabled(): boolean;
        /**
         * 设置对象的 Z 轴顺序
         */
        set zIndex(value: number);
        get zIndex(): number;
        /**
         * 允许对象使用 zIndex 排序
         */
        set sortableChildren(value: boolean);
        get sortableChildren(): boolean;
        /**
         * 显示对象添加到舞台
         */
        $onAddToStage(stage: Stage, nestLevel: number): void;
        /**
         * 显示对象从舞台移除
         */
        $onRemoveFromStage(): void;
        protected updateUseTransform(): void;
        $cacheDirtyUp(): void;
        /**
         * 对子项进行排序
         */
        sortChildren(): void;
        /**
         * 返回一个矩形，该矩形定义相对于 targetCoordinateSpace 对象坐标系的显示对象区域
         */
        getTransformedBounds(targetCoordinateSpace: DisplayObject, result?: Rectangle): Rectangle;
        /**
         * 获取显示对象的测量边界
         */
        getBounds(result?: Rectangle, calculateAnchor?: boolean): Rectangle;
        $getTransformedBounds(targetCoordinateSpace: DisplayObject, result?: Rectangle): Rectangle;
        /**
         * 从全局坐标转换为本地坐标
         */
        globalToLocal(stageX?: number, stageY?: number, result?: Point): Point;
        /**
         * 将本地坐标转换为全局坐标
         */
        localToGlobal(localX?: number, localY?: number, result?: Point): Point;
        /**
         * 获取显示对象占用的矩形区域, 通常包括自身绘制的测量区域, 如果是容器, 还包括所有子项占据的区域
         */
        $getOriginalBounds(): Rectangle;
        /**
         * 获取显示对象自身占用的矩形区域
         */
        $getContentBounds(): Rectangle;
        /**
         * 测量自身占用的矩形区域
         */
        $measureContentBounds(bounds: Rectangle): void;
        /**
         * 测量子项占用的矩形区域
         */
        $measureChildBounds(bounds: Rectangle): void;
        /**
         * 测量滤镜偏移量
         */
        private $measureFiltersOffset;
        /**
         * 获取渲染节点
         */
        $getRenderNode(): rendering.RenderNode;
        /**
         * 更新渲染模式
         */
        $updateRenderMode(): void;
        /**
         * 获取相对于指定根节点的连接矩阵
         */
        $getConcatenatedMatrixAt(root: DisplayObject, matrix: Matrix): void;
        /**
         * 更新渲染节点
         */
        $updateRenderNode(): void;
        /**
         * 碰撞检测, 检测舞台坐标下面最先碰撞到的显示对象
         */
        $hitTest(stageX: number, stageY: number): DisplayObject;
        /**
         * 碰撞检测
         * @param shapeFlag 是否开启精确碰撞检测
         */
        hitTestPoint(x: number, y: number, shapeFlag?: boolean): boolean;
        removeSelf(): void;
        protected addEventListener(type: string, listener: Function, thisObj: any, once: boolean): boolean;
        willTrigger(type: string): boolean;
        dispatch(event: Dou.Event): boolean;
        protected getPropagationList(target: DisplayObject): DisplayObject[];
        protected dispatchPropagationEvent(event: Event2D, list: DisplayObject[]): void;
        off(type: string, listener: Function, thisObj?: any): void;
    }
}
declare namespace Dou {
    /**
     * 显示对象容器
     * @author wizardc
     */
    class DisplayObjectContainer extends DisplayObject {
        protected _touchChildren: boolean;
        constructor();
        /**
         * 子项数量
         */
        get numChildren(): number;
        /**
         * 确定对象的子级是否支持触摸事件
         */
        set touchChildren(value: boolean);
        get touchChildren(): boolean;
        $setTouchChildren(value: boolean): boolean;
        $getTouchChildren(): boolean;
        $onAddToStage(stage: Stage, nestLevel: number): void;
        $onRemoveFromStage(): void;
        /**
         * 添加一个显示对象
         */
        addChild(child: DisplayObject): DisplayObject;
        /**
         * 添加一个显示对象到指定的索引
         */
        addChildAt(child: DisplayObject, index: number): DisplayObject;
        $doAddChild(child: DisplayObject, index: number, notifyListeners?: boolean): DisplayObject;
        /**
         * 一个子项被添加到容器内
         */
        $childAdded(child: DisplayObject, index: number): void;
        /**
         * 返回指定显示对象是否被包含
         * * 搜索包括整个显示列表, 孙项, 曾孙项等
         */
        contains(child: DisplayObject): boolean;
        /**
         * 返回位于指定索引处的子显示对象实例
         */
        getChildAt(index: number): DisplayObject;
        /**
         * 返回子显示对象实例的索引位置
         */
        getChildIndex(child: DisplayObject): number;
        /**
         * 返回具有指定名称的子显示对象
         * 如果多个子显示对象具有指定名称, 则该方法会返回子级列表中的第一个对象
         */
        getChildByName(name: string): DisplayObject;
        /**
         * 更改现有子项在显示对象容器中的位置
         */
        setChildIndex(child: DisplayObject, index: number): void;
        private doSetChildIndex;
        /**
         * 在子级列表中两个指定的索引位置
         */
        swapChildrenAt(index1: number, index2: number): void;
        /**
         * 交换两个指定子对象的 Z 轴顺序
         */
        swapChildren(child1: DisplayObject, child2: DisplayObject): void;
        private doSwapChildrenAt;
        /**
         * 移除指定的子显示对象
         */
        removeChild(child: DisplayObject): DisplayObject;
        /**
         * 移除指定索引的子显示对象
         */
        removeChildAt(index: number): DisplayObject;
        $doRemoveChild(index: number, notifyListeners?: boolean): DisplayObject;
        /**
         * 移除所有的子项
         */
        removeChildren(): void;
        /**
         * 一个子项从容器内移除
         */
        $childRemoved(child: DisplayObject, index: number): void;
        $measureChildBounds(bounds: Rectangle): void;
        $hitTest(stageX: number, stageY: number): DisplayObject;
        sortChildren(): void;
        private _sortChildrenFunc;
    }
}
declare namespace Dou {
    /**
     * 矢量图形类
     * @author wizardc
     */
    class Shape extends DisplayObject {
        private _graphics;
        constructor();
        /**
         * 矢量绘制对象
         */
        get graphics(): Graphics;
        $onRemoveFromStage(): void;
        $measureContentBounds(bounds: Rectangle): void;
    }
}
declare namespace Dou {
    /**
     * 精灵类
     * @author wizardc
     */
    class Sprite extends DisplayObjectContainer {
        private _graphics;
        constructor();
        /**
         * 矢量绘制对象
         */
        get graphics(): Graphics;
        $onRemoveFromStage(): void;
        $measureContentBounds(bounds: Rectangle): void;
    }
}
declare namespace Dou {
    /**
     * 舞台
     * @author wizardc
     */
    class Stage extends DisplayObjectContainer {
        private _stageWidth;
        private _stageHeight;
        private _engine;
        private _scaleMode;
        private _orientation;
        private _maxTouches;
        constructor(engine: Engine);
        /**
         * 舞台的帧速率
         */
        set frameRate(value: number);
        get frameRate(): number;
        /**
         * 舞台的当前宽度
         */
        get stageWidth(): number;
        /**
         * 舞台的当前高度
         */
        get stageHeight(): number;
        /**
         * 舞台缩放模式
         */
        set scaleMode(value: StageScaleMode);
        get scaleMode(): StageScaleMode;
        /**
         * 屏幕横竖屏显示方式
         */
        set orientation(value: OrientationMode);
        get orientation(): OrientationMode;
        /**
         * 绘制纹理的缩放比率
         */
        set textureScaleFactor(value: number);
        get textureScaleFactor(): number;
        /**
         * 屏幕可以同时触摸的数量
         */
        set maxTouches(value: number);
        get maxTouches(): number;
        $setStageSize(width: number, height: number): void;
        /**
         * 设置分辨率尺寸
         */
        setContentSize(width: number, height: number): void;
        /**
         * 调用该方法后, 在显示列表下次呈现时, 会向每个已注册侦听 Event.RENDER 事件的显示对象发送一个 Event.RENDER 事件
         */
        invalidate(): void;
    }
}
declare namespace Dou {
    /**
     * 位图数据
     * @author wizardc
     */
    class BitmapData {
        private static _map;
        static create(type: "arraybuffer", data: ArrayBuffer, callback?: (bitmapData: BitmapData) => void): BitmapData;
        static create(type: "base64", data: string, callback?: (bitmapData: BitmapData) => void): BitmapData;
        static addDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void;
        static removeDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void;
        static invalidate(bitmapData: BitmapData): void;
        static dispose(bitmapData: BitmapData): void;
        /**
         * 宽度
         */
        width: number;
        /**
         * 高度
         */
        height: number;
        /**
         * 原始图像
         */
        source: any;
        /**
         * 对应的贴图
         */
        webGLTexture: any;
        /**
         * webgl纹理生成后，是否删掉原始图像数据
         */
        deleteSource: boolean;
        constructor(source: any);
        dispose(): void;
    }
}
declare namespace Dou {
    /**
     * 位图显示对象
     * @author wizardc
     */
    class Bitmap extends DisplayObject {
        /**
         * 在缩放时是否进行平滑处理的默认值
         */
        static defaultSmoothing: boolean;
        $bitmapData: BitmapData;
        protected _texture: Texture;
        protected _bitmapX: number;
        protected _bitmapY: number;
        protected _bitmapWidth: number;
        protected _bitmapHeight: number;
        protected _offsetX: number;
        protected _offsetY: number;
        protected _textureWidth: number;
        protected _textureHeight: number;
        protected _sourceWidth: number;
        protected _sourceHeight: number;
        protected _explicitBitmapWidth: number;
        protected _explicitBitmapHeight: number;
        protected _scale9Grid: Rectangle;
        protected _fillMode: BitmapFillMode;
        protected _smoothing: boolean;
        protected _pixelHitTest: boolean;
        constructor(value?: Texture);
        /**
         * 纹理
         */
        set texture(value: Texture);
        get texture(): Texture;
        $setTexture(value: Texture): boolean;
        $getTexture(): Texture;
        /**
         * 九宫格
         */
        set scale9Grid(value: Rectangle);
        get scale9Grid(): Rectangle;
        $setScale9Grid(value: Rectangle): void;
        $getScale9Grid(): Rectangle;
        /**
         * 位图填充方式
         */
        set fillMode(value: BitmapFillMode);
        get fillMode(): BitmapFillMode;
        $setFillMode(value: BitmapFillMode): boolean;
        $getFillMode(): BitmapFillMode;
        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        set smoothing(value: boolean);
        get smoothing(): boolean;
        $setSmoothing(value: boolean): void;
        $getSmoothing(): boolean;
        /**
         * 是否开启精确像素碰撞
         * * 设置为true显示对象本身的透明区域将能够被穿透
         * * 注意: 若图片资源是以跨域方式从外部服务器加载的, 将无法访问图片的像素数据, 而导致此属性失效
         */
        set pixelHitTest(value: boolean);
        get pixelHitTest(): boolean;
        $onAddToStage(stage: Stage, nestLevel: number): void;
        $onRemoveFromStage(): void;
        $setWidth(value: number): boolean;
        $getWidth(): number;
        $setHeight(value: number): boolean;
        $getHeight(): number;
        $measureContentBounds(bounds: Rectangle): void;
        $updateRenderNode(): void;
        $hitTest(stageX: number, stageY: number): DisplayObject;
        $refreshImageData(): void;
        private setImageData;
    }
}
declare namespace Dou {
    /**
     * 绘制矢量形状类
     * @author wizardc
     */
    class Graphics {
        private _renderNode;
        private _targetDisplay;
        /**
         * 当前移动到的坐标 x
         */
        private _lastX;
        /**
         * 当前移动到的坐标 y
         */
        private _lastY;
        /**
         * 当前正在绘制的填充
         */
        private _fillPath;
        /**
         * 当前正在绘制的线条
         */
        private _strokePath;
        /**
         * 线条的左上方宽度
         */
        private _topLeftStrokeWidth;
        /**
         * 线条的右下方宽度
         */
        private _bottomRightStrokeWidth;
        /**
         * 是否已经包含上一次 moveTo 的坐标点
         */
        private _includeLastPosition;
        private _minX;
        private _minY;
        private _maxX;
        private _maxY;
        constructor();
        /**
         * 设置绑定到的目标显示对象
         */
        $setTarget(target: DisplayObject): void;
        /**
         * 对 1 像素和 3 像素特殊处理, 向右下角偏移 0.5 像素, 以显示清晰锐利的线条
         */
        private setStrokeWidth;
        /**
         * 设定单一颜色填充, 调用 clear 方法会清除填充
         */
        beginFill(color: number, alpha?: number): void;
        /**
         * 设定渐变填充, 调用 clear 方法会清除填充
         * @param type 渐变类型
         * @param colors 渐变中使用的颜色值的数组, 对于每种颜色请在 alphas 和 ratios 参数中指定对应值
         * @param alphas colors 数组中对应颜色的 alpha 值
         * @param ratios 颜色分布比率的数组, 有效值为 0 到 255
         * @param matrix 转换矩阵, Matrix 类包括 createGradientBox 方法, 通过该方法可以方便地设置矩阵, 以便与 beginGradientFill 方法一起使用
         */
        beginGradientFill(type: GradientType, colors: number[], alphas: number[], ratios: number[], matrix?: Matrix): void;
        /**
         * 对从上一次调用 beginFill 方法之后添加的直线和曲线应用填充
         */
        endFill(): void;
        /**
         * 指定线条样式
         * @param thickness 以点为单位表示线条的粗细, 有效值为 0 到 255, 如果未指定数字, 或者未定义该参数, 则不绘制线条
         * @param color 线条的颜色值, 默认值为黑色
         * @param alpha 线条透明度
         * @param caps 用于指定线条末端处端点类型的 CapsStyle 类的值默认值：CapsStyle.ROUND
         * @param joints 指定用于拐角的连接外观的类型默认值：JointStyle.ROUND
         * @param miterLimit 用于表示剪切斜接的极限值的数字
         * @param lineDash 设置虚线样式
         */
        lineStyle(thickness?: number, color?: number, alpha?: number, caps?: CapsStyle, joints?: JointStyle, miterLimit?: number, lineDash?: number[]): void;
        /**
         * 绘制一个矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param width 矩形的宽度
         * @param height 矩形的高度
         */
        drawRect(x: number, y: number, width: number, height: number): void;
        /**
         * 绘制一个圆角矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param width 矩形的宽度
         * @param height 矩形的高度
         * @param ellipseWidth 用于绘制圆角的椭圆的宽度
         * @param ellipseHeight 用于绘制圆角的椭圆的高度, 如果未指定值则默认值与为 ellipseWidth 参数提供的值相匹配
         */
        drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight?: number): void;
        /**
         * 绘制一个圆
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param radius 圆的半径
         */
        drawCircle(x: number, y: number, radius: number): void;
        /**
         * 绘制一个椭圆
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         * @param width 矩形的宽度
         * @param height 矩形的高度
         */
        drawEllipse(x: number, y: number, width: number, height: number): void;
        /**
         * 将当前绘图位置移动到 x, y
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         */
        moveTo(x: number, y: number): void;
        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 x, y 结束的直线, 当前绘图位置随后会设置为 x, y
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         */
        lineTo(x: number, y: number): void;
        /**
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线,
         * 当前绘图位置随后设置为 (anchorX, anchorY), 如果在调用 moveTo() 方法之前调用了 curveTo() 方法, 则当前绘图位置的默认值为 (0, 0),
         * 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变,
         * 绘制的曲线是二次贝塞尔曲线, 二次贝塞尔曲线包含两个锚点和一个控制点, 该曲线内插这两个锚点, 并向控制点弯曲
         * @param controlX 一个数字, 指定控制点相对于父显示对象注册点的水平位置
         * @param controlY 一个数字, 指定控制点相对于父显示对象注册点的垂直位置
         * @param anchorX 一个数字, 指定下一个锚点相对于父显示对象注册点的水平位置
         * @param anchorY 一个数字, 指定下一个锚点相对于父显示对象注册点的垂直位置
         */
        curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        /**
         * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线, 三次贝塞尔曲线由两个锚点和两个控制点组成, 该曲线内插这两个锚点并向两个控制点弯曲
         * @param controlX1 指定首个控制点相对于父显示对象的注册点的水平位置
         * @param controlY1 指定首个控制点相对于父显示对象的注册点的垂直位置
         * @param controlX2 指定第二个控制点相对于父显示对象的注册点的水平位置
         * @param controlY2 指定第二个控制点相对于父显示对象的注册点的垂直位置
         * @param anchorX 指定锚点相对于父显示对象的注册点的水平位置
         * @param anchorY 指定锚点相对于父显示对象的注册点的垂直位置
         */
        cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
        /**
         * 绘制一段圆弧路径
         * @param x 圆心的 x 轴坐标
         * @param y 圆心的 y 轴坐标
         * @param radius 圆弧的半径
         * @param startAngle 圆弧的起始点,  x轴方向开始计算, 单位以弧度表示
         * @param endAngle 圆弧的终点,  单位以弧度表示
         * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制
         */
        drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
        /**
         * 测量圆弧的矩形大小
         */
        private arcBounds;
        private dirty;
        private extendBoundsByPoint;
        private extendBoundsByX;
        private extendBoundsByY;
        private updateNodeBounds;
        /**
         * 更新当前的lineX和lineY值, 并标记尺寸失效
         */
        private updatePosition;
        /**
         * 根据传入的锚点组返回贝塞尔曲线上的一组点
         */
        private createBezierPoints;
        /**
         * 根据锚点组与取值系数获取贝塞尔曲线上的一点
         */
        private getBezierPointByFactor;
        /**
         * 通过factor参数获取二次贝塞尔曲线上的位置
         * 公式为 B(t) = (1-t)^2 * P0 + 2t(1-t) * P1 + t^2 * P2
         * @param factor 从 0 到 1 的闭区间
         */
        private getCurvePoint;
        /**
         * 通过 factor 参数获取三次贝塞尔曲线上的位置
         * * 公式为 B(t) = (1-t)^3 * P0 + 3t(1-t)^2 * P1 + 3t^2 * (1-t) t^2 * P2 + t^3 *P3
         * @param factor 从 0 到 1 的闭区间
         */
        private getCubicCurvePoint;
        $onRemoveFromStage(): void;
        $measureContentBounds(bounds: Rectangle): void;
        /**
         * 清除绘制到此 Graphics 对象的图形, 并重置填充和线条样式设置
         */
        clear(): void;
    }
}
declare namespace Dou {
    /**
     * 纹理类是对不同平台不同的图片资源的封装
     * @author wizardc
     */
    class Texture {
        /**
         * 销毁纹理时是否销毁对应 BitmapData
         */
        disposeBitmapData: boolean;
        /**
         * 表示这个纹理在 BitmapData 上的 x 起始位置
         */
        bitmapX: number;
        /**
         * 表示这个纹理在 BitmapData 上的 y 起始位置
         */
        bitmapY: number;
        /**
         * 表示这个纹理在 BitmapData 上的宽度
         */
        bitmapWidth: number;
        /**
         * 表示这个纹理在 BitmapData 上的高度
         */
        bitmapHeight: number;
        /**
         * 表示这个纹理显示了之后在 x 方向的渲染偏移量
         */
        offsetX: number;
        /**
         * 表示这个纹理显示了之后在 y 方向的渲染偏移量
         */
        offsetY: number;
        /**
         * 位图宽度
         */
        sourceWidth: number;
        /**
         * 位图高度
         */
        sourceHeight: number;
        /**
         * 是否旋转
         */
        rotated: boolean;
        private _bitmapData;
        private _textureWidth;
        private _textureHeight;
        /**
         * 纹理宽度，只读属性，不可以设置
         */
        get textureWidth(): number;
        $getTextureWidth(): number;
        $getScaleBitmapWidth(): number;
        /**
         * 纹理高度，只读属性，不可以设置
         */
        get textureHeight(): number;
        $getTextureHeight(): number;
        $getScaleBitmapHeight(): number;
        set bitmapData(value: BitmapData);
        get bitmapData(): BitmapData;
        $setBitmapData(value: BitmapData): void;
        $getBitmapData(): BitmapData;
        $initData(bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, sourceWidth: number, sourceHeight: number, rotated?: boolean): void;
        dispose(): void;
    }
}
declare namespace Dou {
    /**
     * 图集对象
     * @author wizardc
     */
    class SpriteSheet {
        /**
         * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 x
         */
        protected _bitmapX: number;
        /**
         * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 y
         */
        protected _bitmapY: number;
        /**
         * 共享的位图数据
         */
        protected _texture: Texture;
        /**
         * 纹理缓存字典
         */
        protected _textureMap: {
            [key: string]: Texture;
        };
        constructor(texture: Texture);
        /**
         * 共享的位图数据
         */
        get texture(): Texture;
        /**
         * 根据指定纹理名称获取一个缓存的纹理对象
         */
        getTexture(name: string): Texture;
        /**
         * 为 SpriteSheet 上的指定区域创建一个新的 Texture 对象并缓存它
         * @param name 名称
         * @param bitmapX 纹理区域在 bitmapData 上的起始坐标 x
         * @param bitmapY 纹理区域在 bitmapData 上的起始坐标 y
         * @param bitmapWidth 纹理区域在 bitmapData 上的宽度
         * @param bitmapHeight 纹理区域在 bitmapData 上的高度
         * @param offsetX 原始位图的非透明区域 x 起始点
         * @param offsetY 原始位图的非透明区域 y 起始点
         * @param textureWidth 原始位图的高度, 若不传入, 则使用 bitmapWidth 的值
         * @param textureHeight 原始位图的宽度, 若不传入, 则使用 bitmapHeight 的值
         * @returns 创建的纹理对象
         */
        createTexture(name: string, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX?: number, offsetY?: number, textureWidth?: number, textureHeight?: number): Texture;
        /**
         * 释放纹理
         */
        dispose(): void;
    }
}
declare namespace Dou {
    /**
     * 动态纹理对象
     * * 可将显示对象及其子对象绘制成为一个纹理
     * @author wizardc
     */
    class RenderTexture extends Texture {
        $renderBuffer: rendering.RenderBuffer;
        constructor();
        /**
         * 将指定显示对象绘制为一个纹理
         * @param displayObject 需要绘制的显示对象
         * @param clipBounds 绘制矩形区域
         * @param scale 缩放比例
         */
        drawToTexture(displayObject: DisplayObject, clipBounds?: Rectangle, scale?: number): boolean;
        getPixel32(x: number, y: number): number[];
        dispose(): void;
    }
}
declare namespace Dou {
    /**
     * 拖拽管理器类
     * @author wizardc
     */
    class DragManager {
        private static _instance;
        static get instance(): DragManager;
        private _dragging;
        private _dropTarget;
        private _dragTarget;
        private _originDrag;
        private _dragData;
        private _offsetX;
        private _offsetY;
        private constructor();
        get dragging(): boolean;
        get originDrag(): DisplayObject;
        $dropRegister(target: DisplayObject, canDrop: boolean): void;
        private stageMoveHandler;
        private onMove;
        private onEnd;
        doDrag(dragTarget: DisplayObject, touchEvent: TouchEvent, dragData?: any, dragImage?: DisplayObject, xOffset?: number, yOffset?: number, imageAlpha?: number): DisplayObject;
        private onStageMove;
        private onStageEnd;
        private endDrag;
    }
}
declare namespace Dou.rendering {
    /**
     * 绘制命令类型
     * @author wizardc
     */
    const enum DrawableType {
        texture = 0,
        rect = 1,
        pushMask = 2,
        popMask = 3,
        blend = 4,
        resizeTarget = 5,
        clearColor = 6,
        actBuffer = 7,
        enableScissor = 8,
        disableScissor = 9,
        smoothing = 10
    }
}
declare namespace Dou.rendering {
    /**
     * 渲染模式
     * @author wizardc
     */
    const enum RenderMode {
        none = 1,
        filter = 2,
        clip = 3,
        scrollRect = 4
    }
}
declare namespace Dou.rendering {
    /**
     * 渲染节点类型
     * @author wizardc
     */
    const enum RenderNodeType {
        normalBitmapNode = 1,
        bitmapNode = 2,
        textNode = 3,
        graphicsNode = 4,
        groupNode = 5
    }
}
declare namespace Dou {
    /**
     * 图像填充模式
     * @author wizardc
     */
    const enum BitmapFillMode {
        /**
         * 重复位图以填充区域
         */
        repeat = "repeat",
        /**
         * 位图填充拉伸以填充区域
         */
        scale = "scale",
        /**
         * 在区域的边缘处截断不显示位图
         */
        clip = "clip"
    }
}
declare namespace Dou.rendering {
    /**
     * 路径类型
     * @author wizardc
     */
    const enum PathType {
        /**
         * 纯色填充路径
         */
        fill = 1,
        /**
         * 渐变填充路径
         */
        gradientFill = 2,
        /**
         * 线条路径
         */
        stroke = 3
    }
}
declare namespace Dou.rendering {
    /**
     * 2D路径命令
     * @author wizardc
     */
    const enum PathCommand {
        moveTo = 1,
        lineTo = 2,
        curveTo = 3,
        cubicCurveTo = 4
    }
}
declare namespace Dou {
    /**
     * 绘制线条中使用的端点样式
     * @author wizardc
     */
    const enum CapsStyle {
        none = "none",
        round = "round",
        square = "square"
    }
}
declare namespace Dou {
    /**
     * 连接点样式
     * @author wizardc
     */
    const enum JointStyle {
        /**
         * 斜面
         */
        bevel = "bevel",
        /**
         * 斜接
         */
        miter = "miter",
        /**
         * 圆滑
         */
        round = "round"
    }
}
declare namespace Dou {
    /**
     * 舞台旋转模式
     * @author wizardc
     */
    const enum OrientationMode {
        /**
         * 适配屏幕
         */
        auto = "auto",
        /**
         * 默认竖屏
         */
        portrait = "portrait",
        /**
         * 默认横屏, 舞台顺时针旋转90度
         */
        landscape = "landscape",
        /**
         * 默认横屏, 舞台逆时针旋转90度
         */
        landscapeFlipped = "landscapeFlipped"
    }
}
declare namespace Dou {
    /**
     * 颜色填充类型
     * @author wizardc
     */
    const enum GradientType {
        /**
         * 用于指定线性渐变填充的值
         */
        linear = "linear",
        /**
         * 用于指定放射状渐变填充的值
         */
        radial = "radial"
    }
}
declare namespace Dou {
    /**
     * 混合模式类型
     * @author wizardc
     */
    const enum BlendMode {
        /**
         * 该显示对象出现在背景前面
         */
        normal = "normal",
        /**
         * 将显示对象的原色值添加到它的背景颜色中，上限值为 0xFF
         */
        add = "add",
        /**
         * 根据显示对象的 Alpha 值擦除背景。Alpha 值不为0的区域将被擦除。
         */
        erase = "erase"
    }
}
declare namespace Dou {
    /**
     * 舞台缩放模式
     * @author wizardc
     */
    const enum StageScaleMode {
        /**
         * 不缩放应用程序内容
         * 即使在更改播放器视口大小时, 它仍然保持不变, 如果播放器视口比内容小, 则可能进行一些裁切
         */
        noScale = "noScale",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容的较宽方向填满播放器视口, 另一个方向的两侧可能会不够宽而留有黑边
         */
        showAll = "showAll",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容的较窄方向填满播放器视口, 另一个方向的两侧可能会超出播放器视口而被裁切
         */
        noBorder = "noBorder",
        /**
         * 不保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容正好填满播放器视口
         */
        exactFit = "exactFit",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容在水平和垂直方向都填满播放器视口, 但只保持应用程序内容的原始宽度不变, 高度可能会改变
         */
        fixedWidth = "fixedWidth",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容在水平和垂直方向都填满播放器视口, 但只保持应用程序内容的原始高度不变, 宽度可能会改变
         */
        fixedHeight = "fixedHeight",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容在水平和垂直方向都填满播放器视口, 应用程序内容的较窄方向可能会不够宽而填充
         */
        fixedNarrow = "fixedNarrow",
        /**
         * 保持原始宽高比缩放应用程序内容
         * 缩放后应用程序内容在水平和垂直方向都填满播放器视口, 应用程序内容的较宽方向的两侧可能会超出播放器视口而被裁切
         */
        fixedWide = "fixedWide"
    }
}
declare namespace Dou {
    /**
     * 水平对齐
     * @author wizardc
     */
    const enum HorizontalAlign {
        /**
         * 左
         */
        left = 0,
        /**
         * 居中
         */
        center = 1,
        /**
         * 右
         */
        right = 2
    }
}
declare namespace Dou {
    /**
     * 垂直对齐
     * @author wizardc
     */
    const enum VerticalAlign {
        /**
         * 上
         */
        top = 0,
        /**
         * 居中
         */
        middle = 1,
        /**
         * 下
         */
        bottom = 2
    }
}
declare namespace Dou.sys {
    /**
     * 文本属性
     * @author wizardc
     */
    const enum TextKeys {
        fontSize = 0,
        lineSpacing = 1,
        textColor = 2,
        textFieldWidth = 3,
        textFieldHeight = 4,
        textWidth = 5,
        textHeight = 6,
        textDrawWidth = 7,
        fontFamily = 8,
        textAlign = 9,
        verticalAlign = 10,
        textColorString = 11,
        fontString = 12,
        text = 13,
        measuredWidths = 14,
        bold = 15,
        italic = 16,
        fontStringChanged = 17,
        textLinesChanged = 18,
        wordWrap = 19,
        displayAsPassword = 20,
        maxChars = 21,
        selectionActivePosition = 22,
        selectionAnchorPosition = 23,
        type = 24,
        strokeColor = 25,
        strokeColorString = 26,
        stroke = 27,
        scrollV = 28,
        numLines = 29,
        multiline = 30,
        border = 31,
        borderColor = 32,
        background = 33,
        backgroundColor = 34,
        restrictAnd = 35,
        restrictNot = 36,
        inputType = 37
    }
}
declare namespace Dou {
    /**
     * 文本类型
     * @author wizardc
     */
    const enum TextFieldType {
        /**
         * 动态
         */
        dynamic = 0,
        /**
         * 输入
         */
        input = 1
    }
}
declare namespace Dou {
    /**
     * 文本输入类型
     * @author wizardc
     */
    const enum TextFieldInputType {
        /**
         * 文本
         */
        text = 0,
        /**
         * 密码
         */
        password = 1
    }
}
declare module Dou {
    interface EventDispatcher {
        /**
         * 抛出 2D 事件
         */
        dispatchEvent2D(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}
declare namespace Dou {
    /**
     * 2D 事件
     * @author wizardc
     */
    class Event2D extends Dou.Event {
        static ADDED_TO_STAGE: string;
        static REMOVED_FROM_STAGE: string;
        static ADDED: string;
        static REMOVED: string;
        static ENTER_FRAME: string;
        static FIXED_ENTER_FRAME: string;
        static SHOWED: string;
        static HIDDEN: string;
        static RENDER: string;
        static RESIZE: string;
        static FOCUS_IN: string;
        static FOCUS_OUT: string;
        static UPDATE_TEXT: string;
        static LINK: string;
        private _bubbles;
        private _currentTarget;
        private _isPropagationStopped;
        get bubbles(): boolean;
        get currentTarget(): Dou.IEventDispatcher;
        $initEvent2D(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): void;
        $setCurrentTarget(currentTarget: Dou.IEventDispatcher): void;
        stopPropagation(): void;
        $isPropagationStopped(): boolean;
        onRecycle(): void;
    }
}
declare module Dou {
    interface EventDispatcher {
        /**
         * 抛出触摸事件
         */
        dispatchTouchEvent(type: string, stageX: number, stageY: number, touchPointID?: number, touchDown?: boolean, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}
declare namespace Dou {
    /**
     * 触摸事件
     * @author wizardc
     */
    class TouchEvent extends Event2D {
        static TOUCH_BEGIN: string;
        static TOUCH_MOVE: string;
        static TOUCH_END: string;
        static TOUCH_CANCEL: string;
        static TOUCH_TAP: string;
        static TOUCH_RELEASE_OUTSIDE: string;
        private _touchPointID;
        private _touchDown;
        private _stageX;
        private _stageY;
        private _localChanged;
        private _localX;
        private _localY;
        get touchPointID(): number;
        get touchDown(): boolean;
        get stageX(): number;
        get stageY(): number;
        get localX(): number;
        get localY(): number;
        $initTouchEvent(type: string, stageX: number, stageY: number, touchPointID?: number, touchDown?: boolean, bubbles?: boolean, cancelable?: boolean): void;
        $setTarget(target: Dou.IEventDispatcher): void;
        private getLocalPosition;
        onRecycle(): void;
    }
}
declare module Dou {
    interface EventDispatcher {
        /**
         * 抛出拖拽事件
         */
        dispatchDragEvent(type: string, dragData?: any, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}
declare namespace Dou {
    /**
     * 拖拽事件
     * @author wizardc
     */
    class DragEvent extends Event2D {
        /**
         * 拖拽对象进入接受安放的拖拽区域时, 由接受对象播放
         */
        static DRAG_ENTER: string;
        /**
         * 拖拽对象在接受安放的拖拽区域中移动时, 由接受对象播放
         */
        static DRAG_MOVE: string;
        /**
         * 拖拽对象在离开接受安放的拖拽区域时, 由接受对象播放
         */
        static DRAG_EXIT: string;
        /**
         * 拖拽对象在接受安放的拖拽区域放下时, 由接受对象播放
         */
        static DRAG_DROP: string;
        /**
         * 拖拽对象开始拖拽时, 由拖拽对象播放
         */
        static DRAG_START: string;
        /**
         * 拖拽对象在无效的区域放下时, 由拖拽对象播放
         */
        static DRAG_OVER: string;
        private _dragData;
        get dragData(): any;
        $initDragEvent(type: string, dragData?: any, bubbles?: boolean, cancelable?: boolean): void;
        onRecycle(): void;
    }
}
declare namespace Dou {
    /**
     * 滤镜基类
     * @author wizardc
     */
    abstract class Filter {
        private _type;
        protected _paddingTop: number;
        protected _paddingBottom: number;
        protected _paddingLeft: number;
        protected _paddingRight: number;
        /**
         * 会传递到片段着色器中的数据集合
         */
        $uniforms: any;
        constructor(type: string);
        get type(): string;
        onPropertyChange(): void;
        protected updatePadding(): void;
    }
}
declare namespace Dou {
    /**
     * 颜色刷子着色器
     * * 将显示对象刷成一种单一颜色
     * @author wizardc
     */
    class ColorBrushFilter extends Filter {
        constructor(r?: number, g?: number, b?: number, a?: number);
        set r(value: number);
        get r(): number;
        set g(value: number);
        get g(): number;
        set b(value: number);
        get b(): number;
        set a(value: number);
        get a(): number;
    }
}
declare namespace Dou {
    /**
     * 颜色转换滤镜
     * * 允许饱和度更改, 色相旋转, 亮度调整等
     * @author wizardc
     */
    class ColorMatrixFilter extends Filter {
        protected _matrix: number[];
        /**
         * @param matrix 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        constructor(matrix?: number[]);
        /**
         * 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        set matrix(value: number[]);
        get matrix(): number[];
        private setMatrix;
    }
}
declare namespace Dou {
    /**
     * 模糊滤镜
     * @author wizardc
     */
    class BlurFilter extends Filter {
        $blurXFilter: filter.BlurXFilter;
        $blurYFilter: filter.BlurYFilter;
        protected _blurX: number;
        protected _blurY: number;
        /**
         * @param blurX 水平模糊量
         * @param blurY 垂直模糊量
         */
        constructor(blurX?: number, blurY?: number);
        /**
         * 水平模糊量
         */
        set blurX(value: number);
        get blurX(): number;
        /**
         * 垂直模糊量
         */
        set blurY(value: number);
        get blurY(): number;
        protected updatePadding(): void;
    }
    namespace filter {
        /**
         * @private
         */
        class BlurXFilter extends Filter {
            constructor(blurX?: number);
            set blurX(value: number);
            get blurX(): number;
        }
        /**
         * @private
         */
        class BlurYFilter extends Filter {
            constructor(blurY?: number);
            set blurY(value: number);
            get blurY(): number;
        }
    }
}
declare namespace Dou {
    /**
     * 自定义滤镜
     * @author wizardc
     */
    class CustomFilter extends Filter {
        $vertexSrc: string;
        $fragmentSrc: string;
        $shaderKey: string;
        protected _padding: number;
        /**
         * @param vertexSrc 自定义的顶点着色器程序
         * @param fragmentSrc 自定义的片段着色器程序
         * @param uniforms 着色器中 uniform 的初始值 (key -> value), 目前仅支持数字和数组
         */
        constructor(vertexSrc: string, fragmentSrc: string, uniforms?: any);
        /**
         * 滤镜的内边距
         * 如果自定义滤镜所需区域比原区域大 (描边等), 需要手动设置
         */
        set padding(value: number);
        get padding(): number;
        /**
         * 着色器中 uniform 的值
         */
        get uniforms(): any;
        onPropertyChange(): void;
    }
}
declare namespace Dou {
    /**
     * 发光滤镜
     * @author wizardc
     */
    class GlowFilter extends Filter {
        protected _color: number;
        protected _red: number;
        protected _green: number;
        protected _blue: number;
        protected _alpha: number;
        protected _blurX: number;
        protected _blurY: number;
        protected _strength: number;
        protected _inner: boolean;
        protected _knockout: boolean;
        /**
         * @param color 光晕颜色
         * @param alpha 透明度
         * @param blurX 水平模糊, 有效值为 0 到 255
         * @param blurY 垂直模糊, 有效值为 0 到 255
         * @param strength 强度, 有效值为 0 到 255
         * @param inner 是否为内发光
         * @param knockout 是否具有挖空效果
         */
        constructor(color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, inner?: boolean, knockout?: boolean);
        /**
         * 光晕颜色
         */
        set color(value: number);
        get color(): number;
        /**
         * 透明度
         */
        set alpha(value: number);
        get alpha(): number;
        /**
         * 水平模糊, 有效值为 0 到 255
         */
        set blurX(value: number);
        get blurX(): number;
        /**
         * 垂直模糊, 有效值为 0 到 255
         */
        set blurY(value: number);
        get blurY(): number;
        /**
         * 强度, 有效值为 0 到 255
         */
        set strength(value: number);
        get strength(): number;
        /**
         * 是否为内发光
         */
        set inner(value: boolean);
        get inner(): boolean;
        /**
         * 是否具有挖空效果
         */
        set knockout(value: boolean);
        get knockout(): boolean;
        protected updatePadding(): void;
    }
}
declare namespace Dou {
    /**
     * 投影滤镜
     * @author wizardc
     */
    class DropShadowFilter extends GlowFilter {
        protected _distance: number;
        protected _angle: number;
        protected _hideObject: boolean;
        /**
         * @param distance 阴影的偏移距离
         * @param angle 阴影的角度
         * @param color 光晕颜色
         * @param alpha 透明度
         * @param blurX 水平模糊, 有效值为 0 到 255
         * @param blurY 垂直模糊, 有效值为 0 到 255
         * @param strength 强度, 有效值为 0 到 255
         * @param inner 是否为内发光
         * @param knockout 是否具有挖空效果
         * @param hideObject 是否隐藏对象
         */
        constructor(distance?: number, angle?: number, color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, inner?: boolean, knockout?: boolean, hideObject?: boolean);
        /**
         * 阴影的偏移距离
         */
        set distance(value: number);
        get distance(): number;
        /**
         * 阴影的角度
         */
        set angle(value: number);
        get angle(): number;
        /**
         * 是否隐藏对象
         */
        set hideObject(value: boolean);
        get hideObject(): boolean;
        protected updatePadding(): void;
    }
}
declare namespace Dou {
    /**
     * 图片加载器
     * @author wizardc
     */
    class ImageAnalyzer implements Dou.IAnalyzer {
        load(url: string, callback: (url: string, data: any) => void, thisObj: any): void;
        private createTexture;
        release(data: Texture): boolean;
    }
}
declare namespace Dou {
    /**
     * 图集加载器
     * @author wizardc
     */
    class SheetAnalyzer implements Dou.IAnalyzer {
        load(url: string, callback: (url: string, data: any) => void, thisObj: any): void;
        private createSheet;
        release(data: SpriteSheet): boolean;
    }
}
declare namespace Dou {
    /**
     * 粒子系统基类
     * @author wizardc
     */
    abstract class ParticleSystem<T extends Particle> extends DisplayObject {
        /**
         * 表示粒子所使用的纹理
         */
        protected _texture: Texture;
        /**
         * 表示粒子出现间隔
         */
        protected _emissionRate: number;
        /**
         * 表示粒子系统最大粒子数, 超过该数量将不会继续创建粒子
         */
        protected _maxParticles: number;
        /**
         * 粒子类
         */
        protected _particleClass: {
            new (): T;
        };
        private _emissionTime;
        private _frameTime;
        private _particles;
        private _numParticles;
        private _emitterX;
        private _emitterY;
        private _particleMeasureRect;
        private _transformForMeasure;
        private _lastRect;
        private _bitmapNodeList;
        constructor(texture: Texture, emissionRate: number, maxParticles: number);
        /**
         * 表示粒子出现点 x 坐标
         */
        set emitterX(value: number);
        get emitterX(): number;
        /**
         * 表示粒子出现点 y 坐标
         */
        set emitterY(value: number);
        get emitterY(): number;
        /**
         * 更换粒子纹理
         */
        changeTexture(texture: Texture): void;
        /**
         * 开始创建粒子
         * @param duration 粒子出现总时间, -1 表示无限时间
         */
        start(duration?: number): void;
        private update;
        private addOneParticle;
        private getParticle;
        protected abstract initParticle(particle: T): void;
        abstract advanceParticle(particle: T, passedTime: number): void;
        private removeParticle;
        /**
         * 停止创建粒子
         * @param clear 是否清除掉现有粒子
         */
        stop(clear?: boolean): void;
        $measureContentBounds(bounds: Rectangle): void;
        private appendTransform;
        $updateRenderNode(): void;
        private clear;
    }
}
declare namespace Dou {
    /**
     * 粒子范围
     * @author wizardc
     */
    class ParticleRegion implements Dou.ICacheable {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        width: number;
        height: number;
        area: number;
        updateRegion(bounds: Rectangle, matrix: Matrix): void;
        clear(): void;
        onRecycle(): void;
    }
}
declare namespace Dou {
    /**
     * 粒子基类
     * @author wizardc
     */
    abstract class Particle implements Dou.ICacheable {
        /**
         * 表示粒子相对于父级本地坐标的 x 坐标
         */
        x: number;
        /**
         * 表示粒子相对于父级本地坐标的 y 坐标
         */
        y: number;
        /**
         * 表示从注册点开始应用的对象的缩放比例
         */
        scale: number;
        /**
         * 表示粒子距其原始方向的旋转程度, 以度为单位
         */
        rotation: number;
        /**
         * 表示粒子的 Alpha 透明度值
         */
        alpha: number;
        /**
         * 表示粒子当前存活时间
         */
        currentTime: number;
        /**
         * 表示粒子的存活总时间
         */
        totalTime: number;
        private _matrix;
        constructor();
        getMatrix(regX: number, regY: number): Matrix;
        clear(): void;
        onRecycle(): void;
    }
}
declare namespace Dou {
    /**
     * 重力粒子配置接口
     * @author wizardc
     */
    interface GravityParticleConfig {
        /**
         * 粒子发射坐标
         */
        emitter: {
            x: number;
            y: number;
        };
        /**
         * 粒子发射坐标偏移量
         */
        emitterVariance: {
            x: number;
            y: number;
        };
        /**
         * 粒子最大数量
         */
        maxParticles: number;
        /**
         * 粒子存活时间
         */
        lifespan: number;
        /**
         * 粒子存活时间差值
         */
        lifespanVariance: number;
        /**
         * 粒子出现时大小
         */
        startSize: number;
        /**
         * 粒子出现时大小差值
         */
        startSizeVariance: number;
        /**
         * 粒子消失时大小
         */
        endSize: number;
        /**
         * 粒子消失时大小差值
         */
        endSizeVariance: number;
        /**
         * 粒子出现时的角度
         */
        emitAngle: number;
        /**
         * 粒子出现时角度差值
         */
        emitAngleVariance: number;
        /**
         * 粒子出现时旋转值
         */
        startRotation: number;
        /**
         * 粒子出现时旋转值差值
         */
        startRotationVariance: number;
        /**
         * 粒子消失时旋转值
         */
        endRotation: number;
        /**
         * 粒子消失时旋转值差值
         */
        endRotationVariance: number;
        /**
         * 粒子出现时速度
         */
        speed: number;
        /**
         * 粒子出现时速度差值
         */
        speedVariance: number;
        /**
         * 粒子重力
         */
        gravity: {
            x: number;
            y: number;
        };
        /**
         * 粒子径向加速度
         */
        radialAcceleration: number;
        /**
         * 粒子径向加速度差值
         */
        radialAccelerationVariance: number;
        /**
         * 粒子切向加速度
         */
        tangentialAcceleration: number;
        /**
         * 粒子切向加速度差值
         */
        tangentialAccelerationVariance: number;
        /**
         * 粒子出现时透明度
         */
        startAlpha: number;
        /**
         * 粒子出现时的透明度差值
         */
        startAlphaVariance: number;
        /**
         * 粒子消失时透明度
         */
        endAlpha: number;
        /**
         * 粒子消失时的透明度差值
         */
        endAlphaVariance: number;
    }
}
declare namespace Dou {
    /**
     * 重力粒子系统
     * @author wizardc
     */
    class GravityParticleSystem extends ParticleSystem<GravityParticle> {
        /**
         * 表示粒子初始坐标 x 差值
         */
        private _emitterXVariance;
        /**
         * 表示粒子初始坐标 y 差值
         */
        private _emitterYVariance;
        /**
         * 表示粒子存活时间，单位毫秒
         */
        private _lifespan;
        /**
         * 表示粒子存活时间差值，单位毫秒
         */
        private _lifespanVariance;
        /**
         * 表示粒子出现时大小
         */
        private _startSize;
        /**
         * 表示粒子出现时大小差值
         */
        private _startSizeVariance;
        /**
         * 表示粒子消失时大小
         */
        private _endSize;
        /**
         * 表示粒子消失时大小差值
         */
        private _endSizeVariance;
        /**
         * 表示粒子出现时的角度
         */
        private _emitAngle;
        /**
         * 表示粒子出现时的角度差值
         */
        private _emitAngleVariance;
        /**
         * 表示粒子出现时旋转值
         */
        private _startRotation;
        /**
         * 表示粒子出现时旋转值差值
         */
        private _startRotationVariance;
        /**
         * 表示粒子消失时旋转值
         */
        private _endRotation;
        /**
         * 表示粒子消失时旋转值差值
         */
        private _endRotationVariance;
        /**
         * 表示粒子出现时速度
         */
        private _speed;
        /**
         * 表示粒子出现时速度差值
         */
        private _speedVariance;
        /**
         * 表示粒子水平重力
         */
        private _gravityX;
        /**
         * 表示粒子垂直重力
         */
        private _gravityY;
        /**
         * 表示粒子径向加速度
         */
        private _radialAcceleration;
        /**
         * 表示粒子径向加速度差值
         */
        private _radialAccelerationVariance;
        /**
         * 表示粒子切向加速度
         */
        private _tangentialAcceleration;
        /**
         * 表示粒子切向加速度差值
         */
        private _tangentialAccelerationVariance;
        /**
         * 表示粒子出现时的 Alpha 透明度值
         */
        private _startAlpha;
        /**
         * 表示粒子出现时的 Alpha 透明度差值
         */
        private _startAlphaVariance;
        /**
         * 表示粒子消失时的 Alpha 透明度值
         */
        private _endAlpha;
        /**
         * 表示粒子消失时的 Alpha 透明度差值
         */
        private _endAlphaVariance;
        constructor(texture: Texture, config: GravityParticleConfig);
        private parseConfig;
        protected initParticle(particle: GravityParticle): void;
        private getValue;
        advanceParticle(particle: GravityParticle, passedTime: number): void;
    }
}
declare namespace Dou {
    /**
     * 重力粒子
     * @author wizardc
     */
    class GravityParticle extends Particle {
        /**
         * 发射时的 x 坐标
         */
        startX: number;
        /**
         * 发射时的 y 坐标
         */
        startY: number;
        /**
         * x 轴速度
         */
        velocityX: number;
        /**
         * y 轴速度
         */
        velocityY: number;
        /**
         * 径向加速度
         */
        radialAcceleration: number;
        /**
         * 切向加速度
         */
        tangentialAcceleration: number;
        /**
         * 旋转增量
         */
        rotationDelta: number;
        /**
         * 缩放增量
         */
        scaleDelta: number;
        /**
         * 透明度增量
         */
        alphaDelta: number;
        clear(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 渲染节点基类
     * @author wizardc
     */
    abstract class RenderNode {
        /**
         * 节点类型
         */
        type: RenderNodeType;
        /**
         * 绘制数据
         */
        drawData: any[];
        /**
         * 绘制次数
         */
        protected _renderCount: number;
        constructor();
        get renderCount(): number;
        /**
         * 自动清空自身的绘制数据
         */
        cleanBeforeRender(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 普通位图渲染节点
     * @author wizardc
     */
    class NormalBitmapNode extends RenderNode {
        static updateTextureData(node: NormalBitmapNode, image: BitmapData, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, destW: number, destH: number, sourceWidth: number, sourceHeight: number, fillMode: string, smoothing: boolean): void;
        private static drawClipImage;
        /**
         * 要绘制的位图
         */
        image: BitmapData;
        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        smoothing: boolean;
        /**
         * 图片宽度
         */
        imageWidth: number;
        /**
         * 图片高度
         */
        imageHeight: number;
        /**
         * 翻转
         */
        rotated: boolean;
        sourceX: number;
        sourceY: number;
        sourceW: number;
        sourceH: number;
        drawX: number;
        drawY: number;
        drawW: number;
        drawH: number;
        constructor();
        /**
         * 绘制一次位图
         */
        drawImage(sourceX: number, sourceY: number, sourceW: number, sourceH: number, drawX: number, drawY: number, drawW: number, drawH: number): void;
        cleanBeforeRender(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 位图渲染节点
     * @author wizardc
     */
    class BitmapNode extends RenderNode {
        /**
         * 绘制九宫格位图
         */
        static updateTextureDataWithScale9Grid(node: BitmapNode, image: BitmapData, scale9Grid: Rectangle, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, destW: number, destH: number, sourceWidth: number, sourceHeight: number, smoothing: boolean): void;
        /**
         * 要绘制的位图
         */
        image: BitmapData;
        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        smoothing: boolean;
        /**
         * 相对偏移矩阵
         */
        matrix: Matrix;
        /**
         * 图片宽度
         */
        imageWidth: number;
        /**
         * 图片高度
         */
        imageHeight: number;
        /**
         * 使用的混合模式
         */
        blendMode: number;
        /**
         * 相对透明度
         */
        alpha: number;
        /**
         * 颜色变换滤镜
         */
        filter: ColorMatrixFilter;
        /**
         * 翻转
         */
        rotated: boolean;
        constructor();
        /**
         * 绘制一次位图
         */
        drawImage(sourceX: number, sourceY: number, sourceW: number, sourceH: number, drawX: number, drawY: number, drawW: number, drawH: number): void;
        cleanBeforeRender(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 文本渲染节点
     * @author wizardc
     */
    class TextNode extends RenderNode {
        /**
         * 绘制 x 偏移
         */
        x: number;
        /**
         * 绘制 y 偏移
         */
        y: number;
        /**
         * 绘制宽度
         */
        width: number;
        /**
         * 绘制高度
         */
        height: number;
        dirtyRender: boolean;
        texture: WebGLTexture;
        textureWidth: number;
        textureHeight: number;
        canvasScaleX: number;
        canvasScaleY: number;
        /**
         * 颜色值
         */
        textColor: number;
        /**
         * 描边颜色值
         */
        strokeColor: number;
        /**
         * 字号
         */
        size: number;
        /**
         * 描边大小
         */
        stroke: number;
        /**
         * 是否加粗
         */
        bold: boolean;
        /**
         * 是否倾斜
         */
        italic: boolean;
        /**
         * 字体名称
         */
        fontFamily: string;
        constructor();
        /**
         * 绘制一行文本
         */
        drawText(x: number, y: number, text: string, format: TextFormat): void;
        cleanBeforeRender(): void;
        /**
         * 清除非绘制的缓存数据
         */
        clean(): void;
    }
    /**
     * 文本格式
     */
    interface TextFormat {
        /**
         * 颜色值
         */
        textColor?: number;
        /**
         * 描边颜色值
         */
        strokeColor?: number;
        /**
         * 字号
         */
        size?: number;
        /**
         * 描边大小
         */
        stroke?: number;
        /**
         * 是否加粗
         */
        bold?: boolean;
        /**
         * 是否倾斜
         */
        italic?: boolean;
        /**
         * 字体名称
         */
        fontFamily?: string;
    }
}
declare namespace Dou.rendering {
    let CAPS_STYLES: string[];
    let JOINT_STYLES: string[];
    /**
     * 矢量渲染节点
     * @author wizardc
     */
    class GraphicsNode extends RenderNode {
        /**
         * 绘制 x 偏移
         */
        x: number;
        /**
         * 绘制 y 偏移
         */
        y: number;
        /**
         * 绘制宽度
         */
        width: number;
        /**
         * 绘制高度
         */
        height: number;
        /**
         * 脏渲染标记
         */
        dirtyRender: boolean;
        texture: WebGLTexture;
        textureWidth: number;
        textureHeight: number;
        canvasScaleX: number;
        canvasScaleY: number;
        constructor();
        /**
         * 指定一种简单的单一颜色填充
         * @param beforePath 插入在指定的路径命令之前绘制, 通常是插入到当前正在绘制的线条路径之前, 以确保线条总在填充的上方
         */
        beginFill(color: number, alpha?: number, beforePath?: Path2D): Path2D;
        /**
         * 指定渐变色颜色填充
         * @param beforePath 插入在指定的路径命令之前绘制, 通常是插入到当前正在绘制的线条路径之前, 以确保线条总在填充的上方
         */
        beginGradientFill(type: GradientType, colors: number[], alphas: number[], ratios: number[], matrix?: Matrix, beforePath?: Path2D): Path2D;
        /**
         * 指定一种线条样式
         */
        lineStyle(thickness?: number, color?: number, alpha?: number, caps?: string, joints?: string, miterLimit?: number, lineDash?: number[]): StrokePath;
        /**
         * 覆盖父类方法, 不自动清空缓存的绘图数据, 改为手动调用 clear 方法清空
         */
        cleanBeforeRender(): void;
        /**
         * 清空所有缓存的绘制数据
         */
        clear(): void;
        /**
         * 清除非绘制的缓存数据
         */
        clean(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 组渲染节点, 用于组合多个渲染节点
     * @author wizardc
     */
    class GroupNode extends RenderNode {
        /**
         * 相对偏移矩阵
         */
        matrix: Matrix;
        constructor();
        get renderCount(): number;
        addNode(node: RenderNode): void;
        cleanBeforeRender(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 2D路径
     * @author wizardc
     */
    abstract class Path2D {
        /**
         * 当前移动到的坐标 x
         * 注意: 目前只有 drawArc 之前会被赋值
         */
        lastX: number;
        /**
         * 当前移动到的坐标 y
         * 注意: 目前只有 drawArc 之前会被赋值
         */
        lastY: number;
        commands: number[];
        data: number | number[][];
        protected _type: number;
        protected _commandPosition: number;
        protected _dataPosition: number;
        /**
         * 路径类型
         */
        get type(): number;
        /**
         * 将当前绘图位置移动到 (x, y) 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
         */
        moveTo(x: number, y: number): void;
        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 (x, y) 结束的直线；当前绘图位置随后会设置为 (x, y)
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
         */
        lineTo(x: number, y: number): void;
        /**
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线当前绘图位置随后设置为 (anchorX, anchorY)
         * 如果在调用 moveTo() 方法之前调用了 curveTo() 方法, 则当前绘图位置的默认值为 (0, 0) 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变
         * 绘制的曲线是二次贝塞尔曲线二次贝塞尔曲线包含两个锚点和一个控制点该曲线内插这两个锚点, 并向控制点弯曲
         * @param controlX 一个数字, 指定控制点相对于父显示对象注册点的水平位置
         * @param controlY 一个数字, 指定控制点相对于父显示对象注册点的垂直位置
         * @param anchorX 一个数字, 指定下一个锚点相对于父显示对象注册点的水平位置
         * @param anchorY 一个数字, 指定下一个锚点相对于父显示对象注册点的垂直位置
         */
        curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        /**
         * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线三次贝塞尔曲线由两个锚点和两个控制点组成该曲线内插这两个锚点, 并向两个控制点弯曲
         * @param controlX1 指定首个控制点相对于父显示对象的注册点的水平位置
         * @param controlY1 指定首个控制点相对于父显示对象的注册点的垂直位置
         * @param controlX2 指定第二个控制点相对于父显示对象的注册点的水平位置
         * @param controlY2 指定第二个控制点相对于父显示对象的注册点的垂直位置
         * @param anchorX 指定锚点相对于父显示对象的注册点的水平位置
         * @param anchorY 指定锚点相对于父显示对象的注册点的垂直位置
         */
        cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
        /**
         * 绘制一个矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
         * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
         * @param width 矩形的宽度 (以像素为单位)
         * @param height 矩形的高度 (以像素为单位)
         */
        drawRect(x: number, y: number, width: number, height: number): void;
        /**
         * 绘制一个圆角矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
         * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
         * @param width 矩形的宽度 (以像素为单位)
         * @param height 矩形的高度 (以像素为单位)
         * @param ellipseWidth 用于绘制圆角的椭圆的宽度 (以像素为单位)
         * @param ellipseHeight 用于绘制圆角的椭圆的高度 (以像素为单位) 如果未指定值, 则默认值与为 ellipseWidth 参数提供的值相匹配
         */
        drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight?: number): void;
        /**
         * 绘制一个圆
         * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
         * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
         * @param radius 圆的半径 (以像素为单位)
         */
        drawCircle(x: number, y: number, radius: number): void;
        /**
         * 绘制一个椭圆
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
         * @param width 矩形的宽度 (以像素为单位)
         * @param height 矩形的高度 (以像素为单位)
         */
        drawEllipse(x: number, y: number, width: number, height: number): void;
        /**
         * 绘制一段圆弧路径圆弧路径的圆心在 (x, y) 位置, 半径为 r, 根据 anticlockwise (默认为顺时针) 指定的方向从 startAngle 开始绘制, 到 endAngle 结束
         * @param x 圆弧中心 (圆心) 的 x 轴坐标
         * @param y 圆弧中心 (圆心) 的 y 轴坐标
         * @param radius 圆弧的半径
         * @param startAngle 圆弧的起始点, x 轴方向开始计算, 单位以弧度表示, 注意, 必须在 0~2π 之间
         * @param endAngle 圆弧的终点, 单位以弧度表示, 注意, 必须在 0~2π 之间
         * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制
         */
        drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
        /**
         * 绘制一段圆弧路径
         * @param x 圆弧中心 (圆心) 的 x 轴坐标
         * @param y 圆弧中心 (圆心) 的 y 轴坐标
         * @param radiusX 圆弧的半径 x
         * @param radiusY 圆弧的半径 y
         * @param startAngle 圆弧的起始点, x 轴方向开始计算, 单位以弧度表示, 注意：必须为正数
         * @param endAngle 圆弧的终点, 单位以弧度表示, 注意：与 startAngle 差值必须在 0~2π 之间
         * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制, 注意：如果为 true, endAngle 必须小于 startAngle, 反之必须大于
         */
        private arcToBezier;
    }
}
declare namespace Dou.rendering {
    /**
     * 填充路径
     * @author wizardc
     */
    class FillPath extends Path2D {
        /**
         * 填充颜色
         */
        fillColor: number;
        /**
         * 填充透明度
         */
        fillAlpha: number;
        constructor();
    }
}
declare namespace Dou.rendering {
    /**
     * 线条路径
     * @author wizardc
     */
    class StrokePath extends Path2D {
        /**
         * 线条宽度
         * 注意: 绘制时对 1 像素和 3 像素要特殊处理, 整体向右下角偏移 0.5 像素, 以显示清晰锐利的线条
         */
        lineWidth: number;
        /**
         * 线条颜色
         */
        lineColor: number;
        /**
         * 线条透明度
         */
        lineAlpha: number;
        /**
         * 端点样式
         * * "none": 无端点
         * * "round": 圆头端点
         * * "square": 方头端点
         */
        caps: string;
        /**
         * 联接点样式
         * * "bevel": 斜角连接
         * * "miter": 尖角连接
         * * "round": 圆角连接
         */
        joints: string;
        /**
         * 用于表示剪切斜接的极限值的数字
         */
        miterLimit: number;
        /**
         * 描述交替绘制线段和间距 (坐标空间单位) 长度的数字
         */
        lineDash: number[];
        constructor();
    }
}
declare namespace Dou.rendering {
    /**
     * 渐变填充路径
     * @author wizardc
     */
    class GradientFillPath extends Path2D {
        gradientType: string;
        colors: number[];
        alphas: number[];
        ratios: number[];
        matrix: Matrix;
        constructor();
    }
}
declare namespace Dou.rendering {
    /**
     * 渲染缓冲
     * @author wizardc
     */
    class RenderBuffer {
        private static _renderBufferPool;
        /**
         * 获取一个渲染缓冲
         */
        static get(width: number, height: number): RenderBuffer;
        /**
         * 回收一个渲染缓冲
         */
        static put(buffer: RenderBuffer): void;
        /**
         * 渲染上下文
         */
        context: RenderContext;
        /**
         * 舞台缓存为 Canvas, 普通缓存为 RenderTarget
         */
        surface: HTMLCanvasElement | RenderTarget;
        /**
         * 渲染目标
         */
        renderTarget: RenderTarget;
        /**
         * 是否为舞台
         */
        private _root;
        /**
         * 当前使用的贴图
         */
        currentTexture: WebGLTexture;
        globalAlpha: number;
        globalTintColor: number;
        /**
         * stencil state
         * 模版开关状态
         */
        private _stencilState;
        stencilList: {
            x: number;
            y: number;
            width: number;
            height: number;
        }[];
        stencilHandleCount: number;
        /**
         * scissor state
         * scissor 开关状态
         */
        scissorState: boolean;
        private _scissorRect;
        hasScissor: boolean;
        drawCalls: number;
        computeDrawCall: boolean;
        globalMatrix: Matrix;
        savedGlobalMatrix: Matrix;
        offsetX: number;
        offsetY: number;
        constructor(width?: number, height?: number, root?: boolean);
        get width(): number;
        get height(): number;
        enableStencil(): void;
        disableStencil(): void;
        restoreStencil(): void;
        enableScissor(x: number, y: number, width: number, height: number): void;
        disableScissor(): void;
        restoreScissor(): void;
        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
         */
        resize(width: number, height: number, useMaxSize?: boolean): void;
        setTransform(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
        transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
        useOffset(): void;
        saveTransform(): void;
        restoreTransform(): void;
        /**
         * 获取指定区域的像素
         */
        getPixels(x: number, y: number, width?: number, height?: number): number[];
        /**
         * 转换成 base64 字符串, 如果图片 (或者包含的图片) 跨域, 则返回 null
         * @param type 转换的类型, 如: "image/png", "image/jpeg"
         */
        toDataURL(type?: string, encoderOptions?: number): string;
        /**
         * 一次渲染结束
         */
        onRenderFinish(): void;
        /**
         * 清空缓冲区数据
         */
        clear(): void;
        /**
         * 销毁绘制对象
         */
        destroy(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 指定渲染目标
     * * 可以是帧缓冲或者屏幕缓冲
     * @author wizardc
     */
    class RenderTarget {
        /**
         * 是否使用帧缓冲
         */
        useFrameBuffer: boolean;
        width: number;
        height: number;
        texture: WebGLTexture;
        clearColor: number[];
        private _gl;
        private _frameBuffer;
        private _stencilBuffer;
        constructor(gl: WebGLRenderingContext, width: number, height: number);
        /**
         * 初始化帧缓冲
         */
        initFrameBuffer(): void;
        /**
         * 创建空贴图
         */
        private createTexture;
        /**
         * 激活当前缓冲
         */
        activate(): void;
        private getFrameBuffer;
        /**
         * 开启模板缓冲
         */
        enabledStencil(): void;
        resize(width: number, height: number): void;
        private setSize;
        clear(bind?: boolean): void;
        dispose(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 渲染上下文
     * @author wizardcs
     */
    class RenderContext {
        private static _instance;
        static getInstance(width?: number, height?: number): RenderContext;
        /**
         * 呈现最终绘图结果的画布
         */
        surface: HTMLCanvasElement;
        /**
         * 渲染上下文
         */
        context: WebGLRenderingContext;
        /**
         * 上下文对象是否丢失
         */
        contextLost: boolean;
        /**
         * 贴图支持的最大尺寸
         */
        maxTextureSize: number;
        /**
         * 顶点数组管理器
         */
        private _vertexData;
        /**
         * 绘制命令管理器
         */
        drawCommand: DrawCommand;
        /**
         * 渲染缓冲栈
         * * 最下面的对象为屏幕渲染缓冲, 上层为帧缓冲
         */
        bufferStack: RenderBuffer[];
        /**
         * 当前绑定的 RenderBuffer
         */
        private _currentBuffer;
        /**
         * 当前激活的 RenderBuffer
         */
        activatedBuffer: RenderBuffer;
        /**
         * 当前使用的渲染程序
         */
        currentProgram: Program;
        private _bindIndices;
        private _vertexBuffer;
        private _indexBuffer;
        private _projectionX;
        private _projectionY;
        /**
         * 优化, 实现物体在只有一个变色滤镜的情况下以最简单方式渲染
         */
        colorMatrixFilter: ColorMatrixFilter;
        constructor(width?: number, height?: number);
        private initWebGL;
        private handleContextLost;
        private handleContextRestored;
        private getWebGLContext;
        private setContext;
        /**
         * 压入一个 RenderBuffer 并绑定为当前的操作缓冲
         */
        pushBuffer(buffer: RenderBuffer): void;
        /**
         * 弹出一个 RenderBuffer 并绑定上一个 RenderBuffer 为当前的操作缓冲
         * * 如果只剩下最后一个 RenderBuffer 则不执行操作
         */
        popBuffer(): void;
        /**
         * 启用 RenderBuffer
         */
        private activateBuffer;
        /**
         * 上传顶点数据
         */
        private uploadVerticesArray;
        /**
         * 上传索引数据
         */
        private uploadIndicesArray;
        onResize(width?: number, height?: number): void;
        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
         */
        resize(width: number, height: number, useMaxSize?: boolean): void;
        /**
         * 开启模版检测
         */
        enableStencilTest(): void;
        /**
         * 关闭模版检测
         */
        disableStencilTest(): void;
        /**
         * 开启 scissor 检测
         */
        enableScissorTest(rect: Rectangle): void;
        /**
         * 关闭 scissor 检测
         */
        disableScissorTest(): void;
        /**
         * 获取像素信息
         */
        getPixels(x: number, y: number, width: number, height: number, pixels: ArrayBufferView): void;
        /**
         * 创建一个贴图
         */
        createTexture(bitmapData: TexImageSource): WebGLTexture;
        /**
         * 更新贴图的图像
         */
        updateTexture(texture: WebGLTexture, bitmapData: TexImageSource): void;
        /**
         * 获取 BitmapData 的贴图, 如果不存在则创建一个
         */
        getTexture(bitmapData: BitmapData): WebGLTexture;
        /**
         * 设置混色
         */
        setGlobalCompositeOperation(value: string): void;
        /**
         * 绘制图片
         */
        drawImage(image: BitmapData | RenderTarget, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, imageSourceWidth: number, imageSourceHeight: number, rotated: boolean, smoothing?: boolean): void;
        /**
         * 绘制材质
         */
        drawTexture(texture: WebGLTexture, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, textureWidth: number, textureHeight: number, rotated?: boolean, smoothing?: boolean): void;
        /**
         * 绘制矩形
         * * 仅用于遮罩擦除等
         */
        drawRect(x: number, y: number, width: number, height: number): void;
        /**
         * 绘制遮罩
         */
        pushMask(x: number, y: number, width: number, height: number): void;
        /**
         * 恢复遮罩
         */
        popMask(): void;
        /**
         * 开启 scissor test
         */
        enableScissor(x: number, y: number, width: number, height: number): void;
        /**
         * 关闭 scissor test
         */
        disableScissor(): void;
        /**
         * 执行目前缓存在命令列表里的命令并清空
         */
        draw(): void;
        /**
         * 执行绘制命令
         */
        private drawData;
        /**
         * 激活渲染程序并指定属性格式
         */
        private activeProgram;
        /**
         * 提交 Uniform 数据
         */
        private syncUniforms;
        /**
         * 绘制贴图
         */
        private drawTextureElements;
        /**
         * 绘制矩形
         */
        private drawRectElements;
        /**
         * 将绘制图像作为一个遮罩进行绘制
         * * 并压入模板缓冲栈, 实际是向模板缓冲渲染新的数据
         */
        private drawPushMaskElements;
        /**
         * 将绘制图像作为一个遮罩进行绘制
         * * 并弹出模板缓冲栈， 实际是将模板缓冲渲染为上一次的数据
         */
        private drawPopMaskElements;
        /**
         * 设置混色
         */
        private setBlendMode;
        /**
         * 应用滤镜绘制给定的 RenderBuffer
         * * 此方法不会导致 input 被释放, 所以如果需要释放 input, 需要调用此方法后手动调用 release
         */
        drawTargetWidthFilters(filters: Filter[], input: RenderBuffer): void;
        /**
         * 向一个 RenderBuffer 中绘制
         */
        private drawToRenderTarget;
        /**
         * 清除矩形区域
         */
        clearRect(x: number, y: number, width: number, height: number): void;
        /**
         * 清除颜色缓存
         */
        clear(): void;
        /**
         * 销毁绘制对象
         */
        destroy(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 绘制数据接口
     * @author wizardc
     */
    interface IDrawData {
        type: number;
        count: number;
        texture: WebGLTexture;
        filter: Filter;
        value: string;
        buffer: RenderBuffer;
        width: number;
        height: number;
        textureWidth: number;
        textureHeight: number;
        smoothing: boolean;
        x: number;
        y: number;
    }
}
declare namespace Dou.rendering {
    /**
     * 绘制指令管理类
     * @author wizardc
     */
    class DrawCommand {
        /**
         * 用于缓存绘制命令的数组
         */
        readonly drawData: IDrawData[];
        /**
         * 绘制命令长度
         */
        drawDataLen: number;
        /**
         * 压入绘制矩形指令
         */
        pushDrawRect(): void;
        /**
         * 压入绘制贴图指令
         */
        pushDrawTexture(texture: WebGLTexture, count?: number, filter?: Filter, textureWidth?: number, textureHeight?: number): void;
        /**
         * 贴图绘制的 smoothing 属性改变时需要压入一个新的绘制指令
         */
        pushChangeSmoothing(texture: WebGLTexture, smoothing: boolean): void;
        /**
         * 压入 pushMask 指令
         */
        pushPushMask(count?: number): void;
        /**
         * 压入 popMask 指令
         */
        pushPopMask(count?: number): void;
        /**
         * 压入混色指令
         */
        pushSetBlend(value: string): void;
        /**
         * 压入 resize render target 命令
         */
        pushResize(buffer: RenderBuffer, width: number, height: number): void;
        /**
         * 压入 clear color 命令
         */
        pushClearColor(): void;
        /**
         * 压入激活 buffer 命令
         */
        pushActivateBuffer(buffer: RenderBuffer): void;
        /**
         * 压入 enabel scissor 命令
         */
        pushEnableScissor(x: number, y: number, width: number, height: number): void;
        /**
         * 压入 disable scissor 命令
         */
        pushDisableScissor(): void;
        /**
         * 清空命令数组
         */
        clear(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 顶点数据管理类
     * ```
     * 顶点格式:
     *   x[32位浮点] + y[32位浮点] + u[32位浮点] + v[32位浮点] + tintcolor[32位整型]
     *
     * 矩形格式(包含 4 个顶点组合而成):
     *   0------1
     *   |      |
     *   |      |
     *   3------2
     *
     * 顶点索引缓冲(包含 6 个整数):
     * [0, 1, 2, 0, 2, 3]
     * ```
     * @author wizardc
     */
    class VertexData {
        /**
         * 一个顶点的数据大小
         */
        static readonly vertSize: number;
        /**
         * 一个顶点的字节数据大小
         */
        static readonly vertByteSize: number;
        /**
         * 最多单次提交的矩形数量
         */
        static readonly maxQuadsCount: number;
        /**
         * 最多单次提交的顶点数量
         */
        static readonly maxVertexCount: number;
        /**
         * 最多单次提交的索引数量
         */
        static readonly maxIndicesCount: number;
        private _vertices;
        private _indices;
        private _vertexIndex;
        private _indexIndex;
        private _verticesFloat32View;
        private _verticesUint32View;
        constructor();
        /**
         * 是否达到最大缓存数量
         */
        reachMaxSize(vertexCount?: number, indexCount?: number): boolean;
        /**
         * 获取缓存完成的顶点数组
         */
        getVertices(): Float32Array;
        /**
         * 获取缓存完成的索引数组
         */
        getIndices(): Uint16Array;
        /**
         * 缓存一组顶点
         */
        cacheArrays(buffer: RenderBuffer, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, textureSourceWidth: number, textureSourceHeight: number, rotated?: boolean): void;
        clear(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 显示列表
     * @author wizardc
     */
    class DisplayList {
        static canvasScaleFactor: number;
        static canvasScaleX: number;
        static canvasScaleY: number;
        /**
         * 创建一个 DisplayList 对象, 若内存不足或无法创建 RenderBuffer, 将会返回 null
         */
        static create(target: DisplayObject): DisplayList;
        static setCanvasScale(x: number, y: number): void;
        /**
         * 位图渲染节点
         */
        renderNode: RenderNode;
        renderBuffer: RenderBuffer;
        offsetX: number;
        offsetY: number;
        /**
         * 显示列表根节点
         */
        root: DisplayObject;
        canvasScaleX: number;
        canvasScaleY: number;
        private _isStage;
        private _offsetMatrix;
        private _bitmapData;
        constructor(root: DisplayObject);
        /**
         * 设置剪裁边界, 不再绘制完整目标对象, 画布尺寸由外部决定, 超过边界的节点将跳过绘制
         */
        setClipRect(width: number, height: number): void;
        /**
         * 绘制根节点显示对象到目标画布, 返回 draw 的次数
         */
        drawToSurface(): number;
        /**
         * 改变画布的尺寸, 由于画布尺寸修改会清空原始画布所以这里将原始画布绘制到一个新画布上, 再与原始画布交换
         */
        changeSurfaceSize(): void;
    }
}
declare namespace Dou.rendering {
    /**
     * 画布渲染缓冲
     * @author wizardc
     */
    class CanvasRenderBuffer {
        constructor(width?: number, height?: number);
        /**
         * 渲染上下文
         */
        context: CanvasRenderingContext2D;
        /**
         * 呈现最终绘图结果的画布
         */
        surface: HTMLCanvasElement;
        /**
         * 渲染缓冲的宽度
         */
        get width(): number;
        /**
         * 渲染缓冲的高度
         */
        get height(): number;
        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param width 改变后的宽
         * @param height 改变后的高
         * @param useMaxSize 若传入 true, 则将改变后的尺寸与已有尺寸对比, 保留较大的尺寸
         */
        resize(width: number, height: number, useMaxSize?: boolean): void;
        /**
         * 获取指定区域的像素
         */
        getPixels(x: number, y: number, width?: number, height?: number): number[];
        /**
         * 转换成 Base64 字符串, 如果图片 (或者包含的图片) 跨域, 则返回 null
         * @param type 转换的类型, 如: "image/png", "image/jpeg"
         */
        toDataURL(type?: string, encoderOptions?: number): string;
        /**
         * 清空缓冲区数据
         */
        clear(): void;
        /**
         * 销毁绘制对象
         */
        destroy(): void;
    }
}
interface CanvasRenderingContext2D {
    $offsetX: number;
    $offsetY: number;
}
declare namespace Dou.rendering {
    /**
     * 画布渲染类
     * @author wizardc
     */
    class CanvasRenderer {
        renderText(node: TextNode, context: CanvasRenderingContext2D): void;
        renderGraphics(node: GraphicsNode, context: CanvasRenderingContext2D): number;
        private getRGBAString;
        private getGradient;
        private renderPath;
    }
}
declare namespace Dou.rendering {
    /**
     * 核心渲染类
     * @author wizardc
     */
    class Renderer {
        private _renderBufferPool;
        /**
         * 渲染的嵌套层次, 0 表示在调用堆栈的最外层
         */
        private _nestLevel;
        private _canvasRenderer;
        private _canvasRenderBuffer;
        /**
         * 渲染一个显示对象
         * @param displayObject 要渲染的显示对象
         * @param buffer 渲染缓冲
         * @param matrix 要对显示对象整体叠加的变换矩阵
         * @returns drawCall 触发绘制的次数
         */
        render(displayObject: DisplayObject, buffer: RenderBuffer, matrix: Matrix): number;
        /**
         * 绘制一个显示对象
         */
        private drawDisplayObject;
        private drawWithFilter;
        private getRenderCount;
        private drawWithClip;
        private drawWithScrollRect;
        private renderNormalBitmap;
        private renderBitmap;
        private renderText;
        private renderGraphics;
        private renderGroup;
        private renderNode;
        private createRenderBuffer;
    }
}
declare namespace Dou {
    /**
     * 屏幕适配器接口
     * @author wizardc
     */
    interface IScreenAdapter {
        /**
         * 计算舞台显示尺寸
         * @param scaleMode 当前的缩放模式
         * @param screenWidth 播放器视口宽度
         * @param screenHeight 播放器视口高度
         * @param contentWidth 初始化内容宽度
         * @param contentHeight 初始化内容高度
         */
        calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): StageDisplaySize;
    }
}
declare namespace Dou {
    /**
     * 舞台显示尺寸数据
     * @author wizardc
     */
    interface StageDisplaySize {
        /**
         * 舞台宽度
         */
        stageWidth: number;
        /**
         * 舞台高度
         */
        stageHeight: number;
        /**
         * 显示宽度, 若跟舞台宽度不同, 将会产生缩放
         */
        displayWidth: number;
        /**
         * 显示高度, 若跟舞台高度不同, 将会产生缩放
         */
        displayHeight: number;
    }
}
declare namespace Dou {
    /**
     * 默认屏幕适配器
     * @author wizardc
     */
    class DefaultScreenAdapter implements IScreenAdapter {
        /**
         * 计算舞台显示尺寸
         * @param scaleMode 当前的缩放模式
         * @param screenWidth 播放器视口宽度
         * @param screenHeight 播放器视口高度
         * @param contentWidth 初始化内容宽度
         * @param contentHeight 初始化内容高度
         */
        calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): StageDisplaySize;
    }
}
declare namespace Dou.rendering {
    /**
     * 着色器库
     * @author GLSLPacker
     */
    namespace ShaderLib {
        const default_vs = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec2 aColor;\nuniform vec2 projectionVector;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nconst vec2 center=vec2(-1.0,1.0);\nvoid main(){\ngl_Position=vec4((aVertexPosition/projectionVector)+center,0.0,1.0);\nvTextureCoord=aTextureCoord;\nvColor=vec4(aColor.x,aColor.x,aColor.x,aColor.x);\n}";
        const blur_fs = "precision mediump float;\nuniform vec2 blur;\nuniform sampler2D uSampler;\nuniform vec2 uTextureSize;\nvarying vec2 vTextureCoord;\nvoid main(){\nconst int sampleRadius=5;\nconst int samples=sampleRadius*2+1;\nvec2 blurUv=blur/uTextureSize;\nvec4 color=vec4(0.0,0.0,0.0,0.0);\nvec2 uv=vec2(0.0,0.0);\nblurUv/=float(sampleRadius);\nfor(int i=-sampleRadius;i<=sampleRadius;i++){\nuv.x=vTextureCoord.x+float(i)*blurUv.x;\nuv.y=vTextureCoord.y+float(i)*blurUv.y;\ncolor+=texture2D(uSampler,uv);\n}\ncolor/=float(samples);\ngl_FragColor=color;\n}";
        const colorBrush_fs = "precision lowp float;\nuniform float r;\nuniform float g;\nuniform float b;\nuniform float a;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\nvoid main(){\nvec4 color=texture2D(uSampler,vTextureCoord);\nif(color.a>0.0){\ncolor=vec4(color.rgb/color.a,color.a);\n}\ncolor.r=r;\ncolor.g=g;\ncolor.b=b;\ncolor.a*=a;\ngl_FragColor=vec4(color.rgb*color.a,color.a);\n}";
        const colorTransform_fs = "precision mediump float;\nuniform mat4 matrix;\nuniform vec4 colorAdd;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvoid main(){\nvec4 texColor=texture2D(uSampler,vTextureCoord);\nif(texColor.a>0.0){\ntexColor=vec4(texColor.rgb/texColor.a,texColor.a);\n}\nvec4 locColor=clamp(texColor*matrix+colorAdd,0.0,1.0);\ngl_FragColor=vColor*vec4(locColor.rgb*locColor.a,locColor.a);\n}";
        const glow_fs = "precision highp float;\nuniform float dist;\nuniform float angle;\nuniform vec4 color;\nuniform float alpha;\nuniform float blurX;\nuniform float blurY;\nuniform float strength;\nuniform float inner;\nuniform float knockout;\nuniform float hideObject;\nuniform sampler2D uSampler;\nuniform vec2 uTextureSize;\nvarying vec2 vTextureCoord;\nfloat random(vec2 scale){\nreturn fract(sin(dot(gl_FragCoord.xy,scale))*43758.5453);\n}\nvoid main(){\nvec2 px=vec2(1.0/uTextureSize.x,1.0/uTextureSize.y);\nconst float linearSamplingTimes=7.0;\nconst float circleSamplingTimes=12.0;\nvec4 ownColor=texture2D(uSampler,vTextureCoord);\nvec4 curColor;\nfloat totalAlpha=0.0;\nfloat maxTotalAlpha=0.0;\nfloat curDistanceX=0.0;\nfloat curDistanceY=0.0;\nfloat offsetX=dist*cos(angle)*px.x;\nfloat offsetY=dist*sin(angle)*px.y;\nconst float PI=3.14159265358979323846264;\nfloat cosAngle;\nfloat sinAngle;\nfloat offset=PI*2.0/circleSamplingTimes*random(vec2(12.9898,78.233));\nfloat stepX=blurX*px.x/linearSamplingTimes;\nfloat stepY=blurY*px.y/linearSamplingTimes;\nfor(float a=0.0;a<=PI*2.0;a+=PI*2.0/circleSamplingTimes){\ncosAngle=cos(a+offset);\nsinAngle=sin(a+offset);\nfor(float i=1.0;i<=linearSamplingTimes;i++){\ncurDistanceX=i*stepX*cosAngle;\ncurDistanceY=i*stepY*sinAngle;\nif(vTextureCoord.x+curDistanceX-offsetX>=0.0 && vTextureCoord.y+curDistanceY+offsetY<=1.0){\ncurColor=texture2D(uSampler,vec2(vTextureCoord.x+curDistanceX-offsetX,vTextureCoord.y+curDistanceY+offsetY));\ntotalAlpha+=(linearSamplingTimes-i)*curColor.a;\n}\nmaxTotalAlpha+=(linearSamplingTimes-i);\n}\n}\nownColor.a=max(ownColor.a,0.0001);\nownColor.rgb=ownColor.rgb/ownColor.a;\nfloat outerGlowAlpha=(totalAlpha/maxTotalAlpha)*strength*alpha*(1.0-inner)*max(min(hideObject,knockout),1.0-ownColor.a);\nfloat innerGlowAlpha=((maxTotalAlpha-totalAlpha)/maxTotalAlpha)*strength*alpha*inner*ownColor.a;\nownColor.a=max(ownColor.a*knockout*(1.0-hideObject),0.0001);\nvec3 mix1=mix(ownColor.rgb,color.rgb,innerGlowAlpha/(innerGlowAlpha+ownColor.a));\nvec3 mix2=mix(mix1,color.rgb,outerGlowAlpha/(innerGlowAlpha+ownColor.a+outerGlowAlpha));\nfloat resultAlpha=min(ownColor.a+outerGlowAlpha+innerGlowAlpha,1.0);\ngl_FragColor=vec4(mix2*resultAlpha,resultAlpha);\n}";
        const primitive_fs = "precision lowp float;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvoid main(){\ngl_FragColor=vColor;\n}";
        const texture_fs = "precision lowp float;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nuniform sampler2D uSampler;\nvoid main(){\ngl_FragColor=texture2D(uSampler,vTextureCoord)*vColor;\n}";
    }
}
declare namespace Dou.rendering {
    /**
     * 着色器程序
     * @author wizardc
     */
    class Program {
        private static programCache;
        static getProgram(key: string, gl: WebGLRenderingContext, vertSource: string, fragSource: string): Program;
        static deleteProgram(key: string): void;
        program: WebGLProgram;
        attributes: {
            [index: string]: Attribute;
        };
        uniforms: {
            [index: string]: Uniform;
        };
        private constructor();
        private createShader;
        private createProgram;
        private extractAttributes;
        private extractUniforms;
    }
}
declare namespace Dou.rendering {
    /**
     * 着色器属性
     * @author wizardc
     */
    class Attribute {
        name: string;
        type: number;
        size: number;
        location: number;
        count: number;
        format: number;
        constructor(gl: WebGLRenderingContext, program: WebGLProgram, attributeData: WebGLActiveInfo);
        private initCount;
        private initFormat;
    }
}
declare namespace Dou.rendering {
    /**
     * 着色器参数
     * @author wizardc
     */
    class Uniform {
        name: string;
        type: number;
        size: number;
        location: WebGLUniformLocation;
        value: any;
        setValue: (value: any) => void;
        upload: () => void;
        constructor(gl: WebGLRenderingContext, program: WebGLProgram, uniformData: WebGLActiveInfo);
        private setDefaultValue;
        private generateSetValue;
        private generateUpload;
    }
}
declare namespace Dou.input {
    /**
     * 输入文本
     * @author wizardc
     */
    class HtmlText extends Dou.EventDispatcher {
        textfield: TextField;
        private _htmlInput;
        private _isNeedShow;
        private _inputElement;
        private _inputDiv;
        private _gscaleX;
        private _gscaleY;
        private _textValue;
        private _colorValue;
        private _styleInfoes;
        setTextField(textfield: TextField): boolean;
        addToStage(): void;
        show(): void;
        private initElement;
        setText(value: string): boolean;
        getText(): string;
        private resetText;
        setColor(value: number): boolean;
        private resetColor;
        onBlur(): void;
        onInput(): void;
        onClickHandler(e: any): void;
        private executeShow;
        private onBlurHandler;
        private onFocusHandler;
        /**
         * 修改位置
         */
        resetStageText(): void;
        private setAreaHeight;
        private setElementStyle;
        hide(): void;
        removeFromStage(): void;
        onDisconnect(): void;
    }
}
declare namespace Dou.input {
    /**
     * 输入文本控制器
     * @author wizardc
     */
    class InputController {
        private _stageText;
        private _stageTextAdded;
        private _text;
        private _isFocus;
        private _tempStage;
        init(text: TextField): void;
        setText(value: string): void;
        getText(): string;
        setColor(value: number): void;
        addStageText(): void;
        private focusHandler;
        private blurHandler;
        private onMouseDownHandler;
        onFocus(): void;
        private onStageDownHandler;
        private updateTextHandler;
        private resetText;
        updateProperties(): void;
        private updateInput;
        hideInput(): void;
        removeStageText(): void;
    }
}
declare namespace Dou.input {
    /**
     * 输入文本输入管理类
     * @author wizardc
     */
    class InputManager {
        inputDIV: any;
        needShow: boolean;
        scaleX: number;
        scaleY: number;
        private _stageText;
        private _simpleElement;
        private _multiElement;
        private _inputElement;
        private _stageDelegateDiv;
        private _canvas;
        isInputOn(): boolean;
        isCurrentStageText(stageText: any): boolean;
        private initValue;
        initStageDelegateDiv(container: any, canvas: any): any;
        private initInputElement;
        updateSize(): void;
        show(): void;
        getInputElement(stageText: HtmlText): any;
        disconnectStageText(stageText: HtmlText): void;
        clearInputElement(): void;
    }
}
declare namespace Dou {
    /**
     * 文本样式
     * @author wizardc
     */
    interface ITextStyle {
        /**
         * 颜色值
         */
        textColor?: number;
        /**
         * 描边颜色值
         */
        strokeColor?: number;
        /**
         * 字号
         */
        size?: number;
        /**
         * 描边大小
         */
        stroke?: number;
        /**
         * 是否加粗
         */
        bold?: boolean;
        /**
         * 是否倾斜
         */
        italic?: boolean;
        /**
         * 是否加下划线
         */
        underline?: boolean;
        /**
         * 字体名称
         */
        fontFamily?: string;
        /**
         * 链接事件或者地址
         */
        href?: string;
        /**
         * 链接地址时的目标
         */
        target?: string;
    }
}
declare namespace Dou {
    /**
     * 文本元素
     * @author wizardc
     */
    interface ITextElement {
        /**
         * 字符串内容
         */
        text: string;
        /**
         * 文本样式
         */
        style?: ITextStyle;
    }
}
declare namespace Dou {
    /**
     * 碰撞元素
     * @author wizardc
     */
    interface IHitTextElement {
        /**
         * 行索引
         */
        lineIndex: number;
        /**
         * 元素索引
         */
        textElementIndex: number;
    }
}
declare namespace Dou {
    /**
     * 带有宽度信息的文本元素
     * @author wizardc
     */
    interface IWTextElement extends ITextElement {
        /**
         * 宽度
         */
        width: number;
    }
}
declare namespace Dou {
    /**
     * 文本行元素
     * @author wizardc
     */
    interface ILineElement {
        /**
         * 文本占用宽度
         */
        width: number;
        /**
         * 文本占用高度
         */
        height: number;
        /**
         * 当前文本字符总数量, 包括换行符
         */
        charNum: number;
        /**
         * 是否含有换行符
         */
        hasNextLine: boolean;
        /**
         * 本行文本内容
         */
        elements: IWTextElement[];
    }
}
declare namespace Dou {
    /**
     * 动态文本
     * @author wizardc
     */
    class TextField extends DisplayObject {
        /**
         * 默认文本字体
         */
        static default_fontFamily: string;
        /**
         * 默认文本字号大小
         */
        static default_size: number;
        /**
         * 默认文本颜色
         */
        static default_textColor: number;
        $propertyMap: Object;
        $inputEnabled: boolean;
        protected _inputController: input.InputController;
        protected _linkPreventTap: boolean;
        protected _textNode: rendering.TextNode;
        protected _graphicsNode: rendering.GraphicsNode;
        protected _isFlow: boolean;
        protected _textArr: ITextElement[];
        protected _linesArr: ILineElement[];
        protected _isTyping: boolean;
        constructor();
        /**
         * 要使用的字体的名称或用逗号分隔的字体名称列表
         */
        set fontFamily(value: string);
        get fontFamily(): string;
        $setFontFamily(value: string): boolean;
        $getFontFamily(): string;
        /**
         * 字体大小
         */
        set size(value: number);
        get size(): number;
        $setSize(value: number): boolean;
        $getSize(): number;
        /**
         * 是否显示为粗体
         */
        set bold(value: boolean);
        get bold(): boolean;
        $setBold(value: boolean): boolean;
        $getBold(): boolean;
        /**
         * 是否显示为斜体
         */
        set italic(value: boolean);
        get italic(): boolean;
        $setItalic(value: boolean): boolean;
        $getItalic(): boolean;
        /**
         * 文本的水平对齐方式
         */
        set textAlign(value: HorizontalAlign);
        get textAlign(): HorizontalAlign;
        $setTextAlign(value: HorizontalAlign): boolean;
        $getTextAlign(): HorizontalAlign;
        /**
         * 文字的垂直对齐方式
         */
        set verticalAlign(value: VerticalAlign);
        get verticalAlign(): VerticalAlign;
        $setVerticalAlign(value: VerticalAlign): boolean;
        $getVerticalAlign(): VerticalAlign;
        /**
         * 行与行之间的垂直间距量
         */
        set lineSpacing(value: number);
        get lineSpacing(): number;
        $setLineSpacing(value: number): boolean;
        $getLineSpacing(): number;
        /**
         * 文本颜色
         */
        set textColor(value: number);
        get textColor(): number;
        $setTextColor(value: number): boolean;
        $getTextColor(): number;
        /**
         * 文本字段是按单词换行还是按字符换行
         */
        set wordWrap(value: boolean);
        get wordWrap(): boolean;
        $setWordWrap(value: boolean): void;
        $getWordWrap(): boolean;
        /**
         * 文本类型
         */
        set type(value: TextFieldType);
        get type(): TextFieldType;
        $setType(value: TextFieldType): boolean;
        $getType(): TextFieldType;
        /**
         * 弹出键盘的类型
         */
        set inputType(value: string);
        get inputType(): string;
        $setInputType(value: string): boolean;
        $getInputType(): string;
        /**
         * 当前文本
         */
        set text(value: string);
        get text(): string;
        $setText(value: string): boolean;
        $setBaseText(value: string): boolean;
        $getText(): string;
        /**
         * 否是密码文本
         */
        set displayAsPassword(value: boolean);
        get displayAsPassword(): boolean;
        $setDisplayAsPassword(value: boolean): boolean;
        $getDisplayAsPassword(): boolean;
        /**
         * 描边颜色
         */
        set strokeColor(value: number);
        get strokeColor(): number;
        $setStrokeColor(value: number): boolean;
        $getStrokeColor(): number;
        /**
         * 描边宽度, 0 为没有描边
         */
        set stroke(value: number);
        get stroke(): number;
        $setStroke(value: number): boolean;
        $getStroke(): number;
        /**
         * 文本字段中最多可输入的字符数
         */
        set maxChars(value: number);
        get maxChars(): number;
        $setMaxChars(value: number): boolean;
        $getMaxChars(): number;
        /**
         * 文本在文本字段中的垂直位置, 单位行
         */
        set scrollV(value: number);
        get scrollV(): number;
        $setScrollV(value: number): boolean;
        $getScrollV(): number;
        /**
         * scrollV 的最大值
         */
        get maxScrollV(): number;
        $getMaxScrollV(): number;
        /**
         * 文本行数
         */
        get numLines(): number;
        /**
         * 是否为多行文本
         */
        set multiline(value: boolean);
        get multiline(): boolean;
        $setMultiline(value: boolean): boolean;
        $getMultiline(): boolean;
        /**
         * 表示用户可输入到文本字段中的字符集
         * 如果值为 null, 则可以输入任何字符
         * 如果值为空字符串, 则不能输入任何字符
         * 如果值为一串字符, 则只能在文本字段中输入该字符串中的字符, 可以使用连字符 (-) 指定一个范围
         * 如果字符串以尖号 (^) 开头, 表示后面的字符都不能输入
         */
        set restrict(value: string);
        get restrict(): string;
        $setRestrict(value: string): boolean;
        $getRestrict(): string;
        /**
         * 是否有边框
         */
        set border(value: boolean);
        get border(): boolean;
        $setBorder(value: boolean): boolean;
        $getBorder(): boolean;
        /**
         * 边框的颜色
         */
        set borderColor(value: number);
        get borderColor(): number;
        $setBorderColor(value: number): boolean;
        $getBorderColor(): number;
        /**
         * 是否有背景
         */
        set background(value: boolean);
        get background(): boolean;
        $setBackground(value: boolean): boolean;
        $getBackground(): boolean;
        /**
         * 背景的颜色
         */
        set backgroundColor(value: number);
        get backgroundColor(): number;
        $setBackgroundColor(value: number): boolean;
        $getBackgroundColor(): number;
        /**
         * 设置富文本
         */
        set textFlow(textArr: ITextElement[]);
        get textFlow(): ITextElement[];
        $setTextFlow(textArr: ITextElement[]): boolean;
        $getTextFlow(): ITextElement[];
        /**
         * 获取文本测量宽度
         */
        get textWidth(): number;
        /**
         * 获取文本测量高度
         */
        get textHeight(): number;
        /**
         * 触发 link 事件后是否阻止父级容器后续的 tap 事件冒泡
         */
        set linkPreventTap(value: boolean);
        get linkPreventTap(): boolean;
        $setLinkPreventTap(value: boolean): void;
        $getLinkPreventTap(): boolean;
        $setWidth(value: number): boolean;
        $getWidth(): number;
        $setHeight(value: number): boolean;
        $getHeight(): number;
        $getLineHeight(): number;
        private invalidateFontString;
        $invalidateTextField(): void;
        $getRenderBounds(): Dou.Recyclable<Rectangle>;
        private changeToPassText;
        private setMiddleStyle;
        /**
         * 输入文本自动进入到输入状态，仅在类型是输入文本并且是在用户交互下才可以调用
         */
        setFocus(): void;
        /**
         * 添加一段文本
         */
        appendText(text: string): void;
        /**
         * 添加一段带样式的文本
         */
        appendElement(element: ITextElement): void;
        $getLinesArr(): ILineElement[];
        $setIsTyping(value: boolean): void;
        $setTouchEnabled(value: boolean): void;
        private isInput;
        $onAddToStage(stage: Stage, nestLevel: number): void;
        $onRemoveFromStage(): void;
        private addEvent;
        private removeEvent;
        private onTapHandler;
        $measureContentBounds(bounds: Rectangle): void;
        $updateRenderNode(): void;
        private fillBackground;
        /**
         * 返回要绘制的下划线列表
         */
        private drawText;
    }
}
declare namespace Dou {
    /**
     * 位图字体
     * @author wizardc
     */
    class BitmapFont extends SpriteSheet {
        private _charList;
        private _firstCharHeight;
        constructor(texture: Texture, config: string | {
            [key: string]: {
                x: number;
                y: number;
                w: number;
                h: number;
                offX: number;
                offY: number;
                sourceW: number;
                sourceH: number;
                xadvance: number;
            };
        });
        getTexture(name: string): Texture;
        getConfig(name: string, key: string): number;
        getFirstCharHeight(): number;
    }
}
declare namespace Dou {
    /**
     * 位图文本
     * @author wizardc
     */
    class BitmapText extends DisplayObject {
        /**
         * 一个空格字符的宽度比例, 这个数值乘以第一个字符的高度即为空格字符的宽
         */
        static EMPTY_FACTOR: number;
        protected _text: string;
        protected _textLinesChanged: boolean;
        protected _textFieldWidth: number;
        protected _textFieldHeight: number;
        protected _font: BitmapFont;
        protected _fontStringChanged: boolean;
        protected _smoothing: boolean;
        protected _lineSpacing: number;
        protected _letterSpacing: number;
        protected _textAlign: HorizontalAlign;
        protected _verticalAlign: VerticalAlign;
        protected _textWidth: number;
        protected _textHeight: number;
        protected _textOffsetX: number;
        protected _textOffsetY: number;
        protected _textStartX: number;
        protected _textStartY: number;
        protected _textLines: string[];
        protected _textLinesWidth: number[];
        protected _lineHeights: number[];
        constructor();
        /**
         * 要显示的文本内容
         */
        set text(value: string);
        get text(): string;
        $setText(value: string): boolean;
        $getText(): string;
        /**
         * 位图字体
         */
        set font(value: BitmapFont);
        get font(): BitmapFont;
        $setFont(value: BitmapFont): boolean;
        $getFont(): BitmapFont;
        /**
         * 控制在缩放时是否进行平滑处理
         */
        set smoothing(value: boolean);
        get smoothing(): boolean;
        $setSmoothing(value: boolean): void;
        $getSmoothing(): boolean;
        /**
         * 一个整数, 表示行与行之间的垂直间距量
         */
        set lineSpacing(value: number);
        get lineSpacing(): number;
        $setLineSpacing(value: number): boolean;
        $getLineSpacing(): number;
        /**
         * 一个整数, 表示字符之间的距离
         */
        set letterSpacing(value: number);
        get letterSpacing(): number;
        $setLetterSpacing(value: number): boolean;
        $getLetterSpacing(): number;
        /**
         * 文本的水平对齐方式
         */
        set textAlign(value: HorizontalAlign);
        get textAlign(): HorizontalAlign;
        $setTextAlign(value: HorizontalAlign): boolean;
        $getTextAlign(): HorizontalAlign;
        /**
         * 文字的垂直对齐方式
         */
        set verticalAlign(value: VerticalAlign);
        get verticalAlign(): VerticalAlign;
        $setVerticalAlign(value: VerticalAlign): boolean;
        $getVerticalAlign(): VerticalAlign;
        /**
         * 获取位图文本测量宽度
         */
        get textWidth(): number;
        /**
         * 获取位图文本测量高度
         */
        get textHeight(): number;
        $setWidth(value: number): boolean;
        $getWidth(): number;
        $setHeight(value: number): boolean;
        $getHeight(): number;
        $invalidateContentBounds(): void;
        $measureContentBounds(bounds: Rectangle): void;
        $updateRenderNode(): void;
        $getTextLines(): string[];
    }
}
declare namespace Dou {
    /**
     * HTML 格式文本解析器
     * @author wizardc
     */
    namespace HtmlTextParser {
        /**
         * 解析 HTML 格式文本
         */
        function parse(htmltext: string): ITextElement[];
    }
}
declare namespace Dou.touch {
    /**
     * 触摸处理类
     * @author wizardc
     */
    class TouchHandler {
        private _canvas;
        private _touch;
        private _point;
        private _scaleX;
        private _scaleY;
        private _rotation;
        constructor(stage: Stage, canvas: HTMLCanvasElement);
        private addListeners;
        private addMouseListener;
        private addTouchListener;
        private onTouchBegin;
        private onTouchMove;
        private touchMove;
        private onTouchEnd;
        private prevent;
        private getLocation;
        /**
         * 更新屏幕当前的缩放比例, 用于计算准确的点击位置
         */
        updateScaleMode(scaleX: number, scaleY: number, rotation: number): void;
        /**
         * 更新同时触摸点的数量
         */
        updateMaxTouches(): void;
    }
}
declare namespace Dou.touch {
    /**
     * 触摸处理实现类
     * @author wizardc
     */
    class TouchHandlerImpl {
        private _stage;
        private _maxTouches;
        private _useTouchesCount;
        private _touchDownTarget;
        private _lastTouchX;
        private _lastTouchY;
        constructor(stage: Stage);
        initMaxTouches(): void;
        onTouchBegin(x: number, y: number, touchPointID: number): void;
        onTouchMove(x: number, y: number, touchPointID: number): void;
        onTouchEnd(x: number, y: number, touchPointID: number): void;
        private findTarget;
    }
}
declare namespace Dou {
    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加会多次调用
     */
    function callLater(method: Function, thisObj: any, ...args: any[]): void;
    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加只会调用一次
     */
    function callLaterUnique(method: Function, thisObj: any, ...args: any[]): void;
    namespace sys {
        function updateCallLater(): void;
        function callLater(method: Function, thisObj: any, ...args: any[]): void;
        function callLaterUnique(method: Function, thisObj: any, ...args: any[]): void;
    }
}
declare namespace Dou {
    /**
     * 添加超时计时器
     */
    function setTimeout(method: Function, thisObj: any, delay: number, ...args: any[]): number;
    /**
     * 移除超时计时器
     */
    function clearTimeout(key: number): void;
    namespace sys {
        function updateTimeout(passedTime: number): void;
        function setTimeout(method: Function, thisObj: any, delay: number, ...args: any[]): number;
        function clearTimeout(key: number): void;
    }
}
declare namespace Dou {
    /**
     * 添加重复计时器
     */
    function setInterval(method: Function, thisObj: any, delay: number, ...args: any[]): number;
    /**
     * 移除重复计时器
     */
    function clearInterval(key: number): void;
    namespace sys {
        function updateInterval(passedTime: number): void;
        function setInterval(method: Function, thisObj: any, delay: number, ...args: any[]): number;
        function clearInterval(key: number): void;
    }
}
declare namespace Dou {
    /**
     * 数学工具类
     * @author wizardc
     */
    namespace MathUtil {
        const PI_HALF: number;
        const PI_QUARTER: number;
        const PI_DOUBLE: number;
        /**
         * 弧度制到角度制相乘的系数
         */
        const RAD_DEG: number;
        /**
         * 角度制到弧度制相乘的系数
         */
        const DEG_RAD: number;
        /**
         * 根号 2
         */
        const SQRT_2 = 1.4142135623731;
        /**
         * 根号 2 的一半
         */
        const SQRT1_2: number;
        /**
         * 把指定的数限制在指定的区间内
         */
        function clamp(v: number, min?: number, max?: number): number;
        /**
         * 线性插值
         */
        function lerp(from: number, to: number, t: number): number;
        /**
         * 转换为弧度
         */
        function toRadians(degrees: number): number;
        /**
         * 转换为角度
         */
        function toDegrees(radians: number): number;
        /**
         * 格式化弧线角度的值
         */
        function clampAngle(value: number): number;
        /**
         * 格式化旋转角度的值
         */
        function clampRotation(value: number): number;
    }
}
declare namespace Dou {
    /**
     * HTML 工具类
     * @author wizardc
     */
    namespace HtmlUtil {
        function createCanvas(width?: number, height?: number): HTMLCanvasElement;
        function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
        function getWebGLContext(canvas: HTMLCanvasElement, antialias?: boolean, stencil?: boolean): WebGLRenderingContext;
        function resizeContext(renderContext: rendering.RenderContext, width: number, height: number, useMaxSize?: boolean): void;
        /**
         * 根据样式测量指定样式文本的宽度
         */
        function measureTextByStyle(text: string, values: any, style?: ITextStyle): number;
        /**
         * 测量指定样式文本的宽度
         */
        function measureText(text: string, fontFamily: string, fontSize: number, bold: boolean, italic: boolean): number;
        /**
         * 测量文本的宽度
         */
        function measureTextWidth(context: CanvasRenderingContext2D, text: string): number;
        /**
         * 获取样式属性的名称, 兼容多个浏览器
         */
        function getStyleName(name: string, element?: any): string;
        function getFontString(node: rendering.TextNode, format: rendering.TextFormat): string;
        function toColorString(value: number): string;
        function getRelativePath(url: string, fileName: string): string;
    }
}
declare namespace Dou {
    /**
     * WebGL 工具类
     * @author wizardc
     */
    namespace WebGLUtil {
        function createTexture(renderContext: rendering.RenderContext, source: TexImageSource): WebGLTexture;
        function createTexture(renderContext: rendering.RenderContext, width: number, height: number, data: any): WebGLTexture;
        function deleteTexture(texture: WebGLTexture): void;
        function premultiplyTint(tint: number, alpha: number): number;
    }
}
declare namespace Dou {
    /**
     * Base64 工具类
     * @author wizardc
     */
    namespace Base64Util {
        /**
         * 编码
         */
        function encode(arraybuffer: ArrayBuffer): string;
        /**
         * 解码
         */
        function decode(base64: string): ArrayBuffer;
    }
}
declare namespace Dou {
    /**
     * 注册一个接口实现
     */
    function registerImplementation(key: string, data: any): void;
    /**
     * 获取一个接口实现
     */
    function getImplementation(key: string): any;
}
declare namespace Dou {
    /**
     * 运行时环境信息
     * @author wizardc
     */
    namespace Capabilities {
        /**
         * 引擎版本
         */
        let engineVersion: string;
        /**
         * 当前的操作系统
         */
        let os: "Unknown" | "iOS" | "Android" | "Windows Phone" | "Windows PC" | "Mac OS";
        /**
         * 系统的语言代码
         */
        let language: string;
        /**
         * 是否处于移动环境
         */
        let isMobile: boolean;
        /**
         * 客户端边界宽度
         */
        let boundingClientWidth: number;
        /**
         * 客户端边界高度
         */
        let boundingClientHeight: number;
        function init(): void;
    }
}
declare namespace Dou {
    /**
     * 文本工具类
     * @author wizardc
     */
    namespace TextFieldUtil {
        /**
         * 获取第一行绘制的行数, 从 0 开始
         */
        function getStartLine(textfield: TextField): number;
        /**
         * 获取水平比例
         */
        function getHalign(textfield: TextField): number;
        /**
         * 获取文本高度
         */
        function getTextHeight(textfield: TextField): number;
        /**
         * 获取垂直比例
         */
        function getValign(textfield: TextField): number;
        /**
         * 根据坐标获取文本项
         */
        function getTextElement(textfield: TextField, x: number, y: number): ITextElement;
        /**
         * 获取文本点击块
         */
        function getHit(textfield: TextField, x: number, y: number): IHitTextElement;
        /**
         * 获取当前显示多少行
         */
        function getScrollNum(textfield: TextField): number;
    }
}
declare namespace Dou {
    /**
     * UUID 工具类
     * @author wizardc
     */
    namespace UUID {
        /**
         * 生成一个 UUID
         */
        function generate(): string;
    }
}
declare namespace Dou {
    /**
     * 时间类
     * @author wizardc
     */
    class Time {
        /**
         * 项目启动后经过的时间
         */
        static get time(): number;
        /**
         * 上一帧到这一帧经过的时间
         */
        static get deltaTime(): number;
        /**
         * 固定频率刷新时间间隔, 默认值为 50 毫秒
         */
        static set fixedDeltaTime(value: number);
        static get fixedDeltaTime(): number;
    }
    namespace sys {
        let deltaTime: number;
        let fixedDeltaTime: number;
        let fixedPassedTime: number;
    }
}
declare namespace Dou {
    /**
     * 贝塞尔工具类
     * @author wizardc
     */
    namespace BezierUtil {
        /**
         * 二次贝塞尔曲线
         */
        function quadratic(factor: number, point1: Point, point2: Point, point3: Point, result?: Point): Point;
        /**
         * 三次贝塞尔曲线
         */
        function cube(factor: number, startPoint: Point, point1: Point, point2: Point, endPoint: Point, result?: Point): Point;
    }
}
declare namespace Dou.sys {
    /**
     * 应用统计信息
     * @author wizardc
     */
    class Stat {
        private _method;
        private _thisObj;
        setListener(method: (logicTime: number, renderTime: number, drawCalls: number) => void, thisObj?: any): void;
        onFrame(logicTime: number, renderTime: number, drawCalls: number): void;
    }
}
declare namespace Dou {
    /**
     * 简单的性能统计信息面板
     * * 推荐实际项目中自己实现该面板来统计更多有用的详细信息
     * @author wizardc
     */
    class StatPanel extends DisplayObjectContainer {
        private _label;
        private _time;
        private _frame;
        private _drawCalls;
        private _logicTime;
        private _renderTime;
        constructor();
        private receive;
    }
}
declare namespace Dou {
    /**
     * 引擎类, 用来启动 2D 引擎
     * @author wizardc
     */
    class Engine {
        private _options;
        private _container;
        private _touchHandler;
        /**
         * @param rootClass 根显示容器类
         * @param div 用户呈现 3D 图像的 Div 元素, 为空则会创建一个全屏的元素
         * @param runOptions 运行配置项
         */
        constructor(rootClass: any, div?: HTMLDivElement, runOptions?: RunOptions);
        private init;
        private readOptions;
        private attachCanvas;
        private startTicker;
        setContentSize(width: number, height: number): void;
        updateScreenSize(): void;
        updateMaxTouches(maxTouches: number): void;
    }
    /**
     * 启动配置选项
     * @author wizardc
     */
    interface RunOptions {
        contentWidth?: number;
        contentHeight?: number;
        scaleMode?: string;
        orientation?: string;
        maxTouches?: number;
        frameRate?: number;
        antialias?: boolean;
        screenAdapter?: IScreenAdapter;
        canvasScaleFactor?: (context: CanvasRenderingContext2D) => number;
    }
}
