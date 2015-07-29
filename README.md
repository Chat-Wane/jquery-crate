# jquery-crate

<i>Keywords: jQuery plugin, distributed, decentralized, collaborative editor </i>

The project aims to create a very easy-to-integrate distributed collaborative
editor directly inside your web pages.


# Usage

```html
<!-- #1 includes jquery and the crate plugin //--> 
<script src='path/to/jquery.min.js'></script>
<script src='path/to/jquery-crate.min.js'></script>
```

```html
<!-- #2 create the division that will host the distributed editor //-->
<div id='myDistributedEditor'></div>
```

```javascript
// #3 instanciate the editor into the targeted division
// styleOptions: (TODO) explicit
// session: the identifier of the session allowing to connect to the network.
//   If the session is not specified, it will create a brand new document.
$('#myDistributedEditor').cratify(styleOptions, session)
```

# Contribute

Developers are very welcome to contribute!
