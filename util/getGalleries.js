import { abInstance } from "./common.js";

function toArrayBuffer(buffer) { 
    let ab = new ArrayBuffer(buffer.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    };
    return ab;
};

async function getGalleries () { 
    let list = [];
    try {
      const buffer = await abInstance.get('https://ltn.hitomi.la/index-korean.nozomi');      
      const view = new DataView(toArrayBuffer(buffer.data));
      const total = view.byteLength / 4;
      for (let i = 0; i < total; i++) {
        list = [...list, view.getInt32(i * 4, false /* big-endian */)];
      };
      return list;
    } catch (e) {
      throw new Error(e);
    };      
};

export default getGalleries;