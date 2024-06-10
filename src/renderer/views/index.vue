<template>
    <div class="bgImage" :style="getBgImg()">
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
              <span class="iconfont icon-change" @click="gameChange"></span>
            </div>
          </div>
        </div>

        <template v-if="game === 'genshin'">
          <!-- 类型 选择区域 -->
          <choose-content :list="chooseContentList" @change="setActiveItem" :type="tabListForGenshin[tabIndex].value"></choose-content>
          <!-- 具体mod选择区域 -->
          <mod-content  v-if="!!activeKey" v-model="modIndex" :activeItem="activeItem" :configData="configData" @change="setModActive" @delete="deleteMod"></mod-content>
          <!-- mod展示區域,按鈕放底部 -->
          <mod-detail-content v-if="modIndex >= 0" :mod="modItem" @applyMod="applyMod"></mod-detail-content>
        </template>
      </div>
    </div>
</template>

<script>
import { deepClone } from "../utils/index.js";
import { allRoleInfo } from "../utils/roleInfo.js";
import { bgImg } from '../utils/img.js'

import chooseContent from "../components/chooseContent.vue";
import modContent from "../components/modContent.vue";
import modDetailContent from "../components/modDetailContent.vue";

export default {
  name: "MihoyoModManager",
  components: { chooseContent, modContent, modDetailContent },
  data() {
    const fs = require("fs");
    const fsextra = require("fs-extra");

    return {
      fs: fs,
      fsextra: fsextra,

      game: "genshin", // 當前遊戲 默認原神
      pageLoading: false, // 页面loading
      filePath: "config.ini",

      tabIndex: 0,
      // 左側欄大分類
      tabListForGenshin: [
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
      tabListForStarrail: [],

      // 通用参数
      activeKey: null, // 当前选中的角色/技能/UI key
      configData: null, // 配置文件数据
      modIndex: -1, // 选择的mod index -1表示未选中


      // 原神参数
      allRoleInfo: allRoleInfo, // 角色数据


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
    // 动态显示左侧tab栏
    tabList() {
      if(this.game === 'genshin') {
        return this.tabListForGenshin;
      } else if (this.game === 'starrail') {
        return this.tabListForStarrail;
      }
      return [];
    },

    // 动态显示选择栏
    chooseContentList() {
      if(this.game === 'genshin') {
        switch(this.tabList[this.tabIndex].value) {
          case 'role': return this.allRoleInfo || [];
        }
      }
    },

    // 选择的角色/技能/场景
    activeItem() {
      if (!!this.activeKey) {
        return this.chooseContentList.find((item) => {
          return item.key === this.activeKey;
        });
      }
      return null;
    },

    // 选中角色、类型下的mod列表
    activeItemMods() {
      if(!!this.activeItem && !!this.activeItem.key) {
        let activeItemMods = this.configData[this.activeItem.key] || [];
        return activeItemMods
      }
      return [];
    },

    modItem() {
      if(!!this.activeItemMods && this.activeItemMods.length > 0 && this.modIndex >= 0) {
        let modItem = this.activeItemMods[this.modIndex] || null;
        return modItem
      }
      return null;
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
    // 游戏切换
    gameChange() {
      this.tabIndex = 0;
      this.activeKey = null;
      this.modIndex = -1;
      this.game = this.game === "genshin" ? "starrail" : "genshin";
    },

    // 设置对应游戏背景
    getBgImg() {
      return `background-image: url(${bgImg[this.game]})`
    },

    // tab切换
    changeTab(index) {
      this.tabIndex = index;
    },

    // 选择角色、技能、场景
    setActiveItem(key) {
      this.activeKey = key;
      this.modIndex = -1;
      if (!!this.configData[key] && !!this.configData[key].length) {
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
      if(!this.modItem) return;
      let modInfo = this.modItem;
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

          this.$notify({
            title: "成功",
            message: "应用成功",
            type: "success",
            position: "top-right",
          });
        } else {
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
  }
}
</style>
