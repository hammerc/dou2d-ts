# Asset 资源配置器

提供资源配置生成和资源发布功能。

## 资源配置生成

遍历指定文件夹下面的所有资源文件，生成对应的资源配置文件。

```
depot "resourceDir" "jsonFile"
```

* resourceDir：资源路径。
* jsonFile：资源配置文件路径。

## 资源发布

将指定的资源配置文件及对应的资源，发布为带有版本号的资源。

```
publish "jsonFile" "destPath" "crypto" ["folder"]
```

* jsonFile：资源配置文件路径。
* destPath：发布目标路径。
* crypto：可选 crc32 和 md5 两种格式，文件：a/b/img.png，crc32 示例（保留文件路径和名称）：a/b/img_12345678.png，md5 示例（不保留文件路径和名称）：abcdefghijk.png。
* folder：可选参数，当 crypto 设置为 md5 格式时，会将所有的文件统一放入该文件夹中，不填默认为 "res" 参数。
