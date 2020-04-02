namespace dou2d {
    /**
     * 显示对象容器
     * @author wizardc
     */
    export class DisplayObjectContainer extends DisplayObject {
        protected _touchChildren: boolean = true;

        public constructor() {
            super();
            this._children = [];
        }

        /**
         * 子项数量
         */
        public get numChildren(): number {
            return this._children.length;
        }

        /**
         * 确定对象的子级是否支持触摸事件
         */
        public set touchChildren(value: boolean) {
            this.$setTouchChildren(!!value);
        }
        public get touchChildren(): boolean {
            return this.$getTouchChildren();
        }

        public $setTouchChildren(value: boolean): boolean {
            if (this._touchChildren == value) {
                return false;
            }
            this._touchChildren = value;
            return true;
        }

        public $getTouchChildren(): boolean {
            return this._touchChildren;
        }

        public $onAddToStage(stage: Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            let children = this._children;
            let length = children.length;
            nestLevel++;
            for (let i = 0; i < length; i++) {
                let child = this._children[i];
                child.$onAddToStage(stage, nestLevel);
                if (child.$maskedObject) {
                    child.$maskedObject.$updateRenderMode();
                }
            }
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            let children = this._children;
            let length = children.length;
            for (let i = 0; i < length; i++) {
                let child = children[i];
                child.$onRemoveFromStage();
            }
        }

        /**
         * 添加一个显示对象
         */
        public addChild(child: DisplayObject): DisplayObject {
            let index = this._children.length;
            if (child.parent == this) {
                index--;
            }
            return this.$doAddChild(child, index);
        }

        /**
         * 添加一个显示对象到指定的索引
         */
        public addChildAt(child: DisplayObject, index: number): DisplayObject {
            index = +index | 0;
            if (index < 0 || index >= this._children.length) {
                index = this._children.length;
                if (child.parent == this) {
                    index--;
                }
            }
            return this.$doAddChild(child, index);
        }

        public $doAddChild(child: DisplayObject, index: number, notifyListeners: boolean = true): DisplayObject {
            if (DEBUG) {
                if (child == this) {
                    throw new Error("An object cannot be added as a child of itthis.");
                }
                else if ((child instanceof DisplayObjectContainer) && (<DisplayObjectContainer>child).contains(this)) {
                    throw new Error("An object cannot be added as a child to one of it's children (or children's children, etc.).");
                }
            }
            let host = child.parent;
            if (host == this) {
                this.doSetChildIndex(child, index);
                return child;
            }
            if (host) {
                host.removeChild(child);
            }
            this._children.splice(index, 0, child);
            child.$setParent(this);
            let stage = this._stage;
            // 当前容器在舞台
            if (stage) {
                child.$onAddToStage(stage, this._nestLevel + 1);
            }
            if (notifyListeners) {
                child.dispatchEvent2D(Event2D.ADDED, null, true);
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
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
            this.$childAdded(child, index);
            return child;
        }

        /**
         * 一个子项被添加到容器内
         */
        public $childAdded(child: DisplayObject, index: number): void {
        }

        /**
         * 返回指定显示对象是否被包含
         * * 搜索包括整个显示列表, 孙项, 曾孙项等
         */
        public contains(child: DisplayObject): boolean {
            while (child) {
                if (child == this) {
                    return true;
                }
                child = child.parent;
            }
            return false;
        }

        /**
         * 返回位于指定索引处的子显示对象实例
         */
        public getChildAt(index: number): DisplayObject {
            index = +index | 0;
            if (index >= 0 && index < this._children.length) {
                return this._children[index];
            }
            return null;
        }

        /**
         * 返回子显示对象实例的索引位置
         */
        public getChildIndex(child: DisplayObject): number {
            return this._children.indexOf(child);
        }

        /**
         * 返回具有指定名称的子显示对象
         * 如果多个子显示对象具有指定名称, 则该方法会返回子级列表中的第一个对象
         */
        public getChildByName(name: string): DisplayObject {
            let children = this._children;
            let length = children.length;
            let displayObject: DisplayObject;
            for (let i = 0; i < length; i++) {
                displayObject = children[i];
                if (displayObject.name == name) {
                    return displayObject;
                }
            }
            return null;
        }

        /**
         * 更改现有子项在显示对象容器中的位置
         */
        public setChildIndex(child: DisplayObject, index: number): void {
            index = +index | 0;
            if (index < 0 || index >= this._children.length) {
                index = this._children.length - 1;
            }
            this.doSetChildIndex(child, index);
        }

        private doSetChildIndex(child: DisplayObject, index: number): void {
            let lastIndex = this._children.indexOf(child);
            if (lastIndex < 0) {
                if (DEBUG) {
                    throw new Error("The supplied DisplayObject must be a child of the caller.");
                }
            }
            if (lastIndex == index) {
                return;
            }
            this.$childRemoved(child, lastIndex);
            // 从原来的位置删除
            this._children.splice(lastIndex, 1);
            // 放到新的位置
            this._children.splice(index, 0, child);
            this.$childAdded(child, index);
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
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
        }

        /**
         * 在子级列表中两个指定的索引位置
         */
        public swapChildrenAt(index1: number, index2: number): void {
            index1 = +index1 | 0;
            index2 = +index2 | 0;
            if (index1 >= 0 && index1 < this._children.length && index2 >= 0 && index2 < this._children.length) {
                this.doSwapChildrenAt(index1, index2);
            }
        }

        /**
         * 交换两个指定子对象的 Z 轴顺序
         */
        public swapChildren(child1: DisplayObject, child2: DisplayObject): void {
            let index1 = this._children.indexOf(child1);
            let index2 = this._children.indexOf(child2);
            if (index1 != -1 && index2 != -1) {
                this.doSwapChildrenAt(index1, index2);
            }
        }

        private doSwapChildrenAt(index1: number, index2: number): void {
            if (index1 > index2) {
                let temp = index2;
                index2 = index1;
                index1 = temp;
            }
            else if (index1 == index2) {
                return;
            }
            let list = this._children;
            let child1 = list[index1];
            let child2 = list[index2];
            this.$childRemoved(child1, index1);
            this.$childRemoved(child2, index2);
            list[index1] = child2;
            list[index2] = child1;
            this.$childAdded(child2, index1);
            this.$childAdded(child1, index2);
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
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
        }

        /**
         * 移除指定的子显示对象
         */
        public removeChild(child: DisplayObject): DisplayObject {
            let index = this._children.indexOf(child);
            if (index >= 0) {
                return this.$doRemoveChild(index);
            }
            return null;
        }

        /**
         * 移除指定索引的子显示对象
         */
        public removeChildAt(index: number): DisplayObject {
            index = +index | 0;
            if (index >= 0 && index < this._children.length) {
                return this.$doRemoveChild(index);
            }
            return null;
        }

        public $doRemoveChild(index: number, notifyListeners: boolean = true): DisplayObject {
            index = +index | 0;
            let children = this._children;
            let child = children[index];
            this.$childRemoved(child, index);
            if (notifyListeners) {
                child.dispatchEvent2D(Event2D.REMOVED, null, true);
            }
            // 在舞台上
            if (this._stage) {
                child.$onRemoveFromStage();
            }
            child.$setParent(null);
            let indexNow = children.indexOf(child);
            if (indexNow != -1) {
                children.splice(indexNow, 1);
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
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
            return child;
        }

        /**
         * 移除所有的子项
         */
        public removeChildren(): void {
            let children = this._children;
            for (let i = children.length - 1; i >= 0; i--) {
                this.$doRemoveChild(i);
            }
        }

        /**
         * 一个子项从容器内移除
         */
        public $childRemoved(child: DisplayObject, index: number): void {
        }

        public $measureChildBounds(bounds: Rectangle): void {
            let children = this._children;
            let length = children.length;
            if (length == 0) {
                return;
            }
            let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
            let found = false;
            let rect = dou.recyclable(Rectangle);
            for (let i = -1; i < length; i++) {
                let childBounds: Rectangle;
                if (i == -1) {
                    childBounds = bounds;
                }
                else {
                    children[i].getBounds(rect);
                    children[i].$getMatrix().transformBounds(rect);
                    childBounds = rect;
                }
                if (childBounds.isEmpty()) {
                    continue;
                }
                if (found) {
                    xMin = Math.min(xMin, childBounds.x);
                    xMax = Math.max(xMax, childBounds.x + childBounds.width);
                    yMin = Math.min(yMin, childBounds.y);
                    yMax = Math.max(yMax, childBounds.y + childBounds.height);
                }
                else {
                    found = true;
                    xMin = childBounds.x;
                    xMax = xMin + childBounds.width;
                    yMin = childBounds.y;
                    yMax = yMin + childBounds.height;
                }
            }
            rect.recycle();
            bounds.set(xMin, yMin, xMax - xMin, yMax - yMin);
        }

        public $hitTest(stageX: number, stageY: number): DisplayObject {
            if (!this._finalVisible) {
                return null;
            }
            let m = this.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            if (this._hitArea) {
                if (this._hitArea.contains(localX, localY)) {
                    return this;
                }
                return null;
            }
            let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
            if (rect && !rect.contains(localX, localY)) {
                return null;
            }
            if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                return null;
            }
            let children = this._children;
            let found = false;
            let target: DisplayObject;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.$maskedObject) {
                    continue;
                }
                target = child.$hitTest(stageX, stageY);
                if (target) {
                    found = true;
                    if (target.touchEnabled) {
                        break;
                    }
                    else {
                        target = null;
                    }
                }
            }
            if (target) {
                if (this._touchChildren) {
                    return target;
                }
                return this;
            }
            if (found) {
                return this;
            }
            return super.$hitTest(stageX, stageY);
        }

        public sortChildren(): void {
            // 关掉脏的标记
            super.sortChildren();
            this.$sortDirty = false;
            // 准备重新排序
            let sortRequired = false;
            const children = this._children;
            let child: DisplayObject;
            for (let i = 0, j = children.length; i < j; ++i) {
                child = children[i];
                child.$lastSortedIndex = i;
                if (!sortRequired && child.zIndex !== 0) {
                    sortRequired = true;
                }
            }
            if (sortRequired && children.length > 1) {
                children.sort(this._sortChildrenFunc);
            }
        }

        private _sortChildrenFunc(a: DisplayObject, b: DisplayObject): number {
            if (a.zIndex === b.zIndex) {
                return a.$lastSortedIndex - b.$lastSortedIndex;
            }
            return a.zIndex - b.zIndex;
        }
    }
}
