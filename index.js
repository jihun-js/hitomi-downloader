#!/usr/bin/env node
import { writeFile, mkdir, readdir } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';
import { getURL, instance, bar } from "./util/common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let i = 0; 

async function makeDir(dir) {
    try {
        await readdir(dir);
    } catch(e) {
        if (e.code === 'ENOENT') await mkdir(dir);
    };
};

async function getInfo(gid) {
    try {
        const { data } = await instance.get(`https://ltn.hitomi.la/galleries/${gid}.js`);
        const info = (new Function(data.replace('var galleryinfo = ', 'return')))();
        return info;
    } catch(error) {
        if (error.response?.status === 404) throw new Error('NOT FOUND');
        throw new Error(error);
    };
};

async function imageRequest(url) {
    try {
        const { data } = await instance.get(url, {
            responseType : 'arraybuffer'
        });
        return data;
    } catch (error) {
        if (error.response?.status === 404) throw new Error('NOT FOUND');
        return imageRequest(url);
    };
};

async function imageDownload(file, dir) {
    const url = getURL(file.hash);
    const fileName = `${file['name'].split('.').shift()}.webp`;
    const imageData = await imageRequest(url);
    await writeFile(join(dir, fileName), imageData);
    i = i + 1;
    return bar.update(i);    
};

async function download(gid) {
    const timeStart = new Date();
    const imagesDir = join(__dirname, 'images');
    const galleryDir = join(imagesDir, `${gid}`);
    await makeDir(imagesDir);
    await makeDir(galleryDir);
    const { files, title, type, language } = await getInfo(gid);
    const { length } = files;
    console.log(`title : ${title}\ntype : ${type}\nlanguage : ${language}\ngid : ${gid}\nlength : ${length}`);
    bar.start(length, i);
    await Promise.all(files.map(file => imageDownload(file, galleryDir)));
    const timeEnd = new Date();
    console.log(`\nDone\nelapsed time : ${((timeEnd - timeStart) / 1000).toFixed(2)}s`);
    return process.exit(0);
};

program
    .version('1.2.0', '-v, --version')
    .name('download')
    .usage('download [galleryId]');
program
    .command('download')
    .argument('<galleryId>')
    .description("input galleryId")
    .action(gid => download(gid));
program
    .command('*', {
        noHelp: true
    })
    .action(() => console.log("Cannot find command"));
program
    .parse(process.argv);