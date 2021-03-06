(function (Dou) {

    Dou.sys = Dou.sys || {};
    Dou.filter = Dou.filter || {};
    Dou.rendering = Dou.rendering || {};
    Dou.input = Dou.input || {};
    Dou.touch = Dou.touch || {};

    Dou.AssetManager = dou2d.AssetManager;
    Dou.asset = dou2d.asset;

    Dou.$2d = dou2d.$2d;

    Dou.sys.glContext = dou2d.sys.glContext;
    Dou.sys.unpackPremultiplyAlphaWebgl = dou2d.sys.unpackPremultiplyAlphaWebgl;
    Dou.sys.engineDefaultEmptyTexture = dou2d.sys.engineDefaultEmptyTexture;
    Dou.sys.smoothing = dou2d.sys.smoothing;
    Dou.sys.markCannotUse = dou2d.sys.markCannotUse;
    Dou.sys.Player = dou2d.sys.Player;
    Dou.sys.Ticker = dou2d.sys.Ticker;

    Dou.sys.Stat = dou2d.sys.Stat;
    Dou.StatPanel = dou2d.StatPanel;

    Dou.Bitmap = dou2d.Bitmap;
    Dou.BitmapData = dou2d.BitmapData;
    Dou.DisplayObject = dou2d.DisplayObject;
    Dou.DisplayObjectContainer = dou2d.DisplayObjectContainer;
    Dou.Graphics = dou2d.Graphics;
    Dou.RenderTexture = dou2d.RenderTexture;
    Dou.Shape = dou2d.Shape;
    Dou.Sprite = dou2d.Sprite;
    Dou.SpriteSheet = dou2d.SpriteSheet;
    Dou.Stage = dou2d.Stage;
    Dou.Texture = dou2d.Texture;

    Dou.DragManager = dou2d.DragManager;

    Dou.DragEvent = dou2d.DragEvent;
    Dou.Event2D = dou2d.Event2D;
    Dou.TouchEvent = dou2d.TouchEvent;
    Dou.TimerEvent = dou2d.TimerEvent;

    Dou.BlurFilter = dou2d.BlurFilter;
    Dou.filter.BlurXFilter = dou2d.filter.BlurXFilter;
    Dou.filter.BlurYFilter = dou2d.filter.BlurYFilter;
    Dou.ColorBrushFilter = dou2d.ColorBrushFilter;
    Dou.ColorMatrixFilter = dou2d.ColorMatrixFilter;
    Dou.CustomFilter = dou2d.CustomFilter;
    Dou.DropShadowFilter = dou2d.DropShadowFilter;
    Dou.Filter = dou2d.Filter;
    Dou.GlowFilter = dou2d.GlowFilter;

    Dou.Matrix = dou2d.Matrix;
    Dou.Point = dou2d.Point;
    Dou.Rectangle = dou2d.Rectangle;

    Dou.ImageAnalyzer = dou2d.ImageAnalyzer;
    Dou.SheetAnalyzer = dou2d.SheetAnalyzer;
    Dou.FontAnalyzer = dou2d.FontAnalyzer;
    Dou.TTFAnalyzer = dou2d.TTFAnalyzer;

    Dou.GravityParticle = dou2d.GravityParticle;
    Dou.GravityParticleSystem = dou2d.GravityParticleSystem;
    Dou.Particle = dou2d.Particle;
    Dou.ParticleRegion = dou2d.ParticleRegion;
    Dou.ParticleSystem = dou2d.ParticleSystem;

    Dou.rendering.BitmapNode = dou2d.rendering.BitmapNode;
    Dou.rendering.GraphicsNode = dou2d.rendering.GraphicsNode;
    Dou.rendering.GroupNode = dou2d.rendering.GroupNode;
    Dou.rendering.NormalBitmapNode = dou2d.rendering.NormalBitmapNode;
    Dou.rendering.RenderNode = dou2d.rendering.RenderNode;
    Dou.rendering.TextNode = dou2d.rendering.TextNode;
    Dou.rendering.FillPath = dou2d.rendering.FillPath;
    Dou.rendering.GradientFillPath = dou2d.rendering.GradientFillPath;
    Dou.rendering.Path2D = dou2d.rendering.Path2D;
    Dou.rendering.StrokePath = dou2d.rendering.StrokePath;
    Dou.rendering.CanvasRenderBuffer = dou2d.rendering.CanvasRenderBuffer;
    Dou.rendering.CanvasRenderer = dou2d.rendering.CanvasRenderer;
    Dou.rendering.DisplayList = dou2d.rendering.DisplayList;
    Dou.rendering.DrawCommand = dou2d.rendering.DrawCommand;
    Dou.rendering.RenderBuffer = dou2d.rendering.RenderBuffer;
    Dou.rendering.RenderContext = dou2d.rendering.RenderContext;
    Dou.rendering.Renderer = dou2d.rendering.Renderer;
    Dou.rendering.RenderTarget = dou2d.rendering.RenderTarget;
    Dou.rendering.VertexData = dou2d.rendering.VertexData;

    Dou.DefaultScreenAdapter = dou2d.DefaultScreenAdapter;

    Dou.rendering.Attribute = dou2d.rendering.Attribute;
    Dou.rendering.Program = dou2d.rendering.Program;
    Dou.rendering.ShaderLib = dou2d.rendering.ShaderLib;
    Dou.rendering.Uniform = dou2d.rendering.Uniform;

    Dou.input.HtmlText = dou2d.input.HtmlText;
    Dou.input.InputController = dou2d.input.InputController;
    Dou.input.InputManager = dou2d.input.InputManager;
    Dou.BitmapFont = dou2d.BitmapFont;
    Dou.BitmapText = dou2d.BitmapText;
    Dou.HtmlTextParser = dou2d.HtmlTextParser;
    Dou.TextField = dou2d.TextField;
    Dou.registerFontMapping = dou2d.registerFontMapping;

    Dou.touch.TouchHandler = dou2d.touch.TouchHandler;
    Dou.touch.TouchHandlerImpl = dou2d.touch.TouchHandlerImpl;

    Dou.Base64Util = dou2d.Base64Util;
    Dou.BezierUtil = dou2d.BezierUtil;
    Dou.callLater = dou2d.callLater;
    Dou.callLaterUnique = dou2d.callLaterUnique;
    Dou.sys.updateCallLater = dou2d.sys.updateCallLater;
    Dou.sys.callLater = dou2d.sys.callLater;
    Dou.sys.callLaterUnique = dou2d.sys.callLaterUnique;
    Dou.Capabilities = dou2d.Capabilities;
    Dou.HtmlUtil = dou2d.HtmlUtil;
    Dou.registerImplementation = dou2d.registerImplementation;
    Dou.getImplementation = dou2d.getImplementation;
    Dou.MathUtil = dou2d.MathUtil;
    Dou.setInterval = dou2d.setInterval;
    Dou.clearInterval = dou2d.clearInterval;
    Dou.sys.updateInterval = dou2d.sys.updateInterval;
    Dou.sys.setInterval = dou2d.sys.setInterval;
    Dou.sys.clearInterval = dou2d.sys.clearInterval;
    Dou.setTimeout = dou2d.setTimeout;
    Dou.clearTimeout = dou2d.clearTimeout;
    Dou.sys.updateTimeout = dou2d.sys.updateTimeout;
    Dou.sys.setTimeout = dou2d.sys.setTimeout;
    Dou.sys.clearTimeout = dou2d.sys.clearTimeout;
    Dou.TextFieldUtil = dou2d.TextFieldUtil;
    Dou.Time = dou2d.Time;
    Dou.Timer = dou2d.Timer;
    Dou.UUID = dou2d.UUID;
    Dou.WebGLUtil = dou2d.WebGLUtil;

    Dou.Engine = dou2d.Engine;

})((<any>window).Dou || ((<any>window).Dou = {}));
