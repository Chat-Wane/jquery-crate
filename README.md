# jquery-crate

<i>Keywords: jQuery plugin, distributed, decentralized, collaborative editor </i>

The project aims to create a very easy-to-integrate distributed collaborative
editor directly inside your web pages.


# Usage

```html
<!-- #1 include style dependencies in the header //-->
<link rel='stylesheet' href='path/to/bootstrap.min.css' />
<link rel='stylesheet' href='path/to/font-awesome.min.css' />
```

```html
<!-- #1 include jquery, bootstrap, zeroclipboard, and the crate plugin //-->
<script src='path/to/jquery.min.js'></script
<script src='path/to/bootstrap.min.js'></script>
<script src='path/to/ZeroclipBoard.min.js'></script>

<script src='path/to/jquery-crate.min.js'></script>
```


```html
<!-- #2 create the division that will host the distributed editor //-->
<div id='myDistributedEditor'></div>
```

```javascript
// #3 instanciate the editor into the targeted division
// styleOptions: change the style of the editor
// connectionOptions: WebRTC specific options
// session: the identifier of the session allowing to connect to the network.
//   If the session is not specified, it will create a brand new document with
//   its own editing session identifier
$('#myDistributedEditor').cratify(styleOptions, connectionOptions, session)
```

# Project

# Contribute

Developers are very welcome to contribute!
