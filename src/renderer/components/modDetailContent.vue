<template>
    <!-- mod展示區域,按鈕放底部 -->
    <div class="modDetailContent" v-if="!!mod">
        <!-- 滾動播放 -->
        <el-carousel height="100%" v-if="!!mod.imgs &&
            mod.imgs.length
            ">
            <el-carousel-item v-for="(item, imgIndex) in mod.imgs" :key="imgIndex">
                <img :src="item" />
            </el-carousel-item>
        </el-carousel>
        <!-- mod名称 -->
        <div class="modDetailName">{{ mod.modName }}</div>
        <!-- 按鈕區域 -->
        <div class="buttons">
            <el-button type="primary" size="mini" @click="applyMod()">应用</el-button>
            <el-button type="primary" size="mini" @click="applyMod(true)">卸载</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'modDetailContent',
    props: {
        mod: {
            type: Object,
            default: null,
        }
    },
    data() {
        return {

        }
    },
    methods: {
        applyMod(isDelete = false) {
            this.$emit('applyMod', isDelete)
        },
    }
}
</script>

<style lang="scss" scoped>
.modDetailContent {
    flex: 1;
    position: relative;
    background-color: rgba(255, 255, 255, 0.2);
    // border-left: 2px solid #909399;

    .noImg {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .modDetailName {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 20px;
        color: white;
        background: black;
        padding: 5px;
        z-index: 9;
    }

    .buttons {
        bottom: 50px;
        width: 100%;
        position: absolute;
        z-index: 99;
        text-align: center;

        /deep/ {
            .el-button {
                width: 240px;
                line-height: 24px;
                background-color: #ece5d9;
                border: none;
                border-radius: 24px;
                color: black;
                font-size: 20px;
                font-weight: 600;
                opacity: 0.2;
            }

            .el-button+.el-button {
                margin-left: 20px;
            }
        }
    }

    &:hover .buttons .el-button {
        opacity: 1;
    }

    /deep/ {
        .el-carousel {
            width: 100%;
            height: 100%;

            // .el-carousel__item:nth-child(2n) {
            //   background-color: #99a9bf;
            // }

            // .el-carousel__item:nth-child(2n + 1) {
            //   background-color: #d3dce6;
            // }
        }
    }
}
</style>