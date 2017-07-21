# select-mania

A jQuery select plugin.

## Depencies

- [jQuery (v1.6+)](https://jquery.com)

## Quick start

Link the main CSS and JS files:
```html
<link rel="stylesheet" href="path-to-select-mania/select-mania.css" />
<script type="text/javascript" src="path-to-select-mania/select-mania.js"></script>
```

Initialize select-mania:
```javascript
$('target-selector').selectMania();
//with options
$('target-selector').selectMania({
    //options here
});
```

## Options

Select-mania can be initialized with a bunch of available options.

#### Example

```javascript
$('target-selector').selectMania({
	width: '200px', 
	size: 'small', 
	themes: ['square','red'], 
	placeholder: 'Please select me!'
});
```

#### Available options

##### width

Default: `'100%'`

The select width.

Must be a valid CSS width.

##### size

Default: `'medium'`

The size of the select.

Three sizes are available: `'small'`, `'medium'`, `'large'`

##### themes

Default: `[]`

An array of the themes names to apply.

Themes CSS files can be found in the `themes` folder with names like `select-mania-theme-[themeName].css`

You can create your own theme! A `sample.css` theme file is here to help you doing that.

##### placeholder

Default: `'Select an item'`

The text of the placeholder.

##### removable

Default: `false`

Set this option to `true` to be able to remove the selected option of a simple select, even without any empty option available.

##### search

Default: `false`

If set to `true`, a search input will be available in the dropdown to search for items to select.

If the `ajax` option is enabled, the search will be made in ajax with the provided function (see below).

##### ajax

Default: `false`

Select-mania can load items in ajax while scrolling, and do ajax search.

In order to enable ajax features, set the `ajax` option to a function like this:
```javascript
function(search, page, data, callback) {
    //send back html options to select-mania
    callback(hmtlOptions);
}
```

The function takes 4 arguments:
- `search`: the current search input value
- `page`: the requested page number
- `data`: provided custom data (see below)
- `callback`: function to call to send back the result

The results sent by the callback function must be options to add / options found (if searching) in the form of a HTML string, or jQuery / DOM elements.

Example:
```javascript
ajax: function(search, page, data, callback) {
	$.ajax({
		type: 'POST', 
		url: 'myAjaxScript.php', 
		data: {
			search: search, 
			page: page, 
			custom: data.custom
		}, 
		success: function(html) {
			callback(html);
		}
	});
}
```

##### data

Default: `{}`

This data will be set as argument in the ajax function if enabled.

## Methods

### init

Call this method to initialize select-mania on the targeted select elements.
```javascript
//simple call
$('target-selector').selectMania({/*options*/});
//explicit call
$('target-selector').selectMania('init', {/*options*/});
```

### destroy

This method destroys select-mania on the targeted elements.

The select-mania element will be removed and the original select set to this original state.
```javascript
$('target-selector').selectMania('destroy');
```

### check

*This method can be called on a single element only!*

Returns `true` if select-mania is initialized on the targeted select, `false` otherwise.
```javascript
$('target-selector').selectMania('check');
```

### get

*This method can be called on a single element only!*

Call this method to get parsed selected values of a select-mania initialized element.

This can be useful to set selected values on further initialization, if these values were selected from ajax scroll / search and are not there anymore.
```javascript
$('target-selector').selectMania('get');
```

Returns selected values like this:
```javascript
[
    {
        value: '20', 
        text: 'Value number twenty'
    }, 
    {
        value: '60', 
        text: 'Value number sixty'
    }
]
```

### set

*This method can be called on a single element only!*

This method sets the provided values as selected values on the targeted select-mania initialized element.

The provided values must be formed like the data returned by the `get` method.
```javascript
$('target-selector').selectMania('set', [
    {
        value: '20', 
        text: 'Value number twenty'
    }, 
    {
        value: '60', 
        text: 'Value number sixty'
    }
]);
```

### clear

Clear the selected values of the targeted select.
```javascript
$('target-selector').selectMania('clear');
```

## Questions

##### Can I still get the selected values directly from the original select element?
Of course! Just do a classic `$('target-selector').val();` and it will be fine. Every action taken on the select-mania element is passed on the orinal select element.

##### This plugin doesn't work!
Oh... Sorry about that! Please feel free to post issues on the [select-mania repository](https://github.com/pitininja/select-mania)! I'll do my best to fix what's broken.