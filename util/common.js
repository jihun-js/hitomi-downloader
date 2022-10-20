import axios from "axios";
import cliProgress from "cli-progress";
import chalk from "chalk";

export const instance = axios.create({
    headers: {
        'Referer': 'https://hitomi.la/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0',
    }
});

const { m, s, b } = await (async () => {
    try {
        const { data } = await instance.get("https://ltn.hitomi.la/gg.js"); //common.js에서의 get_gg 함수의 요청 주기는 1000 * 60 * 30이고, 실제 gg.js 파일의 변경 주기는 1h.
        const gg = (new Function(data.replace("gg =", 'return')))();
        return gg;
    } catch(e) {
        throw new Error(e);
    };
})();

export const getURL = h => (g=>`https://${(v=>String.fromCharCode(97+m(parseInt(v[2]+v[1],16)))+'a')(/\/[0-9a-f]{61}([0-9a-f]{2})([0-9a-f])/.exec(g))}.hitomi.la/webp/${g}.webp`)(b+s(h)+'/'+h);

export const bar = new cliProgress.Bar({
    format: `${chalk.green('Downloading... {bar}')} | {percentage}% | ETA: {eta}s | {value}/{total} |`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2590',
});