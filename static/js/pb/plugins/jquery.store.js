/*
 * store js 0.1
 * http://store_js.oa.com/
 *
 * Copyright (c) 2010 kakaxiao
 *
 *
 * Date: 2010-05-28
 *
 */
jQuery.store || (function($) {
	var is_ff2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9);

	/* js obj extend */
	//Date
	$.extend(Date.prototype, { 
		iso_format: function(){
			var year = this.getFullYear();
			var month = this.getMonth() + 1;
			if(month < 10) month = "0" + month;
			var date = this.getDate();
				if(date < 10) date = "0" + date;
			return year + "-" + month + "-" + date;
		},
		change_date: function(date_num){
			this.setDate(this.getDate() + date_num);
			return this.iso_format();
		}
	});

	/**/
	$.store = {
		version: "0.1",
		plugins: {}
	};
})(jQuery);

/* store-datepicker */
(function($) {
	$.extend($.store, { 
		datepicker: { 
			version: "0.1",
			change_date: function($datepicker, date_num){
				var date = $datepicker.val();
				var date = date == "" ? new Date() : new Date(Date.parse(date.replace(/-/g, "/")));
				date.setDate(date.getDate() + date_num);
				$datepicker.val(date.iso_format());
			}
		} 
	});
	function StoreDatepicker($store_datepicker){
		this._default_settings = {
			prev_day_num: 1,
			next_day_num: 1
		};
		this._$store_datepicker = $store_datepicker;
	}
	$.extend(StoreDatepicker.prototype, {
		/*create: function(options){
			options ? options["dateFormat"] = 'yy-mm-dd': options = {dateFormat: 'yy-mm-dd'};
			this._$store_datepicker.addClass("ui-store-datepicker");
			var $children = this._$store_datepicker.children();
			var $controllers = $children.filter("div");
			if($controllers.length < 2) return this;
			var $contorller_prev = $controllers.eq(0), $contorller_next = $controllers.eq($controllers.length - 1);
 			$contorller_prev.addClass("ui-icon ui-icon-circle-triangle-w controller");
	 		$contorller_next.addClass("ui-icon ui-icon-circle-triangle-e controller");
			var $contents = $children.filter(":text");
			if($contents.length < 1) return this;
			var $content = $contents.eq(0);
			$content.addClass("ui-store-float-left content");
			var settings = $.extend({}, this._default_settings, options || {});
			$contorller_prev.click(function(){change_date($content, 0 - parseInt(settings.prev_day_num));});
			$contorller_next.click(function(){change_date($content, parseInt(settings.next_day_num));});
			return $content.datepicker(options);
		},*/
		create: function(options){
			options ? options["dateFormat"] = 'yy-mm-dd': options = {dateFormat: 'yy-mm-dd'};
			var settings = $.extend({}, this._default_settings, options || {});
			this._$store_datepicker.addClass("ui-store-datepicker");
			return this._$store_datepicker.children().filter(":text").each(function(){
				var $datepicker = $(this).addClass("ui-store-datepicker-content");
				$("<div>", {
					"class": "ui-icon ui-icon-circle-triangle-w ui-store-datepicker-controller",
					click: function(){$.store.datepicker.change_date($datepicker, 0 - parseInt(settings.prev_day_num));}
				}).insertBefore($datepicker);
				$("<div>", {
					"class": "ui-icon ui-icon-circle-triangle-e ui-store-datepicker-controller",
					click: function(){$.store.datepicker.change_date($datepicker, parseInt(settings.next_day_num));}
				}).insertAfter($datepicker);
			}).datepicker(options);
			return this;
		}
	});
	$.fn.store_datepicker = function(options){
		//return this.each(function(){new StoreDatepicker($(this)).create(options);});
		return new StoreDatepicker(this).create(options);
	}
})(jQuery);
/* store-buttonset */
(function($) {
	$.extend($.store, { buttonset: { version: "0.1" } });
})(jQuery);
