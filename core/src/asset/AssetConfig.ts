namespace dou2d {
    /**
     * 资源配置项
     * @author wizardc
     */
    export interface AssetConfigItem {
        name: string;
        type: AssetType;
        url: string;
        subkeys?: string[];
    }

    /**
     * 图集配置
     * @author wizardc
     */
    export interface SheetConfig {
        file: string;
        frames: { [name: string]: { x: number, y: number, w: number, h: number, offX: number, offY: number, sourceW: number, sourceH: number } };
    }
}
