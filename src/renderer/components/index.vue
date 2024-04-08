<template>
  <div class="bgImage">
    <div class="layer">
      <!-- 大分類欄 底部切換原神/星鐵按鈕 -->
      <div class="leftTabs">
        <div class="tabIcon">
          <img src="../assets/appIcon.png" />
        </div>
        <div class="tabIcon" v-for="(item, index) in tabList" :key="item.value">
          <div
            class="tabIconItem"
            :class="{ active: index === tabIndex }"
            @click="changeTab(index)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="tabIcon gameChange">
          <div class="tabIconItem">
            <span class="iconfont icon-change"></span>
          </div>
        </div>
      </div>

      <!-- 角色/mod選擇區域 -->
      <div class="chooseContent">
        <!-- 角色欄 底部搜索，顶部筛选，選中時向左壓縮 -->
        <div class="roleTabs">
          <!-- 篩選欄 -->
          <div class="filterContent">
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
          </div>
          <!-- 角色 -->
          <div class="roleItems">
            <div class="roleItem" v-for="item in roleList" :key="item.key">
              <div class="roleImg" :class="{ fourStar: item.star === 4 }">
                <img :src="item.head" />
              </div>
              <div class="roleName">{{ item.name }}</div>
              <div class="roleAttr">
                <img :src="item.vision" />
              </div>
            </div>
          </div>
          <div class="searchContent">
            <el-input v-model="roleSearch" size="small" clearable></el-input>
          </div>
        </div>

        <!-- mod欄 顯示對應mod名稱，需要高亮已選，底部搜索 -->
        <div class="modItems"></div>
      </div>

      <!-- mod展示區域,按鈕放底部 -->
      <div class="modContent">
        <!-- 滾動播放 -->

        <!-- 按鈕區域 -->
      </div>
    </div>
  </div>
</template>

<script>
import { deepClone } from "../utils/index.js";
import { head, vision } from "../utils/img.js";
import {
  roleVision,
  visionColor,
  roleName,
  roleSexType,
} from "../utils/type.js";
import { allRoleInfo } from "../utils/roleInfo.js";

export default {
  name: "MihoyoModManager",
  data() {
    return {
      game: "genshin", // 當前遊戲 默認原神

      // 左側欄大分類
      tabList: [
        {
          label: "角",
          des: "角色分类",
          value: "role",
        },
        {
          label: "景",
          des: "场景分类",
          value: "scene",
        },
        {
          label: "技",
          des: "技能分类",
          value: "skill",
        },
      ],
      tabIndex: 0,

      // 角色栏 - 筛选
      ageSexType: null, // 性别年龄分类
      attrType: null, // 角色属性分类
      roleSearch: "", // 角色搜索
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
    // 显示的角色列表
    roleList() {
      let roleListOrigin = deepClone(Object.values(allRoleInfo));
      if (!!this.ageSexType) {
        roleListOrigin = roleListOrigin.filter((item) => {
          return item.sexType === this.ageSexType;
        });
      }
      if (!!this.attrType) {
        roleListOrigin = roleListOrigin.filter((item) => {
          return item.attr === this.attrType;
        });
      }
      if (!!this.roleSearch) {
        roleListOrigin = roleListOrigin.filter((item) => {
          return item.name.includes(this.roleSearch);
        });
      }
      roleListOrigin = roleListOrigin.sort((a, b) => {
        if (a.star > b.star) return -1;
        if (a.star < b.star) return 1;

        if (a.sexType !== "man" && b.sexType === "man") return -1;
        return 0;
      });
      return roleListOrigin.map((item) => {
        return {
          ...item,
          head: head[item.key],
          vision: vision[item.attr],
        };
      });
    },
  },

  mounted() {
    this.getRoleList();
  },

  methods: {
    // 根据游戏获取角色列表
    getRoleList() {},

    // tab切换
    changeTab(index) {
      this.tabIndex = index;
    },

    // 游戏切换
    gameChange() {
      this.game = this.game === "hsr" ? "hsr" : "genshin";
    },
  },
};
</script>

<style lang="scss" scoped>
.bgImage {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-image: url("../assets/genshinBg.jpg");

  .layer {
    width: 100%;
    height: 100%;
    display: flex;
    background-color: rgba(0, 0, 0, 0.75);

    .leftTabs {
      width: 50px;
      padding: 0 10px;
      position: relative;
      background-color: rgba(255, 255, 255, 0.6);

      .tabIcon {
        border-radius: 50%;
        width: 50px;
        height: 50px;
        padding: 10px 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tabIconItem {
          opacity: 0.75;
          background-color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          margin: 5px;
          cursor: pointer;
          color: rgb(183, 181, 191);

          &.active {
            opacity: 1;
            color: white;
            background-color: #3388c4;
          }
        }

        &.gameChange {
          position: absolute;
          bottom: 0;

          .tabIconItem {
            background-color: transparent;
          }

          span {
            font-size: 24px;
            color: white;
            font-weight: 600;
          }
        }
      }
    }

    .chooseContent {
      width: 458px;
      height: 100%;
      overflow: hidden;

      .roleTabs {
        height: 100%;
        overflow: hidden;

        .filterContent {
          display: flex;
          margin: 10px 0;

          /deep/ {
            .el-select {
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
          height: calc(100% - 52px - 52px);
          overflow-y: auto;

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

            .roleImg {
              width: 100%;
              height: 100px;
              background: linear-gradient(180deg, #865a2e 0%, #b2732b 100%);

              &.fourStar {
                background: linear-gradient(180deg, #565382 0%, #896ba7 100%);
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
  }
}
</style>
