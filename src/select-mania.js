(($) => {

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ----------------------------------------- DATA ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	const Data = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ defaults

		//default settings values
		defaults: {
			//style
			width: '100%', 
			size: 'medium', 
			themes: [], 
			//texts
			placeholder: false, 
			//controls
			removable: false, 
			empty: false, 
			search: false, 
			//ajax
			ajax: false, 
			data: {}, 
			//positionning
			scrollContainer: null, 
			zIndex: null, 
			//visibility
			hidden: false
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setDefaults

		//set default settings values
		setup(opts) {
			const self = this;
			//controls provided settings keys
			const defKeys = Object.keys(self.defaults);
			const optKeys = Object.keys(opts);
			let isOk = true;
			optKeys.forEach((k) => {
				if($.inArray(k, defKeys) === -1) {
					console.error('selectMania | wrong setup settings');
					isOk = false;
				}
			});
			//if provided settings are ok
			if(isOk) {
				self.defaults = $.extend(true, {}, self.defaults, opts);
			}
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- ENGINE ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	const Engine = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ initialize

		//initialize selectMania on original select
		initialize($originalSelect, userSettings) {
			const self = this;
			//clone settings before starting work
			let settings = $.extend(true, {}, userSettings);
			//get select settings stored as attributes
			const attrSettings = self.getAttrSettings($originalSelect);
			//merge settings with attributes
			settings = $.extend(settings, attrSettings);
			//insert internal data into settings
			settings = self.internalSettings($originalSelect, settings);
			//control ajax function type and size
			if(self.controlSettings($originalSelect, settings)) {
				//build selectMania elements
				const $builtSelect = Build.build($originalSelect, settings);
				//attach original select element to selectMania element
				$builtSelect.data('selectMania-originalSelect', $originalSelect);
				//attach selectMania element to original select element
				$originalSelect.data('selectMania-element', $builtSelect);
				//if ajax is activated
				if(settings.ajax !== false) {
					//initialize ajax data
					self.initAjax($builtSelect, settings);
				}
				//update clean values icon display
				self.updateClean($builtSelect);
				//add witness / hiding class original select element
				$originalSelect.addClass('select-mania-original');
				//insert selectMania element before original select
				$builtSelect.insertBefore($originalSelect);
				//move original select into selectMania element
				$originalSelect.appendTo($builtSelect);
				//bind selectMania element
				Binds.bind($builtSelect);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ internalSettings

		//insert internal data into settings object
		internalSettings($originalSelect, settings) {
			const self = this;
			//if select multiple
			settings.multiple = $originalSelect.is('[multiple]');
			//if select is disabled
			settings.disabled = $originalSelect.is('[disabled]');
			//initial values
			settings.values = self.initValues($originalSelect, settings);
			//send back settings
			return settings;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setInitialValue

		//process and return initial values of select based on : element value / selected options / settings
		initValues($originalSelect, settings) {
			//values data
			let setValue = settings.multiple ? [] : null;
			let internalValues = [];
			//if empty setting disabled
			if(!settings.empty) {
				//if selected options
				const $selectedOptions = $originalSelect.find('option[selected]');
				//if selected options
				if($selectedOptions.length > 0) {
					//loop through selected options
					$selectedOptions.each((idx, el) => {
						//if select is multiple
						if(settings.multiple) {
							//insert value in explicit value for select
							setValue.push(el.value);
							//insert value in internal values data
							internalValues.push({
								value: el.value, 
								text: el.text
							});
						}
						//if select is not multiple
						else {
							//explicit value for select
							setValue = el.value;
							//insert last selected value in internal values data
							internalValues = [{
								value: el.value, 
								text: el.text
							}];
						}
					});
				}
				//if no options selected / no placeholder / select is not multiple
				else if(!settings.placeholder && !settings.multiple) {
					//get initial default value of select
					const initSelectValue = $originalSelect.val();
					//if value is not empty
					if(initSelectValue !== null && initSelectValue !== '') {
						const $selectedOption = $originalSelect.find('option[value="'+initSelectValue+'"]').first();
						if($selectedOption.length > 0) {
							//set explicit value for select
							setValue = initSelectValue;
							//set internal values data
							internalValues.push({
								value: $selectedOption[0].value, 
								text: $selectedOption[0].text
							});
						}
					}
				}
			}
			//set explicit select value
			$originalSelect.val(setValue);
			//return values
			return internalValues;
		},

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getAttrSettings

		//get selectMania settings stored as attributes
		getAttrSettings($originalSelect) {
			const attrData = {};
			//available attributes
			const attrs = ['width','size','placeholder','removable','empty','search','scrollContainer','zIndex','hidden'];
			//loop through attributes
			attrs.forEach((attr) => {
				//if attribute is set on select
				if($originalSelect.is('[data-'+attr+']')) {
					//insert data
					let elAttr = $originalSelect.attr('data-'+attr);
					if(elAttr === 'true' || elAttr === 'false') {
						elAttr = elAttr === 'true';
					}
					attrData[attr] = elAttr;
				}
			});
			//send back select attributes data
			return attrData;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ update

		//update selectMania element according to original select element
		update($originalSelect) {
			const self = this;
			//selectMania elements
			const $selectManiaEl = $originalSelect.data('selectMania-element');
			const $valueList = $selectManiaEl.find('.select-mania-values').first();
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			const $itemList = $dropdown.find('.select-mania-items').first();
			//update disabled status
			if($originalSelect.is('[disabled]')) {
				$selectManiaEl.addClass('select-mania-disabled');
			}
			else {
				$selectManiaEl.removeClass('select-mania-disabled');
			}
			//remove selectMania values and items
			$selectManiaEl.find('.select-mania-value').remove();
			$itemList.empty();
			//build and insert selected values
			$originalSelect.find('option:selected').each((idx, el) => {
				if($(el).is(':selected')) {
					$valueList.append(Build.buildValue({
						value: el.value, 
						text: el.text
					}));
				}
			});
			//build and insert items
			$itemList.append(Build.buildItemList($originalSelect.children()));
			//update clean values icon display
			self.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ destroy

		//destroy selectMania on targeted original select
		destroy($originalSelect) {
			//selectMania element
			const $selectManiaEl = $originalSelect.data('selectMania-element');
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//move original select out of the selectMania element
			$originalSelect.insertAfter($selectManiaEl);
			//remove dropdown
			$dropdown.remove();
			//remove selectMania element
			$selectManiaEl.remove();
			//remove class from original select
			$originalSelect.removeClass('select-mania-original');
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ openDropdown / closeDropdown

		//open items dropdown
		openDropdown($dropdown) {
			const self = this;
			//select-mania element
			const $selectManiaEl = $dropdown.closest('.select-mania');
			//if scroll container option is set
			if($selectManiaEl.is('[data-selectMania-scrollContainer]')) {
				//scroll container element
				const $scrollContainer = $($selectManiaEl.attr('data-selectMania-scrollContainer'));
				//position absolute dropdown
				self.positionDropdown($dropdown);
				//apply positionning class
				$dropdown.addClass('select-mania-absolute');
				//bind scroll container to close dropdown on scroll
				$scrollContainer.off('scroll.selectMania').on('scroll.selectMania', () => {
					//unbind close dropdown on scrolling
					$scrollContainer.off('scroll.selectMania');
					//close open dropdown
					self.closeDropdown($('.select-mania-dropdown.open'));
				});
				//reposition dropdown when window is resized
				$(window).off('resize.selectMania').on('resize.selectMania', () => {
					//position absolute dropdown
					self.positionDropdown($dropdown);
				});
			}
			//open dropdown
			$dropdown.stop().addClass('open').slideDown(100);
			//scroll dropdown to top
			$dropdown.find('.select-mania-items').scrollTop(0);
			//focus search input
			self.focusSearch($dropdown);
			//bind keyboard control
			$(document).off('keydown.selectMania').on('keydown.selectMania', Binds.keyboardControl);
		}, 

		//close items dropdown
		closeDropdown($dropdown) {
			const $selectManiaEl = $dropdown.data('selectMania-element');
			//unbind keyboard control
			$(document).off('keydown.selectMania');
			//remove every hover class from items
			$dropdown.find('.select-mania-item').removeClass('select-mania-hover');
			//if dropdown has aboslute positionning
			if($dropdown.hasClass('select-mania-absolute')) {
				//select-mania inner element
				const $selectManiaInner = $dropdown
					.data('selectMania-element')
					.find('.select-mania-inner')
					.first();
				//move back the dropdown inside select-mania element
				$dropdown
					.removeClass('open')
					.hide()
					.insertAfter(
						$selectManiaInner
					);
				//unbind repositioning on resize
				$(window).off('resize.selectMania');
				//unbind close dropdown on scrolling
				const $scrollContainer = $($selectManiaEl.attr('data-selectMania-scrollContainer'));
				if($scrollContainer.length > 0) {
					$scrollContainer.off('scroll.selectMania');
				}
			}
			//if dropdown has standard positionning
			else {
				//close dropdown
				$dropdown.stop().removeClass('open').slideUp(100);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ positionDropdown

		//position dropdown relative to its select-mania element
		positionDropdown($dropdown) {
			const $selectManiaEl = $dropdown.data('selectMania-element');
			//item list scroll data
			const $itemList = $dropdown.find('.select-mania-items');
			const itemListScroll = $itemList.scrollTop();
			//data for calculating dropdown absolute position
			const selectManiaElPos = $selectManiaEl.offset();
			const selectManiaElWidth = $selectManiaEl.outerWidth();
			const selectManiaElHeight = $selectManiaEl.outerHeight();
			//append dropdown to body in absolute position
			$dropdown.appendTo('body').css({
				position: 'absolute', 
				top: selectManiaElPos.top + selectManiaElHeight, 
				left: selectManiaElPos.left, 
				width: selectManiaElWidth
			});
			//force item list scroll to its initial state
			$itemList.scrollTop(itemListScroll);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ selectItem

		//perform item selection in dropdown
		selectItem($item) {
			const self = this;
			//dropdown element
			const $dropdown = $item.closest('.select-mania-dropdown');
			//selectMania element
			const $selectManiaEl = $dropdown.data('selectMania-element');
			//select original element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//if item not already selected
			if(!$item.is('.select-mania-selected')) {
				//clicked item value
				const itemVal = $item.attr('data-value');
				//build value element
				const $value = Build.buildValue({
					value: itemVal, 
					text: $item.text()
				});
				//if select multiple
				if($selectManiaEl.is('.select-mania-multiple')) {
					//insert value element in selectMania values
					$selectManiaEl.find('.select-mania-values').append($value);
					//add value in original select element
					self.addMultipleVal($originalSelect, itemVal);
				}
				//if select not multiple
				else {
					//unselect every other items
					$dropdown.find('.select-mania-item').removeClass('select-mania-selected');
					//insert value element in selectMania values
					$selectManiaEl.find('.select-mania-values .select-mania-value').remove();
					$selectManiaEl.find('.select-mania-values').append($value);
					//change value in original select element
					$originalSelect.val(itemVal);
				}
				//set clicked item as selected
				$item.addClass('select-mania-selected');
				//trigger original select change event
				$originalSelect.trigger('change');
			}
			//if absolute position dropdown
			if($dropdown.is('.select-mania-absolute')) {
				//position absolute dropdown
				self.positionDropdown($dropdown);
			}
			//if select not multiple
			if(!$selectManiaEl.is('.select-mania-multiple')) {
				//close dropdown
				self.closeDropdown($dropdown);
			}
			//update clear values icon display
			self.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ focusSearch

		//focus search input in dropdown
		focusSearch($dropdown) {
			$dropdown.find('.select-mania-search-input').focus();
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ addMultipleVal

		//add value to multiple original select
		addMultipleVal($originalSelect, val) {
			let originalVals = $originalSelect.val();
			if(!(originalVals instanceof Array)) {
				originalVals = [];
			}
			originalVals.push(val);
			$originalSelect.val(originalVals);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ removeMultipleVal

		//remove value from multiple original select
		removeMultipleVal($originalSelect, val) {
			let originalVals = $originalSelect.val();
			if(!(originalVals instanceof Array)) {
				originalVals = [];
			}
			originalVals.splice($.inArray(val, originalVals), 1);
			$originalSelect.val(originalVals);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ updateClean

		//display / hide clean values icon according to current values
		updateClean($selectManiaEl) {
			//original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
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
		doSearch($selectManiaEl) {
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//search value
			const searchVal = $dropdown.find('.select-mania-search-input').first().val().toLowerCase().trim();
			//if empty search value
			if(searchVal === '') {
				//display all items
				$dropdown.find('.select-mania-group, .select-mania-item').removeClass('select-mania-hidden');
				//stop function
				return;
			}
			//loop through dropdown items
			$dropdown.find('.select-mania-item').each((idx, el) => {
				//if item text matches search value
				if($(el).text().toLowerCase().indexOf(searchVal) !== -1) {
					//display item
					$(el).removeClass('select-mania-hidden');
				}
				//if item text don't match search value
				else {
					//hide item
					$(el).addClass('select-mania-hidden');
				}
			});
			//show / hide optgroups if contain results / empty
			$dropdown.find('.select-mania-group').each(() => {
				if($(el).find('.select-mania-item:not(.select-mania-hidden)').length > 0) {
					$(el).removeClass('select-mania-hidden');
				}
				else {
					$(el).addClass('select-mania-hidden');
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doSearchAjax

		//do ajax search in items dropdown
		doSearchAjax($selectManiaEl) {
			const self = this;
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//search value
			const search = $dropdown.find('.select-mania-search-input').first().val();
			//pause ajax scroll
			$selectManiaEl.data('selectMania-ajaxReady', false);
			//reset current page number
			$selectManiaEl.data('selectMania-ajaxPage', 1);
			//loading icon
			self.dropdownLoading($selectManiaEl);
			//call ajax function
			const ajaxFunction = $selectManiaEl.data('selectMania-ajaxFunction');
			const ajaxData = $selectManiaEl.data('selectMania-ajaxData');
			ajaxFunction(search, 1, ajaxData, (optHTML) => {
				//remove loading icon
				self.dropdownLoading($selectManiaEl, true);
				//replace current items with sent options
				self.replaceItems($selectManiaEl, optHTML);
				//rebind select
				Binds.bind($selectManiaEl);
				//reset ajax scroll data
				self.initAjax($selectManiaEl);
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ addItems / replaceItems

		//add items to dropdown
		addItems($selectManiaEl, optionsHTML) {
			const self = this;
			self.addOrReplaceItems($selectManiaEl, optionsHTML, false);
		}, 

		//replace dropdown items
		replaceItems($selectManiaEl, optionsHTML) {
			const self = this;
			self.addOrReplaceItems($selectManiaEl, optionsHTML, true);
		}, 

		//add / replace dropdown items
		addOrReplaceItems($selectManiaEl, optionsHTML, replace) {
			const self = this;
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//items dropdown
			const $itemsContainer = $dropdown.find('.select-mania-items');
			//options jquery parsing
			const $options = $(optionsHTML);
			//get selectMania element values
			const selectedVals = self.getVal($selectManiaEl);
			//loop through selected values
			selectedVals.forEach((val) => {
				$options
					//search for options matching selected value
					.filter((idx, el) => {
						const $el = $(el);
						return $el.attr('value') === val.value && $el.text() === val.text;
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
		initAjax($selectManiaEl, settings) {
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
		dropdownLoading($selectManiaEl, hide) {
			//if hide icon requested
			let isHide = false;
			if(typeof hide !== 'undefined' && hide === true) {
				isHide = true;
			}
			//dropdown inner list element
			const $dropdownContainer = $selectManiaEl.find('.select-mania-items-container').first();
			//remove loading icon if exists
			$dropdownContainer.find('.icon-loading-container').remove();
			//if show icon requested
			if(isHide !== true) {
				//build loading icon
				const $loadingIcon = $('<div class="icon-loading-container"></div>');
				$loadingIcon.append('<i class="icon-loading"></i>');
				//insert loading icon
				$dropdownContainer.append($loadingIcon);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getVal

		//get parsed selected values
		getVal($selectManiaEl) {
			const valObjs = [];
			//loop though values elements
			$selectManiaEl.find('.select-mania-value').each((idx, el) => {
				const $el = $(el);
				//selected value text
				const text = $el.find('.select-mania-value-text').first().text();
				//insert selected value object
				valObjs.push({
					value: $el.attr('data-value'), 
					text: text
				});
			});
			//send back parsed selected values
			return valObjs;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clear

		//clear select values
		clear($selectManiaEl) {
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//empty selectMania values
			$selectManiaEl.find('.select-mania-value').remove();
			//unselect items in dropdown
			$dropdown.find('.select-mania-item').removeClass('select-mania-selected');
			//empty values in original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			if($selectManiaEl.is('.select-mania-multiple')) {
				$originalSelect.val([]);
			}
			else {
				$originalSelect.val('');
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setVal

		//set parsed values as selected values
		setVal($selectManiaEl, valObjs) {
			const self = this;
			//original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//clear select values before setting provided values
			self.clear($selectManiaEl);
			//if there's more than one value in the values and select is not multiple
			if(valObjs.length > 1 && !$selectManiaEl.is('.select-mania-multiple')) {
				//keep only first value
				valObjs = valObjs.slice(0, 1);
			}
			//loop through values
			valObjs.forEach((val) => {
				//parse value object
				const valObj = $.extend({
					value: '', 
					text: '', 
					selected: true
				}, val);
				//set value in selectMania element
				self.setOneValSelectMania($selectManiaEl, valObj);
				//set value in original select
				self.setOneValOriginal($originalSelect, valObj);
			});
			//update clean values icon display
			self.updateClean($selectManiaEl);
			//rebind selectMania element
			Binds.bind($selectManiaEl);
		}, 

		//set one value on selectMania element
		setOneValSelectMania($selectMania, valObj) {
			//build value element for selectMania element
			const $value = Build.buildValue(valObj);
			//insert built value element in selectMania element
			$selectMania.find('.select-mania-values').append($value);
			//check if corresponding item exists in dropdown
			const $searchItem = $selectMania.find('.select-mania-item[data-value="'+valObj.value+'"]').filter((idx, el) => {
				return $(el).text() === valObj.text;
			});
			//if item exists in dropdown
			if($searchItem.length > 0) {
				//set item as selected
				$searchItem.first().addClass('select-mania-selected');
			}
		}, 

		//set one value on original select element
		setOneValOriginal($originalSelect, valObj) {
			//check if corresponding option exists in original select
			const $searchOpt = $originalSelect.find('option[value="'+valObj.value+'"]').filter((idx, el) => {
				return $(el).text() === valObj.text;
			});
			//if option doesn't exist in original select
			if($searchOpt.length < 1) {
				//build option for original select
				const $option = Build.buildOption(valObj);
				//insert built option in original select
				$originalSelect.append($option);
			}
			//if option already exists in original select
			else {
				//fond option element
				const $foundOption = $searchOpt.first();
				//set option as selected
				$foundOption[0].selected = true;
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ controls

		//control target element
		controlTarget($target, controls) {
			//error if element is not a select
			if($.inArray('isSelect', controls) !== -1 && !$target.is('select')) {
				console.error('selectMania | invalid select element');
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
		controlSettings($target, settings) {
			//control ajax function type
			if(settings.ajax !== false && typeof settings.ajax !== 'function') {
				settings.ajax = false;
				console.error('selectMania | invalid ajax function');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//error if invalid size provided
			if($.inArray(settings.size, ['tiny','small','medium','large']) === -1) {
				settings.size = 'medium';
				console.error('selectMania | invalid size');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//error if invalid sroll container provided
			if(settings.scrollContainer !== null && $(settings.scrollContainer).length < 1) {
				settings.scrollContainer = null;
				console.error('selectMania | invalid scroll container');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//error if invalid sroll container provided
			if(settings.zIndex !== null && (isNaN(parseInt(settings.zIndex)) || !isFinite(settings.zIndex))) {
				settings.zIndex = null;
				console.error('selectMania | invalid z-index');
				console.log($target[0]);
				console.log(settings);
				return false;
			}
			//if control ok
			return true;
		}, 

		//control selectMania values
		controlValues($target, values) {
			//error if values is not an array
			if(!(values instanceof Array)) {
				console.error('selectMania | values parameter is not a valid array');
				console.log($target[0]);
				console.log(values);
				return false;
			}
			//if control ok
			return true;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ navigateItem

		//navigate hover to next or previous item in dropdown
		navigateItem($dropdown, nextOrPrevious) {
			//selectMania element
			const $selectManiaEl = $dropdown.closest('.select-mania');
			//item scrollable list
			const $itemList = $dropdown.find('.select-mania-items');
			//active enabled items
			let validItemSelector = '.select-mania-item:not(.select-mania-disabled):not(.select-mania-hidden)';
			if($selectManiaEl.hasClass('select-mania-multiple')) {
				validItemSelector += ':not(.select-mania-selected)';
			}
			const $validItems = $dropdown.find(validItemSelector);
			//current hovered item
			const $hoveredItem = $dropdown.find(validItemSelector+'.select-mania-hover');
			//item to target
			let $targetItem = $();
			//if there is currently a hovered item
			if($hoveredItem.length > 0) {
				//if arrow up get previous item
				if(nextOrPrevious === 'next') {
					$targetItem = $validItems.slice($validItems.index($hoveredItem) + 1).first();
				}
				//if arrow down get next item
				else if(nextOrPrevious === 'previous') {
					$targetItem = $validItems.slice(0, $validItems.index($hoveredItem)).last();
				}
			}
			//no current hovered item
			else {
				//hovers first item
				$targetItem = $validItems.first();
			}
			//if target item exists hover this item
			if($targetItem.length > 0) {
				//remove hover from every item
				$dropdown.find('.select-mania-item').removeClass('select-mania-hover');
				//add hover class to target item
				$targetItem.addClass('select-mania-hover');
				//data for item visibility calculation
				const $targetItemPosition = $targetItem.position();
				const $targetItemHeight = $targetItem.outerHeight(true);
				const $itemListHeight = $itemList.height();
				const $itemListScrollTop = $itemList.scrollTop();
				//if target item not visible in item list (above)
				if($targetItemPosition.top < 0) {
					//scroll to see item
					$itemList.scrollTop($itemListScrollTop + $targetItemPosition.top);
				}
				//if target item not visible in item list (below)
				else if($targetItemPosition.top + $targetItemHeight > $itemListHeight) {
					//scroll to see item
					$itemList.scrollTop($itemListScrollTop + $targetItemPosition.top + $targetItemHeight - $itemListHeight);
				}
			}
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- BUILD ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

const Build = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ build

		//build selectMania element
		build($originalSelect, settings) {
			const self = this;
			//class for selectMania size
			const sizeClass = 'select-mania-'+settings.size;
			//explicit selectMania width style
			const widthStyle = 'style="width:'+settings.width+';"';
			//general selectMania div
			const $selectManiaEl = $('<div class="select-mania '+sizeClass+'" '+widthStyle+'></div>');
			//class for multiple
			if(settings.multiple) {
				$selectManiaEl.addClass('select-mania-multiple');
			}
			//class for disabled
			if(settings.disabled) {
				$selectManiaEl.addClass('select-mania-disabled');
			}
			//classes for themes
			if(settings.themes instanceof Array && settings.themes.length > 0) {
				//loop through themes
				settings.themes.forEach((theme) => {
					//applies theme class
					$selectManiaEl.addClass('select-mania-theme-'+theme);
				});
			}
			//class for activated ajax
			if(settings.ajax !== false) {
				$selectManiaEl.addClass('select-mania-ajax');
			}
			//attribute for scroll container
			if(settings.scrollContainer !== null) {
				$selectManiaEl.attr('data-selectMania-scrollContainer', settings.scrollContainer);
			}
			//build inner elements
			const $innerElements = self.buildInner(settings);
			//build dropdown
			const $dropdown = self.buildDropdown($originalSelect, settings);
			//insert elements
			$selectManiaEl.append($innerElements).append($dropdown);
			//attach dropdown to select-mania element
			$selectManiaEl.data('selectMania-dropdown', $dropdown);
			//attach select-mania element to dropdown
			$dropdown.data('selectMania-element', $selectManiaEl);
			//class for hidden setting
			if(settings.hidden === true) {
				$selectManiaEl.addClass('select-mania-hidden');
			}
			//send back selectMania element
			return $selectManiaEl;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildInner

		//build inner elements
		buildInner(settings) {
			const self = this;
			//inner div
			const $inner = $('<div class="select-mania-inner"></div>');
			//values div
			const $values = $('<div class="select-mania-values"></div>');
			//insert placeholder
			let placeholderText = '';
			if(typeof settings.placeholder === 'string' && settings.placeholder !== '') {
				placeholderText = settings.placeholder;
			}
			const $placeholder = $('<div class="select-mania-placeholder">'+placeholderText+'</div>');
			$values.append($placeholder);
			//insert selected values
			settings.values.forEach((val) => {
				$values.append(self.buildValue(val));
			});
			$inner.append($values);
			//insert clean values icon
			const $clean = $('<div class="select-mania-clear"></div>');
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
		buildValue(valObj) {
			//selected value element html
			const valHtml = '<div class="select-mania-value" data-value="'+valObj.value+'">'+
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
		buildOption(valObj) {
			//build option
			const $opt = $('<option value="'+valObj.value+'">'+valObj.text+'</option>');
			//set option selected status
			$opt[0].selected = valObj.selected;
			//send back option element
			return $opt;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildDropdown

		//build items dropdown
		buildDropdown($originalSelect, settings) {
			const self = this;
			//class for sizing
			const sizeClass = 'select-mania-'+settings.size;
			//dropdown element
			const $dropdown = $('<div class="select-mania-dropdown '+sizeClass+'"></div>');
			//classe si select multiple
			if(settings.multiple) {
				$dropdown.addClass('select-mania-multiple');
			}
			//insert search input in dropdown if activated
			if(settings.search) {
				const $dropdownSearch = $('<div class="select-mania-dropdown-search"></div>');
				$dropdownSearch.append('<input class="select-mania-search-input" />');
				$dropdown.append($dropdownSearch);
			}
			//build items container
			const $itemListContainer = $('<div class="select-mania-items-container"></div>');
			const $itemList = $('<div class="select-mania-items"></div>');
			//build and insert items list
			$itemList.append(self.buildItemList($originalSelect.children()));
			//insert items list into dropdown
			$itemListContainer.append($itemList);
			$dropdown.append($itemListContainer);
			//classes for themes
			if(settings.themes instanceof Array && settings.themes.length > 0) {
				//loop through themes
				settings.themes.forEach((theme) => {
					//applies theme class
					$dropdown.addClass('select-mania-theme-'+theme);
				});
			}
			//if zIndex setting is set
			if(settings.zIndex !== null) {
				$dropdown.css('z-index', settings.zIndex);
			}
			//send back items dropdown
			return $dropdown;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItemGroup

		//build items list
		buildItemList($optList) {
			const self = this;
			//empty item list
			let $itemList = $();
			//loop through original select children
			$optList.each((idx, el) => {
				const $el = $(el);
				//if optgroup
				if($el.is('optgroup')) {
					//build and insert item group
					$itemList = $itemList.add(self.buildItemGroup($el));
				}
				//if option
				else if($el.is('option')) {
					//build and insert item
					$itemList = $itemList.add(self.buildItem($el));
				}
			});
			//send back build items list
			return $itemList;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItemGroup

		//build dropdown items group
		buildItemGroup($optgroupEl) {
			const self = this;
			//build group element
			const $group = $('<div class="select-mania-group"></div>');
			const $groupInner = $('<div class="select-mania-group-inner"></div>');
			//build group title element
			const $groupTitle = $('<div class="select-mania-group-title"></div>');
			//if group icon is set
			if($optgroupEl.is('[data-icon]')) {
				//insert group title icon
				$groupTitle.append('<div class="select-mania-group-icon"><i class="'+$optgroupEl.attr('data-icon')+'"></i></div>');
			}
			//insert group title text
			$groupTitle.append('<div class="select-mania-group-text">'+$optgroupEl.attr('label')+'</div>');
			//insert group title in group element
			$group.append($groupTitle);
			//if group is disabled set class
			const groupIsDisabled = $optgroupEl.is(':disabled');
			if(groupIsDisabled) {
				$group.addClass('select-mania-disabled');
			}
			//build and insert items
			$optgroupEl.find('option').each((idx, el) => {
				$groupInner.append(self.buildItem($(el), groupIsDisabled));
			});
			$group.append($groupInner);
			//send back items group
			return $group;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItem

		//build dropdown item
		buildItem($optionEl, forceDisabled) {
			const optionEl = $optionEl[0];
			//build item html
			const $item = $('<div class="select-mania-item" data-value="'+optionEl.value+'"></div>');
			//if option icon is set
			if($optionEl.is('[data-icon]')) {
				//insert item icon
				$item.append('<div class="select-mania-item-icon"><i class="'+$optionEl.attr('data-icon')+'"></i></div>');
			}
			//insert item text
			$item.append('<div class="select-mania-item-text">'+optionEl.text+'</div>');
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

	const Binds = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bind

		//bind all selectMania controls
		bind($selectManiaEl) {
			const self = this;
			//original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//if select is not disabled
			if(!$selectManiaEl.is('.select-mania-disabled')) {
				//click outside select
				$(document).off('click.selectMania').on('click.selectMania', self.documentClick);
				//focus / blur original select element
				$originalSelect.off('focus.selectMania').on('focus.selectMania', self.focus);
				$originalSelect.off('blur.selectMania').on('blur.selectMania', self.blur);
				//clear values
				$selectManiaEl.find('.select-mania-clear-icon').off('click.selectMania').on('click.selectMania', self.clearValues);
				//clear select multiple individual value
				$selectManiaEl.find('.select-mania-value-clear-icon').off('click.selectMania').on('click.selectMania', self.clearValue);
				//open / close dropdown
				$selectManiaEl.find('.select-mania-inner').off('click.selectMania').on('click.selectMania', self.dropdownToggle);
				//item hover in dropdown
				$dropdown.find('.select-mania-item:not(.select-mania-disabled)').off('mouseenter.selectMania').on('mouseenter.selectMania', self.hoverItem);
				//item selection in dropdown
				$dropdown.find('.select-mania-item:not(.select-mania-disabled)').off('click.selectMania').on('click.selectMania', self.itemSelection);
				//search input in dropdown
				$dropdown.find('.select-mania-search-input').off('input.selectMania').on('input.selectMania', self.inputSearch);
				//prevents body scroll when reached dropdown top or bottom
				$dropdown.find('.select-mania-items').off('wheel.selectMania').on('wheel.selectMania', self.scrollControl);
				//ajax scroll
				if($selectManiaEl.is('.select-mania-ajax')) {
					$dropdown.find('.select-mania-items').off('scroll.selectMania').on('scroll.selectMania', self.scrollAjax);
				}
			}
			//if select is disabled unbind controls
			else {
				//focus / blur original select element
				$originalSelect.off('focus.selectMania');
				$originalSelect.off('blur.selectMania');
				//clear values
				$selectManiaEl.find('.select-mania-clear-icon').off('click.selectMania');
				//clear select multiple individual value
				$selectManiaEl.find('.select-mania-value-clear-icon').off('click.selectMania');
				//open / close dropdown
				$selectManiaEl.find('.select-mania-inner').off('click.selectMania');
				//item hover in dropdown
				$dropdown.find('.select-mania-item:not(.select-mania-disabled)').off('mouseenter.selectMania');
				//item selection in dropdown
				$dropdown.find('.select-mania-item:not(.select-mania-disabled)').off('click.selectMania');
				//search input in dropdown
				$dropdown.find('.select-mania-search-input').off('input.selectMania');
				//prevents body scroll when reached dropdown top or bottom
				$dropdown.find('.select-mania-items').off('wheel.selectMania');
				//ajax scroll
				$dropdown.find('.select-mania-items').off('scroll.selectMania');
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ dropdownToggle

		//BIND ONLY - open / close dropdown
		dropdownToggle(e) {
			e.stopPropagation();
			const $innerEl = $(e.currentTarget);
			//select-mania element
			const $selectManiaEl = $innerEl.closest('.select-mania');
			//dropdown element
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//if dropdown open
			if($dropdown.is('.open')) {
				//close dropdown
				Engine.closeDropdown($dropdown);
			}
			//if dropdown closed
			else {
				//close every open dropdown
				Engine.closeDropdown($('.select-mania-dropdown.open'));
				//open target dropdown
				Engine.openDropdown($dropdown);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ documentClick

		//BIND ONLY - click outside select
		documentClick(e) {
			//if click not in open dropdown
			if($(e.target).closest('.select-mania-dropdown').length < 1) {
				//close every open dropdown
				Engine.closeDropdown($('.select-mania-dropdown.open'));
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clearValues

		//BIND ONLY - clear values
		clearValues(e) {
			e.stopPropagation();
			const $clearIcon = $(e.currentTarget);
			//selectMania element
			const $selectManiaEl = $clearIcon.closest('.select-mania');
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			//clear values
			Engine.clear($selectManiaEl);
			//if absolute position dropdown
			if($dropdown.is('.select-mania-absolute')) {
				//position absolute dropdown
				Engine.positionDropdown($dropdown);
			}
			//trigger original select change event
			$originalSelect.trigger('change');
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clearValue

		//BIND ONLY - clear select multiple individual value
		clearValue(e) {
			e.stopPropagation();
			const $clearIcon = $(e.currentTarget);
			//selectMania element
			const $selectManiaEl = $clearIcon.closest('.select-mania');
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//value to delete
			const $value = $clearIcon.closest('.select-mania-value');
			//unselect item in dropdown
			$dropdown
				.find('.select-mania-item[data-value="'+$value.attr('data-value')+'"]')
				.removeClass('select-mania-selected');
			//remove value from selectMania element
			$value.remove();
			//remove value from original select element
			const $originalSelect = $selectManiaEl.data('selectMania-originalSelect');
			Engine.removeMultipleVal($originalSelect, $value.attr('data-value'));
			//if absolute position dropdown
			if($dropdown.is('.select-mania-absolute')) {
				//position absolute dropdown
				Engine.positionDropdown($dropdown);
			}
			//trigger original select change event
			$originalSelect.trigger('change');
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ itemSelection

		//BIND ONLY - item selection in dropdown
		itemSelection(e) {
			const $selectedItem = $(e.currentTarget);
			//select item in dropdown
			Engine.selectItem($selectedItem);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ inputSearch

		//BIND ONLY - dropdown search input
		inputSearch(e) {
			const $input = $(e.currentTarget);
			//selectMania element
			$selectManiaEl = $input.closest('.select-mania-dropdown').data('selectMania-element');
			//timer duration according to select multiple or not
			let time = 200;
			if($selectManiaEl.is('.select-mania-ajax')) {
				time = 400;
			}
			//clear timeout
			clearTimeout($input.data('selectMania-searchTimer'));
			//search input timeout
			$input.data('selectMania-searchTimer', setTimeout(() => {
				//ajax search
				if($selectManiaEl.is('.select-mania-ajax')) {
					Engine.doSearchAjax($selectManiaEl);
				}
				//normal search
				else {
					Engine.doSearch($selectManiaEl);
				}
			}, time));
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ scrollAjax

		//BIND ONLY - dropdown ajax scroll
		scrollAjax(e) {
			const self = this;
			const $itemList = $(e.currentTarget);
			//dropdown element
			const $dropdown = $itemList.closest('.select-mania-dropdown');
			//selectMania element
			const $selectManiaEl = $dropdown.data('selectMania-element');
			//if ajax scroll is not over
			if($selectManiaEl.data('selectMania-ajaxScrollDone') !== true) {
				//if scroll reached bottom with 12px tolerance
				if($itemList.scrollTop() >= $itemList[0].scrollHeight - $itemList.outerHeight() - 12) {
					//if ajax scroll is ready
					if($selectManiaEl.data('selectMania-ajaxReady') === true) {
						//page number to call
						const page = $selectManiaEl.data('selectMania-ajaxPage') + 1;
						//search value
						const search = $selectManiaEl.find('.select-mania-search-input').first().val();
						//pause ajax scroll
						$selectManiaEl.data('selectMania-ajaxReady', false);
						//enregistre nouvelle page en cours
						$selectManiaEl.data('selectMania-ajaxPage', page);
						//loading icon
						Engine.dropdownLoading($selectManiaEl);
						//call ajax function
						const ajaxFunction = $selectManiaEl.data('selectMania-ajaxFunction');
						const ajaxData = $selectManiaEl.data('selectMania-ajaxData');
						ajaxFunction(search, page, ajaxData, (optHTML) => {
							//remove loading icon
							Engine.dropdownLoading($selectManiaEl, true);
							//if options returned
							if(optHTML.trim() !== '') {
								//add items to dropdown from sent options
								Engine.addItems($selectManiaEl, optHTML);
								//rebind selectMania element
								self.bind($selectManiaEl);
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
		scrollControl(e) {
			const $dropdown = $(e.currentTarget);
			if(e.originalEvent.deltaY < 0) {
				return ($dropdown.scrollTop() > 0);
			}
			else {
				return($dropdown.scrollTop() + $dropdown.innerHeight() < $dropdown[0].scrollHeight);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ focus / blur

		//BIND ONLY - focus selectMania when original select is focused
		focus(e) {
			const self = this;
			const $originalSelect = $(e.currentTarget);
			//selectMania element
			const $selectManiaEl = $originalSelect.data('selectMania-element');
			//add focus class to selectMania element
			$selectManiaEl.addClass('select-mania-focused');
			//bind keyboard dropdown opening
			$originalSelect.off('keydown.selectMania').on('keydown.selectMania', self.keyboardOpening);
		}, 

		//BIND ONLY - unfocus selectMania when original select is focused
		blur(e) {
			const $originalSelect = $(e.currentTarget);
			//selectMania element
			const $selectManiaEl = $originalSelect.data('selectMania-element');
			//remove focus class from selectMania element
			$selectManiaEl.removeClass('select-mania-focused');
			//unbind keyboard dropdown opening
			$originalSelect.off('keydown.selectMania');
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ hoverItem

		//BIND ONLY - hover status on dropdown items
		hoverItem(e) {
			const $item = $(e.currentTarget);
			//dropdown
			const $dropdown = $item.closest('.select-mania-dropdown');
			//remove hover from every item
			$dropdown.find('.select-mania-item').removeClass('select-mania-hover');
			//apply hover class
			$item.addClass('select-mania-hover');
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ keyboardOpening / keyboardControl

		//BIND ONLY - keyboard dropdown opening
		keyboardOpening(e) {
			const $originalSelect = $(e.currentTarget);
			//selectMania element
			const $selectManiaEl = $originalSelect.data('selectMania-element');
			//dropdown
			const $dropdown = $selectManiaEl.data('selectMania-dropdown');
			//list of key codes triggering opening beside characters (enter, spacebar, arrow keys)
			const openingKeys = [13,32,37,38,39,40];
			//if dropdown is closed and triggering key pressed
			if(!$dropdown.hasClass('open') && $.inArray(e.keyCode, openingKeys) !== -1) {
				e.preventDefault();
				e.stopPropagation();
				//unfocus original select
				$originalSelect.blur();
				//opens dropdown
				Engine.openDropdown($dropdown);
			}
		}, 

		//BIND ONLY - keyboard control within dropdown
		keyboardControl(e) {
			//currently open dropdown
			const $dropdown = $('.select-mania-dropdown.open').first();
			//list of control keys (tab, enter, escape, arrow up, arrow down)
			const controlKeys = [9,13,27,38,40];
			//if a selectMania dropdown is open and key pressed is a control key
			if($dropdown.length > 0 && $.inArray(e.keyCode, controlKeys) !== -1) {
				e.preventDefault();
				e.stopPropagation();
				//switch key pressed
				switch(e.keyCode) {
					//enter
					case 13:
						//currently hovered element
						const $hoverItem = $dropdown.find('.select-mania-item:not(.select-mania-disabled):not(.select-mania-hidden).select-mania-hover').first();
						//if hovered element exists
						if($hoverItem.length > 0) {
							//select item in dropdown
							Engine.selectItem($hoverItem);
						}
						break;
					//tab
					case 9:
					//escape
					case 27:
						//close dropdown
						Engine.closeDropdown($dropdown);
						break;
					//arrow up
					case 38:
						//hover previous item in dropdown
						Engine.navigateItem($dropdown, 'previous');
						break;
					//arrow down
					case 40:
						//hover next item in dropdown
						Engine.navigateItem($dropdown, 'next');
						break;
				}
			}
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- TOOLS ----------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	const Tools = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ def

		//force null if var is undefined
		def(v) {
			if(typeof v === 'undefined') {
				return null;
			}
			return v;
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// --------------------------------------- METHODS --------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	const Methods = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ init

		//initialize selectMania
		init(opts) {
			//settings provided by user
			const settings = $.extend(true, {}, Data.defaults, opts);
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to initialize
				const $originalSelect = $(el);
				//controls if element is a select and plugin is not already initialized
				if(Engine.controlTarget($originalSelect, ['isSelect','notInitialized'])) {
					//initialize selectMania on original select
					Engine.initialize($originalSelect, settings);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ update

		//update selectMania items and values
		update() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if selectMania initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//update selectMania
					Engine.update($originalSelect);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ destroy

		//destroy selectMania
		destroy() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if selectMania initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//destroy selectMania
					Engine.destroy($originalSelect);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ check

		//check if selectMania initialized
		check() {
			//controls method was called on single element
			if(Engine.controlTarget(this, ['isSingle'])) {
				//send back if plugin initialized or not
				return this.hasClass('select-mania-original');
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ get

		//returns parsed selected values
		get() {
			//controls if single element and plugin initialized
			if(Engine.controlTarget(this, ['isSingle','isInitialized'])) {
				//selectMania element
				const $selectManiaEl = this.data('selectMania-element');
				//get and return parsed selected values
				return Engine.getVal($selectManiaEl);
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ set

		//set parsed values as selected values
		set(values) {
			//controls if single element and plugin initialized
			if(Engine.controlTarget(this, ['isSingle','isInitialized'])) {
				//controls values are valid
				if(Engine.controlValues(this, values)) {
					//selectMania element
					const $selectManiaEl = this.data('selectMania-element');
					//get and return parsed selected values
					Engine.setVal($selectManiaEl, values);
				}
			}					
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clear

		//clear values
		clear() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
					//clear values
					Engine.clear($selectManiaEl);
					//trigger original select change event
					$originalSelect.trigger('change');
					//update clear values icon display
					Engine.updateClean($selectManiaEl);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ open

		//open dropdown
		open() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current original select
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
					//dropdown element
					const $dropdown = $selectManiaEl.data('selectMania-dropdown');
					//open dropdown
					Engine.openDropdown($dropdown);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ close

		//close dropdown
		close() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current original select
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
					//dropdown element
					const $dropdown = $selectManiaEl.data('selectMania-dropdown');
					//close dropdown
					Engine.closeDropdown($dropdown);
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ hide

		//hide select mania
		hide() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
					//dropdown element
					const $dropdown = $selectManiaEl.data('selectMania-dropdown');
					//close dropdown
					Engine.closeDropdown($dropdown);
					//add hidding class to select mania
					$selectManiaEl.addClass('select-mania-hidden');
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ show

		//show select mania
		show() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
					//remove hidding class from select mania
					$selectManiaEl.removeClass('select-mania-hidden');
				}
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setup

		//setup default settings values
		setup() {
			//loop through targeted elements
			return this.each((idx, el) => {
				//current select to destroy
				const $originalSelect = $(el);
				//controls if plugin initialized
				if(Engine.controlTarget($originalSelect, ['isInitialized'])) {
					//selectMania element
					const $selectManiaEl = $originalSelect.data('selectMania-element');
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

	//plugin methods handler
	$.fn.selectMania = function(methodOrOpts) {
		//stop right away if targeted element empty
		if(this.length < 1) { return; }
		//call method
		if(Methods[methodOrOpts]) {
			//remove method name from call arguments
			const slicedArguments = Array.prototype.slice.call(arguments, 1);
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

	//plugin setup handler
	$.extend({
		selectManiaSetup: (opts) => {
			//set default settings values
			Data.setup(opts);
		}
	});

})(jQuery);