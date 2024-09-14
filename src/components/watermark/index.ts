import type { PropType } from "vue"
import { defineComponent, h, reactive, ref, toRefs, watch, onMounted } from 'vue'
import { defaultOptions, BaseSize, FontGap } from "./options"
import type { wmDrawingParams, wmOptions } from "./attribute"

// 定义水印组件
export const Watermark = defineComponent({
    name:'Watermark',
    props: {
        options: {
            type: Object as PropType<wmOptions>,
            default: () => {}
        }
    },
    setup(props,ctx) {
        const options = reactive({
            // 合并传入的props数据和defaultOptions数据
            ...defaultOptions,
            ...props.options,
            font: {
                ...defaultOptions.font,
                ...props.options?.font
            }
        })

        // 对options中的属性进行解构赋值
        const { width, height, content, gap, offset, image, zIndex, rotate } = toRefs(options)
        // 获取设备像素比率
        const devicePixelRatio = window.devicePixelRatio || 1

        // 对间距和偏移量进行解构赋值
        const [gapX, gapY] = toRefs(gap.value)
        const [gapXCenter,gapYCenter] = [gapX.value / 2, gapY.value / 2]

        // 定义水印容器和水印元素 watermarkContainerRef简写为wmContainerRef   watermarkRef简写为wmRef
        const watermarkContainerRef = ref<HTMLDivElement>()
        const watermarkRef = ref<HTMLDivElement>()
        // 添加像素单位
        const appendPixel = (num:number): string => {
            return `${num}px`
        }
        // 根据水印的内容和字体属性判断一个水印元素的尺寸
        const getWmSize = (canvasCtx: CanvasRenderingContext2D) => {
            const {fontSize, fontFamily } = options.font
            // 设置一个水印元素的默认宽高
            let [defaultWidth, defaultHeight] = [120, 64]
            // measureText() 返回一个包含文本尺寸信息的 TextMetrics 对象
            if(!image.value && canvasCtx.measureText) {
                // 如果不是图片水印，则开始获取文字内容的字体和内容及尺寸
                canvasCtx.font = `${Number(fontSize)}px ${fontFamily}`
                const contents = Array.isArray(content.value) ? content.value : [content.value]
                const widths = contents.map(item => canvasCtx.measureText(item!).width)
                defaultWidth = Math.ceil(Math.max(...widths))
                defaultHeight = Number(fontSize) * contents.length + (contents.length-1) * FontGap
            }
            return [width.value ?? defaultWidth,height.value ?? defaultHeight] as const
        }

        const fillTexts = (
            canvasCtx: CanvasRenderingContext2D,
            drawX: number,
            drawY: number,
            drawWidth: number,
            drawHeight: number
        ) => {
            // setup中的合并起来的options
            const { fontSize, fontFamily, fontStyle, color, fontWeight } =  options.font
            const mergedFontize = Number(fontSize) * devicePixelRatio

            canvasCtx.font = `${fontStyle} normal ${fontWeight} ${appendPixel(mergedFontize)}/${appendPixel(drawHeight)} ${fontFamily}`
            canvasCtx.fillStyle = color! as string
            canvasCtx.textAlign = 'center'
            canvasCtx.textBaseline = 'top'
            // 将文本绘制在画布的水平中心
            canvasCtx.translate(drawWidth / 2, 0)
            const contents = Array.isArray(content.value) ? content.value : [content.value]
            contents?.forEach((item, index) => {
                drawY += index * (mergedFontize + FontGap * devicePixelRatio)
                canvasCtx.fillText(item ?? '', drawX, drawY)
            })
        }
        // 转换style对象为css样式字符串
        const convertStyleToString = (style: Record<string,any>): string => {
            return Object.keys(style)
            .map((key: string) => `${key.replace(/([A-Z])/g,'-$1').toLowerCase()}: ${style[key]};`)
            .join(' ')
        }

        const getWmStyle = () => {
            const watermarkStyle = {
                zIndex:zIndex?.value,
                position: 'absolute',
                left: '0',
                top: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'unset'
            }

            let positionLeft = offset.value?.[0] ?? gapXCenter - gapXCenter
            let positionTop = offset.value?.[1] ?? gapYCenter - gapYCenter
            if(positionLeft > 0) {
                watermarkStyle.left = `${appendPixel(positionLeft)}`
                watermarkStyle.width = `calc(100% - ${appendPixel(positionLeft)})`
                positionLeft = 0
            }
            if(positionTop > 0) {
                watermarkStyle.top = `${appendPixel(positionTop)}`
                watermarkStyle.height = `calc(100% - ${appendPixel(positionTop)})`
                positionTop = 0
            }
            // 设置背景定位
            watermarkStyle.backgroundPosition = `${appendPixel(positionLeft)} ${appendPixel(positionTop)}`
            return watermarkStyle
        }
        const addWatermark = (base64Url: string, watermarkWidth: number) => {
            if(watermarkContainerRef.value && watermarkRef.value) {
                watermarkRef.value.setAttribute(
                    'style',
                    convertStyleToString({
                        ...getWmStyle(),
                        backgroundImage: `url(${base64Url})`,
                        backgroundSize: `${appendPixel((gapX.value + watermarkWidth) * BaseSize)}`,
                    })
                )
                watermarkContainerRef.value.append(watermarkRef.value)
            }
        }
        const rotateWatermark = (canvasCtx: CanvasRenderingContext2D, rotateX:number,rotateY: number, rotate: number) => {
            // 将画布原点(0, 0)移动到旋转中心点
            canvasCtx.translate(rotateX, rotateY)
            // 旋转画布
            canvasCtx.rotate((Math.PI / 180) * Number(rotate))
            // 平移回原来的位置
            canvasCtx.translate(-rotateX, -rotateY)
        }

        const drawImage = (
            canvas: HTMLCanvasElement,
            canvasCtx: CanvasRenderingContext2D,
            drawWidth: number,
            drawHeight: number,
            watermarkWidth: number,
            drawingParams: wmDrawingParams,
            alternateDrawingParams: wmDrawingParams
        ) => {
            let Img = new Image()
            if(image.value) {
                Img.src = image.value
                Img.onload = () => {
                    canvasCtx.drawImage(Img, drawingParams.drawX,drawingParams.drawY, drawWidth,drawHeight)
                    addWatermark(canvas.toDataURL('image/png'),watermarkWidth)
                }
            }
            
        }

        const drawText = (
            canvas: HTMLCanvasElement,
            canvasCtx: CanvasRenderingContext2D,
            drawWidth: number,
            drawHeight: number,
            watermarkWidth: number,
            drawingParams: wmDrawingParams,
            alternateDrawingParams: wmDrawingParams
        ) => {
            fillTexts(canvasCtx,drawingParams.drawX, drawingParams.drawY,drawWidth,drawHeight)
            canvasCtx.restore()
            rotateWatermark(canvasCtx, alternateDrawingParams.rotateX, alternateDrawingParams.rotateY, rotate.value)
            fillTexts(canvasCtx,alternateDrawingParams.drawX, alternateDrawingParams.drawY, drawWidth, drawHeight)
            addWatermark(canvas.toDataURL('image/png'), watermarkWidth)
        }

        watch(
            () => props.options,
            () => {
                Object.assign(options, {
                    ...defaultOptions,
                    ...props.options,
                    font: {
                        ...defaultOptions.font,
                        ...props.options?.font
                    }
                })
            },
            {
                deep: true,
                immediate: true
            }
        )

        return () => {
            const slots = ctx.slots.default?.()
            if(!slots) throw new Error('@watermark: Slot is required to use <watermark>')
            if(slots.length !== 1) throw new Error(`@watermark:<watermark> requires exactly one slot,but got ${slots.length}`)
            

            const renderWatermark = () => {
                const slot = slots[0]
                const canvas = document.createElement('canvas')
                const canvasCtx = canvas.getContext('2d')
                if(canvasCtx) {
                    if(!watermarkRef.value) watermarkRef.value = document.createElement('div')
                    // 获取水印的大小和canvas的尺寸
                        const [watermarkWidth, watermarkHeight] = getWmSize(canvasCtx)
                    const canvasWidth = (gapX.value + watermarkWidth) * devicePixelRatio
                    const canvasHeight = (gapY.value + watermarkHeight) * devicePixelRatio
                    const drawWidth = watermarkWidth * devicePixelRatio
                    const drawHeight = watermarkHeight * devicePixelRatio
                    // 设置canvas的参数
                    canvas.setAttribute('width',`${appendPixel(canvasWidth * BaseSize)}`)
                    canvas.setAttribute('height',`${appendPixel(canvasHeight * BaseSize)}`)
                    // 设置绘画的参数
                    const drawingParams = {
                        drawX: (gapX.value * devicePixelRatio) / 2,
                        drawY: (gapY.value * devicePixelRatio) / 2,
                        rotateX: (drawWidth + gapY.value * devicePixelRatio) / 2,
                        rotateY: (drawHeight + gapX.value * devicePixelRatio) /2
                    }

                    // 设置备选绘画参数
                    const alternateDrawingParams = {
                        drawX: drawingParams.drawX + canvasWidth,
                        drawY: drawingParams.drawY + canvasHeight,
                        rotateX: drawingParams.rotateX + canvasWidth,
                        rotateY: drawingParams.rotateY + canvasHeight
                    }

                    // 保存canvas状态
                    canvasCtx.save()

                    // 旋转canvas
                    rotateWatermark(canvasCtx,drawingParams.rotateX,drawingParams.rotateY, rotate.value)
                    if(image.value) {
                        //图片水印
                        drawImage(canvas, canvasCtx, drawWidth,drawHeight,watermarkWidth, drawingParams, alternateDrawingParams)
                    } else {
                        // 文字水印
                        drawText(canvas, canvasCtx, drawWidth, drawHeight,watermarkWidth,drawingParams,alternateDrawingParams)
                    }
                }
                // 返回一个div元素包裹原来的内容和整个水印
                 return h(
                    'div',
                    {
                        ref: watermarkContainerRef,
                        style: { position:'relative', height: '100%' },
                    },
                    [slot],
                 )
            }

            return h('div', {}, renderWatermark())
        }
        
    }
})