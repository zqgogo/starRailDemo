<template>
  <div class="pageHome">
    <template v-if="!detailItem">
      <div class="tabs">
        <div
          class="tabItem"
          :style="`backgroundColor: ${
            tabIndex === index ? visionColor[roleVision[tabItem.role]] : ''
          }`"
          v-for="(tabItem, index) in tabsList"
          :key="index"
          @click="tabChange(index)"
        >
          <div class="roleHeadImg"><img :src="head2[tabItem.role]" /></div>
          <div class="roleType">{{ tabItem.text }}</div>
        </div>
      </div>

      <div class="roles">
        <div
          class="role"
          v-for="(roleItem, roleIndex) in tabsList[tabIndex].children"
          :key="roleIndex"
          @click="showDetail(roleItem)"
        >
          <div class="roleImg">
            <img :src="roleItem.head" />
          </div>
          <div class="roleName">{{ roleItem.name }}</div>
        </div>
      </div>
    </template>

    <!-- 詳情頁面 -->
    <template v-else>
      <div class="detailContent">
        <div class="tabs">
          <div
            class="tabItem"
            :style="`backgroundColor: ${
              tabIndex === index ? visionColor[roleVision[tabItem.role]] : ''
            }`"
            v-for="(tabItem, index) in tabsList"
            :key="index"
            @click="tabChange(index)"
          >
            <div class="roleHeadImg"><img :src="head[tabItem.role]" /></div>
            <div class="roleType">{{ tabItem.text }}</div>
          </div>
        </div>

        <div class="roles">
          <div
            class="role"
            v-for="(roleItem, roleIndex) in tabsList[tabIndex].children"
            :key="roleIndex"
            @click="showDetail(roleItem)"
          >
            <div class="roleImg">
              <img :src="roleItem.head" />
            </div>
            <div class="roleName">{{ roleItem.name }}</div>
          </div>
        </div>

        <div class="roleMods">
          <div
            class="modName"
            :class="[{ active: modIndex === index }]"
            v-for="(modItem, index) in modList"
            :key="modItem.name"
            @click="modChange(index)"
          >
            {{ modItem.modName }}
          </div>
        </div>

        <div class="roleModDetail">
          <template v-if="modIndex >= 0">
            <el-carousel
              height="100%"
              v-if="!!modList[modIndex].imgs && modList[modIndex].imgs.length"
            >
              <el-carousel-item
                v-for="item in modList[modIndex].imgs"
                :key="item"
              >
                <img :src="item" />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="noImg"><img :src="detailItem.head" /></div>
            <div class="buttons">
              <el-button type="primary" size="mini" @click="applyMod()"
                >應用</el-button
              >
              <el-button type="primary" size="mini" @click="applyMod(true)"
                >卸載</el-button
              >
            </div>
          </template>
        </div>
      </div>
    </template>

    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="400px"
      :show-close="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色類型">
          <el-select v-model="tabIndex" placeholder="请选择">
            <el-option
              :label="typeItem.text"
              :value="typeIndex"
              v-for="(typeItem, typeIndex) in tabsList"
              :key="typeItem.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleKey">
          <el-select
            v-model="form.roleKey"
            placeholder="请选择"
            @change="roleChange()"
          >
            <el-option
              :label="roleItem.name"
              :value="roleItem.key"
              v-for="roleItem in tabsList[tabIndex].children"
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMod(true)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { head, head2 } from "../utils/img.js";
import {
  roleVision,
  visionColor,
  roleName,
  roleSexType,
} from "../utils/type.js";

// import Swiper from "swiper";

export default {
  name: "landing-page",

  data() {
    const fs = require("fs");
    const fsextra = require("fs-extra");
    return {
      tabIndex: 0,
      tabsList: [
        {
          key: "woman",
          text: "成女",
          role: "Xianyun",
          remark: "女性角色",
        },
        {
          key: "loli",
          text: "萝莉",
          role: "Klee",
          remark: "萝莉角色",
        },
        {
          key: "man",
          text: "男性",
          role: "Gaming",
          remark: "男性角色",
        },
      ],
      head: head,
      head2: head2,
      roleVision: roleVision,
      visionColor: visionColor,

      detailItem: null,
      configData: null,

      fs: fs,
      fsextra: fsextra,
      filePath: "config.ini",
      modIndex: -1,

      dialogVisible: false, // 添加mod彈窗
      form: {},
      rules: {
        roleKey: [{ required: true, message: "请選擇角色", trigger: "blur" }],
        modName: [
          { required: true, message: "请輸入mod名稱", trigger: "blur" },
        ],
      },
      modList: [],
    };
  },

  computed: {
    dropIntoFilePath() {
      return this.$store.state.dropIntoFilePath || null;
    },
  },

  watch: {
    dropIntoFilePath(url) {
      let path = url;
      console.log(this.$store.commit);
      console.log("拖拽进来的文件夹路径:", path);
      if (!!path) {
        this.addMod(path);
      }
    },
  },

  mounted() {
    this.initData();

    // 初始化config數據
    if (!this.checkConfig()) {
      fs.writeFileSync(this.filePath, "");
    }

    if (!this.configData) {
      this.configData = this.readConfig();
    }
    console.log("configData", this.configData);
  },

  methods: {
    initData() {
      let tabsList = this.tabsList.map((i) => {
        let item = Object.assign(i);
        item.children = [];
        roleSexType[item.key].forEach((roleKey) => {
          item.children.push({
            key: roleKey,
            name: roleName[roleKey],
            head: head[roleKey],
          });
        });
        return item;
      });
      this.tabsList = tabsList;
    },

    tabChange(index) {
      this.tabIndex = index;
    },

    showDetail(item) {
      console.log(item);
      if (this.showRoleKey === item.key) return;
      this.detailItem = item;
      this.showRoleKey = item.key;
      this.modIndex = -1;
      if (!!this.showRoleKey) {
        this.modList = this.configData[this.showRoleKey] || [];
        if (this.modList.length > 0) this.modChange(0);
      }
    },

    roleChange() {
      let roleItem = this.tabsList[tabIndex].children.find(
        (i) => i.key === this.form.roleKey
      );
      console.log(roleItem);
      if (!!roleItem) {
        this.form.roleName = roleItem.name;
      }
    },

    modChange(index) {
      this.modIndex = index;
      let modItem = this.modList[index];
      console.log(modItem);
      if (!!modItem) {
        let files = this.readDir(modItem.modPath);
        console.log(files);
        let imgs = files.filter((fileName) => {
          if (!!fileName) {
            let arr = fileName.toString().split(".");
            if (arr[arr.length - 1] === "png") {
              return true;
            }
          }
          return false;
        });
        this.$set(this.modList, index, {
          ...modItem,
          imgs: imgs.map((i) => {
            let imgPath = `${modItem.modPath}/${i}`;
            let data = this.fs.readFileSync(imgPath);
            return `data:image/png;base64,${new Buffer(data, "binary").toString(
              "base64"
            )}`;
          }),
        });
      }
    },

    addMod(path) {
      // 彈窗確認
      if (path === true) {
        let modList = [
          ...(this.configData[this.form.roleKey] || []),
          JSON.parse(JSON.stringify(this.form)),
        ];
        this.configData[this.form.roleKey] = modList;
        this.updateConfig();
        this.dialogVisible = false;
        this.$message({
          message: "添加成功",
          type: "success",
        });
        return;
      }

      let newPath = path.toString().split("file:///")[1];
      this.store.dispatch("changeDropIntoFilePath", null);
      // this.readDir(newPath);
      let modName = newPath.split("/");
      modName = modName[modName.length - 1];

      // 記錄mod信息
      let detailItem = this.detailItem || {
        key: "",
        name: "",
      };
      let modItem = {
        roleKey: detailItem.key,
        roleName: detailItem.name,
        modPath: newPath,
        modName: modName,
      };
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

    readConfig() {
      // 同步读取配置文件
      const data = this.fs.readFileSync(this.filePath, "utf-8");
      try {
        return JSON.parse(data) || {};
      } catch (error) {
        return data || {};
      }
    },

    updateConfig() {
      this.fs.writeFileSync(this.filePath, JSON.stringify(this.configData));
    },

    // 讀取文件夾內容
    readDir(path) {
      const files = this.fs.readdirSync(path);
      return files;
    },

    // 應用mod
    applyMod(isDelete = false) {
      let modInfo = this.modList[this.modIndex];
      console.log(modInfo);
      // 讀取mod目錄下文件
      // let modsPath = "G:/test/HsrModManage/Mods";
      let modsPath = this.configData.modsPath;
      let mods = this.readDir(modsPath);
      console.log(mods);
      let repeatModFileName = mods.find((name) =>
        name.includes(`${modInfo.roleName}_`)
      );
      console.log(repeatModFileName);
      if (!!repeatModFileName) {
        this.fsextra.removeSync(`${modsPath}${repeatModFileName}`);
      }

      console.log(!isDelete);
      if (!isDelete) {
        let modPath = `${modsPath}/${modInfo.roleName}_${modInfo.modName}`;
        console.log(modInfo.modPath, modPath);
        this.fsextra.copySync(modInfo.modPath, modPath);
        this.$message({
          message: "應用成功",
          type: "success",
        });
      }
    },
  },
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

.pageHome {
  width: 100%;
  height: 100%;

  .tabs {
    display: flex;
    height: 120px;
    overflow: hidden;

    .tabItem {
      flex: 1;
      position: relative;

      .roleHeadImg {
        width: 100%;
        height: 100%;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          position: relative;
          margin-top: -45%;
          transition: transform 0.1s linear;
          transform-origin: center center;
        }
      }

      .roleType {
        pointer-events: none;
        position: absolute;
        text-align: center;
        width: 100%;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
      }

      &:hover .roleHeadImg img {
        transform: scale(1.2);
      }
    }
  }

  .roles {
    display: flex;
    flex-wrap: wrap;

    .role {
      padding: 10px;
      width: 120px;
      height: 120px;
      position: relative;

      &:hover {
        z-index: 9;
      }

      .roleImg {
        cursor: pointer;

        &,
        & img {
          width: 100%;
          height: 100%;
        }
        img {
          object-fit: cover;
          transition: transform 0.1s linear;
        }

        &:hover img {
          transform: scale(1.2);
        }
      }

      .roleName {
        position: absolute;
        width: calc(100% - 20px);
        bottom: 0px;
        text-align: center;
        color: white;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }

  .detailContent {
    display: flex;
    height: 100%;

    .tabs {
      width: 100px;
      height: 100%;
      flex-direction: column;

      .tabItem {
        height: 100px;
        flex: inherit;

        .roleHeadImg img {
          margin-top: 0;
        }
      }
    }

    .roles {
      width: 100px;
      height: 100%;
      overflow-y: auto;
      position: relative;
      border-left: 2px solid red;
      border-right: 2px solid red;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        display: none;
      }
      // 设置滚动条的背景色和圆角
      &::-webkit-scrollbar-thumb {
        background-color: gray;
        border-radius: 8px;
      }
      &::-webkit-scrollbar-corner {
        background-color: gray;
      }

      .role {
        padding: 0;
      }

      .roleName {
        width: 100%;
      }
    }

    .roleMods {
      width: 200px;
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      height: 100%;
      overflow-y: auto;

      .modName {
        cursor: pointer;

        &:hover,
        &.active {
          color: red;
        }
      }
    }

    .roleModDetail {
      flex: 1;
      position: relative;
      border-left: 2px solid red;

      .noImg {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: black;
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

          .el-carousel__item:nth-child(2n) {
            background-color: #99a9bf;
          }

          .el-carousel__item:nth-child(2n + 1) {
            background-color: #d3dce6;
          }
        }
      }
    }
  }
}
</style>
