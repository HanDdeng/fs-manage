import fs from "fs";
import path from "path";

interface CError extends Error {
  code?: string;
}

/**
 * 判断是否是文件
 */
export const isFile = async (params: string): Promise<boolean> =>
  (await fs.promises.stat(params)).isFile();

/**
 * 获取文件内容
 */
export const getFileData = async (filePath: string): Promise<string> => {
  if (!(await isFile(filePath))) {
    throw new Error("读取失败，目标是一个文件夹");
  }

  console.log(`读取开始: ${filePath}`);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);

    let content = "";
    readStream.on("data", data => {
      content += data;
    });

    readStream.on("error", e => {
      reject(new Error(`读取文件时出错: ${e.message}`));
    });

    readStream.on("end", () => {
      console.log("文件读取完成");
      resolve(content);
    });
  });
};

/**
 * 创建目录，支持多层级
 */
export const createDir = async (dirPath: string) => {
  try {
    if (await isFile(dirPath)) {
      throw new Error("创建目录失败：无法在非目录下创建文件");
    }
    console.log("目录存在，执行完成");
  } catch (err) {
    const e = err as CError;
    //此code表示文件不存在
    if (e.code === "ENOENT") {
      await fs.promises.mkdir(dirPath, { recursive: true });
      console.log("目录不存在，创建目录成功");
    } else {
      throw e;
    }
  }
};

/**
 * 允许多层级写入内容
 * @param {string} filePath -路径
 * @param {string | Uint8Array} data -写入数据
 * @param {boolean} isCover -是否覆盖：true直接替换内容，false追加内容
 */
export const writeFileData = async (
  filePath: string,
  data: string | Uint8Array,
  isCover = false
) => {
  //没有可以同时创建文件夹和文件的方法，因此先判断所要创建文件的文件夹是否存在，不存在即创建
  await createDir(path.dirname(filePath));
  try {
    if (isCover) {
      await fs.promises.writeFile(filePath, data);
    } else {
      await fs.promises.appendFile(filePath, data);
    }
    console.log("写入完成");
  } catch (err) {
    const e = err as CError;
    throw new Error(`写入错误：${e.message}`);
  }
};

/**
 * 允许多层级以流的形式写入内容
 * @param {string} filePath -路径
 * @param {string | Uint8Array} data -写入数据
 * @param {boolean} isCover -是否覆盖：true直接替换内容，false追加内容
 */
export const writeBigFileData = async (
  filePath: string,
  data: string | Uint8Array,
  isCover = false
) => {
  //没有可以同时创建文件夹和文件的方法，因此先判断所要创建文件的文件夹是否存在，不存在即创建
  await createDir(path.dirname(filePath));
  let oldData = "";
  if (!isCover) {
    try {
      oldData = (await getFileData(filePath)) ?? "";
    } catch (err) {
      const e = err as CError;
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
  }

  //开始写入数据
  console.log("写入开始");
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(oldData + data, e => {
    if (e) {
      throw new Error(`写入错误：${e.message}`);
    }
  });

  writeStream.on("error", e => {
    throw new Error(`写入错误：${e.message}`);
  });

  //标记写入完成
  writeStream.end(() => {
    console.log("写入完成");
  });
};

/**
 * 以json数组形式记录数据,文件和目录均可自动创建
 * @param {string} filePath -路径
 * @param {*} record -每一条记录
 */
export const entryRecords = async (filePath: string, record: any) => {
  if (!record) {
    throw new Error("无效记录");
  }
  let data = [];
  try {
    data = JSON.parse((await getFileData(filePath)) || "[]");
  } catch (err) {
    const e = err as CError;
    if (e.code === "ENOENT") {
      await writeFileData(filePath, "");
    } else {
      throw e;
    }
  }
  const resData = [...data, record];
  await fs.promises.writeFile(filePath, JSON.stringify(resData));
  console.log("写入成功");
};
