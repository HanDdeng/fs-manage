### `README.md` 示例

````markdown
# fs-manage

A utility library for file operations and sequential execution in Node.js.

## Features

- Check if a path is a file
- Read file data
- Create directories
- Write file data (with optional overwrite)
- Write large file data in stream (with optional overwrite)
- Record entries as JSON array in a file

## Installation

To install the package, you can use npm:

```bash
npm install fs-manage
```
````

## Usage

### Importing the Library

```javascript
const {
  isFile,
  getFileData,
  createDir,
  writeFileData,
  writeBigFileData,
  entryRecords,
} = require("fs-manage");
```

### Check if a Path is a File

```javascript
const isFile = await isFile("/path/to/file");
console.log(isFile); // true or false
```

### Read File Data

```javascript
const data = await getFileData("/path/to/file");
console.log(data);
```

### Create a Directory

```javascript
await createDir("/path/to/directory");
console.log("Directory created");
```

### Write File Data

```javascript
await writeFileData("/path/to/file", "File content", true);
console.log("File written");
```

### Write Large File Data in Stream

```javascript
await writeBigFileData("/path/to/file", "File content", false);
console.log("Large file written");
```

### Record Entries as JSON Array in a File

```javascript
await entryRecords("/path/to/file", { key: "value" });
console.log("Record added");
```
