(function($) {

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// ---------------------------------------- ENGINE ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Engine = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getData

		//get select data
		getData: function(el, settings) {
			var thisEngine = this;
			//select data
			var data = {
				multiple: false, 
				values: [], 
				items: []
			};
			//if select is multiple
			data.multiple = $(el).is('[multiple]');
			//loop through select options
			$(el).find('option').each(function() {
				//set as value if option is selected
				if(this.selected) {
					data.values.push({
						value: this.value, 
						text: this.text
					});
				}
				//insert option in items list
				data.items.push({
					value: this.value, 
					text: this.text, 
					selected: this.selected
				});
			});
			//merge select data with user settings
			data = $.extend(data, settings);
			//get select data stored as attributes
			var attrData = thisEngine.getAttrData(el);
			//merge select data found in attributes
			data = $.extend(data, attrData);
			//send back select data
			return data;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ getData

		//get select data stored as attributes
		getAttrData: function(el) {
			var attrData = {};
			//available attributes
			var attrs = ['width','removable','search'];
			//loop through attributes
			attrs.forEach(function(attr) {
				//if attribute is set on select
				if($(el).is('[data-'+attr+']')) {
					//insert data
					var elAttr = $(el).attr('data-'+attr);
					if(elAttr === 'true' || elAttr === 'false') {
						elAttr = elAttr === 'true';
					}
					attrData[attr] = elAttr;
				}
			});
			//send back select attributes data
			return attrData;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ build

		//build selectMania element
		build: function(data) {
			var thisEngine = this;
			//general selectMania div
			var $select = $('<div class="select-mania" style="width:'+data.width+';"></div>');
			//class for multiple
			if(data.multiple) {
				$select.addClass('select-mania-multiple');
			}
			//class for activated ajax
			if(data.ajax !== false) {
				$select.addClass('select-mania-ajax');
			}
			//insert children elements
			$select
				//inner elements
				.append(thisEngine.buildInner(data))
				//items dropdown
				.append(thisEngine.buildDropdown(data));
			//send back selectMania element
			return $select;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildInner

		//build inner elements
		buildInner: function(data) {
			var thisEngine = this;
			//inner div
			var $inner = $('<div class="select-mania-inner"></div>');
			//insert selected values
			var $values = $('<div class="select-mania-values"></div>');
			data.values.forEach(function(val) {
				$values.append(thisEngine.buildValue(val));
			});
			$inner.append($values);
			//insert clean values icon
			var $clean = $('<div class="select-mania-clear"></div>');
			if(data.removable || data.multiple) {
				$clean.append('<i class="select-mania-clear-icon fas fa-times">');
			}
			$inner.append($clean);
			//insert dropdown arrow icon
			$inner.append($('<div class="select-mania-arrow"><i class="select-mania-arrow-icon fas fa-angle-down"></i></div>'));
			//send back inner elements
			return $inner;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bindValue

		//build selected value
		buildValue: function(val) {
			var thisEngine = this;
			//selected value element html
			var valHtml = '<div class="select-mania-value" data-value="'+val.value+'">'+
				'<div class="select-mania-value-text">'+val.text+'</div>'+
				'<div class="select-mania-value-clear">'+
					'<i class="select-mania-value-clear-icon fas fa-times"></i>'+
				'</div>'+
			'</div>';
			//send back selected value element
			return $(valHtml);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildDropdown

		//build items dropdown
		buildDropdown: function(data) {
			var thisEngine = this;
			//dropdown element
			var $dropdown = $('<div class="select-mania-dropdown"></div>');
			//insert search input in dropdown if activated
			if(data.search) {
				var $dropdownSearch = $('<div class="select-mania-dropdown-search"></div>');
				$dropdownSearch.append('<input class="select-mania-dropdown-search-input" />');
				$dropdown.append($dropdownSearch);
			}
			//insert items list
			var $itemContainer = $('<div class="select-mania-dropdown-items"></div>');
			data.items.forEach(function(item) {
				$itemContainer.append(thisEngine.buildItem(item));
			});
			$dropdown.append($itemContainer);
			//send back items dropdown
			return $dropdown;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ buildItem

		//build dropdown item
		buildItem: function(item) {
			var thisEngine = this;
			//item html
			var $itemHtml = $('<div class="select-mania-dropdown-item" data-value="'+item.value+'">'+
				item.text+
			'</div>');
			//if item is selected add class
			if(item.selected) {
				$itemHtml.addClass('select-mania-selected');
			}
			//send back item
			return $itemHtml;
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ openDropdown / closeDropdown

		//open / close items dropdown
		openDropdown: function($dropdown) {
			$dropdown.stop().addClass('open').slideDown(100);
		}, 
		closeDropdown: function($dropdown) {
			$dropdown.stop().removeClass('open').slideUp(100);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ openDropdown / closeDropdown

		//add value to multiple select
		addMultipleVal: function($selectEl, val) {
			var originalVals = $selectEl.val();
			originalVals.push(val);
			$selectEl.val(originalVals);
		}, 

		//remove value from multiple select
		removeMultipleVal: function($selectEl, val) {
			var originalVals = $selectEl.val();
			originalVals.splice($.inArray(val, originalVals), 1);
			$selectEl.val(originalVals);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ updateClean

		//display / hide clean values icon according to current values
		updateClean: function($selectManiaEl) {
			//original select element
			var $originalSelect = $($selectManiaEl.data('selectMania-originalSelect'));
			//if value is not empty
			if($originalSelect.val().length > 0) {
				//display clean values icon
				$selectManiaEl.find('.select-mania-clear-icon').show();
			}
			//if empty value
			else {
				//hide clean values icon
				$selectManiaEl.find('.select-mania-clear-icon').hide();
			}
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doSearch / doSearchAjax

		//do search in items dropdown
		doSearch: function($selectManiaEl) {
			//search value
			var searchVal = $selectManiaEl.find('.select-mania-dropdown-search-input').first().val();
			searchVal = searchVal.toLowerCase().trim();
			//if empty search value
			if(searchVal === '') {
				//display all items
				$selectManiaEl.find('.select-mania-dropdown-item').removeClass('select-mania-hidden');
				//stop function
				return;
			}
			//loop through dropdown items
			$selectManiaEl.find('.select-mania-dropdown-item').each(function() {
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

		//do ajax search in items dropdown
		doSearchAjax: function($selectManiaEl) {
			var thisEngine = this;
			//search value
			var thisSearch = $selectManiaEl.find('.select-mania-dropdown-search-input').first().val();
			//pause ajax scroll
			$selectManiaEl.data('selectMania-ajaxReady', false);
			//reset current page number
			$selectManiaEl.data('selectMania-ajaxPage', 1);
			// TODO: loading icon
			//call ajax function
			var thisAjaxFunction = $selectManiaEl.data('selectMania-ajax');
			thisAjaxFunction(thisSearch, 1, function(optHTML) {
				// TODO: remove loading icon
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
			//original select element
			var $originalSelect = $($selectManiaEl.data('selectMania-originalSelect'));
			//items dropdown
			var $itemsContainer = $selectManiaEl.find('.select-mania-dropdown-items');
			//options jquery parsing
			var $options = $(optionsHTML).filter('option');
			//array for selected values
			var selectedVals = [];
			//insert selected values in array
			if($selectManiaEl.is('.select-mania-multiple')) {
				selectedVals = $originalSelect.val();
			}
			else {
				selectedVals.push($originalSelect.val());
			}
			//container element for built items
			$builtItems = $();
			//loop through sent options
			$options.each(function() {
				//if option value is in selected values
				if($.inArray(this.value, selectedVals) !== -1) {
					//set option as selected
					this.selected = true;
				}
				//build item from option
				var $builtItem = Engine.buildItem({
					value: this.value, 
					text: this.text, 
					selected: this.selected
				});
				//add built item to items list to insert
				$builtItems = $builtItems.add($builtItem);
			});
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
		initAjax: function($selectManiaEl, ajaxFunction) {
			//attach ajax function
			if(typeof ajaxFunction === 'function') {
				$selectManiaEl.data('selectMania-ajax', ajaxFunction);
			}
			//reset ajax data
			$selectManiaEl.data('selectMania-ajaxPage', 1);
			$selectManiaEl.data('selectMania-ajaxReady', true);
			$selectManiaEl.data('selectMania-ajaxScrollDone', false);
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
			$selectManiaEl.find('.select-mania-dropdown-item').off('click.selectMania').on('click.selectMania', thisBinds.selectItem);
			//search input in dropdown
			$selectManiaEl.find('.select-mania-dropdown-search-input').off('input.selectMania').on('input.selectMania', thisBinds.inputSearch);
			//ajax scroll
			if($selectManiaEl.is('.select-mania-ajax')) {
				$selectManiaEl.find('.select-mania-dropdown-items').off('scroll.selectMania').on('scroll.selectMania', thisBinds.scrollAjax);
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
			//empty selectMania values
			$selectManiaEl.find('.select-mania-values').empty();
			//unselect items in dropdown
			$selectManiaEl.find('.select-mania-dropdown-item').removeClass('select-mania-selected');
			//empty values in original select element
			var $originalSelect = $($selectManiaEl.data('selectMania-originalSelect'));
			if($selectManiaEl.is('.select-mania-multiple')) {
				$originalSelect.val([]);
			}
			else {
				$originalSelect.val('');
			}
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
				.find('.select-mania-dropdown-item[data-value="'+$value.attr('data-value')+'"]')
				.removeClass('select-mania-selected');
			//remove value from selectMania element
			$value.remove();
			//remove value from original select element
			var $originalSelect = $($selectManiaEl.data('selectMania-originalSelect'));
			Engine.removeMultipleVal($originalSelect, $value.attr('data-value'));
			//update clear values icon display
			Engine.updateClean($selectManiaEl);
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ selectItem

		//BIND ONLY - item selection in dropdown
		selectItem: function() {
			//selectMania element
			var $selectManiaEl = $(this).closest('.select-mania');
			//select original element
			var $originalSelect = $($selectManiaEl.data('selectMania-originalSelect'));
			//if item not already selected
			if(!$(this).is('.select-mania-selected')) {
				//clicked item value
				var itemVal = $(this).attr('data-value');
				//build value element
				var $value = Engine.buildValue({
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
					$selectManiaEl.find('.select-mania-dropdown-item').removeClass('select-mania-selected');
					//insert value element in selectMania values
					$selectManiaEl.find('.select-mania-values').html($value);
					//change value in original select element
					$originalSelect.val(itemVal);
				}
				//set clicked item as selected
				$(this).addClass('select-mania-selected');
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
		scrollAjax: function() {
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
						// TODO: loading icon
						//call ajax function
						var thisAjaxFunction = $selectManiaEl.data('selectMania-ajax');
						thisAjaxFunction(thisSearch, thisPage, function(optHTML) {
							// TODO: remove loading icon
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
		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// --------------------------------------- MÉTHODES --------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	var Methods = {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ init

		//selectMania initialization
		init : function(opts) {
			//settings provided by user
			var settings = $.extend({
				width: '100%', 
				removable: false, 
				search: false, 
				ajax: false
			}, opts);
			//loop through targeted elements
			return this.each(function() {
				//error if element is not a select
				if($(this).hasClass('select-mania')) {
					console.error('selectMania | not a valid select element');
					console.log(this);
					return;
				}
				//error if plugin already initialized
				if($(this).hasClass('select-mania')) {
					console.info('selectMania | ignore because already initialized');
					console.log(this);
					return;
				}
				//get select data
				var thisData = Engine.getData(this, settings);
				//control ajax function type
				if(thisData.ajax !== false && typeof thisData.ajax !== 'function') {
					thisData.ajax = false;
					console.error('selectMania | not a valid ajax function');
					console.log(this);
				}
				//build selectMania elements
				var $builtSelect = Engine.build(thisData);
				//attach original select element to selectMania element
				$builtSelect.data('selectMania-originalSelect', this);
				//if ajax is activated
				if(thisData.ajax !== false) {
					//initialize ajax data
					Engine.initAjax($builtSelect, thisData.ajax);
				}
				//update clean values icon display
				Engine.updateClean($builtSelect);
				//hide original select element
				$(this).hide();
				//insert selectMania element before original select
				$builtSelect.insertBefore(this);
				//bind selectMania element
				Binds.bind($builtSelect);
			});
		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ update

		//update selectMania instantiation
		update : function(opts) {

			// TODO

		}, 

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ destroy

		//destroy selectMania instantiation
		destroy : function(opts) {

			// TODO

		}

	};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //
// --------------------------------------- HANDLER ---------------------------------------- //
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ //

	//plugin calls handler
	$.fn.selectMania = function(methodOrOpts) {

		//if call method
		if(Methods[methodOrOpts]) {
			//remove method name from call arguments
			var slicedArguments = Array.prototype.slice.call(arguments, 1);
			//call targeted mathod with arguments
			return Methods[methodOrOpts].apply(this, slicedArguments);
		}
		//if call init
		else if(typeof methodOrOpts === 'object' || !methodOrOpts) {
			//call init with arguments
			return Methods.init.apply(this, arguments);
		}
		//call error
		else {
			console.error('selectMania | wrong method called');
			console.log(this);
		}

	};

})(jQuery);