export interface wmFont {
    color?: string // 水印文字颜色
    fontSize?: string // 水印文字大小
    fontStyle?: 'none' | 'normal' | 'italic' | 'oblique' // 水印文字样式
    fontWeight?: 'normal' | 'light' | 'weight' | number // 水印文字粗细
    fontFamily?: string // 水印文字字体
}

export interface wmOptions {
    width?: number // 水印单元宽度
    height?: number // 水印单元高度
    image?: string  //水印图片url
    content?: string | string[] // 水印文字内容
    gap?: [number, number] // 水印单元间距
    offset?: [number,number] // 水印在容器至上至左的定位
    zIndex?: number //水印层级
    rotate?: number // 水印旋转角度
    font?: wmFont // 水印文字样式
}

export interface wmDrawingParams {
    drawX: number
    drawY: number
    rotateX: number
    rotateY: number
}