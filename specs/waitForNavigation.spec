# Wait for navigation

## Should get the text of an element after page is loaded
tags: todo,testbroken
* Navigate to "http://localhost:3001/slow" with timeout "60000" ms
* Assert text "Slow Resources" exists on the page.

## Should get text after ajax calls
tags:done
* Navigate to "http://localhost:3001/dynamic_loading/2" with timeout "60000" ms
* Click text "Start"
* Assert text "Hello World!" exists on the page.
