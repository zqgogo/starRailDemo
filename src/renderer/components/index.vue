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

      <!-- 角色/场景/UI 選擇區域 -->
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
            <div class="roleItem" v-for="item in roleList" :key="item.key" @click="setActiveItem(item)">
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
      </div>

      <!-- mod欄 顯示對應mod名稱，需要高亮已選，底部搜索 -->
      <div class="modContent" v-if="!!activeKey">
        <div class="typeName">{{ activeItem.name }}</div>
        <div class="modItems">
          <div class="modItem" v-for="(mod, index) in activeItemMods" :key="index" :class="{active: modIndex === index }" @click="setModActive(index)">
            <div class="modIcon">
              <div class="point"></div>
            </div>
            <div class="modName">{{ mod.modName }}</div>
          </div>
        </div>
        <div class="noModData" v-if="activeItemMods.length === 0">暂无mod数据</div>
      </div>

      <!-- mod展示區域,按鈕放底部 -->
      <div class="modDetailContent" v-if="modIndex >= 0">
        <!-- 滾動播放 -->
        <el-carousel
          height="100%"
          v-if="!!activeItemMods[modIndex].imgs && activeItemMods[modIndex].imgs.length"
        >
          <el-carousel-item
            v-for="(item, imgIndex) in activeItemMods[modIndex].imgs"
            :key="imgIndex"
          >
            <img :src="item" />
          </el-carousel-item>
        </el-carousel>
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
    const fs = require("fs");
    const fsextra = require("fs-extra");

    return {
      fs: fs,
      fsextra: fsextra,
      game: "genshin", // 當前遊戲 默認原神
      filePath: "config.ini",

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

      // 应用动态数据
      configData: null, // 配置文件数据
      activeKey: null, // 当前选中的角色/技能/UI key
      modIndex: 0, // 选择的mod index -1表示未选中
    };
  },

  computed: {
    // 显示的角色列表(也可以是场景，技能列表)
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

    // 选择的角色/技能/场景
    activeItem() {
      if(!!this.activeKey) {
        return this.roleList.find(item => {
          return item.key === this.activeKey;
        })
      }
      return null;
    },

    // 选择的角色/技能/场景对应的mod列表
    activeItemMods() {
      if(!!this.activeKey) {
        return this.configData[this.activeKey] || [];
      }
      return [];
    },
  },

  mounted() {
    // this.getRoleList();

    // 初始化config數據
    if (!this.checkConfig()) {
      this.fs.writeFileSync(this.filePath, "");
    }

    if (!this.configData) {
      this.configData = this.readConfig();
    }
    console.log("configData", this.configData);
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

    // 选择角色、技能、场景
    setActiveItem(item) {
      this.activeKey = item.key;
      console.log("activeKey", item);
      console.log("modList", this.configData[item.key]);
      this.modIndex = -1;
      if(!!this.configData[item.key] && !!this.configData[item.key].length) {
        this.setModActive(0);
      }
    },

    // 选中mod
    setModActive(index) {
      this.modIndex = index;
      let modItem = this.activeItemMods[index];
      if (!!modItem) {
        let files = this.readDir(modItem.modPath);

        // 获取目录下png、jpg文件
        let imgs = files.filter((fileName) => {
          if (!!fileName) {
            let arr = fileName.toString().split(".");
            if (arr[arr.length - 1] === "png" || arr[arr.length - 1] === "jpg") {
              return true;
            }
          }
          return false;
        });
        // 将上述获取的文件转换base64并添加到configData中
        let newModItem = {
          ...modItem,
          imgs: imgs.map((i) => {
            let imgPath = `${modItem.modPath}/${i}`;
            let data = this.fs.readFileSync(imgPath);
            return `data:image/png;base64,${new Buffer(data, "binary").toString(
              "base64"
            )}`;
          }),
        }
        this.$set(this.configData[this.activeKey], this.modIndex, newModItem);
      }
    },


    

    // 檢查文件是否存在
    checkConfig() {
      try {
        this.fs.accessSync(this.filePath, this.fs.constants.F_OK);
        return true;
      } catch (error) {
        return false;
      }
    },

    // 读取配置文件内容
    readConfig() {
      // 同步读取配置文件
      const data = this.fs.readFileSync(this.filePath, "utf-8");
      try {
        return JSON.parse(data) || {};
      } catch (error) {
        return data || {};
      }
    },

    // 讀取文件夾內容
    readDir(path) {
      const files = this.fs.readdirSync(path);
      return files;
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
      width: 475px;
      height: calc(100% - 1px);
      overflow: hidden;
      padding-top: 1px;

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
            border: 2px solid;

            &:hover {    
              transform: scale(1.1);
              border-color: white;
            }

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

          &:hover, &.active {
            background: linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0));
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
            border: 1.5px solid rgba(236, 229, 216, 0);;

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

          &.active {
            transform: scale(1.1);
            transform-origin: left;
            background: none;
            .modName {
              margin-left: 5px;
            }
          }
        }
      }

      .noModData {
        font-size: 28px;
        text-align: center;
        margin-top: 30px;
      }
    }

    .modDetailContent {
      flex: 1;
      position: relative;
      background-color: rgba(255,255,255,0.2);
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

      .buttons {
        top: -50px;
        width: 100%;
        position: absolute;
        z-index: 99;
        text-align: center;
        transition: top 0.5s ease-out;
      }

      &:hover {
        .buttons {
          top: 20px;
        }
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
  }
}
</style>
