import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as util from "util";
import { FileUtil } from "../../lib/hammerc/utils/FileUtil";

const CRC32 = require("crc-32");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Publish {
    public async start(jsonFile: string, destPath: string, crypto: "crc32" | "md5", folder: string = "res"): Promise<void> {
        let resources = JSON.parse(await readFileAsync(jsonFile, { encoding: "utf8" }));
        let repeatMap = {};
        if (crypto == "md5") {
            console.log(`md5模式下名称相同内容也相同但文件夹不同的文件会出现md5重复值，请检查，如果md5重复但是文件内容不一致需要额外注意程序可能会出现未知异常`);
        }
        for (let resource of resources) {
            let filePath = path.join(path.dirname(jsonFile), resource.url);
            if (crypto == "crc32") {
                await this.processCRC32(filePath, resource, destPath);
            }
            else {
                await this.processMD5(filePath, resource, destPath, folder, repeatMap);
            }
        }
        let jsonPath = path.join(destPath, path.basename(jsonFile));
        await writeFileAsync(jsonPath, JSON.stringify(resources), { encoding: "utf8" });
        console.log(`资源配置发布成功: ${jsonFile}`);
    }

    private async processCRC32(filePath: string, resource: any, destPath: string): Promise<void> {
        let crc32 = await this.getCRC32(filePath);
        let ext = path.extname(filePath);
        let oldFileName = path.basename(filePath).replace(ext, "");
        let newFileName = oldFileName + "_" + crc32;
        resource.url = resource.url.replace(oldFileName + ext, newFileName + ext);
        let newFilePath = path.join(destPath, path.dirname(resource.url), newFileName + ext);
        FileUtil.copyFile(filePath, newFilePath);

        if (resource.type == "sheet") {
            let sheetData = JSON.parse(await readFileAsync(filePath, { encoding: "utf8" }));
            let imageName = sheetData.file;
            let imagePath = path.join(path.dirname(filePath), imageName);
            let crc32 = await this.getCRC32(imagePath);
            let ext = path.extname(imagePath);
            let oldFileName = path.basename(imagePath).replace(ext, "");
            let newFileName = oldFileName + "_" + crc32;
            sheetData.file = newFileName + ext;
            await writeFileAsync(newFilePath, JSON.stringify(sheetData), { encoding: "utf8" });
            FileUtil.copyFile(imagePath, path.join(destPath, path.dirname(resource.url), newFileName + ext));
        }
    }

    private async getCRC32(filePath: string): Promise<string> {
        let crc_signed = CRC32.buf(await readFileAsync(filePath));
        let buf = Buffer.alloc(4);
        buf.writeInt32BE(crc_signed, 0);
        let crc_unsigned = buf.readUInt32BE(0);
        let crc32 = crc_unsigned.toString(16);
        return crc32;
    }

    private async processMD5(filePath: string, resource: any, destPath: string, folder: string, repeatMap: any): Promise<void> {
        let md5 = await this.getMD5(filePath);
        if (repeatMap[md5]) {
            console.warn(`md5值出现了重复，文件1 "${repeatMap[md5]}"，文件2 "${filePath}"`);
        }
        repeatMap[md5] = filePath;
        let ext = path.extname(filePath);
        let oldFileName = path.basename(filePath).replace(ext, "");
        let newFileName = folder + "/" + md5;
        resource.url = newFileName + ext;
        let newFilePath = path.join(destPath, newFileName + ext);
        FileUtil.copyFile(filePath, newFilePath);

        if (resource.type == "sheet") {
            let sheetData = JSON.parse(await readFileAsync(filePath, { encoding: "utf8" }));
            let imageName = sheetData.file;
            let imagePath = path.join(path.dirname(filePath), imageName);
            let md5 = await this.getMD5(imagePath);
            if (repeatMap[md5]) {
                console.warn(`md5值出现了重复，文件1 "${repeatMap[md5]}"，文件2 "${imagePath}"`);
            }
            repeatMap[md5] = imagePath;
            let ext = path.extname(imagePath);
            let oldFileName = path.basename(imagePath).replace(ext, "");
            let newFileName = md5;
            sheetData.file = newFileName + ext;
            await writeFileAsync(newFilePath, JSON.stringify(sheetData), { encoding: "utf8" });
            FileUtil.copyFile(imagePath, path.join(destPath, folder, newFileName + ext));
        }
    }

    private async getMD5(filePath: string): Promise<string> {
        let md5 = crypto.createHash("md5");
        md5.update(path.basename(filePath));
        md5.update(await readFileAsync(filePath));
        return md5.digest("hex");
    }
}

export { Publish };
