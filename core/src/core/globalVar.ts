namespace dou2d.$2d {
    /**
     * 画布
     */
    export let canvas: HTMLCanvasElement;

    /**
     * 心跳计时器
     */
    export let ticker: sys.Ticker;

    /**
     * 播放器
     */
    export let player: sys.Player;

    /**
     * 舞台
     */
    export let stage: Stage;

    /**
     * 屏幕适配器
     */
    export let screenAdapter: IScreenAdapter;

    /**
     * 2D 渲染上下文
     */
    export let context2D: CanvasRenderingContext2D;

    /**
     * 渲染对象
     */
    export let renderer: rendering.Renderer;

    /**
     * 用于碰撞检测的渲染缓冲
     */
    export let hitTestBuffer: rendering.RenderBuffer;

    /**
     * 贴图缩放系数
     * * 为了解决图片和字体发虚所引入的机制, 它底层实现的原理是创建更大的画布去绘制
     * * 之所以出现发虚这个问题, 是因为普通屏幕的 1 个像素点就是 1 个物理像素点, 而高清屏的 1 个像素点是 4 个物理像素点, 仅高清手机屏会出现该问题
     */
    export let textureScaleFactor: number = 1;

    /**
     * 文本输入管理
     */
    export let inputManager: input.InputManager;

    /**
     * 性能统计
     */
    export let stat: sys.Stat;

    /**
     * 进入帧回调对象列表
     */
    export let enterFrameCallBackList: DisplayObject[] = [];

    /**
     * 仅一次进入帧回调对象列表
     */
    export let enterFrameOnceCallBackList: DisplayObject[] = [];

    /**
     * 固定频率进入帧回调对象列表
     */
    export let fixedEnterFrameCallBackList: DisplayObject[] = [];

    /**
     * 仅一次固定频率进入帧回调对象列表
     */
    export let fixedEnterFrameOnceCallBackList: DisplayObject[] = [];

    /**
     * 是否派发 Event.RENDER 事件
     */
    export let invalidateRenderFlag: boolean = false;

    /**
     * 渲染回调对象列表
     */
    export let renderCallBackList: DisplayObject[] = [];

    /**
     * 仅一次渲染回调对象列表
     */
    export let renderOnceCallBackList: DisplayObject[] = [];
}
