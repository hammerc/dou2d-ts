namespace dou2d {
    /**
     * 显示对象容器
     * @author wizardc
     */
    export class DisplayObjectContainer extends DisplayObject {
        static $EVENT_ADD_TO_STAGE_LIST: DisplayObject[] = [];
        static $EVENT_REMOVE_FROM_STAGE_LIST: DisplayObject[] = [];

        /**
         * 实例化一个容器
         */
        public constructor() {
            super();
            this.$children = [];
        }

        /**
         * 返回此对象的子项数目。
         */
        public get numChildren(): number {
            return this.$children.length;
        }

        /**
         * 设置子项目的排序方式
         */
        public setChildrenSortMode(value: string): void {
        }

        /**
         * 将一个 DisplayObject 子实例添加到该 DisplayObjectContainer 实例中。子项将被添加到该 DisplayObjectContainer 实例中其他
         * 所有子项的前（上）面。（要将某子项添加到特定索引位置，请使用 addChildAt() 方法。）
         * @param child 要作为该 DisplayObjectContainer 实例的子项添加的 DisplayObject 实例。
         * @returns 在 child 参数中传递的 DisplayObject 实例。
         */
        public addChild(child: DisplayObject): DisplayObject {
            let index: number = this.$children.length;

            if (child.$parent == this)
                index--;
            return this.$doAddChild(child, index);
        }

        /**
         * 将一个 DisplayObject 子实例添加到该 DisplayObjectContainer 实例中。该子项将被添加到指定的索引位置。索引为 0 表示该
         * DisplayObjectContainer 对象的显示列表的后（底）部。如果添加一个已将其它显示对象容器作为父项的子对象，则会从其它显示对象容器的子列表中删除该对象。
         * @param child 要作为该 DisplayObjectContainer 实例的子项添加的 DisplayObject 实例。
         * @param index 添加该子项的索引位置。 如果指定当前占用的索引位置，则该位置以及所有更高位置上的子对象会在子级列表中上移一个位置。
         * @returns 在 child 参数中传递的 DisplayObject 实例。
         */
        public addChildAt(child: DisplayObject, index: number): DisplayObject {
            index = +index | 0;
            if (index < 0 || index >= this.$children.length) {
                index = this.$children.length;
                if (child.$parent == this) {
                    index--;
                }
            }
            return this.$doAddChild(child, index);
        }

        $doAddChild(child: DisplayObject, index: number, notifyListeners: boolean = true): DisplayObject {
            let self = this;
            if (DEBUG) {
                if (child == self) {
                    $error(1005);
                }
                else if ((child instanceof DisplayObjectContainer) && (<DisplayObjectContainer>child).contains(self)) {
                    $error(1004);
                }
            }

            let host: DisplayObjectContainer = child.$parent;
            if (host == self) {
                self.doSetChildIndex(child, index);
                return child;
            }

            if (host) {
                host.removeChild(child);
            }

            self.$children.splice(index, 0, child);
            child.$setParent(self);

            let stage: Stage = self.$stage;
            if (stage) {//当前容器在舞台
                child.$onAddToStage(stage, self.$nestLevel + 1);
            }
            if (notifyListeners) {
                child.dispatchEventWith(Event.ADDED, true);
            }
            if (stage) {
                let list = DisplayObjectContainer.$EVENT_ADD_TO_STAGE_LIST;
                while (list.length) {
                    let childAddToStage = list.shift();
                    if (childAddToStage.$stage && notifyListeners) {
                        childAddToStage.dispatchEventWith(Event.ADDED_TO_STAGE);
                    }
                }
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!self.$cacheDirty) {
                self.$cacheDirty = true;
                let p = self.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = self.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }

            this.$childAdded(child, index);
            return child;
        }

        /**
         * 确定指定显示对象是 DisplayObjectContainer 实例的子项或该实例本身。搜索包括整个显示列表（其中包括此 DisplayObjectContainer 实例）。
         * 孙项、曾孙项等，每项都返回 true。
         * @param child 要测试的子对象。
         * @returns 如果 child 对象是 DisplayObjectContainer 的子项或容器本身，则为 true；否则为 false。
         */
        public contains(child: DisplayObject): boolean {
            while (child) {
                if (child == this) {
                    return true;
                }
                child = child.$parent;
            }
            return false;
        }

        /**
         * 返回位于指定索引处的子显示对象实例。
         * @param index 子对象的索引位置。
         * @returns 位于指定索引位置处的子显示对象。
         */
        public getChildAt(index: number): DisplayObject {
            index = +index | 0;
            if (index >= 0 && index < this.$children.length) {
                return this.$children[index];
            }
            else {
                DEBUG && $error(1007);
                return null;
            }
        }

        /**
         * 返回 DisplayObject 的 child 实例的索引位置。
         * @param child 要测试的子对象。
         * @returns 要查找的子显示对象的索引位置。
         */
        public getChildIndex(child: DisplayObject): number {
            return this.$children.indexOf(child);
        }

        /**
         * 返回具有指定名称的子显示对象。如果多个子显示对象具有指定名称，则该方法会返回子级列表中的第一个对象。
         * getChildAt() 方法比 getChildByName() 方法快。getChildAt() 方法从缓存数组中访问子项，而 getChildByName() 方法则必须遍历链接的列表来访问子项。
         * @param name 要返回的子项的名称。
         * @returns 具有指定名称的子显示对象。
         */
        public getChildByName(name: string): DisplayObject {
            let children = this.$children;
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
         * 从 DisplayObjectContainer 实例的子列表中删除指定的 child DisplayObject 实例。将已删除子项的 parent 属性设置为 null；
         * 如果不存在对该子项的任何其它引用，则将该对象作为垃圾回收。DisplayObjectContainer 中该子项之上的任何显示对象的索引位置都减去 1。
         * @param child 要删除的 DisplayObject 实例。
         * @returns 在 child 参数中传递的 DisplayObject 实例。
         */
        public removeChild(child: DisplayObject): DisplayObject {
            let index = this.$children.indexOf(child);
            if (index >= 0) {
                return this.$doRemoveChild(index);
            }
            else {
                DEBUG && $error(1006);
                return null;
            }
        }

        /**
         * 从 DisplayObjectContainer 的子列表中指定的 index 位置删除子 DisplayObject。将已删除子项的 parent 属性设置为 null；
         * 如果没有对该子项的任何其他引用，则将该对象作为垃圾回收。DisplayObjectContainer 中该子项之上的任何显示对象的索引位置都减去 1。
         * @param index 要删除的 DisplayObject 的子索引。
         * @returns 已删除的 DisplayObject 实例。
         */
        public removeChildAt(index: number): DisplayObject {
            index = +index | 0;
            if (index >= 0 && index < this.$children.length) {
                return this.$doRemoveChild(index);
            }
            else {
                DEBUG && $error(1007);
                return null;
            }
        }

        $doRemoveChild(index: number, notifyListeners: boolean = true): DisplayObject {
            index = +index | 0;
            let self = this;
            let children = this.$children;
            let child: DisplayObject = children[index];
            this.$childRemoved(child, index);
            if (notifyListeners) {
                child.dispatchEventWith(Event.REMOVED, true);
            }
            if (this.$stage) {//在舞台上
                child.$onRemoveFromStage();
                let list = DisplayObjectContainer.$EVENT_REMOVE_FROM_STAGE_LIST
                while (list.length > 0) {
                    let childAddToStage = list.shift();
                    if (notifyListeners && childAddToStage.$hasAddToStage) {
                        childAddToStage.$hasAddToStage = false;
                        childAddToStage.dispatchEventWith(Event.REMOVED_FROM_STAGE);
                    }
                    childAddToStage.$hasAddToStage = false;
                    childAddToStage.$stage = null;
                }
            }
            let displayList = this.$displayList || this.$parentDisplayList;
            child.$setParent(null);
            let indexNow = children.indexOf(child);
            if (indexNow != -1) {
                children.splice(indexNow, 1);
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!self.$cacheDirty) {
                self.$cacheDirty = true;
                let p = self.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = self.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            return child;
        }

        /**
         * 更改现有子项在显示对象容器中的位置。这会影响子对象的分层。
         * @param child 要为其更改索引编号的 DisplayObject 子实例。
         * @param index 生成的 child 显示对象的索引编号。当新的索引编号小于0或大于已有子元件数量时，新加入的DisplayObject对象将会放置于最上层。
         */
        public setChildIndex(child: DisplayObject, index: number): void {
            index = +index | 0;
            if (index < 0 || index >= this.$children.length) {
                index = this.$children.length - 1;
            }
            this.doSetChildIndex(child, index);
        }

        private doSetChildIndex(child: DisplayObject, index: number): void {
            let self = this;
            let lastIndex = this.$children.indexOf(child);
            if (lastIndex < 0) {
                DEBUG && $error(1006);
            }
            if (lastIndex == index) {
                return;
            }
            this.$childRemoved(child, lastIndex);
            //从原来的位置删除
            this.$children.splice(lastIndex, 1);
            //放到新的位置
            this.$children.splice(index, 0, child);
            this.$childAdded(child, index);
            if (!self.$cacheDirty) {
                self.$cacheDirty = true;
                let p = self.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = self.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }

        /**
         * 在子级列表中两个指定的索引位置，交换子对象的 Z 轴顺序（前后顺序）。显示对象容器中所有其他子对象的索引位置保持不变。
         * @param index1 第一个子对象的索引位置。
         * @param index2 第二个子对象的索引位置。
         */
        public swapChildrenAt(index1: number, index2: number): void {
            index1 = +index1 | 0;
            index2 = +index2 | 0;
            if (index1 >= 0 && index1 < this.$children.length && index2 >= 0 && index2 < this.$children.length) {
                this.doSwapChildrenAt(index1, index2);
            }
            else {
                DEBUG && $error(1007);
            }
        }

        /**
         * 交换两个指定子对象的 Z 轴顺序（从前到后顺序）。显示对象容器中所有其他子对象的索引位置保持不变。
         * @param child1 第一个子对象。
         * @param child2 第二个子对象。
         */
        public swapChildren(child1: DisplayObject, child2: DisplayObject): void {
            let index1 = this.$children.indexOf(child1);
            let index2 = this.$children.indexOf(child2);
            if (index1 == -1 || index2 == -1) {
                DEBUG && $error(1006);
            }
            else {
                this.doSwapChildrenAt(index1, index2);
            }
        }

        private doSwapChildrenAt(index1: number, index2: number): void {
            let self = this;
            if (index1 > index2) {
                let temp = index2;
                index2 = index1;
                index1 = temp;
            }
            else if (index1 == index2) {
                return;
            }
            let list: Array<DisplayObject> = this.$children;
            let child1: DisplayObject = list[index1];
            let child2: DisplayObject = list[index2];
            this.$childRemoved(child1, index1);
            this.$childRemoved(child2, index2);
            list[index1] = child2;
            list[index2] = child1;
            this.$childAdded(child2, index1);
            this.$childAdded(child1, index2);
            if (!self.$cacheDirty) {
                self.$cacheDirty = true;
                let p = self.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = self.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }

        /**
         * 从 DisplayObjectContainer 实例的子级列表中删除所有 child DisplayObject 实例。
         */
        public removeChildren(): void {
            let children = this.$children;
            for (let i: number = children.length - 1; i >= 0; i--) {
                this.$doRemoveChild(i);
            }
        }

        /**
         * 一个子项被添加到容器内，此方法不仅在操作addChild()时会被回调，在操作setChildIndex()或swapChildren时也会回调。
         * 当子项索引发生改变时，会先触发$childRemoved()方法，然后触发$childAdded()方法。
         */
        $childAdded(child: DisplayObject, index: number): void {
        }

        /**
         * 一个子项从容器内移除，此方法不仅在操作removeChild()时会被回调，在操作setChildIndex()或swapChildren时也会回调。
         * 当子项索引发生改变时，会先触发$childRemoved()方法，然后触发$childAdded()方法。
         */
        $childRemoved(child: DisplayObject, index: number): void {
        }

        $onAddToStage(stage: Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            let children = this.$children;
            let length = children.length;
            nestLevel++;
            for (let i = 0; i < length; i++) {
                let child: DisplayObject = this.$children[i];
                child.$onAddToStage(stage, nestLevel);
                if (child.$maskedObject) {
                    child.$maskedObject.$updateRenderMode();
                }
            }
        }

        $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            let children = this.$children;
            let length = children.length;
            for (let i = 0; i < length; i++) {
                let child: DisplayObject = children[i];
                child.$onRemoveFromStage();
            }
        }

        $measureChildBounds(bounds: Rectangle): void {
            let children = this.$children;
            let length = children.length;
            if (length == 0) {
                return;
            }
            let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
            let found: boolean = false;
            for (let i = -1; i < length; i++) {
                let childBounds;
                if (i == -1) {
                    childBounds = bounds;
                }
                else {
                    children[i].getBounds($TempRectangle);
                    children[i].$getMatrix().$transformBounds($TempRectangle);
                    childBounds = $TempRectangle;
                }
                if (childBounds.isEmpty()) {
                    continue;
                }
                if (found) {
                    xMin = Math.min(xMin, childBounds.x)
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
            bounds.setTo(xMin, yMin, xMax - xMin, yMax - yMin);
        }

        $touchChildren: boolean = true;

        /**
         * 确定对象的子级是否支持触摸或用户输入设备。如果对象支持触摸或用户输入设备，用户可以通过使用触摸或用户输入设备与之交互。
         */
        public get touchChildren(): boolean {
            return this.$getTouchChildren();
        }

        $getTouchChildren(): boolean {
            return this.$touchChildren;
        }

        public set touchChildren(value: boolean) {
            this.$setTouchChildren(!!value);
        }

        $setTouchChildren(value: boolean): boolean {
            if (this.$touchChildren == value) {
                return false;
            }
            this.$touchChildren = value;
            return true;
        }

        $hitTest(stageX: number, stageY: number): DisplayObject {
            if (!this.$visible) {
                return null;
            }
            let m = this.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;

            let rect = this.$scrollRect ? this.$scrollRect : this.$maskRect;
            if (rect && !rect.contains(localX, localY)) {
                return null;
            }

            if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                return null
            }
            const children = this.$children;
            let found = false;
            let target: DisplayObject = null;
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child.$maskedObject) {
                    continue;
                }
                target = child.$hitTest(stageX, stageY);
                if (target) {
                    found = true;
                    if (target.$touchEnabled) {
                        break;
                    }
                    else {
                        target = null;
                    }
                }
            }
            if (target) {
                if (this.$touchChildren) {
                    return target;
                }
                return this;
            }
            if (found) {
                return this;
            }
            return super.$hitTest(stageX, stageY);
        }

        private _sortChildrenFunc(a: DisplayObject, b: DisplayObject): number {
            if (a.zIndex === b.zIndex) {
                return a.$lastSortedIndex - b.$lastSortedIndex;
            }
            return a.zIndex - b.zIndex;
        }

        public sortChildren(): void {
            //关掉脏的标记
            super.sortChildren();
            this.$sortDirty = false;
            //准备重新排序
            let sortRequired = false;
            const children = this.$children;
            let child: DisplayObject = null;
            for (let i = 0, j = children.length; i < j; ++i) {
                child = children[i];
                child.$lastSortedIndex = i;
                if (!sortRequired && child.zIndex !== 0) {
                    sortRequired = true;
                }
            }
            if (sortRequired && children.length > 1) {
                //开始排
                children.sort(this._sortChildrenFunc);
            }
        }
    }
}
