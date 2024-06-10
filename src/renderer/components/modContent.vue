<template>
    <!-- mod欄 顯示對應mod名稱，需要高亮已選，底部搜索 -->
    <div class="modContent">
        <div class="typeName">{{ activeItem.name }}</div>
        <div class="modItems">
            <div class="modItem" v-for="(mod, index) in activeItemMods" :key="index" :class="{ active: modIndex === index }"
                @click="setModActive(index)">
                <div class="modIcon">
                    <div class="point"></div>
                </div>
                <div class="modName" :title="mod.modName">{{ mod.modName }}</div>
                <i class="el-icon-delete-solid deleteMod" @click.stop="deleteMod(index)"></i>
            </div>
        </div>
        <div class="noModData" v-if="activeItemMods.length === 0">
            暂无mod数据
        </div>
    </div>
</template>

<script>
export default {
    name: "modContent",
    model: {
        prop: 'modIndex',
        event: 'change'
    },
    props: {
        modIndex: {
            type: Number,
            default: -1,
        },
        activeItem: {
            type: Object,
            default: null,
        },
        configData: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
        }
    },
    computed: {
        // 选择的角色/技能/场景对应的mod列表
        activeItemMods() {
            if (!!this.activeItem) {
                return this.configData[this.activeItem.key] || [];
            }
            return [];
        }
    },
    methods: {
        // 选中mod
        setModActive(index) {
            this.$emit("change", index);
        },

        // 删除mod
        deleteMod(index) {
            this.$emit("delete", index)
        }
    }
}
</script>

<style lang="scss" scoped>
.modContent {
    width: 300px;
    padding: 0 10px;
    color: #ece5d8;

    .typeName {
        height: 40px;
        line-height: 40px;
        margin-top: 10px;
        border-radius: 20px;
        font-size: 30px;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.5);
        color: white;
    }

    .modItems {
        // padding-top: 30px;

        .modItem {
            display: flex;
            height: 50px;
            margin: 20px 10px;
            font-size: 28px;
            font-weight: 600;
            align-items: center;
            border-top-left-radius: 25px;
            border-bottom-left-radius: 25px;
            cursor: pointer;
            position: relative;

            &:hover,
            &.active {
                background: linear-gradient(to right,
                        rgba(255, 255, 255, 0.2),
                        rgba(255, 255, 255, 0));

                .modIcon {
                    border-color: rgba(236, 229, 216, 0.6);

                    .point {
                        opacity: 1;
                    }
                }

                .modName {
                    opacity: 1;
                }
            }

            .modIcon {
                width: 13px;
                height: 13px;
                margin-left: 15px;
                margin-right: 8px;
                transform: rotate(45deg);
                border: 1.5px solid rgba(236, 229, 216, 0);

                .point {
                    width: 10px;
                    height: 10px;
                    background-color: #ece5d8;
                    opacity: 0.6;
                    margin: 1.5px;
                }
            }

            .modName {
                opacity: 0.6;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .deleteMod {
                position: absolute;
                right: 0;
                top: 9px;
                display: none;
                z-index: 9;
            }

            &.active {
                background: none;

                .modIcon,
                .modName {
                    transform: scale(1.1);
                    transform-origin: left;
                }

                .modIcon {
                    -webkit-transform-origin-x: center;
                    transform: scale(1.1) rotate(45deg);
                }

                .modName {
                    margin-left: 5px;
                }
            }

            &:hover .deleteMod {
                display: block;
            }
        }
    }

    .noModData {
        font-size: 28px;
        text-align: center;
        margin-top: 30px;
    }
}
</style>