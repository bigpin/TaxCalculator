Component({
		methods: {
			onTap(e) {
					this.triggerEvent("tap", {'buttonId': e.target.id});
				},
		}
});
