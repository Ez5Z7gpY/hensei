
(function($) {
	const transparent = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEwIDEwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
	let repeat;
	let mode = 'normal';
	let source = {};

	function last_setting(){
		let last_setting = '';
		if(localStorage.getItem('sw')){
			last_setting += '横幅：'+localStorage.sw;
		}
		if(localStorage.getItem('sh')){
			last_setting += '　高さ：'+localStorage.sh;
		}
		if(localStorage.getItem('sx')){
			last_setting += '　X座標：'+localStorage.sx;
		}
		if(localStorage.getItem('sy')){
			last_setting += '　Y座標：'+localStorage.sy;
		}
		$('.js-last-setting').text(last_setting);
	}
	function accordion(){
		$('.c-ac:not(:first-child)').find('.js-ac-cnt').hide();
		$('.c-ac:first-child').find('.js-ac-btn').addClass('is-open');
		$('.js-ac-btn').on('click', function(){
			$(this).toggleClass('is-open').next('.js-ac-cnt').slideToggle(200);
		});
	}
	function file_preview() {
		for(let j = 0; j < 12; j++){
			$('.input-set').append('<div class="input-preview"><div class="img"><img src="'+transparent+'" /></div><p class="txt">' + parseInt(j + 1) + '</p></div>');
		}

		$('[type="file"]').on('change', function () {
			let files = $(this).prop('files');
			let fileReader = [];

			$('.input-preview').find('img').attr('src', transparent);
			$('.input-preview').hide();
			switch(mode) {
				case 'normal':
					file_max = 6;
					$('.input-preview:nth-child(-n+6)').show();
				break;
				case 'combined':
					file_max = 12;
					$('.input-preview').show();
				break;
				case 'flying_s':
					file_max = 7;
					$('.input-preview:nth-child(-n+7)').show();
				break;
			}
			repeat = files.length;
			if (file_max < files.length) {
				repeat = file_max;
			}
			for(let i = 0; i < repeat; i++){
				fileReader[i] = new FileReader();
				fileReader[i].onloadend = function() {
					$('.input-preview').eq(i).find('img').attr({'src': fileReader[i].result, 'id': 'img'+i });
					if(i + 1 === repeat){
						get_size();
					}
				}
				fileReader[i].readAsDataURL(files[i]);
			}
		});
	}
	function drag_order(){
		$('.input-preview').on('dragstart', function(event){
			event.originalEvent.dataTransfer.setData("text/plain", event.target.id);
		});
		$('.input-preview').on('dragover', function(event){
			event.preventDefault();
		});
		$('.input-preview').on('drop', function(event){
			event.preventDefault();
			//ドラッグしている画像のIDを取得
			var id = event.originalEvent.dataTransfer.getData("text/plain");
			//ドロップ先のsrcを保存
			var buff = $(this).find('img').attr('src');
			//ドロップ先のsrcにドラッグ元のsrcを上書き
			$(this).find('img').attr('src', document.getElementById(id).src);
			//保存していたsrcをドラッグ元のsrcへ上書き
			document.getElementById(id).src = buff;
			get_size();
		});
	}
	function type_change() {
		$('input[name=type]').on('change', function(){
			switch($(this).val()) {
				case 'normal':
					mode = 'normal';
				break;
				case 'combined':
					mode = 'combined';
				break;
				case 'flying_s':
					mode = 'flying_s';
				break;
			}
		});
	}
	function get_size() {
		let rect_MousedownFlg = false;
		let rect_sx = 0;
		let rect_sy = 0;
		let rect_ex = 0;
		let rect_ey = 0;
		
		let canvas = document.getElementById("canvas");
		let canvas_ctx = canvas.getContext("2d");
		
		let image = document.getElementById('img0');

		let ratio;
		image.onload = function(){
			ratio = image.naturalWidth/(window.innerWidth*0.9);
			let long = Math.max(image.width, image.height);
			let short = Math.min(image.width, image.height);
			let proportion = short * 100 / long;
			canvas.width = window.innerWidth*0.9;
			canvas.height = window.innerWidth*0.9*proportion/100;
			canvas_ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,canvas.width,canvas.height);
		};


		canvas.addEventListener('mousedown', function(event){
			rect_MousedownFlg = true;

			// 座標を求める
			let rect = event.target.getBoundingClientRect();
			rect_sx = event.clientX - rect.left;
			rect_sy = event.clientY - rect.top;


			// 線の設定
			canvas_ctx.lineWidth = 2;
			canvas_ctx.strokeStyle = '#f08300';
			canvas_ctx.setLineDash([2, 3]);
		});
	
		canvas.addEventListener('mousemove', function(event){
			if(rect_MousedownFlg){
				// 座標を求める
				let rect = event.target.getBoundingClientRect();
				rect_ex = event.offsetX - rect_sx;
				rect_ey = event.offsetY - rect_sy;
				
				// 元画像の再描画
				canvas_ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,canvas.width,canvas.height);
				
				// 矩形の描画
				canvas_ctx.beginPath();
				

				canvas_ctx.strokeRect(rect_sx,rect_sy,rect_ex,rect_ey);
			}
		});

		canvas.addEventListener('mouseup', function(event){
			// キャンバスの範囲外は無効にする
			if(rect_sx === rect_ex && rect_sy === rect_ey){
				// 初期化
				canvas_ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,canvas.width,canvas.height);
				rect_sx = rect_ex = 0;
				rect_sy = rect_ey = 0;
			}
			
			// 矩形の画像を取得する
			if(rect_MousedownFlg){
				// 矩形用キャンバスへ画像の転送
				source['sx'] = rect_sx*ratio;
				source['sy'] = rect_sy*ratio;
				source['sw'] = rect_ex*ratio;
				source['sh'] = rect_ey*ratio;
				let setting = '';
					setting += '横幅：'+source.sw;
					setting += '　高さ：'+source.sh;
					setting += '　X座標：'+source.sx;
					setting += '　Y座標：'+source.sy;
				$('.js-setting').text(setting);

				localStorage.setItem('sx', source.sx);
				localStorage.setItem('sy', source.sy);
				localStorage.setItem('sw', source.sw);
				localStorage.setItem('sh', source.sh);
			}
			rect_MousedownFlg = false;
		});
	}
	function generate() {
		let files = [];
		let generate = document.getElementById('generate');
		let context = generate.getContext('2d');

		$('.js-btn-generate').on('click', function(){

			sx = localStorage.sx;
			sy = localStorage.sy;
			sw = localStorage.sw;
			sh = localStorage.sh;

			switch(mode) {
				case 'normal':
					generate.width = sw*2;
					generate.height = sh*3;
				break;
				case 'combined':
					generate.width = sw*4;
					generate.height = sh*3;
				break;
				case 'flying_s':
					generate.width = sw*2;;
					generate.height = sh*4;
				break;
			}
			context.beginPath();
			context.fillStyle = 'rgb(234 226 211)';
			context.fillRect(0, 0, generate.width, generate.height);


			for(let k = 0; k < repeat; k++){
				// 	合成する画像のサイズを取得
				dx = 0;
				dy = 0;
				dw = sw;
				dh = sh;
				
				// 横
				switch (k) {
					case 1:
					case 3:
					case 5:
						dx=dw*1;
						break;
					case 6:
					case 8:
					case 10:
						dx=dw*2;
						break;
					case 7:
					case 9:
					case 11:
						dx=dw*3;
						break;
				}
				// 縦
				switch (k) {
					case 2:
					case 3:
					case 8:
					case 9:
						dy=dh*1;
						break;
					case 4:
					case 5:
					case 10:
					case 11:
						dy=dh*2;
						break;
				}
				if(mode === 'flying_s' && k ===6) {
					dx=0;
					dy=dh*3;
				}

				files[k] = document.getElementById('img'+k);
				context.drawImage(files[k], sx, sy, sw, sh, dx, dy, dw, dh);
 			}
		});
	}

	$(window).on('load', function(){
		last_setting();
		accordion();
		file_preview();
		drag_order();
		type_change();
		generate();
	});

})(jQuery);