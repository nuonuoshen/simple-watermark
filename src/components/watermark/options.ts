import type { InjectionKey } from 'vue'
import type { wmOptions } from './attribute'

// 类型断言，使用了类型断言 (as unknown as)，将字符串转换为 InjectionKey<WatermarkOptions> 类型
export const InjectionOptions = 'vue-watermark-options' as unknown as InjectionKey<wmOptions>
export const defaultOptions = {
    width: null,
    height: null,
    content: null,
    image: null,
    gap: [20, 20],
    offset: [null, null],
    rotate: -20,
    font: {
        color: 'rgba(0,0,0,.2)',
        fontsize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'sans-serif'
    }
}

export const FontGap = 3
export const BaseSize = 2