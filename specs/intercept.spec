#Intercept Api

## With simple response body
tag: done
* Respond to "http://localhost:3001/dropdown" with "mocked dropdown page"
* Navigate to "http://localhost:3001/"
* Click text "Dropdown"
* Assert text "mocked dropdown page" exists on the page.

## With array as a response body
tag: done
* Respond to "http://localhost:3001/dropdown" with json "[\"mocked\",\"dropdown\",\"page\"]"
* Navigate to "http://localhost:3001/"
* Click text "Dropdown"
* Assert text "[\"mocked\",\"dropdown\",\"page\"]" exists on the page.

## With object as a response body
tag: done
* Respond to "http://localhost:3001/dropdown" with json "{\"name\":\"Jon\",\"age\":\"20\"}"
* Navigate to "http://localhost:3001/"
* Click text "Dropdown"
* Assert text "{\"name\":\"Jon\",\"age\":\"20\"}" exists on the page.

## With regex in URL
tag: done
* Respond to "https://localhost/employees/(\\d+)/address" with json "{\"city\":\"City1\",\"State\":\"State1\"}"
* Navigate to "https://localhost/employees/1/address"
* Assert text "{\"city\":\"City1\",\"State\":\"State1\"}" exists on the page.

* Navigate to "https://localhost/employees/2/address"
* Assert text "{\"city\":\"City1\",\"State\":\"State1\"}" exists on the page.

## Override a response for a URL
tag: done
* Respond to "https://localhost/employees/1/address" with json "{\"city\":\"CityOne\",\"State\":\"StateOne\"}"
* Respond to "https://localhost/employees/(\\d+)/address" with json "{\"city\":\"City1\",\"State\":\"State1\"}"
* Navigate to "https://localhost/employees/1/address"
* Assert text "{\"city\":\"CityOne\",\"State\":\"StateOne\"}" exists on the page.
* Navigate to "https://localhost/employees/2/address"
* Assert text "{\"city\":\"City1\",\"State\":\"State1\"}" exists on the page.
* Reset intercept for "https://localhost/employees/1/address"
* Navigate to "https://localhost/employees/1/address"
* Assert text "{\"city\":\"City1\",\"State\":\"State1\"}" exists on the page.


## Reset a response for a URL
tag: done
* Respond to "http://localhost:3001/dropdown" with "actual dropdown page"
* Reset intercept for "http://localhost:3001/dropdown"
* Respond to "http://localhost:3001/dropdown" with "mocked dropdown page" 
* Navigate to "http://localhost:3001/"
* Click text "Dropdown"
* Assert text "mocked dropdown page" exists on the page.

## Reset all intercepts
tag: done
* Respond to "http://localhost:3001/dropdown" with "mocked dropdown page"
* Reset all intercept
* Navigate to "http://localhost:3001/"
* Click text "Dropdown"
* Assert text "mocked dropdown page" does not exist