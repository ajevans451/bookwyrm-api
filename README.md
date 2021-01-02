# Bookwyrm API
An API used to store the authentication and resource data for the Bookwyrm client.

### Important Links
- [Deployed Client](https://ajevans451.github.io/bookwyrm-client/#/)
- [Deployed API](https://bookwyrm.herokuapp.com/)
- [Other Repo](https://github.com/ajevans451/bookwyrm-client)

### Planning Story
I began by creating a model and schema for the primary resource, listing. I created cURL scripts for the created resource and worked on the authenticated routes for listing, and I created the groundwork for a secondary resource for future implementation. I tested the functionality of both the user and resource routes through cURL before moving to the front-end. After work shifted to the front-end, the majority of the changes to the back-end was to ensure communication with the new application and fixing route paths to work better with the front-end.

#### Technologies Used
- Javascript
- Express
- Mongodb

#### Unsolved Problems
- I would like to implement Sockets.io to update the listing and bid index in real time.

#### Entity Relationship Diagram
![Entity Relationship Diagram](https://media.git.generalassemb.ly/user/31380/files/c11e3380-4116-11eb-87f2-0b424034122a)
