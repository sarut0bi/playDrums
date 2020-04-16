# Browser Action


## Switch To
tags: done
* Navigate to "http://localhost:3001/"
* Click text "Multiple Windows"
* Assert page navigated to "/windows"
* Click text "Click Here"
* Assert page navigated to "/windows/new"
* Switch to tab with url "http://localhost:3001/windows"
* Assert page navigated to "/windows"
* Assert Exists

   |Type|Selector            |
   |----|--------------------|
   |text|text=Opening a new window|

## Open/Close Tab
tags: done
* Navigate to relative path "./specs/data/sample.html"
* Open Tab "http://localhost:3001/"
* Assert title to be "The Internet"
* Close Tab "http://localhost:3001/"
TODO: Add this step when Open/Close tab fix for headful
Assert title to be "Document"


## Close Tab with no parameters
tags: done
* Navigate to relative path "./specs/data/sample.html"
* Open Tab "http://localhost:3001/dropdown"
* Open Tab "http://localhost:3001/"
* Close Tab
* Close Tab
* Assert title to be "Document"

## Reload
tags: done
* Navigate to relative path "./specs/data/HTMLElements.html"
* Write "hello" into 

   |Type   |Selector|
   |-------|--------|
   |textBox|//textarea|
* Reload the page
* assert text should be empty into

   |Type   |Selector|
   |-------|--------|
   |textBox|//textarea|

## Reload should not clear local cache
tags: done
* Navigate to relative path "./specs/data/localStorage.html"
* Write "flow" into TextBox with name "username"
* Click "[type='submit']"
* Reload the page
* Assert text "flow" exists on the page.

## Get all cookies
tags: done
* Navigate to "http://localhost:3001/"
* set cookie with "org" and "gauge"
* Assert cookies to be present
* delete cookie with "org"

## Cookie should be present for valid options urls
tags: done
* Navigate to "http://localhost:3001/"
* set cookie with "org" and "gauge"
* Assert cookie with valid options url "http://localhost:3001/"
* delete cookie with "org"

## Cookie not should be present for invalid options urls
tags: done
* Navigate to relative path "./specs/data/sample.html"
* Assert cookie with invalid options url "http://localhost:3001/"

## Set mock location
tags: done
* Override browser permission with "geolocation" for site "http://localhost:3001/"
* Setlocation with longitude as "78.040009" and latitude as "27.1752868"
* Navigate to "http://localhost:3001/"
* Assert location longitude as "78.040009" and latitude as "27.1752868"

## Emulate device
tags: done
* Emulate device "iPhone 6"
* Navigate to "http://localhost:3001/"
* Assert width is "375" and height is "667"

## Browser forward and back
tags: done
* Navigate to "http://localhost:3001/"
* Click text "Checkboxes"
* Navigate back
* Assert page navigated back "localhost"
* Navigate forward
* Assert page navigated to "/checkboxes"

## Set Timezone
tags: wontdo
* Navigate to relative path "./specs/data/localStorage.html"
* Set timezone "America/Jamaica"
* Assert page has set timezome

## Click & Release To Element 
tags: wontdo
* Navigate to relative path "./specs/data/MouseMoveTest.html"
* Press & Release To Element with element1 and "0","100" co-ordinates
* Assert text "button2" exists on the page.
* Press & Release To Element with "200","150" co-ordinates
* Assert text "button3" exists on the page.
* Press & Release To Element with element1 and "100","100" co-ordinates
* Assert text "button4" exists on the page.
* Press & Release To Element with element2 and "-100","-100" co-ordinates
* Assert text "button1" exists on the page.