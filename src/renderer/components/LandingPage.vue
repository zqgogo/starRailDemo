<template>
  <!-- <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            electron-vue comes packed with detailed documentation that covers everything from
            internal configurations, using the project structure, building your application,
            and so much more.
          </p>
          <button @click="open('https://simulatedgreg.gitbooks.io/electron-vue/content/')">Read the Docs</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Other Documentation</div>
          <button class="alt" @click="open('https://electron.atom.io/docs/')">Electron</button>
          <button class="alt" @click="open('https://vuejs.org/v2/guide/')">Vue.js</button>
        </div>
      </div>
    </main>
  </div> -->
  <div class="pageHome">
    <div class="tabs">
      <div
        class="tabItem"
        v-for="(tabItem, tabIndex) in tabsList"
        :key="tabIndex"
      >
        <div class="roleHeadImg"></div>
        <div class="roleType">{{ tabItem.text }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "landing-page",

  data() {
    return {
      tabsList: [
        {
          key: "1",
          text: "老婆",
          img: "",
          remark: "女性角色",
        },
        {
          key: "2",
          text: "女儿",
          img: "",
          remark: "萝莉角色",
        },
        {
          key: "3",
          text: "边缘",
          img: "",
          remark: "男性角色",
        },
      ],
    };
  },

  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}
</style>
