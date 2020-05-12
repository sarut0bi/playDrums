# Page Actions in IFrame

## Write, Press, Click
tags:todo
* Navigate to "http://localhost:3001/iframe"
* Clear element "#tinymce"
* Write "Clear it"
* Press "Enter"
* Click text "File"
* Click text "New document"
* Assert text "Clear it" does not exist

## Write, Clear
tags:todo
* Navigate to "http://localhost:3001/iframe"
* Clear element "#tinymce"
* Write "Clear it"
* Assert text "Clear it" exists on the page.

## Double Click
tags:done
* Navigate to file with relative Path "/specs/data/doubleClickIFrame.html"
* Double click 

   |Type|Selector    |
   |----|------------|
   |text|//*[@ondblclick]|
* Assert text "Hello World" exists on the page.

## Right Click
tags:done
* Navigate to relative path "./specs/data/IFrameRightClick.html"
* Right click 

   |Type|Selector   |
   |----|-----------|
   |text|text=Someelement|
* Click text "Share On Facebook"

## Hover
tags:todofast
* Navigate to relative path "./specs/data/IFrameCompare.html"
* Hover on element

   |Type|Selector        |
   |----|----------------|
   |$   |.figure|
* Assert text "View profile" exists on the page.

## Drag and drop
tags:todo
* Navigate to relative path "./specs/data/IFrameDragAndDrop.html"
* Drag "#column-a" and drop to "#column-b"
* Drag "#column-b" and drop at

   |direction|pixel|
   |---------|-----|
   |right    |300  |
