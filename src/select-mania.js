(function($) {

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ----------------------------------------- DATA ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Data = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ defaults

		//default settings values
		defaults: {
			//style
			width: '100%', 
			size: 'medium', 
			themes: [], 
			//texts
			placeholder: 'Select an item', 
			//controls
			removable: false, 
			search: false, 
			//ajax
			ajax: false, 
			data: {}
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- ENGINE ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Engine = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ internalSettings

		//insert internal data into settings object
		internalSettings: function($originalSelect, settings) {
			var thisEngine = this;
			//initialize interal data
			settings.multiple = false;
			settings.values = [];
			//if select is multiple
			settings.multiple = $originalSelect.is('[multiple]');
			//loop through selected options
			$originalSelect.find('option:selected').each(function() {
				//insert selected value data
				settings.values.push({
					value: this.value, 
					text: this.text
				});
			});
			//send back settings
			return settings;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getAttrSettings

		//get selectMania settings stored as attributes
		getAttrSettings: function($originalSelect) {
			var attrData = {};
			//available attributes
			var attrs = ['width','size','placeholder','removable','search'];
			//loop through attributes
			attrs.forEach(function(attr) {
				//if attribute is set on select
				if($originalSelect.is('[data-'+attr+']')) {
					//insert data
					var elAttr = $originalSelect.attr('data-'+attr);
					if(elAttr === 'true' || elAttr === 'false') {
						elAttr = elAttr === 'true';
					}
					attrData[attr] = elAttr;
				}
			});
			//send back select attributes data
			return attrData;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ initialize

		//initialize selectMania on original select
		initialize: function($originalSelect, userSettings) {
			var thisEngine = this;
			//clone settings before starting work
			var settings = $.extend(true, {}, userSettings);
			//get select settings stored as attributes
			var attrSettings = thisEngine.getAttrSettings($originalSelect);
			//merge settings with attributes
			settings = $.extend(settings, attrSettings);
			//insert internal data into settings
			settings = thisEngine.internalSettings($originalSelect, settings);
			//control ajax function type and size
			if(thisEngine.controlSettings($originalSelect, settings, ['ajax','size'])) {
				//build selectMania elements
				var $builtSelect = Build.build($originalSelect, settings);
				//attach original select element to selectMania element
				$builtSelect.data('selectMania-originalSelect', $originalSelect);
				//attach selectMania element to original select element
				$originalSelect.data('selectMania-element', $builtSelect);
				//if ajax is activated
				if(settings.ajax !== false) {
					//initialize ajax data
					thisEngine.initAjax($builtSelect, settings);
				}
				//update clean values icon display
				thisEngine.updateClean($builtSelect);
				//add witness / hding class original select element
				$originalSelect.addClass('select-mania-original');
				//insert selectMania element before original select
				$builtSelect.insertBefore($originalSelect);
				//bind selectMania element
				Binds.bind($builtSelect);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ update

		//update selectMania element according to original select element
		update: function($originalSelect) {
			var thisEngine = this;
			//selectMania elements
			$selectManiaEl = $originalSelect.data('selectMania-element');
			$valueList = $selectManiaEl.find('.select-mania-values').first();
			$itemList = $selectManiaEl.find('.select-mania-items').first();
			//remove selectMania values and items
			$selectManiaEl.find('.select-mania-value').remove();
			$itemList.empty();
			//build and insert selected values
			$originalSelect.find('option:selected').each(function() {
				if($(this).is(':selected')) {
					$valueList.append(Build.buildValue({
						value: this.value, 
						text: this.text
					}));
				}
			});
			//build and insert items
			$itemList.append(Build.buildItemList($originalSelect.children()));
			//update clean values icon display
			thisEngine.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ destroy

		//destroy selectMania on targeted original select
		destroy: function($originalSelect) {
			//selectMania element
			$selectManiaEl = $originalSelect.data('selectMania-element');
			//remove selectMania element
			$selectManiaEl.remove();
			//remove class from original select
			$originalSelect.removeClass('select-mania-original');
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ openDropdown / closeDropdown

		//open / close items dropdown
		openDropdown: function($dropdown) {
			var thisEngine = this;
			//open dropdown
			$dropdown.stop().addClass('open').slideDown(100);
			//focus search input
			thisEngine.focusSearch($dropdown);
		}, 
		closeDropdown: function($dropdown) {
			$dropdown.stop().removeClass('open').slideUp(100);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ focusSearch

		//focus search input in dropdown
		focusSearch: function($dropdown) {
			$dropdown.find('.select-mania-dropdown-search-input').focus();
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ addMultipleVal

		//add value to multiple original select
		addMultipleVal: function($originalSelect, val) {
			var originalVals = $originalSelect.val();
			if(!(originalVals instanceof Array)) {
				originalVals = [];
			}
			originalVals.push(val);
			$originalSelect.val(originalVals);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ removeMultipleVal

		//remove value from multiple original select
		removeMultipleVal: function($originalSelect, val) {
			var originalVals = $originalSelect.val();
			if(!(originalVals instanceof Array)) {
				originalVals = [];
			}
			originalVals.splice($.inArray(val, originalVals), 1);
			$originalSelect.val(originalVals);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ updateClean

		//display / hide clean values icon according to current values
		updateClean: function($selectManiaEl) {
			//original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//if value is not empty
			if($originalSelect.val() !== null && $originalSelect.val().length > 0) {
				//display clean values icon
				$selectManiaEl.find('.select-mania-clear-icon').show();
			}
			//if empty value
			else {
				//hide clean values icon
				$selectManiaEl.find('.select-mania-clear-icon').hide();
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doSearch

		//do search in items dropdown
		doSearch: function($selectManiaEl) {
			//search value
			var searchVal = $selectManiaEl.find('.select-mania-dropdown-search-input').first().val();
			searchVal = searchVal.toLowerCase().trim();
			//if empty search value
			if(searchVal === '') {
				//display all items
				$selectManiaEl.find('.select-mania-item').removeClass('select-mania-hidden');
				//stop function
				return;
			}
			//loop through dropdown items
			$selectManiaEl.find('.select-mania-item').each(function() {
				//if item text matches search value
				if($(this).text().toLowerCase().indexOf(searchVal) !== -1) {
					//display item
					$(this).removeClass('select-mania-hidden');
				}
				//if item text don't match search value
				else {
					//hide item
					$(this).addClass('select-mania-hidden');
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doSearchAjax

		//do ajax search in items dropdown
		doSearchAjax: function($selectManiaEl) {
			var thisEngine = this;
			//search value
			var thisSearch = $selectManiaEl.find('.select-mania-dropdown-search-input').first().val();
			//pause ajax scroll
			$selectManiaEl.data('selectMania-ajaxReady', false);
			//reset current page number
			$selectManiaEl.data('selectMania-ajaxPage', 1);
			//loading icon
			thisEngine.dropdownLoading($selectManiaEl);
			//call ajax function
			var thisAjaxFunction = $selectManiaEl.data('selectMania-ajaxFunction');
			var thisAjaxData = $selectManiaEl.data('selectMania-ajaxData');
			thisAjaxFunction(thisSearch, 1, thisAjaxData, function(optHTML) {
				//remove loading icon
				thisEngine.dropdownLoading($selectManiaEl, true);
				//replace current items with sent options
				Engine.replaceItems($selectManiaEl, optHTML);
				//rebind select
				Binds.bind($selectManiaEl);
				//reset ajax scroll data
				thisEngine.initAjax($selectManiaEl);
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ addItems / replaceItems

		//add items to dropdown
		addItems: function($selectManiaEl, optionsHTML) {
			var thisEngine = this;
			thisEngine.addOrReplaceItems($selectManiaEl, optionsHTML, false);
		}, 

		//replace dropdown items
		replaceItems: function($selectManiaEl, optionsHTML) {
			var thisEngine = this;
			thisEngine.addOrReplaceItems($selectManiaEl, optionsHTML, true);
		}, 

		//add / replace dropdown items
		addOrReplaceItems: function($selectManiaEl, optionsHTML, replace) {
			var thisEngine = this;
			//original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//items dropdown
			var $itemsContainer = $selectManiaEl.find('.select-mania-items');
			//options jquery parsing
			var $options = $(optionsHTML);
			//get selectMania element values
			var selectedVals = thisEngine.getVal($selectManiaEl);
			//loop through selected values
			selectedVals.forEach(function(val) {
				$options
					//search for options matching selected value
					.filter(function() {
						return $(this).attr('value') === val.value && $(this).text() === val.text;
					})
					//set matching options as selected
					.prop('selected', true);
			});
			//build items list
			$builtItems = Build.buildItemList($options);
			//if items are meant to be replaced
			if(replace === true) {
				//empty old options except selected ones
				$originalSelect.find('option').remove(':not(:checked)');
				//empty items dropdown
				$itemsContainer.empty();
			}
			//add items to selectMania dropdown
			$itemsContainer.append($builtItems);
			//add options to original select element
			$originalSelect.append($options);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ initAjax

		//reset selectMania element ajax data and attach ajax function
		initAjax: function($selectManiaEl, settings) {
			//if ajax settings are provided to be attached
			if(typeof settings === 'object') {
				//attach ajax function
				if(settings.hasOwnProperty('ajax') && typeof settings.ajax === 'function') {
					$selectManiaEl.data('selectMania-ajaxFunction', settings.ajax);
				}
				//attach ajax data
				if(settings.hasOwnProperty('data') && typeof settings.data === 'object') {
					$selectManiaEl.data('selectMania-ajaxData', settings.data);
				}
			}
			//reset ajax data
			$selectManiaEl.data('selectMania-ajaxPage', 1);
			$selectManiaEl.data('selectMania-ajaxReady', true);
			$selectManiaEl.data('selectMania-ajaxScrollDone', false);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ dropdownLoading

		//display / hide loading icon inside items dropdown
		dropdownLoading: function($selectManiaEl, hide) {
			//if hide icon requested
			var isHide = false;
			if(typeof hide !== 'undefined' && hide === true) {
				isHide = true;
			}
			//dropdown inner list element
			$dropdownContainer = $selectManiaEl.find('.select-mania-items-container').first();
			//remove loading icon if exists
			$dropdownContainer.find('.icon-loading-container').remove();
			//if show icon requested
			if(isHide !== true) {
				//build loading icon
				var $loadingIcon = $('<div class="icon-loading-container"></div>');
				$loadingIcon.append('<i class="icon-loading"></i>');
				//insert loading icon
				$dropdownContainer.append($loadingIcon);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getVal

		//get parsed selected values
		getVal: function($selectManiaEl) {
			var valObjs = [];
			//loop though values elements
			$selectManiaEl.find('.select-mania-value').each(function() {
				//selected value text
				var thisText = $(this).find('.select-mania-value-text').first().text();
				//insert selected value object
				valObjs.push({
					value: $(this).attr('data-value'), 
					text: thisText
				});
			});
			//send back parsed selected values
			return valObjs;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clear

		//clear select values
		clear: function($selectManiaEl) {
			//empty selectMania values
			$selectManiaEl.find('.select-mania-value').remove();
			//unselect items in dropdown
			$selectManiaEl.find('.select-mania-item').removeClass('select-mania-selected');
			//empty values in original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			if($selectManiaEl.is('.select-mania-multiple')) {
				$originalSelect.val([]);
			}
			else {
				$originalSelect.val('');
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setVal

		//set parsed values as selected values
		setVal: function($selectManiaEl, valObjs) {
			var thisEngine = this;
			//original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//clear select values before setting provided values
			thisEngine.clear($selectManiaEl);
			//if there's more than one value in the values and select is not multiple
			if(valObjs.length > 1 && !$selectManiaEl.is('.select-mania-multiple')) {
				//keep only first value
				valObjs = valObjs.slice(0, 1);
			}
			//loop through values
			valObjs.forEach(function(val) {
				//parse value object
				var valObj = $.extend({
					value: '', 
					text: '', 
					selected: true
				}, val);
				//set value in selectMania element
				thisEngine.setOneValSelectMania($selectManiaEl, valObj);
				//set value in original select
				thisEngine.setOneValOriginal($originalSelect, valObj);
			});
			//update clean values icon display
			thisEngine.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

		//set one value on selectMania element
		setOneValSelectMania: function($selectMania, valObj) {
			//build value element for selectMania element
			var $value = Build.buildValue(valObj);
			//insert built value element in selectMania element
			$selectMania.find('.select-mania-values').append($value);
			//check if corresponding item exists in dropdown
			var $searchItem = $selectMania.find('.select-mania-item[data-value="'+valObj.value+'"]').filter(function() {
				return $(this).text() === valObj.text;
			});
			//if item exists in dropdown
			if($searchItem.length > 0) {
				//set item as selected
				$searchItem.first().addClass('select-mania-selected');
			}
		}, 

		//set one value on original select element
		setOneValOriginal: function($originalSelect, valObj) {
			//check if corresponding option exists in original select
			var $searchOpt = $originalSelect.find('option[value="'+valObj.value+'"]').filter(function() {
				return $(this).text() === valObj.text;
			});
			//if option doesn't exist in original select
			if($searchOpt.length < 1) {
				//build option for original select
				var $option = Build.buildOption(valObj);
				//insert built option in original select
				$originalSelect.append($option);
			}
			//if option already exists in original select
			else {
				//fond option element
				var $foundOption = $searchOpt.first();
				//set option as selected
				$foundOption[0].selected = true;
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ controls

		//control target element
		controlTarget: function($target, controls) {
			//error if element is not a select
			if($.inArray('isSelect', controls) !== -1 && !$target.is('select')) {
				console.error('selectMania | not a valid select element');
				console.log($target[0]);
				return false;
			}
			//error if plugin not initialized
			if($.inArray('isInitialized', controls) !== -1 && !$target.hasClass('select-mania-original')) {
				console.error('selectMania | select is not initialized');
				console.log($target[0]);
				return false;
			}
			//error if plugin already initialized
			if($.inArray('notInitialized', controls) !== -1 && $target.hasClass('select-mania-original')) {
				console.error('selectMania | ignore because already initialized');
				console.log($target[0]);
				return false;
			}
			//control method was called on single element
			if($.inArray('isSingle', controls) !== -1 && $target.length > 1) {
				console.error('selectMania | check method can be called on single element only');
				console.log($target[0]);
				return false;
			}
			//if control ok
			return true;
		}, 

		//control selectMania settings
		controlSettings: function($target, settings, controls) {
			//control ajax function type
			if($.inArray('ajax', controls) !== -1 && settings.ajax !== false && typeof settings.ajax !== 'function') {
				settings.ajax = false;
				console.error('selectMania | not a valid ajax function');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//error if invalid size provided
			if($.inArray('size', controls) !== -1 && $.inArray(settings.size, ['small','medium','large']) === -1) {
				settings.size = 'medium';
				console.error('selectMania | not a valid size');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//if control ok
			return true;
		}, 

		//control selectMania values
		controlValues: function($target, values) {
			//error if values is not an array
			if(!(values instanceof Array)) {
				console.error('selectMania | values parameter is not a valid array');
				console.log($target[0]);
				console.log(values);
				return false;
			}
			//if control ok
			return true;
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- BUILD ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

var Build = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ build

		//build selectMania element
		build: function($originalSelect, settings) {
			var thisBuild = this;
			//class for selectMania size
			var sizeClass = 'select-mania-'+settings.size;
			//explicit selectMania width style
			var widthStyle = 'style="width:'+settings.width+';"';
			//general selectMania div
			var $selectManiaEl = $('<div class="select-mania '+sizeClass+'" '+widthStyle+'></div>');
			//class for multiple
			if(settings.multiple) {
				$selectManiaEl.addClass('select-mania-multiple');
			}
			//classes for themes
			if(settings.themes instanceof Array && settings.themes.length > 0) {
				//loop through themes
				settings.themes.forEach(function(theme) {
					//applies theme class
					$selectManiaEl.addClass('select-mania-theme-'+theme);
				});
			}
			//class for activated ajax
			if(settings.ajax !== false) {
				$selectManiaEl.addClass('select-mania-ajax');
			}
			//insert children elements
			$selectManiaEl
				//inner elements
				.append(thisBuild.buildInner(settings))
				//items dropdown
				.append(thisBuild.buildDropdown($originalSelect, settings));
			//send back selectMania element
			return $selectManiaEl;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildInner

		//build inner elements
		buildInner: function(settings) {
			var thisBuild = this;
			//inner div
			var $inner = $('<div class="select-mania-inner"></div>');
			//values div
			var $values = $('<div class="select-mania-values"></div>');
			//insert placeholder
			var $placeholder = $('<div class="select-mania-placeholder">'+settings.placeholder+'</div>');
			$values.append($placeholder);
			//insert selected values
			settings.values.forEach(function(val) {
				$values.append(thisBuild.buildValue(val));
			});
			$inner.append($values);
			//insert clean values icon
			var $clean = $('<div class="select-mania-clear"></div>');
			if(settings.removable || settings.multiple) {
				$clean.append('<i class="select-mania-clear-icon icon-cross">');
			}
			$inner.append($clean);
			//insert dropdown arrow icon
			$inner.append($('<div class="select-mania-arrow"><i class="select-mania-arrow-icon icon-arrow-down"></i></div>'));
			//send back inner elements
			return $inner;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildValue

		//build selected value
		buildValue: function(valObj) {
			//selected value element html
			var valHtml = '<div class="select-mania-value" data-value="'+valObj.value+'">'+
				'<div class="select-mania-value-text">'+valObj.text+'</div>'+
				'<div class="select-mania-value-clear">'+
					'<i class="select-mania-value-clear-icon icon-cross"></i>'+
				'</div>'+
			'</div>';
			//send back selected value element
			return $(valHtml);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildOption

		//build option for original select
		buildOption: function(valObj) {
			//build option
			var $opt = $('<option value="'+valObj.value+'">'+valObj.text+'</option>');
			//set option selected status
			$opt[0].selected = valObj.selected;
			//send back option element
			return $opt;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildDropdown

		//build items dropdown
		buildDropdown: function($originalSelect, settings) {
			var thisBuild = this;
			//dropdown element
			var $dropdown = $('<div class="select-mania-dropdown"></div>');
			//insert search input in dropdown if activated
			if(settings.search) {
				var $dropdownSearch = $('<div class="select-mania-dropdown-search"></div>');
				$dropdownSearch.append('<input class="select-mania-dropdown-search-input" />');
				$dropdown.append($dropdownSearch);
			}
			//build items container
			var $itemListContainer = $('<div class="select-mania-items-container"></div>');
			var $itemList = $('<div class="select-mania-items"></div>');
			//build and insert items list
			$itemList.append(thisBuild.buildItemList($originalSelect.children()));
			//insert items list into dropdown
			$itemListContainer.append($itemList);
			$dropdown.append($itemListContainer);
			//send back items dropdown
			return $dropdown;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItemGroup

		//build items list
		buildItemList: function($optList) {
			var thisBuild = this;
			//empty item list
			$itemList = $();
			//loop through original select children
			$optList.each(function() {
				//if optgroup
				if($(this).is('optgroup')) {
					//build and insert item group
					$itemList = $itemList.add(thisBuild.buildItemGroup($(this)));
				}
				//if option
				else if($(this).is('option')) {
					//build and insert item
					$itemList = $itemList.add(thisBuild.buildItem($(this)));
				}
			});
			//send back build items list
			return $itemList;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItemGroup

		//build dropdown items group
		buildItemGroup: function($optgroupEl) {
			var thisBuild = this;
			//build group element
			$group = $('<div class="select-mania-group"></div>');
			$group.append('<div class="select-mania-group-name">'+$optgroupEl.attr('label')+'</div>');
			var $groupInner = $('<div class="select-mania-group-inner"></div>');
			//if group is disabled set class
			var groupIsDisabled = $optgroupEl.is(':disabled');
			if(groupIsDisabled) {
				$group.addClass('select-mania-disabled');
			}
			//build and insert items
			$optgroupEl.find('option').each(function() {
				$groupInner.append(thisBuild.buildItem($(this), groupIsDisabled));
			});
			$group.append($groupInner);
			//send back items group
			return $group;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItem

		//build dropdown item
		buildItem: function($optionEl, forceDisabled) {
			var optionEl = $optionEl[0];
			//build item html
			var $item = $('<div class="select-mania-item" data-value="'+optionEl.value+'">'+optionEl.text+'</div>');
			//if item is disabled set class
			if($optionEl.is(':disabled') || Tools.def(forceDisabled) === true) {
				$item.addClass('select-mania-disabled');
			}
			//if item is selected add class
			if($optionEl.is(':selected')) {
				$item.addClass('select-mania-selected');
			}
			//send back item
			return $item;
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- BINDS ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Binds = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bind

		//bind all selectMania controls
		bind: function($selectManiaEl) {
			var thisBinds = this;
			//click outside select
			$(document).off('click.selectMania').on('click.selectMania', thisBinds.documentClick);
			//clear values
			$selectManiaEl.find('.select-mania-clear-icon').off('click.selectMania').on('click.selectMania', thisBinds.clearValues);
			//clear select multiple individual value
			$selectManiaEl.find('.select-mania-value-clear-icon').off('click.selectMania').on('click.selectMania', thisBinds.clearValue);
			//open / close dropdown
			$selectManiaEl.find('.select-mania-inner').off('click.selectMania').on('click.selectMania', thisBinds.dropdownToggle);
			//item selection in dropdown
			$selectManiaEl.find('.select-mania-item:not(.select-mania-disabled)').off('click.selectMania').on('click.selectMania', thisBinds.selectItem);
			//search input in dropdown
			$selectManiaEl.find('.select-mania-dropdown-search-input').off('input.selectMania').on('input.selectMania', thisBinds.inputSearch);
			//prevents body scroll when reached dropdown top or bottom
			$selectManiaEl.find('.select-mania-items').off('wheel.selectMania').on('wheel.selectMania', thisBinds.scrollControl);
			//ajax scroll
			if($selectManiaEl.is('.select-mania-ajax')) {
				$selectManiaEl.find('.select-mania-items').off('scroll.selectMania').on('scroll.selectMania', thisBinds.scrollAjax);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ dropdownToggle

		//BIND ONLY - open / close dropdown
		dropdownToggle: function() {
			//dropdown element
			var $dropdown = $(this).closest('.select-mania').find('.select-mania-dropdown').first();
			//toggle dropdown
			if($dropdown.is('.open')) {
				Engine.closeDropdown($dropdown);
			}
			else {
				Engine.openDropdown($dropdown);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ documentClick

		//BIND ONLY - click outside select
		documentClick: function(e) {
			//if click is inside select
			if($(e.target).closest('.select-mania').length > 0) {
				//close every other select open dropdown
				var $thisSelectMania = $(e.target).closest('.select-mania');
				var $openDropdowns = $('.select-mania').not($thisSelectMania).find('.select-mania-dropdown.open');
				Engine.closeDropdown($openDropdowns);
			}
			//if click outside select
			else {
				//close every open dropdown
				Engine.closeDropdown($('.select-mania-dropdown.open'));
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clearValues

		//BIND ONLY - clear values
		clearValues: function(e) {
			e.stopPropagation();
			//selectMania element
			var $selectManiaEl = $(this).closest('.select-mania');
			//original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//clear values
			Engine.clear($selectManiaEl);
			//trigger original select change event
			$originalSelect.trigger('change');
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clearValue

		//BIND ONLY - clear select multiple individual value
		clearValue: function(e) {
			e.stopPropagation();
			//selectMania element
			var $selectManiaEl = $(this).closest('.select-mania');
			//value to delete
			var $value = $(this).closest('.select-mania-value');
			//unselect item in dropdown
			$selectManiaEl
				.find('.select-mania-item[data-value="'+$value.attr('data-value')+'"]')
				.removeClass('select-mania-selected');
			//remove value from selectMania element
			$value.remove();
			//remove value from original select element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			Engine.removeMultipleVal($originalSelect, $value.attr('data-value'));
			//trigger original select change event
			$originalSelect.trigger('change');
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ selectItem

		//BIND ONLY - item selection in dropdown
		selectItem: function() {
			//selectMania element
			var $selectManiaEl = $(this).closest('.select-mania');
			//select original element
			var $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//if item not already selected
			if(!$(this).is('.select-mania-selected')) {
				//clicked item value
				var itemVal = $(this).attr('data-value');
				//build value element
				var $value = Build.buildValue({
					value: itemVal, 
					text: $(this).text()
				});
				//if select multiple
				if($selectManiaEl.is('.select-mania-multiple')) {
					//insert value element in selectMania values
					$selectManiaEl.find('.select-mania-values').append($value);
					//add value in original select element
					Engine.addMultipleVal($originalSelect, itemVal);
				}
				//if select not multiple
				else {
					//unselect every other items
					$selectManiaEl.find('.select-mania-item').removeClass('select-mania-selected');
					//insert value element in selectMania values
					$selectManiaEl.find('.select-mania-values .select-mania-value').remove();
					$selectManiaEl.find('.select-mania-values').append($value);
					//change value in original select element
					$originalSelect.val(itemVal);
				}
				//set clicked item as selected
				$(this).addClass('select-mania-selected');
				//trigger original select change event
				$originalSelect.trigger('change');
			}
			//if select not multiple
			if(!$selectManiaEl.is('.select-mania-multiple')) {
				//close dropdown
				Engine.closeDropdown($selectManiaEl.find('.select-mania-dropdown'));
			}
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ inputSearch

		//BIND ONLY - dropdown search input
		inputSearch: function() {
			//selectMania element
			$selectManiaEl = $(this).closest('.select-mania');
			//timer duration according to select multiple or not
			var thisTime = 200;
			if($selectManiaEl.is('.select-mania-ajax')) {
				thisTime = 400;
			}
			//clear timeout
			clearTimeout($(this).data('selectMania-searchTimer'));
			//search input timeout
			$(this).data('selectMania-searchTimer', setTimeout(function() {
				//ajax search
				if($selectManiaEl.is('.select-mania-ajax')) {
					Engine.doSearchAjax($selectManiaEl);
				}
				//normal search
				else {
					Engine.doSearch($selectManiaEl);
				}
			}, thisTime));
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ scrollAjax

		//BIND ONLY - dropdown ajax scroll
		scrollAjax: function(e) {
			//dropdown element
			var $thisDropdown = $(this);
			//selectMania element
			var $selectManiaEl = $thisDropdown.closest('.select-mania');
			//if ajax scroll is not over
			if($selectManiaEl.data('selectMania-ajaxScrollDone') !== true) {
				//if scroll reached bottom with 12px tolerance
				if($thisDropdown.scrollTop() >= $thisDropdown[0].scrollHeight - $thisDropdown.outerHeight() - 12) {
					//if ajax scroll is ready
					if($selectManiaEl.data('selectMania-ajaxReady') === true) {
						//page number to call
						var thisPage = $selectManiaEl.data('selectMania-ajaxPage') + 1;
						//search value
						var thisSearch = $selectManiaEl.find('.select-mania-dropdown-search-input').first().val();
						//pause ajax scroll
						$selectManiaEl.data('selectMania-ajaxReady', false);
						//enregistre nouvelle page en cours
						$selectManiaEl.data('selectMania-ajaxPage', thisPage);
						//loading icon
						Engine.dropdownLoading($selectManiaEl);
						//call ajax function
						var thisAjaxFunction = $selectManiaEl.data('selectMania-ajaxFunction');
						var thisAjaxData = $selectManiaEl.data('selectMania-ajaxData');
						thisAjaxFunction(thisSearch, thisPage, thisAjaxData, function(optHTML) {
							//remove loading icon
							Engine.dropdownLoading($selectManiaEl, true);
							//if options returned
							if(optHTML.trim() !== '') {
								//add items to dropdown from sent options
								Engine.addItems($selectManiaEl, optHTML);
								//rebind selectMania element
								Binds.bind($selectManiaEl);
								//set ajax scroll as ready
								$selectManiaEl.data('selectMania-ajaxReady', true);
							}
							//if no options sent back
							else {
								//ajax scroll is over
								$selectManiaEl.data('selectMania-ajaxScrollDone', true);
							}
						});
					}
				}
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ scrollControl

		//BIND ONLY - prevents body scroll when reached dropdown top or bottom
		scrollControl: function(e) {
			var $thisDropdown = $(this);
			if(e.originalEvent.deltaY < 0) {
				return ($thisDropdown.scrollTop() > 0);
			}
			else {
				return($thisDropdown.scrollTop() + $thisDropdown.innerHeight() < $thisDropdown[0].scrollHeight);
			}
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- OUTILS ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Tools = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ def

		//force null if var is undefined
		def: function(v) {
			if(typeof v === 'undefined') {
				return null;
			}
			return v;
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// --------------------------------------- MÉTHODES --------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Methods = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ init

		//initialize selectMania
		init: function(opts) {
			//settings provided by user
			var settings = $.extend(true, {}, Data.defaults, opts);
			//loop through targeted elements
			return this.each(function() {
				//current select to initialize
				var $originalSelect = $(this);
				//controls if element is a select and plugin is not already initialized
				if(Engine.controlTarget($originalSelect, ['isSelect','notInitialized'])) {
					//initialize selectMania on original select
					Engine.initialize($originalSelect, settings);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ update

		//update selectMania items and values
		update: function() {
			//loop through targeted elements
			return this.each(function() {
				//current select to destroy
				var $originalSelect = $(this);
				//controls if selectMania initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//update selectMania
					Engine.update($originalSelect);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ destroy

		//destroy selectMania
		destroy: function() {
			//loop through targeted elements
			return this.each(function() {
				//current select to destroy
				var $originalSelect = $(this);
				//controls if selectMania initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//destroy selectMania
					Engine.destroy($originalSelect);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ check

		//check if selectMania initialized
		check: function() {
			//controls method was called on single element
			if(Engine.controlTarget(this, ['isSingle'])) {
				//send back if plugin initialized or not
				return this.hasClass('select-mania-original');
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ get

		//returns parsed selected values
		get: function() {
			//controls if single element and plugin initialized
			if(Engine.controlTarget(this, ['isSingle','isInitialized'])) {
				//selectMania element
				var $selectManiaEl = this.data('selectMania-element');
				//get and return parsed selected values
				return Engine.getVal($selectManiaEl);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ set

		//set parsed values as selected values
		set: function(values) {
			//controls if single element and plugin initialized
			if(Engine.controlTarget(this, ['isSingle','isInitialized'])) {
				//controls values are valid
				if(Engine.controlValues(this, values)) {
					//selectMania element
					var $selectManiaEl = this.data('selectMania-element');
					//get and return parsed selected values
					Engine.setVal($selectManiaEl, values);
				}
			}					
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clear

		//clear values
		clear: function() {
			//loop through targeted elements
			return this.each(function() {
				//current select to destroy
				var $originalSelect = $(this);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					var $selectManiaEl = $originalSelect.data('selectMania-element');
					//clear values
					Engine.clear($selectManiaEl);
					//trigger original select change event
					$originalSelect.trigger('change');
					//update clear values icon display
					Engine.updateClean($selectManiaEl);
				}
			});
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// --------------------------------------- HANDLER ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	//plugin calls handler
	$.fn.selectMania = function(methodOrOpts) {

		//stop right away if targeted element empty
		if(this.length < 1) { return; }

		//call method
		if(Methods[methodOrOpts]) {
			//remove method name from call arguments
			var slicedArguments = Array.prototype.slice.call(arguments, 1);
			//call targeted mathod with arguments
			return Methods[methodOrOpts].apply(this, slicedArguments);
		}

		//call init
		else if(typeof methodOrOpts === 'object' || !methodOrOpts) {
			//call init with arguments
			return Methods.init.apply(this, arguments);
		}

		//error
		else {
			console.error('selectMania | wrong method called');
			console.log(this);
		}

	};

})(jQuery);