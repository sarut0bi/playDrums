# Wait for navigation IFrame
## Should get the text of an element after page is loaded
tags: todo,testbroken
* Navigate to relative path "./specs/data/IFrameWaitForNavigation.html" with timeout "60000" ms
* Assert text "Slow Resources" exists on the page.

## Should get text after ajax calls
tags: todofast
* Navigate to relative path "./specs/data/IFrameWaitForAjax.html" with timeout "60000" ms
* Wait for "10000"
* Click "//button"
* Assert text "Hello World!" exists on the page.