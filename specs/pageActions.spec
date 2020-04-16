# Page Actions
## Scroll To, Up
tags:done
* Navigate to "http://localhost:3001/"
* Scroll to

   |Type|Selector    |
   |----|------------|
   |link|text=The Internet|

* Scroll to

   |Type|Selector|
   |----|--------|
   |text|text=Welcome to the-internet-express |

## Write, Press, Click
tags:done
* Navigate to relative path "./specs/data/HTMLElements.html"
* Write "John" into 

   |Type|Selector  |
   |----|----------|
   |text|[name="fname"]|
* Press "Tab"
* Write "Wick"
* Click text "Smith"

## Double Click
tags:done
* Assert text "Hello World" does not exist
* Navigate to file with relative Path "/specs/data/doubleClick.html"
* Double click

   |Type|Selector    |
   |----|------------|
   |text|//*[@ondblclick]|
* Assert text "Hello World" exists on the page.

## Right Click
tags:done
* Navigate to file with relative Path "/specs/data/rightClick.html"
* Right click

   |Type|Selector   |
   |----|-----------|
   |text|text=Someelement|
* Click text "Share On Facebook"

## Hover
tags:done
* Navigate to relative path "./specs/data/hovers.html"
* Hover on element

   |Type|Selector        |
   |----|----------------|
   |$   |.figure|
* Assert text "View profile" exists on the page.

## Drag and drop
tags:todo
* Navigate to "http://localhost:3001/drag_and_drop"
* Drag "#column-a" and drop to "#column-b"
* Drag "#column-b" and drop at

   |direction|pixel|
   |---------|-----|
   |right    |300  |

## Validate Current Url
tags:done
* Navigate to "http://localhost:3001/"
* Assert url host is "localhost"

## Tap
tags:todo
* Navigate to file with relative Path "/specs/data/touch.html"
* Tap on "Click"
* Assert tap on screen

## clear api should work on textArea
tags:done
* Navigate to relative path "./specs/data/HTMLElements.html"
* Write "hello" into 

   |Type   |Selector|
   |-------|--------|
   |textBox|//textarea|
* Press "Enter"
* Write "how"
* Press "Enter"
* Write "are you?"
* Press "Enter"
* clear 

   |Type   |Selector|
   |-------|--------|
   |textBox|//textarea|
* Assert text "" exists on the textArea.

   |Type   |Selector|
   |-------|--------|
   |textBox|//textarea|

## Navigate within Page
tags:done
* Navigate to relative path "./specs/data/samePageNavigation.html#gauge-navigation"
* Navigate to relative path "./specs/data/samePageNavigation.html#gauge-navigation"

