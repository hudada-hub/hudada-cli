<script setup>
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
	console.log("App Launch");
});
onShow(() => {
	console.log("App Show");
});
onHide(() => {
	console.log("App Hide");
});
</script>

<style>
	/*每个页面公共css */
	/* 全局样式 */
	page {
		background-color: #f8f8f8;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
			Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}

	.container {
		padding: 20rpx;
	}
</style>
