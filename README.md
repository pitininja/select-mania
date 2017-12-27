# select-mania

A jQuery select plugin.

## Examples

[Check the website!](https://pitininja.github.io/select-mania/)

## Depencies

[jQuery (v1.6+)](https://jquery.com)

## Quick start

Link the main CSS and JS files:
```html
<link rel="stylesheet" href="path-to-select-mania/select-mania.css" />
<script type="text/javascript" src="path-to-select-mania/select-mania.js"></script>
```

Initialize select-mania:
```javascript
$('target-selector').selectMania();
//with settings
$('target-selector').selectMania({
    //settings here
});
```

Use select-mania methods:
```javascript
$('target-selector').selectMania('method');
//with data
$('target-selector').selectMania('method', {
    //data
});
```

## Settings

Select-mania can be initialized with a bunch of available settings.

### Example

```javascript
$('target-selector').selectMania({
    width: '200px', 
    size: 'small', 
    themes: ['square','red'], 
    placeholder: 'Please select me!'
});
```

### Available settings

#### width

Default: `'100%'`

The select width.

Must be a valid CSS width.

Can be set by passing a `data-width` attribute on the select element.

#### size

Default: `'medium'`

The size of the select.

Three sizes are available: `'tiny'`, `'small'`, `'medium'`, `'large'`

Can be set by passing a `data-size` attribute on the select element.

#### themes

Default: `[]`

An array of the themes names to apply.

Themes CSS files can be found in the `themes` folder with names like `select-mania-theme-[themeName].css`

You can create your own theme! A `sample.css` theme file is here to help you doing that.

### scrollContainer

Default: null

A selector or element which is the scrollable container of the select.

If a scroll container is set, the dropdown will be opened in a special way so it does not go under the scrollable element.

Note that the dropdown will close automatically if any scroll is detected on the scroll container.

### zIndex

Default: null

A z-index value for the dropdown.

Can be useful if the select is placed in a high z-index element so it doesn't go under it.

This option works only if `scrollContainer` is enabled.

#### placeholder

Default: `'Select an item'`

The text of the placeholder.

Can be set by passing a `data-placeholder` attribute on the select element.

#### removable

Default: `false`

Set this setting to `true` to be able to remove the selected option of a simple select, even without any empty option available.

Can be set by passing a `data-removable` attribute on the select element.

#### empty

Default: `false`

If this setting is enabled, the select value will be forced as empty on initialization.

Can be set by passing a `data-empty` attribute on the select element.

#### search

Default: `false`

If set to `true`, a search input will be available in the dropdown to search for items to select.

If the `ajax` setting is enabled, the search will be made in ajax with the provided function (see below).

Can be set by passing a `data-search` attribute on the select element.

#### ajax

Default: `false`

Select-mania can load items in ajax while scrolling, and do ajax search.

In order to enable ajax features, set the `ajax` setting to a function like this:
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

#### data

Default: `{}`

This data will be set as argument in the ajax function if enabled.

### Option settings

#### optgroup

Optgroup elements are supported.
```html
<optgroup label="Group">
    <option value="1">Item</option>
</optgroup>
```

#### icon

An icon can be placed before any item or group text. If a `data-icon` attribute is set on an option or optgroup element, an `i` icon element will be created with the `data-icon` attribute value as class and will be placed before the element text. Therefore this feature is font-awesome friendly.
```html
<optgroup data-icon="fa fa-user" label="Group">
    <option value="1" data-icon="fa fa-user">Item</option>
</optgroup>
```

#### disabled

Disabled option or optgroup elements will be render as disabled items or groups in the dropdown.
```html
<optgroup label="Group" disabled>
    <option value="1" disabled>Item</option>
</optgroup>
```

#### selected

Any selected option element will be set as selected value.
```html
<option value="1" selected>Item</option>
```

## Setup settings

Settings can be set globally by using the `selectManiaSetup` method.

The settings set that way will be apply by default on every select initialized with the plugin.
```javascript
$.selectManiaSetup({
    /* global settings */
});
```

## Methods

### init

Call this method to initialize select-mania on the targeted select elements.
```javascript
//simple call
$('target-selector').selectMania({/*settings*/});
//explicit call
$('target-selector').selectMania('init', {/*settings*/});
```

### update

Updates select-mania on targeted elements.

The select-mania element will be updated according to the original select options.
```javascript
$('target-selector').selectMania('update');
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
if($('target-selector').selectMania('check')) {
    // select-mania is initialized!
}
```

### get

*This method can be called on a single element only!*

Call this method to get parsed selected values of a select-mania initialized element.

This can be useful to set selected values on further initialization, if these values were selected from ajax scroll / search and are not there anymore.
```javascript
var values = $('target-selector').selectMania('get');
values: [
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

##### Which attributes are supported?
Select-Mania supports the following attributes: `disabled`, `required` and `multiple`.

##### Can I still get the selected values directly from the original select element?
Of course! Just do a classic `$('target-selector').val();`. Any changes on the select-mania element is passed on the original select element.

##### I want to control this thing with my keyboard!
You're a keyboard person? Select-Mania can be manipulated with standard keyboard controls. Try it out!

##### This plugin doesn't work!
Oh... Sorry about that! Please feel free to post issues on the [select-mania repository](https://github.com/pitininja/select-mania)! I'll do my best to fix what's broken.
