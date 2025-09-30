export const VIRTUAL_WIDTH = 100;
export const VIRTUAL_HEIGHT = 100;

export function scaleX(x: number, width: number) {
    return (x/VIRTUAL_WIDTH) * width;
}

export function scaleY(y: number, height: number) {
    return (y/VIRTUAL_HEIGHT) * height;
}

export function scaleW(w: number, width: number) {
return (w / VIRTUAL_WIDTH) * width;
}
  
export function scaleH(h: number, height: number) {
return (h / VIRTUAL_HEIGHT) * height;
}