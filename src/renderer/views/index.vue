<template>
  <div class="bgImage" :style="getBgImg()">
    <div class="layer">
      <!-- 大分類欄 底部切換原神/星鐵按鈕 -->
      <div class="leftTabs">
        <div class="tabIcon">
          <img :src="!!game ? `./config/${game}/index.ico` : normalGameIcon" />
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
            <span
              class="iconfont icon-change"
              @click="showChangeGame = true"
            ></span>
          </div>
        </div>
      </div>

      <!-- 类型 选择区域 -->
      <choose-content
        v-if="tabList.length"
        :list="chooseContentList"
        @change="setActiveItem"
        :type="tabList[tabIndex].value"
        @addType="addOtherType"
      ></choose-content>
      <!-- 具体mod选择区域 -->
      <mod-content
        v-if="!!activeKey"
        v-model="modIndex"
        :activeItem="activeItem"
        :list="activeItemMods"
        @change="setModActive"
        @delete="deleteMod"
      ></mod-content>
      <!-- mod展示區域,按鈕放底部 -->
      <mod-detail-content
        v-if="modIndex >= 0"
        :mod="modItem"
        @applyMod="applyMod"
      ></mod-detail-content>
    </div>

    <el-drawer
      title="新增mod"
      :visible.sync="dialogVisible"
      direction="rtl"
      :show-close="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <!-- 添加角色mod -->
        <el-form-item label="角色/分类" prop="roleKey">
          <el-select
            v-model="form.roleKey"
            placeholder="请选择"
            filterable
            @change="roleChange()"
          >
            <el-option
              :label="roleItem.name"
              :value="roleItem.key"
              v-for="roleItem in chooseContentList"
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

    <el-drawer
      title="新增分类"
      :visible.sync="showAddType"
      direction="rtl"
      :show-close="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="form.typeName"></el-input>
        </el-form-item>
        <el-form-item label="分类标识" prop="typeKey">
          <el-input v-model="form.typeKey"></el-input>
        </el-form-item>
        <el-form-item label="分类图标" prop="typeIcon">
          <el-input v-model="form.typeIcon"></el-input>
        </el-form-item>
      </el-form>
      <span class="drawFooter">
        <el-button @click="showAddType = false">取 消</el-button>
        <el-button type="primary" @click="addType()">确 定</el-button>
      </span>
    </el-drawer>

    <el-dialog
      title="初始化"
      :visible.sync="showChoose3DmigotoPath"
      width="500px"
      height="500px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-input
        :value="gameBaseData ? gameBaseData.modsPath : '' || ''"
        disabled
        placeholder="请选择mod应用路径"
      >
        <el-button
          slot="append"
          icon="el-icon-plus"
          @click="chooseGamePath"
        ></el-button>
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="!gameBaseData || !gameBaseData.modsPath"
          @click="showChoose3DmigotoPath = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="选择游戏"
      :visible.sync="showChangeGame"
      width="500px"
      height="500px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="gameList">
        <div
          class="gameItem"
          v-for="(item, index) in indexConfigData"
          :key="item.key"
          @click="gameChange(index)"
        >
          <div class="gameIcon">
            <img :src="`./config/${game}/index.ico`" />
          </div>
          <div class="gameName">{{ item.name || item.key }}</div>
        </div>
        <div class="gameItem isAdd">
          <div class="gameIcon" @click="chooseGameIcon">
            <img v-if="!!addGameForm.icon" :src="addGameForm.icon" />
            <i v-else class="el-icon-plus"></i>
          </div>
          <div class="gameName">
            <el-input
              v-model="addGameForm.name"
              placeholder="英文标识"
              aligen="center"
            ></el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="indexConfigData.length === 0 && !addGameForm.name"
          @click="addNewGame"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from "../utils/index.js";
import { bgImg } from "../utils/img.js";

import chooseContent from "../components/chooseContent.vue";
import modContent from "../components/modContent.vue";
import modDetailContent from "../components/modDetailContent.vue";

export default {
  name: "MihoyoModManager",
  components: { chooseContent, modContent, modDetailContent },
  data() {
    const fs = require("fs");
    const fsextra = require("fs-extra");

    const electron = require("vue-electron");

    return {
      fs: fs,
      fsextra: fsextra,
      electron: electron,

      indexConfigData: [], // 最基础信息,包含当前config目录下各个游戏的基础信息

      showChoose3DmigotoPath: false, // 是否第一次使用该管理器，需要选择游戏路径
      gamePath: "", // 游戏目录

      game: "", // 當前遊戲
      pageLoading: false, // 页面loading

      tabIndex: 0,

      // 通用参数
      activeKey: null, // 当前选中的角色/技能/UI key
      gameBaseData: null, // 基础配置文件信息，包含当前游戏的基础信息
      modConfigData: null, // mod配置文件信息
      modIndex: -1, // 选择的mod index -1表示未选中

      // 弹窗参数
      dialogVisible: false, // 添加mod弹窗
      showAddType: false, // 添加分类弹窗
      form: {}, // 弹窗表单
      rules: {
        roleKey: [{ required: true, message: "请選擇角色", trigger: "change" }],
        modName: [
          { required: true, message: "请輸入mod名稱", trigger: "change" },
        ],
        typeName: [
          { required: true, message: "请輸入分类名稱", trigger: "change" },
        ],
        typeKey: [
          { required: true, message: "请輸入分类标识", trigger: "change" },
        ],
      },

      showChangeGame: false, // 显示切换游戏弹窗
      addGameForm: {
        name: "",
        icon: "",
      },
    };
  },

  computed: {
    // 动态显示左侧tab栏
    tabList() {
      if (!!this.game) {
        return this.gameBaseData.tabList || [];
      }
      return [];
    },

    // 动态显示选择栏
    chooseContentList() {
      if (!!this.game && !!this.tabList.length && this.tabIndex >= 0) {
        let key = this.tabList[this.tabIndex].value;
        let typeListIniPath = `./config/${this.game}/${key}.ini`;
        if (!this.checkConfig(typeListIniPath)) {
          this.fs.writeFileSync(typeListIniPath, "");
        }
        let roleInfo = this.readConfig(typeListIniPath) || [];
        return roleInfo;
      }
      return [];
    },

    // 选择的角色/技能/场景
    activeItem() {
      if (!!this.activeKey) {
        let item = this.chooseContentList.find((item) => {
          return item.key === this.activeKey;
        });
        return item;
      }
      return null;
    },

    // 选中角色、类型下的mod列表
    activeItemMods() {
      if (!!this.modConfigData && !!this.tabList && this.tabIndex >= 0) {
        let key = this.tabList[this.tabIndex].value;
        let typeList = this.modConfigData[key] || {};
        let modList = typeList[this.activeItem.key] || [];
        return modList;
      }
      return [];
    },

    modItem() {
      if (
        !!this.activeItemMods &&
        this.activeItemMods.length > 0 &&
        this.modIndex >= 0
      ) {
        let modItem = this.activeItemMods[this.modIndex] || null;
        return modItem;
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
    // 获取基础配置
    this.getIndexConfig();

    // 初始化游戏类型
    // this.gameChange();
  },

  methods: {
    getIndexConfig() {
      let configDir = "./config";
      if (!this.fs.existsSync(configDir)) {
        // 创建config目录
        this.fs.mkdirSync(configDir);
      }

      // 初始化所有游戏config數據
      const subdirs = this.fs.readdirSync(configDir);
      const directories = subdirs.filter((subdir) => {
        let fullPath = `${configDir}/${subdir}`;
        return this.fs.statSync(fullPath).isDirectory();
      });

      // 创建游戏
      if (directories.length === 0) {
        this.showChangeGame = true;
      }

      directories.forEach((dir) => {
        let gemeIniPath = `${configDir}/${dir}/index.ini`;
        let gameInfo = this.readConfig(gemeIniPath) || {};
        this.indexConfigData = [...this.indexConfigData, gameInfo];
      });

      this.gameChange(0);
    },

    // 游戏切换
    gameChange(index) {
      this.tabIndex = 0;
      this.activeKey = null;
      this.modIndex = -1;
      this.gameBaseData = this.indexConfigData[index];
      this.game = this.gameBaseData.key;

      // 初始化获取配置
      this.init();
    },

    // 初始化获取配置
    init() {
      console.log("gameBaseData", this.gameBaseData);

      this.modConfigData =
        this.readConfig(`./config/${this.game}/mod.ini`) || {};

      // 选择3Dmigoto路径
      if (!this.gameBaseData.modsPath) {
        this.showChoose3DmigotoPath = true;
      }
    },

    // 选择游戏路径
    chooseGamePath() {
      console.log(this.$electron);
      this.$electron.remote.dialog.showOpenDialog(
        {
          properties: ["openDirectory"],
        },
        ([modsPath]) => {
          console.log(modsPath);
          this.$set(
            this.gameBaseData,
            "modsPath",
            modsPath.replace(/\\/g, "/")
          );
          // this.updateConfig();
        }
      );
    },

    // 选择文件
    chooseFile() {
      return new Promise((resolve, reject) => {
        this.$electron.remote.dialog.showOpenDialog(
          {
            properties: ["openFile"],
          },
          ([filePath]) => {
            resolve(filePath);
          }
        );
      });
    },

    // 选择游戏图标
    chooseGameIcon() {
      this.chooseFile().then((filePath) => {
        let newFilePath = `config/linshi.ico`;
        this.fsextra.copySync(filePath, newFilePath);
        this.addGameForm.icon = newFilePath;
      });
    },

    // 新增游戏
    addNewGame() {
      if (!!this.addGameForm.name) {
        let gamePath = `./config/${this.addGameForm.name}`;
        if (!!this.fs.existsSync(gamePath)) {
          this.$message({
            showClose: true,
            message: "已存在相同key的游戏，请重新输入key",
            type: "error",
          });
          return;
        }
        // 创建config目录
        this.fs.mkdirSync(gamePath);
        let gameInfo = {
          key: this.addGameForm.name,
          name: this.addGameForm.name,
          tabList: [
            {
              label: "角",
              des: "角色分类",
              value: "role",
            },
            // {
            //   label: "景",
            //   des: "场景分类",
            //   value: "scene",
            // },
            // {
            //   label: "技",
            //   des: "技能分类",
            //   value: "skill",
            // },
            // {
            //   label: "工",
            //   des: "工具分类",
            //   value: "tool",
            // },
          ],
        };

        // 创建配置文件
        this.fs.writeFileSync(
          `${gamePath}/index.ini`,
          JSON.stringify(gameInfo)
        );
        // 创建游戏图标
        if (!!this.addGameForm.icon)
          this.fsextra.copySync(this.addGameForm.icon, `${gamePath}/index.ico`);

        // 更新内存数据
        this.indexConfigData.push(gameInfo);
      }

      if (!!this.addGameForm.icon) {
        this.fsextra.removeSync(this.addGameForm.icon);
      }

      this.showChangeGame = false;
      this.addGameForm = {
        name: null,
        icon: null,
      };

      if (this.indexConfigData.length === 1) {
        this.gameChange(0);
      }
    },

    // 设置对应游戏背景
    getBgImg() {
      let backgroundImg = `./config/${this.game ? `${this.game}/` : ""}bg.png`;
      if (!this.checkConfig(backgroundImg)) backgroundImg = bgImg.normal;
      return `background-image: url(${backgroundImg})`;
    },

    // tab切换
    changeTab(index) {
      this.activeKey = null;
      this.modIndex = -1;
      this.tabIndex = index;
    },

    // 选择角色、技能、场景
    setActiveItem(key) {
      console.log(key);
      this.activeKey = key;
      this.modIndex = -1;

      let tabKey = this.tabList[this.tabIndex].value;
      let modList = this.modConfigData[tabKey][key] || [];

      if (!!modList && !!modList.length) {
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
        // 将上述获取的文件转换base64并添加到modConfigData中
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
        this.$set(
          this.modConfigData[this.activeItem.type || "role"][
            this.activeItem.key
          ],
          this.modIndex,
          newModItem
        );
      }
    },

    // 弹窗中选择角色、类型
    roleChange() {
      let roleItem = this.chooseContentList.find(
        (i) => i.key === this.form.roleKey
      );
      console.log(roleItem);
      if (!!roleItem) {
        this.form.roleName = roleItem.name;
      }
    },

    // 應用mod
    applyMod(isDelete = false) {
      if (!this.modItem) return;
      let modInfo = this.modItem;
      // 讀取mod目錄下文件
      let modsPath = this.gameBaseData.modsPath;
      console.log(modsPath);
      // 非角色mod增加一层文件夹读取
      if (!!this.activeItem.des) {
        modsPath = `${modsPath}/${this.activeItem.des}`;
        try {
          this.fs.accessSync(modsPath, this.fs.constants.F_OK);
        } catch (error) {
          this.fs.mkdirSync(modsPath, { recursive: true });
        }
      }
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
      this.$set(
        this.modConfigData[this.activeItem.type || "role"],
        this.activeItem.key,
        newModList
      );

      if (newModList.length === 0) this.modIndex = -1;
      else if (this.modIndex >= index) this.modIndex += -1;
      this.updateModConfig();
    },

    // mod添加弹窗 || 添加mod || 添加图片
    addMod(path) {
      // 彈窗確認
      if (path === true) {
        this.$refs.form.validate((valid) => {
          if (valid) {
            let key = this.tabList[this.tabIndex].value;
            let modConfigData = deepClone(this.modConfigData || {});

            if (!modConfigData[key]) {
              modConfigData[key] = {};
              modConfigData[key][this.form.roleKey] = [];
            }
            let modTypeList = modConfigData[key][this.form.roleKey] || [];

            modConfigData[key][this.form.roleKey] = [
              ...modTypeList,
              deepClone(this.form),
            ];

            this.modConfigData = modConfigData;
            this.updateModConfig();

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

    // 其他类型mod、工具，添加弹窗
    addOtherType() {
      this.form = {
        typeKey: "",
        typeName: "",
        typeIcon: "",
        type: this.tabList[this.tabIndex].value,
        des: this.tabList[this.tabIndex].des,
      };

      this.showAddType = true;
    },

    // 其他类型mod、工具，添加确认
    addType() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        let chooseContentList = deepClone(this.chooseContentList);

        // 校验是否有重复名称的分类
        let index = chooseContentList.findIndex(
          (i) => i.key === this.form.typeKey
        );
        if (index >= 0) {
          this.$notify({
            title: "错误",
            message: "新增失败，已存在该分类",
            type: "error",
            position: "top-left",
          });
          return;
        }

        let newTypeItem = {
          key: this.form.typeKey,
          name: this.form.typeName,
          icon: this.form.typeIcon || `./config/${this.game}/index.ico`,
          mods: [],
          des: this.form.des,
          type: this.form.type,
          sort:
            this.chooseContentList.length === 0
              ? 1
              : this.chooseContentList[this.chooseContentList.length - 1].sort +
                1,
        };
        chooseContentList.push(newTypeItem);

        // 更新配置文件
        let key = this.tabList[this.tabIndex].value;
        let typeListIniPath = `./config/${this.game}/${key}.ini`;
        this.fs.writeFileSync(
          typeListIniPath,
          JSON.stringify(chooseContentList, null, 4),
          "utf-8"
        );

        this.$notify({
          title: "成功",
          message: "新增成功",
          type: "success",
          position: "top-left",
        });
        let tabIndex = this.tabIndex;
        this.tabIndex = -1;
        this.tabIndex = tabIndex;
        this.showAddType = false;
      });
    },

    // 更新config文件
    updateModConfig() {
      try {
        // 保存之前删除图片缓存
        let modConfigData = deepClone(this.modConfigData || {});
        Object.keys(modConfigData).forEach((key) => {
          let typeList = modConfigData[key] || {};
          Object.keys(typeList).forEach((typeKey) => {
            let modList = typeList[typeKey] || [];
            if (!!this.isArray(modList) && !!modList.length) {
              modList.forEach((item) => {
                delete item.imgs;
              });
            }
          });
        });
        console.log("modConfigData", modConfigData);

        let modInfoPath = `./config/${this.game}/mod.ini`;
        // 更新文件
        this.fs.writeFileSync(
          modInfoPath,
          JSON.stringify(modConfigData, null, 4),
          "utf-8"
        );
      } catch (error) {
        console.log("error", error);
      }
    },

    // 檢查文件是否存在
    checkConfig(filePath) {
      try {
        this.fs.accessSync(filePath, this.fs.constants.F_OK);
        return true;
      } catch (error) {
        return false;
      }
    },

    // 读取文件内容
    readConfig(filePath) {
      // 同步读取配置文件
      const data = this.fs.readFileSync(filePath, "utf-8");
      try {
        return JSON.parse(data);
      } catch (error) {
        console.log("read error", error);
        return data;
      }
    },

    // 讀取文件夾內容
    readDir(path) {
      const files = this.fs.readdirSync(path);
      return files;
    },

    // 判断是否为数组
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
  background-repeat: no-repeat;
  background-position: center center;

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

.gameList {
  display: flex;

  .gameItem {
    width: 120px;
    margin-left: 20px;
    cursor: pointer;
    border: 2px solid;
    box-sizing: border-box;
    border-radius: 5px;
    border-color: transparent;

    &:hover {
      border-color: #0645ad;
    }

    &:first-child {
      margin-left: 0;
    }

    .gameIcon {
      width: 120px;
      height: 160px;
      border-radius: 10px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .gameName {
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      margin-top: 20px;
    }

    &.isAdd {
      cursor: default;

      &:hover {
        border-color: transparent;
      }

      .gameIcon {
        display: flex;
        align-items: center;
        border: 1px solid #dcdfe6;
        box-sizing: border-box;
        cursor: pointer;

        i {
          font-size: 60px;
          margin: auto;
          color: #dcdfe6;
        }
      }
      .gameName {
        margin-top: 10px;

        ::v-deep input {
          text-align: center;
        }
      }
    }
  }
}
</style>
