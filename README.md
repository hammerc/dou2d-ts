# dou2d-ts
WebGL 2D 引擎

逗2D，基于 WebGL 的 2D 引擎，整体框架和具体的实现主要参考 Egret2D 引擎。

*现有的 2D H5 引擎（Egret、Laya等）已经非常复杂庞大，我自己需要的一些功能不好直接修改，所以打算自己写一个定制的 2D 引擎来使用。*

* 采用 WebGL 进行渲染，不支持纯 Canvas 模式。

* 采用 ES2015 标准。

* 该引擎主要是为了用来开发一些自己的小游戏使用。

* 会持续扩充文档和示例。

---

## 开始上手

1. 在编写代码之前请引入位于**examples/lib**文件夹中的**dou.js**和**dou2d.js**两个文件：

```html
<script type="text/javascript" src="examples/lib/dou.js"></script>
<script type="text/javascript" src="examples/lib/dou2d.js"></script>
```

2. 需要外部加载资源时，请注册加载类型解析器：

```javascript
// 注册贴图解析器并绑定对应的文件后缀名
dou.loader.registerAnalyzer("image", new dou2d.ImageAnalyzer());
dou.loader.registerExtension("jpg", "image");
dou.loader.registerExtension("jpeg", "image");
dou.loader.registerExtension("png", "image");
```

3. 编写根显示容器类：

```javascript
class ShapeTest extends dou2d.DisplayObjectContainer {
    constructor() {
        super();
        this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
    }
    onAdded(event) {
        let shape = new dou2d.Shape();
        shape.graphics.beginFill(0xffffff, 1);
        shape.graphics.drawRect(0, 0, 100, 100);
        shape.graphics.endFill();
        shape.x = 50;
        shape.y = 50;
        this.addChild(shape);
    }
}
```

4. 启动引擎：

```javascript
new dou2d.Engine(ShapeTest);
```

## 引擎示例

* [绘制小白块](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=ShapeTest)

* [绘制图片](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=BitmapTest)

* [文本和输入](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=TextTest)

* [交互](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=TouchTest)

* [内置滤镜](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=FilterTest)

* [自定义滤镜](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=CustomFilterTest)

* [自定义裁剪滤镜](https://hammerc.github.io/dou2d-ts/examples/index.html?demo=ClipFilterTest)
