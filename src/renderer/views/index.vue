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
            <div
              class="roleItem"
              v-for="item in roleList"
              :key="item.key"
              @click="setActiveItem(item)"
            >
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
          <div
            class="modItem"
            v-for="(mod, index) in activeItemMods"
            :key="index"
            :class="{ active: modIndex === index }"
            @click="setModActive(index)"
          >
            <div class="modIcon">
              <div class="point"></div>
            </div>
            <div class="modName" :title="mod.modName">{{ mod.modName }}</div>
            <i
              class="el-icon-delete-solid deleteMod"
              @click.stop="deleteMod(index)"
            ></i>
          </div>
        </div>
        <div class="noModData" v-if="activeItemMods.length === 0">
          暂无mod数据
        </div>
      </div>

      <!-- mod展示區域,按鈕放底部 -->
      <div class="modDetailContent" v-if="modIndex >= 0">
        <!-- 滾動播放 -->
        <el-carousel
          height="100%"
          v-if="
            !!activeItemMods[modIndex].imgs &&
            activeItemMods[modIndex].imgs.length
          "
        >
          <el-carousel-item
            v-for="(item, imgIndex) in activeItemMods[modIndex].imgs"
            :key="imgIndex"
          >
            <img :src="item" />
          </el-carousel-item>
        </el-carousel>
        <!-- mod名称 -->
        <div class="modDetailName">{{ activeItemMods[modIndex].modName }}</div>
        <!-- 按鈕區域 -->
        <div class="buttons">
          <el-button type="primary" size="mini" @click="applyMod()"
            >应用</el-button
          >
          <el-button type="primary" size="mini" @click="applyMod(true)"
            >卸载</el-button
          >
        </div>
      </div>
    </div>

    <el-drawer
      title="新增mod"
      :visible.sync="dialogVisible"
      direction="rtl"
      :show-close="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色" prop="roleKey">
          <el-select
            v-model="form.roleKey"
            placeholder="请选择"
            @change="roleChange()"
          >
            <el-option
              :label="roleItem.name"
              :value="roleItem.key"
              v-for="roleItem in roleList"
              :key="roleItem.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="mod名称" prop="modName">
          <el-input v-model="form.modName"></el-input>
        </el-form-item>
        <el-form-item label="mod路徑">
          <el-input disabled v-model="form.modPath"></el-input>
        </el-form-item>
      </el-form>
      <span class="drawFooter">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMod(true)">确 定</el-button>
      </span>
    </el-drawer>
  </div>
</template>

<script>
import { deepClone } from "../utils/index.js";
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
      modIndex: -1, // 选择的mod index -1表示未选中

      form: {}, // 弹窗表单
      rules: {
        roleKey: [{ required: true, message: "请選擇角色", trigger: "blur" }],
        modName: [
          { required: true, message: "请輸入mod名稱", trigger: "blur" },
        ],
      },
      dialogVisible: false, // 弹窗是否显示
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
        return a.sort - b.sort;
      });
      return roleListOrigin;
    },

    // 选择的角色/技能/场景
    activeItem() {
      if (!!this.activeKey) {
        return this.roleList.find((item) => {
          return item.key === this.activeKey;
        });
      }
      return null;
    },

    // 选择的角色/技能/场景对应的mod列表
    activeItemMods() {
      if (!!this.activeKey) {
        return this.configData[this.activeKey] || [];
      }
      return [];
    },

    // 拖拽进来的文件、文件夹路径
    dropIntoFilePath() {
      return this.$store.state.dropIntoFilePath || null;
    },
  },

  watch: {
    // 监听拖拽路径变化
    dropIntoFilePath(url) {
      let path = decodeURIComponent(url || "");
      console.log("拖拽进来的文件夹路径:", path);
      if (!!path) {
        this.addMod(path);
      }
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
      console.log("setActiveItem");
      this.activeKey = item.key;
      console.log("activeKey", item);
      console.log("modList", this.configData[item.key]);
      this.modIndex = -1;
      if (!!this.configData[item.key] && !!this.configData[item.key].length) {
        this.setModActive(0);
      }
    },

    // 选中mod
    setModActive(index) {
      console.log("setModActive");
      this.modIndex = index;
      let modItem = this.activeItemMods[index];
      if (!!modItem) {
        let files = this.readDir(modItem.modPath);

        // 获取目录下png、jpg文件
        let imgs = files.filter((fileName) => {
          if (!!fileName) {
            if (fileName.includes("ShadowRamp")) return false;
            let arr = fileName.toString().split(".");
            if (
              arr[arr.length - 1] === "png" ||
              arr[arr.length - 1] === "jpg"
            ) {
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
        };
        this.$set(this.configData[this.activeKey], this.modIndex, newModItem);
      }
    },

    // 弹窗中选择角色
    roleChange() {
      let roleItem = this.roleList.find((i) => i.key === this.form.roleKey);
      console.log(roleItem);
      if (!!roleItem) {
        this.form.roleName = roleItem.name;
      }
    },

    // 應用mod
    applyMod(isDelete = false) {
      let modInfo = deepClone(this.activeItemMods[this.modIndex]);
      // 讀取mod目錄下文件
      let modsPath = this.configData.modsPath;
      let mods = this.readDir(modsPath);
      let repeatModFileName = mods.find((name) =>
        name.includes(`${modInfo.roleName}_`)
      );
      try {
        if (!!repeatModFileName) {
          this.fsextra.removeSync(`${modsPath}/${repeatModFileName}`);
        }

        if (!isDelete) {
          let modPath = `${modsPath}/${modInfo.roleName}_${modInfo.modName}`;
          this.fsextra.copySync(modInfo.modPath, modPath);
          // this.$message({
          //   message: "應用成功",
          //   type: "success",
          // });
          this.$notify({
            title: "成功",
            message: "应用成功",
            type: "success",
            position: "top-right",
          });
        } else {
          // this.$message({
          //   message: "卸载成功",
          //   type: "success",
          // });
          this.$notify({
            title: "成功",
            message: "卸载成功",
            type: "success",
            position: "top-right",
          });
        }
      } catch (error) {}
    },

    // 删除mod记录
    deleteMod(index) {
      let newModList = this.activeItemMods.filter((item, modIndex) => {
        return modIndex !== index;
      });
      this.$set(this.configData, this.activeKey, newModList);
      if (newModList.length === 0) this.modIndex = -1;
      else if (this.modIndex >= index) this.modIndex += -1;
      this.updateConfig();
    },

    // mod添加弹窗 || 添加mod || 添加图片
    addMod(path) {
      // 彈窗確認
      if (path === true) {
        this.$refs.form.validate((valid) => {
          if (valid) {
            let configData = deepClone(this.configData);
            let modList = [
              ...(configData[this.form.roleKey] || []),
              deepClone(this.form),
            ];
            configData[this.form.roleKey] = modList;
            this.configData = configData;
            this.updateConfig();

            if (this.modIndex === -1) this.setModActive(0);
            this.dialogVisible = false;
            this.$notify({
              title: "成功",
              message: "添加成功",
              type: "success",
              position: "top-right",
            });
          } else {
            return false;
          }
        });
        return;
      }

      let newPath = path.toString().split("file:///")[1];
      this.store.dispatch("changeDropIntoFilePath", null);
      // 拖拽进来的是图片
      if (
        newPath.toString().includes(".png") ||
        newPath.toString().includes(".jpg")
      ) {
        if (!this.activeItem) return;
        let modItem = this.modList[this.modIndex];
        let fileName = newPath.split("/").pop();
        this.fs.copyFileSync(newPath, `${modItem.modPath}/${fileName}`);
        this.setModActive(this.modIndex);
        return;
      }
      // 这里最好检测下拖拽的是不是文件夹
      // this.readDir(newPath);

      let modName = newPath.split("/");
      modName = modName[modName.length - 1];

      // 記錄mod信息
      let detailItem = Object.assign({}, this.activeItem) || {
        key: "",
        name: "",
      };
      let modItem = {
        roleKey: detailItem.key,
        roleName: detailItem.name,
        modPath: newPath,
        modName: modName,
      };
      console.log(modItem);
      this.form = modItem;

      this.dialogVisible = true;
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

    // 更新config文件
    updateConfig() {
      try {
        // 保存之前删除图片缓存
        let configData = JSON.parse(JSON.stringify(this.configData));
        Object.keys(configData).forEach((key) => {
          if (!!this.isArray(configData[key]) && !!configData[key].length) {
            let roleItemMods = configData[key];
            roleItemMods.forEach((item) => {
              delete item.imgs;
            });
          }
        });

        // 更新文件
        this.fs.writeFileSync(this.filePath, JSON.stringify(configData, null, 4), 'utf-8');
      } catch (error) {
        console.log("error", error);
      }
    },

    isArray(obj) {
      return typeof obj === "object" && Array.isArray(obj);
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
              overflow: hidden;
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
          position: relative;

          &:hover,
          &.active {
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0)
            );
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

          .el-button + .el-button {
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
  }
}
</style>
