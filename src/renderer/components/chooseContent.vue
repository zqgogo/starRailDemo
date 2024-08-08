<template>
  <!-- 角色/场景/UI 選擇區域 -->
  <div class="chooseContent">
    <!-- 角色欄 底部搜索，顶部筛选，選中時向左壓縮 -->
    <div class="roleTabs">
      <!-- 篩選欄 -->
      <div class="filterContent">
        <template v-if="type === 'role'">
          <el-select
            v-model="ageSexType"
            size="small"
            placeholder="性别"
            clearable
            :popper-append-to-body="false"
          >
            <el-option
              v-for="item in ageSexTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="attrType"
            size="small"
            placeholder="属性"
            clearable
            :popper-append-to-body="false"
          >
            <el-option
              v-for="item in attrTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
        <template v-else>
          <el-button size="small" @click="addType">添加分类</el-button>
        </template>
      </div>
      <!-- 角色 -->
      <div class="roleItems">
        <div
          class="roleItem"
          v-for="item in dataList"
          :key="item.key"
          @click="setActiveItem(item)"
        >
          <div
            class="roleImg"
            :class="{ fourStar: item.star === 4, noStar: !item.star }"
          >
            <img :src="$setImgUrl(item.head || item.icon)" />
          </div>
          <div class="roleName">{{ item.name }}</div>
          <div class="roleAttr">
            <img :src="item.vision" />
          </div>
        </div>
      </div>
      <div class="searchContent">
        <el-input v-model="searchKey" size="small" clearable></el-input>
      </div>
    </div>
  </div>
</template>

<script>
import { deepClone } from "../utils";
export default {
  name: "chooseContent",
  props: {
    type: null,
    list: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      activeKey: null, // 当前选中的角色/技能/UI key
      searchKey: "", // 搜索

      ageSexType: null,
      attrType: null,
      ageSexTypeList: [
        {
          label: "成女",
          value: "woman",
        },
        {
          label: "少女",
          value: "girl",
        },
        {
          label: "幼女",
          value: "loli",
        },
        {
          label: "男性",
          value: "man",
        },
      ],
      attrTypeList: [
        {
          label: "风",
          value: "feng",
        },
        {
          label: "火",
          value: "huo",
        },
        {
          label: "雷",
          value: "lei",
        },
        {
          label: "水",
          value: "shui",
        },
        {
          label: "冰",
          value: "bing",
        },
        {
          label: "岩",
          value: "yan",
        },
        {
          label: "草",
          value: "cao",
        },
      ],
    };
  },

  computed: {
    dataList() {
      let list = deepClone(this.list || []);
      if (!!this.searchKey) {
        list = list.filter((item) => {
          return item.name.includes(this.searchKey);
        });
      }
      if (this.type === "role") {
        if (!!this.ageSexType) {
          list = list.filter((item) => {
            return item.sexType === this.ageSexType;
          });
        }
        if (!!this.attrType) {
          list = list.filter((item) => {
            return item.attr === this.attrType;
          });
        }
      }
      return list.sort((a, b) => {
        if (!!a.sort) return a.sort - b.sort;
      });
    },
  },

  methods: {
    // 选择角色、技能、场景
    setActiveItem(item) {
      console.log("setActiveItem");
      this.activeKey = item.key;
      this.$emit("change", this.activeKey);
    },

    addType() {
      this.$emit("addType");
    },
  },
};
</script>

<style lang="scss" scoped>
.chooseContent {
  width: 475px;
  height: calc(100% - 1px);
  overflow: hidden;
  padding-top: 1px;

  .roleTabs {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .filterContent {
      display: flex;
      margin: 10px 0;

      /deep/ {
        .el-select,
        .el-button {
          margin: 0 10px;

          .el-input {
            input {
              border-radius: 16px;
              background-color: #ece5d9;

              &,
              &::placeholder {
                color: #575357;
              }
            }

            .el-input__suffix {
              transform: rotateZ(180deg);

              .el-select__caret {
                color: #575357;

                &.el-icon-arrow-up:before {
                  content: "\e790";
                }
              }
            }
          }

          .el-select-dropdown {
            background-color: #ece5d9;

            .popper__arrow::after {
              border-bottom-color: #ece5d9;
            }
          }
        }
      }
    }

    .roleItems {
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      padding: 0 5px;
      // height: calc(100% - 52px - 52px);
      overflow-y: auto;
      flex: 1;

      // 滚动条
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      // 设置滚动条的背景色和圆角
      &::-webkit-scrollbar-thumb {
        background-color: #ece5d9;
        border-radius: 8px;
      }

      .roleItem {
        width: 100px;
        height: 120px;
        position: relative;
        margin: 5px;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid;

        &:hover {
          transform: scale(1.1);
          border-color: white;
        }

        .roleImg {
          width: 100%;
          height: 100px;
          overflow: hidden;
          background: linear-gradient(180deg, #865a2e 0%, #b2732b 100%);

          &.fourStar {
            background: linear-gradient(180deg, #565382 0%, #896ba7 100%);
          }

          &.noStar {
            background: linear-gradient(180deg, #0645ad 0%, #00b6ff 100%);
          }
        }

        img {
          width: 100%;
        }

        .roleName {
          width: 100%;
          height: 20px;
          line-height: 20px;
          text-align: center;
          color: #575357;
          background-color: #ece5d9;
        }

        .roleAttr {
          position: absolute;
          top: 0;
          left: 0;
          width: 25px;
        }
      }
    }

    .searchContent {
      margin: 10px;

      /deep/ {
        .el-input input {
          color: white;
          font-size: 16px;
          border-color: transparent;
          background-color: rgba($color: #ece5d9, $alpha: 0.5);
        }
      }
    }
  }
}
</style>
