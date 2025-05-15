import fs from 'fs';
import path from 'path';

const userDataPath = '.';
const saveDir = path.join(userDataPath, 'save');
const storageFilePath = path.join(saveDir, 'storage.json');

class Storage {
    constructor() {
        this._ensureDirExists();
        this.data = this._loadData();
    }

    _ensureDirExists() {
        try {
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }
        } catch (error) {
            console.error('Error creating save directory:', error);
        }
    }

    _loadData() {
        try {
            if (fs.existsSync(storageFilePath)) {
                const fileContent = fs.readFileSync(storageFilePath, 'utf-8');
                return JSON.parse(fileContent);
            }
        } catch (error) {
            console.error('Error reading storage file:', error);
        }
        return {}; // 文件不存在或读取/解析失败时返回空对象
    }

    _saveData() {
        try {
            const dataString = JSON.stringify(this.data, null, 2);
            fs.writeFileSync(storageFilePath, dataString, 'utf-8');
        } catch (error) {
            console.error('Error writing storage file:', error);
        }
    }

    read(section, key, defaultValue) {
        const fullKey = section + '.' + key;
        if (this.data.hasOwnProperty(fullKey)) {
            return this.data[fullKey];
        } else {
            return defaultValue;
        }
    }

    write(section, key, value) {
        const fullKey = section + '.' + key;
        this.data[fullKey] = value;
        this._saveData();
    }
}

export const storage = new Storage();
