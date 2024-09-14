<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Watermark } from '../components/watermark'
import { ElButton, ElDrawer, ElForm, ElFormItem, ElInput } from 'element-plus'
import type { wmOptions,wmFont } from '../components/watermark/attribute';
import wu from './wu.png'
const setDrawer = ref(false)
const form = reactive({
  content: 'watermark',
  gap: [20, 20],
  offset: [10, 10],
  zIndex: 5,
  rotate: -20,
  font: {
    color: 'rgba(0,0,0,.2)',
    fontSize: '18',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
  }
})
const watermarkOptions = ref<wmOptions>({
  content: ['watermark', '水印'],
  gap: [20, 20],
  offset: [10, 10],
  zIndex: 5,
  rotate: -20,
  font: {
    color: 'rgba(0,0,0,.2)',
    fontSize: '18',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
  },
  width: undefined,
  height: undefined,
})
const switchDrawer = () => {
  setDrawer.value = !setDrawer.value
  console.log(setDrawer.value)

}
watch(() => form.content, (val) => {
  watermarkOptions.value.content = val.split(',')
},
  {
    deep: true
  }
)
</script>

<template>
  <main class="main flex-row">
    <section class="need-watermark">
      <Watermark :options="watermarkOptions" class="watermark">
        <div class="slot-container">
          <img :src="wu" style="width: 300px;height:180px" alt="">
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
          <p>This is the content of the slot.</p>
        </div>
      </Watermark>
    </section>
    <section class="flex">
      <el-button @click="switchDrawer">设置水印属性</el-button>
    </section>
    <el-drawer title="我是标题" v-model="setDrawer" :with-header="false">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="content">
          <el-input v-model="form.content" placeholder="Enter watermark content" />
        </el-form-item>
        <el-form-item label="width">
          <el-input v-model="watermarkOptions.width" type="number" min="0" placeholder="Enter watermark width" />
        </el-form-item>
        <el-form-item label="height">
          <el-input v-model="watermarkOptions.height" type="number" min="0" placeholder="Enter watermark height" />
        </el-form-item>
        <el-form-item label="[gapX, gapY]">
          <el-input v-model="watermarkOptions.gap![0]" type="number" placeholder="Enter watermark gapX" />
          <el-input v-model="watermarkOptions.gap![1]" type="number" placeholder="Enter watermark gapY" />
        </el-form-item>
        <el-form-item label="[offsetX, offsetY]">
          <el-input v-model="watermarkOptions.offset![0]" type="number" placeholder="Enter watermark gapX" />
          <el-input v-model="watermarkOptions.offset![1]" type="number" placeholder="Enter watermark gapY" />
        </el-form-item>
        <el-form-item label="zIndex">
          <el-input v-model="watermarkOptions.zIndex" type="number" placeholder="Enter watermark zIndex" />
        </el-form-item>
        <el-form-item label="rotate">
          <el-input v-model="watermarkOptions.rotate" type="number" min="-180" max="180" placeholder="Enter watermark rotate" />
        </el-form-item>
        <el-form-item label="fontColor">
          <el-input v-model="watermarkOptions.font!.color" placeholder="Enter watermark color" />
        </el-form-item>
        <el-form-item label="fontSize">
          <el-input v-model="watermarkOptions.font!.fontSize" type="number" placeholder="Enter watermark fontSize" />
        </el-form-item>
        <el-form-item label="fontWeight">
          <el-input v-model="watermarkOptions.font!.fontWeight" placeholder="Enter watermark fontWeight" />
        </el-form-item>
        <el-form-item label="fontStyle">
          <el-input v-model="watermarkOptions.font!.fontStyle" placeholder="Enter watermark fontStyle" />
        </el-form-item>
        <el-form-item label="fontFamily">
          <el-input v-model="watermarkOptions.font!.fontFamily" placeholder="Enter watermark fontFamily" />
        </el-form-item>
      </el-form>
    </el-drawer>
  </main>
</template>

<style>
.main {
  width: 100%;
  height: 97vh;
  background-color: rgba(215, 240, 250, .2);
}
.flex {
  display: flex;
  align-items: center;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.need-watermark, .watermark, .slot-container {
  height: 100%;
  width: 100%;
}
</style>
