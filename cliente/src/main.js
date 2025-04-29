import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "material-icons/iconfont/filled.css";
import "material-icons/iconfont/material-icons.css";
import "material-icons/iconfont/outlined.css";
import "material-icons/iconfont/round.css";

const appInstance = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});

appInstance.use(VueVirtualScroller)
appInstance.use(vuetify);
appInstance.use(router);
appInstance.mount('#app');
