import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { FileUtil } from "../../lib/hammerc/utils/FileUtil";

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const typeMap: any = {
    ".txt": "text",
    ".xml": "text",
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".webp": "image",
    ".json": "json",
    ".fnt": "font",
    ".ttf": "ttf",
    ".mp3": "sound",
    ".wav": "sound",
    ".ogg": "sound"
};

class Depot {
    public async start(resourceDir: string, jsonFile: string): Promise<void> {
        resourceDir = path.normalize(resourceDir);
        jsonFile = path.normalize(jsonFile);

        let jsonFileName = path.basename(jsonFile);

        let files = FileUtil.getAllFile(resourceDir, undefined, true, (filePath: string, isFile: boolean) => {
            if (!isFile) {
                return filePath.indexOf(".svn") != -1;
            }
            return false;
        });

        let resources: any[] = [];
        for (let filePath of files) {
            let name = path.basename(filePath);
            let ext = path.extname(filePath);
            if (name == jsonFileName) {
                continue;
            }
            let fileUrl = this.getUrl(filePath, resourceDir);
            this.processFile(resources, fileUrl, name, ext);
        }
        this.processSheet(resources, resourceDir);
        this.processFont(resources, resourceDir);

        await writeFileAsync(jsonFile, JSON.stringify(resources, undefined, 4), { encoding: "utf8" });

        console.log(`资源配置文件创建成功: ${jsonFile}`);
    }

    private getUrl(filePath: string, resourcePath: string): string {
        filePath = path.normalize(filePath);
        filePath = filePath.replace(resourcePath + "\\", "");
        filePath = filePath.replace(/\\/g, "/");
        return filePath;
    }

    private processFile(resources: any[], url: string, name: string, ext: string): void {
        let type = typeMap[ext] || "bin";
        name = name.replace(/\./g, "_");
        resources.push({
            url,
            type,
            name
        });
    }

    private processSheet(resources: any[], resourcePath: string): void {
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            if (resource.type == "json") {
                let jsonPath = path.join(resourcePath, resource.url);
                let data: any;
                try {
                    data = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf8" }));
                }
                catch (error) {
                    console.error(`json格式错误：${jsonPath}`);
                    continue;
                }
                if (data.file && data.frames) {
                    let imagePath = path.join(path.dirname(jsonPath), data.file);
                    if (fs.existsSync(imagePath)) {
                        let index = this.findByUrl(resources, this.getUrl(imagePath, resourcePath));
                        if (index != -1) {
                            resource.type = "sheet";
                            let subkeys = [];
                            for (let key in data.frames) {
                                subkeys.push(key);
                            }
                            resource.subkeys = subkeys.join(",");
                            resources.splice(index, 1);
                            i--;
                        }
                    }
                }
            }
        }
    }

    private processFont(resources: any[], resourcePath: string): void {
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            if (resource.type == "font") {
                let jsonPath = path.join(resourcePath, resource.url);
                let data: any;
                try {
                    data = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf8" }));
                }
                catch (error) {
                    console.error(`json格式错误：${jsonPath}`);
                    continue;
                }
                if (data.file && data.frames) {
                    let imagePath = path.join(path.dirname(jsonPath), data.file);
                    if (fs.existsSync(imagePath)) {
                        let index = this.findByUrl(resources, this.getUrl(imagePath, resourcePath));
                        if (index != -1) {
                            resources.splice(index, 1);
                            i--;
                        }
                    }
                }
            }
        }
    }

    private findByUrl(resources: any[], url: string): number {
        for (let i = 0, len = resources.length; i < len; i++) {
            let resource = resources[i];
            if (resource.url == url) {
                return i;
            }
        }
        return -1;
    }
}

export { Depot };
