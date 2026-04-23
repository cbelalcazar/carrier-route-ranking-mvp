# Technical Exercise

Genlogs platform collects HD pictures from cameras located in the main highways in US, then process those pictures to track trucks all over the country

When a picture is taken, first it is analyzed if there are any characters that could belong to plates or truck numbers. Also is analyzed the picture to identify any company logos. Then are checked the platforms USDOT and Safer Fmcsa to link it to the truck that was identified in the picture. 

In addition Genlogs platform offer a portal where  users set  source and destination City and get the result of which carriers are moving most trucks between those 2 points

## Your assignment is:

1. Read all the test and before starting solving it, send to the interviewer via email:
    * The implementation plan
    * the amount of time you estimate would take you to implement the plan
    * delivery date/hour.
2. Describe how you would architect/design the Genlogs platform. What modules/components would you create? How would the information flow between components?
3. How would you design the database and its tables for the Genlogs platform?
4. Write a small application that simulates the portal. The information does not need to be stored in a database. The following are the application specifications:

### Front end Javascript client that catch the fields info and send it to back end server (ReactJs):
The application should capture the following fields on a single page:
* From (city) <- look match with google maps
* To (city)  <- look match with google maps
* Button “Search”
* Once the user clicks the search button, search a map that shows the fastest 3 routes between the 2 cities provider (embed Google maps)
* Render a list of carriers that are returned from the back end.

### Back end API (flask or fast api):
Enable the endpoints that receive the data that comes from the front end (from city, to city):
* **From New York to Washington DC:**
    * Knight-Swift Transport Services (10 Trucks/Day)
    * J.B. Hunt Transport Services Inc (7 Trucks/Day)
    * YRC Worldwide (5 Trucks A day)
* **From San francisco to Los Angeles:**
    * XPO Logistics (9 Trucks/Day)
    * Schneider (6 Trucks/Day)
    * Landstar Systems (2 Trucks A day)
* **From a city different to NYC/SF to a city different from Washington DC / Los Angeles:**
    * UPS Inc. (11 trucks Day)
    * FedEx Corp (9 trucks a day)

5. Share the url of the resulting code in a versioning server: Ie, Github, Gitlab, Bitbucket
6. Deploy project to a cloud provider (AWS, GCP, other), share the URL
7. Send to the interviewer the amount of time you spent doing the test, if different with the estimated time of point 1 explain the reason.

## Notes:
* Use as much AI as you prefer, the more the better. In the technical interview we would love to hear how you use it to make you more productive during the test 
* If you have any questions in regards to the test don’t hesitate in sending an email to the interviewer.

Happy coding!!
