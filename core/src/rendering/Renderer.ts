namespace dou2d.rendering {
    const blendModes = ["source-over", "lighter", "destination-out"];
    const defaultCompositeOp = "source-over";

    /**
     * 核心渲染类
     * @author wizardc
     */
    export class Renderer {
        private _renderBufferPool: RenderBuffer[] = [];

        /**
         * 渲染的嵌套层次, 0 表示在调用堆栈的最外层
         */
        private _nestLevel: number = 0;

        private _canvasRenderer: CanvasRenderer;
        private _canvasRenderBuffer: CanvasRenderBuffer;

        /**
         * 渲染一个显示对象
         * @param displayObject 要渲染的显示对象
         * @param buffer 渲染缓冲
         * @param matrix 要对显示对象整体叠加的变换矩阵
         * @returns drawCall 触发绘制的次数
         */
        public render(displayObject: DisplayObject, buffer: RenderBuffer, matrix: Matrix): number {
            this._nestLevel++;
            let webglBuffer = buffer;
            let webglBufferContext = webglBuffer.context;
            webglBufferContext.pushBuffer(webglBuffer);
            // 绘制显示对象
            webglBuffer.transform(matrix.a, matrix.b, matrix.c, matrix.d, 0, 0);
            this.drawDisplayObject(displayObject, webglBuffer, matrix.tx, matrix.ty, true);
            webglBufferContext.draw();
            let drawCall = webglBuffer.drawCalls;
            webglBuffer.onRenderFinish();
            webglBufferContext.popBuffer();
            let invert = dou.recyclable(Matrix);
            invert.inverse(matrix);
            webglBuffer.transform(invert.a, invert.b, invert.c, invert.d, 0, 0);
            invert.recycle();
            this._nestLevel--;
            if (this._nestLevel === 0) {
                // 最大缓存 6 个渲染缓冲
                if (this._renderBufferPool.length > 6) {
                    this._renderBufferPool.length = 6;
                }
                let length = this._renderBufferPool.length;
                for (let i = 0; i < length; i++) {
                    this._renderBufferPool[i].resize(0, 0);
                }
            }
            return drawCall;
        }

        /**
         * 绘制一个显示对象
         */
        private drawDisplayObject(displayObject: DisplayObject, buffer: RenderBuffer, offsetX: number, offsetY: number, isStage?: boolean): number {
            let drawCalls = 0;
            let node: RenderNode;
            let displayList = displayObject.$displayList;
            if (displayList && !isStage) {
                if (displayObject.$cacheDirty || displayObject.$renderDirty ||
                    displayList.canvasScaleX != DisplayList.canvasScaleX ||
                    displayList.canvasScaleY != DisplayList.canvasScaleY) {
                    drawCalls += displayList.drawToSurface();
                }
                node = displayList.renderNode;
            }
            else {
                if (displayObject.$renderDirty) {
                    node = displayObject.$getRenderNode();
                }
                else {
                    node = displayObject.$renderNode;
                }
            }
            displayObject.$cacheDirty = false;
            if (node) {
                drawCalls++;
                buffer.offsetX = offsetX;
                buffer.offsetY = offsetY;
                switch (node.type) {
                    case RenderNodeType.bitmapNode:
                        this.renderBitmap(<BitmapNode>node, buffer);
                        break;
                    case RenderNodeType.textNode:
                        this.renderText(<TextNode>node, buffer);
                        break;
                    case RenderNodeType.graphicsNode:
                        this.renderGraphics(<GraphicsNode>node, buffer);
                        break;
                    case RenderNodeType.groupNode:
                        this.renderGroup(<GroupNode>node, buffer);
                        break;
                    case RenderNodeType.normalBitmapNode:
                        this.renderNormalBitmap(<NormalBitmapNode>node, buffer);
                        break;
                }
                buffer.offsetX = 0;
                buffer.offsetY = 0;
            }
            if (displayList && !isStage) {
                return drawCalls;
            }
            let children = displayObject.$children;
            if (children) {
                if (displayObject.sortableChildren && displayObject.$sortDirty) {
                    // 绘制排序
                    displayObject.sortChildren();
                }
                let length = children.length;
                for (let i = 0; i < length; i++) {
                    let child = children[i];
                    let offsetX2: number;
                    let offsetY2: number;
                    let tempAlpha: number;
                    let tempTintColor: number;
                    if (child.alpha != 1) {
                        tempAlpha = buffer.globalAlpha;
                        buffer.globalAlpha *= child.alpha;
                    }
                    if (child.tint !== 0xFFFFFF) {
                        tempTintColor = buffer.globalTintColor;
                        buffer.globalTintColor = child.$tintRGB;
                    }
                    let savedMatrix: dou.Recyclable<Matrix>;
                    if (child.$useTranslate) {
                        let m = child.$getMatrix();
                        offsetX2 = offsetX + child.x;
                        offsetY2 = offsetY + child.y;
                        let m2 = buffer.globalMatrix;
                        savedMatrix = dou.recyclable(Matrix);
                        savedMatrix.a = m2.a;
                        savedMatrix.b = m2.b;
                        savedMatrix.c = m2.c;
                        savedMatrix.d = m2.d;
                        savedMatrix.tx = m2.tx;
                        savedMatrix.ty = m2.ty;
                        buffer.transform(m.a, m.b, m.c, m.d, offsetX2, offsetY2);
                        offsetX2 = -child.anchorOffsetX;
                        offsetY2 = -child.anchorOffsetY;
                    }
                    else {
                        offsetX2 = offsetX + child.x - child.anchorOffsetX;
                        offsetY2 = offsetY + child.y - child.anchorOffsetY;
                    }
                    switch (child.$renderMode) {
                        case RenderMode.none:
                            break;
                        case RenderMode.filter:
                            drawCalls += this.drawWithFilter(child, buffer, offsetX2, offsetY2);
                            break;
                        case RenderMode.clip:
                            drawCalls += this.drawWithClip(child, buffer, offsetX2, offsetY2);
                            break;
                        case RenderMode.scrollRect:
                            drawCalls += this.drawWithScrollRect(child, buffer, offsetX2, offsetY2);
                            break;
                        default:
                            drawCalls += this.drawDisplayObject(child, buffer, offsetX2, offsetY2);
                            break;
                    }
                    if (tempAlpha) {
                        buffer.globalAlpha = tempAlpha;
                    }
                    if (tempTintColor) {
                        buffer.globalTintColor = tempTintColor;
                    }
                    if (savedMatrix) {
                        let m = buffer.globalMatrix;
                        m.a = savedMatrix.a;
                        m.b = savedMatrix.b;
                        m.c = savedMatrix.c;
                        m.d = savedMatrix.d;
                        m.tx = savedMatrix.tx;
                        m.ty = savedMatrix.ty;
                        savedMatrix.recycle();
                    }
                }
            }
            return drawCalls;
        }

        private drawWithFilter(displayObject: DisplayObject, buffer: RenderBuffer, offsetX: number, offsetY: number): number {
            let drawCalls = 0;
            if (displayObject.$children && displayObject.$children.length == 0 && (!displayObject.$renderNode || displayObject.$renderNode.renderCount == 0)) {
                return drawCalls;
            }
            let filters = displayObject.filters;
            let hasBlendMode = (displayObject.blendMode !== BlendMode.normal);
            let compositeOp: string;
            if (hasBlendMode) {
                compositeOp = blendModes[displayObject.blendMode];
                if (!compositeOp) {
                    compositeOp = defaultCompositeOp;
                }
            }
            let displayBounds = displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
            let displayBoundsX = displayBounds.x;
            let displayBoundsY = displayBounds.y;
            let displayBoundsWidth = displayBounds.width;
            let displayBoundsHeight = displayBounds.height;
            if (displayBoundsWidth <= 0 || displayBoundsHeight <= 0) {
                return drawCalls;
            }
            if (!displayObject.mask && filters.length == 1 && (filters[0].type == "colorBrush" || filters[0].type == "colorTransform" || (filters[0].type === "custom" && (<CustomFilter>filters[0]).padding === 0))) {
                let childrenDrawCount = this.getRenderCount(displayObject);
                if (!displayObject.$children || childrenDrawCount == 1) {
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(compositeOp);
                    }
                    buffer.context.colorMatrixFilter = <ColorMatrixFilter>filters[0];
                    if (displayObject.$mask) {
                        drawCalls += this.drawWithClip(displayObject, buffer, offsetX, offsetY);
                    }
                    else if (displayObject.scrollRect || displayObject.$maskRect) {
                        drawCalls += this.drawWithScrollRect(displayObject, buffer, offsetX, offsetY);
                    }
                    else {
                        drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
                    }
                    buffer.context.colorMatrixFilter = null;
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                    }
                    return drawCalls;
                }
            }
            // 为显示对象创建一个新的 buffer
            let displayBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
            displayBuffer.context.pushBuffer(displayBuffer);
            if (displayObject.$mask) {
                drawCalls += this.drawWithClip(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
            }
            else if (displayObject.scrollRect || displayObject.$maskRect) {
                drawCalls += this.drawWithScrollRect(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
            }
            else {
                drawCalls += this.drawDisplayObject(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
            }
            displayBuffer.context.popBuffer();
            // 绘制结果到屏幕
            if (drawCalls > 0) {
                if (hasBlendMode) {
                    buffer.context.setGlobalCompositeOperation(compositeOp);
                }
                drawCalls++;
                // 绘制结果的时候, 应用滤镜
                buffer.offsetX = offsetX + displayBoundsX;
                buffer.offsetY = offsetY + displayBoundsY;
                let savedMatrix = dou.recyclable(Matrix);
                let curMatrix = buffer.globalMatrix;
                savedMatrix.a = curMatrix.a;
                savedMatrix.b = curMatrix.b;
                savedMatrix.c = curMatrix.c;
                savedMatrix.d = curMatrix.d;
                savedMatrix.tx = curMatrix.tx;
                savedMatrix.ty = curMatrix.ty;
                buffer.useOffset();
                buffer.context.drawTargetWidthFilters(filters, displayBuffer);
                curMatrix.a = savedMatrix.a;
                curMatrix.b = savedMatrix.b;
                curMatrix.c = savedMatrix.c;
                curMatrix.d = savedMatrix.d;
                curMatrix.tx = savedMatrix.tx;
                curMatrix.ty = savedMatrix.ty;
                savedMatrix.recycle();
                if (hasBlendMode) {
                    buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                }
            }
            this._renderBufferPool.push(displayBuffer);
            return drawCalls;
        }

        private getRenderCount(displayObject: DisplayObject): number {
            let drawCount = 0;
            let node = displayObject.$getRenderNode();
            if (node) {
                drawCount += node.renderCount;
            }
            if (displayObject.$children) {
                for (let child of displayObject.$children) {
                    let filters = child.filters;
                    // 特殊处理有滤镜的对象
                    if (filters && filters.length > 0) {
                        return 2;
                    }
                    else if (child.$children) {
                        drawCount += this.getRenderCount(child);
                    }
                    else {
                        let node = child.$getRenderNode();
                        if (node) {
                            drawCount += node.renderCount;
                        }
                    }
                }
            }
            return drawCount;
        }

        private drawWithClip(displayObject: DisplayObject, buffer: RenderBuffer, offsetX: number, offsetY: number): number {
            let drawCalls = 0;
            let hasBlendMode = displayObject.blendMode !== BlendMode.normal;
            let compositeOp: string;
            if (hasBlendMode) {
                compositeOp = blendModes[displayObject.blendMode];
                if (!compositeOp) {
                    compositeOp = defaultCompositeOp;
                }
            }
            let scrollRect = displayObject.scrollRect ? displayObject.scrollRect : displayObject.$maskRect;
            let mask = displayObject.$mask;
            if (mask) {
                let maskRenderMatrix = mask.$getMatrix();
                // 遮罩 scaleX 或 scaleY 为 0, 放弃绘制
                if ((maskRenderMatrix.a == 0 && maskRenderMatrix.b == 0) || (maskRenderMatrix.c == 0 && maskRenderMatrix.d == 0)) {
                    return drawCalls;
                }
            }
            // 没有遮罩, 同时显示对象没有子项
            if (!mask && (!displayObject.$children || displayObject.$children.length == 0)) {
                if (scrollRect) {
                    buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
                }
                // 绘制显示对象
                if (hasBlendMode) {
                    buffer.context.setGlobalCompositeOperation(compositeOp);
                }
                drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
                if (hasBlendMode) {
                    buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                }
                if (scrollRect) {
                    buffer.context.popMask();
                }
                return drawCalls;
            }
            else {
                let displayBounds = displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
                let displayBoundsX = displayBounds.x;
                let displayBoundsY = displayBounds.y;
                let displayBoundsWidth = displayBounds.width;
                let displayBoundsHeight = displayBounds.height;
                if (displayBoundsWidth <= 0 || displayBoundsHeight <= 0) {
                    return drawCalls;
                }
                // 绘制显示对象自身, 若有 scrollRect, 应用 clip
                let displayBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
                displayBuffer.context.pushBuffer(displayBuffer);
                drawCalls += this.drawDisplayObject(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
                // 绘制遮罩
                if (mask) {
                    let maskBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
                    maskBuffer.context.pushBuffer(maskBuffer);
                    let maskMatrix = dou.recyclable(Matrix);
                    maskMatrix.copy(mask.$getConcatenatedMatrix());
                    mask.$getConcatenatedMatrixAt(displayObject, maskMatrix);
                    maskMatrix.translate(-displayBoundsX, -displayBoundsY);
                    maskBuffer.setTransform(maskMatrix.a, maskMatrix.b, maskMatrix.c, maskMatrix.d, maskMatrix.tx, maskMatrix.ty);
                    maskMatrix.recycle();
                    drawCalls += this.drawDisplayObject(mask, maskBuffer, 0, 0);
                    maskBuffer.context.popBuffer();
                    displayBuffer.context.setGlobalCompositeOperation("destination-in");
                    displayBuffer.setTransform(1, 0, 0, -1, 0, maskBuffer.height);
                    let maskBufferWidth = maskBuffer.renderTarget.width;
                    let maskBufferHeight = maskBuffer.renderTarget.height;
                    displayBuffer.context.drawTexture(maskBuffer.renderTarget.texture, 0, 0, maskBufferWidth, maskBufferHeight, 0, 0, maskBufferWidth, maskBufferHeight, maskBufferWidth, maskBufferHeight);
                    displayBuffer.setTransform(1, 0, 0, 1, 0, 0);
                    displayBuffer.context.setGlobalCompositeOperation("source-over");
                    maskBuffer.setTransform(1, 0, 0, 1, 0, 0);
                    this._renderBufferPool.push(maskBuffer);
                }
                displayBuffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                displayBuffer.context.popBuffer();
                // 绘制结果到屏幕
                if (drawCalls > 0) {
                    drawCalls++;
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(compositeOp);
                    }
                    if (scrollRect) {
                        buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
                    }
                    let savedMatrix = dou.recyclable(Matrix);
                    let curMatrix = buffer.globalMatrix;
                    savedMatrix.a = curMatrix.a;
                    savedMatrix.b = curMatrix.b;
                    savedMatrix.c = curMatrix.c;
                    savedMatrix.d = curMatrix.d;
                    savedMatrix.tx = curMatrix.tx;
                    savedMatrix.ty = curMatrix.ty;
                    curMatrix.append(1, 0, 0, -1, offsetX + displayBoundsX, offsetY + displayBoundsY + displayBuffer.height);
                    let displayBufferWidth = displayBuffer.renderTarget.width;
                    let displayBufferHeight = displayBuffer.renderTarget.height;
                    buffer.context.drawTexture(displayBuffer.renderTarget.texture, 0, 0, displayBufferWidth, displayBufferHeight, 0, 0, displayBufferWidth, displayBufferHeight, displayBufferWidth, displayBufferHeight);
                    if (scrollRect) {
                        displayBuffer.context.popMask();
                    }
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                    }
                    let matrix = buffer.globalMatrix;
                    matrix.a = savedMatrix.a;
                    matrix.b = savedMatrix.b;
                    matrix.c = savedMatrix.c;
                    matrix.d = savedMatrix.d;
                    matrix.tx = savedMatrix.tx;
                    matrix.ty = savedMatrix.ty;
                    savedMatrix.recycle();
                }
                this._renderBufferPool.push(displayBuffer);
                return drawCalls;
            }
        }

        private drawWithScrollRect(displayObject: DisplayObject, buffer: RenderBuffer, offsetX: number, offsetY: number): number {
            let drawCalls = 0;
            let scrollRect = displayObject.scrollRect ? displayObject.scrollRect : displayObject.$maskRect;
            if (scrollRect.isEmpty()) {
                return drawCalls;
            }
            if (displayObject.scrollRect) {
                offsetX -= scrollRect.x;
                offsetY -= scrollRect.y;
            }
            let m = buffer.globalMatrix;
            let context = buffer.context;
            let scissor = false;
            // 有旋转的情况下不能使用 scissor
            if (buffer.hasScissor || m.b != 0 || m.c != 0) {
                buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
            }
            else {
                let a = m.a;
                let d = m.d;
                let tx = m.tx;
                let ty = m.ty;
                let x = scrollRect.x + offsetX;
                let y = scrollRect.y + offsetY;
                let xMax = x + scrollRect.width;
                let yMax = y + scrollRect.height;
                let minX: number, minY: number, maxX: number, maxY: number;
                // 优化, 通常情况下不缩放的对象占多数, 直接加上偏移量即可
                if (a == 1.0 && d == 1.0) {
                    minX = x + tx;
                    minY = y + ty;
                    maxX = xMax + tx;
                    maxY = yMax + ty;
                }
                else {
                    let x0 = a * x + tx;
                    let y0 = d * y + ty;
                    let x1 = a * xMax + tx;
                    let y1 = d * y + ty;
                    let x2 = a * xMax + tx;
                    let y2 = d * yMax + ty;
                    let x3 = a * x + tx;
                    let y3 = d * yMax + ty;
                    let tmp = 0;
                    if (x0 > x1) {
                        tmp = x0;
                        x0 = x1;
                        x1 = tmp;
                    }
                    if (x2 > x3) {
                        tmp = x2;
                        x2 = x3;
                        x3 = tmp;
                    }
                    minX = (x0 < x2 ? x0 : x2);
                    maxX = (x1 > x3 ? x1 : x3);
                    if (y0 > y1) {
                        tmp = y0;
                        y0 = y1;
                        y1 = tmp;
                    }
                    if (y2 > y3) {
                        tmp = y2;
                        y2 = y3;
                        y3 = tmp;
                    }
                    minY = (y0 < y2 ? y0 : y2);
                    maxY = (y1 > y3 ? y1 : y3);
                }
                context.enableScissor(minX, -maxY + buffer.height, maxX - minX, maxY - minY);
                scissor = true;
            }
            drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
            if (scissor) {
                context.disableScissor();
            }
            else {
                context.popMask();
            }
            return drawCalls;
        }

        private renderNormalBitmap(node: NormalBitmapNode, buffer: RenderBuffer): void {
            let image = node.image;
            if (!image) {
                return;
            }
            buffer.context.drawImage(image, node.sourceX, node.sourceY, node.sourceW, node.sourceH, node.drawX, node.drawY, node.drawW, node.drawH, node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
        }

        private renderBitmap(node: BitmapNode, buffer: RenderBuffer): void {
            let image = node.image;
            if (!image) {
                return;
            }
            let data = node.drawData;
            let length = data.length;
            let pos = 0;
            let m = node.matrix;
            let blendMode = node.blendMode;
            let alpha = node.alpha;
            let savedMatrix: dou.Recyclable<Matrix>;
            let offsetX: number;
            let offsetY: number;
            if (m) {
                savedMatrix = dou.recyclable(Matrix);
                let curMatrix = buffer.globalMatrix;
                savedMatrix.a = curMatrix.a;
                savedMatrix.b = curMatrix.b;
                savedMatrix.c = curMatrix.c;
                savedMatrix.d = curMatrix.d;
                savedMatrix.tx = curMatrix.tx;
                savedMatrix.ty = curMatrix.ty;
                offsetX = buffer.offsetX;
                offsetY = buffer.offsetY;
                buffer.useOffset();
                buffer.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
            }
            // 这里不考虑嵌套
            if (blendMode) {
                buffer.context.setGlobalCompositeOperation(blendModes[blendMode]);
            }
            let originAlpha: number;
            if (alpha == alpha) {
                originAlpha = buffer.globalAlpha;
                buffer.globalAlpha *= alpha;
            }
            if (node.filter) {
                buffer.context.colorMatrixFilter = node.filter;
                while (pos < length) {
                    buffer.context.drawImage(image, data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
                }
                buffer.context.colorMatrixFilter = null;
            }
            else {
                while (pos < length) {
                    buffer.context.drawImage(image, data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
                }
            }
            if (blendMode) {
                buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
            }
            if (alpha == alpha) {
                buffer.globalAlpha = originAlpha;
            }
            if (m) {
                let matrix = buffer.globalMatrix;
                matrix.a = savedMatrix.a;
                matrix.b = savedMatrix.b;
                matrix.c = savedMatrix.c;
                matrix.d = savedMatrix.d;
                matrix.tx = savedMatrix.tx;
                matrix.ty = savedMatrix.ty;
                buffer.offsetX = offsetX;
                buffer.offsetY = offsetY;
                savedMatrix.recycle();
            }
        }

        private renderText(node: TextNode, buffer: RenderBuffer): void {
            let width = node.width - node.x;
            let height = node.height - node.y;
            if (width <= 0 || height <= 0 || !width || !height || node.drawData.length == 0) {
                return;
            }
            let canvasScaleX = DisplayList.canvasScaleX;
            let canvasScaleY = DisplayList.canvasScaleY;
            let maxTextureSize = buffer.context.maxTextureSize;
            if (width * canvasScaleX > maxTextureSize) {
                canvasScaleX *= maxTextureSize / (width * canvasScaleX);
            }
            if (height * canvasScaleY > maxTextureSize) {
                canvasScaleY *= maxTextureSize / (height * canvasScaleY);
            }
            width *= canvasScaleX;
            height *= canvasScaleY;
            let x = node.x * canvasScaleX;
            let y = node.y * canvasScaleY;
            if (node.canvasScaleX != canvasScaleX || node.canvasScaleY != canvasScaleY) {
                node.canvasScaleX = canvasScaleX;
                node.canvasScaleY = canvasScaleY;
                node.dirtyRender = true;
            }
            if (!this._canvasRenderBuffer || !this._canvasRenderBuffer.context) {
                this._canvasRenderer = new CanvasRenderer();
                this._canvasRenderBuffer = new CanvasRenderBuffer(width, height);
            }
            else if (node.dirtyRender) {
                this._canvasRenderBuffer.resize(width, height);
            }
            if (!this._canvasRenderBuffer.context) {
                return;
            }
            if (canvasScaleX != 1 || canvasScaleY != 1) {
                this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
            }
            if (x || y) {
                if (node.dirtyRender) {
                    this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, -x, -y);
                }
                buffer.transform(1, 0, 0, 1, x / canvasScaleX, y / canvasScaleY);
            }
            else if (canvasScaleX != 1 || canvasScaleY != 1) {
                this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
            }
            if (node.dirtyRender) {
                let surface = this._canvasRenderBuffer.surface;
                this._canvasRenderer.renderText(node, this._canvasRenderBuffer.context);
                // 拷贝 canvas 到 texture
                let texture = node.texture;
                if (!texture) {
                    texture = buffer.context.createTexture(<any>surface);
                    node.texture = texture;
                } else {
                    // 重新拷贝新的图像
                    buffer.context.updateTexture(texture, <any>surface);
                }
                // 保存材质尺寸
                node.textureWidth = surface.width;
                node.textureHeight = surface.height;
            }
            let textureWidth = node.textureWidth;
            let textureHeight = node.textureHeight;
            buffer.context.drawTexture(node.texture, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth / canvasScaleX, textureHeight / canvasScaleY, textureWidth, textureHeight);
            if (x || y) {
                if (node.dirtyRender) {
                    this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
                }
                buffer.transform(1, 0, 0, 1, -x / canvasScaleX, -y / canvasScaleY);
            }
            node.dirtyRender = false;
        }

        private renderGraphics(node: GraphicsNode, buffer: RenderBuffer, forHitTest?: boolean): void {
            let width = node.width;
            let height = node.height;
            if (width <= 0 || height <= 0 || !width || !height || node.drawData.length == 0) {
                return;
            }
            let canvasScaleX = DisplayList.canvasScaleX;
            let canvasScaleY = DisplayList.canvasScaleY;
            if (width * canvasScaleX < 1 || height * canvasScaleY < 1) {
                canvasScaleX = canvasScaleY = 1;
            }
            if (node.canvasScaleX != canvasScaleX || node.canvasScaleY != canvasScaleY) {
                node.canvasScaleX = canvasScaleX;
                node.canvasScaleY = canvasScaleY;
                node.dirtyRender = true;
            }
            // 缩放叠加 width2 / width 填满整个区域
            width = width * canvasScaleX;
            height = height * canvasScaleY;
            let width2 = Math.ceil(width);
            let height2 = Math.ceil(height);
            canvasScaleX *= width2 / width;
            canvasScaleY *= height2 / height;
            width = width2;
            height = height2;
            if (!this._canvasRenderBuffer || !this._canvasRenderBuffer.context) {
                this._canvasRenderer = new CanvasRenderer();
                this._canvasRenderBuffer = new CanvasRenderBuffer(width, height);
            }
            else if (node.dirtyRender) {
                this._canvasRenderBuffer.resize(width, height);
            }
            if (!this._canvasRenderBuffer.context) {
                return;
            }
            if (canvasScaleX != 1 || canvasScaleY != 1) {
                this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
            }
            if (node.x || node.y) {
                if (node.dirtyRender || forHitTest) {
                    this._canvasRenderBuffer.context.translate(-node.x, -node.y);
                }
                buffer.transform(1, 0, 0, 1, node.x, node.y);
            }
            let surface = this._canvasRenderBuffer.surface;
            if (forHitTest) {
                this._canvasRenderer.renderGraphics(node, this._canvasRenderBuffer.context);
                let texture: WebGLTexture;
                WebGLUtil.deleteTexture(surface);
                texture = buffer.context.getTexture(<BitmapData><any>surface);
                buffer.context.drawTexture(texture, 0, 0, width, height, 0, 0, width, height, surface.width, surface.height);
            }
            else {
                if (node.dirtyRender) {
                    this._canvasRenderer.renderGraphics(node, this._canvasRenderBuffer.context);
                    // 拷贝 canvas 到 texture
                    let texture = node.texture;
                    if (!texture) {
                        texture = buffer.context.createTexture(<any>surface);
                        node.texture = texture;
                    }
                    else {
                        // 重新拷贝新的图像
                        buffer.context.updateTexture(texture, <any>surface);
                    }
                    // 保存材质尺寸
                    node.textureWidth = surface.width;
                    node.textureHeight = surface.height;
                }
                let textureWidth = node.textureWidth;
                let textureHeight = node.textureHeight;
                buffer.context.drawTexture(node.texture, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth / canvasScaleX, textureHeight / canvasScaleY, textureWidth, textureHeight);
            }
            if (node.x || node.y) {
                if (node.dirtyRender || forHitTest) {
                    this._canvasRenderBuffer.context.translate(node.x, node.y);
                }
                buffer.transform(1, 0, 0, 1, -node.x, -node.y);
            }
            if (!forHitTest) {
                node.dirtyRender = false;
            }
        }

        private renderGroup(groupNode: GroupNode, buffer: RenderBuffer): void {
            let m = groupNode.matrix;
            let savedMatrix: dou.Recyclable<Matrix>;
            let offsetX: number;
            let offsetY: number;
            if (m) {
                savedMatrix = dou.recyclable(Matrix);
                let curMatrix = buffer.globalMatrix;
                savedMatrix.a = curMatrix.a;
                savedMatrix.b = curMatrix.b;
                savedMatrix.c = curMatrix.c;
                savedMatrix.d = curMatrix.d;
                savedMatrix.tx = curMatrix.tx;
                savedMatrix.ty = curMatrix.ty;
                offsetX = buffer.offsetX;
                offsetY = buffer.offsetY;
                buffer.useOffset();
                buffer.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
            }
            let children = groupNode.drawData;
            let length = children.length;
            for (let i = 0; i < length; i++) {
                let node = children[i];
                this.renderNode(node, buffer, buffer.offsetX, buffer.offsetY);
            }
            if (m) {
                let matrix = buffer.globalMatrix;
                matrix.a = savedMatrix.a;
                matrix.b = savedMatrix.b;
                matrix.c = savedMatrix.c;
                matrix.d = savedMatrix.d;
                matrix.tx = savedMatrix.tx;
                matrix.ty = savedMatrix.ty;
                buffer.offsetX = offsetX;
                buffer.offsetY = offsetY;
                savedMatrix.recycle();
            }
        }

        private renderNode(node: RenderNode, buffer: RenderBuffer, offsetX: number, offsetY: number, forHitTest?: boolean): void {
            buffer.offsetX = offsetX;
            buffer.offsetY = offsetY;
            switch (node.type) {
                case RenderNodeType.bitmapNode:
                    this.renderBitmap(<BitmapNode>node, buffer);
                    break;
                case RenderNodeType.textNode:
                    this.renderText(<TextNode>node, buffer);
                    break;
                case RenderNodeType.graphicsNode:
                    this.renderGraphics(<GraphicsNode>node, buffer, forHitTest);
                    break;
                case RenderNodeType.groupNode:
                    this.renderGroup(<GroupNode>node, buffer);
                    break;
                case RenderNodeType.normalBitmapNode:
                    this.renderNormalBitmap(<NormalBitmapNode>node, buffer);
                    break;
            }
        }

        private createRenderBuffer(width: number, height: number): RenderBuffer {
            let buffer = this._renderBufferPool.pop();
            if (buffer) {
                buffer.resize(width, height);
            }
            else {
                buffer = new RenderBuffer(width, height);
                buffer.computeDrawCall = false;
            }
            return buffer;
        }
    }
}
