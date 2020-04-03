namespace dou2d {
    const tempRect: Rectangle = new Rectangle();

    /**
     * 显示对象
     * @author wizardc
     */
    export class DisplayObject extends dou.EventDispatcher {
        /**
         * 显示对象默认的 touchEnabled 属性
         */
        public static defaultTouchEnabled: boolean = false;

        public $useTranslate: boolean = false;
        public $displayList: rendering.DisplayList;
        public $cacheDirty: boolean = false;

        public $maskedObject: DisplayObject;
        public $mask: DisplayObject;
        public $maskRect: Rectangle;

        public $renderNode: rendering.RenderNode;
        public $renderDirty: boolean = false;
        public $renderMode: rendering.RenderMode;

        public $tintRGB: number = 0;

        public $sortDirty: boolean = false;
        public $lastSortedIndex: number = 0;

        protected _children: DisplayObject[];
        protected _parent: DisplayObjectContainer;
        protected _stage: Stage;

        /**
         * 这个对象在显示列表中的嵌套深度, 舞台为 1, 它的子项为 2, 子项的子项为 3, 以此类推, 当对象不在显示列表中时此属性值为 0
         */
        protected _nestLevel: number = 0;

        protected _name: string = "";

        protected _matrix: Matrix;
        protected _matrixDirty: boolean = false;

        protected _concatenatedMatrix: Matrix;
        protected _invertedConcatenatedMatrix: Matrix;

        protected _x: number = 0;
        protected _y: number = 0;

        protected _scaleX: number = 1;
        protected _scaleY: number = 1;

        protected _rotation: number = 0;

        protected _skewX: number = 0;
        protected _skewXdeg: number = 0;
        protected _skewY: number = 0;
        protected _skewYdeg: number = 0;

        protected _explicitWidth: number = NaN;
        protected _explicitHeight: number = NaN;

        protected _anchorOffsetX: number = 0;
        protected _anchorOffsetY: number = 0;

        protected _visible: boolean = true;
        protected _invisible: boolean = false;
        protected _finalVisible: boolean = true;
        protected _alpha: number = 1;
        protected _tint: number = 0;

        protected _blendMode: BlendMode = BlendMode.normal;

        protected _scrollRect: Rectangle;

        protected _filters: (Filter | CustomFilter)[];

        protected _cacheAsBitmap: boolean = false;

        protected _touchEnabled: boolean = DisplayObject.defaultTouchEnabled;
        protected _hitArea: Rectangle;

        protected _dropEnabled: boolean = false;

        protected _zIndex: number = 0;
        protected _sortableChildren: boolean = false;

        public constructor() {
            super();
            this._matrix = new Matrix();
            this.tint = 0xffffff;
        }

        /**
         * 父容器
         */
        public get parent(): DisplayObjectContainer {
            return this._parent;
        }

        /**
         * 设置父级显示对象
         */
        public $setParent(parent: DisplayObjectContainer): void {
            this._parent = parent;
        }

        /**
         * 子项列表
         */
        public get $children(): DisplayObject[] {
            return this._children;
        }

        /**
         * 舞台
         */
        public get stage(): Stage {
            return this._stage;
        }

        /**
         * 名称
         */
        public set name(value: string) {
            this._name = value;
        }
        public get name(): string {
            return this._name;
        }

        /**
         * 当前显示对象的矩阵
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         */
        public set matrix(value: Matrix) {
            this.$setMatrix(value);
        }
        public get matrix(): Matrix {
            return this.$getMatrix().clone();
        }

        /**
         * 设置矩阵
         */
        public $setMatrix(matrix: Matrix, needUpdateProperties: boolean = true): void {
            let m = this._matrix;
            m.a = matrix.a;
            m.b = matrix.b;
            m.c = matrix.c;
            m.d = matrix.d;
            this._x = matrix.tx;
            this._y = matrix.ty;
            this._matrixDirty = false;
            if (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1) {
                this.$useTranslate = false;
            }
            else {
                this.$useTranslate = true;
            }
            if (needUpdateProperties) {
                this._scaleX = m.scaleX;
                this._scaleY = m.scaleY;
                this._skewX = matrix.skewX;
                this._skewY = matrix.skewY;
                this._skewXdeg = MathUtil.clampRotation(this._skewX * 180 / Math.PI);
                this._skewYdeg = MathUtil.clampRotation(this._skewY * 180 / Math.PI);
                this._rotation = MathUtil.clampRotation(this._skewY * 180 / Math.PI);
            }
        }

        /**
         * 获取矩阵
         */
        public $getMatrix(): Matrix {
            if (this._matrixDirty) {
                this._matrixDirty = false;
                this._matrix.updateScaleAndRotation(this._scaleX, this._scaleY, this._skewX, this._skewY);
            }
            this._matrix.tx = this._x;
            this._matrix.ty = this._y;
            return this._matrix;
        }

        /**
         * 获得这个显示对象以及它所有父级对象的连接矩阵
         */
        public $getConcatenatedMatrix(): Matrix {
            let matrix = this._concatenatedMatrix;
            if (!matrix) {
                matrix = this._concatenatedMatrix = new Matrix();
            }
            if (this._parent) {
                matrix.premultiply(this._parent.$getConcatenatedMatrix(), this.$getMatrix());
            }
            else {
                matrix.copy(this.$getMatrix());
            }
            let offsetX = this._anchorOffsetX;
            let offsetY = this._anchorOffsetY;
            let rect = this._scrollRect;
            if (rect) {
                let temp = dou.recyclable(Matrix);
                temp.set(1, 0, 0, 1, -rect.x - offsetX, -rect.y - offsetY);
                matrix.premultiply(matrix, temp);
                temp.recycle();
            }
            else if (offsetX != 0 || offsetY != 0) {
                let temp = dou.recyclable(Matrix);
                temp.set(1, 0, 0, 1, -offsetX, -offsetY);
                matrix.premultiply(matrix, temp);
                temp.recycle();
            }
            return this._concatenatedMatrix;
        }

        /**
         * 获取链接矩阵
         */
        public $getInvertedConcatenatedMatrix(): Matrix {
            if (!this._invertedConcatenatedMatrix) {
                this._invertedConcatenatedMatrix = new Matrix();
            }
            this._invertedConcatenatedMatrix.inverse(this.$getConcatenatedMatrix());
            return this._invertedConcatenatedMatrix;
        }

        /**
         * x 轴坐标
         */
        public set x(value: number) {
            this.$setX(value);
        }
        public get x(): number {
            return this.$getX();
        }

        public $setX(value: number): boolean {
            if (this._x == value) {
                return false;
            }
            this._x = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getX(): number {
            return this._x;
        }

        /**
         * y 轴坐标
         */
        public set y(value: number) {
            this.$setY(value);
        }
        public get y(): number {
            return this.$getY();
        }

        public $setY(value: number): boolean {
            if (this._y == value) {
                return false;
            }
            this._y = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getY(): number {
            return this._y;
        }

        /**
         * 水平缩放值
         */
        public set scaleX(value: number) {
            this.$setScaleX(value);
        }
        public get scaleX(): number {
            return this.$getScaleX();
        }

        public $setScaleX(value: number): void {
            if (this._scaleX == value) {
                return;
            }
            this._scaleX = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getScaleX(): number {
            return this._scaleX;
        }

        /**
         * 垂直缩放值
         */
        public set scaleY(value: number) {
            this.$setScaleY(value);
        }
        public get scaleY(): number {
            return this.$getScaleY();
        }

        public $setScaleY(value: number): void {
            if (this._scaleY == value) {
                return;
            }
            this._scaleY = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getScaleY(): number {
            return this._scaleY;
        }

        /**
         * 旋转值
         */
        public set rotation(value: number) {
            this.$setRotation(value);
        }
        public get rotation(): number {
            return this.$getRotation();
        }

        public $setRotation(value: number): void {
            value = MathUtil.clampRotation(value);
            if (value == this._rotation) {
                return;
            }
            let delta = value - this._rotation;
            let angle = delta / 180 * Math.PI;
            this._skewX += angle;
            this._skewY += angle;
            this._rotation = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getRotation(): number {
            return this._rotation;
        }

        /**
         * 水平方向斜切
         */
        public set skewX(value: number) {
            this.$setSkewX(value);
        }
        public get skewX(): number {
            return this.$getSkewX();
        }

        public $setSkewX(value: number): void {
            if (value == this._skewXdeg) {
                return;
            }
            this._skewXdeg = value;
            value = MathUtil.clampRotation(value);
            value = value / 180 * Math.PI;
            this._skewX = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getSkewX(): number {
            return this._skewXdeg;
        }

        /**
         * 垂直方向斜切
         */
        public set skewY(value: number) {
            this.$setSkewY(value);
        }
        public get skewY(): number {
            return this.$getSkewY();
        }

        public $setSkewY(value: number): void {
            if (value == this._skewYdeg) {
                return;
            }
            this._skewYdeg = value;
            value = MathUtil.clampRotation(value);
            value = (value + this._rotation) / 180 * Math.PI;
            this._skewY = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getSkewY(): number {
            return this._skewYdeg;
        }

        /**
         * 宽度
         */
        public set width(value: number) {
            this.$setWidth(value);
        }
        public get width(): number {
            return this.$getWidth();
        }

        public $setWidth(value: number): void {
            value = isNaN(value) ? NaN : value;
            if (this._explicitWidth == value) {
                return;
            }
            this._explicitWidth = value;
        }

        public $getWidth(): number {
            return isNaN(this._explicitWidth) ? this.$getOriginalBounds().width : this._explicitWidth;
        }

        /**
         * 高度
         */
        public set height(value: number) {
            this.$setHeight(value);
        }
        public get height(): number {
            return this.$getHeight();
        }

        public $setHeight(value: number): void {
            value = isNaN(value) ? NaN : value;
            if (this._explicitHeight == value) {
                return;
            }
            this._explicitHeight = value;
        }

        public $getHeight(): number {
            return isNaN(this._explicitHeight) ? this.$getOriginalBounds().height : this._explicitHeight;
        }

        /**
         * 测量宽度
         */
        public get measuredWidth(): number {
            return this.$getOriginalBounds().width;
        }

        /**
         * 测量高度
         */
        public get measuredHeight(): number {
            return this.$getOriginalBounds().height;
        }

        /**
         * x 轴锚点
         */
        public set anchorOffsetX(value: number) {
            this.$setAnchorOffsetX(value);
        }
        public get anchorOffsetX(): number {
            return this.$getAnchorOffsetX();
        }

        public $setAnchorOffsetX(value: number): void {
            if (this._anchorOffsetX == value) {
                return;
            }
            this._anchorOffsetX = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getAnchorOffsetX(): number {
            return this._anchorOffsetX;
        }

        /**
         * y 轴锚点
         */
        public set anchorOffsetY(value: number) {
            this.$setAnchorOffsetY(value);
        }
        public get anchorOffsetY(): number {
            return this.$getAnchorOffsetY();
        }

        public $setAnchorOffsetY(value: number): void {
            if (this._anchorOffsetY == value) {
                return;
            }
            this._anchorOffsetY = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getAnchorOffsetY(): number {
            return this._anchorOffsetY;
        }

        /**
         * 是否可见
         */
        public set visible(value: boolean) {
            this._visible = value;
            this.$setVisible(this._visible && !this._invisible);
        }
        public get visible(): boolean {
            return this._visible;
        }

        /**
         * 是否不可见
         */
        public set invisible(value: boolean) {
            this._invisible = value;
            this.$setVisible(this._visible && !this._invisible);
        }
        public get invisible(): boolean {
            return this._invisible;
        }

        /**
         * 最终是否可见
         */
        public get finalVisible(): boolean {
            return this.$getVisible();
        }

        public $setVisible(value: boolean): void {
            if (this._finalVisible == value) {
                return;
            }
            this._finalVisible = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            this.dispatchEvent2D(value ? Event2D.SHOWED : Event2D.HIDDEN);
        }

        public $getVisible(): boolean {
            return this._finalVisible;
        }

        /**
         * 透明度
         */
        public set alpha(value: number) {
            this.$setAlpha(value);
        }
        public get alpha(): number {
            return this.$getAlpha();
        }

        public $setAlpha(value: number): void {
            if (this._alpha == value) {
                return;
            }
            this._alpha = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getAlpha(): number {
            return this._alpha;
        }

        /**
         * 给当前对象设置填充色
         */
        public set tint(value) {
            this._tint = value;
            this.$tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        }
        public get tint(): number {
            return this._tint;
        }

        /**
         * 混合模式
         */
        public set blendMode(value: BlendMode) {
            this.$setBlendMode(value);
        }
        public get blendMode(): BlendMode {
            return this.$getBlendMode();
        }

        public $setBlendMode(value: BlendMode): void {
            if (this._blendMode == value) {
                return;
            }
            this._blendMode = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getBlendMode(): BlendMode {
            return this._blendMode;
        }

        /**
         * 显示对象的滚动矩形范围
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 显示对象被裁切为矩形定义的大小, 当您更改 scrollRect 对象的 x 和 y 属性时, 它会在矩形内滚动
         */
        public set scrollRect(value: Rectangle) {
            this.$setScrollRect(value);
        }
        public get scrollRect(): Rectangle {
            return this.$getScrollRect();
        }

        public $setScrollRect(value: Rectangle): void {
            if (!value && !this._scrollRect) {
                this.$updateRenderMode();
                return;
            }
            if (value) {
                if (!this._scrollRect) {
                    this._scrollRect = new Rectangle();
                }
                this._scrollRect.copy(value);
            }
            else {
                this._scrollRect = null;
            }
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getScrollRect(): Rectangle {
            return this._scrollRect;
        }

        /**
         * 当前对象的遮罩
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 如果遮罩是一个显示对象, 遮罩对象添加到舞台中不会进行绘制
         * * 如果遮罩是一个显示对象, 要确保当舞台缩放时蒙版仍然有效需要将该遮罩添加到显示列表中
         * * 如果遮罩是一个显示对象, 该遮罩对象不能用于遮罩多个执行调用的显示对象, 将其分配给第二个显示对象时, 会撤消其作为第一个对象的遮罩
         */
        public set mask(value: DisplayObject | Rectangle) {
            this.$setMask(value);
        }
        public get mask(): DisplayObject | Rectangle {
            return this.$getMask();
        }

        public $setMask(value: DisplayObject | Rectangle): void {
            if (value === this) {
                return;
            }
            if (value) {
                if (value instanceof DisplayObject) {
                    if (value == this.$mask) {
                        return;
                    }
                    if (value.$maskedObject) {
                        value.$maskedObject.mask = null;
                    }
                    value.$maskedObject = this;
                    this.$mask = value;
                    value.$updateRenderMode();
                    if (this.$maskRect) {
                        this.$maskRect = null;
                    }
                }
                else {
                    if (!this.$maskRect) {
                        this.$maskRect = new Rectangle();
                    }
                    this.$maskRect.copy(value);
                    if (this.$mask) {
                        this.$mask.$maskedObject = null;
                        this.$mask.$updateRenderMode();
                    }
                    if (this.mask) {
                        this.$mask = null;
                    }
                }
            }
            else {
                if (this.$mask) {
                    this.$mask.$maskedObject = null;
                    this.$mask.$updateRenderMode();
                }
                if (this.mask) {
                    this.$mask = null;
                }
                if (this.$maskRect) {
                    this.$maskRect = null;
                }
            }
            this.$updateRenderMode();
        }

        public $getMask(): DisplayObject | Rectangle {
            return this.$mask ? this.$mask : this.$maskRect;
        }

        /**
         * 包含当前与显示对象关联的每个滤镜对象的索引数组
         */
        public set filters(value: (Filter | CustomFilter)[]) {
            this.$setFilters(value);
        }
        public get filters(): (Filter | CustomFilter)[] {
            return this.$getFilters();
        }

        public $setFilters(value: (Filter | CustomFilter)[]): void {
            let filters = this._filters;
            if (!filters && !value) {
                this._filters = value;
                this.$updateRenderMode();
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
                return;
            }
            if (value && value.length) {
                value = value.concat();
                this._filters = value;
            }
            else {
                this._filters = value;
            }
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getFilters(): (Filter | CustomFilter)[] {
            return this._filters;
        }

        /**
         * 是否将当前的显示对象缓存为位图
         */
        public set cacheAsBitmap(value: boolean) {
            this._cacheAsBitmap = value;
            this.$setHasDisplayList(value);
        }
        public get cacheAsBitmap(): boolean {
            return this._cacheAsBitmap;
        }

        public $setHasDisplayList(value: boolean): void {
            let hasDisplayList = !!this.$displayList;
            if (hasDisplayList == value) {
                return;
            }
            if (value) {
                let displayList = rendering.DisplayList.create(this);
                if (displayList) {
                    this.$displayList = displayList;
                    this.$cacheDirty = true;
                }
            }
            else {
                this.$displayList = null;
            }
        }

        /**
         * 是否接收触摸事件
         */
        public set touchEnabled(value: boolean) {
            this.$setTouchEnabled(value);
        }
        public get touchEnabled(): boolean {
            return this.$getTouchEnabled();
        }

        public $setTouchEnabled(value: boolean): void {
            this._touchEnabled = !!value;
        }

        public $getTouchEnabled(): boolean {
            return this._touchEnabled;
        }

        /**
         * 指定的点击区域
         */
        public set hitArea(value: Rectangle) {
            this.$setHitArea(value);
        }
        public get hitArea(): Rectangle {
            return this.$getHitArea();
        }

        public $setHitArea(value: Rectangle): void {
            this._hitArea = value;
        }

        public $getHitArea(): Rectangle {
            return this._hitArea;
        }

        /**
         * 是否接受其它对象拖入
         */
        public set dropEnabled(value: boolean) {
            this.$setDropEnabled(value);
        }
        public get dropEnabled(): boolean {
            return this.$getDropEnabled();
        }

        public $setDropEnabled(value: boolean): void {
            if (this._dropEnabled == value) {
                return;
            }
            this._dropEnabled = value;
            DragManager.instance.$dropRegister(this, this._dropEnabled);
        }

        public $getDropEnabled(): boolean {
            return this._dropEnabled;
        }

        /**
         * 设置对象的 Z 轴顺序
         */
        public set zIndex(value: number) {
            this._zIndex = value;
            if (this.parent) {
                this.parent.$sortDirty = true;
            }
        }
        public get zIndex(): number {
            return this._zIndex;
        }

        /**
         * 允许对象使用 zIndex 排序
         */
        public set sortableChildren(value: boolean) {
            this._sortableChildren = value;
        }
        public get sortableChildren(): boolean {
            return this._sortableChildren;
        }

        /**
         * 显示对象添加到舞台
         */
        public $onAddToStage(stage: Stage, nestLevel: number): void {
            this._stage = stage;
            this._nestLevel = nestLevel;
            this.dispatchEvent2D(Event2D.ADDED_TO_STAGE);
        }

        /**
         * 显示对象从舞台移除
         */
        public $onRemoveFromStage(): void {
            this._nestLevel = 0;
            this._stage = null;
            this.dispatchEvent2D(Event2D.REMOVED_FROM_STAGE);
        }

        protected updateUseTransform(): void {
            if (this._scaleX == 1 && this._scaleY == 1 && this._skewX == 0 && this._skewY == 0) {
                this.$useTranslate = false;
            }
            else {
                this.$useTranslate = true;
            }
        }

        public $cacheDirtyUp(): void {
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
        }

        /**
         * 对子项进行排序
         */
        public sortChildren(): void {
            this.$sortDirty = false;
        }

        /**
         * 返回一个矩形，该矩形定义相对于 targetCoordinateSpace 对象坐标系的显示对象区域
         */
        public getTransformedBounds(targetCoordinateSpace: DisplayObject, result?: Rectangle): Rectangle {
            return this.$getTransformedBounds(targetCoordinateSpace, result);
        }

        /**
         * 获取显示对象的测量边界
         */
        public getBounds(result?: Rectangle, calculateAnchor: boolean = true): Rectangle {
            result = this.$getTransformedBounds(this, result);
            if (calculateAnchor) {
                if (this._anchorOffsetX != 0) {
                    result.x -= this._anchorOffsetX;
                }
                if (this._anchorOffsetY != 0) {
                    result.y -= this._anchorOffsetY;
                }
            }
            return result;
        }

        public $getTransformedBounds(targetCoordinateSpace: DisplayObject, result?: Rectangle): Rectangle {
            let bounds = this.$getOriginalBounds();
            if (!result) {
                result = new Rectangle();
            }
            result.copy(bounds);
            if (targetCoordinateSpace == this) {
                return result;
            }
            if (targetCoordinateSpace) {
                let m = dou.recyclable(Matrix);
                let invertedTargetMatrix = targetCoordinateSpace.$getInvertedConcatenatedMatrix();
                m.premultiply(invertedTargetMatrix, this.$getConcatenatedMatrix());
                m.transformBounds(result);
                m.recycle();
            } else {
                let m = this.$getConcatenatedMatrix();
                m.transformBounds(result);
            }
            return result;
        }

        /**
         * 从全局坐标转换为本地坐标
         */
        public globalToLocal(stageX: number = 0, stageY: number = 0, result?: Point): Point {
            let m = this.$getInvertedConcatenatedMatrix();
            return m.transformPoint(stageX, stageY, result);
        }

        /**
         * 将本地坐标转换为全局坐标
         */
        public localToGlobal(localX: number = 0, localY: number = 0, result?: Point): Point {
            let m = this.$getConcatenatedMatrix();
            return m.transformPoint(localX, localY, result);
        }

        /**
         * 获取显示对象占用的矩形区域, 通常包括自身绘制的测量区域, 如果是容器, 还包括所有子项占据的区域
         */
        public $getOriginalBounds(): Rectangle {
            let bounds = this.$getContentBounds();
            this.$measureChildBounds(bounds);
            let offset = this.$measureFiltersOffset(false);
            if (offset) {
                bounds.x += offset.minX;
                bounds.y += offset.minY;
                bounds.width += -offset.minX + offset.maxX;
                bounds.height += -offset.minY + offset.maxY;
            }
            return bounds;
        }

        /**
         * 获取显示对象自身占用的矩形区域
         */
        public $getContentBounds(): Rectangle {
            let bounds = tempRect;
            bounds.clear();
            this.$measureContentBounds(bounds);
            return bounds;
        }

        /**
         * 测量自身占用的矩形区域
         */
        public $measureContentBounds(bounds: Rectangle): void {
        }

        /**
         * 测量子项占用的矩形区域
         */
        public $measureChildBounds(bounds: Rectangle): void {
        }

        /**
         * 测量滤镜偏移量
         */
        private $measureFiltersOffset(fromParent: boolean): any {
            let display: DisplayObject = this;
            let minX = 0;
            let minY = 0;
            let maxX = 0;
            let maxY = 0;
            while (display) {
                let filters = display._filters;
                if (filters && filters.length) {
                    let length = filters.length;
                    for (let i = 0; i < length; i++) {
                        let filter = filters[i];
                        if (filter.type == "blur") {
                            let offsetX = (<BlurFilter>filter).blurX;
                            let offsetY = (<BlurFilter>filter).blurY;
                            minX -= offsetX;
                            minY -= offsetY;
                            maxX += offsetX;
                            maxY += offsetY;
                        }
                        else if (filter.type == "glow") {
                            let offsetX = (<GlowFilter>filter).blurX;
                            let offsetY = (<GlowFilter>filter).blurY;
                            minX -= offsetX;
                            minY -= offsetY;
                            maxX += offsetX;
                            maxY += offsetY;
                            let distance = (<DropShadowFilter>filter).distance || 0;
                            let angle = (<DropShadowFilter>filter).angle || 0;
                            let distanceX = 0;
                            let distanceY = 0;
                            if (distance != 0) {
                                distanceX = distance * Math.cos(angle);
                                if (distanceX > 0) {
                                    distanceX = Math.ceil(distanceX);
                                }
                                else {
                                    distanceX = Math.floor(distanceX);
                                }
                                distanceY = distance * Math.sin(angle);
                                if (distanceY > 0) {
                                    distanceY = Math.ceil(distanceY);
                                }
                                else {
                                    distanceY = Math.floor(distanceY);
                                }
                                minX += distanceX;
                                maxX += distanceX;
                                minY += distanceY;
                                maxY += distanceY;
                            }
                        }
                        else if (filter.type == "custom") {
                            let padding = (<CustomFilter>filter).padding;
                            minX -= padding;
                            minY -= padding;
                            maxX += padding;
                            maxY += padding;
                        }
                    }
                }
                if (fromParent) {
                    display = display._parent;
                }
                else {
                    display = null;
                }
            }
            minX = Math.min(minX, 0);
            minY = Math.min(minY, 0);
            maxX = Math.max(maxX, 0);
            maxY = Math.max(maxY, 0);
            return { minX, minY, maxX, maxY };
        }

        /**
         * 获取渲染节点
         */
        public $getRenderNode(): rendering.RenderNode {
            let node = this.$renderNode;
            if (!node) {
                return null;
            }
            if (this.$renderDirty) {
                node.cleanBeforeRender();
                this.$updateRenderNode();
                this.$renderDirty = false;
                node = this.$renderNode;
            }
            return node;
        }

        /**
         * 更新渲染模式
         */
        public $updateRenderMode(): void {
            if (!this._finalVisible || this._alpha <= 0 || this.$maskedObject) {
                this.$renderMode = rendering.RenderMode.none;
            }
            else if (this.filters && this.filters.length > 0) {
                this.$renderMode = rendering.RenderMode.filter;
            }
            else if (this._blendMode !== BlendMode.normal || (this.$mask && this.$mask._stage)) {
                this.$renderMode = rendering.RenderMode.clip;
            }
            else if (this._scrollRect || this.$maskRect) {
                this.$renderMode = rendering.RenderMode.scrollRect;
            }
            else {
                this.$renderMode = null;
            }
        }

        /**
         * 获取相对于指定根节点的连接矩阵
         */
        public $getConcatenatedMatrixAt(root: DisplayObject, matrix: Matrix): void {
            let invertMatrix = root.$getInvertedConcatenatedMatrix();
            // 缩放值为 0 逆矩阵无效
            if (invertMatrix.a === 0 || invertMatrix.d === 0) {
                let target: DisplayObject = this;
                let rootLevel = root._nestLevel;
                matrix.identity();
                while (target._nestLevel > rootLevel) {
                    let rect = target._scrollRect;
                    if (rect) {
                        let m = dou.recyclable(Matrix);
                        m.set(1, 0, 0, 1, -rect.x, -rect.y);
                        matrix.multiply(m);
                        m.recycle();
                    }
                    matrix.multiply(target.$getMatrix());
                    target = target._parent;
                }
            }
            else {
                matrix.premultiply(invertMatrix, matrix);
            }
        }

        /**
         * 更新渲染节点
         */
        public $updateRenderNode(): void {
        }

        /**
         * 碰撞检测, 检测舞台坐标下面最先碰撞到的显示对象
         */
        public $hitTest(stageX: number, stageY: number): DisplayObject {
            if (!this.$renderNode || !this._finalVisible || this._scaleX == 0 || this._scaleY == 0) {
                if (!this._hitArea) {
                    return null;
                }
            }
            let m = this.$getInvertedConcatenatedMatrix();
            // 防止父类影响子类
            if (m.a == 0 && m.b == 0 && m.c == 0 && m.d == 0) {
                if (!this._hitArea) {
                    return null;
                }
            }
            let bounds = this.$getContentBounds();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            if (this._hitArea) {
                if (this._hitArea.contains(localX, localY)) {
                    return this;
                }
                return null;
            }
            if (bounds.contains(localX, localY)) {
                // 容器已经检查过 scrollRect 和 mask, 避免重复对遮罩进行碰撞
                if (!this._children) {
                    let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
                    if (rect && !rect.contains(localX, localY)) {
                        return null;
                    }
                    if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                        return null;
                    }
                }
                return this;
            }
            return null;
        }

        /**
         * 碰撞检测
         * @param shapeFlag 是否开启精确碰撞检测
         */
        public hitTestPoint(x: number, y: number, shapeFlag?: boolean): boolean {
            if (!shapeFlag) {
                if (this._scaleX == 0 || this._scaleY == 0) {
                    return false;
                }
                let m = this.$getInvertedConcatenatedMatrix();
                let bounds = this.getBounds(null, false);
                let localX = m.a * x + m.c * y + m.tx;
                let localY = m.b * x + m.d * y + m.ty;
                if (bounds.contains(localX, localY)) {
                    // 这里不考虑设置 mask 的情况
                    let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
                    if (rect && !rect.contains(localX, localY)) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
            else {
                let m = this.$getInvertedConcatenatedMatrix();
                let localX = m.a * x + m.c * y + m.tx;
                let localY = m.b * x + m.d * y + m.ty;
                let data: number[] | Uint8Array;
                let displayList = this.$displayList;
                if (displayList) {
                    let buffer = displayList.renderBuffer;
                    try {
                        data = buffer.getPixels(localX - displayList.offsetX, localY - displayList.offsetY);
                    }
                    catch (e) {
                        console.error("Cross domains pictures can not get pixel information!");
                    }
                }
                else {
                    let buffer = sys.hitTestBuffer;
                    buffer.resize(3, 3);
                    let matrix = dou.recyclable(Matrix);
                    matrix.translate(1 - localX, 1 - localY);
                    sys.renderer.render(this, buffer, matrix);
                    matrix.recycle();
                    try {
                        data = buffer.getPixels(1, 1);
                    }
                    catch (e) {
                        console.error("Cross domains pictures can not get pixel information!");
                    }
                }
                if (data[3] === 0) {
                    return false;
                }
                return true;
            }
        }

        public removeSelf(): void {
            if (this._parent) {
                this._parent.removeChild(this);
            }
        }

        protected addEventListener(type: string, listener: Function, thisObj: any, once: boolean): boolean {
            let result = super.addEventListener(type, listener, thisObj, once);
            if (type == Event2D.ENTER_FRAME || type == Event2D.FIXED_ENTER_FRAME || type == Event2D.RENDER) {
                let list: DisplayObject[];
                if (type == Event2D.ENTER_FRAME) {
                    list = once ? sys.enterFrameOnceCallBackList : sys.enterFrameCallBackList;
                }
                else if (type == Event2D.FIXED_ENTER_FRAME) {
                    list = once ? sys.fixedEnterFrameOnceCallBackList : sys.fixedEnterFrameCallBackList;
                }
                else {
                    list = once ? sys.renderOnceCallBackList : sys.renderCallBackList;
                }
                list.pushUnique(this);
            }
            return result;
        }

        public willTrigger(type: string): boolean {
            let parent: DisplayObject = this;
            while (parent) {
                if (parent.has(type)) {
                    return true;
                }
                parent = parent._parent;
            }
            return false;
        }

        public dispatch(event: dou.Event): boolean {
            let needBubbles = false;
            if (event instanceof Event2D && event.bubbles) {
                needBubbles = true;
            }
            if (needBubbles) {
                let list = this.getPropagationList(this);
                event.$setTarget(this);
                this.dispatchPropagationEvent(event as Event2D, list);
                return !event.$isDefaultPrevented();
            }
            return super.dispatch(event);
        }

        protected getPropagationList(target: DisplayObject): DisplayObject[] {
            let list: DisplayObject[] = [];
            while (target) {
                list.push(target);
                target = target._parent;
            }
            return list;
        }

        protected dispatchPropagationEvent(event: Event2D, list: DisplayObject[]): void {
            for (let i = 0, len = list.length; i < len; i++) {
                let currentTarget = list[i];
                event.$setCurrentTarget(currentTarget);
                currentTarget.$notify(event);
                if (event.$isPropagationStopped()) {
                    break;
                }
            }
        }

        public off(type: string, listener: Function, thisObj?: any): void {
            super.off(type, listener, thisObj);
            if (type == Event2D.ENTER_FRAME || type == Event2D.FIXED_ENTER_FRAME || type == Event2D.RENDER) {
                let list: DisplayObject[];
                let listOnce: DisplayObject[];
                if (type == Event2D.ENTER_FRAME) {
                    list = sys.enterFrameCallBackList;
                    listOnce = sys.enterFrameOnceCallBackList;
                }
                else if (type == Event2D.FIXED_ENTER_FRAME) {
                    list = sys.fixedEnterFrameCallBackList;
                    listOnce = sys.fixedEnterFrameOnceCallBackList;
                }
                else {
                    list = sys.renderCallBackList;
                    listOnce = sys.renderOnceCallBackList;
                }
                list.remove(this);
                listOnce.remove(this);
            }
        }
    }
}
